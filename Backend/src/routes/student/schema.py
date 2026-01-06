from pydantic import BaseModel, Field
from typing import Optional



class StudentBase(BaseModel):
    roll: str
    name: str
    year: str
    grade_id: int
    is_active: bool = True

    class Config:
        from_attributes = True


class StudentCreate(StudentBase):

    pass


class StudentUpdate(BaseModel):
    roll: Optional[str] = None
    name: Optional[str] = None
    year: Optional[str] = None
    grade_id: Optional[int] = None
    is_active: Optional[bool] = None



class StudentResponse(StudentBase):
    id: int
    

    class Config:
        from_attributes = True

class StudentMini(BaseModel):
    id: int
    roll: str
    name: str

    class Config:
        from_attributes = True