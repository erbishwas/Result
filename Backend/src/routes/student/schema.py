from pydantic import BaseModel, Field
from typing import Optional

from src.routes.elective_subject.schema import ElectiveSubResponse, ElectiveSubBase, ElectiveSubUpdate, ElectiveSubCreate


class StudentBase(BaseModel):
    roll: str
    name: str
    year: str
    grade_id: int
    is_active: bool = True

    class Config:
        from_attributes = True


class StudentCreate(StudentBase):

    elective_subjects: Optional[list[ElectiveSubCreate]] = Field(default_factory=list)
    pass


class StudentUpdate(BaseModel):
    roll: Optional[str] = None
    name: Optional[str] = None
    year: Optional[str] = None
    grade_id: Optional[int] = None
    is_active: Optional[bool] = None
    elective_subjects: Optional[list[ElectiveSubUpdate]] = Field(default_factory=list)



class StudentResponse(StudentBase):
    id: int
    elective_subjects:Optional[list[ElectiveSubResponse]]= Field(default_factory=list)

    class Config:
        from_attributes = True
