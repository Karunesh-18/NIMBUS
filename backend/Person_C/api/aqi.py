from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from Person_C.database.session import get_db
from Person_C.ai import get_surface, forecast, attribute
from Person_C.cache.memory import cache
from Person_C.models.attribution import Attribution
import os
import json

router = APIRouter()

def round_ts_to_15min(ts_str: str) -> str:
    """
    Rounds an ISO8601 timestamp string to the nearest 15-minute mark.
    Ensures repeated requests within a window reuse the cache.
    """
    try:
        # Handle 'Z' suffix for UTC
        clean_ts = ts_str
        if clean_ts.endswith("Z"):
            clean_ts = clean_ts[:-1] + "+00:00"
        dt = datetime.fromisoformat(clean_ts)
        
        # Round to nearest 15-minute boundary
        discard = timedelta(
            minutes=dt.minute % 15,
            seconds=dt.second,
            microseconds=dt.microsecond
        )
        dt -= discard
        return dt.isoformat()
    except Exception:
        return ts_str

@router.get("/aqi/surface", tags=["AQI"])
async def get_aqi_surface(bbox: str, ts: str):
    """
    Returns live colored AQI heatmap grid points.
    Query params: bbox (lat1,lon1,lat2,lon2), ts (ISO8601)
    """
    # 1. Check cache first
    rounded_ts = round_ts_to_15min(ts)
    cache_key = f"surface_{bbox}_{rounded_ts}"
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return {"grid": cached_result}

    # 2. Parse bbox
    try:
        coords = [float(x) for x in bbox.split(",")]
        if len(coords) != 4:
            raise ValueError("BBox must contain 4 coordinates.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid bbox format: {e}. Expected 'lat1,lon1,lat2,lon2'")

    # 3. Call AI function
    grid_data = get_surface(tuple(coords), rounded_ts)
    
    # 4. Cache and return
    cache.set(cache_key, grid_data, ttl_seconds=300.0) # cache for 5 min
    return {"grid": grid_data}

@router.get("/forecast/{ward_id}", tags=["AQI"])
async def get_forecast(ward_id: int):
    """
    Returns AQI forecast points for a specific ward.
    """
    # Check cache
    cache_key = f"forecast_{ward_id}"
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return {"ward_id": ward_id, "points": cached_result}

    # Call AI function
    points = forecast(ward_id)
    
    # Cache and return
    cache.set(cache_key, points, ttl_seconds=60.0) # cache for 60s
    return {"ward_id": ward_id, "points": points}

@router.get("/attribution/{ward_id}", tags=["AQI"])
async def get_attribution(ward_id: int, ts: str, db: Session = Depends(get_db)):
    """
    Returns pollution attribution analysis for a ward at a specific timestamp.
    Performs direct function call and saves attribution to database if available.
    """
    # Check cache
    cache_key = f"attribution_{ward_id}_{ts}"
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    # Call AI function
    attr_res = attribute(ward_id, ts, db=db)
    
    # Save to database if available (non-blocking attempt)
    if db is not None and os.getenv("DEMO_MODE", "true").lower() != "true":
        try:
            # Check if already saved
            existing = db.query(Attribution).filter(
                Attribution.ward_id == ward_id,
                Attribution.ts == datetime.fromisoformat(ts.replace("Z", "+00:00"))
            ).first()
            
            if not existing:
                new_attr = Attribution(
                    ward_id=ward_id,
                    ts=datetime.fromisoformat(ts.replace("Z", "+00:00")),
                    cause=attr_res["cause"],
                    confidence=attr_res["confidence"],
                    evidence_json=attr_res["evidence"]
                )
                db.add(new_attr)
                db.commit()
        except Exception as e:
            # Don't fail the request if DB write fails
            print(f"Non-fatal error storing attribution in DB: {e}")
            db.rollback()

    cache.set(cache_key, attr_res, ttl_seconds=300.0)
    return attr_res
