"""AuditLog model for change tracking."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.database import Base


class AuditLog(Base):
    """AuditLog model for change tracking."""
    
    __tablename__ = "audit_logs"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Entity information
    entity_type = Column(String(50), nullable=False)  # e.g., "shipment", "workflow_step"
    entity_id = Column(Integer, nullable=False)
    
    # Change information
    field_name = Column(String(100), nullable=False)
    old_value = Column(String(1000), nullable=True)  # JSON serialized
    new_value = Column(String(1000), nullable=True)  # JSON serialized
    
    # User and context
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    
    # Timestamp
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, entity_type='{self.entity_type}', entity_id={self.entity_id}, field='{self.field_name}')>"


# Additional indexes
Index("idx_audit_entity", AuditLog.entity_type, AuditLog.entity_id)
Index("idx_audit_user", AuditLog.user_id)
Index("idx_audit_created", AuditLog.created_at)
