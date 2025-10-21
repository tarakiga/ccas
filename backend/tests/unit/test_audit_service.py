"""Unit tests for AuditService."""

import pytest
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy.orm import Session

from app.services.audit_service import AuditService
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogFilters


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user."""
    user = User(
        auth0_id="test_auth0_id",
        email="test@alhashargroup.com",
        full_name="Test User",
        department="Business Unit",
        role="PPR",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def audit_service(db: Session) -> AuditService:
    """Create an AuditService instance."""
    return AuditService(db)


def test_log_change_creates_audit_entry(
    db: Session,
    audit_service: AuditService,
    test_user: User
):
    """Test that log_change creates an audit log entry."""
    # Log a change
    audit_log = audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="eta",
        old_value="2024-12-01",
        new_value="2024-12-05",
        user=test_user,
        ip_address="192.168.1.100"
    )
    
    # Verify audit log was created
    assert audit_log.id is not None
    assert audit_log.entity_type == "shipment"
    assert audit_log.entity_id == 1
    assert audit_log.field_name == "eta"
    assert audit_log.old_value == "2024-12-01"
    assert audit_log.new_value == "2024-12-05"
    assert audit_log.user_id == test_user.id
    assert audit_log.ip_address == "192.168.1.100"
    assert audit_log.created_at is not None


def test_log_change_with_none_values(
    audit_service: AuditService,
    test_user: User
):
    """Test logging a change with None values."""
    audit_log = audit_service.log_change(
        entity_type="workflow_step",
        entity_id=5,
        field_name="actual_date",
        old_value=None,
        new_value="2024-12-10",
        user=test_user,
        ip_address=None
    )
    
    assert audit_log.old_value is None
    assert audit_log.new_value == "2024-12-10"
    assert audit_log.ip_address is None


def test_log_change_serializes_date_objects(
    audit_service: AuditService,
    test_user: User
):
    """Test that date objects are properly serialized."""
    old_date = date(2024, 12, 1)
    new_date = date(2024, 12, 5)
    
    audit_log = audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="eta",
        old_value=old_date,
        new_value=new_date,
        user=test_user
    )
    
    assert audit_log.old_value == "2024-12-01"
    assert audit_log.new_value == "2024-12-05"


def test_log_change_serializes_numeric_values(
    audit_service: AuditService,
    test_user: User
):
    """Test that numeric values are properly serialized."""
    audit_log = audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="eta_edit_count",
        old_value=0,
        new_value=1,
        user=test_user
    )
    
    assert audit_log.old_value == "0"
    assert audit_log.new_value == "1"


def test_query_logs_with_no_filters(
    db: Session,
    audit_service: AuditService,
    test_user: User
):
    """Test querying logs with no filters."""
    # Create some audit logs
    for i in range(3):
        audit_service.log_change(
            entity_type="shipment",
            entity_id=i + 1,
            field_name="status",
            old_value="active",
            new_value="completed",
            user=test_user
        )
    
    # Query all logs
    filters = AuditLogFilters(page=1, size=50)
    page = audit_service.query_logs(filters)
    
    assert page.total == 3
    assert len(page.items) == 3
    assert page.page == 1
    assert page.pages == 1


def test_query_logs_with_entity_type_filter(
    db: Session,
    audit_service: AuditService,
    test_user: User
):
    """Test querying logs filtered by entity type."""
    # Create audit logs for different entity types
    audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="eta",
        old_value="2024-12-01",
        new_value="2024-12-05",
        user=test_user
    )
    audit_service.log_change(
        entity_type="workflow_step",
        entity_id=1,
        field_name="status",
        old_value="pending",
        new_value="completed",
        user=test_user
    )
    
    # Query only shipment logs
    filters = AuditLogFilters(entity_type="shipment", page=1, size=50)
    page = audit_service.query_logs(filters)
    
    assert page.total == 1
    assert page.items[0].entity_type == "shipment"


def test_query_logs_with_entity_id_filter(
    db: Session,
    audit_service: AuditService,
    test_user: User
):
    """Test querying logs filtered by entity ID."""
    # Create audit logs for different entities
    audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="eta",
        old_value="2024-12-01",
        new_value="2024-12-05",
        user=test_user
    )
    audit_service.log_change(
        entity_type="shipment",
        entity_id=2,
        field_name="eta",
        old_value="2024-12-10",
        new_value="2024-12-15",
        user=test_user
    )
    
    # Query only entity ID 1
    filters = AuditLogFilters(entity_id=1, page=1, size=50)
    page = audit_service.query_logs(filters)
    
    assert page.total == 1
    assert page.items[0].entity_id == 1


def test_query_logs_with_pagination(
    db: Session,
    audit_service: AuditService,
    test_user: User
):
    """Test querying logs with pagination."""
    # Create 10 audit logs
    for i in range(10):
        audit_service.log_change(
            entity_type="shipment",
            entity_id=i + 1,
            field_name="status",
            old_value="active",
            new_value="completed",
            user=test_user
        )
    
    # Query first page (size 5)
    filters = AuditLogFilters(page=1, size=5)
    page = audit_service.query_logs(filters)
    
    assert page.total == 10
    assert len(page.items) == 5
    assert page.page == 1
    assert page.pages == 2
    
    # Query second page
    filters = AuditLogFilters(page=2, size=5)
    page = audit_service.query_logs(filters)
    
    assert page.total == 10
    assert len(page.items) == 5
    assert page.page == 2


def test_get_entity_audit_trail(
    db: Session,
    audit_service: AuditService,
    test_user: User
):
    """Test getting complete audit trail for an entity."""
    # Create multiple changes for the same entity
    audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="eta",
        old_value="2024-12-01",
        new_value="2024-12-05",
        user=test_user
    )
    audit_service.log_change(
        entity_type="shipment",
        entity_id=1,
        field_name="status",
        old_value="active",
        new_value="completed",
        user=test_user
    )
    audit_service.log_change(
        entity_type="shipment",
        entity_id=2,
        field_name="eta",
        old_value="2024-12-10",
        new_value="2024-12-15",
        user=test_user
    )
    
    # Get audit trail for entity 1
    logs = audit_service.get_entity_audit_trail("shipment", 1)
    
    assert len(logs) == 2
    assert all(log.entity_type == "shipment" for log in logs)
    assert all(log.entity_id == 1 for log in logs)
