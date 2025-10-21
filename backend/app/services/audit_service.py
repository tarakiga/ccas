"""Audit service for change tracking and audit log management."""

import json
from datetime import datetime, timezone
from typing import Optional, Any, Dict, Tuple, List
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User
from app.repositories.audit_repository import AuditRepository
from app.schemas.audit_log import AuditLogFilters
from app.schemas.common import Page


class AuditService:
    """Service for audit logging and change tracking operations."""
    
    def __init__(self, db: Session):
        """
        Initialize service with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.audit_repo = AuditRepository(db)
    
    def log_change(
        self,
        entity_type: str,
        entity_id: int,
        field_name: str,
        old_value: Any,
        new_value: Any,
        user: User,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """
        Create audit log entry for a data change.
        
        Records entity details, field changes, user information, IP address, and timestamp.
        Values are serialized to JSON strings for storage.
        
        Args:
            entity_type: Type of entity (e.g., "shipment", "workflow_step")
            entity_id: ID of the entity that was modified
            field_name: Name of the field that was changed
            old_value: Previous value (will be JSON serialized)
            new_value: New value (will be JSON serialized)
            user: User who made the change
            ip_address: Optional IP address of the user
            
        Returns:
            Created audit log entry
            
        Example:
            >>> audit_service.log_change(
            ...     entity_type="shipment",
            ...     entity_id=1,
            ...     field_name="eta",
            ...     old_value="2024-12-01",
            ...     new_value="2024-12-05",
            ...     user=current_user,
            ...     ip_address="192.168.1.100"
            ... )
        """
        # Serialize values to JSON strings
        old_value_str = self._serialize_value(old_value)
        new_value_str = self._serialize_value(new_value)
        
        # Create audit log entry
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            field_name=field_name,
            old_value=old_value_str,
            new_value=new_value_str,
            user_id=user.id,
            ip_address=ip_address,
            created_at=datetime.now(timezone.utc)
        )
        
        # Save to database
        return self.audit_repo.create(audit_log)
    
    def query_logs(
        self,
        filters: AuditLogFilters
    ) -> Page:
        """
        Query audit logs with filters and pagination.
        
        Supports filtering by:
        - entity_type: Type of entity (e.g., "shipment", "workflow_step")
        - entity_id: Specific entity ID
        - user_id: User who made changes
        - field_name: Specific field name
        - date_start: Start date/time for created_at range
        - date_end: End date/time for created_at range
        
        Args:
            filters: Filter criteria and pagination parameters
            
        Returns:
            Paginated list of audit logs
            
        Example:
            >>> filters = AuditLogFilters(
            ...     entity_type="shipment",
            ...     entity_id=1,
            ...     page=1,
            ...     size=50
            ... )
            >>> page = audit_service.query_logs(filters)
        """
        # Build filter dictionary
        filter_dict = {}
        if filters.entity_type:
            filter_dict["entity_type"] = filters.entity_type
        if filters.entity_id:
            filter_dict["entity_id"] = filters.entity_id
        if filters.user_id:
            filter_dict["user_id"] = filters.user_id
        if filters.field_name:
            filter_dict["field_name"] = filters.field_name
        if filters.date_start:
            filter_dict["date_start"] = filters.date_start
        if filters.date_end:
            filter_dict["date_end"] = filters.date_end
        
        # Query audit logs from repository
        audit_logs, total = self.audit_repo.query(
            filters=filter_dict,
            page=filters.page,
            size=filters.size
        )
        
        # Calculate total pages
        pages = (total + filters.size - 1) // filters.size if total > 0 else 0
        
        # Return paginated response
        return Page(
            items=audit_logs,
            total=total,
            page=filters.page,
            size=filters.size,
            pages=pages
        )
    
    def get_entity_audit_trail(
        self,
        entity_type: str,
        entity_id: int
    ) -> List[AuditLog]:
        """
        Get complete audit trail for a specific entity.
        
        Returns all audit log entries for the specified entity,
        ordered by creation date (most recent first).
        
        Args:
            entity_type: Type of entity (e.g., "shipment", "workflow_step")
            entity_id: ID of the entity
            
        Returns:
            List of audit logs for the entity
            
        Example:
            >>> logs = audit_service.get_entity_audit_trail("shipment", 1)
        """
        return self.audit_repo.get_by_entity(entity_type, entity_id)
    
    def get_shipment_audit_trail(
        self,
        shipment_id: int
    ) -> List[AuditLog]:
        """
        Get complete audit trail for a specific shipment.
        
        Convenience method that calls get_entity_audit_trail with entity_type="shipment".
        
        Args:
            shipment_id: ID of the shipment
            
        Returns:
            List of audit logs for the shipment
        """
        return self.get_entity_audit_trail("shipment", shipment_id)
    
    def _serialize_value(self, value: Any) -> Optional[str]:
        """
        Serialize a value to JSON string for storage.
        
        Handles various data types including:
        - None -> None
        - Strings -> as-is
        - Numbers, booleans -> JSON serialized
        - Dates, datetimes -> ISO format strings
        - Other objects -> JSON serialized
        
        Args:
            value: Value to serialize
            
        Returns:
            JSON serialized string or None
        """
        if value is None:
            return None
        
        # If already a string, return as-is
        if isinstance(value, str):
            return value
        
        # Handle date and datetime objects
        if isinstance(value, datetime):
            return value.isoformat()
        
        # Handle date objects (must come after datetime check)
        if hasattr(value, 'isoformat'):
            return value.isoformat()
        
        # For other types, use JSON serialization
        try:
            return json.dumps(value)
        except (TypeError, ValueError):
            # If JSON serialization fails, convert to string
            return str(value)
