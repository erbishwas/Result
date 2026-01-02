from sqlalchemy.orm import Session
from fastapi import HTTPException

from .model import Subject
from .schema import SubjectCreate, SubjectUpdate
from src.routes.log.services import log_action
from src.routes.auth import service as auth_services
from src.config.dependencies import check_user_validation_for_grade
from src.routes.grade.service import GradeService


class SubjectService:

    

    @staticmethod
    def create_subject(db: Session, data: SubjectCreate, user):
        check_user_validation_for_grade(db, user, data.grade_id)
        subject = Subject(**data.model_dump())
        db.add(subject)
        db.commit()
        db.refresh(subject)

        log_action(
            db=db,
            user_id=user.id,
            action="CREATE",
            table_name="subjects",
            record_id=subject.id,
            old_data=None,
            new_data={
                "sub_code": subject.sub_code,
                "sub_name": subject.sub_name,
                "Th_ch": subject.Th_ch,
                "Pr_ch": subject.Pr_ch,
                "is_elective": subject.is_elective,
                "is_active": subject.is_active,
                "grade_id": subject.grade_id,
            },
        )

        return subject

    # ---------------- GET ALL ----------------
    @staticmethod
    def get_all(db: Session, user):
        grade_id=GradeService.get_grade_by_user(user,db).id        
        if grade_id:
            return db.query(Subject).filter(Subject.grade_id==grade_id).all()
        raise HTTPException(status_code=403, detail="Subjects not found for the user's grade")

    # ---------------- GET BY ID ----------------
    @staticmethod
    def get_by_id(db: Session, subject_id: int):
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return subject

  
    @staticmethod
    def get_elective(db: Session, user_id: int):
        grade_id=get_grade_id_by_user(user_id,db)
        if grade_id:
            return db.query(Subject).filter(Subject.grade_id==grade_id, Subject.is_elective == True).all()
        raise HTTPException(status_code=403, detail="Elective subjects not found for the user's grade")

    # ---------------- UPDATE ----------------
    @staticmethod
    def update_subject(db: Session, subject_id: int, data: SubjectUpdate, user):
        check_user_validation_for_grade(db, user, data.grade_id)
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        old_data = {
            "sub_code": subject.sub_code,
            "sub_name": subject.sub_name,
            "Th_ch": subject.Th_ch,
            "Pr_ch": subject.Pr_ch,
            "is_elective": subject.is_elective,
            "grade_id": subject.grade_id,
        }

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(subject, field, value)

        db.commit()
        db.refresh(subject)

        log_action(
            db=db,
            user_id=user.id,
            action="UPDATE",
            table_name="subjects",
            record_id=subject.id,
            old_data=old_data,
            new_data={
                "sub_code": subject.sub_code,
                "sub_name": subject.sub_name,
                "Th_ch": subject.Th_ch,
                "Pr_ch": subject.Pr_ch,
                "is_elective": subject.is_elective,
                "grade_id": subject.grade_id,
            },
        )

        return subject

    @staticmethod
    def toggle_active(db: Session, subject_id: int, user):
        grade_id=GradeService.get_grade_by_user(user,db).id
        check_user_validation_for_grade(db, user, grade_id)
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        old_data = {
            "is_active": subject.is_active,
        }

        subject.is_active = not subject.is_active
        
        db.commit()
        db.refresh(subject)

        log_action(
            db=db,
            user_id=user.id,
            action="TOGGLE_ACTIVE",
            table_name="subject",
            record_id=subject_id,
            old_data=old_data,
            new_data={"is_active": subject.is_active},
        )

        return subject

    # ---------------- DELETE ----------------
   
