"""Shipment model for customs clearance tracking."""

from datetime import datetime, date, timezone
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
import enum

from app.database import Base


class ShipmentStatus(str, enum.Enum):
    """Shipment status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Shipment(Base):
    """Shipment model with financial calculations."""
    
    __tablename__ = "shipments"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Shipment information
    shipment_number = Column(String(100), unique=True, nullable=False, index=True)
    principal = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    lc_number = Column(String(100), nullable=False)
    
    # Financial fields
    invoice_amount_omr = Column(Numeric(15, 3), nullable=False)
    
    # ETA tracking
    eta = Column(Date, nullable=False, index=True)
    eta_edit_count = Column(Integer, default=0, nullable=False)
    
    # Status
    status = Column(SQLEnum(ShipmentStatus), default=ShipmentStatus.ACTIVE, nullable=False, index=True)
    
    # Optimistic locking
    version = Column(Integer, default=1, nullable=False)
    
    # Audit fields
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Soft delete
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    created_by = relationship("User", back_populates="created_shipments", foreign_keys=[created_by_id])
    workflow_steps = relationship("WorkflowStep", back_populates="shipment", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="shipment", cascade="all, delete-orphan")
    action_logs = relationship("WorkflowActionLog", back_populates="shipment", cascade="all, delete-orphan")
    
    @hybrid_property
    def customs_duty_omr(self) -> Decimal:
        """Calculate customs duty as 5% of invoice amount."""
        return self.invoice_amount_omr * Decimal("0.05")
    
    @hybrid_property
    def vat_omr(self) -> Decimal:
        """Calculate VAT as 5% of invoice amount."""
        return self.invoice_amount_omr * Decimal("0.05")
    
    @hybrid_property
    def insurance_omr(self) -> Decimal:
        """Calculate insurance as 1% of invoice amount."""
        return self.invoice_amount_omr * Decimal("0.01")
    
    def __repr__(self):
        return f"<Shipment(id={self.id}, shipment_number='{self.shipment_number}', status='{self.status}')>"


# Additional indexes
Index("idx_shipments_number", Shipment.shipment_number)
Index("idx_shipments_eta", Shipment.eta)
Index("idx_shipments_status", Shipment.status)
