# API Documentation

## Overview

The Customs Clearance Automation System provides a comprehensive REST API for managing customs clearance workflows. The API is built with FastAPI and includes automatic interactive documentation.

## Accessing the Documentation

Once the application is running, you can access the interactive API documentation at:

### Swagger UI (Recommended)
- **URL**: `http://localhost:8000/api/v1/docs`
- **Features**: 
  - Interactive API testing
  - Request/response examples
  - Schema validation
  - Try-it-out functionality

### ReDoc
- **URL**: `http://localhost:8000/api/v1/redoc`
- **Features**:
  - Clean, readable documentation
  - Detailed schema descriptions
  - Code samples
  - Better for reading and reference

### OpenAPI JSON Schema
- **URL**: `http://localhost:8000/api/v1/openapi.json`
- **Use**: Import into API clients like Postman, Insomnia, or code generators

## Authentication

All API endpoints (except health checks and root) require authentication via Auth0 JWT tokens.

### How to Authenticate

1. Obtain a JWT token from Auth0
2. Include the token in the `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Example with curl
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     http://localhost:8000/api/v1/shipments
```

## API Endpoints Overview

### Shipments (`/api/v1/shipments`)
- `POST /shipments` - Create a new shipment
- `GET /shipments` - List shipments with filters
- `GET /shipments/{id}` - Get shipment details
- `PUT /shipments/{id}` - Update shipment
- `PATCH /shipments/{id}/eta` - Update ETA (Business Unit only)
- `DELETE /shipments/{id}` - Soft delete shipment
- `POST /shipments/import` - Bulk import shipments

### Workflow Steps (`/api/v1/workflow-steps`)
- `GET /shipments/{id}/workflow` - Get all workflow steps for a shipment
- `GET /workflow-steps/{id}` - Get workflow step details
- `PATCH /workflow-steps/{id}/complete` - Mark step as complete
- `GET /workflow-steps/my-tasks` - Get current user's assigned tasks

### Alerts (`/api/v1/alerts`)
- `GET /alerts` - List alerts for current user
- `GET /alerts/{id}` - Get alert details
- `PATCH /alerts/{id}/acknowledge` - Acknowledge an alert

### Audit Logs (`/api/v1/audit-logs`)
- `GET /audit-logs` - Query audit logs (Admin/IA only)
- `GET /audit-logs/shipment/{id}` - Get audit trail for shipment

### Metrics (`/api/v1/metrics`)
- `GET /metrics/clearance-time` - Average clearance time by department
- `GET /metrics/on-time-rate` - On-time clearance percentage
- `GET /metrics/demurrage-savings` - Cost avoidance calculation
- `GET /metrics/delayed-steps` - Delayed steps by department

### Health Checks (`/api/v1/health`)
- `GET /health` - Overall health status
- `GET /health/db` - Database connectivity check
- `GET /health/redis` - Redis connectivity check

## Request/Response Format

### Standard Response Format

All successful responses return JSON with appropriate HTTP status codes:
- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "field_name",
      "message": "Field-specific error message"
    }
  ]
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `AUTHENTICATION_ERROR` (401) - Invalid or missing token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONCURRENT_MODIFICATION` (409) - Concurrent update conflict
- `ETA_EDIT_LIMIT_EXCEEDED` (409) - Maximum ETA edits reached
- `INTERNAL_ERROR` (500) - Server error

## Pagination

List endpoints support pagination with the following query parameters:

- `page` - Page number (1-indexed, default: 1)
- `size` - Items per page (default: 50, max: 100)

Paginated responses include:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 50,
  "pages": 2
}
```

## Filtering

Most list endpoints support filtering via query parameters. See the interactive documentation for available filters for each endpoint.

### Example: Filter Shipments
```
GET /api/v1/shipments?status=active&eta_start=2024-01-01&eta_end=2024-12-31&page=1&size=50
```

## Rate Limiting

API requests are limited to **100 requests per minute per user**.

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## Data Validation

All request data is validated against Pydantic schemas. Validation errors return detailed information about which fields failed validation and why.

### Example Validation Error Response

```json
{
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
```

## Schema Examples

All schemas in the interactive documentation include example values. Use these as templates for your requests.

### Example: Create Shipment Request

```json
{
  "shipment_number": "SHP-2024-001",
  "principal": "Al Hashar Group",
  "brand": "Toyota",
  "lc_number": "LC-2024-12345",
  "invoice_amount_omr": "50000.000",
  "eta": "2024-12-01"
}
```

## Testing the API

### Using Swagger UI

1. Navigate to `http://localhost:8000/api/v1/docs`
2. Click the "Authorize" button at the top
3. Enter your JWT token in the format: `Bearer <token>`
4. Click "Authorize" to save
5. Try any endpoint using the "Try it out" button

### Using curl

```bash
# Get all shipments
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/v1/shipments

# Create a shipment
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"shipment_number":"SHP-2024-001","principal":"Al Hashar Group","brand":"Toyota","lc_number":"LC-2024-12345","invoice_amount_omr":"50000.000","eta":"2024-12-01"}' \
     http://localhost:8000/api/v1/shipments
```

### Using Postman

1. Import the OpenAPI schema from `http://localhost:8000/api/v1/openapi.json`
2. Set up authentication in the collection settings
3. All endpoints will be automatically configured with examples

## Support

For API support or questions:
- Review the interactive documentation at `/api/v1/docs`
- Check the project README for setup instructions
- Contact the development team

## Version

Current API Version: **0.1.0**

See the `/` endpoint for version information and documentation links.
