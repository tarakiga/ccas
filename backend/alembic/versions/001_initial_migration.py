"""Initial migration: create all models

Revision ID: 001
Revises: 
Create Date: 2025-10-21 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all database tables."""
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auth0_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('department', sa.String(length=50), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('auth0_id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_auth0_id', 'users', ['auth0_id'])
    op.create_index('idx_users_department', 'users', ['department'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    # Create shipments table
    op.create_table(
        'shipments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shipment_number', sa.String(length=100), nullable=False),
        sa.Column('principal', sa.String(length=255), nullable=False),
        sa.Column('brand', sa.String(length=255), nullable=False),
        sa.Column('lc_number', sa.String(length=100), nullable=False),
        sa.Column('invoice_amount_omr', sa.Numeric(precision=15, scale=3), nullable=False),
        sa.Column('eta', sa.Date(), nullable=False),
        sa.Column('eta_edit_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.Enum('ACTIVE', 'COMPLETED', 'CANCELLED', name='shipmentstatus'), nullable=False, server_default='ACTIVE'),
        sa.Column('created_by_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('shipment_number')
    )
    op.create_index('idx_shipments_eta', 'shipments', ['eta'])
    op.create_index('idx_shipments_number', 'shipments', ['shipment_number'])
    op.create_index('idx_shipments_status', 'shipments', ['status'])
    op.create_index(op.f('ix_shipments_id'), 'shipments', ['id'], unique=False)
    
    # Create workflow_steps table
    op.create_table(
        'workflow_steps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shipment_id', sa.Integer(), nullable=False),
        sa.Column('step_number', sa.Numeric(precision=4, scale=1), nullable=False),
        sa.Column('step_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('department', sa.String(length=50), nullable=False),
        sa.Column('target_date', sa.Date(), nullable=False),
        sa.Column('offset_days', sa.Integer(), nullable=False),
        sa.Column('actual_date', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'COMPLETED', 'OVERDUE', name='stepstatus'), nullable=False, server_default='PENDING'),
        sa.Column('is_critical', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('ppr_user_id', sa.Integer(), nullable=False),
        sa.Column('apr_user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['apr_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['ppr_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_workflow_ppr', 'workflow_steps', ['ppr_user_id'])
    op.create_index('idx_workflow_shipment', 'workflow_steps', ['shipment_id'])
    op.create_index('idx_workflow_status', 'workflow_steps', ['status'])
    op.create_index('idx_workflow_target_date', 'workflow_steps', ['target_date'])
    op.create_index(op.f('ix_workflow_steps_id'), 'workflow_steps', ['id'], unique=False)
    
    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shipment_id', sa.Integer(), nullable=False),
        sa.Column('workflow_step_id', sa.Integer(), nullable=False),
        sa.Column('recipient_user_id', sa.Integer(), nullable=False),
        sa.Column('severity', sa.Enum('WARNING', 'CRITICAL', 'URGENT', name='alertseverity'), nullable=False),
        sa.Column('message', sa.String(length=1000), nullable=False),
        sa.Column('days_post_eta', sa.Integer(), nullable=False),
        sa.Column('is_acknowledged', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('acknowledged_at', sa.DateTime(), nullable=True),
        sa.Column('email_sent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('email_sent_at', sa.DateTime(), nullable=True),
        sa.Column('email_retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['recipient_user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['shipment_id'], ['shipments.id'], ),
        sa.ForeignKeyConstraint(['workflow_step_id'], ['workflow_steps.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_alerts_acknowledged', 'alerts', ['is_acknowledged'])
    op.create_index('idx_alerts_email_sent', 'alerts', ['email_sent'])
    op.create_index('idx_alerts_recipient', 'alerts', ['recipient_user_id'])
    op.create_index('idx_alerts_shipment', 'alerts', ['shipment_id'])
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('field_name', sa.String(length=100), nullable=False),
        sa.Column('old_value', sa.String(length=1000), nullable=True),
        sa.Column('new_value', sa.String(length=1000), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_audit_created', 'audit_logs', ['created_at'])
    op.create_index('idx_audit_entity', 'audit_logs', ['entity_type', 'entity_id'])
    op.create_index('idx_audit_user', 'audit_logs', ['user_id'])
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)


def downgrade() -> None:
    """Drop all database tables."""
    
    # Drop tables in reverse order (respecting foreign key constraints)
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_index('idx_audit_user', table_name='audit_logs')
    op.drop_index('idx_audit_entity', table_name='audit_logs')
    op.drop_index('idx_audit_created', table_name='audit_logs')
    op.drop_table('audit_logs')
    
    op.drop_index(op.f('ix_alerts_id'), table_name='alerts')
    op.drop_index('idx_alerts_shipment', table_name='alerts')
    op.drop_index('idx_alerts_recipient', table_name='alerts')
    op.drop_index('idx_alerts_email_sent', table_name='alerts')
    op.drop_index('idx_alerts_acknowledged', table_name='alerts')
    op.drop_table('alerts')
    
    op.drop_index(op.f('ix_workflow_steps_id'), table_name='workflow_steps')
    op.drop_index('idx_workflow_target_date', table_name='workflow_steps')
    op.drop_index('idx_workflow_status', table_name='workflow_steps')
    op.drop_index('idx_workflow_shipment', table_name='workflow_steps')
    op.drop_index('idx_workflow_ppr', table_name='workflow_steps')
    op.drop_table('workflow_steps')
    
    op.drop_index(op.f('ix_shipments_id'), table_name='shipments')
    op.drop_index('idx_shipments_status', table_name='shipments')
    op.drop_index('idx_shipments_number', table_name='shipments')
    op.drop_index('idx_shipments_eta', table_name='shipments')
    op.drop_table('shipments')
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_index('idx_users_department', table_name='users')
    op.drop_index('idx_users_auth0_id', table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS alertseverity')
    op.execute('DROP TYPE IF EXISTS stepstatus')
    op.execute('DROP TYPE IF EXISTS shipmentstatus')
