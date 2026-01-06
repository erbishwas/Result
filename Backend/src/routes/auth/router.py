from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.routes.auth import schema
from src.routes.auth.model import User
from src.routes.auth.schema import UserRegister
from src.config.dependencies import admin_only,read_only_or_admin
from src.routes.auth.dependencies import get_current_user
from src.routes.auth.service import UserService
from src.routes.grade.schema import GradeBase


router = APIRouter(prefix="/auth", tags=["Authentication"])

# -------- Register --------
@router.post("/register", dependencies=[Depends(admin_only)])
def register(user: schema.UserRegister, db: Session = Depends(get_db), current_user:User= Depends(get_current_user)):
    return UserService.user_register(db, current_user, user)

# -------- Login --------
@router.post("/login", response_model=schema.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = UserService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = UserService.create_access_token(user)
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/allusers", response_model=list[schema.UserMini], dependencies=[Depends(read_only_or_admin)])
def all_users(
    db: Session = Depends(get_db)
):
    users = UserService.get_all(db)
    if not users:
        raise HTTPException(status_code=404, detail="User not found")
    return users

@router.post("/change-password", dependencies=[Depends(read_only_or_admin)])
def change_password_endpoint(
    current_user:User= Depends(get_current_user),
    old_password: str = None,
    new_password: str=  None,
    db: Session = Depends(get_db)
):
    result = UserServicechange_password(db, current_user.id, old_password, new_password)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/reset-password", dependencies=[Depends(admin_only)])
def reset_user_password_endpoint(
    data:schema.PasswordReset,
    current_user:User= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = UserService.reset_password(db, current_user.id, data.user_id, data.new_password)
   
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.delete("/{user_id}/delete-user", dependencies=[Depends(admin_only)])
def delete_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    current_user:User= Depends(get_current_user),
):
    
    result = UserService.delete(db,current_user.id, user_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.patch("/users/{user_id}", dependencies=[Depends(admin_only)])
def update_user_endpoint(
    user_id: int,
    data: schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user:User= Depends(get_current_user),
):
    return UserService.update(db,current_user.id, user_id, data)

@router.post("/grades/select/{grade_id}", dependencies=[Depends(admin_only)])
def select_grade_endpoint(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user:User= Depends(get_current_user),
):
    return UserService.admin_manage_grade(db, current_user.id, grade_id)

@router.get("/grade/selected", dependencies=[Depends(admin_only)],response_model=GradeBase)
def get_selected_grade_endpoint(
    db: Session = Depends(get_db),
    current_user:User= Depends(get_current_user),
):
    return UserService.get_admin_selected_grade(db, current_user.id)