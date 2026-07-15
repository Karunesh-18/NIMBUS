from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from Person_C.database.session import get_db
from Person_C.models.enforcement import EnforcementAction
from Person_C.ai import prioritize_enforcement
import os

router = APIRouter()

class UpdateStatusRequest(BaseModel):
    status: str             # 'pending' | 'dispatched' | 'resolved'
    outcome: Optional[str] = None

@router.get("/enforcement/queue", tags=["Enforcement"])
async def get_enforcement_queue(db: Session = Depends(get_db)):
    """
    Returns prioritized enforcement task queue.
    Merges live prioritize scores with DB states (e.g., status changes) to persist official updates.
    """
    # 1. Fetch prioritized tasks from AI prioritization module
    tasks = prioritize_enforcement()
    
    # 2. Merge with persistent database state if DB is connected
    if db is not None and os.getenv("DEMO_MODE", "true").lower() != "true":
        try:
            for t in tasks:
                action = db.query(EnforcementAction).filter(
                    EnforcementAction.target_id == t["target_id"],
                    EnforcementAction.target_type == t["target_type"]
                ).first()
                
                if action:
                    # Sync database status and outcome back into the queue response
                    t["status"] = action.status
                    t["outcome"] = action.outcome
                    t["priority_score"] = action.priority_score or t["priority_score"]
                else:
                    # Auto-seed the database record to track this target
                    new_action = EnforcementAction(
                        target_id=t["target_id"],
                        target_type=t["target_type"],
                        priority_score=t["priority_score"],
                        status=t["status"],
                        outcome=t.get("outcome")
                    )
                    db.add(new_action)
            db.commit()
        except Exception as e:
            print(f"Non-fatal error syncing enforcement actions: {e}")
            db.rollback()
            
    return {"queue": tasks}

@router.patch("/enforcement/queue/{target_type}/{target_id}", tags=["Enforcement"])
async def update_enforcement_status(
    target_type: str, 
    target_id: int, 
    req: UpdateStatusRequest, 
    db: Session = Depends(get_db)
):
    """
    Updates the enforcement status (e.g., dispatching an inspector or resolving a permit issue) for a target.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")
        
    try:
        action = db.query(EnforcementAction).filter(
            EnforcementAction.target_id == target_id,
            EnforcementAction.target_type == target_type
        ).first()
        
        if not action:
            # Create a new record if not tracked yet
            action = EnforcementAction(
                target_id=target_id,
                target_type=target_type,
                priority_score=0.0,  # placeholder, will update
                status=req.status,
                outcome=req.outcome
            )
            db.add(action)
        else:
            action.status = req.status
            if req.outcome:
                action.outcome = req.outcome
                
        db.commit()
        db.refresh(action)
        
        return {
            "target_id": action.target_id,
            "target_type": action.target_type,
            "status": action.status,
            "outcome": action.outcome,
            "priority_score": action.priority_score
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {e}")
