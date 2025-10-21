"""Global exception handlers for FastAPI."""

import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from jose.exceptions import JWTError

logger = logging.getLogger(__name__)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle Pydantic validation errors.
    
    Returns 400 Bad Request with detailed error information.
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.warning(
        "Validation error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": errors,
            "user": getattr(request.state, "user_id", None),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": errors
            }
        }
    )


async def authentication_exception_handler(request: Request, exc: JWTError):
    """
    Handle JWT authentication errors.
    
    Returns 401 Unauthorized.
    """
    logger.warning(
        "Authentication error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error": str(exc),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": {
                "code": "AUTHENTICATION_ERROR",
                "message": "Invalid or expired authentication token",
                "details": []
            }
        },
        headers={"WWW-Authenticate": "Bearer"}
    )


async def authorization_exception_handler(request: Request, exc: PermissionError):
    """
    Handle authorization/permission errors.
    
    Returns 403 Forbidden.
    """
    logger.warning(
        "Authorization error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error": str(exc),
            "user": getattr(request.state, "user_id", None),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": {
                "code": "FORBIDDEN",
                "message": str(exc) or "You do not have permission to access this resource",
                "details": []
            }
        }
    )


async def not_found_exception_handler(request: Request, exc: Exception):
    """
    Handle resource not found errors.
    
    Returns 404 Not Found.
    """
    logger.info(
        "Resource not found",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error": str(exc),
            "user": getattr(request.state, "user_id", None),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": {
                "code": "NOT_FOUND",
                "message": str(exc) or "Resource not found",
                "details": []
            }
        }
    )


async def conflict_exception_handler(request: Request, exc: Exception):
    """
    Handle conflict errors (e.g., concurrent modifications, duplicate entries).
    
    Returns 409 Conflict.
    """
    logger.warning(
        "Conflict error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error": str(exc),
            "user": getattr(request.state, "user_id", None),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": {
                "code": "CONFLICT",
                "message": str(exc) or "Resource conflict detected",
                "details": []
            }
        }
    )


async def integrity_exception_handler(request: Request, exc: IntegrityError):
    """
    Handle database integrity errors (e.g., unique constraint violations).
    
    Returns 409 Conflict.
    """
    logger.warning(
        "Database integrity error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error": str(exc),
            "user": getattr(request.state, "user_id", None),
        }
    )
    
    # Extract meaningful message from SQLAlchemy error
    error_msg = "A database constraint was violated"
    if "unique constraint" in str(exc).lower():
        error_msg = "A record with this value already exists"
    elif "foreign key constraint" in str(exc).lower():
        error_msg = "Referenced record does not exist"
    
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": {
                "code": "INTEGRITY_ERROR",
                "message": error_msg,
                "details": []
            }
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handle all other unhandled exceptions.
    
    Returns 500 Internal Server Error.
    """
    logger.error(
        "Unhandled exception",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error": str(exc),
            "error_type": type(exc).__name__,
            "user": getattr(request.state, "user_id", None),
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": []
            }
        }
    )
