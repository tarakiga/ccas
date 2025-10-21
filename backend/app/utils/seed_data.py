"""Seed data for initial users and workflow step templates."""

from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.constants import WORKFLOW_STEP_TEMPLATES


# Initial users based on responsibility matrix from PRD
SEED_USERS: List[Dict[str, Any]] = [
    # Business Unit (TBLE)
    {
        "auth0_id": "auth0|rajendran",
        "email": "rajendran@alhashargroup.com",
        "full_name": "Rajendran P.",
        "department": "BusinessUnit",
        "role": "PPR",
        "is_active": True
    },
    {
        "auth0_id": "auth0|rajnair",
        "email": "rajnair@alhashargroup.com",
        "full_name": "Raj Nair",
        "department": "BusinessUnit",
        "role": "APR",
        "is_active": True
    },
    # Finance
    {
        "auth0_id": "auth0|bala",
        "email": "bala@alhashargroup.com",
        "full_name": "Bala",
        "department": "Finance",
        "role": "PPR",
        "is_active": True
    },
    {
        "auth0_id": "auth0|mario",
        "email": "mario@alhashargroup.com",
        "full_name": "Mario",
        "department": "Finance",
        "role": "APR",
        "is_active": True
    },
    # C&C (Customs and Clearance)
    {
        "auth0_id": "auth0|salim",
        "email": "salim@alhashargroup.com",
        "full_name": "Salim",
        "department": "C&C",
        "role": "PPR",
        "is_active": True
    },
    {
        "auth0_id": "auth0|moataz",
        "email": "moataz@alhashargroup.com",
        "full_name": "Moataz",
        "department": "C&C",
        "role": "APR",
        "is_active": True
    },
    # Stores
    {
        "auth0_id": "auth0|stores_ppr",
        "email": "stores@alhashargroup.com",
        "full_name": "Stores Manager",
        "department": "Stores",
        "role": "PPR",
        "is_active": True
    },
    {
        "auth0_id": "auth0|stores_apr",
        "email": "stores_alt@alhashargroup.com",
        "full_name": "Stores Alternate",
        "department": "Stores",
        "role": "APR",
        "is_active": True
    },
    # IA (Internal Audit) - Read-only
    {
        "auth0_id": "auth0|simon",
        "email": "simon.turner@alhashargroup.com",
        "full_name": "Simon Turner",
        "department": "IA",
        "role": "ReadOnly",
        "is_active": True
    },
    # Management - Read-only
    {
        "auth0_id": "auth0|rajeev",
        "email": "rajeev.sharma@alhashargroup.com",
        "full_name": "Rajeev Sharma",
        "department": "IA",
        "role": "Manager",
        "is_active": True
    }
]


def seed_users(db: Session) -> List[User]:
    """
    Seed initial users into the database.
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        List of created User objects
        
    Note:
        This function is idempotent - it will skip users that already exist
        based on email address.
    """
    created_users = []
    
    for user_data in SEED_USERS:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        
        if existing_user:
            print(f"User {user_data['email']} already exists, skipping...")
            continue
        
        # Create new user
        user = User(**user_data)
        db.add(user)
        created_users.append(user)
        print(f"Created user: {user_data['email']} ({user_data['department']} - {user_data['role']})")
    
    # Commit all users
    if created_users:
        db.commit()
        print(f"\nSuccessfully seeded {len(created_users)} users")
    else:
        print("\nNo new users to seed")
    
    return created_users


def get_workflow_step_templates() -> List[Dict[str, Any]]:
    """
    Get workflow step templates.
    
    Returns:
        List of workflow step template dictionaries
    """
    return WORKFLOW_STEP_TEMPLATES
