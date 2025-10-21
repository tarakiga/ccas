"""Integration tests for shipment creation and workflow generation."""

from datetime import date, timedelta
from decimal import Decimal
import pytest
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shipment import Shipment, ShipmentStatus
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.workflow_step_template import WorkflowStepTemplate
from app.services.shipment_service import ShipmentService
from app.services.workflow_service import WorkflowService
from app.services.audit_service import AuditService
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


class TestShipmentCreationAndWorkflowGeneration:
    """Test shipment creation with workflow step generation."""
    
    def test_create_shipment_generates_34_workflow_steps(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that creating a shipment generates exactly 34 workflow steps."""
        # Arrange
        eta = date.today() + timedelta(days=10)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-001",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-001",
            invoice_amount_omr=Decimal("10000.00"),
            eta=eta
        )
        
        # Act
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Assert - Verify shipment was created
        assert shipment.id is not None
        assert shipment.shipment_number == "TEST-001"
        assert shipment.status == ShipmentStatus.ACTIVE
        
        # Assert - Verify 34 workflow steps were created
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        
        assert len(workflow_steps) == 34, f"Expected 34 workflow steps, got {len(workflow_steps)}"
        
        # Assert - Verify steps are numbered correctly
        step_numbers = sorted([step.step_number for step in workflow_steps])
        assert step_numbers[0] == Decimal("1.0")
        assert step_numbers[-1] == Decimal("34.0")
    
    def test_workflow_steps_have_correct_target_dates(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that workflow steps have correct target dates based on ETA and offset."""
        # Arrange
        eta = date(2024, 1, 15)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-002",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-002",
            invoice_amount_omr=Decimal("5000.00"),
            eta=eta
        )
        
        # Act
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Assert - Get specific critical steps and verify target dates
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        
        # Find Bayan submission step (step 9.0, offset=0)
        bayan_step = next((s for s in workflow_steps if s.step_number == Decimal("9.0")), None)
        assert bayan_step is not None
        assert bayan_step.target_date == eta, f"Bayan step target date should be ETA"
        
        # Find Customs duty payment step (step 10.0, offset=3)
        customs_duty_step = next((s for s in workflow_steps if s.step_number == Decimal("10.0")), None)
        assert customs_duty_step is not None
        expected_date = eta + timedelta(days=3)
        assert customs_duty_step.target_date == expected_date
        
        # Find Bayan approval step (step 11.0, offset=4)
        bayan_approval_step = next((s for s in workflow_steps if s.step_number == Decimal("11.0")), None)
        assert bayan_approval_step is not None
        expected_date = eta + timedelta(days=4)
        assert bayan_approval_step.target_date == expected_date
    
    def test_financial_fields_calculated_correctly(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that financial fields are auto-calculated correctly."""
        # Arrange
        invoice_amount = Decimal("10000.00")
        shipment_data = ShipmentCreate(
            shipment_number="TEST-003",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-003",
            invoice_amount_omr=invoice_amount,
            eta=date.today()
        )
        
        # Act
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Assert - Verify financial calculations
        # Customs duty = 5% of invoice amount
        expected_customs_duty = invoice_amount * Decimal("0.05")
        assert shipment.customs_duty_omr == expected_customs_duty
        
        # VAT = 5% of invoice amount
        expected_vat = invoice_amount * Decimal("0.05")
        assert shipment.vat_omr == expected_vat
        
        # Insurance = 1% of invoice amount
        expected_insurance = invoice_amount * Decimal("0.01")
        assert shipment.insurance_omr == expected_insurance
    
    def test_workflow_steps_assigned_to_departments(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that workflow steps are assigned to correct departments."""
        # Arrange
        shipment_data = ShipmentCreate(
            shipment_number="TEST-004",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-004",
            invoice_amount_omr=Decimal("8000.00"),
            eta=date.today()
        )
        
        # Act
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Assert - Verify departments are assigned
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        
        # Check that all steps have a department assigned
        for step in workflow_steps:
            assert step.department is not None
            assert step.department in ["BusinessUnit", "Finance", "C&C", "Stores"]
        
        # Verify specific critical steps have correct departments
        bayan_step = next((s for s in workflow_steps if s.step_number == Decimal("9.0")), None)
        assert bayan_step.department == "C&C"
    
    def test_critical_steps_marked_correctly(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that critical steps are marked with is_critical flag."""
        # Arrange
        shipment_data = ShipmentCreate(
            shipment_number="TEST-005",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-005",
            invoice_amount_omr=Decimal("12000.00"),
            eta=date.today()
        )
        
        # Act
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Assert - Verify critical steps are marked
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        
        critical_steps = [s for s in workflow_steps if s.is_critical]
        assert len(critical_steps) > 0, "Should have at least one critical step"
        
        # Verify specific critical steps
        critical_step_numbers = [Decimal("9.0"), Decimal("10.0"), Decimal("11.0"), 
                                 Decimal("13.0"), Decimal("14.0")]
        
        for step_num in critical_step_numbers:
            step = next((s for s in workflow_steps if s.step_number == step_num), None)
            assert step is not None
            assert step.is_critical is True, f"Step {step_num} should be marked as critical"



class TestETAUpdateAndRecalculation:
    """Test ETA update with target date recalculation."""
    
    def test_eta_update_recalculates_target_dates(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that updating ETA recalculates all workflow step target dates."""
        # Arrange - Create shipment with initial ETA
        initial_eta = date(2024, 1, 15)
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ETA-001",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ETA-001",
            invoice_amount_omr=Decimal("10000.00"),
            eta=initial_eta
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get initial target dates
        initial_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        initial_target_dates = {step.step_number: step.target_date for step in initial_steps}
        
        # Act - Update ETA
        new_eta = date(2024, 1, 20)  # 5 days later
        updated_shipment = shipment_service.update_eta(shipment.id, new_eta, test_user)
        
        # Assert - Verify ETA was updated
        assert updated_shipment.eta == new_eta
        
        # Assert - Verify all target dates were recalculated
        updated_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        
        for step in updated_steps:
            old_target = initial_target_dates[step.step_number]
            new_target = step.target_date
            
            # New target date should be 5 days later than old target date
            expected_target = old_target + timedelta(days=5)
            assert new_target == expected_target, \
                f"Step {step.step_number}: expected {expected_target}, got {new_target}"
    
    def test_eta_edit_count_incremented(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that ETA edit count is incremented on each update."""
        # Arrange
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ETA-002",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ETA-002",
            invoice_amount_omr=Decimal("5000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Assert initial edit count is 0
        assert shipment.eta_edit_count == 0
        
        # Act - First ETA update
        shipment = shipment_service.update_eta(
            shipment.id,
            date.today() + timedelta(days=1),
            test_user
        )
        assert shipment.eta_edit_count == 1
        
        # Act - Second ETA update
        shipment = shipment_service.update_eta(
            shipment.id,
            date.today() + timedelta(days=2),
            test_user
        )
        assert shipment.eta_edit_count == 2
        
        # Act - Third ETA update
        shipment = shipment_service.update_eta(
            shipment.id,
            date.today() + timedelta(days=3),
            test_user
        )
        assert shipment.eta_edit_count == 3
    
    def test_eta_edit_limit_enforcement(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that ETA cannot be updated more than 3 times."""
        # Arrange
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ETA-003",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ETA-003",
            invoice_amount_omr=Decimal("8000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Act - Update ETA 3 times (should succeed)
        for i in range(3):
            shipment = shipment_service.update_eta(
                shipment.id,
                date.today() + timedelta(days=i+1),
                test_user
            )
        
        # Assert - Fourth update should fail
        with pytest.raises(ValueError) as exc_info:
            shipment_service.update_eta(
                shipment.id,
                date.today() + timedelta(days=10),
                test_user
            )
        
        assert "ETA edit limit reached" in str(exc_info.value)
        assert "Maximum 3 edits allowed" in str(exc_info.value)
    
    def test_eta_update_preserves_actual_dates(
        self,
        db: Session,
        shipment_service: ShipmentService,
        test_user: User
    ):
        """Test that ETA update preserves existing actual_date values."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-ETA-004",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-ETA-004",
            invoice_amount_omr=Decimal("6000.00"),
            eta=date(2024, 1, 15)
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Complete a workflow step
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).all()
        
        first_step = workflow_steps[0]
        first_step.actual_date = date(2024, 1, 16)
        first_step.status = StepStatus.COMPLETED
        db.commit()
        
        # Act - Update ETA
        new_eta = date(2024, 1, 20)
        shipment_service.update_eta(shipment.id, new_eta, test_user)
        
        # Assert - Verify actual_date was preserved
        db.refresh(first_step)
        assert first_step.actual_date == date(2024, 1, 16)
        assert first_step.status == StepStatus.COMPLETED



class TestWorkflowStepCompletionWithAuthorization:
    """Test workflow step completion with authorization checks."""
    
    @pytest.fixture
    def ppr_user(self, db: Session) -> User:
        """Create a PPR user."""
        user = User(
            auth0_id="ppr_auth0_id",
            email="ppr@alhashargroup.com",
            full_name="PPR User",
            department="C&C",
            role="PPR",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def apr_user(self, db: Session) -> User:
        """Create an APR user."""
        user = User(
            auth0_id="apr_auth0_id",
            email="apr@alhashargroup.com",
            full_name="APR User",
            department="C&C",
            role="APR",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def unauthorized_user(self, db: Session) -> User:
        """Create an unauthorized user."""
        user = User(
            auth0_id="unauth_auth0_id",
            email="unauth@alhashargroup.com",
            full_name="Unauthorized User",
            department="Finance",
            role="PPR",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def workflow_service_with_audit(self, db: Session) -> WorkflowService:
        """Create workflow service with audit service."""
        audit_service = AuditService(db)
        return WorkflowService(db, audit_service, use_db_templates=True)
    
    def test_ppr_user_can_complete_assigned_step(
        self,
        db: Session,
        shipment_service: ShipmentService,
        workflow_service_with_audit: WorkflowService,
        test_user: User,
        ppr_user: User
    ):
        """Test that PPR user can complete their assigned step."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUTH-001",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUTH-001",
            invoice_amount_omr=Decimal("10000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get a workflow step and assign PPR user
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).first()
        
        workflow_steps.ppr_user_id = ppr_user.id
        db.commit()
        db.refresh(workflow_steps)
        
        # Act - Complete step as PPR user
        actual_date = date.today()
        completed_step = workflow_service_with_audit.complete_step(
            workflow_steps.id,
            actual_date,
            ppr_user
        )
        
        # Assert
        assert completed_step.actual_date == actual_date
        assert completed_step.status == StepStatus.COMPLETED
    
    def test_apr_user_can_complete_assigned_step(
        self,
        db: Session,
        shipment_service: ShipmentService,
        workflow_service_with_audit: WorkflowService,
        test_user: User,
        ppr_user: User,
        apr_user: User
    ):
        """Test that APR user can complete their assigned step."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUTH-002",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUTH-002",
            invoice_amount_omr=Decimal("8000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get a workflow step and assign both PPR and APR users
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).first()
        
        workflow_steps.ppr_user_id = ppr_user.id
        workflow_steps.apr_user_id = apr_user.id
        db.commit()
        db.refresh(workflow_steps)
        
        # Act - Complete step as APR user
        actual_date = date.today()
        completed_step = workflow_service_with_audit.complete_step(
            workflow_steps.id,
            actual_date,
            apr_user
        )
        
        # Assert
        assert completed_step.actual_date == actual_date
        assert completed_step.status == StepStatus.COMPLETED
    
    def test_unauthorized_user_cannot_complete_step(
        self,
        db: Session,
        shipment_service: ShipmentService,
        workflow_service_with_audit: WorkflowService,
        test_user: User,
        ppr_user: User,
        unauthorized_user: User
    ):
        """Test that non-assigned user cannot complete step."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUTH-003",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUTH-003",
            invoice_amount_omr=Decimal("6000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get a workflow step and assign only PPR user
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).first()
        
        workflow_steps.ppr_user_id = ppr_user.id
        db.commit()
        db.refresh(workflow_steps)
        
        # Act & Assert - Attempt to complete step as unauthorized user should fail
        with pytest.raises(PermissionError) as exc_info:
            workflow_service_with_audit.complete_step(
                workflow_steps.id,
                date.today(),
                unauthorized_user
            )
        
        assert "not authorized to complete this step" in str(exc_info.value)
        assert "Only PPR or APR can complete this step" in str(exc_info.value)
    
    def test_actual_date_cannot_be_in_future(
        self,
        db: Session,
        shipment_service: ShipmentService,
        workflow_service_with_audit: WorkflowService,
        test_user: User,
        ppr_user: User
    ):
        """Test that actual_date cannot be in the future."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUTH-004",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUTH-004",
            invoice_amount_omr=Decimal("7000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get a workflow step and assign PPR user
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).first()
        
        workflow_steps.ppr_user_id = ppr_user.id
        db.commit()
        db.refresh(workflow_steps)
        
        # Act & Assert - Attempt to complete with future date should fail
        future_date = date.today() + timedelta(days=10)
        with pytest.raises(ValueError) as exc_info:
            workflow_service_with_audit.complete_step(
                workflow_steps.id,
                future_date,
                ppr_user
            )
        
        assert "Actual date cannot be in the future" in str(exc_info.value)
    
    def test_step_completion_creates_audit_log(
        self,
        db: Session,
        shipment_service: ShipmentService,
        workflow_service_with_audit: WorkflowService,
        test_user: User,
        ppr_user: User
    ):
        """Test that completing a step creates audit log entries."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUTH-005",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUTH-005",
            invoice_amount_omr=Decimal("9000.00"),
            eta=date.today()
        )
        shipment = shipment_service.create_shipment(shipment_data, test_user)
        
        # Get a workflow step and assign PPR user
        workflow_steps = db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment.id
        ).first()
        
        workflow_steps.ppr_user_id = ppr_user.id
        db.commit()
        db.refresh(workflow_steps)
        
        # Act - Complete step
        actual_date = date.today()
        workflow_service_with_audit.complete_step(
            workflow_steps.id,
            actual_date,
            ppr_user
        )
        
        # Assert - Verify audit logs were created
        from app.models.audit_log import AuditLog
        audit_logs = db.query(AuditLog).filter(
            AuditLog.entity_type == "workflow_step",
            AuditLog.entity_id == workflow_steps.id
        ).all()
        
        # Should have 2 audit logs: one for actual_date, one for status
        assert len(audit_logs) >= 2
        
        # Check for actual_date audit log
        actual_date_log = next(
            (log for log in audit_logs if log.field_name == "actual_date"),
            None
        )
        assert actual_date_log is not None
        assert actual_date_log.new_value == str(actual_date)
        assert actual_date_log.user_id == ppr_user.id
        
        # Check for status audit log
        status_log = next(
            (log for log in audit_logs if log.field_name == "status"),
            None
        )
        assert status_log is not None
        assert status_log.new_value == StepStatus.COMPLETED.value
        assert status_log.user_id == ppr_user.id
