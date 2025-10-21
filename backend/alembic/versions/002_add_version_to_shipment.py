"""Add version field to shipment for optimistic locking

Revision ID: 002
Revises: 001
Create Date: 2025-10-22

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add version column to shipments table for optimistic locking."""
    # Add version column with default value of 1
    op.add_column('shipments', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))


def downgrade() -> None:
    """Remove version column from shipments table."""
    op.drop_column('shipments', 'version')
