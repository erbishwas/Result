from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    password: str
    grade_code: str | None = None
    is_admin: bool = False


class UserUpdate(BaseModel):
    username: str | None = None
    grade_code: str | None = None
    is_admin: bool | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserMini(BaseModel):
    id: int
    username: str
    grade_code: str | None = None
    is_admin: bool

    class Config:
        from_attributes = True

class PasswordReset(BaseModel):
    user_id: int
    new_password: str
