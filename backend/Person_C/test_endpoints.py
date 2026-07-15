from fastapi.testclient import TestClient
from Person_C.main import app
from Person_C.services import data_access

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    # Enriched fields must always be present (even if DB is disconnected)
    assert "database" in data
    assert "last_openaq_poll" in data
    assert "last_weather_poll" in data
    assert "cache_size" in data

def test_wards_endpoint():
    response = client.get("/wards")
    assert response.status_code == 200
    data = response.json()
    assert "wards" in data
    assert len(data["wards"]) > 0
    ward = data["wards"][0]
    assert "id" in ward
    assert "name" in ward
    assert "geom_geojson" in ward
    assert "population" in ward
    assert "vulnerability_score" in ward

def test_aqi_surface_endpoint():
    response = client.get("/aqi/surface?bbox=12.92,77.61,12.94,77.63&ts=2026-07-15T09:56:32")
    assert response.status_code == 200
    data = response.json()
    assert "grid" in data
    assert len(data["grid"]) > 0
    point = data["grid"][0]
    assert "lat" in point
    assert "lon" in point
    assert "aqi" in point
    assert "pollutant_breakdown" in point

def test_forecast_endpoint():
    response = client.get("/forecast/12")
    assert response.status_code == 200
    data = response.json()
    assert "ward_id" in data
    assert data["ward_id"] == 12
    assert "points" in data
    assert len(data["points"]) > 0
    pt = data["points"][0]
    assert "ts" in pt
    assert "aqi" in pt
    assert "confidence" in pt

def test_attribution_endpoint():
    response = client.get("/attribution/12?ts=2026-07-15T09:56:32")
    assert response.status_code == 200
    data = response.json()
    assert "ward_id" in data
    assert data["ward_id"] == 12
    assert "cause" in data
    assert "confidence" in data
    assert "evidence" in data

def test_agent_ask_endpoint():
    response = client.post("/agent/ask", json={"question": "What is the worst ward?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "citations" in data
    assert "map_focus" in data

def test_simulate_endpoint():
    req_body = {
        "ward_id": 12,
        "intervention": {
            "type": "permit",
            "target_id": 101,
            "action": "halt"
        }
    }
    response = client.post("/simulate", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert "before" in data
    assert "after" in data
    assert len(data["before"]) == len(data["after"])

def test_enforcement_queue_endpoint():
    response = client.get("/enforcement/queue")
    assert response.status_code == 200
    data = response.json()
    assert "queue" in data
    assert len(data["queue"]) > 0
    t = data["queue"][0]
    assert "id" in t
    assert "label" in t
    assert "geom" in t
    assert "priority_score" in t
    assert "status" in t

def test_advisory_endpoint():
    response = client.get("/advisory/12?lang=hi")
    assert response.status_code == 200
    data = response.json()
    assert "ward_id" in data
    assert data["ward_id"] == 12
    assert "message" in data
    assert "risk_level" in data

# ── Data access service layer tests ──────────────────────────────────────────
def test_data_access_no_db_returns_empty_list():
    """All service helpers must return empty lists gracefully when db=None."""
    assert data_access.get_readings(1, "2026-07-15T00:00:00Z", db=None) == []
    assert data_access.get_latest_readings(1, db=None) == []
    assert data_access.get_permits(1, db=None) == []
    assert data_access.get_industries(1, db=None) == []
    assert data_access.get_weather(1, db=None) == []
    assert data_access.get_ward_ids(db=None) == []
