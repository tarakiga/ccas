"""Authentication and authorization module."""

from app.auth.auth0 import get_token_payload, token_validator
from app.auth.user_manager import (
    get_current_user,
    get_or_create_user,
    extract_department_from_email,
    assign_default_role
)
from app.auth.permissions import (
    PermissionChecker,
    require_business_unit,
    require_finance,
    require_cc,
    require_stores,
    require_admin,
    require_manager,
    require_department_access,
    require_role,
    require_write_access,
    require_eta_update_permission,
    require_audit_access,
    check_eta_update_permission,
    check_workflow_step_completion_permission,
    check_read_only_restriction,
    check_audit_log_access,
    check_shipment_access,
    filter_workflow_steps_by_department
)

__all__ = [
    # Auth0 integration
    "get_token_payload",
    "token_validator",
    
    # User management
    "get_current_user",
    "get_or_create_user",
    "extract_department_from_email",
    "assign_default_role",
    
    # Permission checkers
    "PermissionChecker",
    "require_business_unit",
    "require_finance",
    "require_cc",
    "require_stores",
    "require_admin",
    "require_manager",
    "require_department_access",
    "require_role",
    "require_write_access",
    "require_eta_update_permission",
    "require_audit_access",
    
    # Permission check functions
    "check_eta_update_permission",
    "check_workflow_step_completion_permission",
    "check_read_only_restriction",
    "check_audit_log_access",
    "check_shipment_access",
    "filter_workflow_steps_by_department",
]
