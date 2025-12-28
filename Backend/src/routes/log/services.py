
from sqlalchemy.orm import Session
from .model import AuditLog

def log_action(
    db: Session,
    *,
    user_id: int,
    action: str,
    table_name: str,
    record_id: int,
    old_data: dict | None = None,
    new_data: dict | None = None,
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data,
    )
    db.add(log)
    db.commit()
