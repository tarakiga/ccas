"""Unit tests for MetricsService."""

import pytest
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

from app.services.metrics_service import MetricsService
from app.models.shipment import Shipment, ShipmentStatus
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.user import User
from app.schemas.metrics import DateRange


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
def metrics_service(db: Session) -> MetricsService:
    """Create a MetricsService instance."""
    return MetricsService(db)


def test_get_average_clearance_time_no_shipments(metrics_service: MetricsService):
    """Test average clearance time with no shipments."""
    date_range = DateRange(
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31)
    )
    
    result = metrics_service.get_average_clearance_time(date_range)
    
    assert result.overall_average_days == 0.0
    assert result.total_shipments == 0
    assert len(result.by_department) == 0


def test_get_on_time_rate_no_shipments(metrics_service: MetricsService):
    """Test on-time rate with no shipments."""
    date_range = DateRange(
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31)
    )
    
    result = metrics_service.get_on_time_rate(date_range)
    
    assert result.on_time_count == 0
    assert result.total_count == 0
    assert result.on_time_percentage == 0.0
    assert result.late_count == 0


def test_calculate_demurrage_savings_no_shipments(metrics_service: MetricsService):
    """Test demurrage savings with no shipments."""
    date_range = DateRange(
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31)
    )
    
    result = metrics_service.calculate_demurrage_savings(date_range)
    
    assert result.on_time_clearances == 0
    assert result.estimated_savings_omr == Decimal("0.00")
    assert result.average_days_saved == 0.0


def test_get_delayed_steps_by_department_no_steps(metrics_service: MetricsService):
    """Test delayed steps with no delayed steps."""
    date_range = DateRange(
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31)
    )
    
    result = metrics_service.get_delayed_steps_by_department(date_range)
    
    assert result.total_delayed_steps == 0
    assert len(result.by_department) == 0


def test_get_average_clearance_time_with_completed_shipment(
    db: Session,
    metrics_service: MetricsService,
    test_user: User
):
    """Test average clearance time with a completed shipment."""
    # Create a completed shipment
    eta = date(2024, 6, 1)
    shipment = Shipment(
        shipment_number="SHP-2024-001",
        principal="Test Principal",
        brand="Test Brand",
        lc_number="LC-001",
        invoice_amount_omr=Decimal("10000.00"),
        eta=eta,
        status=ShipmentStatus.COMPLETED,
        created_by_id=test_user.id
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    
    # Create a completed workflow step (cleared in 5 days)
    completion_date = eta + timedelta(days=5)
    step = WorkflowStep(
        shipment_id=shipment.id,
        step_number=Decimal("9.0"),
        step_name="Bayan submission",
        department="C&C",
        target_date=eta,
        offset_days=0,
        actual_date=completion_date,
        status=StepStatus.COMPLETED,
        is_critical=True,
        ppr_user_id=test_user.id
    )
    db.add(step)
    db.commit()
    
    # Calculate metrics
    date_range = DateRange(start_date=date(2024, 1, 1), end_date=date(2024, 12, 31))
    result = metrics_service.get_average_clearance_time(date_range)
    
    assert result.overall_average_days == 5.0
    assert result.total_shipments == 1
    assert len(result.by_department) == 1
    assert result.by_department[0].department == "C&C"
    assert result.by_department[0].average_days == 5.0


def test_get_on_time_rate_with_on_time_shipment(
    db: Session,
    metrics_service: MetricsService,
    test_user: User
):
    """Test on-time rate with an on-time shipment."""
    # Create a completed shipment
    eta = date(2024, 6, 1)
    shipment = Shipment(
        shipment_number="SHP-2024-001",
        principal="Test Principal",
        brand="Test Brand",
        lc_number="LC-001",
        invoice_amount_omr=Decimal("10000.00"),
        eta=eta,
        status=ShipmentStatus.COMPLETED,
        created_by_id=test_user.id
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    
    # Create critical steps completed within 7 days
    for i in range(3):
        step = WorkflowStep(
            shipment_id=shipment.id,
            step_number=Decimal(f"{9 + i}.0"),
            step_name=f"Step {9 + i}",
            department="C&C",
            target_date=eta + timedelta(days=i),
            offset_days=i,
            actual_date=eta + timedelta(days=i + 2),
            status=StepStatus.COMPLETED,
            is_critical=True,
            ppr_user_id=test_user.id
        )
        db.add(step)
    db.commit()
    
    # Calculate metrics
    date_range = DateRange(start_date=date(2024, 1, 1), end_date=date(2024, 12, 31))
    result = metrics_service.get_on_time_rate(date_range)
    
    assert result.on_time_count == 1
    assert result.total_count == 1
    assert result.on_time_percentage == 100.0
    assert result.late_count == 0


def test_get_delayed_steps_by_department_with_delayed_step(
    db: Session,
    metrics_service: MetricsService,
    test_user: User
):
    """Test delayed steps with a delayed step."""
    # Create a shipment
    eta = date(2024, 6, 1)
    shipment = Shipment(
        shipment_number="SHP-2024-001",
        principal="Test Principal",
        brand="Test Brand",
        lc_number="LC-001",
        invoice_amount_omr=Decimal("10000.00"),
        eta=eta,
        status=ShipmentStatus.ACTIVE,
        created_by_id=test_user.id
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    
    # Create a delayed workflow step (target: Day 3, actual: Day 6)
    target_date = eta + timedelta(days=3)
    actual_date = eta + timedelta(days=6)
    step = WorkflowStep(
        shipment_id=shipment.id,
        step_number=Decimal("10.0"),
        step_name="Customs duty payment",
        department="Finance",
        target_date=target_date,
        offset_days=3,
        actual_date=actual_date,
        status=StepStatus.COMPLETED,
        is_critical=True,
        ppr_user_id=test_user.id
    )
    db.add(step)
    db.commit()
    
    # Calculate metrics
    date_range = DateRange(start_date=date(2024, 1, 1), end_date=date(2024, 12, 31))
    result = metrics_service.get_delayed_steps_by_department(date_range)
    
    assert result.total_delayed_steps == 1
    assert "Finance" in result.by_department
    assert len(result.by_department["Finance"]) == 1
    assert result.by_department["Finance"][0].days_delayed == 3
    assert result.by_department["Finance"][0].step_name == "Customs duty payment"
