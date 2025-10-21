"""Alert model for notification tracking."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class AlertSeverity(str, enum.Enum):
    """Alert severity enumeration."""
    WARNING = "warning"
    CRITICAL = "critical"
    URGENT = "urgent"


class Alert(Base):
    """Alert model for notification tracking."""
    
    __tablename__ = "alerts"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    workflow_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=False)
    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Alert information
    severity = Column(SQLEnum(AlertSeverity), nullable=False)
    message = Column(String(1000), nullable=False)
    days_post_eta = Column(Integer, nullable=False)
    
    # Acknowledgment tracking
    is_acknowledged = Column(Boolean, default=False, nullable=False, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    
    # Email delivery tracking
    email_sent = Column(Boolean, default=False, nullable=False, index=True)
    email_sent_at = Column(DateTime, nullable=True)
    email_retry_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    shipment = relationship("Shipment", back_populates="alerts")
    workflow_step = relationship("WorkflowStep", back_populates="alerts")
    recipient_user = relationship("User", back_populates="alerts")
    
    def __repr__(self):
        return f"<Alert(id={self.id}, severity='{self.severity}', shipment_id={self.shipment_id})>"


# Additional indexes
Index("idx_alerts_recipient", Alert.recipient_user_id)
Index("idx_alerts_shipment", Alert.shipment_id)
Index("idx_alerts_acknowledged", Alert.is_acknowledged)
Index("idx_alerts_email_sent", Alert.email_sent)
