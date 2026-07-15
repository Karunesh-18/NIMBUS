"""
Data access service layer for AI/ML functions.

All functions return plain Python dicts (not ORM objects) so they are
fully portable and testable without a live SQLAlchemy session.
Every function falls back to [] / {} gracefully when the DB is unreachable.

AI functions import these instead of writing raw SQL:
    from Person_C.services.data_access import get_readings, get_permits, ...
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

logger = logging.getLogger("nimbus.services")

# ─── Readings ─────────────────────────────────────────────────────────────────

def get_readings(ward_id: int, since: str, db: Optional[Session] = None) -> list[dict]:
    """
    Returns all pollutant readings for stations within `ward_id` since `since` (ISO8601).
    """
    if db is None:
        return []
    try:
        from Person_C.models.reading import Reading
        from Person_C.models.station import Station

        since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
        rows = (
            db.query(Reading)
            .join(Station, Reading.station_id == Station.id)
            .filter(Station.ward_id == ward_id, Reading.ts >= since_dt)
            .order_by(Reading.ts.desc())
            .limit(500)
            .all()
        )
        return [
            {
                "ts":           r.ts.isoformat() if r.ts else None,
                "pollutant":    r.pollutant,
                "value":        r.value,
                "unit":         r.unit,
                "aqi_category": r.aqi_category,
            }
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"get_readings({ward_id}, {since}) failed: {e}")
        return []

def get_latest_readings(ward_id: int, db: Optional[Session] = None) -> list[dict]:
    """
    Returns the single most-recent reading per pollutant for stations in `ward_id`.
    """
    if db is None:
        return []
    try:
        from Person_C.models.reading import Reading
        from Person_C.models.station import Station
        from sqlalchemy import func

        subq = (
            db.query(
                Reading.pollutant,
                func.max(Reading.ts).label("max_ts"),
            )
            .join(Station, Reading.station_id == Station.id)
            .filter(Station.ward_id == ward_id)
            .group_by(Reading.pollutant)
            .subquery()
        )
        rows = (
            db.query(Reading)
            .join(Station, Reading.station_id == Station.id)
            .join(subq, (Reading.pollutant == subq.c.pollutant) & (Reading.ts == subq.c.max_ts))
            .filter(Station.ward_id == ward_id)
            .all()
        )
        return [
            {
                "ts":           r.ts.isoformat() if r.ts else None,
                "pollutant":    r.pollutant,
                "value":        r.value,
                "unit":         r.unit,
                "aqi_category": r.aqi_category,
            }
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"get_latest_readings({ward_id}) failed: {e}")
        return []

# ─── Permits ──────────────────────────────────────────────────────────────────

def get_permits(ward_id: int, db: Optional[Session] = None) -> list[dict]:
    """Returns all active construction/demolition permits for `ward_id`."""
    if db is None:
        return []
    try:
        from Person_C.models.permit import Permit
        from sqlalchemy import func

        rows = (
            db.query(
                Permit.id,
                Permit.type,
                Permit.status,
                Permit.issued_date,
                func.ST_AsGeoJSON(Permit.geom).label("geom_json"),
            )
            .filter(Permit.ward_id == ward_id, Permit.status == "active")
            .all()
        )
        import json
        return [
            {
                "id":          r.id,
                "type":        r.type,
                "status":      r.status,
                "issued_date": str(r.issued_date) if r.issued_date else None,
                "geom":        json.loads(r.geom_json) if r.geom_json else None,
            }
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"get_permits({ward_id}) failed: {e}")
        return []

# ─── Industries ───────────────────────────────────────────────────────────────

def get_industries(ward_id: int, db: Optional[Session] = None) -> list[dict]:
    """Returns all industries located within `ward_id`."""
    if db is None:
        return []
    try:
        from Person_C.models.industry import Industry
        from sqlalchemy import func

        rows = (
            db.query(
                Industry.id,
                Industry.name,
                Industry.category,
                func.ST_AsGeoJSON(Industry.geom).label("geom_json"),
            )
            .filter(Industry.ward_id == ward_id)
            .all()
        )
        import json
        return [
            {
                "id":       r.id,
                "name":     r.name,
                "category": r.category,
                "geom":     json.loads(r.geom_json) if r.geom_json else None,
            }
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"get_industries({ward_id}) failed: {e}")
        return []

# ─── Weather ──────────────────────────────────────────────────────────────────

def get_weather(ward_id: int, db: Optional[Session] = None) -> list[dict]:
    """Returns the latest 48 weather rows (observed + forecast) for `ward_id`."""
    if db is None:
        return []
    try:
        from Person_C.models.weather import Weather

        rows = (
            db.query(Weather)
            .filter(Weather.ward_id == ward_id)
            .order_by(Weather.ts.desc())
            .limit(48)
            .all()
        )
        return [
            {
                "ts":          r.ts.isoformat() if r.ts else None,
                "wind_speed":  r.wind_speed,
                "wind_dir":    r.wind_dir,
                "temp":        r.temp,
                "humidity":    r.humidity,
                "is_forecast": r.is_forecast,
            }
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"get_weather({ward_id}) failed: {e}")
        return []

# ─── Wards ────────────────────────────────────────────────────────────────────

def get_ward_ids(db: Optional[Session] = None) -> list[int]:
    """Returns all ward IDs currently in the database."""
    if db is None:
        return []
    try:
        from Person_C.models.ward import Ward
        return [row[0] for row in db.query(Ward.id).all()]
    except Exception as e:
        logger.warning(f"get_ward_ids() failed: {e}")
        return []
