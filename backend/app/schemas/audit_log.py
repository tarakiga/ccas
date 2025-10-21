"""Pydantic schemas for audit log request/response validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class AuditLogResponse(BaseModel):
    """Schema for audit log response with all fields."""
    
    id: int
    entity_type: str = Field(..., description="Type of entity (e.g., 'shipment', 'workflow_step')")
    entity_id: int = Field(..., description="ID of the entity that was modified")
    field_name: str = Field(..., description="Name of the field that was changed")
    old_value: Optional[str] = Field(None, description="Previous value (JSON serialized)")
    new_value: Optional[str] = Field(None, description="New value (JSON serialized)")
    user_id: int = Field(..., description="ID of user who made the change")
    ip_address: Optional[str] = Field(None, description="IP address of the user")
    created_at: datetime = Field(..., description="Timestamp when the change was made")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "entity_type": "shipment",
                "entity_id": 1,
                "field_name": "eta",
                "old_value": "2024-12-01",
                "new_value": "2024-12-05",
                "user_id": 2,
                "ip_address": "192.168.1.100",
                "created_at": "2024-10-21T10:30:00Z"
            }
        }
    )


class AuditLogFilters(BaseModel):
    """Schema for filtering audit logs with entity_type, entity_id, user_id, date_range filters."""
    
    entity_type: Optional[str] = Field(None, description="Filter by entity type (e.g., 'shipment', 'workflow_step')")
    entity_id: Optional[int] = Field(None, description="Filter by specific entity ID")
    user_id: Optional[int] = Field(None, description="Filter by user who made changes")
    field_name: Optional[str] = Field(None, description="Filter by specific field name")
    date_start: Optional[datetime] = Field(None, description="Filter by start date/time (inclusive)")
    date_end: Optional[datetime] = Field(None, description="Filter by end date/time (inclusive)")
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    size: int = Field(50, ge=1, le=100, description="Page size (max 100)")
    
    @field_validator("date_end")
    @classmethod
    def validate_date_range(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that date_end is after date_start if both provided."""
        if v is not None and "date_start" in info.data and info.data["date_start"] is not None:
            if v < info.data["date_start"]:
                raise ValueError("date_end must be after or equal to date_start")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "entity_type": "shipment",
                "entity_id": 1,
                "user_id": 2,
                "field_name": "eta",
                "date_start": "2024-10-01T00:00:00Z",
                "date_end": "2024-10-31T23:59:59Z",
                "page": 1,
                "size": 50
            }
        }
    )
