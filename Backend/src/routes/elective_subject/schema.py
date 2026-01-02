from pydantic import BaseModel
from src.routes.subject.schema import SubjectMini


class ElectiveSubBase(BaseModel):
    student_id: int
    sub_id: int
    year: str

    class Config:
        from_attributes = True


class ElectiveSubCreate(BaseModel):
    sub_id: int
    year: str

class ElectiveSubUpdate(ElectiveSubBase):
    id: int
    student_id: int = None
    sub_id: int = None
    year: str = None

class ElectiveSubResponse(ElectiveSubBase):
    id: int

