from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------
# Base
# ---------------------------
class SubjectBase(BaseModel):
    sub_code: str = Field(..., max_length=20)
    sub_name: str = Field(..., max_length=100)
    Th_ch: float = Field(..., ge=0)
    Pr_ch: float = Field(..., ge=0)
    is_elective: bool = False
    grade_code: int


# ---------------------------
# Create
# ---------------------------
class SubjectCreate(SubjectBase):
    pass


# ---------------------------
# Update
# ---------------------------
class SubjectUpdate(BaseModel):
    sub_code: Optional[str] = Field(None, max_length=20)
    sub_name: Optional[str] = Field(None, max_length=100)
    Th_ch: Optional[int] = Field(None, ge=0)
    Pr_ch: Optional[int] = Field(None, ge=0)
    is_elective: Optional[bool] = None
    grade_code: Optional[int] = None


# ---------------------------
# Response
# ---------------------------
class SubjectResponse(SubjectBase):
    id: int

    class Config:
        from_attributes = True
