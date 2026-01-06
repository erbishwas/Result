from decimal import Decimal
from datetime import datetime, date
from sqlalchemy.orm.state import InstanceState

def json_safe(data):
    # 🧹 REMOVE SQLAlchemy internal state
    if isinstance(data, InstanceState):
        return None

    if isinstance(data, dict):
        return {k: json_safe(v) for k, v in data.items() if k != "_sa_instance_state"}
    elif isinstance(data, list):
        return [json_safe(i) for i in data]
    elif isinstance(data, Decimal):
        return float(data)
    elif isinstance(data, (datetime, date)):
        return data.isoformat()
    else:
        return data
