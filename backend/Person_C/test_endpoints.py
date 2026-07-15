from fastapi.testclient import TestClient
from Person_C.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

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
    assert "confidence_low" in pt
    assert "confidence_high" in pt

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
    assert "target_id" in t
    assert "name" in t
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
