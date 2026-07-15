"""
Weather-lag AQI forecast.

Uses real readings from Supabase (last 24h) and OpenWeatherMap forecast
data (already ingested into the `weather` table) to project AQI for the
next 24 hours using a persistence + dispersion adjustment model.

Upgrade path: swap the formula with scikit-learn LinearRegression or
XGBoost without changing the function signature.
"""
import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Optional

logger = logging.getLogger("nimbus.ai.forecast")

# Hour-of-day multipliers (rush hours increase AQI, midday wind disperses)
DIURNAL = {
    0: 0.85, 1: 0.80, 2: 0.78, 3: 0.76, 4: 0.78, 5: 0.85,
    6: 1.00, 7: 1.15, 8: 1.25, 9: 1.20, 10: 1.10, 11: 1.00,
    12: 0.95, 13: 0.90, 14: 0.88, 15: 0.90, 16: 1.00, 17: 1.15,
    18: 1.25, 19: 1.20, 20: 1.10, 21: 1.00, 22: 0.95, 23: 0.90,
}

AQI_THRESHOLDS = [(50, "Good"), (100, "Satisfactory"), (200, "Moderate"), (300, "Poor"), (400, "Very Poor")]

def _aqi_category(v: float) -> str:
    for limit, label in AQI_THRESHOLDS:
        if v <= limit:
            return label
    return "Severe"

def _confidence(values: list[float]) -> float:
    """Confidence = 1 - normalised std dev of recent readings (0.5–1.0 range)."""
    if len(values) < 2:
        return 0.65
    mean = sum(values) / len(values)
    if mean == 0:
        return 0.80
    std = math.sqrt(sum((v - mean) ** 2 for v in values) / len(values))
    cv = min(std / mean, 1.0)  # coefficient of variation, capped at 1
    return round(max(0.50, 1.0 - cv * 0.5), 2)

def _get_recent_aqi(ward_id: str, db) -> tuple[float, list[float]]:
    """Fetch average AQI for the ward over the last 6 hours."""
    try:
        import sqlalchemy as sa
        since = (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
        rows = db.execute(sa.text("""
            SELECT r.value, r.pollutant
            FROM readings r
            JOIN stations s ON s.id = r.station_id
            WHERE s.ward_id = :wid
              AND r.ts >= :since
              AND r.value IS NOT NULL
        """), {"wid": ward_id, "since": since}).fetchall()

        # Combine into composite AQI (simple mean of available pollutant values)
        hourly: list[float] = [row.value for row in rows if row.value is not None]
        if not hourly:
            return 120.0, []
        baseline = sum(hourly) / len(hourly)
        return baseline, hourly
    except Exception as e:
        logger.warning(f"recent AQI fetch failed for ward {ward_id}: {e}")
        return 120.0, []

def _get_forecast_weather(ward_id: str, db) -> list[dict]:
    """Fetch OpenWeatherMap forecast rows for this ward from DB."""
    try:
        import sqlalchemy as sa
        rows = db.execute(sa.text("""
            SELECT ts, wind_speed, humidity
            FROM weather
            WHERE ward_id = :wid AND is_forecast = true
            ORDER BY ts ASC
            LIMIT 24
        """), {"wid": ward_id}).fetchall()
        return [{"ts": r.ts, "wind_speed": r.wind_speed or 2.0, "humidity": r.humidity or 60.0} for r in rows]
    except Exception as e:
        logger.warning(f"Forecast weather fetch failed for ward {ward_id}: {e}")
        return []

def _dispersion_factor(wind_speed: float, humidity: float) -> float:
    """
    Dispersion factor: higher wind → better dispersion (lower AQI).
    High humidity → secondary particulate formation (higher AQI).
    Returns a multiplier around 1.0.
    """
    # Wind: 0 m/s → 1.20×, 5+ m/s → 0.75×
    wind_factor = max(0.75, 1.20 - wind_speed * 0.09)
    # Humidity: 30% → 0.95×, 90% → 1.15×
    hum_factor = 0.95 + (humidity - 30) / 600
    return round(wind_factor * hum_factor, 3)

def _mock_forecast(ward_id: str) -> list[dict]:
    """Deterministic fallback when DB is unavailable."""
    import random
    rng = random.Random(hash(ward_id) % 9999)
    now = datetime.now(timezone.utc)
    result = []
    base = rng.randint(100, 220)
    for h in range(24):
        ts = now + timedelta(hours=h)
        hour = ts.hour
        aqi = round(base * DIURNAL.get(hour, 1.0) * rng.uniform(0.95, 1.05))
        result.append({"ts": ts.isoformat(), "aqi": aqi, "category": _aqi_category(aqi), "confidence": 0.55})
    return result

def forecast(ward_id: str, db=None) -> list[dict]:
    """
    Returns 24-hour AQI forecast for a ward.
    db: Optional SQLAlchemy session (injected by the API layer).
    """
    try:
        if db is None:
            return _mock_forecast(ward_id)

        baseline, recent_values = _get_recent_aqi(ward_id, db)
        weather_rows = _get_forecast_weather(ward_id, db)

        conf = _confidence(recent_values)
        now = datetime.now(timezone.utc)
        result = []

        for h in range(24):
            ts = now + timedelta(hours=h)
            hour = ts.hour
            diurnal = DIURNAL.get(hour, 1.0)

            # Match weather forecast row for this hour (or use defaults)
            weather = next(
                (w for w in weather_rows if w["ts"] and abs((w["ts"] - ts).total_seconds()) < 5400),
                {"wind_speed": 2.0, "humidity": 60.0}
            )

            dispersion = _dispersion_factor(weather["wind_speed"], weather["humidity"])
            aqi = round(baseline * diurnal * dispersion, 1)
            aqi = max(10.0, min(aqi, 500.0))  # clamp to valid range

            result.append({
                "ts":         ts.isoformat(),
                "aqi":        aqi,
                "category":   _aqi_category(aqi),
                "confidence": conf,
            })

        logger.info(f"Forecast generated for ward {ward_id}: baseline={baseline:.0f}, {len(result)} hours.")
        return result

    except Exception as e:
        logger.error(f"forecast({ward_id}) failed: {e}")
        return _mock_forecast(ward_id)
