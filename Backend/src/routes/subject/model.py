from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship


from src.config.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)

    sub_code = Column(String(20), nullable=False, index=True)
    sub_name = Column(String(100), nullable=False)

    Th_ch = Column(Numeric(4,2), nullable=False)  
    Pr_ch = Column(Numeric(4,2), nullable=False)   

    is_elective = Column(Boolean, default=False, nullable=False)

    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    
    grade = relationship("Grade", back_populates="subjects")

    elective_subjects = relationship("ElectiveSub", back_populates="subject")
