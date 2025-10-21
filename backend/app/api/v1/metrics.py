"""Metrics API endpoints."""

from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.metrics import (
    ClearanceTimeMetrics,
    OnTimeRateMetrics,
    DemurrageSavings,
    DelayedStepsMetrics,
    DateRange,
)
from app.schemas.common import ErrorResponse
from app.services.metrics_service import MetricsService

router = APIRouter(prefix="/metrics", tags=["metrics"])


# Simple in-memory cache for metrics (5-minute TTL)
_metrics_cache = {}
_cache_ttl = 300  # 5 minutes in seconds


def get_cached_or_compute(cache_key: str, compute_func):
    """Get cached result or compute and cache it."""
    import time
    
    if cache_key in _metrics_cache:
        cached_data, timestamp = _metrics_cache[cache_key]
        if time.time() - timestamp < _cache_ttl:
            return cached_data
    
    # Compute new result
    result = compute_func()
    _metrics_cache[cache_key] = (result, time.time())
    return result


@router.get(
    "/clearance-time",
    response_model=ClearanceTimeMetrics,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
    }
)
async def get_clearance_time_metrics(
    date_start: date,
    date_end: date,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get average clearance time metrics.
    
    Calculates average days from ETA to final step completion,
    grouped by department.
    
    Query parameters:
    - date_start: Start date for metrics calculation (required)
    - date_end: End date for metrics calculation (required)
    - department: Optional department filter
    """
    try:
        date_range = DateRange(start_date=date_start, end_date=date_end)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )
    
    cache_key = f"clearance_time:{date_start}:{date_end}:{department}"
    
    def compute():
        metrics_service = MetricsService(db)
        return metrics_service.get_average_clearance_time(date_range, department)
    
    return get_cached_or_compute(cache_key, compute)


@router.get(
    "/on-time-rate",
    response_model=OnTimeRateMetrics,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
    }
)
async def get_on_time_rate_metrics(
    date_start: date,
    date_end: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get on-time clearance rate metrics.
    
    Calculates percentage of shipments with all critical steps
    completed by Day 7 post-ETA.
    
    Query parameters:
    - date_start: Start date for metrics calculation (required)
    - date_end: End date for metrics calculation (required)
    """
    try:
        date_range = DateRange(start_date=date_start, end_date=date_end)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )
    
    cache_key = f"on_time_rate:{date_start}:{date_end}"
    
    def compute():
        metrics_service = MetricsService(db)
        return metrics_service.get_on_time_rate(date_range)
    
    return get_cached_or_compute(cache_key, compute)


@router.get(
    "/demurrage-savings",
    response_model=DemurrageSavings,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
    }
)
async def get_demurrage_savings_metrics(
    date_start: date,
    date_end: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get demurrage cost avoidance metrics.
    
    Estimates cost savings based on on-time clearances
    (assumes $100/day demurrage cost).
    
    Query parameters:
    - date_start: Start date for metrics calculation (required)
    - date_end: End date for metrics calculation (required)
    """
    try:
        date_range = DateRange(start_date=date_start, end_date=date_end)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )
    
    cache_key = f"demurrage_savings:{date_start}:{date_end}"
    
    def compute():
        metrics_service = MetricsService(db)
        return metrics_service.calculate_demurrage_savings(date_range)
    
    return get_cached_or_compute(cache_key, compute)


@router.get(
    "/delayed-steps",
    response_model=DelayedStepsMetrics,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
    }
)
async def get_delayed_steps_metrics(
    date_start: date,
    date_end: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get delayed steps by department.
    
    Returns steps with actual_date > target_date grouped by department.
    
    Query parameters:
    - date_start: Start date for metrics calculation (required)
    - date_end: End date for metrics calculation (required)
    """
    try:
        date_range = DateRange(start_date=date_start, end_date=date_end)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": []
            }
        )
    
    cache_key = f"delayed_steps:{date_start}:{date_end}"
    
    def compute():
        metrics_service = MetricsService(db)
        return metrics_service.get_delayed_steps_by_department(date_range)
    
    return get_cached_or_compute(cache_key, compute)
