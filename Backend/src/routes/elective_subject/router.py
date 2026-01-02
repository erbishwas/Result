from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.routes.auth.dependencies import get_current_user
from src.routes.auth.model import User
from src.config.dependencies import user_only

from .schema import ElectiveSubCreate, ElectiveSubResponse
from .service import ElectiveSubService

router = APIRouter(prefix="/electives", tags=["Elective Subjects"])


@router.post("/", response_model=ElectiveSubResponse, dependencies=[Depends(user_only)])
def create_elective(data: ElectiveSubCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ElectiveSubService.create(db, data, current_user)


@router.get("/", response_model=list[ElectiveSubResponse], dependencies=[Depends(user_only)])
def get_all(db: Session = Depends(get_db)):
    return ElectiveSubService.get_all(db)


@router.get("/student/{student_id}", response_model=list[ElectiveSubResponse], dependencies=[Depends(user_only)])
def get_student_electives(student_id: int, db: Session = Depends(get_db)):
    return ElectiveSubService.get_by_student(db, student_id)


@router.delete("/{elective_id}", dependencies=[Depends(user_only)])
def delete_elective(elective_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ElectiveSubService.delete(db, elective_id, current_user)
    return {"message": "Elective removed"}
