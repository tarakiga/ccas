"""Workflow step API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.workflow_step import (
    WorkflowStepResponse,
    WorkflowStepComplete,
    StepFilters,
)
from app.schemas.common import ErrorResponse
from app.services.workflow_service import WorkflowService

router = APIRouter(tags=["workflow"])


@router.get(
    "/shipments/{shipment_id}/workflow",
    response_model=list[WorkflowStepResponse],
    responses={
        404: {"model": ErrorResponse, "description": "Shipment not found"},
    }
)
async def get_shipment_workflow(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all workflow steps for a shipment.
    
    Returns all 34 workflow steps with their current status and assignments.
    """
    workflow_service = WorkflowService(db)
    steps = workflow_service.get_shipment_workflow(shipment_id, current_user)
    
    if not steps:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Shipment with ID {shipment_id} not found or has no workflow steps",
                "details": []
            }
        )
    
    return steps


@router.get(
    "/workflow-steps/{step_id}",
    response_model=WorkflowStepResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Workflow step not found"},
    }
)
async def get_workflow_step(
    step_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get workflow step details by ID."""
    workflow_service = WorkflowService(db)
    step = workflow_service.get_workflow_step(step_id, current_user)
    
    if not step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Workflow step with ID {step_id} not found",
                "details": []
            }
        )
    
    return step


@router.patch(
    "/workflow-steps/{step_id}/complete",
    response_model=WorkflowStepResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        403: {"model": ErrorResponse, "description": "Forbidden - User not assigned as PPR or APR"},
        404: {"model": ErrorResponse, "description": "Workflow step not found"},
    }
)
async def complete_workflow_step(
    step_id: int,
    completion_data: WorkflowStepComplete,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a workflow step as complete.
    
    - User must be assigned as PPR or APR for the step
    - Actual date cannot be in the future
    - Completion is logged in audit trail
    """
    workflow_service = WorkflowService(db)
    
    try:
        step = workflow_service.complete_step(
            step_id,
            completion_data.actual_date,
            current_user,
            request.client.host if request.client else "unknown"
        )
        
        if not step:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "message": f"Workflow step with ID {step_id} not found",
                    "details": []
                }
            )
        
        return step
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FORBIDDEN",
                "message": str(e),
                "details": []
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )


@router.get(
    "/workflow-steps/my-tasks",
    response_model=list[WorkflowStepResponse],
)
async def get_my_tasks(
    status_filter: Optional[str] = None,
    department: Optional[str] = None,
    page: int = 1,
    size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get workflow steps assigned to the current user.
    
    Returns steps where the user is assigned as PPR or APR.
    
    Query parameters:
    - status_filter: Filter by step status (pending, completed, overdue)
    - department: Filter by department
    - page: Page number (default: 1)
    - size: Page size (default: 50, max: 100)
    
    Note: This endpoint returns a list for backward compatibility.
    For paginated results, use the shipments/{id}/workflow endpoint.
    """
    # Limit page size to prevent excessive data retrieval
    size = min(size, 100)
    
    filters = StepFilters(
        status=status_filter,
        department=department,
    )
    
    workflow_service = WorkflowService(db)
    steps = workflow_service.get_user_assigned_steps(current_user, filters)
    
    # Apply manual pagination since this endpoint returns a list
    offset = (page - 1) * size
    return steps[offset:offset + size]



@router.post(
    "/workflow/actions/log",
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {"model": ErrorResponse, "description": "Shipment not found"},
    }
)
async def log_workflow_action(
    action_data: dict,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),  # Uncomment when auth is ready
):
    """
    Log a workflow action for audit trail.
    
    - **shipment_id**: Shipment ID
    - **step_number**: Workflow step number
    - **action**: Action performed
    - **performed_by**: User who performed the action
    - **performed_at**: When the action was performed (ISO format)
    - **data**: Additional action data (optional)
    """
    from app.models.workflow_action_log import WorkflowActionLog
    from datetime import datetime
    import uuid
    
    # Validate required fields
    required_fields = ["shipment_id", "step_number", "action", "performed_by", "performed_at"]
    missing_fields = [field for field in required_fields if field not in action_data]
    
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": f"Missing required fields: {', '.join(missing_fields)}",
                "details": []
            }
        )
    
    # Parse performed_at timestamp
    try:
        performed_at = datetime.fromisoformat(action_data["performed_at"].replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "Invalid performed_at timestamp format. Use ISO 8601 format.",
                "details": []
            }
        )
    
    # Create action log
    action_log = WorkflowActionLog(
        id=str(uuid.uuid4()),
        shipment_id=action_data["shipment_id"],
        step_number=action_data["step_number"],
        action=action_data["action"],
        performed_by=action_data["performed_by"],
        performed_at=performed_at,
        data=action_data.get("data")
    )
    
    db.add(action_log)
    db.commit()
    db.refresh(action_log)
    
    return {
        "id": action_log.id,
        "message": "Workflow action logged successfully"
    }


@router.get(
    "/shipments/{shipment_id}/workflow/actions",
    responses={
        404: {"model": ErrorResponse, "description": "Shipment not found"},
    }
)
async def get_shipment_workflow_actions(
    shipment_id: str,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user),  # Uncomment when auth is ready
):
    """
    Get all workflow action logs for a shipment.
    
    Returns a chronological list of all actions performed on the shipment's workflow steps.
    """
    from app.models.workflow_action_log import WorkflowActionLog
    
    action_logs = (
        db.query(WorkflowActionLog)
        .filter(WorkflowActionLog.shipment_id == shipment_id)
        .order_by(WorkflowActionLog.performed_at.desc())
        .all()
    )
    
    return [
        {
            "id": log.id,
            "shipment_id": log.shipment_id,
            "step_number": log.step_number,
            "action": log.action,
            "performed_by": log.performed_by,
            "performed_at": log.performed_at.isoformat(),
            "data": log.data,
            "created_at": log.created_at.isoformat()
        }
        for log in action_logs
    ]
