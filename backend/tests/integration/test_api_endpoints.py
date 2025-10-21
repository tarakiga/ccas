"""Integration tests for API endpoints."""

from datetime import date, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.models.shipment import Shipment
from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.workflow_step_template import WorkflowStepTemplate
from app.services.shipment_service import ShipmentService
from app.services.workflow_service import WorkflowService
from app.services.audit_service import AuditService
from app.schemas.shipment import ShipmentCreate
from app.utils.constants import WORKFLOW_STEP_TEMPLATES


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


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
def workflow_templates(db: Session) -> None:
    """Seed workflow step templates."""
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
def test_shipment(db: Session, test_user: User, workflow_templates) -> Shipment:
    """Create a test shipment with workflow steps."""
    audit_service = AuditService(db)
    workflow_service = WorkflowService(db, audit_service, use_db_templates=True)
    shipment_service = ShipmentService(db, audit_service, workflow_service)
    
    shipment_data = ShipmentCreate(
        shipment_number="TEST-API-001",
        principal="Test Principal",
        brand="Test Brand",
        lc_number="LC-API-001",
        invoice_amount_omr=Decimal("10000.00"),
        eta=date.today() + timedelta(days=7)
    )
    
    return shipment_service.create_shipment(shipment_data, test_user)


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_database_health(self, client):
        """Test database health check."""
        response = client.get("/api/v1/health/db")
        
        # Should return 200 or 503 depending on DB status
        assert response.status_code in [200, 503]
        data = response.json()
        assert data["status"] in ["healthy", "unhealthy"]
        assert data["service"] == "database"
    
    def test_redis_health(self, client):
        """Test Redis health check."""
        response = client.get("/api/v1/health/redis")
        
        # Should return 200 or 503 depending on Redis status
        assert response.status_code in [200, 503]
        data = response.json()
        assert data["status"] in ["healthy", "unhealthy"]
        assert data["service"] == "redis"


class TestShipmentEndpoints:
    """Test shipment API endpoints."""
    
    def test_list_shipments_unauthorized(self, client):
        """Test listing shipments without authentication."""
        response = client.get("/api/v1/shipments")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_get_shipment_by_id_unauthorized(self, client, test_shipment):
        """Test getting shipment by ID without authentication."""
        response = client.get(f"/api/v1/shipments/{test_shipment.id}")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_create_shipment_unauthorized(self, client):
        """Test creating shipment without authentication."""
        shipment_data = {
            "shipment_number": "TEST-UNAUTH-001",
            "principal": "Test Principal",
            "brand": "Test Brand",
            "lc_number": "LC-UNAUTH-001",
            "invoice_amount_omr": "10000.00",
            "eta": str(date.today() + timedelta(days=7))
        }
        
        response = client.post("/api/v1/shipments", json=shipment_data)
        
        # Should require authentication
        assert response.status_code in [401, 403]


class TestWorkflowEndpoints:
    """Test workflow API endpoints."""
    
    def test_get_shipment_workflow_unauthorized(self, client, test_shipment):
        """Test getting shipment workflow without authentication."""
        response = client.get(f"/api/v1/shipments/{test_shipment.id}/workflow")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_complete_workflow_step_unauthorized(self, client, test_shipment):
        """Test completing workflow step without authentication."""
        # Get first workflow step
        step = test_shipment.workflow_steps[0]
        
        complete_data = {
            "actual_date": str(date.today())
        }
        
        response = client.patch(
            f"/api/v1/workflow-steps/{step.id}/complete",
            json=complete_data
        )
        
        # Should require authentication
        assert response.status_code in [401, 403]


class TestAlertEndpoints:
    """Test alert API endpoints."""
    
    def test_list_alerts_unauthorized(self, client):
        """Test listing alerts without authentication."""
        response = client.get("/api/v1/alerts")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_acknowledge_alert_unauthorized(self, client):
        """Test acknowledging alert without authentication."""
        response = client.patch("/api/v1/alerts/1/acknowledge")
        
        # Should require authentication
        assert response.status_code in [401, 403]


class TestMetricsEndpoints:
    """Test metrics API endpoints."""
    
    def test_clearance_time_metrics_unauthorized(self, client):
        """Test getting clearance time metrics without authentication."""
        response = client.get("/api/v1/metrics/clearance-time")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_on_time_rate_unauthorized(self, client):
        """Test getting on-time rate without authentication."""
        response = client.get("/api/v1/metrics/on-time-rate")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_demurrage_savings_unauthorized(self, client):
        """Test getting demurrage savings without authentication."""
        response = client.get("/api/v1/metrics/demurrage-savings")
        
        # Should require authentication
        assert response.status_code in [401, 403]


class TestAuditEndpoints:
    """Test audit log API endpoints."""
    
    def test_list_audit_logs_unauthorized(self, client):
        """Test listing audit logs without authentication."""
        response = client.get("/api/v1/audit-logs")
        
        # Should require authentication
        assert response.status_code in [401, 403]
    
    def test_get_shipment_audit_logs_unauthorized(self, client, test_shipment):
        """Test getting shipment audit logs without authentication."""
        response = client.get(f"/api/v1/audit-logs/shipment/{test_shipment.id}")
        
        # Should require authentication
        assert response.status_code in [401, 403]
