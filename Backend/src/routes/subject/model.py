from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)

    sub_code = Column(String(20), nullable=False, index=True)
    sub_name = Column(String(100), nullable=False)

    Th_ch = Column(Float, nullable=False)  
    Pr_ch = Column(Float, nullable=False)   

    is_elective = Column(Boolean, default=False, nullable=False)

    grade_code = Column(Integer, ForeignKey("grade.id"), nullable=False)

    
    grade = relationship("Grade", back_populates="subjects")
