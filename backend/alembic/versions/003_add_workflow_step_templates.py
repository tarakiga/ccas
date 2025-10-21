"""Add workflow step templates table and seed data

Revision ID: 003
Revises: 002
Create Date: 2025-10-22

"""
from alembic import op
import sqlalchemy as sa
from decimal import Decimal


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


# Workflow step template data
WORKFLOW_STEP_TEMPLATES = [
    # Pre-clearance steps (Business Unit)
    (Decimal("1.0"), "Receive shipping documents", "Receive and verify shipping documents from supplier", "BusinessUnit", -5, False, 1),
    (Decimal("2.0"), "Verify invoice and packing list", "Verify invoice details and packing list accuracy", "BusinessUnit", -4, False, 2),
    (Decimal("3.0"), "Prepare LC documentation", "Prepare Letter of Credit documentation", "Finance", -3, False, 3),
    (Decimal("4.0"), "LC opening", "Open Letter of Credit with bank", "Finance", -2, False, 4),
    (Decimal("5.0"), "DAN preparation", "Prepare Document Against Negotiation", "Finance", -1, False, 5),
    (Decimal("6.0"), "DAN signing", "Sign Document Against Negotiation", "Finance", 0, False, 6),
    (Decimal("7.0"), "Fund transfer initiation", "Initiate fund transfer for customs duties", "Finance", 1, False, 7),
    (Decimal("8.0"), "Bank document collection", "Collect documents from bank", "Finance", 2, False, 8),
    # Critical clearance steps (C&C)
    (Decimal("9.0"), "Bayan submission", "Submit customs declaration (Bayan) to customs authority", "C&C", 0, True, 9),
    (Decimal("10.0"), "Customs duty payment", "Pay customs duty to customs authority", "C&C", 3, True, 10),
    (Decimal("11.0"), "Bayan approval", "Receive Bayan approval from customs authority", "C&C", 4, True, 11),
    (Decimal("12.0"), "VAT payment", "Pay Value Added Tax", "Finance", 4, False, 12),
    (Decimal("13.0"), "DO payment", "Pay for Delivery Order", "C&C", 6, True, 13),
    (Decimal("14.0"), "Goods collection from port", "Collect goods from port", "C&C", 7, True, 14),
    # Post-clearance steps (Stores)
    (Decimal("15.0"), "Transport to warehouse", "Transport goods to warehouse", "Stores", 8, False, 15),
    (Decimal("16.0"), "Warehouse receipt", "Receive goods at warehouse", "Stores", 8, False, 16),
    (Decimal("17.0"), "Physical inspection", "Conduct physical inspection of goods", "Stores", 9, False, 17),
    (Decimal("18.0"), "Quality check", "Perform quality check on goods", "Stores", 9, False, 18),
    (Decimal("19.0"), "Defect reporting", "Report any defects found during inspection", "Stores", 10, False, 19),
    (Decimal("20.0"), "Inventory update", "Update inventory system with received goods", "Stores", 10, False, 20),
    # Additional administrative steps
    (Decimal("21.0"), "Insurance claim preparation", "Prepare insurance claim if needed", "Finance", 11, False, 21),
    (Decimal("22.0"), "Insurance documentation", "Complete insurance documentation", "Finance", 12, False, 22),
    (Decimal("23.0"), "Supplier invoice reconciliation", "Reconcile supplier invoice with received goods", "Finance", 13, False, 23),
    (Decimal("24.0"), "Payment processing", "Process payment to supplier", "Finance", 14, False, 24),
    (Decimal("25.0"), "Document archival", "Archive all shipment documents", "BusinessUnit", 15, False, 25),
    (Decimal("26.0"), "Compliance reporting", "Submit compliance reports to authorities", "C&C", 16, False, 26),
    (Decimal("27.0"), "Cost allocation", "Allocate costs to appropriate cost centers", "Finance", 17, False, 27),
    (Decimal("28.0"), "Vendor performance review", "Review vendor performance for this shipment", "BusinessUnit", 18, False, 28),
    (Decimal("29.0"), "Customs audit preparation", "Prepare documents for potential customs audit", "C&C", 19, False, 29),
    (Decimal("30.0"), "Final reconciliation", "Final reconciliation of all costs and documents", "Finance", 20, False, 30),
    (Decimal("31.0"), "Management reporting", "Prepare management report on shipment", "BusinessUnit", 21, False, 31),
    (Decimal("32.0"), "Lessons learned documentation", "Document lessons learned from shipment process", "BusinessUnit", 22, False, 32),
    (Decimal("33.0"), "Process improvement suggestions", "Submit process improvement suggestions", "BusinessUnit", 23, False, 33),
    (Decimal("34.0"), "Shipment closure", "Close shipment in system", "BusinessUnit", 24, False, 34),
]


def upgrade() -> None:
    """Create workflow_step_templates table and populate with initial data."""
    # Create workflow_step_templates table
    op.create_table(
        'workflow_step_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('step_number', sa.Numeric(precision=10, scale=1), nullable=False),
        sa.Column('step_name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('department', sa.String(length=50), nullable=False),
        sa.Column('offset_days', sa.Integer(), nullable=False),
        sa.Column('is_critical', sa.Boolean(), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_workflow_step_templates_id', 'workflow_step_templates', ['id'])
    op.create_index('ix_workflow_step_templates_step_number', 'workflow_step_templates', ['step_number'], unique=True)
    op.create_index('ix_workflow_step_templates_department', 'workflow_step_templates', ['department'])
    op.create_index('ix_workflow_step_templates_display_order', 'workflow_step_templates', ['display_order'])
    
    # Insert workflow step templates
    workflow_step_templates_table = sa.table(
        'workflow_step_templates',
        sa.column('step_number', sa.Numeric),
        sa.column('step_name', sa.String),
        sa.column('description', sa.Text),
        sa.column('department', sa.String),
        sa.column('offset_days', sa.Integer),
        sa.column('is_critical', sa.Boolean),
        sa.column('display_order', sa.Integer),
        sa.column('is_active', sa.Boolean),
        sa.column('created_at', sa.DateTime),
        sa.column('updated_at', sa.DateTime),
    )
    
    # Prepare data for bulk insert
    from datetime import datetime
    now = datetime.utcnow()
    
    insert_data = [
        {
            'step_number': step_number,
            'step_name': step_name,
            'description': description,
            'department': department,
            'offset_days': offset_days,
            'is_critical': is_critical,
            'display_order': display_order,
            'is_active': True,
            'created_at': now,
            'updated_at': now,
        }
        for step_number, step_name, description, department, offset_days, is_critical, display_order
        in WORKFLOW_STEP_TEMPLATES
    ]
    
    op.bulk_insert(workflow_step_templates_table, insert_data)


def downgrade() -> None:
    """Drop workflow_step_templates table."""
    op.drop_index('ix_workflow_step_templates_display_order', table_name='workflow_step_templates')
    op.drop_index('ix_workflow_step_templates_department', table_name='workflow_step_templates')
    op.drop_index('ix_workflow_step_templates_step_number', table_name='workflow_step_templates')
    op.drop_index('ix_workflow_step_templates_id', table_name='workflow_step_templates')
    op.drop_table('workflow_step_templates')
