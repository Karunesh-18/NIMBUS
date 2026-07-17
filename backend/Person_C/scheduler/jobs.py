"""
APScheduler background job definitions.

All jobs follow the same contract:
  - Wrap every external call in try/except
  - Log failures but never raise — a bad poll must not crash the API process
  - Fall back to last cached / mock data implicitly (cache layer handles this)

Job schedule:
  poll_cpcb_openaq   → every 15 min
  poll_weather       → every 60 min
  poll_satellite     → daily  (stub — Sentinel-5P out of scope for MVP)
  refresh_demo_cache → every 5 min (pre-warms surface + wards cache)
"""
import os
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger("nimbus.scheduler")
logging.basicConfig(level=logging.INFO)

# ── Job status registry (updated by each job, exposed via /health) ───────────
job_status: dict = {
    "last_openaq_poll":   None,
    "last_ogd_poll":      None,
    "last_weather_poll":  None,
    "last_satellite_poll": None,
    "last_cache_refresh": None,
}

# ── Helpers ──────────────────────────────────────────────────────────────────
def _get_db_session():
    """Return a new DB session, or None if DB is unavailable."""
    try:
        from Person_C.database.session import SessionLocal
        if SessionLocal is None:
            return None
        return SessionLocal()
    except Exception as e:
        logger.warning(f"Could not create DB session for job: {e}")
        return None

# ── Jobs ─────────────────────────────────────────────────────────────────────
def poll_cpcb_openaq():
    """Ingest latest AQI readings from OpenAQ v3. Runs every 15 minutes."""
    logger.info("Job started: poll_cpcb_openaq")
    db = _get_db_session()
    try:
        from Person_C.ingestion.openaq import fetch_openaq_readings
        city = os.getenv("DEMO_CITY", "Bangalore")
        count = fetch_openaq_readings(city=city, db=db)
        job_status["last_openaq_poll"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Job done: poll_cpcb_openaq — {count} readings inserted.")
    except Exception as e:
        logger.error(f"Job failed: poll_cpcb_openaq — {e}")
    finally:
        if db:
            db.close()

def poll_ogd():
    """Ingest latest AQI readings from Indian OGD API. Runs every 15 minutes."""
    logger.info("Job started: poll_ogd")
    db = _get_db_session()
    try:
        from Person_C.ingestion.ogd import fetch_ogd_readings
        count = fetch_ogd_readings(db=db)
        job_status["last_ogd_poll"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Job done: poll_ogd — {count} readings inserted.")
    except Exception as e:
        logger.error(f"Job failed: poll_ogd — {e}")
    finally:
        if db:
            db.close()

def poll_weather():
    """Ingest current + forecast weather from OpenWeatherMap. Runs every 60 minutes."""
    logger.info("Job started: poll_weather")
    db = _get_db_session()
    try:
        from Person_C.ingestion.weather import fetch_openweather_data
        city = os.getenv("DEMO_CITY", "Bangalore")
        count = fetch_openweather_data(city=city, db=db)
        job_status["last_weather_poll"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Job done: poll_weather — {count} rows inserted.")
    except Exception as e:
        logger.error(f"Job failed: poll_weather — {e}")
    finally:
        if db:
            db.close()

def poll_satellite():
    """
    Copernicus Sentinel-5P aerosol index ingestion.
    Fetches the daily average Aerosol Index and stores it in the database.
    """
    logger.info("Job started: poll_satellite")
    db = _get_db_session()
    try:
        from Person_C.ingestion.satellite import fetch_satellite_readings
        count = fetch_satellite_readings(db=db)
        job_status["last_satellite_poll"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Job done: poll_satellite — {count} records inserted.")
    except Exception as e:
        logger.error(f"Job failed: poll_satellite — {e}")
    finally:
        if db:
            db.close()

def refresh_demo_cache():
    """
    Pre-warms the /aqi/surface and /wards cache for the demo bounding box.
    Runs every 5 minutes during demo window so judging-day latency is zero.
    """
    logger.info("Job started: refresh_demo_cache")
    try:
        from Person_C.cache.memory import cache
        from Person_C.ai import get_surface
        from Person_C.api.wards import MOCK_WARDS

        demo_bbox_str = os.getenv("DEMO_BBOX", "12.87,77.47,13.08,77.78")
        coords = tuple(float(x) for x in demo_bbox_str.split(","))
        ts_key = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M")

        # Pre-warm AQI surface
        grid = get_surface(coords, ts_key)
        cache.set(f"surface_{demo_bbox_str}_{ts_key}", grid, ttl_seconds=360.0)

        # Pre-warm wards
        cache.set("wards_list", MOCK_WARDS, ttl_seconds=600.0)

        job_status["last_cache_refresh"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Demo cache refreshed: {len(grid)} grid points, {len(MOCK_WARDS)} wards.")
    except Exception as e:
        logger.error(f"Job failed: refresh_demo_cache — {e}")

# ── Scheduler factory ─────────────────────────────────────────────────────────
def start_scheduler() -> BackgroundScheduler | None:
    """Initializes and starts the background job scheduler."""
    try:
        scheduler = BackgroundScheduler()

        scheduler.add_job(
            poll_cpcb_openaq, "interval", minutes=15,
            id="poll_cpcb_openaq_job", replace_existing=True
        )
        scheduler.add_job(
            poll_ogd, "interval", minutes=15,
            id="poll_ogd_job", replace_existing=True
        )
        scheduler.add_job(
            poll_weather, "interval", minutes=60,
            id="poll_weather_job", replace_existing=True
        )
        scheduler.add_job(
            poll_satellite, "interval", days=1,
            id="poll_satellite_job", replace_existing=True
        )
        scheduler.add_job(
            refresh_demo_cache, "interval", minutes=5,
            id="refresh_demo_cache_job", replace_existing=True
        )

        scheduler.start()
        logger.info("APScheduler started — 4 jobs registered.")

        # Kick off first poll immediately on startup (don't wait 15 min for first data)
        scheduler.add_job(poll_cpcb_openaq, "date", id="openaq_startup_run")
        scheduler.add_job(poll_ogd, "date", id="ogd_startup_run")
        scheduler.add_job(poll_weather,     "date", id="weather_startup_run")
        scheduler.add_job(poll_satellite,   "date", id="satellite_startup_run")
        scheduler.add_job(refresh_demo_cache, "date", id="cache_startup_run")

        return scheduler
    except Exception as e:
        logger.error(f"Failed to start APScheduler: {e}")
        return None
