
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from src.config.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    action = Column(String(20), nullable=False)  # UPDATE / DELETE
    table_name = Column(String(100), nullable=False)
    record_id = Column(Integer, nullable=False)

    old_data = Column(JSON, nullable=True)
    new_data = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
