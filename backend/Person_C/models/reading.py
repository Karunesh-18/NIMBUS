from sqlalchemy import Column, Integer, BigInteger, String, Float, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from Person_C.models.base import Base

class Reading(Base):
    __tablename__ = "readings"

    id = Column(BigInteger, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    ts = Column(DateTime(timezone=True), nullable=False)
    pollutant = Column(String, nullable=True)
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    aqi_category = Column(String, nullable=True)

    station = relationship("Station", backref="readings")

    __table_args__ = (
        Index("idx_readings_station_ts", "station_id", "ts"),
    )
