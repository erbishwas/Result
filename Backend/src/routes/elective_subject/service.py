from sqlalchemy.orm import Session
from fastapi import HTTPException

from .model import ElectiveSub
from .schema import ElectiveSubCreate, ElectiveSubResponse, ElectiveSubUpdate
from src.routes.log.services import log_action


class ElectiveSubService:

    @staticmethod
    def create(db: Session, data: ElectiveSubCreate, user):
        elective = ElectiveSub(**data.model_dump())
        db.add(elective)
        db.commit()
        db.refresh(elective)

        log_action(
            db=db,
            user_id=user.id,
            action="CREATE",
            table_name="elective_subjects",
            record_id=elective.id,
            old_data=None,
            new_data=data.model_dump(),
        )

        return elective

    @staticmethod
    def get_all(db: Session):
        return db.query(ElectiveSub).all()

    @staticmethod
    def get_by_student(db: Session, student_id: int):
        return db.query(ElectiveSub).filter(ElectiveSub.student_id == student_id).all()

    @staticmethod
    def delete(db: Session, elective_id: int, user):
        elective = db.query(ElectiveSub).filter(ElectiveSub.id == elective_id).first()
        if not elective:
            raise HTTPException(status_code=404, detail="Elective subject not found")

        db.delete(elective)
        db.commit()

        log_action(
            db=db,
            user_id=user.id,
            action="DELETE",
            table_name="elective_subjects",
            record_id=elective_id,
            old_data={"id": elective_id},
            new_data=None,
        )

    @staticmethod
    def update(db: Session, data: ElectiveSubUpdate, user):
        elective = db.query(ElectiveSub).filter(ElectiveSub.id == data.id).first()
        if not elective:
            raise HTTPException(status_code=404, detail="Elective subject not found")

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(elective, key, value)

        db.commit()
        db.refresh(elective)

        log_action(
            db=db,
            user_id=user.id,
            action="UPDATE",
            table_name="elective_subjects",
            record_id=elective_id,
            old_data=elective.__dict__,
            new_data=data.model_dump(exclude_unset=True),
        )

        return elective
