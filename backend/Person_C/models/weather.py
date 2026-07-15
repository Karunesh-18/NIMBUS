from sqlalchemy import Column, Integer, BigInteger, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from Person_C.models.base import Base

class Weather(Base):
    __tablename__ = "weather"

    id = Column(BigInteger, primary_key=True, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    ts = Column(DateTime(timezone=True), nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_dir = Column(Float, nullable=True)
    temp = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    is_forecast = Column(Boolean, nullable=True)

    ward = relationship("Ward", backref="weather_records")
