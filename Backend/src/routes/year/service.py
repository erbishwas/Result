from sqlalchemy.orm import Session
from fastapi import HTTPException
from .model import Year
from .schema import YearCreate
from src.routes.log.services import log_action


class YearService:

    # ---------------- CREATE ----------------
    @staticmethod
    def create_year(db: Session, data: YearCreate, user_id: int):
        # if new year is current → unset others
        if data.is_current:
            db.query(Year).update({Year.is_current: False})

        year = Year(**data.dict())
        db.add(year)
        db.commit()
        db.refresh(year)

        log_action(
            db=db,
            user_id=user_id,
            action="CREATE",
            table_name="years",
            record_id=year.id,
            old_data=None,
            new_data={
                "year": year.year,
                "is_current": year.is_current,
            },
        )

        return year

    # ---------------- SET CURRENT ----------------
    @staticmethod
    def set_current_year(db: Session, year_id: int, user_id: int):
        year = db.query(Year).filter(Year.id == year_id).first()
        if not year:
            raise HTTPException(status_code=404, detail="Year not found")

        # capture old state
        old_data = {
            "year": year.year,
            "is_current": year.is_current,
        }

        # unset all
        db.query(Year).update({Year.is_current: False})

        # set selected
        year.is_current = True
        db.commit()
        db.refresh(year)

        log_action(
            db=db,
            user_id=user_id,
            action="UPDATE",
            table_name="years",
            record_id=year.id,
            old_data=old_data,
            new_data={
                "year": year.year,
                "is_current": year.is_current,
            },
        )

        return year

    # ---------------- GETTERS ----------------
    @staticmethod
    def get_all(db: Session):
        return db.query(Year).order_by(Year.year.desc()).all()

    @staticmethod
    def get_current(db: Session):
        return db.query(Year).filter(Year.is_current == True).first()

    # ---------------- DELETE ----------------
    @staticmethod
    def delete_year(db: Session, year_id: int, user_id: int):
        year = db.query(Year).filter(Year.id == year_id).first()
        if not year:
            raise HTTPException(status_code=404, detail="Year not found")

        old_data = {
            "year": year.year,
            "is_current": year.is_current,
        }

        db.delete(year)
        db.commit()

        log_action(
            db=db,
            user_id=user_id,
            action="DELETE",
            table_name="years",
            record_id=year_id,
            old_data=old_data,
            new_data=None,
        )
