def prioritize_enforcement() -> list[dict]:
    """
    Returns prioritized enforcement task queue.
    Response shape: [{target_id, name, geom, priority_score, evidence_ref, target_type, status}]
    """
    try:
        return [
            {
                "target_id": 101,
                "target_type": "permit",
                "name": "RMZ Latitude Construction Site",
                "geom": {"type": "Point", "coordinates": [12.956, 77.701]},
                "priority_score": 92.5,
                "evidence_ref": "permit-104",
                "status": "pending"
            },
            {
                "target_id": 203,
                "target_type": "industry",
                "name": "Apex Dyeing & Chemical Plant",
                "geom": {"type": "Point", "coordinates": [12.915, 77.625]},
                "priority_score": 84.1,
                "evidence_ref": "ind-88",
                "status": "pending"
            },
            {
                "target_id": 105,
                "target_type": "permit",
                "name": "Prestige Tech Park Phase 4 Demolition",
                "geom": {"type": "Point", "coordinates": [12.938, 77.692]},
                "priority_score": 78.3,
                "evidence_ref": "permit-2026-DEM-08",
                "status": "dispatched"
            }
        ]
    except Exception as e:
        print(f"Error in prioritize_enforcement: {e}")
        return []
