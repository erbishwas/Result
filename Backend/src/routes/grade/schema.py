from pydantic import BaseModel

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

    class Config:
        from_attributes = True
