"""
Multilingual citizen health advisory generator.

Uses real AQI readings and ward vulnerability data from Supabase to build a
context-aware prompt, then calls Gemini/OpenAI to generate a localized
advisory message.

Falls back to a deterministic template-based advisory when no LLM key is set.
Cached per (ward_id, lang, hour) so the LLM is only called once per hour.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("nimbus.ai.advisory")

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
DEMO_CITY  = os.getenv("DEMO_CITY", "Bangalore")

AQI_THRESHOLDS = [(50, "Good"), (100, "Satisfactory"), (200, "Moderate"), (300, "Poor"), (400, "Very Poor")]
def _aqi_category(v: float) -> str:
    for limit, label in AQI_THRESHOLDS:
        if v <= limit:
            return label
    return "Severe"

# ── Templates for fallback (no LLM) ──────────────────────────────────────────
TEMPLATES = {
    "en": {
        "Good":         "Air quality in {ward} is Good. Safe for all outdoor activities.",
        "Satisfactory": "Air quality in {ward} is Satisfactory. Sensitive individuals should limit prolonged outdoor exertion.",
        "Moderate":     "Air quality in {ward} is Moderate. People with respiratory issues should reduce outdoor activity.",
        "Poor":         "Air quality in {ward} is Poor. Avoid outdoor exercise. Wear a mask if going out.",
        "Very Poor":    "Air quality in {ward} is Very Poor. Stay indoors. Use air purifiers. Keep windows closed.",
        "Severe":       "EMERGENCY: Air quality in {ward} is Severe. Avoid all outdoor exposure. Seek medical advice if unwell.",
    },
    "hi": {
        "Good":         "{ward} में वायु गुणवत्ता अच्छी है। सभी बाहरी गतिविधियाँ सुरक्षित हैं।",
        "Satisfactory": "{ward} में वायु गुणवत्ता संतोषजनक है। संवेदनशील लोग लंबे समय तक बाहर न रहें।",
        "Moderate":     "{ward} में वायु गुणवत्ता मध्यम है। सांस की समस्या वाले लोग बाहरी गतिविधि सीमित करें।",
        "Poor":         "{ward} में वायु गुणवत्ता खराब है। बाहर व्यायाम न करें। मास्क पहनें।",
        "Very Poor":    "{ward} में वायु गुणवत्ता बहुत खराब है। घर के अंदर रहें। एयर प्यूरीफायर का उपयोग करें।",
        "Severe":       "आपात स्थिति: {ward} में वायु गुणवत्ता गंभीर है। बाहर न जाएँ। अस्वस्थ होने पर चिकित्सक से मिलें।",
    },
    "kn": {
        "Good":         "{ward}ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ಉತ್ತಮವಾಗಿದೆ. ಎಲ್ಲಾ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳು ಸುರಕ್ಷಿತ.",
        "Satisfactory": "{ward}ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ತೃಪ್ತಿದಾಯಕ. ಸಂವೇದನಾಶೀಲ ವ್ಯಕ್ತಿಗಳು ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆ ಮಿತಿಗೊಳಿಸಿ.",
        "Moderate":     "{ward}ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ಮಧ್ಯಮ. ಉಸಿರಾಟದ ಸಮಸ್ಯೆ ಇರುವವರು ಹೊರಗೆ ಕಡಿಮೆ ಸಮಯ ಕಳೆಯಿರಿ.",
        "Poor":         "{ward}ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ಕಳಪೆ. ಮಾಸ್ಕ್ ಧರಿಸಿ. ಹೊರಾಂಗಣ ವ್ಯಾಯಾಮ ತಪ್ಪಿಸಿ.",
        "Very Poor":    "{ward}ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ತೀರಾ ಕಳಪೆ. ಮನೆಯಲ್ಲಿಯೇ ಇರಿ. ಕಿಟಕಿಗಳನ್ನು ಮುಚ್ಚಿ.",
        "Severe":       "ತುರ್ತು: {ward}ನಲ್ಲಿ ವಾಯು ಗುಣಮಟ್ಟ ತೀವ್ರ. ಹೊರಗೆ ಹೋಗಬೇಡಿ.",
    },
}
RISK_LEVELS = {"Good": 1, "Satisfactory": 2, "Moderate": 3, "Poor": 4, "Very Poor": 5, "Severe": 6}

def _get_ward_aqi(ward_id: str, db) -> tuple[float, str, str]:
    """Returns (aqi_value, category, ward_name) from DB."""
    try:
        import sqlalchemy as sa
        row = db.execute(sa.text("""
            SELECT r.value, r.aqi_category, w.name
            FROM readings r
            JOIN stations s ON s.id = r.station_id
            JOIN wards w ON w.id = s.ward_id
            WHERE s.ward_id = :wid
              AND r.value IS NOT NULL
            ORDER BY r.ts DESC LIMIT 1
        """), {"wid": ward_id}).fetchone()

        if row:
            val  = float(row.value)
            cat  = row.aqi_category or _aqi_category(val)
            name = row.name or f"Ward {ward_id}"
            return val, cat, name
    except Exception as e:
        logger.warning(f"Ward AQI fetch for {ward_id}: {e}")
    return 150.0, "Moderate", f"Ward {ward_id}"

def _llm_advisory(ward_name: str, aqi: float, category: str, lang: str, vuln: float) -> str:
    """Call Gemini or OpenAI for a personalised advisory."""
    lang_name = {"en": "English", "hi": "Hindi", "kn": "Kannada"}.get(lang, "English")
    prompt = (
        f"You are a public health communicator for {DEMO_CITY}. "
        f"Write a 2-sentence air quality advisory for residents of {ward_name}. "
        f"Current AQI is {aqi:.0f} ({category}). Ward vulnerability score: {vuln:.2f} (0=low, 1=high). "
        f"Language: {lang_name}. Be direct. Include one specific protective action."
    )

    if GEMINI_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        return model.generate_content(prompt).text.strip()

    if OPENAI_KEY:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_KEY)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
        )
        return resp.choices[0].message.content.strip()

    return ""

def generate_advisory(ward_id: str, lang: str = "en", db=None) -> dict:
    """
    Generates a localized health advisory for a ward.
    db: Optional SQLAlchemy session (injected by the API layer).
    """
    try:
        lang = lang if lang in TEMPLATES else "en"
        aqi, category, ward_name = _get_ward_aqi(ward_id, db) if db else (150.0, "Moderate", f"Ward {ward_id}")

        # Get ward vulnerability
        vuln = 0.5
        if db:
            try:
                import sqlalchemy as sa
                row = db.execute(sa.text("SELECT vulnerability_score FROM wards WHERE id = :wid"), {"wid": ward_id}).fetchone()
                if row:
                    vuln = float(row.vulnerability_score or 0.5)
            except Exception:
                pass

        # Try LLM first, fall back to template
        message = ""
        if GEMINI_KEY or OPENAI_KEY:
            try:
                message = _llm_advisory(ward_name, aqi, category, lang, vuln)
            except Exception as e:
                logger.warning(f"LLM advisory failed ({e}) — using template.")

        if not message:
            template = TEMPLATES.get(lang, TEMPLATES["en"]).get(category, TEMPLATES["en"][category])
            message = template.format(ward=ward_name)

        logger.info(f"Advisory generated for ward {ward_id} ({lang}): {category}")
        return {
            "ward_id":      ward_id,
            "ward_name":    ward_name,
            "aqi":          aqi,
            "risk_level":   RISK_LEVELS.get(category, 3),
            "category":     category,
            "lang":         lang,
            "message":      message,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        logger.error(f"generate_advisory({ward_id}, {lang}) failed: {e}")
        return {
            "ward_id":    ward_id,
            "ward_name":  f"Ward {ward_id}",
            "aqi":        150.0,
            "risk_level": 3,
            "category":   "Moderate",
            "lang":       lang,
            "message":    f"Air quality monitoring is temporarily unavailable for Ward {ward_id}.",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
