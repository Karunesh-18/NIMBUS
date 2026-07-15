from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from Person_C.models.base import Base

class Industry(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True)
    geom = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)

    ward = relationship("Ward", backref="industries")
