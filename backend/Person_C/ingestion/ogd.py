"""
Open Government Data (OGD) AQI API ingestion module.

Fetches station locations and latest PM2.5/PM10/NO2/SO2/CO/OZONE readings
from data.gov.in for the state of Karnataka. Upserts stations and inserts readings,
then computes aqi_category using Indian CPCB thresholds.
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

import requests
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from Person_C.models.station import Station
from Person_C.models.reading import Reading

logger = logging.getLogger("nimbus.ingestion.ogd")

from dotenv import load_dotenv

# Load env variables explicitly so API_KEY is found regardless of import order
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

OGD_BASE = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
API_KEY = os.getenv("OGD_API_KEY", "")
STATE = "Karnataka"  # Hardcoded filter for performance, spatial queries handle the rest

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

def fetch_ogd_readings(db: Optional[Session] = None) -> int:
    """
    Fetches stations and latest readings for `STATE` from OGD API.
    Upserts stations by external_id (station name), inserts new readings rows.
    Returns number of reading rows inserted.
    """
    if db is None:
        logger.warning("No DB session provided — skipping OGD ingestion.")
        return 0

    if not API_KEY:
        logger.warning("No OGD_API_KEY provided — skipping OGD ingestion.")
        return 0

    logger.info(f"Fetching OGD locations for state='{STATE}'...")
    
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 1000,
        "filters[state]": STATE
    }

    try:
        resp = requests.get(OGD_BASE, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.warning(f"OGD API request failed: {e}")
        return 0

    records = data.get("records", [])
    if not records:
        logger.warning("OGD API fetch returned no records.")
        return 0

    logger.info(f"Found {len(records)} OGD records for {STATE}.")
    inserted = 0

    for rec in records:
        station_name = rec.get("station")
        if not station_name:
            continue
            
        # OGD doesn't provide integer IDs, so the station name is the external ID
        loc_id = str(station_name).strip()
        
        try:
            lat = float(rec.get("latitude"))
            lon = float(rec.get("longitude"))
        except (TypeError, ValueError):
            continue

        # ── Upsert station ─────────────────────────────────────────────────
        try:
            existing = db.query(Station).filter_by(external_id=loc_id).first()
            if existing is None:
                station = Station(
                    external_id=loc_id,
                    name=loc_id,
                    lat=lat,
                    lon=lon,
                    source="ogd",
                )
                db.add(station)
                db.flush()   # get station.id without committing yet
            else:
                station = existing
        except IntegrityError:
            db.rollback()
            # It could be that it was inserted concurrently, query again
            station = db.query(Station).filter_by(external_id=loc_id).first()
            if not station:
                continue
        except Exception as e:
            logger.error(f"OGD Station upsert failed for {loc_id}: {e}")
            db.rollback()
            continue

        # ── Insert measurement ──────────────────────────────────────────────
        pollutant_id = str(rec.get("pollutant_id", "")).lower()
        if pollutant_id not in ("pm2.5", "pm10", "no2", "so2", "co", "ozone"):
            continue
        
        # normalize to match openaq's parameter names
        if pollutant_id == "pm2.5":
            pollutant_id = "pm25"
        elif pollutant_id == "ozone":
            pollutant_id = "o3"

        value_str = rec.get("pollutant_avg")
        if value_str in (None, "NA", ""):
            continue
            
        try:
            value = float(value_str)
        except ValueError:
            continue

        ts_str = rec.get("last_update")
        if ts_str:
            try:
                # OGD format: "15-07-2026 12:00:00" -> %d-%m-%Y %H:%M:%S
                ts = datetime.strptime(ts_str, "%d-%m-%Y %H:%M:%S").replace(tzinfo=timezone.utc)
            except Exception:
                ts = datetime.now(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        aqi_cat = compute_aqi_category(value)

        try:
            reading = Reading(
                station_id=station.id,
                ts=ts,
                pollutant=pollutant_id,
                value=value,
                unit="µg/m³",  # OGD assumes standard Indian units
                aqi_category=aqi_cat,
            )
            db.add(reading)
            inserted += 1
        except Exception as e:
            logger.error(f"OGD Reading insert failed: {e}")

    try:
        db.commit()
        logger.info(f"OGD ingestion complete: {inserted} readings inserted.")
    except Exception as e:
        logger.error(f"Commit failed during OGD ingestion: {e}")
        db.rollback()
        return 0

    return inserted
