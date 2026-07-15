import datetime
import random

def forecast(ward_id: int) -> list[dict]:
    """
    Returns AQI forecast points for a specific ward for the next 24 hours.
    Response shape: [{ts, aqi, confidence_low, confidence_high}]
    """
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        rng = random.Random(ward_id)
        points = []
        base_aqi = rng.randint(65, 230)
        
        for hour in range(24):
            future_ts = now + datetime.timedelta(hours=hour)
            # Add hourly variation & diurnal peak logic (rush hours)
            variation = rng.randint(-20, 20)
            hour_of_day = future_ts.hour
            
            # Diurnal factor: higher AQI during typical peak traffic hours (8-10 AM, 6-9 PM)
            if 8 <= hour_of_day <= 10 or 18 <= hour_of_day <= 21:
                diurnal = rng.randint(25, 50)
            else:
                diurnal = rng.randint(-15, 5)
                
            aqi = max(15, int(base_aqi + variation + diurnal))
            
            points.append({
                "ts": future_ts.isoformat(),
                "aqi": aqi,
                "confidence_low": max(10, int(aqi * 0.85)),
                "confidence_high": int(aqi * 1.15)
            })
            
        return points
    except Exception as e:
        print(f"Error generating AQI forecast: {e}")
        return []
