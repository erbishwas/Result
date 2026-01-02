from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from src.config.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    roll = Column(String(20), nullable=False, index=True)
    name = Column(String(100), nullable=False)

    year = Column(String(10), nullable=False)

    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    grade = relationship("Grade", back_populates="students")

    elective_subjects = relationship("ElectiveSub", back_populates="student")
