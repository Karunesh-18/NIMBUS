from fastapi import APIRouter
from pydantic import BaseModel
from Person_C.ai.forecast import forecast

router = APIRouter()

class Intervention(BaseModel):
    type: str                # e.g., 'permit' | 'industry'
    target_id: int
    action: str              # e.g., 'halt' | 'suspend' | 'close'

class SimulateRequest(BaseModel):
    ward_id: int
    intervention: Intervention

@router.post("/simulate", tags=["Simulation"])
async def simulate(req: SimulateRequest):
    """
    Runs a counterfactual simulation by applying an intervention (e.g. pausing construction)
    and returning before/after forecasts for comparative frontend animations.
    """
    # 1. Get the standard baseline forecast (before)
    before_points = forecast(req.ward_id)
    
    # 2. Simulate the 'after' forecast by applying a reduction factor based on intervention action
    action = req.intervention.action.lower()
    
    # Greater reduction if halting/closing, milder if monitoring
    if "halt" in action or "suspend" in action or "pause" in action:
        reduction_factor = 0.78  # 22% improvement
    elif "close" in action or "shut" in action:
        reduction_factor = 0.72  # 28% improvement
    elif "restrict" in action or "reduce" in action:
        reduction_factor = 0.85  # 15% improvement
    else:
        reduction_factor = 0.90  # 10% improvement
        
    after_points = []
    for p in before_points:
        aqi_after = max(10, int(p["aqi"] * reduction_factor))
        after_points.append({
            "ts": p["ts"],
            "aqi": aqi_after,
            "confidence_low": max(8, int(aqi_after * 0.85)),
            "confidence_high": int(aqi_after * 1.15)
        })
        
    return {
        "before": before_points,
        "after": after_points
    }
