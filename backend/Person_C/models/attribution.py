from sqlalchemy import Column, Integer, BigInteger, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from Person_C.models.base import Base

class Attribution(Base):
    __tablename__ = "attributions"

    id = Column(BigInteger, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    ts = Column(DateTime(timezone=True), nullable=True)
    cause = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    evidence_json = Column(JSONB, nullable=True)

    ward = relationship("Ward", backref="attributions")
