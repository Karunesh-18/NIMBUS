import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from Person_C.database.session import get_db
from Person_C.models.ward import Ward

router = APIRouter()

# High-quality mock Bangalore wards for frontend development mapping
MOCK_WARDS = [
    {
        "id": 12,
        "name": "Koramangala",
        "geom_geojson": {
            "type": "Polygon",
            "coordinates": [[[12.920, 77.610], [12.940, 77.610], [12.940, 77.630], [12.920, 77.630], [12.920, 77.610]]]
        },
        "population": 120000,
        "vulnerability_score": 0.75
    },
    {
        "id": 2,
        "name": "Indiranagar",
        "geom_geojson": {
            "type": "Polygon",
            "coordinates": [[[12.960, 77.630], [12.980, 77.630], [12.980, 77.650], [12.960, 77.650], [12.960, 77.630]]]
        },
        "population": 95000,
        "vulnerability_score": 0.58
    },
    {
        "id": 3,
        "name": "HSR Layout",
        "geom_geojson": {
            "type": "Polygon",
            "coordinates": [[[12.890, 77.630], [12.910, 77.630], [12.910, 77.650], [12.890, 77.650], [12.890, 77.630]]]
        },
        "population": 110000,
        "vulnerability_score": 0.62
    },
    {
        "id": 4,
        "name": "Whitefield",
        "geom_geojson": {
            "type": "Polygon",
            "coordinates": [[[12.950, 77.720], [12.980, 77.720], [12.980, 77.760], [12.950, 77.760], [12.950, 77.720]]]
        },
        "population": 150000,
        "vulnerability_score": 0.81
    }
]

@router.get("/wards", tags=["Wards"])
async def get_wards(db: Session = Depends(get_db)):
    """
    Returns list of wards with geometries (GeoJSON) and population stats.
    Serves real PostGIS data when the wards table is populated;
    falls back to the 4-ward mock set for local dev / CI with no DB.
    """
    if db is None:
        return {"wards": MOCK_WARDS}

    try:
        # Count wards — if zero, return mock so frontend never gets an empty list
        count = db.query(Ward).count()
        if count == 0:
            return {"wards": MOCK_WARDS}
            
        wards_db = db.query(
            Ward.id,
            Ward.name,
            func.ST_AsGeoJSON(Ward.geom).label("geom_json"),
            Ward.population,
            Ward.vulnerability_score
        ).all()

        if not wards_db:
            return {"wards": MOCK_WARDS}

        result = []
        for w in wards_db:
            result.append({
                "id": w.id,
                "name": w.name,
                "geom_geojson": json.loads(w.geom_json) if w.geom_json else None,
                "population": w.population,
                "vulnerability_score": w.vulnerability_score
            })
        return {"wards": result}
    except Exception as e:
        print(f"Error querying wards database, falling back to mock dataset: {e}")
        return {"wards": MOCK_WARDS}
