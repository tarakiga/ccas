"""User model for authentication and authorization."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """User model with Auth0 integration fields."""
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Auth0 integration
    auth0_id = Column(String(255), unique=True, nullable=False, index=True)
    
    # User information
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    department = Column(String(50), nullable=False, index=True)
    role = Column(String(50), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    created_shipments = relationship("Shipment", back_populates="created_by", foreign_keys="Shipment.created_by_id")
    ppr_workflow_steps = relationship("WorkflowStep", back_populates="ppr_user", foreign_keys="WorkflowStep.ppr_user_id")
    apr_workflow_steps = relationship("WorkflowStep", back_populates="apr_user", foreign_keys="WorkflowStep.apr_user_id")
    alerts = relationship("Alert", back_populates="recipient_user")
    audit_logs = relationship("AuditLog", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', department='{self.department}')>"


# Additional indexes
Index("idx_users_email", User.email)
Index("idx_users_auth0_id", User.auth0_id)
Index("idx_users_department", User.department)
