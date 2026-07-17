"""
Copernicus Sentinel-5P satellite data ingestion module.

Queries the CDSE Sentinel Hub Statistical API for the Aerosol Index (AER_AI_340_380)
over the demo city's bounding box and writes the daily average to the database for all wards.
"""
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import requests
from sqlalchemy.orm import Session
from Person_C.models.satellite import SatelliteReading
from Person_C.models.ward import Ward
from dotenv import load_dotenv

logger = logging.getLogger("nimbus.ingestion.satellite")

# Load env variables explicitly
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET", "")
BBOX = os.getenv("DEMO_BBOX", "12.87,77.47,13.08,77.78")

EVALSCRIPT = """//VERSION=3
function setup() {
  return {
    input: ["AER_AI_340_380", "dataMask"],
    output: [
      { id: "default", bands: ["AER_AI_340_380"], sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(samples) {
  return {
    default: [samples.AER_AI_340_380],
    dataMask: [samples.dataMask]
  };
}
"""

def _get_token() -> Optional[str]:
    """Retrieves an access token from Copernicus identity provider."""
    if not CLIENT_ID or not CLIENT_SECRET:
        logger.warning("Copernicus credentials not fully configured in env.")
        return None
    try:
        resp = requests.post(
            "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "client_credentials"
            },
            timeout=8
        )
        resp.raise_for_status()
        return resp.json().get("access_token")
    except Exception as e:
        logger.warning(f"Copernicus authentication failed: {e}")
        return None

def fetch_satellite_readings(db: Optional[Session] = None) -> int:
    """
    Fetches the latest Sentinel-5P Aerosol Index and writes it to the database for all wards.
    Falls back to mock data for demo safety if the API is offline or credentials are missing.
    Returns the number of rows inserted.
    """
    mean_ai = None
    source = "live"

    # Try to fetch real live data
    token = _get_token()
    if token and db is not None:
        try:
            # Parse bbox coordinates: lat1,lon1,lat2,lon2 -> [lon1, lat1, lon2, lat2]
            lat1_str, lon1_str, lat2_str, lon2_str = BBOX.split(",")
            bbox = [float(lon1_str), float(lat1_str), float(lon2_str), float(lat2_str)]

            # Configure daily timeRange (yesterday to today)
            now = datetime.now(timezone.utc)
            yesterday = now - timedelta(days=1)
            from_str = yesterday.replace(hour=0, minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z")
            to_str = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z")

            payload = {
                "input": {
                    "bounds": {
                        "bbox": bbox,
                        "properties": {
                            "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                        }
                    },
                    "data": [
                        {
                            "type": "sentinel-5p-l2"
                        }
                    ]
                },
                "aggregation": {
                    "timeRange": {
                        "from": from_str,
                        "to": to_str
                    },
                    "aggregationInterval": {
                        "of": "P1D"
                    },
                    "evalscript": EVALSCRIPT,
                    "resx": 0.05,
                    "resy": 0.05
                }
            }

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            logger.info("Requesting Sentinel-5P statistics from CDSE...")
            resp = requests.post(
                "https://sh.dataspace.copernicus.eu/statistics/v1",
                json=payload,
                headers=headers,
                timeout=12
            )
            resp.raise_for_status()
            res_json = resp.json()

            # Parse stats
            if "data" in res_json and len(res_json["data"]) > 0:
                interval_data = res_json["data"][0]
                aer_stats = (
                    interval_data.get("outputs", {})
                    .get("default", {})
                    .get("bands", {})
                    .get("AER_AI_340_380", {})
                    .get("stats", {})
                )
                mean_ai = aer_stats.get("mean")
                logger.info(f"Successfully retrieved Copernicus Sentinel-5P Aerosol Index: {mean_ai}")
        except Exception as e:
            logger.warning(f"Live Copernicus API fetch failed: {e}. Falling back to mock data.")

    # Fallback to mock data for demo safety if fetch failed or DB is offline
    if mean_ai is None:
        source = "mock"
        # Deterministic mock value based on the day of the year
        day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
        mean_ai = 0.2 + (day_of_year % 10) * 0.03
        logger.info(f"Using fallback Copernicus Sentinel-5P Aerosol Index: {mean_ai} ({source})")

    if db is None:
        logger.warning("No DB session provided — skipping database write.")
        return 0

    try:
        # Fetch all wards
        wards = db.query(Ward.id).all()
        if not wards:
            logger.warning("No wards found in database to assign satellite readings.")
            return 0

        ts_now = datetime.now(timezone.utc)
        inserted = 0

        for w in wards:
            reading = SatelliteReading(
                ward_id=w.id,
                ts=ts_now,
                aerosol_index=float(mean_ai)
            )
            db.add(reading)
            inserted += 1

        db.commit()
        logger.info(f"Ingested {inserted} satellite readings ({source}) into database.")
        return inserted
    except Exception as e:
        logger.error(f"Failed to store satellite readings in database: {e}")
        db.rollback()
        return 0

if __name__ == "__main__":
    from Person_C.database.session import SessionLocal
    logging.basicConfig(level=logging.INFO)
    db = SessionLocal()
    try:
        count = fetch_satellite_readings(db)
        print(f"Done! Seeded {count} satellite readings.")
    finally:
        db.close()

