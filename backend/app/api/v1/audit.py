"""Audit log API endpoints."""

from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user, require_audit_access
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse, AuditLogFilters
from app.schemas.common import Page, ErrorResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get(
    "",
    response_model=Page[AuditLogResponse],
    responses={
        403: {"model": ErrorResponse, "description": "Forbidden - Admin or IA role required"},
    }
)
async def list_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
    date_start: Optional[date] = None,
    date_end: Optional[date] = None,
    page: int = 1,
    size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_audit_access),
):
    """
    Query audit logs with filters and pagination.
    
    Restricted to Admin and IA roles.
    
    Query parameters:
    - entity_type: Filter by entity type (e.g., "shipment", "workflow_step")
    - entity_id: Filter by entity ID
    - user_id: Filter by user who made the change
    - date_start: Filter by start date
    - date_end: Filter by end date
    - page: Page number (default: 1)
    - size: Page size (default: 50)
    """
    filters = AuditLogFilters(
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user_id,
        date_start=date_start,
        date_end=date_end,
    )
    
    audit_service = AuditService(db)
    return audit_service.query_logs(filters, page, size)


@router.get(
    "/shipment/{shipment_id}",
    response_model=list[AuditLogResponse],
    responses={
        403: {"model": ErrorResponse, "description": "Forbidden - Admin or IA role required"},
        404: {"model": ErrorResponse, "description": "Shipment not found"},
    }
)
async def get_shipment_audit_trail(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_audit_access),
):
    """
    Get complete audit trail for a specific shipment.
    
    Restricted to Admin and IA roles.
    """
    audit_service = AuditService(db)
    logs = audit_service.get_shipment_audit_trail(shipment_id)
    
    if not logs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"No audit logs found for shipment ID {shipment_id}",
                "details": []
            }
        )
    
    return logs
