from sqlalchemy import Column, Integer, Boolean, String
from src.config.database import Base

class Year(Base):
    __tablename__ = "years"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(10), unique=True, nullable=False)
    is_current = Column(Boolean, default=False)



