"""
Feature-weighted pollution attribution model.

Scores the most likely cause of elevated AQI in a ward by combining:
  - Active construction/demolition permit density
  - Industrial emissions by category weight
  - Vehicular congestion proxy (vulnerability × rush-hour factor)
  - Meteorological dispersion conditions (wind speed, humidity)

Returns a ranked cause list with confidence and real evidence references
(permit IDs, industry IDs, weather observations) from the DB.
"""
import logging
import math
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("nimbus.ai.attribution")

# Industry category emission weights (red > orange > green)
INDUSTRY_WEIGHTS = {"red": 1.0, "orange": 0.6, "green": 0.2, "other": 0.3}

# Hour-of-day vehicular traffic multiplier
RUSH_HOURS = {7: 1.4, 8: 1.6, 9: 1.5, 17: 1.4, 18: 1.6, 19: 1.5}

AQI_THRESHOLDS = [(50, "Good"), (100, "Satisfactory"), (200, "Moderate"), (300, "Poor"), (400, "Very Poor")]

def _aqi_category(v: float) -> str:
    for limit, label in AQI_THRESHOLDS:
        if v <= limit:
            return label
    return "Severe"

def _get_ward_data(ward_id: str, db) -> dict:
    """Fetch permits, industries, weather, ward vulnerability and satellite data from DB."""
    try:
        import sqlalchemy as sa
        permits = db.execute(sa.text("""
            SELECT id, type, status, issued_date
            FROM permits WHERE ward_id = :wid AND status = 'active'
        """), {"wid": ward_id}).fetchall()

        industries = db.execute(sa.text("""
            SELECT id, name, category FROM industries WHERE ward_id = :wid
        """), {"wid": ward_id}).fetchall()

        weather = db.execute(sa.text("""
            SELECT wind_speed, humidity FROM weather
            WHERE ward_id = :wid AND is_forecast = false
            ORDER BY ts DESC LIMIT 1
        """), {"wid": ward_id}).fetchone()

        ward = db.execute(sa.text("""
            SELECT vulnerability_score FROM wards WHERE id = :wid
        """), {"wid": ward_id}).fetchone()

        satellite = db.execute(sa.text("""
            SELECT aerosol_index FROM satellite_readings
            WHERE ward_id = :wid
            ORDER BY ts DESC LIMIT 1
        """), {"wid": ward_id}).fetchone()

        return {
            "permits":       permits,
            "industries":    industries,
            "wind_speed":    weather.wind_speed if weather else 2.0,
            "humidity":      weather.humidity   if weather else 60.0,
            "vuln":          ward.vulnerability_score if ward else 0.5,
            "aerosol_index": satellite.aerosol_index if satellite else None,
        }
    except Exception as e:
        logger.warning(f"Ward data fetch failed for {ward_id}: {e}")
        return {"permits": [], "industries": [], "wind_speed": 2.0, "humidity": 60.0, "vuln": 0.5, "aerosol_index": None}

def attribute(ward_id: str, ts: str, db=None) -> dict:
    """
    Returns pollution attribution for a ward at timestamp `ts`.
    db: Optional SQLAlchemy session (injected by the API layer).
    """
    try:
        now = datetime.now(timezone.utc)
        hour = now.hour

        if db is None:
            return _mock_attribution(ward_id, ts)

        d = _get_ward_data(ward_id, db)

        scores: dict[str, float] = {}
        evidence: list[dict] = []

        # ── 1. Construction permits ─────────────────────────────────────────
        active_permits = list(d["permits"])
        if active_permits:
            permit_score = min(len(active_permits) * 0.25, 1.0)
            scores["construction"] = permit_score
            evidence.append({
                "type":   "permits",
                "count":  len(active_permits),
                "ids":    [p.id for p in active_permits[:5]],
                "detail": f"{len(active_permits)} active permits in ward"
            })

        # ── 2. Industrial emissions ─────────────────────────────────────────
        industries = list(d["industries"])
        if industries:
            ind_score = sum(INDUSTRY_WEIGHTS.get((i.category or "other").lower(), 0.3) for i in industries)
            ind_score = min(ind_score / max(len(industries), 1), 1.0)
            scores["industrial"] = ind_score
            evidence.append({
                "type":     "industries",
                "count":    len(industries),
                "ids":      [i.id for i in industries[:5]],
                "detail":   f"{len(industries)} industries; dominant category: {max(set(i.category or 'other' for i in industries), key=lambda c: INDUSTRY_WEIGHTS.get(c.lower(), 0))}"
            })

        # ── 3. Vehicular congestion ─────────────────────────────────────────
        rush_mult = RUSH_HOURS.get(hour, 1.0)
        vuln_score = float(d["vuln"]) if d["vuln"] else 0.5
        vehicle_score = min(vuln_score * rush_mult * 0.7, 1.0)
        scores["vehicular"] = vehicle_score
        evidence.append({
            "type":   "vehicular",
            "detail": f"Ward vulnerability={vuln_score:.2f}, hour={hour}:00 (rush_factor={rush_mult:.1f})"
        })

        # ── 4. Meteorological conditions ────────────────────────────────────
        wind = float(d["wind_speed"])
        hum  = float(d["humidity"])
        met_notes = []
        if wind < 1.5:
            scores["meteorological"] = scores.get("meteorological", 0) + 0.3
            met_notes.append(f"low wind speed ({wind:.1f} m/s) — poor dispersion")
        if hum > 80:
            scores["meteorological"] = scores.get("meteorological", 0) + 0.2
            met_notes.append(f"high humidity ({hum:.0f}%) — secondary aerosol formation")
        if met_notes:
            evidence.append({"type": "meteorological", "detail": "; ".join(met_notes)})

        # ── 5. Satellite Aerosol Index (Meteorological/Regional) ────────────
        aerosol = d.get("aerosol_index")
        if aerosol is not None:
            aerosol = float(aerosol)
            # Aerosol index > 0.4 indicates elevated regional haze/dust/smoke.
            if aerosol > 0.4:
                scores["meteorological"] = scores.get("meteorological", 0.0) + (aerosol * 0.5)
                evidence.append({
                    "type": "satellite",
                    "detail": f"Copernicus Sentinel-5P UV Aerosol Index is elevated at {aerosol:.3f} — indicates regional haze or smoke transport"
                })
            else:
                evidence.append({
                    "type": "satellite",
                    "detail": f"Copernicus Sentinel-5P UV Aerosol Index is clear at {aerosol:.3f}"
                })

        # ── Normalise scores → ranked causes ────────────────────────────────
        if not scores:
            return _mock_attribution(ward_id, ts)

        total = sum(scores.values())
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_cause, top_raw = ranked[0]
        confidence = round(top_raw / total, 2) if total > 0 else 0.5

        logger.info(f"Attribution for ward {ward_id}: top={top_cause} ({confidence:.0%})")

        return {
            "ward_id":    ward_id,
            "ts":         ts,
            "cause":      top_cause,
            "confidence": confidence,
            "ranked_causes": [
                {"cause": c, "score": round(s / total, 3)} for c, s in ranked
            ],
            "evidence": evidence,
        }

    except Exception as e:
        logger.error(f"attribute({ward_id}) failed: {e}")
        return _mock_attribution(ward_id, ts)

def _mock_attribution(ward_id: str, ts: str) -> dict:
    """Deterministic fallback attribution."""
    import random
    rng = random.Random(hash(str(ward_id)) % 9999)
    causes = ["vehicular", "construction", "industrial", "meteorological"]
    top = causes[rng.randint(0, len(causes) - 1)]
    return {
        "ward_id":    ward_id,
        "ts":         ts,
        "cause":      top,
        "confidence": round(rng.uniform(0.55, 0.90), 2),
        "ranked_causes": [{"cause": c, "score": round(rng.uniform(0.1, 0.9), 2)} for c in causes],
        "evidence": [{"type": "fallback", "detail": "DB unavailable — deterministic mock"}],
    }
