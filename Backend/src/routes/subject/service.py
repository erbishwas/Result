from sqlalchemy.orm import Session
from fastapi import HTTPException

from .model import Subject
from .schema import SubjectCreate, SubjectUpdate
from src.routes.log.services import log_action
from .permission import verify_user_subject


class SubjectService:

    # ---------------- CREATE ----------------
    @staticmethod
    def create_subject(db: Session, data: SubjectCreate, user_id: int,admin_id: int|None =None):
        if not admin_id:
            verify_user_subject(db, user_id, data.grade_code)
        elif
        subject = Subject(**data.model_dump())
        db.add(subject)
        db.commit()
        db.refresh(subject)

        log_action(
            db=db,
            user_id=user_id,
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
                "grade_code": subject.grade_code,
            },
        )

        return subject

    # ---------------- GET ALL ----------------
    @staticmethod
    def get_all(db: Session):
        return db.query(Subject).all()

    # ---------------- GET BY ID ----------------
    @staticmethod
    def get_by_id(db: Session, subject_id: int):
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return subject

    # ---------------- GET BY CODE ----------------
    @staticmethod
    def get_by_code(db: Session, code: str):
        subject = db.query(Subject).filter(Subject.sub_code == code).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return subject

    # ---------------- GET BY NAME ----------------
    @staticmethod
    def get_by_name(db: Session, name: str):
        return db.query(Subject).filter(Subject.sub_name.ilike(f"%{name}%")).all()

    # ---------------- GET ELECTIVE ----------------
    @staticmethod
    def get_elective(db: Session):
        return db.query(Subject).filter(Subject.is_elective == True).all()

    # ---------------- UPDATE ----------------
    @staticmethod
    def update_subject(db: Session, subject_id: int, data: SubjectUpdate, user_id: int):
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        old_data = {
            "sub_code": subject.sub_code,
            "sub_name": subject.sub_name,
            "Th_ch": subject.Th_ch,
            "Pr_ch": subject.Pr_ch,
            "is_elective": subject.is_elective,
            "grade_code": subject.grade_code,
        }

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(subject, field, value)

        db.commit()
        db.refresh(subject)

        log_action(
            db=db,
            user_id=user_id,
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
                "grade_code": subject.grade_code,
            },
        )

        return subject

    # ---------------- DELETE ----------------
    @staticmethod
    def delete_subject(db: Session, subject_id: int, user_id: int):
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        old_data = {
            "sub_code": subject.sub_code,
            "sub_name": subject.sub_name,
            "Th_ch": subject.Th_ch,
            "Pr_ch": subject.Pr_ch,
            "is_elective": subject.is_elective,
            "grade_code": subject.grade_code,
        }

        db.delete(subject)
        db.commit()

        log_action(
            db=db,
            user_id=user_id,
            action="DELETE",
            table_name="subjects",
            record_id=subject_id,
            old_data=old_data,
            new_data=None,
        )

        return {"message": "Subject deleted successfully"}
