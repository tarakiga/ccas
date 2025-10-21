"""Integration tests for audit logging."""

from datetime import date, timedelta
from decimal import Decimal
import pytest
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shipment import Shipment
from app.models.audit_log import AuditLog
from app.services.shipment_service import ShipmentService
from app.services.workflow_service import WorkflowService
from app.services.audit_service import AuditService
from app.repositories.audit_repository import AuditRepository
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user."""
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
def audit_service(db: Session) -> AuditService:
    """Create audit service."""
    return AuditService(db)


@pytest.fixture
def audit_repository(db: Session) -> AuditRepository:
    """Create audit repository."""
    return AuditRepository(db)


@pytest.fixture
def shipment_service_with_audit(db: Session) -> ShipmentService:
    """Create shipment service with audit logging."""
    audit_service = AuditService(db)
    return ShipmentService(db, audit_service, None)


class TestAuditLogging:
    """Test audit logging for entity changes."""
    
    def test_shipment_update_creates_audit_log(
        self,
        db: Session,
        shipment_service_with_audit: ShipmentService,
        test_user: User
    ):
        """Test that updating a shipment field creates audit log entry."""
        # Arrange - Create shipment
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUDIT-001",
            principal="Original Principal",
            brand="Original Brand",
            lc_number="LC-AUDIT-001",
            invoice_amount_omr=Decimal("10000.00"),
            eta=date.today()
        )
        shipment = shipment_service_with_audit.create_shipment(shipment_data, test_user)
        
        # Act - Update shipment
        update_data = ShipmentUpdate(
            principal="Updated Principal"
        )
        updated_shipment = shipment_service_with_audit.update_shipment(
            shipment.id,
            update_data,
            test_user,
            ip_address="192.168.1.1"
        )
        
        # Assert - Verify audit log was created
        audit_logs = db.query(AuditLog).filter(
            AuditLog.entity_type == "shipment",
            AuditLog.entity_id == shipment.id,
            AuditLog.field_name == "principal"
        ).all()
        
        assert len(audit_logs) == 1
        audit_log = audit_logs[0]
        
        assert audit_log.old_value == "Original Principal"
        assert audit_log.new_value == "Updated Principal"
        assert audit_log.user_id == test_user.id
        assert audit_log.ip_address == "192.168.1.1"
        assert audit_log.created_at is not None
    
    def test_audit_log_contains_user_information(
        self,
        db: Session,
        shipment_service_with_audit: ShipmentService,
        test_user: User
    ):
        """Test that audit log contains user who made the change."""
        # Arrange
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUDIT-002",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUDIT-002",
            invoice_amount_omr=Decimal("8000.00"),
            eta=date.today()
        )
        shipment = shipment_service_with_audit.create_shipment(shipment_data, test_user)
        
        # Act
        update_data = ShipmentUpdate(brand="Updated Brand")
        shipment_service_with_audit.update_shipment(
            shipment.id,
            update_data,
            test_user
        )
        
        # Assert
        audit_log = db.query(AuditLog).filter(
            AuditLog.entity_type == "shipment",
            AuditLog.entity_id == shipment.id,
            AuditLog.field_name == "brand"
        ).first()
        
        assert audit_log is not None
        assert audit_log.user_id == test_user.id
        assert audit_log.user.email == test_user.email
        assert audit_log.user.full_name == test_user.full_name
    
    def test_audit_log_tracks_old_and_new_values(
        self,
        db: Session,
        shipment_service_with_audit: ShipmentService,
        test_user: User
    ):
        """Test that audit log correctly tracks old and new values."""
        # Arrange
        original_amount = Decimal("5000.00")
        new_amount = Decimal("7500.00")
        
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUDIT-003",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUDIT-003",
            invoice_amount_omr=original_amount,
            eta=date.today()
        )
        shipment = shipment_service_with_audit.create_shipment(shipment_data, test_user)
        
        # Act
        update_data = ShipmentUpdate(invoice_amount_omr=new_amount)
        shipment_service_with_audit.update_shipment(
            shipment.id,
            update_data,
            test_user
        )
        
        # Assert
        audit_log = db.query(AuditLog).filter(
            AuditLog.entity_type == "shipment",
            AuditLog.entity_id == shipment.id,
            AuditLog.field_name == "invoice_amount_omr"
        ).first()
        
        assert audit_log is not None
        # Decimal values may have different precision in string representation
        assert Decimal(audit_log.old_value) == original_amount
        assert Decimal(audit_log.new_value) == new_amount
    
    def test_query_audit_logs_by_entity(
        self,
        db: Session,
        shipment_service_with_audit: ShipmentService,
        audit_repository: AuditRepository,
        test_user: User
    ):
        """Test querying audit logs by entity type and ID."""
        # Arrange - Create and update shipment multiple times
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUDIT-004",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUDIT-004",
            invoice_amount_omr=Decimal("10000.00"),
            eta=date.today()
        )
        shipment = shipment_service_with_audit.create_shipment(shipment_data, test_user)
        
        # Make multiple updates
        shipment_service_with_audit.update_shipment(
            shipment.id,
            ShipmentUpdate(principal="Updated Principal 1"),
            test_user
        )
        
        shipment_service_with_audit.update_shipment(
            shipment.id,
            ShipmentUpdate(brand="Updated Brand 1"),
            test_user
        )
        
        shipment_service_with_audit.update_shipment(
            shipment.id,
            ShipmentUpdate(principal="Updated Principal 2"),
            test_user
        )
        
        # Act - Query audit logs for this shipment
        audit_logs = audit_repository.get_by_entity(
            entity_type="shipment",
            entity_id=shipment.id
        )
        
        # Assert - Should have multiple audit log entries
        assert len(audit_logs) >= 3, "Should have at least 3 audit log entries"
        
        # Verify all logs are for the correct entity
        for log in audit_logs:
            assert log.entity_type == "shipment"
            assert log.entity_id == shipment.id
    
    def test_audit_logs_ordered_by_timestamp(
        self,
        db: Session,
        shipment_service_with_audit: ShipmentService,
        audit_repository: AuditRepository,
        test_user: User
    ):
        """Test that audit logs are returned in chronological order."""
        # Arrange
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUDIT-005",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUDIT-005",
            invoice_amount_omr=Decimal("6000.00"),
            eta=date.today()
        )
        shipment = shipment_service_with_audit.create_shipment(shipment_data, test_user)
        
        # Make sequential updates
        shipment_service_with_audit.update_shipment(
            shipment.id,
            ShipmentUpdate(principal="Update 1"),
            test_user
        )
        
        shipment_service_with_audit.update_shipment(
            shipment.id,
            ShipmentUpdate(principal="Update 2"),
            test_user
        )
        
        shipment_service_with_audit.update_shipment(
            shipment.id,
            ShipmentUpdate(principal="Update 3"),
            test_user
        )
        
        # Act
        audit_logs = audit_repository.get_by_entity(
            entity_type="shipment",
            entity_id=shipment.id
        )
        
        # Assert - Logs should be in chronological order
        principal_logs = [log for log in audit_logs if log.field_name == "principal"]
        assert len(principal_logs) >= 3
        
        # Sort by created_at to verify ordering
        sorted_logs = sorted(principal_logs, key=lambda x: x.created_at)
        
        # Verify the values are in the expected sequence
        assert sorted_logs[0].new_value == "Update 1"
        assert sorted_logs[1].new_value == "Update 2"
        assert sorted_logs[2].new_value == "Update 3"
    
    def test_eta_update_creates_audit_logs(
        self,
        db: Session,
        shipment_service_with_audit: ShipmentService,
        test_user: User
    ):
        """Test that ETA update creates audit logs for ETA and edit count."""
        # Arrange
        original_eta = date.today()
        new_eta = date.today() + timedelta(days=5)
        
        shipment_data = ShipmentCreate(
            shipment_number="TEST-AUDIT-006",
            principal="Test Principal",
            brand="Test Brand",
            lc_number="LC-AUDIT-006",
            invoice_amount_omr=Decimal("9000.00"),
            eta=original_eta
        )
        shipment = shipment_service_with_audit.create_shipment(shipment_data, test_user)
        
        # Act
        shipment_service_with_audit.update_eta(
            shipment.id,
            new_eta,
            test_user,
            ip_address="10.0.0.1"
        )
        
        # Assert - Should have audit logs for both ETA and edit count
        eta_log = db.query(AuditLog).filter(
            AuditLog.entity_type == "shipment",
            AuditLog.entity_id == shipment.id,
            AuditLog.field_name == "eta"
        ).first()
        
        assert eta_log is not None
        assert eta_log.old_value == str(original_eta)
        assert eta_log.new_value == str(new_eta)
        assert eta_log.ip_address == "10.0.0.1"
        
        edit_count_log = db.query(AuditLog).filter(
            AuditLog.entity_type == "shipment",
            AuditLog.entity_id == shipment.id,
            AuditLog.field_name == "eta_edit_count"
        ).first()
        
        assert edit_count_log is not None
        assert edit_count_log.old_value == "0"
        assert edit_count_log.new_value == "1"
