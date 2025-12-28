from pydantic import BaseModel
from typing import Optional

class YearBase(BaseModel):
    year: str
    is_current: Optional[bool] = False


class YearCreate(YearBase):
    pass


class YearUpdate(BaseModel):
    is_current: bool


class YearResponse(YearBase):
    id: int

    class Config:
        from_attributes = True
