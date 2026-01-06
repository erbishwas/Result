from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from src.config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False) 
    grade_code = Column(String(20), nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)

    grade = relationship(
        "Grade",
        back_populates="teacher",
        uselist=False
    )