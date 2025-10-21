"""Unit tests for authentication and authorization."""

import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.user_manager import (
    extract_department_from_email,
    assign_default_role,
    get_or_create_user
)
from app.auth.permissions import (
    check_eta_update_permission,
    check_read_only_restriction,
    check_audit_log_access
)
from app.models.user import User


class TestDepartmentExtraction:
    """Test department extraction from email."""
    
    def test_finance_subdomain(self):
        """Test finance subdomain extraction."""
        email = "user@finance.alhashargroup.com"
        assert extract_department_from_email(email) == "Finance"
    
    def test_finance_prefix(self):
        """Test finance prefix extraction."""
        email = "finance.user@alhashargroup.com"
        assert extract_department_from_email(email) == "Finance"
    
    def test_business_unit_prefix(self):
        """Test business unit prefix extraction."""
        email = "bu.user@alhashargroup.com"
        assert extract_department_from_email(email) == "BusinessUnit"
    
    def test_cc_prefix(self):
        """Test C&C prefix extraction."""
        email = "cc.user@alhashargroup.com"
        assert extract_department_from_email(email) == "C&C"
    
    def test_stores_prefix(self):
        """Test stores prefix extraction."""
        email = "stores.user@alhashargroup.com"
        assert extract_department_from_email(email) == "Stores"
    
    def test_ia_prefix(self):
        """Test IA prefix extraction."""
        email = "ia.user@alhashargroup.com"
        assert extract_department_from_email(email) == "IA"
    
    def test_default_department(self):
        """Test default department for unknown email."""
        email = "unknown@alhashargroup.com"
        assert extract_department_from_email(email) == "BusinessUnit"


class TestRoleAssignment:
    """Test role assignment based on department."""
    
    def test_business_unit_role(self):
        """Test BusinessUnit gets PPR role."""
        assert assign_default_role("BusinessUnit") == "PPR"
    
    def test_finance_role(self):
        """Test Finance gets PPR role."""
        assert assign_default_role("Finance") == "PPR"
    
    def test_cc_role(self):
        """Test C&C gets PPR role."""
        assert assign_default_role("C&C") == "PPR"
    
    def test_stores_role(self):
        """Test Stores gets PPR role."""
        assert assign_default_role("Stores") == "PPR"
    
    def test_ia_role(self):
        """Test IA gets ReadOnly role."""
        assert assign_default_role("IA") == "ReadOnly"


class TestUserCreation:
    """Test user creation and retrieval."""
    
    def test_create_new_user(self, db: Session):
        """Test creating a new user."""
        user = get_or_create_user(
            db=db,
            auth0_id="auth0|123456",
            email="finance.user@alhashargroup.com",
            full_name="Finance User"
        )
        
        assert user.auth0_id == "auth0|123456"
        assert user.email == "finance.user@alhashargroup.com"
        assert user.full_name == "Finance User"
        assert user.department == "Finance"
        assert user.role == "PPR"
        assert user.is_active is True
    
    def test_get_existing_user_by_auth0_id(self, db: Session):
        """Test retrieving existing user by auth0_id."""
        # Create user
        user1 = get_or_create_user(
            db=db,
            auth0_id="auth0|123456",
            email="test@alhashargroup.com"
        )
        
        # Get same user
        user2 = get_or_create_user(
            db=db,
            auth0_id="auth0|123456",
            email="test@alhashargroup.com"
        )
        
        assert user1.id == user2.id
    
    def test_update_email_for_existing_user(self, db: Session):
        """Test updating email for existing user."""
        # Create user
        user1 = get_or_create_user(
            db=db,
            auth0_id="auth0|123456",
            email="old@alhashargroup.com"
        )
        
        # Update email
        user2 = get_or_create_user(
            db=db,
            auth0_id="auth0|123456",
            email="new@alhashargroup.com"
        )
        
        assert user1.id == user2.id
        assert user2.email == "new@alhashargroup.com"


class TestETAUpdatePermission:
    """Test ETA update permission checks."""
    
    def test_business_unit_can_update_eta(self):
        """Test Business Unit user can update ETA."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="bu@test.com",
            full_name="BU User",
            department="BusinessUnit",
            role="PPR",
            is_active=True
        )
        
        # Should not raise exception
        check_eta_update_permission(user)
    
    def test_non_business_unit_cannot_update_eta(self):
        """Test non-Business Unit user cannot update ETA."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="finance@test.com",
            full_name="Finance User",
            department="Finance",
            role="PPR",
            is_active=True
        )
        
        with pytest.raises(HTTPException) as exc_info:
            check_eta_update_permission(user)
        
        assert exc_info.value.status_code == 403


class TestReadOnlyRestriction:
    """Test read-only access restrictions."""
    
    def test_read_only_user_cannot_modify(self):
        """Test read-only user cannot perform write operations."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="ia@test.com",
            full_name="IA User",
            department="IA",
            role="ReadOnly",
            is_active=True
        )
        
        with pytest.raises(HTTPException) as exc_info:
            check_read_only_restriction(user)
        
        assert exc_info.value.status_code == 403
    
    def test_ppr_user_can_modify(self):
        """Test PPR user can perform write operations."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="finance@test.com",
            full_name="Finance User",
            department="Finance",
            role="PPR",
            is_active=True
        )
        
        # Should not raise exception
        check_read_only_restriction(user)


class TestAuditLogAccess:
    """Test audit log access permissions."""
    
    def test_admin_can_access_audit_logs(self):
        """Test Admin can access audit logs."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="admin@test.com",
            full_name="Admin User",
            department="BusinessUnit",
            role="Admin",
            is_active=True
        )
        
        # Should not raise exception
        check_audit_log_access(user)
    
    def test_ia_can_access_audit_logs(self):
        """Test IA department can access audit logs."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="ia@test.com",
            full_name="IA User",
            department="IA",
            role="ReadOnly",
            is_active=True
        )
        
        # Should not raise exception
        check_audit_log_access(user)
    
    def test_regular_user_cannot_access_audit_logs(self):
        """Test regular user cannot access audit logs."""
        user = User(
            id=1,
            auth0_id="auth0|123",
            email="finance@test.com",
            full_name="Finance User",
            department="Finance",
            role="PPR",
            is_active=True
        )
        
        with pytest.raises(HTTPException) as exc_info:
            check_audit_log_access(user)
        
        assert exc_info.value.status_code == 403
