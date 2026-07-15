"""
Real AQI surface interpolation using Inverse Distance Weighting (IDW).

Reads the latest PM2.5/PM10/NO2 readings for all stations within the
bounding box from Supabase, then interpolates onto a grid using IDW.

Falls back to the deterministic mock grid if fewer than 2 stations are found.
"""
import os
import math
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

logger = logging.getLogger("nimbus.ai.surface")

# Pollutant weights for combined AQI (CPCB-aligned)
POLLUTANT_WEIGHTS = {"pm25": 0.55, "pm10": 0.30, "no2": 0.10, "so2": 0.05}

AQI_THRESHOLDS = [(50, "Good"), (100, "Satisfactory"), (200, "Moderate"), (300, "Poor"), (400, "Very Poor")]

def _aqi_category(value: float) -> str:
    for limit, label in AQI_THRESHOLDS:
        if value <= limit:
            return label
    return "Severe"

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Fast haversine distance in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))

def _idw(stations: list[dict], lat: float, lon: float, power: float = 2.0) -> float:
    """IDW interpolation. Returns weighted average AQI at (lat, lon)."""
    total_w, total_v = 0.0, 0.0
    for s in stations:
        d = _haversine_km(lat, lon, s["lat"], s["lon"])
        if d < 0.001:  # essentially same point — return its value directly
            return s["aqi"]
        w = 1.0 / (d ** power)
        total_w += w
        total_v += w * s["aqi"]
    return total_v / total_w if total_w > 0 else 150.0

def _get_station_aqi(db) -> list[dict]:
    """Fetch latest combined AQI per station from DB."""
    try:
        import sqlalchemy as sa
        # Get the latest reading per station per pollutant in the last 4 hours
        since = (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat()
        rows = db.execute(sa.text("""
            SELECT s.lat, s.lon, r.pollutant, r.value
            FROM readings r
            JOIN stations s ON s.id = r.station_id
            WHERE r.ts >= :since
              AND r.pollutant IN ('pm25', 'pm10', 'no2', 'so2')
              AND r.value IS NOT NULL
              AND s.lat IS NOT NULL AND s.lon IS NOT NULL
            ORDER BY s.id, r.pollutant, r.ts DESC
        """), {"since": since}).fetchall()

        # Aggregate per station: weighted sum of pollutants
        station_data: dict[tuple, dict] = {}
        for row in rows:
            key = (row.lat, row.lon)
            if key not in station_data:
                station_data[key] = {}
            if row.pollutant not in station_data[key]:  # keep latest only
                station_data[key][row.pollutant] = row.value

        result = []
        for (lat, lon), pollutants in station_data.items():
            aqi = sum(
                POLLUTANT_WEIGHTS.get(p, 0) * v
                for p, v in pollutants.items()
            ) / max(sum(POLLUTANT_WEIGHTS.get(p, 0) for p in pollutants), 0.01)
            result.append({
                "lat": lat, "lon": lon, "aqi": aqi,
                "pollutant_breakdown": pollutants
            })
        return result
    except Exception as e:
        logger.warning(f"Station AQI fetch failed: {e}")
        return []

def _mock_grid(bbox: tuple, ts: str) -> list[dict]:
    """Deterministic fallback grid (same as original mock)."""
    import random
    lat1, lon1, lat2, lon2 = bbox
    seed_val = int(abs(lat1 + lon1 + lat2 + lon2) * 1000) + len(ts)
    rng = random.Random(seed_val)
    grid = []
    for i in range(5):
        for j in range(5):
            lat = lat1 + (lat2 - lat1) * (i / 4.0)
            lon = lon1 + (lon2 - lon1) * (j / 4.0)
            aqi = rng.randint(45, 280)
            grid.append({
                "lat": round(lat, 5), "lon": round(lon, 5),
                "aqi": aqi, "category": _aqi_category(aqi),
                "pollutant_breakdown": {
                    "pm25": round(aqi * 0.6, 1), "pm10": round(aqi * 0.9, 1),
                    "no2": round(rng.uniform(10, 45), 1), "so2": round(rng.uniform(2, 12), 1),
                    "co": round(rng.uniform(0.2, 1.8), 2)
                }
            })
    return grid

def get_surface(bbox: tuple, ts: str, db=None) -> list[dict]:
    """
    Returns an AQI heatmap grid for the given bounding box.

    bbox: (lat1, lon1, lat2, lon2)
    ts:   ISO8601 timestamp string (used for cache key + fallback seed)
    db:   Optional SQLAlchemy session (injected by API layer)
    """
    try:
        lat1, lon1, lat2, lon2 = bbox

        # Try to get real station data from DB
        stations = []
        if db is not None:
            stations = _get_station_aqi(db)
            # Filter to stations within a 50km radius of the bbox center
            clat = (lat1 + lat2) / 2
            clon = (lon1 + lon2) / 2
            stations = [s for s in stations if _haversine_km(clat, clon, s["lat"], s["lon"]) < 50]

        if len(stations) < 2:
            logger.info(f"Only {len(stations)} stations near bbox — using mock fallback.")
            return _mock_grid(bbox, ts)

        logger.info(f"IDW interpolation: {len(stations)} stations for bbox {bbox}")

        # Build 8×8 grid for better resolution
        grid = []
        steps = 8
        for i in range(steps):
            for j in range(steps):
                lat = lat1 + (lat2 - lat1) * (i / (steps - 1))
                lon = lon1 + (lon2 - lon1) * (j / (steps - 1))
                aqi = round(_idw(stations, lat, lon), 1)

                # Build breakdown from nearest station's data
                nearest = min(stations, key=lambda s: _haversine_km(lat, lon, s["lat"], s["lon"]))
                breakdown = nearest.get("pollutant_breakdown", {})

                grid.append({
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                    "aqi": aqi,
                    "category": _aqi_category(aqi),
                    "pollutant_breakdown": {
                        "pm25":  round(breakdown.get("pm25", aqi * 0.6), 1),
                        "pm10":  round(breakdown.get("pm10", aqi * 0.9), 1),
                        "no2":   round(breakdown.get("no2", 20.0), 1),
                        "so2":   round(breakdown.get("so2", 5.0), 1),
                    }
                })
        return grid

    except Exception as e:
        logger.error(f"get_surface failed: {e}")
        return _mock_grid(bbox, ts)
