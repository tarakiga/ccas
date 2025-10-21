"""Pydantic schemas for workflow step request/response validation."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from enum import Enum


class StepStatus(str, Enum):
    """Workflow step status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class WorkflowStepResponse(BaseModel):
    """
    Schema for workflow step response with all fields.
    
    Each shipment has 34 workflow steps that must be completed in sequence.
    Steps are assigned to specific users (PPR and APR) and departments.
    """
    
    id: int = Field(..., description="Unique database identifier for the workflow step")
    shipment_id: int = Field(..., description="ID of the shipment this step belongs to")
    step_number: Decimal = Field(
        ...,
        description="Sequential step number (e.g., 9.0, 10.0, 11.0). Decimal format allows for sub-steps if needed.",
        examples=["9.0", "10.0", "11.0"]
    )
    step_name: str = Field(
        ...,
        description="Name of the workflow step",
        examples=["Bayan submission", "Customs duty payment", "DO payment"]
    )
    description: Optional[str] = Field(
        None,
        description="Detailed description of what needs to be done in this step"
    )
    department: str = Field(
        ...,
        description="Department responsible for completing this step",
        examples=["C&C", "Finance", "Business Unit", "Stores"]
    )
    target_date: date = Field(
        ...,
        description="Target completion date calculated as: shipment.eta + offset_days. Recalculated when ETA changes."
    )
    offset_days: int = Field(
        ...,
        description="Number of days from ETA to calculate target date. Used for recalculation when ETA changes.",
        examples=[0, 3, 4, 6, 7]
    )
    actual_date: Optional[date] = Field(
        None,
        description="Actual completion date logged by PPR or APR. Null if step is not yet completed."
    )
    status: StepStatus = Field(
        ...,
        description="Current status of the step (pending, completed, overdue)"
    )
    is_critical: bool = Field(
        ...,
        description="Whether this step is critical for demurrage prevention. Critical steps trigger alerts if incomplete by Day 7."
    )
    ppr_user_id: int = Field(
        ...,
        description="Primary Person Responsible - User ID of the main person assigned to complete this step"
    )
    apr_user_id: Optional[int] = Field(
        None,
        description="Alternate Person Responsible - User ID of the backup person who can complete this step"
    )
    created_at: datetime = Field(..., description="Timestamp when step was created (ISO 8601 format)")
    updated_at: datetime = Field(..., description="Timestamp when step was last updated (ISO 8601 format)")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "shipment_id": 1,
                "step_number": "9.0",
                "step_name": "Bayan submission",
                "description": "Submit customs declaration (Bayan) to customs authority",
                "department": "C&C",
                "target_date": "2024-12-01",
                "offset_days": 0,
                "actual_date": None,
                "status": "pending",
                "is_critical": True,
                "ppr_user_id": 2,
                "apr_user_id": 3,
                "created_at": "2024-10-21T10:00:00Z",
                "updated_at": "2024-10-21T10:00:00Z"
            }
        }
    )


class WorkflowStepComplete(BaseModel):
    """
    Schema for marking a workflow step as complete.
    
    Only users assigned as PPR or APR for the step can mark it complete.
    The actual date cannot be in the future.
    """
    
    actual_date: date = Field(
        ...,
        description="Date when the step was actually completed. Must not be in the future. Format: YYYY-MM-DD",
        examples=["2024-10-21", "2024-12-01"]
    )
    
    @field_validator("actual_date")
    @classmethod
    def validate_actual_date_not_future(cls, v: date) -> date:
        """
        Validate that actual_date is not in the future.
        
        Business rule: Steps can only be marked complete with past or current dates.
        """
        today = date.today()
        if v > today:
            raise ValueError(f"Actual date cannot be in the future. Today is {today}")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "actual_date": "2024-10-21"
            }
        }
    )


class StepFilters(BaseModel):
    """Schema for filtering workflow steps in user tasks endpoint."""
    
    status: Optional[StepStatus] = Field(None, description="Filter by step status")
    department: Optional[str] = Field(None, description="Filter by department")
    is_critical: Optional[bool] = Field(None, description="Filter by critical steps only")
    target_date_start: Optional[date] = Field(None, description="Filter by target date start (inclusive)")
    target_date_end: Optional[date] = Field(None, description="Filter by target date end (inclusive)")
    shipment_id: Optional[int] = Field(None, description="Filter by specific shipment")
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    size: int = Field(50, ge=1, le=100, description="Page size (max 100)")
    
    @field_validator("target_date_end")
    @classmethod
    def validate_date_range(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that target_date_end is after target_date_start if both provided."""
        if v is not None and "target_date_start" in info.data and info.data["target_date_start"] is not None:
            if v < info.data["target_date_start"]:
                raise ValueError("target_date_end must be after or equal to target_date_start")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "pending",
                "department": "C&C",
                "is_critical": True,
                "target_date_start": "2024-10-01",
                "target_date_end": "2024-12-31",
                "page": 1,
                "size": 50
            }
        }
    )
