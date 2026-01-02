from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.dependencies import admin_only, read_only_or_admin, user_only
from src.routes.auth.dependencies import get_current_user
from src.routes.auth.model import User

from .schema import SubjectCreate, SubjectUpdate, SubjectBase,SubjectResponse
from .service import SubjectService

router = APIRouter(prefix="/subjects", tags=["Subjects"])


# ---------------- CREATE ----------------
@router.post("/", response_model=SubjectBase,  dependencies=[Depends(user_only)])
def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SubjectService.create_subject(db, data, current_user)


# ---------------- GET ALL ----------------
@router.get("/", response_model=list[SubjectResponse] , dependencies=[Depends(user_only)])
def get_all_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SubjectService.get_all(db, current_user)


# ---------------- GET BY ID ----------------
@router.get("/{subject_id}", response_model=SubjectBase,  dependencies=[Depends(user_only)])
def get_subject_by_id(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SubjectService.get_by_id(db, subject_id)


# ---------------- GET ELECTIVE ----------------
@router.get("/elective/list", response_model=list[SubjectBase],  dependencies=[Depends(user_only)])
def get_elective_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SubjectService.get_elective(db, current_user.id)


# ---------------- UPDATE ----------------
@router.put("/{subject_id}", response_model=SubjectBase,  dependencies=[Depends(user_only)])
def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return SubjectService.update_subject(db, subject_id, data, current_user)

@router.patch("/{subject_id}/toggle-active", response_model=SubjectResponse, dependencies=[Depends(user_only)])
def toggle_subject_active(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    data = SubjectService.toggle_active(db, subject_id, current_user)
    return data
