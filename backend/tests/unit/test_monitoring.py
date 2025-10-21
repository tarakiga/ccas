"""Unit tests for monitoring and metrics."""

import pytest
from unittest.mock import Mock, patch
from starlette.requests import Request
from starlette.responses import Response

from app.middleware.request_id import RequestIDMiddleware
from app.middleware.metrics import MetricsMiddleware
from app.monitoring.prometheus_metrics import (
    http_requests_total,
    http_request_duration_seconds,
    shipments_created_total,
)


class TestRequestIDMiddleware:
    """Tests for request ID middleware."""
    
    @pytest.mark.asyncio
    async def test_request_id_generation(self):
        """Test that request ID is generated and added to response headers."""
        # Create middleware
        middleware = RequestIDMiddleware(app=Mock())
        
        # Create mock request
        request = Mock(spec=Request)
        request.state = Mock()
        
        # Create mock response
        response = Response(content="test")
        
        # Mock call_next
        async def call_next(req):
            return response
        
        # Process request
        result = await middleware.dispatch(request, call_next)
        
        # Verify request ID was added to response headers
        assert "X-Request-ID" in result.headers
        assert len(result.headers["X-Request-ID"]) > 0
        
        # Verify request ID was stored in request state
        assert hasattr(request.state, "request_id")


class TestMetricsMiddleware:
    """Tests for metrics middleware."""
    
    @pytest.mark.asyncio
    async def test_metrics_tracking(self):
        """Test that HTTP metrics are tracked."""
        # Create middleware
        middleware = MetricsMiddleware(app=Mock())
        
        # Create mock request
        request = Mock(spec=Request)
        request.method = "GET"
        request.url = Mock()
        request.url.path = "/api/v1/shipments"
        
        # Create mock response
        response = Response(content="test", status_code=200)
        
        # Mock call_next
        async def call_next(req):
            return response
        
        # Get initial metric values
        initial_count = http_requests_total.labels(
            method="GET",
            endpoint="/api/v1/shipments",
            status_code=200
        )._value._value
        
        # Process request
        result = await middleware.dispatch(request, call_next)
        
        # Verify response is returned
        assert result == response
        
        # Verify metrics were incremented
        final_count = http_requests_total.labels(
            method="GET",
            endpoint="/api/v1/shipments",
            status_code=200
        )._value._value
        
        assert final_count > initial_count
    
    def test_path_normalization(self):
        """Test that paths with IDs are normalized."""
        middleware = MetricsMiddleware(app=Mock())
        
        # Test numeric ID normalization
        assert middleware._normalize_path("/api/v1/shipments/123") == "/api/v1/shipments/{id}"
        assert middleware._normalize_path("/api/v1/workflow-steps/456/complete") == "/api/v1/workflow-steps/{id}/complete"
        
        # Test UUID normalization
        uuid_path = "/api/v1/alerts/550e8400-e29b-41d4-a716-446655440000"
        assert middleware._normalize_path(uuid_path) == "/api/v1/alerts/{uuid}"


class TestPrometheusMetrics:
    """Tests for Prometheus metrics definitions."""
    
    def test_metrics_exist(self):
        """Test that all required metrics are defined."""
        # Verify HTTP metrics
        assert http_requests_total is not None
        assert http_request_duration_seconds is not None
        
        # Verify business metrics
        assert shipments_created_total is not None
