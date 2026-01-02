from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.dependencies import admin_only, get_current_user, read_only_or_admin
from .schema import GradeCreate, GradeUpdate, GradeOut, GradeOutNormal
from .service import GradeService
from src.routes.auth.service import UserService
from src.routes.auth.schema import UserMini

router = APIRouter(prefix="/grades", tags=["Grades"])




@router.post("/", response_model=GradeOut, dependencies=[Depends(admin_only)])
def create_grade(
    data: GradeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return GradeService.create(db, data, current_user.id)


@router.put("/{grade_id}", response_model=GradeOut, dependencies=[Depends(admin_only)])
def update_grade(
    grade_id: int,
    data: GradeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return GradeService.update(db, grade_id, data, current_user.id)


@router.get("/", response_model=list[GradeOutNormal])
def get_grades(
    db: Session = Depends(get_db),
):
    return GradeService.get_all(db)

    
@router.get("/available-grade-teachers", response_model=list[UserMini], dependencies=[Depends(admin_only)])
def available_grade_teachers(
    db: Session = Depends(get_db),
):
    return UserService.get_available_grade_teachers(db)




@router.patch("/{grade_id}/toggle-active", response_model=GradeOut, dependencies=[Depends(admin_only)])
def toggle_grade_active(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    data = GradeService.toggle_active(db, grade_id, current_user.id)
    return data

@router.get("/grade-by-user", response_model=GradeOut, dependencies=[Depends(read_only_or_admin)])
def get_grade_by_user(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    grade = GradeService.get_grade_by_user(current_user, db)

    
    if not grade:
        raise HTTPException(status_code=404, detail="You are not assigned to any grade yet ")
    return grade


@router.get("/{grade_id}", response_model=GradeOut, dependencies=[Depends(read_only_or_admin)])
def get_grade(
    grade_id: int,
    db: Session = Depends(get_db),
):
    return GradeService.get_by_id(db, grade_id)