"""
\"Ask the City\" Q&A agent.

Architecture: manual tool-calling loop (no LangGraph dependency).
  1. Parse question to decide which tools to call.
  2. Call forecast(), attribute(), or get_ward_ids() as appropriate.
  3. Feed tool results into Gemini/OpenAI to compose a cited answer.

Falls back to a deterministic rule-based answer if no LLM API key is set.
Add GEMINI_API_KEY or OPENAI_API_KEY to .env to enable the LLM path.
"""
import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("nimbus.ai.agent")

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
DEMO_CITY  = os.getenv("DEMO_CITY", "Bangalore")

# ── Tool registry ─────────────────────────────────────────────────────────────
def _tool_get_ward_ids(db) -> list[str]:
    try:
        from Person_C.services.data_access import get_ward_ids
        return [str(w) for w in get_ward_ids(db)]
    except Exception:
        return ["1", "2", "3", "4"]

def _tool_forecast(ward_id: str, db) -> list[dict]:
    from Person_C.ai.forecast import forecast
    return forecast(ward_id, db=db)

def _tool_attribute(ward_id: str, ts: str, db) -> dict:
    from Person_C.ai.attribution import attribute
    return attribute(ward_id, ts, db=db)

# ── Question router ───────────────────────────────────────────────────────────
def _route_question(question: str) -> list[str]:
    """Keyword-based tool selection — used before (and in fallback instead of) LLM."""
    q = question.lower()
    tools = []
    if any(w in q for w in ["forecast", "tomorrow", "next", "will", "predict", "aqi tomorrow", "future"]):
        tools.append("forecast")
    if any(w in q for w in ["why", "cause", "reason", "source", "blame", "responsible", "attribution"]):
        tools.append("attribute")
    if any(w in q for w in ["worst", "best", "highest", "lowest", "most", "which ward", "all wards", "compare"]):
        tools.append("all_wards")
    if not tools:
        tools.append("forecast")   # default
    return tools

def _call_tools(question: str, db) -> dict:
    """Execute tools based on question routing. Returns context dict."""
    routes = _route_question(question)
    now = datetime.now(timezone.utc).isoformat()
    context = {"question": question, "ts": now, "tool_results": {}}

    ward_ids = _tool_get_ward_ids(db)
    context["ward_ids"] = ward_ids

    if "all_wards" in routes or "forecast" in routes:
        # Get forecast for first 4 wards (enough context)
        forecasts = {}
        for wid in ward_ids[:4]:
            fc = _tool_forecast(wid, db)
            if fc:
                forecasts[wid] = fc[0]  # next hour
        context["tool_results"]["forecasts"] = forecasts

    if "attribute" in routes:
        attrs = {}
        for wid in ward_ids[:4]:
            attrs[wid] = _tool_attribute(wid, now, db)
        context["tool_results"]["attributions"] = attrs

    return context

# ── LLM answer generation ─────────────────────────────────────────────────────
def _gemini_answer(context: dict) -> str:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""You are NIMBUS, an AI assistant for the city of {DEMO_CITY}'s air quality management system.
A city official has asked: \"{context['question']}\"

Here is real-time data from our sensors:
{json.dumps(context['tool_results'], indent=2, default=str)}

Answer clearly in 2-3 sentences. Be specific — cite ward IDs, AQI values, and causes.
End with one actionable recommendation.
"""
    response = model.generate_content(prompt)
    return response.text.strip()

def _openai_answer(context: dict) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"You are NIMBUS, {DEMO_CITY} air quality AI. Be concise and cite data."},
            {"role": "user", "content": f"Question: {context['question']}\n\nData: {json.dumps(context['tool_results'], default=str)}"}
        ],
        max_tokens=300,
    )
    return resp.choices[0].message.content.strip()

def _rule_based_answer(context: dict) -> str:
    """Deterministic answer without an LLM — uses tool results directly."""
    forecasts = context["tool_results"].get("forecasts", {})
    attributions = context["tool_results"].get("attributions", {})

    lines = []
    if forecasts:
        worst_ward = max(forecasts, key=lambda w: forecasts[w].get("aqi", 0))
        worst_aqi  = forecasts[worst_ward].get("aqi", "N/A")
        best_ward  = min(forecasts, key=lambda w: forecasts[w].get("aqi", 0))
        best_aqi   = forecasts[best_ward].get("aqi", "N/A")
        lines.append(f"Ward {worst_ward} currently has the highest AQI ({worst_aqi:.0f}) while Ward {best_ward} has the lowest ({best_aqi:.0f}).")

    if attributions:
        causes = {w: a.get("cause", "unknown") for w, a in attributions.items()}
        top_cause_ward = max(attributions, key=lambda w: attributions[w].get("confidence", 0))
        cause = attributions[top_cause_ward].get("cause", "unknown")
        conf  = attributions[top_cause_ward].get("confidence", 0)
        lines.append(f"The primary pollution source in Ward {top_cause_ward} is {cause} (confidence: {conf:.0%}).")

    lines.append("Recommendation: increase monitoring in the highest AQI ward and verify active permits.")
    return " ".join(lines)

def _extract_map_focus(context: dict) -> str | None:
    """Guess the most relevant ward from tool results."""
    forecasts = context["tool_results"].get("forecasts", {})
    if forecasts:
        return max(forecasts, key=lambda w: forecasts[w].get("aqi", 0))
    ward_ids = context.get("ward_ids", [])
    return ward_ids[0] if ward_ids else None

def _build_citations(context: dict) -> list[dict]:
    """Build citation list from tool results."""
    citations = []
    for wid, fc in context["tool_results"].get("forecasts", {}).items():
        citations.append({"source": f"AQI Sensor Network — Ward {wid}", "value": fc.get("aqi")})
    for wid, attr in context["tool_results"].get("attributions", {}).items():
        citations.append({"source": f"Attribution Model — Ward {wid}", "cause": attr.get("cause"), "confidence": attr.get("confidence")})
    return citations

# ── Main entry point ──────────────────────────────────────────────────────────
def ask(question: str, db=None) -> dict:
    """
    Answers a natural-language question about city air quality.
    db: Optional SQLAlchemy session (injected by the API layer).
    """
    try:
        context = _call_tools(question, db)

        if GEMINI_KEY:
            try:
                answer = _gemini_answer(context)
                logger.info("Agent answered via Gemini.")
            except Exception as e:
                logger.warning(f"Gemini failed ({e}) — falling back to rule-based answer.")
                answer = _rule_based_answer(context)
        elif OPENAI_KEY:
            try:
                answer = _openai_answer(context)
                logger.info("Agent answered via OpenAI.")
            except Exception as e:
                logger.warning(f"OpenAI failed ({e}) — falling back to rule-based answer.")
                answer = _rule_based_answer(context)
        else:
            answer = _rule_based_answer(context)
            logger.info("Agent answered via rule-based fallback (no LLM key set).")

        return {
            "question":   question,
            "answer":     answer,
            "citations":  _build_citations(context),
            "map_focus":  _extract_map_focus(context),
            "ts":         context["ts"],
        }

    except Exception as e:
        logger.error(f"ask() failed: {e}")
        return {
            "question":  question,
            "answer":    "Unable to process your question at this time. Please try again shortly.",
            "citations": [],
            "map_focus": None,
            "ts":        datetime.now(timezone.utc).isoformat(),
        }
