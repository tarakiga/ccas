"""Audit log repository for data access operations."""

from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.audit_log import AuditLog


class AuditRepository:
    """Repository for audit log data access operations."""
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def create(self, audit_log: AuditLog) -> AuditLog:
        """
        Create a new audit log entry.
        
        Args:
            audit_log: AuditLog model instance to create
            
        Returns:
            Created audit log with assigned ID
        """
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        return audit_log
    
    def query(
        self,
        filters: Dict[str, Any],
        page: int = 1,
        size: int = 50
    ) -> Tuple[List[AuditLog], int]:
        """
        Query audit logs with complex filters and pagination.
        
        Args:
            filters: Dictionary of filter criteria
                - entity_type: Entity type (e.g., "shipment", "workflow_step")
                - entity_id: Entity ID
                - user_id: User ID who made the change
                - date_start: Start datetime for created_at range
                - date_end: End datetime for created_at range
                - field_name: Specific field name
            page: Page number (1-indexed)
            size: Page size
            
        Returns:
            Tuple of (list of audit logs, total count)
        """
        query = self.db.query(AuditLog).options(
            joinedload(AuditLog.user)
        )
        
        # Apply filters
        if "entity_type" in filters and filters["entity_type"]:
            query = query.filter(AuditLog.entity_type == filters["entity_type"])
        
        if "entity_id" in filters and filters["entity_id"]:
            query = query.filter(AuditLog.entity_id == filters["entity_id"])
        
        if "user_id" in filters and filters["user_id"]:
            query = query.filter(AuditLog.user_id == filters["user_id"])
        
        if "date_start" in filters and filters["date_start"]:
            query = query.filter(AuditLog.created_at >= filters["date_start"])
        
        if "date_end" in filters and filters["date_end"]:
            query = query.filter(AuditLog.created_at <= filters["date_end"])
        
        if "field_name" in filters and filters["field_name"]:
            query = query.filter(AuditLog.field_name == filters["field_name"])
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        audit_logs = (
            query
            .order_by(AuditLog.created_at.desc())
            .offset(offset)
            .limit(size)
            .all()
        )
        
        return audit_logs, total
    
    def get_by_entity(
        self,
        entity_type: str,
        entity_id: int
    ) -> List[AuditLog]:
        """
        Get audit trail for a specific entity.
        
        Args:
            entity_type: Entity type (e.g., "shipment", "workflow_step")
            entity_id: Entity ID
            
        Returns:
            List of audit logs for the entity ordered by creation date
        """
        return (
            self.db.query(AuditLog)
            .options(joinedload(AuditLog.user))
            .filter(
                and_(
                    AuditLog.entity_type == entity_type,
                    AuditLog.entity_id == entity_id
                )
            )
            .order_by(AuditLog.created_at.desc())
            .all()
        )
