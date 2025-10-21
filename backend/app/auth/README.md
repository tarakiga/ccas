# Authentication and Authorization

This module provides Auth0-based JWT authentication and role-based access control (RBAC) for the Customs Clearance API.

## Overview

The authentication system consists of three main components:

1. **Auth0 Integration** (`auth0.py`) - JWT token validation
2. **User Management** (`user_manager.py`) - User creation and department mapping
3. **Permissions** (`permissions.py`) - Role-based access control

## Quick Start

### Protecting Routes

```python
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"user": current_user.email, "department": current_user.department}
```

### Department-Specific Access

```python
from app.auth import require_business_unit

@router.patch("/shipments/{id}/eta")
async def update_eta(
    id: int,
    user: User = Depends(require_business_unit)
):
    # Only Business Unit users can access this
    return {"status": "updated"}
```

### Custom Permission Checks

```python
from app.auth import require_department_access

@router.get("/finance-data")
async def get_finance_data(
    user: User = Depends(require_department_access("Finance", "IA"))
):
    # Only Finance and IA departments can access
    return {"data": "sensitive"}
```

## Department Mapping

Users are automatically assigned to departments based on their email address:

| Email Pattern | Department |
|--------------|------------|
| `finance@*` or `*.finance.*` | Finance |
| `bu@*` or `*.bu.*` or `business@*` | BusinessUnit |
| `cc@*` or `*.cc.*` or `customs@*` or `clearance@*` | C&C |
| `stores@*` or `*.stores.*` or `warehouse@*` | Stores |
| `ia@*` or `*.ia.*` or `audit@*` | IA |
| Other | BusinessUnit (default) |

## Role Assignment

Default roles are assigned based on department:

| Department | Default Role |
|-----------|-------------|
| BusinessUnit | PPR |
| Finance | PPR |
| C&C | PPR |
| Stores | PPR |
| IA | ReadOnly |

## Permission Checkers

### Pre-built Dependencies

- `get_current_user` - Get authenticated user
- `require_write_access` - Ensure user is not read-only
- `require_eta_update_permission` - Business Unit only
- `require_audit_access` - Admin and IA only
- `require_business_unit` - Business Unit department only
- `require_finance` - Finance department only
- `require_cc` - C&C department only
- `require_stores` - Stores department only
- `require_admin` - Admin role only
- `require_manager` - Manager or Admin role

### Custom Permission Functions

```python
from app.auth.permissions import (
    check_eta_update_permission,
    check_workflow_step_completion_permission,
    check_read_only_restriction,
    check_audit_log_access,
    check_shipment_access
)

# In your service or route handler
def update_eta(user: User, shipment: Shipment):
    check_eta_update_permission(user)
    # Proceed with update
    
def complete_step(user: User, step: WorkflowStep, db: Session):
    check_workflow_step_completion_permission(user, step, db)
    # Proceed with completion
```

## Access Control Rules

### ETA Updates
- **Allowed**: Business Unit department only
- **Reason**: Business Unit manages shipment arrival information

### Workflow Step Completion
- **Allowed**: PPR or APR assigned to the specific step
- **Reason**: Only responsible parties can mark steps complete

### Audit Log Access
- **Allowed**: Admin role and IA department
- **Reason**: Audit logs contain sensitive change history

### Read-Only Access
- **Restriction**: IA department (ReadOnly role) cannot modify data
- **Reason**: IA is for monitoring and auditing only

## Token Validation

The system validates Auth0 JWT tokens with the following checks:

1. **Signature Verification** - Using Auth0 public keys (JWKS)
2. **Expiration Check** - Token must not be expired
3. **Audience Validation** - Token must match configured audience
4. **Issuer Validation** - Token must be from configured Auth0 domain
5. **Required Claims** - Token must contain `sub` (auth0_id) and `email`

## Configuration

Required environment variables:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_ALGORITHMS=["RS256"]
```

## Error Responses

### 401 Unauthorized
- Missing or invalid token
- Expired token
- Missing required claims

### 403 Forbidden
- Insufficient permissions
- Department access denied
- Role access denied
- Read-only restriction
- Not assigned to workflow step

## Testing

Mock authentication in tests:

```python
from app.auth import get_current_user
from app.models.user import User

def test_protected_route(client):
    # Create mock user
    mock_user = User(
        id=1,
        auth0_id="auth0|test",
        email="test@test.com",
        full_name="Test User",
        department="Finance",
        role="PPR",
        is_active=True
    )
    
    # Override dependency
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Make request
    response = client.get("/protected")
    
    # Clean up
    app.dependency_overrides.clear()
```

## User Creation Flow

1. User authenticates with Auth0 (frontend)
2. Frontend sends JWT token in `Authorization: Bearer <token>` header
3. Backend validates token and extracts claims
4. System checks if user exists by `auth0_id`
5. If not found, checks by `email` (for migration)
6. If still not found, creates new user with:
   - Department extracted from email
   - Default role based on department
   - Full name from token or derived from email
7. Returns User object for use in route handlers

## Best Practices

1. **Always use dependencies** - Don't manually validate tokens
2. **Check permissions early** - Use dependencies at route level when possible
3. **Log access denials** - All permission checks log warnings for denied access
4. **Use specific checkers** - Prefer `require_business_unit` over manual checks
5. **Test with real scenarios** - Test both allowed and denied access cases
