
from sqlalchemy.orm import Session
from .model import AuditLog
from .utils import json_safe

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
        old_data=json_safe(old_data),
        new_data=json_safe(new_data),
    )
    db.add(log)
    db.commit()
