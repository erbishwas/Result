from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.config.database import get_db
from .schema import YearCreate, YearResponse
from .service import YearService
from src.config.dependencies import admin_only, read_only_or_admin
from src.routes.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/years",
    tags=["Year"],
    dependencies=[Depends(read_only_or_admin)],
    
)


@router.post("/", response_model=YearResponse, dependencies=[Depends(admin_only)])
def create_year(data: YearCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return YearService.create_year(db, data, user_id=current_user.id)


@router.get("/", response_model=list[YearResponse])
def get_years(db: Session = Depends(get_db)):
    return YearService.get_all(db)


@router.patch("/{year_id}/set-current", response_model=YearResponse , dependencies=[Depends(admin_only)])
def set_current_year(year_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    year = YearService.set_current_year(db, year_id, user_id=current_user.id)
    if not year:
        raise HTTPException(status_code=404, detail="Year not found")
    return year

@router.get("/current", response_model=YearResponse)
def get_current_year(db: Session = Depends(get_db)):
    year = YearService.get_current(db)
    if not year:
        raise HTTPException(status_code=404, detail="Current year not found")
    return year

@router.delete("/{year_id}", status_code=204, dependencies=[Depends(admin_only)])
def delete_year(year_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    YearService.delete_year(db, year_id, user_id=current_user.id)
    return None
