"""Request ID middleware for tracking requests across the application."""

import uuid
import logging
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to generate and track unique request IDs.
    
    This middleware:
    - Generates a unique request ID for each incoming request
    - Adds the request ID to the request state
    - Includes the request ID in response headers
    - Makes the request ID available to logging
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process the request and add request ID tracking.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            Response with X-Request-ID header
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Store request ID in request state for access in route handlers
        request.state.request_id = request_id
        
        # Add request ID to logging context
        # This allows all logs during this request to include the request_id
        old_factory = logging.getLogRecordFactory()
        
        def record_factory(*args, **kwargs):
            record = old_factory(*args, **kwargs)
            record.request_id = request_id
            return record
        
        logging.setLogRecordFactory(record_factory)
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
        finally:
            # Restore original log record factory
            logging.setLogRecordFactory(old_factory)
