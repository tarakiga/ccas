"""Alert repository for data access operations."""

from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.alert import Alert, AlertSeverity


class AlertRepository:
    """Repository for alert data access operations."""
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def create(self, alert: Alert) -> Alert:
        """
        Create a new alert.
        
        Args:
            alert: Alert model instance to create
            
        Returns:
            Created alert with assigned ID
        """
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert
    
    def update(self, alert: Alert) -> Alert:
        """
        Update an existing alert (for acknowledgment and email status).
        
        Args:
            alert: Alert model instance to update
            
        Returns:
            Updated alert
        """
        self.db.commit()
        self.db.refresh(alert)
        return alert
    
    def get_by_id(self, alert_id: int) -> Optional[Alert]:
        """
        Get alert by ID with relationships loaded.
        
        Args:
            alert_id: Alert ID
            
        Returns:
            Alert if found, None otherwise
        """
        return (
            self.db.query(Alert)
            .options(
                joinedload(Alert.shipment),
                joinedload(Alert.workflow_step),
                joinedload(Alert.recipient_user)
            )
            .filter(Alert.id == alert_id)
            .first()
        )
    
    def get_by_user(
        self,
        user_id: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Alert]:
        """
        Get alerts filtered by recipient user.
        
        Args:
            user_id: User ID
            filters: Optional dictionary of filter criteria
                - is_acknowledged: Boolean to filter by acknowledgment status
                - severity: AlertSeverity enum value
                
        Returns:
            List of alerts for the user
        """
        query = self.db.query(Alert).options(
            joinedload(Alert.shipment),
            joinedload(Alert.workflow_step)
        ).filter(Alert.recipient_user_id == user_id)
        
        # Apply additional filters if provided
        if filters:
            if "is_acknowledged" in filters and filters["is_acknowledged"] is not None:
                query = query.filter(Alert.is_acknowledged == filters["is_acknowledged"])
            
            if "severity" in filters and filters["severity"]:
                query = query.filter(Alert.severity == filters["severity"])
        
        return query.order_by(Alert.created_at.desc()).all()
    
    def list_by_user(
        self,
        user_id: int,
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        size: int = 50
    ) -> Tuple[List[Alert], int]:
        """
        Get paginated alerts filtered by recipient user.
        
        Args:
            user_id: User ID
            filters: Optional dictionary of filter criteria
                - is_acknowledged: Boolean to filter by acknowledgment status
                - severity: AlertSeverity enum value
                - shipment_id: Filter by shipment ID
            page: Page number (1-indexed)
            size: Page size
                
        Returns:
            Tuple of (list of alerts, total count)
        """
        query = self.db.query(Alert).options(
            joinedload(Alert.shipment),
            joinedload(Alert.workflow_step)
        ).filter(Alert.recipient_user_id == user_id)
        
        # Apply additional filters if provided
        if filters:
            if "is_acknowledged" in filters and filters["is_acknowledged"] is not None:
                query = query.filter(Alert.is_acknowledged == filters["is_acknowledged"])
            
            if "severity" in filters and filters["severity"]:
                query = query.filter(Alert.severity == filters["severity"])
            
            if "shipment_id" in filters and filters["shipment_id"]:
                query = query.filter(Alert.shipment_id == filters["shipment_id"])
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        alerts = (
            query
            .order_by(Alert.created_at.desc())
            .offset(offset)
            .limit(size)
            .all()
        )
        
        return alerts, total
    
    def get_by_shipment(self, shipment_id: int) -> List[Alert]:
        """
        Get all alerts for a shipment (alert history).
        
        Args:
            shipment_id: Shipment ID
            
        Returns:
            List of alerts for the shipment ordered by creation date
        """
        return (
            self.db.query(Alert)
            .options(
                joinedload(Alert.workflow_step),
                joinedload(Alert.recipient_user)
            )
            .filter(Alert.shipment_id == shipment_id)
            .order_by(Alert.created_at.desc())
            .all()
        )
    
    def get_pending_notifications(self) -> List[Alert]:
        """
        Get alerts that need email notifications sent.
        
        Returns:
            List of alerts with email_sent=False
        """
        return (
            self.db.query(Alert)
            .options(
                joinedload(Alert.shipment),
                joinedload(Alert.workflow_step),
                joinedload(Alert.recipient_user)
            )
            .filter(Alert.email_sent == False)
            .order_by(Alert.created_at)
            .all()
        )
