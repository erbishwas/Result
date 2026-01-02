from sqlalchemy.orm import Session
from fastapi import HTTPException
from .model import Grade
from .schema import GradeCreate, GradeUpdate, GradeBase, GradeOut
from src.routes.log.services import log_action
from src.routes.auth.service import UserService
from src.routes.auth.model import User
from src.routes.subject.model import Subject



class GradeService:

    # ---------------- CREATE ----------------
    @staticmethod
    def create(db: Session, data: GradeCreate, user_id: int):
        grade = Grade(**data.dict())
        db.add(grade)
        db.commit()
        db.refresh(grade)

        log_action(
            db=db,
            user_id=user_id,
            action="CREATE",
            table_name="grades",
            record_id=grade.id,
            old_data=None,
            new_data=data.dict(),
        )

        return grade

    # ---------------- UPDATE ----------------
    @staticmethod
    def update(db: Session, grade_id: int, data: GradeUpdate, user_id: int):
        grade = db.query(Grade).filter(Grade.id == grade_id).first()
        if not grade:
            raise HTTPException(status_code=404, detail="Grade not found")

        old_data = {
            "code": grade.code,
            "name": grade.name,
            "subject_count": grade.subject_count,
            "has_elective": grade.has_elective,
            "elective_count": grade.elective_count,
            "grade_teacher_id": grade.grade_teacher_id,
            "is_active": grade.is_active,
        }

        for key, value in data.dict().items():
            setattr(grade, key, value)

        db.commit()
        db.refresh(grade)

        log_action(
            db=db,
            user_id=user_id,
            action="UPDATE",
            table_name="grades",
            record_id=grade.id,
            old_data=old_data,
            new_data=data.dict(),
        )

        return grade

    # ---------------- GET ----------------
    @staticmethod
    def get_all(db: Session, include_inactive: bool = False):
        query = db.query(Grade)
        query=query.order_by(Grade.is_active.desc(), Grade.id.desc()).all()
        return query

    @staticmethod
    def get_by_id(db: Session, grade_id: int):
        return db.query(Grade).filter(Grade.id == grade_id).first()

    @staticmethod
    def toggle_active(db: Session, grade_id: int, user_id: int):
        grade = db.query(Grade).filter(Grade.id == grade_id).first()
        if not grade:
            raise HTTPException(status_code=404, detail="Grade not found")

        old_data = {
            "is_active": grade.is_active,
        }

        grade.is_active = not grade.is_active
        if not grade.is_active:
            grade.grade_teacher_id = None  
        db.commit()
        db.refresh(grade)

        log_action(
            db=db,
            user_id=user_id,
            action="TOGGLE_ACTIVE",
            table_name="grades",
            record_id=grade.id,
            old_data=old_data,
            new_data={"is_active": grade.is_active},
        )

        return grade


    def get_grade_by_user(current_user, db: Session):

        # 1️⃣ Get grade
        print("this is test",current_user.is_admin, current_user.username)
        if current_user.is_admin:
            grade_id=db.query(User).filter(User.id==current_user.id).first().grade_code
            grade = (
                db.query(Grade)
                .filter(Grade.id == grade_id)
                .first()
            )
        else:
            grade = (
                db.query(Grade)
                .filter(Grade.grade_teacher_id == current_user.id)
                .first()
            )

        if not grade:
            raise HTTPException(status_code=404, detail="You are not assigned to any grade yet")

        elective_subjects = (
            db.query(Subject)
            .filter(
                Subject.grade_id == grade.id,
                Subject.is_elective == True,
                Subject.is_active == True
            )
            .all()
        )

        grade.elective_subjects= elective_subjects
        return grade
