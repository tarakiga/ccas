"""FastAPI application initialization and configuration."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from jose.exceptions import JWTError
import logging

from app.config import settings
from app.logging_config import setup_logging
from app.database import engine, Base
from app.api.v1 import api_router
from app.api.v1.exceptions import (
    validation_exception_handler,
    authentication_exception_handler,
    authorization_exception_handler,
    integrity_exception_handler,
    conflict_exception_handler,
    generic_exception_handler,
)
from app.exceptions import ConcurrentModificationError
from app.middleware import RequestIDMiddleware, MetricsMiddleware

# Setup logging before anything else
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    
    Args:
        app: FastAPI application instance
    """
    # Startup
    logger.info(
        "Starting application",
        extra={
            "project": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "debug": settings.DEBUG
        }
    )
    
    # Create database tables (in production, use Alembic migrations)
    # Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    engine.dispose()


# Create FastAPI application with comprehensive OpenAPI documentation
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
## Customs Clearance Automation System API

The Customs Clearance Automation System backend provides comprehensive API services to digitize 
the manual Excel-based customs clearance workflow. The system eliminates demurrage costs by 
ensuring vehicles are cleared within 7 days of port arrival (ETA) through automated tracking, 
role-based accountability, and real-time alerts.

### Key Features

* **Shipment Management**: Create and track shipments with automatic financial calculations
* **Workflow Automation**: 34-step workflow generation with target date calculations
* **Role-Based Access**: Department-specific permissions and task assignments
* **Alert System**: Automated alerts for critical steps approaching deadlines
* **Audit Trail**: Complete change history for compliance and accountability
* **Metrics & Reporting**: Performance dashboards and KPI tracking

### Authentication

All API endpoints require authentication via Auth0 JWT tokens. Include the token in the 
`Authorization` header as `Bearer <token>`.

### Rate Limiting

API requests are limited to 100 requests per minute per user.

### Support

For API support, contact the development team or refer to the project documentation.
    """,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
    contact={
        "name": "Customs Clearance API Support",
        "email": "support@alhashargroup.com",
    },
    license_info={
        "name": "Proprietary",
    },
    openapi_tags=[
        {
            "name": "shipments",
            "description": "Operations for managing shipments including creation, updates, and ETA modifications. "
                          "Shipments are the core entity tracking customs clearance from arrival to completion.",
        },
        {
            "name": "workflow",
            "description": "Operations for managing workflow steps. Each shipment has 34 predefined steps "
                          "that must be completed by assigned users (PPR/APR) within target dates.",
        },
        {
            "name": "alerts",
            "description": "Operations for managing alerts. Alerts are automatically generated when critical "
                          "workflow steps are at risk of missing deadlines, with escalation to management.",
        },
        {
            "name": "audit",
            "description": "Operations for querying audit logs. All data modifications are logged with "
                          "user attribution, timestamps, and field-level change tracking for compliance.",
        },
        {
            "name": "metrics",
            "description": "Operations for retrieving performance metrics including clearance times, "
                          "on-time rates, demurrage savings, and delayed steps by department.",
        },
        {
            "name": "health",
            "description": "Health check endpoints for monitoring service availability and dependency status.",
        },
    ],
)

# Add Request ID middleware (first, so it wraps all other middleware)
app.add_middleware(RequestIDMiddleware)

# Add Metrics middleware
app.add_middleware(MetricsMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(JWTError, authentication_exception_handler)
app.add_exception_handler(PermissionError, authorization_exception_handler)
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(ConcurrentModificationError, conflict_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.get(
    "/",
    tags=["root"],
    summary="API Root",
    description="Get API information and documentation links",
)
async def root():
    """
    Root endpoint providing API information and documentation links.
    
    Returns:
        - API name and version
        - Links to interactive documentation (Swagger UI and ReDoc)
        - API status
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": {
            "swagger_ui": f"{settings.API_V1_PREFIX}/docs",
            "redoc": f"{settings.API_V1_PREFIX}/redoc",
            "openapi_json": f"{settings.API_V1_PREFIX}/openapi.json"
        },
        "description": "Customs Clearance Automation System - Digitizing customs clearance workflows to eliminate demurrage costs"
    }


# Include API routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
