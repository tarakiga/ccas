"""Alert API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertFilters
from app.schemas.common import ErrorResponse, Page
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get(
    "",
    response_model=Page[AlertResponse],
)
async def list_alerts(
    shipment_id: Optional[int] = None,
    severity: Optional[str] = None,
    is_acknowledged: Optional[bool] = None,
    page: int = 1,
    size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List alerts for the current user or filtered by query parameters.
    
    Query parameters:
    - shipment_id: Filter by shipment ID
    - severity: Filter by severity (warning, critical, urgent)
    - is_acknowledged: Filter by acknowledgment status
    - page: Page number (default: 1)
    - size: Page size (default: 50, max: 100)
    """
    # Limit page size to prevent excessive data retrieval
    size = min(size, 100)
    
    filters = AlertFilters(
        shipment_id=shipment_id,
        severity=severity,
        is_acknowledged=is_acknowledged,
    )
    
    alert_service = AlertService(db)
    return alert_service.list_user_alerts(current_user, filters, page, size)


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Alert not found"},
    }
)
async def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get alert details by ID."""
    alert_service = AlertService(db)
    alert = alert_service.get_alert(alert_id, current_user)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Alert with ID {alert_id} not found",
                "details": []
            }
        )
    
    return alert


@router.patch(
    "/{alert_id}/acknowledge",
    response_model=AlertResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Alert not found"},
    }
)
async def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Acknowledge an alert.
    
    Sets is_acknowledged to True and records the acknowledgment timestamp.
    """
    alert_service = AlertService(db)
    alert = alert_service.acknowledge_alert(alert_id, current_user)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Alert with ID {alert_id} not found",
                "details": []
            }
        )
    
    return alert
