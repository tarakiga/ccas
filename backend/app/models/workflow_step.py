"""WorkflowStep model for tracking clearance process steps."""

from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Boolean, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class StepStatus(str, enum.Enum):
    """Workflow step status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class WorkflowStep(Base):
    """WorkflowStep model with target date calculation."""
    
    __tablename__ = "workflow_steps"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Shipment relationship
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    
    # Step information
    step_number = Column(Numeric(4, 1), nullable=False)  # e.g., 9.0, 10.0
    step_name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    department = Column(String(50), nullable=False)
    
    # Date tracking
    target_date = Column(Date, nullable=False, index=True)
    offset_days = Column(Integer, nullable=False)  # Days from ETA
    actual_date = Column(Date, nullable=True)
    
    # Status
    status = Column(SQLEnum(StepStatus), default=StepStatus.PENDING, nullable=False, index=True)
    is_critical = Column(Boolean, default=False, nullable=False)
    
    # Responsibility assignment
    ppr_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    apr_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    shipment = relationship("Shipment", back_populates="workflow_steps")
    ppr_user = relationship("User", back_populates="ppr_workflow_steps", foreign_keys=[ppr_user_id])
    apr_user = relationship("User", back_populates="apr_workflow_steps", foreign_keys=[apr_user_id])
    alerts = relationship("Alert", back_populates="workflow_step", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WorkflowStep(id={self.id}, step_number={self.step_number}, step_name='{self.step_name}', status='{self.status}')>"


# Additional indexes
Index("idx_workflow_shipment", WorkflowStep.shipment_id)
Index("idx_workflow_status", WorkflowStep.status)
Index("idx_workflow_ppr", WorkflowStep.ppr_user_id)
Index("idx_workflow_target_date", WorkflowStep.target_date)
