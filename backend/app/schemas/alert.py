"""Pydantic schemas for alert request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class AlertSeverity(str, Enum):
    """Alert severity enumeration."""
    WARNING = "warning"
    CRITICAL = "critical"
    URGENT = "urgent"


class AlertResponse(BaseModel):
    """
    Schema for alert response with shipment and step details.
    
    Alerts are automatically generated when critical workflow steps are at risk
    of missing deadlines. Severity escalates based on days post-ETA.
    """
    
    id: int = Field(..., description="Unique database identifier for the alert")
    shipment_id: int = Field(..., description="ID of the shipment this alert relates to")
    workflow_step_id: int = Field(..., description="ID of the workflow step that triggered this alert")
    recipient_user_id: int = Field(..., description="User ID of the person who should receive this alert")
    severity: AlertSeverity = Field(
        ...,
        description="Alert severity level: warning (Day 4), critical (Day 5), urgent (Day 6-7)"
    )
    message: str = Field(
        ...,
        description="Human-readable alert message describing the issue",
        examples=["Critical step 'Bayan approval' is incomplete on Day 5 post-ETA for shipment SHP-2024-001"]
    )
    days_post_eta: int = Field(
        ...,
        description="Number of days after ETA when alert was created. Used for escalation logic (Day 4=warning, Day 5=critical, Day 6-7=urgent)",
        ge=0
    )
    is_acknowledged: bool = Field(
        ...,
        description="Whether the recipient has acknowledged this alert"
    )
    acknowledged_at: Optional[datetime] = Field(
        None,
        description="Timestamp when alert was acknowledged (null if not acknowledged)"
    )
    email_sent: bool = Field(
        ...,
        description="Whether email notification has been successfully sent"
    )
    email_sent_at: Optional[datetime] = Field(
        None,
        description="Timestamp when email was successfully sent (null if not sent)"
    )
    email_retry_count: int = Field(
        ...,
        description="Number of times email sending has been retried (max 3 retries)",
        ge=0,
        le=3
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when alert was created (ISO 8601 format)"
    )
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "shipment_id": 1,
                "workflow_step_id": 5,
                "recipient_user_id": 2,
                "severity": "critical",
                "message": "Critical step 'Bayan approval' is incomplete on Day 5 post-ETA for shipment SHP-2024-001",
                "days_post_eta": 5,
                "is_acknowledged": False,
                "acknowledged_at": None,
                "email_sent": True,
                "email_sent_at": "2024-10-21T08:00:00Z",
                "email_retry_count": 0,
                "created_at": "2024-10-21T08:00:00Z"
            }
        }
    )


class AlertFilters(BaseModel):
    """Schema for filtering alerts in query endpoints."""
    
    severity: Optional[AlertSeverity] = Field(None, description="Filter by alert severity")
    is_acknowledged: Optional[bool] = Field(None, description="Filter by acknowledgment status")
    shipment_id: Optional[int] = Field(None, description="Filter by specific shipment")
    recipient_user_id: Optional[int] = Field(None, description="Filter by recipient user")
    days_post_eta_min: Optional[int] = Field(None, ge=0, description="Filter by minimum days post-ETA")
    days_post_eta_max: Optional[int] = Field(None, ge=0, description="Filter by maximum days post-ETA")
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    size: int = Field(50, ge=1, le=100, description="Page size (max 100)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "severity": "critical",
                "is_acknowledged": False,
                "recipient_user_id": 2,
                "days_post_eta_min": 4,
                "days_post_eta_max": 7,
                "page": 1,
                "size": 50
            }
        }
    )
