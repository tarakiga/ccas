# Seed Data Documentation

This document describes the seed data functionality for the Customs Clearance Automation System.

## Overview

The seed data system provides initial data for:
1. **Users** - Default users for each department (Business Unit, Finance, C&C, Stores, IA)
2. **Workflow Step Templates** - 34 predefined workflow steps stored in the database

## Workflow Step Templates

### Database Storage

Workflow step templates are stored in the `workflow_step_templates` table with the following fields:
- `step_number` - Unique step identifier (e.g., 9.0, 10.0)
- `step_name` - Human-readable step name
- `description` - Detailed description of the step
- `department` - Responsible department (BusinessUnit, Finance, C&C, Stores)
- `offset_days` - Days offset from ETA for target date calculation
- `is_critical` - Whether the step is critical for demurrage prevention
- `display_order` - Order for displaying steps in UI

### Critical Steps

The following steps are marked as critical (must be completed by Day 7 to avoid demurrage):
- **Step 9.0**: Bayan submission (offset: 0 days)
- **Step 10.0**: Customs duty payment (offset: 3 days)
- **Step 11.0**: Bayan approval (offset: 4 days)
- **Step 13.0**: DO payment (offset: 6 days)
- **Step 14.0**: Goods collection from port (offset: 7 days)

### Migration

The workflow step templates are populated via Alembic migration:
```bash
# Run migration to create and populate templates
alembic upgrade head
```

Migration file: `alembic/versions/003_add_workflow_step_templates.py`

## User Seed Data

### Default Users

The system includes default users for each department based on the responsibility matrix from the PRD:

| Department | PPR User | APR User |
|------------|----------|----------|
| Business Unit (TBLE) | Rajendran P. (rajendran@alhashargroup.com) | Raj Nair (rajnair@alhashargroup.com) |
| Finance | Bala (bala@alhashargroup.com) | Mario (mario@alhashargroup.com) |
| C&C | Salim (salim@alhashargroup.com) | Moataz (moataz@alhashargroup.com) |
| Stores | Stores Manager (stores@alhashargroup.com) | Stores Alternate (stores_alt@alhashargroup.com) |
| IA | Simon Turner (simon.turner@alhashargroup.com) | - |
| Management | Rajeev Sharma (rajeev.sharma@alhashargroup.com) | - |

### Seeding Users

Run the seed script to populate initial users:

```bash
# From the backend directory
python seed_database.py
```

The script is idempotent - it will skip users that already exist based on email address.

### Manual Seeding

You can also seed users programmatically:

```python
from app.database import SessionLocal
from app.utils.seed_data import seed_users

db = SessionLocal()
try:
    users = seed_users(db)
    print(f"Created {len(users)} users")
finally:
    db.close()
```

## Workflow Service Integration

The `WorkflowService` can use either database templates or constants:

```python
from app.services.workflow_service import WorkflowService

# Use database templates (default)
service = WorkflowService(db, use_db_templates=True)

# Use constants (fallback)
service = WorkflowService(db, use_db_templates=False)
```

When generating workflow steps for a shipment, the service will:
1. Load templates from database (if `use_db_templates=True`)
2. Look up PPR/APR users by email from the database
3. Calculate target dates based on ETA + offset_days
4. Create 34 workflow step records

## Modifying Templates

### Via Database

Templates can be modified directly in the database:

```sql
-- Update a step's offset days
UPDATE workflow_step_templates 
SET offset_days = 5, updated_at = NOW()
WHERE step_number = 10.0;

-- Mark a step as critical
UPDATE workflow_step_templates 
SET is_critical = true, updated_at = NOW()
WHERE step_number = 12.0;

-- Deactivate a step
UPDATE workflow_step_templates 
SET is_active = false, updated_at = NOW()
WHERE step_number = 34.0;
```

### Via API (Future Enhancement)

In the future, an admin API endpoint can be added to manage templates:
- `GET /api/v1/admin/workflow-templates` - List all templates
- `PUT /api/v1/admin/workflow-templates/{id}` - Update a template
- `POST /api/v1/admin/workflow-templates` - Create a new template

## Constants Fallback

The `app/utils/constants.py` file contains the same workflow step definitions as a fallback. This ensures the system can function even if the database templates are not available.

## Testing

To test the seed data functionality:

```bash
# Run unit tests
pytest tests/unit/test_seed_data.py

# Test the seed script
python seed_database.py
```

## Notes

- User `auth0_id` values in seed data are placeholders (e.g., "auth0|rajendran")
- In production, these should be replaced with actual Auth0 user IDs
- The seed script is safe to run multiple times - it will skip existing users
- Workflow step templates are created once via migration and can be modified as needed
