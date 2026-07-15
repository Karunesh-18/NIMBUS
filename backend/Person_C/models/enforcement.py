from sqlalchemy import Column, Integer, String, Float, DateTime, func
from Person_C.models.base import Base

class EnforcementAction(Base):
    __tablename__ = "enforcement_actions"

    id = Column(Integer, primary_key=True, index=True)
    target_id = Column(Integer, nullable=True)
    target_type = Column(String, nullable=True)  # 'permit' | 'industry'
    priority_score = Column(Float, nullable=True)
    status = Column(String, nullable=True)        # 'pending' | 'dispatched' | 'resolved'
    outcome = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
