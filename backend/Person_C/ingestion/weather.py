"""
OpenWeatherMap ingestion module.

Fetches current observed weather AND 5-day/3-hour forecast for the demo city,
inserting both into the `weather` table with is_forecast flagged accordingly.
Ward assignment is null for now (ward join will be done in Phase 2 when
ward geometries are loaded); ward_id will be updated via ST_Contains query then.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

import requests
from sqlalchemy.orm import Session

from Person_C.models.weather import Weather

logger = logging.getLogger("nimbus.ingestion.weather")

OWM_BASE = "https://api.openweathermap.org/data/2.5"
API_KEY  = os.getenv("OPENWEATHER_API_KEY", "")
CITY     = os.getenv("DEMO_CITY", "Bangalore")

def _get(path: str, params: dict) -> Optional[dict]:
    """Safe GET with 8-second timeout."""
    if not API_KEY:
        logger.warning("OPENWEATHER_API_KEY not set — skipping weather fetch.")
        return None
    try:
        resp = requests.get(
            f"{OWM_BASE}{path}",
            params={**params, "appid": API_KEY, "units": "metric"},
            timeout=8,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning(f"OpenWeatherMap request failed for {path}: {e}")
        return None

def _row_from_owm(data: dict, is_forecast: bool) -> dict:
    """Extract relevant fields from an OWM weather data block."""
    wind  = data.get("wind", {})
    main  = data.get("main", {})
    ts_dt = data.get("dt")
    ts    = datetime.fromtimestamp(ts_dt, tz=timezone.utc) if ts_dt else datetime.now(timezone.utc)
    return {
        "ts":         ts,
        "wind_speed": wind.get("speed"),
        "wind_dir":   wind.get("deg"),
        "temp":       main.get("temp"),
        "humidity":   main.get("humidity"),
        "is_forecast": is_forecast,
    }

def fetch_openweather_data(city: str = CITY, db: Optional[Session] = None) -> int:
    """
    Fetches current + forecast weather for `city` and upserts into `weather` table.
    Returns total number of rows inserted.
    """
    if db is None:
        logger.warning("No DB session — skipping weather ingestion.")
        return 0

    rows_to_insert = []

    # ── Current observed weather ────────────────────────────────────────────
    current = _get("/weather", {"q": city})
    if current:
        rows_to_insert.append(_row_from_owm(current, is_forecast=False))
        logger.info(f"Fetched current weather for {city}.")

    # ── 5-day / 3-hour forecast ─────────────────────────────────────────────
    forecast_data = _get("/forecast", {"q": city, "cnt": 40})  # ~5 days × 8 per day
    if forecast_data and "list" in forecast_data:
        for block in forecast_data["list"]:
            rows_to_insert.append(_row_from_owm(block, is_forecast=True))
        logger.info(f"Fetched {len(forecast_data['list'])} forecast blocks for {city}.")

    if not rows_to_insert:
        return 0

    # ── Persist to database ─────────────────────────────────────────────────
    inserted = 0
    try:
        for r in rows_to_insert:
            db.add(Weather(
                ward_id=None,          # assigned later via ST_Contains join
                ts=r["ts"],
                wind_speed=r["wind_speed"],
                wind_dir=r["wind_dir"],
                temp=r["temp"],
                humidity=r["humidity"],
                is_forecast=r["is_forecast"],
            ))
            inserted += 1
        db.commit()
        logger.info(f"Weather ingestion complete: {inserted} rows inserted.")
    except Exception as e:
        logger.error(f"Weather DB insert failed: {e}")
        db.rollback()
        return 0

    return inserted
