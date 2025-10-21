"""Alert service for business logic operations."""

from datetime import date, datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.alert import Alert, AlertSeverity
from app.models.shipment import Shipment
from app.models.workflow_step import WorkflowStep
from app.models.user import User
from app.repositories.alert_repository import AlertRepository
from app.schemas.common import Page
from app.utils.constants import ALERT_THRESHOLDS
from app.monitoring.prometheus_metrics import alert_evaluation_total, alerts_created_total


class AlertService:
    """Service for alert business logic operations."""
    
    def __init__(
        self,
        db: Session,
        workflow_service: Optional[Any] = None
    ):
        """
        Initialize service with database session and dependencies.
        
        Args:
            db: SQLAlchemy database session
            workflow_service: Optional workflow service for getting critical steps
        """
        self.db = db
        self.alert_repo = AlertRepository(db)
        self.workflow_service = workflow_service
    
    def evaluate_shipment_alerts(
        self,
        shipment: Shipment
    ) -> List[Alert]:
        """
        Evaluate shipment for alert conditions and create alerts.
        
        Calculates days_post_eta and identifies incomplete critical steps.
        Creates alerts based on day thresholds:
        - Day 4: Warning to PPR
        - Day 5: Critical to PPR
        - Day 6: Escalate to APR and manager
        - Day 7: Urgent to management and IA
        
        Args:
            shipment: Shipment to evaluate for alerts
            
        Returns:
            List of created alerts
        """
        # Calculate days post-ETA
        today = date.today()
        days_post_eta = (today - shipment.eta).days
        
        # Only evaluate if we're in the alert window (Day 4 onwards)
        if days_post_eta < ALERT_THRESHOLDS["warning"]:
            return []
        
        # Get incomplete critical steps
        if not self.workflow_service:
            return []
        
        critical_incomplete_steps = self.workflow_service.get_critical_incomplete_steps(shipment)
        
        # If no incomplete critical steps, no alerts needed
        if not critical_incomplete_steps:
            return []
        
        # Create alerts for each incomplete critical step
        created_alerts = []
        
        for step in critical_incomplete_steps:
            # Determine severity based on days post-ETA
            severity = self._determine_severity(days_post_eta)
            
            # Get recipients for this alert
            recipients = self._determine_recipients(step, severity, days_post_eta)
            
            # Create alert for each recipient
            for recipient_user_id in recipients:
                # Check if alert already exists for this combination
                existing_alerts = self.alert_repo.get_by_shipment(shipment.id)
                alert_exists = any(
                    a.workflow_step_id == step.id and
                    a.recipient_user_id == recipient_user_id and
                    a.days_post_eta == days_post_eta and
                    not a.is_acknowledged
                    for a in existing_alerts
                )
                
                if not alert_exists:
                    alert = self.create_alert(
                        shipment=shipment,
                        step=step,
                        severity=severity,
                        recipient_user_id=recipient_user_id,
                        days_post_eta=days_post_eta
                    )
                    created_alerts.append(alert)
                    
                    # Queue email notification
                    self.queue_email_notification(alert)
        
        return created_alerts
    
    def create_alert(
        self,
        shipment: Shipment,
        step: WorkflowStep,
        severity: AlertSeverity,
        recipient_user_id: int,
        days_post_eta: int
    ) -> Alert:
        """
        Create an alert with severity determination.
        
        Args:
            shipment: Shipment the alert is for
            step: Workflow step that triggered the alert
            severity: Alert severity level
            recipient_user_id: User ID to receive the alert
            days_post_eta: Number of days after ETA
            
        Returns:
            Created alert
        """
        # Generate alert message
        message = (
            f"{severity.value.capitalize()} step '{step.step_name}' is incomplete "
            f"on Day {days_post_eta} post-ETA for shipment {shipment.shipment_number}"
        )
        
        # Create alert
        alert = Alert(
            shipment_id=shipment.id,
            workflow_step_id=step.id,
            recipient_user_id=recipient_user_id,
            severity=severity,
            message=message,
            days_post_eta=days_post_eta,
            is_acknowledged=False,
            email_sent=False,
            email_retry_count=0
        )
        
        # Save to database
        alert = self.alert_repo.create(alert)
        
        # Record metrics
        alert_evaluation_total.labels(severity=severity.value).inc()
        alerts_created_total.labels(severity=severity.value).inc()
        
        return alert
    
    def _determine_severity(
        self,
        days_post_eta: int
    ) -> AlertSeverity:
        """
        Determine alert severity based on days post-ETA.
        
        Args:
            days_post_eta: Number of days after ETA
            
        Returns:
            Alert severity level
        """
        if days_post_eta >= ALERT_THRESHOLDS["urgent"]:
            return AlertSeverity.URGENT
        elif days_post_eta >= ALERT_THRESHOLDS["critical"]:
            return AlertSeverity.CRITICAL
        else:
            return AlertSeverity.WARNING
    
    def _determine_recipients(
        self,
        step: WorkflowStep,
        severity: AlertSeverity,
        days_post_eta: int
    ) -> List[int]:
        """
        Determine alert recipients based on escalation rules.
        
        Escalation rules:
        - Day 4: Warning to PPR
        - Day 5: Critical to PPR
        - Day 6: Escalate to PPR + APR + manager
        - Day 7: Urgent to PPR + APR + manager + IA + senior management
        
        Args:
            step: Workflow step that triggered the alert
            severity: Alert severity level
            days_post_eta: Number of days after ETA
            
        Returns:
            List of user IDs to receive the alert
        """
        recipients = []
        
        # Always include PPR
        recipients.append(step.ppr_user_id)
        
        # Day 6+: Add APR and manager
        if days_post_eta >= 6:
            if step.apr_user_id:
                recipients.append(step.apr_user_id)
            # TODO: Add department manager lookup
            # For now, we'll skip manager as we don't have that relationship
        
        # Day 7+: Add IA and senior management
        if days_post_eta >= 7:
            # TODO: Add IA and senior management user lookup
            # For now, we'll skip as we don't have those users defined
            pass
        
        return recipients
    
    def queue_email_notification(
        self,
        alert: Alert
    ) -> None:
        """
        Queue email notification for an alert (creates Celery task).
        
        Args:
            alert: Alert to send email notification for
        """
        try:
            from app.tasks.email_tasks import send_alert_email
            send_alert_email.delay(alert.id)
        except Exception as e:
            # Log error but don't fail alert creation
            # Email will be picked up by periodic task
            pass
    
    def get_user_alerts(
        self,
        user: User,
        filters: Optional[Any] = None
    ) -> List[Alert]:
        """
        Get alerts for a specific user with optional filters.
        
        Args:
            user: User to get alerts for
            filters: Optional filters (AlertFilters schema)
            
        Returns:
            List of alerts for the user
        """
        # Build filter dictionary
        filter_dict = {}
        if filters:
            if hasattr(filters, 'shipment_id') and filters.shipment_id:
                filter_dict["shipment_id"] = filters.shipment_id
            if hasattr(filters, 'severity') and filters.severity:
                filter_dict["severity"] = filters.severity
            if hasattr(filters, 'is_acknowledged') and filters.is_acknowledged is not None:
                filter_dict["is_acknowledged"] = filters.is_acknowledged
        
        # Get alerts from repository
        alerts = self.alert_repo.get_by_user(
            user_id=user.id,
            filters=filter_dict
        )
        
        return alerts
    
    def list_user_alerts(
        self,
        user: User,
        filters: Optional[Any] = None,
        page: int = 1,
        size: int = 50
    ) -> Page:
        """
        Get paginated alerts for a specific user with optional filters.
        
        Args:
            user: User to get alerts for
            filters: Optional filters (AlertFilters schema)
            page: Page number (1-indexed)
            size: Page size
            
        Returns:
            Paginated list of alerts
        """
        # Build filter dictionary
        filter_dict = {}
        if filters:
            if hasattr(filters, 'shipment_id') and filters.shipment_id:
                filter_dict["shipment_id"] = filters.shipment_id
            if hasattr(filters, 'severity') and filters.severity:
                filter_dict["severity"] = filters.severity
            if hasattr(filters, 'is_acknowledged') and filters.is_acknowledged is not None:
                filter_dict["is_acknowledged"] = filters.is_acknowledged
        
        # Get paginated alerts from repository
        alerts, total = self.alert_repo.list_by_user(
            user_id=user.id,
            filters=filter_dict,
            page=page,
            size=size
        )
        
        # Calculate total pages
        pages = (total + size - 1) // size if total > 0 else 0
        
        return Page(
            items=alerts,
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    
    def get_alert(
        self,
        alert_id: int,
        user: User
    ) -> Optional[Alert]:
        """
        Get a single alert by ID.
        
        Args:
            alert_id: ID of alert to retrieve
            user: User requesting the alert
            
        Returns:
            Alert if found and user is authorized, None otherwise
        """
        alert = self.alert_repo.get_by_id(alert_id)
        
        # Check if user is the recipient
        if alert and alert.recipient_user_id != user.id:
            # For now, allow all authenticated users to view alerts
            # In production, you might want stricter access control
            pass
        
        return alert
    
    def acknowledge_alert(
        self,
        alert_id: int,
        user: User
    ) -> Alert:
        """
        Acknowledge an alert with timestamp recording.
        
        Args:
            alert_id: ID of alert to acknowledge
            user: User acknowledging the alert
            
        Returns:
            Updated alert
            
        Raises:
            ValueError: If alert not found
            PermissionError: If user is not the recipient
        """
        # Get alert
        alert = self.alert_repo.get_by_id(alert_id)
        if not alert:
            raise ValueError(f"Alert with ID {alert_id} not found")
        
        # Validate user is the recipient
        if user.id != alert.recipient_user_id:
            raise PermissionError(
                f"User {user.email} is not authorized to acknowledge this alert. "
                f"Only the recipient can acknowledge."
            )
        
        # Update alert
        alert.is_acknowledged = True
        alert.acknowledged_at = datetime.now(timezone.utc)
        
        # Save changes
        alert = self.alert_repo.update(alert)
        
        return alert
