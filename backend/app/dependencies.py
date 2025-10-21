"""Dependency injection functions for FastAPI."""

from typing import Generator
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import (
    get_current_user,
    get_token_payload,
    require_write_access,
    require_eta_update_permission,
    require_audit_access,
)

# Re-export common dependencies for convenience
__all__ = [
    "get_db",
    "get_current_user",
    "get_token_payload",
    "require_write_access",
    "require_eta_update_permission",
    "require_audit_access",
]
