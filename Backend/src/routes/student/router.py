from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.dependencies import user_only
from src.routes.auth.dependencies import get_current_user
from src.routes.auth.model import User

from .schema import StudentCreate, StudentUpdate, StudentResponse
from .service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("/", response_model=StudentResponse, dependencies=[Depends(user_only)])
def create_student(data: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return StudentService.create_student(db, data, current_user)


@router.get("/", response_model=list[StudentResponse], dependencies=[Depends(user_only)])
def get_all_students(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return StudentService.get_all(db, current_user)


@router.get("/{student_id}", response_model=StudentResponse, dependencies=[Depends(user_only)])
def get_student(student_id: int, db: Session = Depends(get_db)):
    return StudentService.get_by_id(db, student_id)


@router.put("/{student_id}", response_model=StudentResponse, dependencies=[Depends(user_only)])
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return StudentService.update_student(db, student_id, data, current_user)


@router.patch("/{student_id}/toggle-active", response_model=StudentResponse, dependencies=[Depends(user_only)])
def toggle_student(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return StudentService.toggle_active(db, student_id, current_user)
