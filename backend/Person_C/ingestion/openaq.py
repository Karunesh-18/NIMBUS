"""
OpenAQ v3 ingestion module.

Fetches station locations and latest PM2.5/PM10/NO2/SO2/CO/O3 readings
for a given city, upserts stations, inserts readings, and computes
aqi_category using Indian CPCB thresholds — all in one transaction.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

import requests
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert

from Person_C.models.station import Station
from Person_C.models.reading import Reading

logger = logging.getLogger("nimbus.ingestion.openaq")

from dotenv import load_dotenv

# Load env variables explicitly so API_KEY is found regardless of import order
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

OPENAQ_BASE = "https://api.openaq.org/v3"
API_KEY = os.getenv("OPENAQ_API_KEY", "")
CITY = os.getenv("DEMO_CITY", "Bangalore")
BBOX = os.getenv("DEMO_BBOX", "12.87,77.47,13.08,77.78")

# Indian CPCB AQI thresholds (based on PM2.5 24-hr avg equivalent breakpoints)
AQI_THRESHOLDS = [
    (50,  "Good"),
    (100, "Satisfactory"),
    (200, "Moderate"),
    (300, "Poor"),
    (400, "Very Poor"),
]

def compute_aqi_category(aqi_value: float) -> str:
    """Classify a numeric AQI value using Indian CPCB standard bands."""
    for limit, label in AQI_THRESHOLDS:
        if aqi_value <= limit:
            return label
    return "Severe"

def _headers() -> dict:
    h = {"Accept": "application/json"}
    if API_KEY:
        h["X-API-Key"] = API_KEY
    return h

def _get(path: str, params: dict) -> Optional[dict]:
    """Safe GET wrapper with 8-second timeout."""
    try:
        resp = requests.get(
            f"{OPENAQ_BASE}{path}",
            params=params,
            headers=_headers(),
            timeout=8
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning(f"OpenAQ request failed for {path}: {e}")
        return None

def fetch_openaq_readings(city: str = CITY, db: Optional[Session] = None) -> int:
    """
    Fetches stations and latest readings for `city` from OpenAQ v3.
    Upserts stations by external_id, inserts new readings rows.
    Returns number of reading rows inserted.
    """
    if db is None:
        logger.warning("No DB session provided — skipping OpenAQ ingestion.")
        return 0

    logger.info(f"Fetching OpenAQ locations for bbox='{BBOX}'...")
    # bbox in v3 requires minLon,minLat,maxLon,maxLat
    # DEMO_BBOX is lat1,lon1,lat2,lon2 so we flip it
    lat1, lon1, lat2, lon2 = BBOX.split(",")
    openaq_bbox = f"{lon1},{lat1},{lon2},{lat2}"
    locations_data = _get("/locations", {"bbox": openaq_bbox, "limit": 100, "page": 1})
    if not locations_data or "results" not in locations_data:
        logger.warning("OpenAQ locations fetch returned no results.")
        return 0

    locations = locations_data["results"]
    logger.info(f"Found {len(locations)} OpenAQ locations for {city}.")
    inserted = 0

    for loc in locations:
        loc_id = str(loc.get("id", ""))
        name   = loc.get("name", "Unknown")
        coords = loc.get("coordinates") or {}
        lat    = coords.get("latitude")
        lon    = coords.get("longitude")

        if lat is None or lon is None:
            continue

        # ── Upsert station ─────────────────────────────────────────────────
        try:
            existing = db.query(Station).filter_by(external_id=loc_id).first()
            if existing is None:
                station = Station(
                    external_id=loc_id,
                    name=name,
                    lat=lat,
                    lon=lon,
                    source="openaq",
                )
                db.add(station)
                db.flush()   # get station.id without committing yet
            else:
                station = existing
        except Exception as e:
            logger.error(f"Station upsert failed for {loc_id}: {e}")
            db.rollback()
            continue

        # ── Fetch latest measurements for this location ────────────────────
        sensors_data = _get(f"/locations/{loc_id}/sensors", {"limit": 50})
        if not sensors_data or "results" not in sensors_data:
            continue

        for sensor in sensors_data["results"]:
            param = (sensor.get("parameter") or {}).get("name", "").lower()
            if param not in ("pm25", "pm10", "no2", "so2", "co", "o3"):
                continue

            latest = sensor.get("latest") or {}
            value  = latest.get("value")
            ts_str = latest.get("datetime", {}).get("utc") if isinstance(latest.get("datetime"), dict) else None

            if value is None or ts_str is None:
                continue

            try:
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)

            aqi_cat = compute_aqi_category(float(value))

            try:
                reading = Reading(
                    station_id=station.id,
                    ts=ts,
                    pollutant=param,
                    value=float(value),
                    unit=sensor.get("unit", "µg/m³"),
                    aqi_category=aqi_cat,
                )
                db.add(reading)
                inserted += 1
            except Exception as e:
                logger.error(f"Reading insert failed: {e}")

    try:
        db.commit()
        logger.info(f"OpenAQ ingestion complete: {inserted} readings inserted.")
    except Exception as e:
        logger.error(f"Commit failed during OpenAQ ingestion: {e}")
        db.rollback()
        return 0

    return inserted
