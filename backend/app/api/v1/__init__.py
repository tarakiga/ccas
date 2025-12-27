"""API v1 endpoints package."""

from fastapi import APIRouter

from app.api.v1 import shipments, workflow, alerts, audit, metrics, health, monitoring, brands

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(shipments.router)
api_router.include_router(workflow.router)
api_router.include_router(alerts.router)
api_router.include_router(audit.router)
api_router.include_router(metrics.router)
api_router.include_router(health.router)
api_router.include_router(monitoring.router)
api_router.include_router(brands.router)

__all__ = ["api_router"]
