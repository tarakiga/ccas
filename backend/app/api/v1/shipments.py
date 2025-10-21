"""Shipment API endpoints."""

from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user, require_eta_update_permission
from app.models.user import User
from app.schemas.shipment import (
    ShipmentCreate,
    ShipmentUpdate,
    ShipmentResponse,
    ShipmentFilters,
    ShipmentImport,
    ETAUpdate,
)
from app.schemas.common import Page, ErrorResponse
from app.services.shipment_service import ShipmentService
from app.services.audit_service import AuditService
from app.exceptions import ConcurrentModificationError

router = APIRouter(prefix="/shipments", tags=["shipments"])


@router.post(
    "",
    response_model=ShipmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new shipment",
    description="Create a new shipment with automatic financial calculations and workflow generation",
    responses={
        201: {
            "description": "Shipment created successfully",
            "model": ShipmentResponse,
        },
        400: {
            "model": ErrorResponse,
            "description": "Validation error - Invalid input data",
        },
        401: {
            "model": ErrorResponse,
            "description": "Authentication error - Invalid or missing token",
        },
        409: {
            "model": ErrorResponse,
            "description": "Conflict error - Shipment number already exists",
        },
    },
    response_description="The created shipment with computed financial fields and generated workflow steps",
)
async def create_shipment(
    shipment_data: ShipmentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new shipment with automatic calculations and workflow generation.
    
    This endpoint:
    - Validates all required shipment fields
    - Automatically calculates customs duty (5% of invoice amount)
    - Automatically calculates VAT (5% of invoice amount)
    - Automatically calculates insurance (1% of invoice amount)
    - Generates 34 workflow steps with target dates based on ETA
    - Assigns PPR and APR users to each workflow step
    - Logs the creation in the audit trail
    
    **Required Fields:**
    - shipment_number: Unique identifier for the shipment
    - principal: Principal company name
    - brand: Brand name
    - lc_number: Letter of Credit number
    - invoice_amount_omr: Invoice amount in OMR (must be positive)
    - eta: Estimated Time of Arrival (anchor date for all calculations)
    
    **Business Rules:**
    - Invoice amount must be greater than zero
    - Shipment number must be unique
    - ETA is used to calculate target dates for all 34 workflow steps
    """
    try:
        shipment_service = ShipmentService(db)
        shipment = shipment_service.create_shipment(shipment_data, current_user)
        return shipment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": []
            }
        )


@router.get(
    "",
    response_model=Page[ShipmentResponse],
    summary="List shipments",
    description="Retrieve a paginated list of shipments with optional filtering",
    responses={
        200: {
            "description": "Paginated list of shipments",
            "model": Page[ShipmentResponse],
        },
        400: {
            "model": ErrorResponse,
            "description": "Validation error - Invalid filter parameters",
        },
        401: {
            "model": ErrorResponse,
            "description": "Authentication error - Invalid or missing token",
        },
    },
    response_description="Paginated shipment list with total count and page information",
)
async def list_shipments(
    status_filter: Optional[str] = None,
    principal: Optional[str] = None,
    eta_start: Optional[date] = None,
    eta_end: Optional[date] = None,
    page: int = 1,
    size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List shipments with optional filters and pagination.
    
    **Query Parameters:**
    - **status_filter**: Filter by shipment status (active, completed, cancelled)
    - **principal**: Filter by principal name (partial match, case-insensitive)
    - **eta_start**: Filter by ETA start date (inclusive)
    - **eta_end**: Filter by ETA end date (inclusive)
    - **page**: Page number, starting from 1 (default: 1)
    - **size**: Number of items per page (default: 50, max: 100)
    
    **Response:**
    Returns a paginated response containing:
    - items: List of shipments matching the filters
    - total: Total number of shipments across all pages
    - page: Current page number
    - size: Items per page
    - pages: Total number of pages
    
    **Access Control:**
    Users can only see shipments relevant to their department role.
    """
    filters = ShipmentFilters(
        status=status_filter,
        principal=principal,
        eta_start=eta_start,
        eta_end=eta_end,
    )
    
    shipment_service = ShipmentService(db)
    return shipment_service.list_shipments(filters, current_user, page, size)


@router.get(
    "/{shipment_id}",
    response_model=ShipmentResponse,
    summary="Get shipment by ID",
    description="Retrieve detailed information for a specific shipment",
    responses={
        200: {
            "description": "Shipment details retrieved successfully",
            "model": ShipmentResponse,
        },
        401: {
            "model": ErrorResponse,
            "description": "Authentication error - Invalid or missing token",
        },
        404: {
            "model": ErrorResponse,
            "description": "Shipment not found",
        },
    },
    response_description="Complete shipment details including computed financial fields",
)
async def get_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get detailed information for a specific shipment by ID.
    
    Returns complete shipment information including:
    - Basic shipment details (number, principal, brand, LC number)
    - Financial information (invoice amount, customs duty, VAT, insurance)
    - ETA and edit count
    - Status and timestamps
    - Creator information
    
    **Path Parameters:**
    - **shipment_id**: Unique identifier of the shipment
    
    **Access Control:**
    Users can only access shipments relevant to their department role.
    """
    shipment_service = ShipmentService(db)
    shipment = shipment_service.get_shipment(shipment_id, current_user)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Shipment with ID {shipment_id} not found",
                "details": []
            }
        )
    
    return shipment


@router.put(
    "/{shipment_id}",
    response_model=ShipmentResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {"model": ErrorResponse, "description": "Shipment not found"},
        409: {"model": ErrorResponse, "description": "Concurrent modification conflict"},
    }
)
async def update_shipment(
    shipment_id: int,
    shipment_data: ShipmentUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update shipment details.
    
    All changes are logged in the audit trail.
    Uses optimistic locking to prevent concurrent modification conflicts.
    """
    shipment_service = ShipmentService(db)
    
    try:
        shipment = shipment_service.update_shipment(
            shipment_id,
            shipment_data,
            current_user,
            request.client.host if request.client else "unknown"
        )
        
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "message": f"Shipment with ID {shipment_id} not found",
                    "details": []
                }
            )
        
        return shipment
    except ConcurrentModificationError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "CONCURRENT_MODIFICATION",
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


@router.patch(
    "/{shipment_id}/eta",
    response_model=ShipmentResponse,
    summary="Update shipment ETA",
    description="Update the Estimated Time of Arrival for a shipment (Business Unit role only)",
    responses={
        200: {
            "description": "ETA updated successfully with recalculated workflow dates",
            "model": ShipmentResponse,
        },
        400: {
            "model": ErrorResponse,
            "description": "Validation error - Invalid ETA date",
        },
        401: {
            "model": ErrorResponse,
            "description": "Authentication error - Invalid or missing token",
        },
        403: {
            "model": ErrorResponse,
            "description": "Forbidden - Business Unit role required for ETA updates",
        },
        404: {
            "model": ErrorResponse,
            "description": "Shipment not found",
        },
        409: {
            "model": ErrorResponse,
            "description": "Conflict - ETA edit limit exceeded (max 3) or concurrent modification detected",
        },
    },
    response_description="Updated shipment with incremented ETA edit count and recalculated workflow dates",
)
async def update_eta(
    shipment_id: int,
    eta_data: ETAUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_eta_update_permission),
):
    """
    Update the Estimated Time of Arrival (ETA) for a shipment.
    
    **Important:** This endpoint is restricted to users with Business Unit role only.
    
    **What happens when ETA is updated:**
    1. Validates that ETA edit limit (3 edits) has not been exceeded
    2. Increments the ETA edit counter
    3. Recalculates target dates for all 34 workflow steps based on new ETA
    4. Preserves existing actual completion dates
    5. Triggers alert evaluation for critical steps
    6. Logs the change in audit trail with user and timestamp
    
    **Business Rules:**
    - Maximum 3 ETA edits allowed per shipment
    - Uses optimistic locking to prevent concurrent modifications
    - All workflow step target dates are recalculated: target_date = new_eta + offset_days
    - Alert evaluation runs automatically after ETA update
    
    **Path Parameters:**
    - **shipment_id**: Unique identifier of the shipment
    
    **Request Body:**
    - **eta**: New Estimated Time of Arrival date (ISO 8601 format: YYYY-MM-DD)
    """
    shipment_service = ShipmentService(db)
    
    try:
        shipment = shipment_service.update_eta(
            shipment_id,
            eta_data.eta,
            current_user,
            request.client.host if request.client else "unknown"
        )
        
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "NOT_FOUND",
                    "message": f"Shipment with ID {shipment_id} not found",
                    "details": []
                }
            )
        
        return shipment
    except ConcurrentModificationError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "CONCURRENT_MODIFICATION",
                "message": str(e),
                "details": []
            }
        )
    except ValueError as e:
        if "edit limit" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": "ETA_EDIT_LIMIT_EXCEEDED",
                    "message": str(e),
                    "details": []
                }
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )


@router.delete(
    "/{shipment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete shipment",
    description="Soft delete a shipment (sets deleted_at timestamp)",
    responses={
        204: {
            "description": "Shipment deleted successfully (no content returned)",
        },
        401: {
            "model": ErrorResponse,
            "description": "Authentication error - Invalid or missing token",
        },
        404: {
            "model": ErrorResponse,
            "description": "Shipment not found",
        },
    },
)
async def delete_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Soft delete a shipment.
    
    This endpoint performs a soft delete by setting the `deleted_at` timestamp
    instead of permanently removing the shipment from the database. This preserves
    data for audit and compliance purposes.
    
    **Path Parameters:**
    - **shipment_id**: Unique identifier of the shipment to delete
    
    **Note:** Soft-deleted shipments are excluded from list queries but remain
    accessible through audit logs.
    """
    shipment_service = ShipmentService(db)
    success = shipment_service.delete_shipment(shipment_id, current_user)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Shipment with ID {shipment_id} not found",
                "details": []
            }
        )


@router.post(
    "/import",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Bulk import shipments",
    description="Import multiple shipments from Excel data in a single request",
    responses={
        200: {
            "description": "Import completed with summary of successful and failed records",
            "content": {
                "application/json": {
                    "example": {
                        "total": 100,
                        "successful": 95,
                        "failed": 5,
                        "errors": [
                            {
                                "row": 3,
                                "shipment_number": "SHP-2024-003",
                                "error": "Invoice amount must be greater than zero"
                            }
                        ]
                    }
                }
            }
        },
        400: {
            "model": ErrorResponse,
            "description": "Validation error - Invalid import data format",
        },
        401: {
            "model": ErrorResponse,
            "description": "Authentication error - Invalid or missing token",
        },
    },
)
async def import_shipments(
    shipments_data: list[ShipmentImport],
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Bulk import shipments from Excel data.
    
    This endpoint allows importing multiple shipments in a single request,
    useful for migrating historical data from Excel spreadsheets.
    
    **Features:**
    - Validates each shipment against the same rules as single creation
    - Generates workflow steps for each successfully imported shipment
    - Continues processing even if some records fail validation
    - Returns detailed summary with success/failure counts and error details
    
    **Request Body:**
    Array of shipment objects, each containing:
    - shipment_number: Unique identifier
    - principal: Principal company name
    - brand: Brand name
    - lc_number: Letter of Credit number
    - invoice_amount_omr: Invoice amount in OMR (must be positive)
    - eta: Estimated Time of Arrival
    
    **Response:**
    Returns import summary with:
    - total: Total number of records processed
    - successful: Number of successfully imported shipments
    - failed: Number of failed imports
    - errors: Array of error details for failed records (row number, shipment number, error message)
    """
    shipment_service = ShipmentService(db)
    
    try:
        result = shipment_service.import_shipments(shipments_data, current_user)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "IMPORT_ERROR",
                "message": str(e),
                "details": []
            }
        )
