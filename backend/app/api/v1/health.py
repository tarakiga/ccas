"""Health check API endpoints."""

import time
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import redis

from app.dependencies import get_db
from app.schemas.common import HealthCheckResponse
from app.config import settings

router = APIRouter(prefix="/health", tags=["health"])

# Track application start time
_start_time = time.time()


@router.get(
    "",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
)
async def health_check():
    """
    Basic health check endpoint.
    
    Returns service status, version, and uptime.
    Responds within 100ms.
    """
    uptime_seconds = int(time.time() - _start_time)
    
    return HealthCheckResponse(
        status="healthy",
        version=settings.VERSION,
        uptime_seconds=uptime_seconds,
        dependencies={}
    )


@router.get(
    "/db",
    status_code=status.HTTP_200_OK,
)
async def health_check_database(db: Session = Depends(get_db)):
    """
    Database connectivity health check.
    
    Returns 200 if database connection is active, 503 otherwise.
    """
    try:
        # Execute a simple query to test connection
        db.execute(text("SELECT 1"))
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "healthy",
                "service": "database",
                "message": "Database connection is active"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "service": "database",
                "message": f"Database connection failed: {str(e)}"
            }
        )


@router.get(
    "/redis",
    status_code=status.HTTP_200_OK,
)
async def health_check_redis():
    """
    Redis connectivity health check.
    
    Returns 200 if Redis connection is active, 503 otherwise.
    """
    try:
        # Create Redis client and test connection
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        redis_client.ping()
        redis_client.close()
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "healthy",
                "service": "redis",
                "message": "Redis connection is active"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "service": "redis",
                "message": f"Redis connection failed: {str(e)}"
            }
        )
