"""Workflow step template model for storing step definitions."""

from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, Text

from app.database import Base


class WorkflowStepTemplate(Base):
    """
    Workflow step template model.
    
    Stores the 34 predefined workflow steps that are used to generate
    workflow steps for each shipment. This allows for easy modification
    of step definitions without code changes.
    """
    
    __tablename__ = "workflow_step_templates"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Step identification
    step_number = Column(Numeric(precision=10, scale=1), unique=True, nullable=False, index=True)
    step_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Step configuration
    department = Column(String(50), nullable=False, index=True)
    offset_days = Column(Integer, nullable=False)
    is_critical = Column(Boolean, default=False, nullable=False)
    
    # Ordering
    display_order = Column(Integer, nullable=False, index=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f"<WorkflowStepTemplate(step_number={self.step_number}, step_name='{self.step_name}')>"
