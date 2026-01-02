from pydantic import BaseModel,ConfigDict
from src.routes.subject.schema import SubjectMini

class GradeBase(BaseModel):
    code: str
    name: str
    subject_count: int
    has_elective: bool = False
    elective_count: int = 0
    grade_teacher_id: int | None = None
    is_active: bool = True


class GradeCreate(GradeBase):
    pass


class GradeUpdate(GradeBase):
    pass


class GradeOut(GradeBase):
    id: int
    elective_subjects: list[SubjectMini]

    class Config:
        from_attributes = True

class GradeOutNormal(GradeBase):
    id: int
   

    class Config:
        from_attributes = True

class GradeResponse(BaseModel):
    code: str
    name: str
    subject_count: int
    has_elective: bool
    elective_count: int
    grade_teacher_id: int | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
