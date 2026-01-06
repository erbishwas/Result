from pydantic import BaseModel
from src.routes.student.schema import StudentMini


class ElectiveSubBase(BaseModel):
    student_id: int
    sub_id: int
    year: str

    class Config:
        from_attributes = True


class ElectiveSubCreate(BaseModel):
    student_id: int
    sub_id: int
    year: str

class ElectiveSubUpdate(ElectiveSubBase):
    id: int
    student_id: int = None
    sub_id: int = None
    year: str = None

class ElectiveSubResponse(BaseModel):
    id: int
    sub_id: int
    year: str


class StudentWithElectiveSub(BaseModel):
    id: int
    roll: str
    name: str
    elective_subjects: list[ElectiveSubResponse] = []

    class Config:
        from_attributes = True