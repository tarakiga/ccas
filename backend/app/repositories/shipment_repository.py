"""Shipment repository for data access operations."""

from datetime import date
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.models.shipment import Shipment, ShipmentStatus
from app.exceptions import ConcurrentModificationError


class ShipmentRepository:
    """Repository for shipment data access operations."""
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def create(self, shipment: Shipment) -> Shipment:
        """
        Create a new shipment with database transaction.
        
        Args:
            shipment: Shipment model instance to create
            
        Returns:
            Created shipment with assigned ID
        """
        self.db.add(shipment)
        self.db.commit()
        self.db.refresh(shipment)
        return shipment
    
    def update(self, shipment: Shipment) -> Shipment:
        """
        Update an existing shipment with optimistic locking check.
        
        Args:
            shipment: Shipment model instance to update
            
        Returns:
            Updated shipment
            
        Raises:
            ConcurrentModificationError: If shipment has been modified by another transaction
        """
        # Store the current version before update
        current_version = shipment.version
        
        # Increment version for optimistic locking
        shipment.version += 1
        
        # Perform update with version check
        # This ensures that the row hasn't been modified since we read it
        rows_updated = (
            self.db.query(Shipment)
            .filter(Shipment.id == shipment.id)
            .filter(Shipment.version == current_version)
            .update(
                {
                    col.name: getattr(shipment, col.name)
                    for col in Shipment.__table__.columns
                    if col.name not in ['id']
                },
                synchronize_session=False
            )
        )
        
        if rows_updated == 0:
            # No rows were updated, meaning version mismatch (concurrent modification)
            self.db.rollback()
            raise ConcurrentModificationError(
                f"Shipment {shipment.id} has been modified by another transaction. "
                "Please refresh and try again."
            )
        
        self.db.commit()
        self.db.refresh(shipment)
        return shipment
    
    def get_by_id(self, shipment_id: int) -> Optional[Shipment]:
        """
        Get shipment by ID with relationship loading.
        
        Args:
            shipment_id: Shipment ID
            
        Returns:
            Shipment if found, None otherwise
        """
        return (
            self.db.query(Shipment)
            .options(
                joinedload(Shipment.created_by),
                joinedload(Shipment.workflow_steps),
                joinedload(Shipment.alerts)
            )
            .filter(Shipment.id == shipment_id)
            .filter(Shipment.deleted_at.is_(None))  # Exclude soft-deleted
            .first()
        )
    
    def list(
        self,
        filters: Dict[str, Any],
        page: int = 1,
        size: int = 50
    ) -> Tuple[List[Shipment], int]:
        """
        List shipments with filters and pagination.
        
        Args:
            filters: Dictionary of filter criteria
                - status: ShipmentStatus enum value
                - eta_start: Start date for ETA range
                - eta_end: End date for ETA range
                - principal: Principal name (partial match)
            page: Page number (1-indexed)
            size: Page size
            
        Returns:
            Tuple of (list of shipments, total count)
        """
        query = self.db.query(Shipment).filter(Shipment.deleted_at.is_(None))
        
        # Apply filters
        if "status" in filters and filters["status"]:
            query = query.filter(Shipment.status == filters["status"])
        
        if "eta_start" in filters and filters["eta_start"]:
            query = query.filter(Shipment.eta >= filters["eta_start"])
        
        if "eta_end" in filters and filters["eta_end"]:
            query = query.filter(Shipment.eta <= filters["eta_end"])
        
        if "principal" in filters and filters["principal"]:
            query = query.filter(Shipment.principal.ilike(f"%{filters['principal']}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        shipments = (
            query
            .options(joinedload(Shipment.created_by))
            .order_by(Shipment.eta.desc(), Shipment.created_at.desc())
            .offset(offset)
            .limit(size)
            .all()
        )
        
        return shipments, total
    
    def get_active_shipments_by_eta_range(
        self,
        start_date: date,
        end_date: date
    ) -> List[Shipment]:
        """
        Get active shipments within ETA range for alert evaluation.
        
        Args:
            start_date: Start date for ETA range
            end_date: End date for ETA range
            
        Returns:
            List of active shipments with workflow steps loaded
        """
        return (
            self.db.query(Shipment)
            .options(
                joinedload(Shipment.workflow_steps),
                joinedload(Shipment.alerts)
            )
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.ACTIVE,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= start_date,
                    Shipment.eta <= end_date
                )
            )
            .all()
        )
