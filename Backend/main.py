from fastapi import FastAPI

from src.config.database import engine, Base
from src.routes.auth.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from src.routes.year.router import router as year_router
from src.routes.grade.router import router as grade_router



Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Authentication Based FastAPI Project",
    description="FastAPI + MySQL with JWT Authentication",
    version="1.0.0"
)


app.include_router(auth_router)
app.include_router(year_router)
app.include_router(grade_router)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "API is running",
        "auth": "/auth/login",
        "docs": "/docs"
    }
