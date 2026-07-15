from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from Person_C.models.base import Base

class Permit(Base):
    __tablename__ = "permits"

    id = Column(Integer, primary_key=True, index=True)
    geom = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    type = Column(String, nullable=True)
    status = Column(String, nullable=True)
    issued_date = Column(Date, nullable=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)

    ward = relationship("Ward", backref="permits")
