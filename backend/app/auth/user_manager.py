"""User management for Auth0 integration."""

import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import Depends

from app.models.user import User
from app.database import get_db
from app.auth.auth0 import get_token_payload

logger = logging.getLogger(__name__)


# Department mapping based on email domain
DEPARTMENT_MAPPING = {
    "business": "BusinessUnit",
    "bu": "BusinessUnit",
    "finance": "Finance",
    "cc": "C&C",
    "customs": "C&C",
    "clearance": "C&C",
    "stores": "Stores",
    "warehouse": "Stores",
    "ia": "IA",
    "audit": "IA",
}

# Default role assignment based on department
DEFAULT_ROLE_BY_DEPARTMENT = {
    "BusinessUnit": "PPR",
    "Finance": "PPR",
    "C&C": "PPR",
    "Stores": "PPR",
    "IA": "ReadOnly",
}


def extract_department_from_email(email: str) -> str:
    """
    Extract department from user email address.
    
    Maps email domain or username prefix to department.
    Examples:
        - finance@alhashargroup.com -> Finance
        - john.doe@finance.alhashargroup.com -> Finance
        - bu.user@alhashargroup.com -> BusinessUnit
    
    Args:
        email: User email address
        
    Returns:
        Department name (BusinessUnit, Finance, C&C, Stores, IA)
        Defaults to BusinessUnit if no match found
    """
    email_lower = email.lower()
    
    # Check email domain parts
    email_parts = email_lower.split("@")
    if len(email_parts) == 2:
        local_part, domain_part = email_parts
        
        # Check subdomain (e.g., finance.alhashargroup.com)
        domain_segments = domain_part.split(".")
        if len(domain_segments) > 2:
            subdomain = domain_segments[0]
            if subdomain in DEPARTMENT_MAPPING:
                return DEPARTMENT_MAPPING[subdomain]
        
        # Check local part prefix (e.g., finance.user or bu_user)
        local_segments = local_part.replace("_", ".").split(".")
        for segment in local_segments:
            if segment in DEPARTMENT_MAPPING:
                return DEPARTMENT_MAPPING[segment]
    
    # Default to BusinessUnit if no match
    logger.warning(
        f"Could not determine department from email: {email}, defaulting to BusinessUnit"
    )
    return "BusinessUnit"


def assign_default_role(department: str) -> str:
    """
    Assign default role based on department.
    
    Args:
        department: Department name
        
    Returns:
        Role name (PPR, APR, Manager, Admin, ReadOnly)
    """
    return DEFAULT_ROLE_BY_DEPARTMENT.get(department, "PPR")


def get_or_create_user(
    db: Session,
    auth0_id: str,
    email: str,
    full_name: Optional[str] = None
) -> User:
    """
    Get existing user or create new user from Auth0 token claims.
    
    This function implements the "get or create" pattern:
    1. Try to find user by auth0_id
    2. If not found, try to find by email (for migration scenarios)
    3. If still not found, create new user with department and role mapping
    
    Args:
        db: Database session
        auth0_id: Auth0 user identifier (from 'sub' claim)
        email: User email address (from 'email' claim)
        full_name: User's full name (optional, from 'name' claim)
        
    Returns:
        User object (existing or newly created)
    """
    # Try to find user by auth0_id
    user = db.query(User).filter(User.auth0_id == auth0_id).first()
    
    if user:
        # Update email if changed
        if user.email != email:
            logger.info(
                f"Updating email for user {user.id}: {user.email} -> {email}"
            )
            user.email = email
            db.commit()
            db.refresh(user)
        
        return user
    
    # Try to find by email (for migration scenarios)
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update auth0_id for existing user
        logger.info(
            f"Linking existing user {user.id} ({email}) to Auth0 ID: {auth0_id}"
        )
        user.auth0_id = auth0_id
        db.commit()
        db.refresh(user)
        return user
    
    # Create new user
    department = extract_department_from_email(email)
    role = assign_default_role(department)
    
    # Use email username as full_name if not provided
    if not full_name:
        full_name = email.split("@")[0].replace(".", " ").title()
    
    user = User(
        auth0_id=auth0_id,
        email=email,
        full_name=full_name,
        department=department,
        role=role,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(
        f"Created new user: {user.id} ({email}) - Department: {department}, Role: {role}"
    )
    
    return user


async def get_current_user(
    token_payload: Dict[str, Any] = Depends(get_token_payload),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency function to get current authenticated user.
    
    This function:
    1. Extracts user claims from validated JWT token
    2. Gets or creates user in database
    3. Returns User object for use in route handlers
    
    Args:
        token_payload: Validated JWT token payload
        db: Database session
        
    Returns:
        Current authenticated User object
        
    Raises:
        HTTPException: If user is inactive
        
    Example:
        @app.get("/me")
        async def get_me(current_user: User = Depends(get_current_user)):
            return {"email": current_user.email, "department": current_user.department}
    """
    from fastapi import HTTPException, status
    
    # Extract claims
    auth0_id = token_payload.get("sub")
    email = token_payload.get("email")
    full_name = token_payload.get("name")
    
    # Get or create user
    user = get_or_create_user(
        db=db,
        auth0_id=auth0_id,
        email=email,
        full_name=full_name
    )
    
    # Check if user is active
    if not user.is_active:
        logger.warning(f"Inactive user attempted to access system: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user
