"""Workflow action log schemas for API requests and responses."""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional


class WorkflowActionLogBase(BaseModel):
    """Base workflow action log schema."""
    shipment_id: str = Field(..., description="Shipment ID")
    step_number: str = Field(..., description="Workflow step number")
    action: str = Field(..., description="Action performed")
    performed_by: str = Field(..., description="User who performed the action")
    performed_at: datetime = Field(..., description="When the action was performed")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional action data")


class WorkflowActionLogCreate(WorkflowActionLogBase):
    """Schema for creating a new workflow action log."""
    pass


class WorkflowActionLog(WorkflowActionLogBase):
    """Schema for workflow action log response."""
    id: str = Field(..., description="Action log ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    model_config = {"from_attributes": True}


class WorkflowActionLogList(BaseModel):
    """Schema for paginated workflow action log list response."""
    items: list[WorkflowActionLog] = Field(..., description="List of action logs")
    total: int = Field(..., description="Total number of action logs")
