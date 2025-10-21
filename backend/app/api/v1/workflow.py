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
