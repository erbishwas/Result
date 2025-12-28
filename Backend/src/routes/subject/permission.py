from fastapi import HTTPException
from sqlalchemy.orm import Session
from src.routes.grade.model import Grade

def verify_user_subject(db: Session, user_id: int, grade_id: int):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=403, detail="Grade not found")
    if grade.grade_teacher_id != user_id:
        raise HTTPException(status_code=403, detail="Permission denied for this grade")
    return True