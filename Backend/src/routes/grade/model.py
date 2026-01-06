
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from src.config.database import Base

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)

    subject_count = Column(Integer, nullable=False)
    has_elective = Column(Boolean, default=False , nullable=False)
    elective_count = Column(Integer, default=0)

    # 🔗 grade teacher relation
    grade_teacher_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        unique=True,
        nullable=True,
    )

    teacher = relationship(
        "User",
        back_populates="grade",
        lazy="joined",
    )

    is_active = Column(Boolean, default=True, nullable=False)

    subjects = relationship("Subject", back_populates="grade", cascade="all, delete-orphan")

    students = relationship("Student", back_populates="grade")
