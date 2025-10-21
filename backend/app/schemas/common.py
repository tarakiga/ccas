"""Common Pydantic schemas for shared response structures."""

from typing import Generic, TypeVar, List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# Generic type variable for paginated items
T = TypeVar('T')


class Page(BaseModel, Generic[T]):
    """Schema for paginated responses with items, total, page, size."""
    
    items: List[T] = Field(..., description="List of items in the current page")
    total: int = Field(..., ge=0, description="Total number of items across all pages")
    page: int = Field(..., ge=1, description="Current page number (1-indexed)")
    size: int = Field(..., ge=1, description="Number of items per page")
    pages: int = Field(..., ge=0, description="Total number of pages")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [],
                "total": 100,
                "page": 1,
                "size": 50,
                "pages": 2
            }
        }
    )


class ErrorDetail(BaseModel):
    """Schema for individual error detail."""
    
    field: Optional[str] = Field(None, description="Field name that caused the error (if applicable)")
    message: str = Field(..., description="Error message")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "field": "eta",
                "message": "ETA cannot be in the past"
            }
        }
    )


class ErrorResponse(BaseModel):
    """Schema for error responses with code, message, details."""
    
    code: str = Field(..., description="Error code (e.g., VALIDATION_ERROR, NOT_FOUND)")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[List[ErrorDetail]] = Field(None, description="Additional error details")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": [
                    {
                        "field": "eta",
                        "message": "ETA cannot be in the past"
                    },
                    {
                        "field": "invoice_amount_omr",
                        "message": "Invoice amount must be greater than zero"
                    }
                ]
            }
        }
    )


class DependencyStatus(BaseModel):
    """Schema for individual dependency health status."""
    
    name: str = Field(..., description="Dependency name (e.g., 'database', 'redis')")
    status: str = Field(..., description="Status (e.g., 'healthy', 'unhealthy')")
    response_time_ms: Optional[float] = Field(None, description="Response time in milliseconds")
    error: Optional[str] = Field(None, description="Error message if unhealthy")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "database",
                "status": "healthy",
                "response_time_ms": 5.2,
                "error": None
            }
        }
    )


class HealthCheckResponse(BaseModel):
    """Schema for health check response with status, version, uptime, dependencies."""
    
    status: str = Field(..., description="Overall health status (e.g., 'healthy', 'degraded', 'unhealthy')")
    version: str = Field(..., description="Application version")
    uptime_seconds: float = Field(..., ge=0, description="Application uptime in seconds")
    dependencies: List[DependencyStatus] = Field(..., description="Status of external dependencies")
    timestamp: str = Field(..., description="ISO 8601 timestamp of the health check")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "uptime_seconds": 3600.5,
                "dependencies": [
                    {
                        "name": "database",
                        "status": "healthy",
                        "response_time_ms": 5.2,
                        "error": None
                    },
                    {
                        "name": "redis",
                        "status": "healthy",
                        "response_time_ms": 2.1,
                        "error": None
                    }
                ],
                "timestamp": "2024-10-21T10:00:00Z"
            }
        }
    )
