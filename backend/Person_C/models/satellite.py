from sqlalchemy import Column, Integer, BigInteger, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from Person_C.models.base import Base

class SatelliteReading(Base):
    __tablename__ = "satellite_readings"

    id = Column(BigInteger, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    ts = Column(DateTime(timezone=True), nullable=False)
    aerosol_index = Column(Float, nullable=True)

    ward = relationship("Ward", backref="satellite_records")
