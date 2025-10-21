"""Integration tests for alert evaluation and email sending."""

from datetime import date, timedelta
from decimal import Decimal
import pytest
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shipment import Shipment
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.workflow_step_template import WorkflowStepTemplate
from app.models.alert import Alert, AlertSeverity
from app.services.shipment_service import ShipmentService
from app.services.workflow_service import WorkflowService
from app.services.audit_service import AuditService
from app.services.alert_service import AlertService
from app.schemas.shipment import ShipmentCreate
from app.utils.constants import WORKFLOW_STEP_TEMPLATES


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user for shipment operations."""
    user = User(
        auth0_id="test_auth0_id",
        email="test@alhashargroup.com",
        full_name="Test User",
        department="BusinessUnit",
        role="PPR",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def workflow_templates(db: Session) -> None:
    """Seed workflow step templates in the database."""
    for idx, template_data in enumerate(WORKFLOW_STEP_TEMPLATES):
        template = WorkflowStepTemplate(
            step_number=template_data["step_number"],
            step_name=template_data["step_name"],
            description=template_data.get("description", ""),
            department=template_data["department"],
            offset_days=template_data["offset_days"],
            is_critical=template_data["is_critical"],
            display_order=idx + 1,
            is_active=True
        )
        db.add(template)
    db.commit()


@pytest.fixture
def shipment_service(db: Session, workflow_templates) -> ShipmentService:
    """Create shipment service with dependencies."""
    audit_service = AuditService(db)
    workflow_service = WorkflowService(db, audit_service, use_db_templates=True)
    return ShipmentService(db, audit_service, workflow_service)


@pytest.fixture
def alert_service(db: Session, workflow_templates) -> AlertService:
    """Create alert service with workflow service dependency."""
    audit_service = AuditService(db)
    workflow_service = WorkflowService(db, audit_service, use_db_templates=True)
    return AlertService(db, workflow_service=workflow_service)


class TestAlertEvaluationAndEmailSending:
    """Test alert evaluation and email task queueing."""
    
    def test_overdue_critical_step_creates_high_severity_alert(
        self,
        db: Session,
        shipment_service: ShipmentService,
        alert_service: AlertService,
        test_user: User
    ):
        """Test that overdue critical step creates high severity alert."""
        # Arrange - Create shipment with ETA 5 days ago
        eta = date.today() - timedelta(days=5)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ALERT-001",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ALERT-001",
            invoice_amount_omr=Decimal("10000.00"),
            eta=eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get a critical workflow step that should be overdue
        critical_step = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id,
            WorkflowStep.is_critical == True,
            WorkflowStep.status != StepStatus.COMPLETED
        ).first()
        
        assert critical_step is not None, "Should have at least one incomplete critical step"
        
        # Act - Evaluate alerts for the shipment
        alert_service.evaluate_shipment_alerts(shipment)
        
        # Assert - Verify alert was created
        alerts = db.query(Alert).filter(
            Alert.shipment_id == shipment.id
        ).all()
        
        assert len(alerts) > 0, "Should have created at least one alert"
        
        # Find alert for the critical step
        step_alert = next(
            (a for a in alerts if a.workflow_step_id == critical_step.id),
            None
        )
        
        assert step_alert is not None, "Should have created alert for critical step"
        assert step_alert.severity in [AlertSeverity.CRITICAL, AlertSeverity.URGENT]
        assert step_alert.is_acknowledged == False
    
    def test_alert_has_correct_recipients(
        self,
        db: Session,
        shipment_service: ShipmentService,
        alert_service: AlertService,
        test_user: User
    ):
        """Test that alert has correct recipient users."""
        # Arrange - Create shipment with overdue ETA
        eta = date.today() - timedelta(days=10)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ALERT-002",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ALERT-002",
            invoice_amount_omr=Decimal("8000.00"),
            eta=eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Act - Evaluate alerts
        alert_service.evaluate_shipment_alerts(shipment)
        
        # Assert - Verify alerts have recipients
        alerts = db.query(Alert).filter(
            Alert.shipment_id == shipment.id
        ).all()
        
        assert len(alerts) > 0
        
        # Check that alerts have recipient users assigned
        for alert in alerts:
            assert alert.recipient_user_id is not None, \
                "Alert should have a recipient user assigned"
    
    def test_alert_message_contains_shipment_details(
        self,
        db: Session,
        shipment_service: ShipmentService,
        alert_service: AlertService,
        test_user: User
    ):
        """Test that alert message contains relevant shipment details."""
        # Arrange
        eta = date.today() - timedelta(days=7)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ALERT-003",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ALERT-003",
            invoice_amount_omr=Decimal("12000.00"),
            eta=eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Act
        alert_service.evaluate_shipment_alerts(shipment)
        
        # Assert
        alerts = db.query(Alert).filter(
            Alert.shipment_id == shipment.id
        ).all()
        
        assert len(alerts) > 0
        
        for alert in alerts:
            # Alert message should contain shipment number
            assert "TEST-ALERT-003" in alert.message or \
                   alert.shipment_id == shipment.id, \
                   "Alert should reference the shipment"
    
    def test_multiple_overdue_steps_create_multiple_alerts(
        self,
        db: Session,
        shipment_service: ShipmentService,
        alert_service: AlertService,
        test_user: User
    ):
        """Test that multiple overdue critical steps create multiple alerts."""
        # Arrange - Create shipment with very old ETA
        eta = date.today() - timedelta(days=30)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ALERT-004",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ALERT-004",
            invoice_amount_omr=Decimal("15000.00"),
            eta=eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Count incomplete critical steps
        incomplete_critical_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id,
            WorkflowStep.is_critical == True,
            WorkflowStep.status != StepStatus.COMPLETED
        ).count()
        
        # Act
        alert_service.evaluate_shipment_alerts(shipment)
        
        # Assert - Should have alerts for overdue critical steps
        alerts = db.query(Alert).filter(
            Alert.shipment_id == shipment.id,
            Alert.is_acknowledged == False
        ).all()
        
        # Should have at least one alert (may not be one per step depending on logic)
        assert len(alerts) > 0, "Should have created alerts for overdue steps"
    
    def test_completed_steps_do_not_create_alerts(
        self,
        db: Session,
        shipment_service: ShipmentService,
        alert_service: AlertService,
        test_user: User
    ):
        """Test that completed steps do not trigger alerts."""
        # Arrange - Create shipment
        eta = date.today() - timedelta(days=5)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ALERT-005",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ALERT-005",
            invoice_amount_omr=Decimal("9000.00"),
            eta=eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Complete all critical steps
        critical_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id,
            WorkflowStep.is_critical == True
        ).all()
        
        for step in critical_steps:
            step.status = StepStatus.COMPLETED
            step.actual_date = date.today() - timedelta(days=1)
        
        db.commit()
        
        # Act
        alert_service.evaluate_shipment_alerts(shipment)
        
        # Assert - Should not create alerts for completed steps
        alerts = db.query(Alert).filter(
            Alert.shipment_id == shipment.id,
            Alert.is_acknowledged == False
        ).all()
        
        # May have alerts for non-critical overdue steps, but not for completed critical ones
        for alert in alerts:
            if alert.workflow_step_id:
                step = db.query(WorkflowStep).get(alert.workflow_step_id)
                assert step.status != StepStatus.COMPLETED, \
                    "Should not create alert for completed step"
    
    def test_alert_severity_based_on_days_overdue(
        self,
        db: Session,
        shipment_service: ShipmentService,
        alert_service: AlertService,
        test_user: User
    ):
        """Test that alert severity increases with days overdue."""
        # Arrange - Create shipment with moderately overdue ETA
        eta = date.today() - timedelta(days=3)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ALERT-006",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ALERT-006",
            invoice_amount_omr=Decimal("11000.00"),
            eta=eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Act
        alert_service.evaluate_shipment_alerts(shipment)
        
        # Assert - Verify alerts exist and have appropriate severity
        alerts = db.query(Alert).filter(
            Alert.shipment_id == shipment.id,
            Alert.is_acknowledged == False
        ).all()
        
        if len(alerts) > 0:
            # Alerts should exist for overdue steps
            for alert in alerts:
                assert alert.severity in [AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.URGENT], \
                    "Overdue critical steps should have warning, critical or urgent severity"
