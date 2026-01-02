from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship

from src.config.database import Base


class ElectiveSub(Base):
    __tablename__ = "elective_subjects"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    sub_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    year = Column(String(10), nullable=False)

    student = relationship("Student")
    subject = relationship("Subject")
