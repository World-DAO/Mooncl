import asyncio, json
from typing import Any, Dict, Tuple

def safe_parse_json(s: str, default: Dict[str, Any] | None = None) -> Dict[str, Any]:
    if default is None:
        default = {}
    try:
        return json.loads(s)
    except Exception:
        return default