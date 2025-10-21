"""Monitoring endpoints for Prometheus metrics and health checks."""

from fastapi import APIRouter, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy import text

from app.dependencies import get_db
from app.database import engine

router = APIRouter(tags=["monitoring"])


@router.get("/metrics")
async def metrics():
    """
    Expose Prometheus metrics endpoint.
    
    Returns metrics in Prometheus text format for scraping.
    """
    # Update database connection pool metrics
    from app.monitoring.prometheus_metrics import (
        db_connection_pool_size,
        db_connection_pool_in_use,
        db_connection_pool_overflow,
    )
    
    pool = engine.pool
    db_connection_pool_size.set(pool.size())
    db_connection_pool_in_use.set(pool.checkedin())
    
    # Get overflow if available
    if hasattr(pool, 'overflow'):
        db_connection_pool_overflow.set(pool.overflow())
    
    # Generate and return metrics
    metrics_output = generate_latest()
    return Response(content=metrics_output, media_type=CONTENT_TYPE_LATEST)
