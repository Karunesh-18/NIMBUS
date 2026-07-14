from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI(
    title="NIMBUS API",
    description="Backend API for NIMBUS Air Quality & Enforcement Platform",
    version="0.1.0"
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class AskRequest(BaseModel):
    question: str

class Intervention(BaseModel):
    type: str
    target_id: int
    action: str

class SimulateRequest(BaseModel):
    ward_id: int
    intervention: Intervention


# 1. /aqi/surface - GET
@app.get("/aqi/surface", tags=["AQI"])
async def get_aqi_surface(bbox: str, ts: str):
    """
    Returns live colored AQI heatmap grid points.
    Query params: bbox (lat1,lon1,lat2,lon2), ts (ISO8601)
    """
    return {
        "grid": [
            # Example element format: {"lat": 12.9716, "lon": 77.5946, "aqi": 142, "pollutant_breakdown": {"pm25": 54, "pm10": 88}}
        ]
    }

# 2. /wards - GET
@app.get("/wards", tags=["Wards"])
async def get_wards():
    """
    Returns list of wards with geometries and population stats.
    """
    return {
        "wards": [
            # Example element format: {"id": 1, "name": "Ward 1", "geom_geojson": {}, "population": 45000, "vulnerability_score": 0.72}
        ]
    }

# 3. /forecast/{ward_id} - GET
@app.get("/forecast/{ward_id}", tags=["AQI"])
async def get_forecast(ward_id: int):
    """
    Returns AQI forecast points for a specific ward.
    """
    return {
        "ward_id": ward_id,
        "points": [
            # Example element format: {"ts": "2026-07-14T12:00:00Z", "aqi": 120.0, "confidence_low": 105.0, "confidence_high": 135.0}
        ]
    }

# 4. /attribution/{ward_id} - GET
@app.get("/attribution/{ward_id}", tags=["AQI"])
async def get_attribution(ward_id: int, ts: str):
    """
    Returns pollution attribution analysis for a ward at a specific timestamp.
    """
    return {
        "ward_id": ward_id,
        "cause": "Mock cause (e.g., Construction dust & vehicular traffic)",
        "confidence": 0.85,
        "evidence": [
            # Example element format: {"type": "permit", "ref": "P1024", "description": "Active roadwork permit 50m upwind"}
        ]
    }

# 5. /agent/ask - POST
@app.post("/agent/ask", tags=["Agent"])
async def ask_agent(req: AskRequest):
    """
    Q&A agent endpoint to query the system with natural language.
    """
    return {
        "answer": "This is a stubbed response from the city agent. AI integration is pending.",
        "citations": [
            # Example element format: {"source": "CPCB Station #12", "ref": "http://example.com/station12"}
        ],
        "map_focus": {
            "ward_id": 1,
            "bbox": [12.97, 77.59, 12.99, 77.61]
        }
    }

# 6. /simulate - POST
@app.post("/simulate", tags=["Simulation"])
async def simulate(req: SimulateRequest):
    """
    Runs counterfactual simulation by applying an intervention and returning before/after forecasts.
    """
    return {
        "before": [
            # Example forecast points
        ],
        "after": [
            # Example forecast points showing the simulated impact
        ]
    }

# 7. /enforcement/queue - GET
@app.get("/enforcement/queue", tags=["Enforcement"])
async def get_enforcement_queue():
    """
    Returns prioritized enforcement task queue.
    """
    return {
        "queue": [
            # Example element format: {"target_id": 101, "name": "Metro Build Site Phase II", "geom": {"type": "Point", "coordinates": [77.5946, 12.9716]}, "priority_score": 88.5, "evidence_ref": "permit/P1024"}
        ]
    }

# 8. /advisory/{ward_id} - GET
@app.get("/advisory/{ward_id}", tags=["Citizen"])
async def get_advisory(ward_id: int, lang: str = "en"):
    """
    Returns localized citizen public health advisory.
    Supported languages: en, hi, ta, kn, bn
    """
    return {
        "ward_id": ward_id,
        "message": "Stay indoors as much as possible. Air quality is currently poor, especially for vulnerable groups.",
        "risk_level": "Poor"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Simple health check.
    """
    return {"status": "healthy"}
