from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from src.routes.auth.model import User
from src.routes.grade.model import Grade
from src.routes.auth import schema
from src.config.security import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from src.routes.log.services import log_action
from .dependencies import get_current_user


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    # ---------- Password ----------
    @staticmethod
    def hash_password(password: str):
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    # ---------- Auth ----------
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str):
        user = db.query(User).filter(User.username == username).first()
        if not user or not UserService.verify_password(password, user.password):
            return None
        return user

    # ---------- JWT ----------
    @staticmethod
    def create_access_token(user: User):
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user.username,
            "is_admin": user.is_admin,
            "exp": expire,
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # ---------- Grade Teachers ----------
    @staticmethod
    def get_available_grade_teachers(db: Session):
        subquery = (
            db.query(Grade.grade_teacher_id)
            .filter(Grade.grade_teacher_id.isnot(None))
            .subquery()
        )

        return (
            db.query(User.id, User.username, User.grade_code, User.is_admin)
            .filter(User.id.notin_(subquery))
            .filter(User.is_admin == False)
            .order_by(User.username)
            .all()
        )

    # ---------- Users ----------
    @staticmethod
    def get_all(db: Session):
        return (
            db.query(User.id, User.username, User.grade_code, User.is_admin)
            #.order_by(User.username)
            .order_by(User.is_admin.desc())
            .order_by(User.username)
            .all()
        )

    # ---------- Change Own Password ----------
    @staticmethod
    def change_password(
        db: Session,
        user_id: int,
        old_password: str,
        new_password: str
    ):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not UserService.verify_password(old_password, user.password):
            raise HTTPException(status_code=400, detail="Incorrect old password")

        user.password = UserService.hash_password(new_password)

        db.commit()

        log_action(
            db=db,
            user_id=user_id,
            action="PASSWORD_CHANGE",
            table_name="users",
            record_id=user.id,
        )

        return {"success": True, "message": "Password changed successfully"}

    # ---------- Reset Password (Admin) ----------
    @staticmethod
    def reset_password(
        db: Session,
        admin_id: int,
        target_user_id: int,
        new_password: str
    ):
        print( "target_user_id:", target_user_id)
        target_user = db.query(User).filter(User.id == target_user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="Target user not found")

        if target_user.is_admin and admin_id != 1:
            raise HTTPException(status_code=400, detail="Only super admin can reset admin passwords")
        if target_user.id == 1:
            raise HTTPException(status_code=400, detail="Cannot reset super admin password")


        old_data = {"username": target_user.username}

        target_user.password = UserService.hash_password(new_password)
        db.commit()

        log_action(
            db=db,
            user_id=admin_id,
            action="PASSWORD_RESET",
            table_name="users",
            record_id=target_user.id,
            old_data=old_data,
        )

        return {
            "success": True,
            "message": f"Password for user '{target_user.username}' reset successfully",
        }

    # ---------- Update User ----------
    @staticmethod
    def update(
        db: Session,
        user_id: int,
        target_user_id: int,
        data: schema.UserUpdate
    ):
        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.id == 1:
            raise HTTPException(status_code=400, detail="Cannot update super admin account")
        elif user_id == target_user_id:
            raise HTTPException(status_code=400, detail="Cannot update own account")
        elif user.is_admin and user_id != 1:
            raise HTTPException(status_code=400, detail="Cannot update admin account")
        elif data.is_admin and user_id != 1:
            raise HTTPException(status_code=400, detail="Only super admin can grant admin rights")


        old_data = {
            "username": user.username,
            "grade_code": user.grade_code,
            "is_admin": user.is_admin,
        }

        for key, value in data.dict().items():
            setattr(user, key, value)

        db.commit()
        db.refresh(user)

        log_action(
            db=db,
            user_id=user_id,
            action="UPDATE",
            table_name="users",
            record_id=user.id,
            old_data=old_data,
            new_data=data.dict(),
        )

        return user

    # ---------- Delete User ----------
    @staticmethod
    def delete(db: Session, user_id: int, target_user_id: int):

        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        is_grade_teacher = (
            db.query(Grade)
            .filter(Grade.grade_teacher_id == user.id)
            .first()
        )
        if is_grade_teacher:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete user assigned as a grade teacher"
            )
        elif user_id == user.id:
            raise HTTPException(status_code=400, detail="Cannot delete own account")
        elif user.id == 1:
            raise HTTPException(status_code=400, detail="Cannot delete super admin account")
        elif user.is_admin and user_id != 1:
            raise HTTPException(status_code=400, detail="Cannot delete  admin account")

        old_data = {"username": user.username}

        db.delete(user)
        db.commit()

        log_action(
            db=db,
            user_id=user_id,
            action="DELETE",
            table_name="users",
            record_id=target_user_id,
            old_data=old_data,
        )

        return {"success": True, "message": "User deleted successfully"}

    @staticmethod
    def user_register(
        db: Session,
        current_user: User,
        user: schema.UserRegister
    ):
        if db.query(User).filter(User.username == user.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")

        new_user = User(
            username=user.username,
            password=UserService.hash_password(user.password),
            grade_code=user.grade_code,
            is_admin=user.is_admin
        )
        if new_user.is_admin and current_user.id != 0:
            raise HTTPException(status_code=400, detail="Only super admin can create admin users")  

        old_data = {}

        db.add(new_user)
        db.commit()

        log_action(
            db=db,
            user_id=current_user.id,
            action="CREATE",
            table_name="users",
            record_id=new_user.id,
            old_data=old_data,
            new_data={
                "username": new_user.username,
                "grade_code": new_user.grade_code,
                "is_admin": new_user.is_admin,
            },
        )
        return {"message": "User registered successfully"}

    @staticmethod
    def admin_manage_grade(
        db: Session,
        admin_id: int,
        grade_id: int
    ):
        user = db.query(User).filter(User.id == admin_id).first()
        grade = db.query(Grade).filter(Grade.id == grade_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not grade:
            raise HTTPException(status_code=404, detail="Grade not found")
        

        old_data = {
            "username": user.id,
            "grade_code": user.grade_code,
        }

        user.grade_code = grade.id
        db.commit()
        db.refresh(user)

        log_action(
            db=db,
            user_id=admin_id,
            action="ASSIGN_GRADE",
            table_name="users",
            record_id=user.id,
            old_data=old_data,
            new_data={
                "grade_code": user.grade_code,
            },
        )

        return {"success": True, "message": f"Grade '{grade.name}' assigned to user '{user.username}' successfully"}
    @staticmethod
    def get_admin_selected_grade(
        db: Session,
        admin_id: int,
    ):
        user = db.query(User).filter(User.id == admin_id).first()
        grade= db.query(Grade).filter(Grade.id == user.grade_code).first()          

        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not grade:
            raise HTTPException(status_code=404, detail="Any Grade is not assigned to you")  
        
        return grade

        
    @staticmethod
    def get_user_by_id(
        db: Session,
        user_id: int,
    ):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    