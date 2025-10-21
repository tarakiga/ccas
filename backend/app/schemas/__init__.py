"""Pydantic schemas for request/response validation."""

# Shipment schemas
from app.schemas.shipment import (
    ShipmentStatus,
    ShipmentCreate,
    ShipmentUpdate,
    ShipmentResponse,
    ShipmentFilters,
    ShipmentImport,
)

# Workflow step schemas
from app.schemas.workflow_step import (
    StepStatus,
    WorkflowStepResponse,
    WorkflowStepComplete,
    StepFilters,
)

# Alert schemas
from app.schemas.alert import (
    AlertSeverity,
    AlertResponse,
    AlertFilters,
)

# Audit log schemas
from app.schemas.audit_log import (
    AuditLogResponse,
    AuditLogFilters,
)

# Metrics schemas
from app.schemas.metrics import (
    DateRange,
    DepartmentClearanceTime,
    ClearanceTimeMetrics,
    OnTimeRateMetrics,
    DemurrageSavings,
    DelayedStepInfo,
    DelayedStepsMetrics,
)

# Common schemas
from app.schemas.common import (
    Page,
    ErrorDetail,
    ErrorResponse,
    DependencyStatus,
    HealthCheckResponse,
)

__all__ = [
    # Shipment
    "ShipmentStatus",
    "ShipmentCreate",
    "ShipmentUpdate",
    "ShipmentResponse",
    "ShipmentFilters",
    "ShipmentImport",
    # Workflow step
    "StepStatus",
    "WorkflowStepResponse",
    "WorkflowStepComplete",
    "StepFilters",
    # Alert
    "AlertSeverity",
    "AlertResponse",
    "AlertFilters",
    # Audit log
    "AuditLogResponse",
    "AuditLogFilters",
    # Metrics
    "DateRange",
    "DepartmentClearanceTime",
    "ClearanceTimeMetrics",
    "OnTimeRateMetrics",
    "DemurrageSavings",
    "DelayedStepInfo",
    "DelayedStepsMetrics",
    # Common
    "Page",
    "ErrorDetail",
    "ErrorResponse",
    "DependencyStatus",
    "HealthCheckResponse",
]
