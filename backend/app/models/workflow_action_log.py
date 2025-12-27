"""Workflow action log model for tracking user actions on workflow steps."""

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class WorkflowActionLog(Base):
    """Workflow action log model for audit trail."""
    
    __tablename__ = "workflow_action_logs"
    
    id = Column(String, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False, index=True)
    step_number = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    performed_by = Column(String, nullable=False)
    performed_at = Column(DateTime(timezone=True), nullable=False, index=True)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    shipment = relationship("Shipment", back_populates="action_logs")
    
    def __repr__(self):
        return f"<WorkflowActionLog(id={self.id}, shipment_id={self.shipment_id}, step={self.step_number}, action={self.action})>"
