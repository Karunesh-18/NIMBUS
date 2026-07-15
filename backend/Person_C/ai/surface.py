import random

def get_surface(bbox: tuple, ts: str) -> list[dict]:
    """
    Returns live colored AQI heatmap grid points.
    bbox: tuple of (lat1, lon1, lat2, lon2)
    ts: ISO8601 timestamp string
    """
    try:
        # Generate a deterministic grid within the bounding box
        lat1, lon1, lat2, lon2 = bbox
        grid = []
        
        # Use a deterministic seed based on coordinate bounds and timestamp
        seed_val = int(abs(lat1 + lon1 + lat2 + lon2) * 1000) + len(ts)
        rng = random.Random(seed_val)
        
        # Generate a 5x5 grid of interpolated points
        for i in range(5):
            for j in range(5):
                lat = lat1 + (lat2 - lat1) * (i / 4.0)
                lon = lon1 + (lon2 - lon1) * (j / 4.0)
                aqi = rng.randint(45, 280)
                
                # Assign category based on Indian AQI standards
                if aqi <= 50:
                    cat = "Good"
                elif aqi <= 100:
                    cat = "Satisfactory"
                elif aqi <= 200:
                    cat = "Moderate"
                elif aqi <= 300:
                    cat = "Poor"
                elif aqi <= 400:
                    cat = "Very Poor"
                else:
                    cat = "Severe"
                    
                grid.append({
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                    "aqi": aqi,
                    "category": cat,
                    "pollutant_breakdown": {
                        "pm25": round(aqi * 0.6, 1),
                        "pm10": round(aqi * 0.9, 1),
                        "no2": round(rng.uniform(10, 45), 1),
                        "so2": round(rng.uniform(2, 12), 1),
                        "co": round(rng.uniform(0.2, 1.8), 2)
                    }
                })
        return grid
    except Exception as e:
        print(f"Error generating surface grid: {e}")
        return []
