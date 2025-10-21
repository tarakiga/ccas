"""Constants and configuration for the customs clearance system."""

from decimal import Decimal
from typing import List, Dict, Any


# Workflow step template definitions
# Based on the 34-step customs clearance process from the PRD
WORKFLOW_STEP_TEMPLATES: List[Dict[str, Any]] = [
    # Pre-clearance steps (Business Unit)
    {
        "step_number": Decimal("1.0"),
        "step_name": "Receive shipping documents",
        "description": "Receive and verify shipping documents from supplier",
        "department": "BusinessUnit",
        "offset_days": -5,
        "is_critical": False
    },
    {
        "step_number": Decimal("2.0"),
        "step_name": "Verify invoice and packing list",
        "description": "Verify invoice details and packing list accuracy",
        "department": "BusinessUnit",
        "offset_days": -4,
        "is_critical": False
    },
    {
        "step_number": Decimal("3.0"),
        "step_name": "Prepare LC documentation",
        "description": "Prepare Letter of Credit documentation",
        "department": "Finance",
        "offset_days": -3,
        "is_critical": False
    },
    {
        "step_number": Decimal("4.0"),
        "step_name": "LC opening",
        "description": "Open Letter of Credit with bank",
        "department": "Finance",
        "offset_days": -2,
        "is_critical": False
    },
    {
        "step_number": Decimal("5.0"),
        "step_name": "DAN preparation",
        "description": "Prepare Document Against Negotiation",
        "department": "Finance",
        "offset_days": -1,
        "is_critical": False
    },
    {
        "step_number": Decimal("6.0"),
        "step_name": "DAN signing",
        "description": "Sign Document Against Negotiation",
        "department": "Finance",
        "offset_days": 0,
        "is_critical": False
    },
    {
        "step_number": Decimal("7.0"),
        "step_name": "Fund transfer initiation",
        "description": "Initiate fund transfer for customs duties",
        "department": "Finance",
        "offset_days": 1,
        "is_critical": False
    },
    {
        "step_number": Decimal("8.0"),
        "step_name": "Bank document collection",
        "description": "Collect documents from bank",
        "department": "Finance",
        "offset_days": 2,
        "is_critical": False
    },
    # Critical clearance steps (C&C)
    {
        "step_number": Decimal("9.0"),
        "step_name": "Bayan submission",
        "description": "Submit customs declaration (Bayan) to customs authority",
        "department": "C&C",
        "offset_days": 0,
        "is_critical": True
    },
    {
        "step_number": Decimal("10.0"),
        "step_name": "Customs duty payment",
        "description": "Pay customs duty to customs authority",
        "department": "C&C",
        "offset_days": 3,
        "is_critical": True
    },
    {
        "step_number": Decimal("11.0"),
        "step_name": "Bayan approval",
        "description": "Receive Bayan approval from customs authority",
        "department": "C&C",
        "offset_days": 4,
        "is_critical": True
    },
    {
        "step_number": Decimal("12.0"),
        "step_name": "VAT payment",
        "description": "Pay Value Added Tax",
        "department": "Finance",
        "offset_days": 4,
        "is_critical": False
    },
    {
        "step_number": Decimal("13.0"),
        "step_name": "DO payment",
        "description": "Pay for Delivery Order",
        "department": "C&C",
        "offset_days": 6,
        "is_critical": True
    },
    {
        "step_number": Decimal("14.0"),
        "step_name": "Goods collection from port",
        "description": "Collect goods from port",
        "department": "C&C",
        "offset_days": 7,
        "is_critical": True
    },
    # Post-clearance steps (Stores)
    {
        "step_number": Decimal("15.0"),
        "step_name": "Transport to warehouse",
        "description": "Transport goods to warehouse",
        "department": "Stores",
        "offset_days": 8,
        "is_critical": False
    },
    {
        "step_number": Decimal("16.0"),
        "step_name": "Warehouse receipt",
        "description": "Receive goods at warehouse",
        "department": "Stores",
        "offset_days": 8,
        "is_critical": False
    },
    {
        "step_number": Decimal("17.0"),
        "step_name": "Physical inspection",
        "description": "Conduct physical inspection of goods",
        "department": "Stores",
        "offset_days": 9,
        "is_critical": False
    },
    {
        "step_number": Decimal("18.0"),
        "step_name": "Quality check",
        "description": "Perform quality check on goods",
        "department": "Stores",
        "offset_days": 9,
        "is_critical": False
    },
    {
        "step_number": Decimal("19.0"),
        "step_name": "Defect reporting",
        "description": "Report any defects found during inspection",
        "department": "Stores",
        "offset_days": 10,
        "is_critical": False
    },
    {
        "step_number": Decimal("20.0"),
        "step_name": "Inventory update",
        "description": "Update inventory system with received goods",
        "department": "Stores",
        "offset_days": 10,
        "is_critical": False
    },
    # Additional administrative steps
    {
        "step_number": Decimal("21.0"),
        "step_name": "Insurance claim preparation",
        "description": "Prepare insurance claim if needed",
        "department": "Finance",
        "offset_days": 11,
        "is_critical": False
    },
    {
        "step_number": Decimal("22.0"),
        "step_name": "Insurance documentation",
        "description": "Complete insurance documentation",
        "department": "Finance",
        "offset_days": 12,
        "is_critical": False
    },
    {
        "step_number": Decimal("23.0"),
        "step_name": "Supplier invoice reconciliation",
        "description": "Reconcile supplier invoice with received goods",
        "department": "Finance",
        "offset_days": 13,
        "is_critical": False
    },
    {
        "step_number": Decimal("24.0"),
        "step_name": "Payment processing",
        "description": "Process payment to supplier",
        "department": "Finance",
        "offset_days": 14,
        "is_critical": False
    },
    {
        "step_number": Decimal("25.0"),
        "step_name": "Document archival",
        "description": "Archive all shipment documents",
        "department": "BusinessUnit",
        "offset_days": 15,
        "is_critical": False
    },
    {
        "step_number": Decimal("26.0"),
        "step_name": "Compliance reporting",
        "description": "Submit compliance reports to authorities",
        "department": "C&C",
        "offset_days": 16,
        "is_critical": False
    },
    {
        "step_number": Decimal("27.0"),
        "step_name": "Cost allocation",
        "description": "Allocate costs to appropriate cost centers",
        "department": "Finance",
        "offset_days": 17,
        "is_critical": False
    },
    {
        "step_number": Decimal("28.0"),
        "step_name": "Vendor performance review",
        "description": "Review vendor performance for this shipment",
        "department": "BusinessUnit",
        "offset_days": 18,
        "is_critical": False
    },
    {
        "step_number": Decimal("29.0"),
        "step_name": "Customs audit preparation",
        "description": "Prepare documents for potential customs audit",
        "department": "C&C",
        "offset_days": 19,
        "is_critical": False
    },
    {
        "step_number": Decimal("30.0"),
        "step_name": "Final reconciliation",
        "description": "Final reconciliation of all costs and documents",
        "department": "Finance",
        "offset_days": 20,
        "is_critical": False
    },
    {
        "step_number": Decimal("31.0"),
        "step_name": "Management reporting",
        "description": "Prepare management report on shipment",
        "department": "BusinessUnit",
        "offset_days": 21,
        "is_critical": False
    },
    {
        "step_number": Decimal("32.0"),
        "step_name": "Lessons learned documentation",
        "description": "Document lessons learned from shipment process",
        "department": "BusinessUnit",
        "offset_days": 22,
        "is_critical": False
    },
    {
        "step_number": Decimal("33.0"),
        "step_name": "Process improvement suggestions",
        "description": "Submit process improvement suggestions",
        "department": "BusinessUnit",
        "offset_days": 23,
        "is_critical": False
    },
    {
        "step_number": Decimal("34.0"),
        "step_name": "Shipment closure",
        "description": "Close shipment in system",
        "department": "BusinessUnit",
        "offset_days": 24,
        "is_critical": False
    }
]


# Default PPR/APR assignments by department
# These would typically be loaded from database, but providing defaults
DEFAULT_USER_ASSIGNMENTS = {
    "BusinessUnit": {
        "ppr_email": "rajendran@alhashargroup.com",
        "apr_email": "rajnair@alhashargroup.com"
    },
    "Finance": {
        "ppr_email": "bala@alhashargroup.com",
        "apr_email": "mario@alhashargroup.com"
    },
    "C&C": {
        "ppr_email": "salim@alhashargroup.com",
        "apr_email": "moataz@alhashargroup.com"
    },
    "Stores": {
        "ppr_email": "stores@alhashargroup.com",
        "apr_email": "stores_alt@alhashargroup.com"
    }
}


# Alert severity thresholds (days post-ETA)
ALERT_THRESHOLDS = {
    "warning": 4,    # Day 4 post-ETA
    "critical": 5,   # Day 5 post-ETA
    "urgent": 7      # Day 7 post-ETA
}


# Demurrage cost per day (in OMR)
DEMURRAGE_RATE_PER_DAY = Decimal("38.462")  # Approximately $100/day converted to OMR


# Maximum ETA edit count
MAX_ETA_EDITS = 3


# Department names
DEPARTMENTS = {
    "BUSINESS_UNIT": "BusinessUnit",
    "FINANCE": "Finance",
    "C_AND_C": "C&C",
    "STORES": "Stores",
    "IA": "IA"
}


# User roles
ROLES = {
    "PPR": "PPR",
    "APR": "APR",
    "MANAGER": "Manager",
    "ADMIN": "Admin",
    "READ_ONLY": "ReadOnly"
}
