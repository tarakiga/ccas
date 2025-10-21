"""Role-based access control (RBAC) and permission checking."""

import logging
from typing import List, Optional, Callable
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workflow_step import WorkflowStep
from app.auth.user_manager import get_current_user
from app.database import get_db

logger = logging.getLogger(__name__)


class PermissionChecker:
    """Base class for permission checking."""
    
    def __init__(self, allowed_departments: Optional[List[str]] = None,
                 allowed_roles: Optional[List[str]] = None):
        """
        Initialize permission checker.
        
        Args:
            allowed_departments: List of departments that have access
            allowed_roles: List of roles that have access
        """
        self.allowed_departments = allowed_departments or []
        self.allowed_roles = allowed_roles or []
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has required permissions.
        
        Args:
            current_user: Current authenticated user
            
        Returns:
            User object if authorized
            
        Raises:
            HTTPException: 403 if user lacks required permissions
        """
        # Check department access
        if self.allowed_departments and current_user.department not in self.allowed_departments:
            logger.warning(
                f"User {current_user.email} from {current_user.department} "
                f"attempted to access resource requiring departments: {self.allowed_departments}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted to departments: {', '.join(self.allowed_departments)}"
            )
        
        # Check role access
        if self.allowed_roles and current_user.role not in self.allowed_roles:
            logger.warning(
                f"User {current_user.email} with role {current_user.role} "
                f"attempted to access resource requiring roles: {self.allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted to roles: {', '.join(self.allowed_roles)}"
            )
        
        return current_user


# Department-based permission checkers
require_business_unit = PermissionChecker(allowed_departments=["BusinessUnit"])
require_finance = PermissionChecker(allowed_departments=["Finance"])
require_cc = PermissionChecker(allowed_departments=["C&C"])
require_stores = PermissionChecker(allowed_departments=["Stores"])

# Role-based permission checkers
require_admin = PermissionChecker(allowed_roles=["Admin"])
require_manager = PermissionChecker(allowed_roles=["Manager", "Admin"])


def require_department_access(*departments: str) -> Callable:
    """
    Create a permission checker for specific departments.
    
    Args:
        *departments: Department names that should have access
        
    Returns:
        Permission checker dependency
        
    Example:
        @app.get("/finance-data")
        async def get_finance_data(
            user: User = Depends(require_department_access("Finance", "IA"))
        ):
            return {"data": "sensitive"}
    """
    return PermissionChecker(allowed_departments=list(departments))


def require_role(*roles: str) -> Callable:
    """
    Create a permission checker for specific roles.
    
    Args:
        *roles: Role names that should have access
        
    Returns:
        Permission checker dependency
        
    Example:
        @app.post("/admin-action")
        async def admin_action(
            user: User = Depends(require_role("Admin", "Manager"))
        ):
            return {"status": "success"}
    """
    return PermissionChecker(allowed_roles=list(roles))


def check_eta_update_permission(user: User) -> None:
    """
    Check if user has permission to update ETA.
    Only Business Unit department can update ETA.
    
    Args:
        user: Current user
        
    Raises:
        HTTPException: 403 if user is not from Business Unit department
    """
    if user.department != "BusinessUnit":
        logger.warning(
            f"User {user.email} from {user.department} "
            f"attempted to update ETA (restricted to Business Unit)"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ETA updates are restricted to Business Unit department"
        )


def check_workflow_step_completion_permission(
    user: User,
    workflow_step: WorkflowStep,
    db: Session
) -> None:
    """
    Check if user has permission to complete a workflow step.
    User must be assigned as PPR or APR for the step.
    
    Args:
        user: Current user
        workflow_step: Workflow step to be completed
        db: Database session
        
    Raises:
        HTTPException: 403 if user is not PPR or APR for the step
    """
    # Check if user is PPR or APR for this step
    is_ppr = workflow_step.ppr_user_id == user.id
    is_apr = workflow_step.apr_user_id == user.id if workflow_step.apr_user_id else False
    
    if not (is_ppr or is_apr):
        logger.warning(
            f"User {user.email} (ID: {user.id}) attempted to complete step {workflow_step.id} "
            f"but is not assigned as PPR (ID: {workflow_step.ppr_user_id}) "
            f"or APR (ID: {workflow_step.apr_user_id})"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to complete this workflow step. "
                   "Only assigned PPR or APR can complete this step."
        )


def check_read_only_restriction(user: User, operation: str = "modify") -> None:
    """
    Check if user has read-only access and prevent write operations.
    IA department has read-only access to all data.
    
    Args:
        user: Current user
        operation: Description of the operation being attempted
        
    Raises:
        HTTPException: 403 if user has read-only role
    """
    if user.role == "ReadOnly":
        logger.warning(
            f"User {user.email} with ReadOnly role attempted to {operation}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has read-only access. You cannot modify data."
        )


def check_audit_log_access(user: User) -> None:
    """
    Check if user has permission to access audit logs.
    Only Admin and IA roles can access audit logs.
    
    Args:
        user: Current user
        
    Raises:
        HTTPException: 403 if user is not Admin or IA
    """
    if user.role not in ["Admin", "ReadOnly"] and user.department != "IA":
        logger.warning(
            f"User {user.email} (Role: {user.role}, Dept: {user.department}) "
            f"attempted to access audit logs"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Audit log access is restricted to Admin and IA roles"
        )


def check_shipment_access(user: User, shipment_department: Optional[str] = None) -> None:
    """
    Check if user has access to shipment data.
    Users can access shipments related to their department.
    IA and Admin roles have access to all shipments.
    
    Args:
        user: Current user
        shipment_department: Department associated with the shipment (optional)
        
    Raises:
        HTTPException: 403 if user lacks access
    """
    # Admin and IA have access to all shipments
    if user.role == "Admin" or user.department == "IA":
        return
    
    # If shipment department is specified, check if user's department matches
    if shipment_department and user.department != shipment_department:
        logger.warning(
            f"User {user.email} from {user.department} "
            f"attempted to access shipment from {shipment_department}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this shipment"
        )


def filter_workflow_steps_by_department(
    user: User,
    workflow_steps: List[WorkflowStep]
) -> List[WorkflowStep]:
    """
    Filter workflow steps based on user's department access.
    
    - IA and Admin: See all steps
    - Other departments: See only steps for their department
    
    Args:
        user: Current user
        workflow_steps: List of workflow steps to filter
        
    Returns:
        Filtered list of workflow steps
    """
    # Admin and IA see all steps
    if user.role == "Admin" or user.department == "IA":
        return workflow_steps
    
    # Filter by department
    filtered_steps = [
        step for step in workflow_steps
        if step.department == user.department
    ]
    
    return filtered_steps


# Dependency for routes that require non-read-only access
async def require_write_access(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user has write access (not read-only).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if authorized
        
    Raises:
        HTTPException: 403 if user has read-only access
    """
    check_read_only_restriction(current_user, "perform write operations")
    return current_user


# Dependency for ETA update routes
async def require_eta_update_permission(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user can update ETA (Business Unit only).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if authorized
        
    Raises:
        HTTPException: 403 if user is not from Business Unit
    """
    check_eta_update_permission(current_user)
    return current_user


# Dependency for audit log access
async def require_audit_access(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to ensure user can access audit logs (Admin and IA only).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if authorized
        
    Raises:
        HTTPException: 403 if user lacks audit access
    """
    check_audit_log_access(current_user)
    return current_user
