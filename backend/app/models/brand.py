"""Brand model for managing product brands."""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Brand(Base):
    """Brand model for product brands used in shipments."""
    
    __tablename__ = "brands"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    category = Column(String, nullable=False, default="Automotive")
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Brand(id={self.id}, name={self.name}, category={self.category}, active={self.active})>"
