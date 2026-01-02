from fastapi import Depends, HTTPException, status, Request
from src.routes.auth.dependencies import get_current_user
from src.routes.grade.service import GradeService
from src.routes.auth.service import UserService
from sqlalchemy.orm import Session

def admin_only(user=Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permission required"
        )
    return user


def read_only_or_admin(request: Request, user=Depends(get_current_user)):
    # Admin can do anything
    if user.is_admin:
        return user

    # Non-admins: allow GET only
    if request.method == "GET":
        return user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Read-only access"
    )

def user_only(request: Request, user=Depends(get_current_user)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )





def check_user_validation_for_grade(db:Session ,user, grade_id: int):
        if user.is_admin:
            if not (UserService.get_admin_selected_grade(db,user.id).id==grade_id):
                raise HTTPException(status_code=403, detail="You are not allowed to work for this grade as Admin.")
        elif not user.is_admin:
            if GradeService.get_by_id(db, grade_id).grade_teacher_id != user.id:
                raise HTTPException(status_code=403, detail="You are not allowed to work for this grade.")