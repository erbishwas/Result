from fastapi import Depends, HTTPException, status, Request
from src.routes.auth.dependencies import get_current_user

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
