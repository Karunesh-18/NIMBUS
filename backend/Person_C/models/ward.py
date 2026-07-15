from sqlalchemy import Column, Integer, String, Float
from geoalchemy2 import Geometry
from Person_C.models.base import Base

class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    population = Column(Integer, nullable=True)
    vulnerability_score = Column(Float, nullable=True)
