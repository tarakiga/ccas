"""Metrics middleware for tracking HTTP request metrics."""

import time
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.monitoring.prometheus_metrics import (
    http_requests_total,
    http_request_duration_seconds,
    http_requests_in_progress,
)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track HTTP request metrics for Prometheus.
    
    Tracks:
    - Total request count by method, endpoint, and status code
    - Request duration by method and endpoint
    - Requests currently in progress
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process the request and track metrics.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            Response from the handler
        """
        # Extract method and path
        method = request.method
        path = request.url.path
        
        # Normalize path to avoid high cardinality (replace IDs with placeholders)
        endpoint = self._normalize_path(path)
        
        # Track in-progress requests
        http_requests_in_progress.labels(method=method, endpoint=endpoint).inc()
        
        # Track request duration
        start_time = time.time()
        
        try:
            # Process the request
            response = await call_next(request)
            status_code = response.status_code
            
            return response
        except Exception as e:
            # Track failed requests
            status_code = 500
            raise
        finally:
            # Record metrics
            duration = time.time() - start_time
            
            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()
            
            http_request_duration_seconds.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
            
            http_requests_in_progress.labels(method=method, endpoint=endpoint).dec()
    
    def _normalize_path(self, path: str) -> str:
        """
        Normalize URL path to reduce cardinality.
        
        Replaces numeric IDs and UUIDs with placeholders.
        """
        import re
        
        # Replace UUIDs first (before numeric IDs to avoid partial matches)
        path = re.sub(
            r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
            '/{uuid}',
            path,
            flags=re.IGNORECASE
        )
        
        # Replace numeric IDs
        path = re.sub(r'/\d+', '/{id}', path)
        
        return path
