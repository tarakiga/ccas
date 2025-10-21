# Monitoring and Observability

This document describes the monitoring and observability features implemented in the Customs Clearance Automation System backend.

## Overview

The system implements comprehensive monitoring using:
- **Structured JSON logging** with request ID tracking
- **Prometheus metrics** for application and business metrics
- **Request tracing** via unique request IDs

## Structured Logging

### Configuration

Logging is configured in `app/logging_config.py` with the following features:

- **JSON format**: All logs are output in JSON format for easy parsing
- **Log levels**: Configurable via `LOG_LEVEL` environment variable (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- **Structured fields**: Each log entry includes:
  - `timestamp`: ISO 8601 format timestamp
  - `level`: Log level (INFO, ERROR, etc.)
  - `logger`: Logger name (module path)
  - `message`: Log message
  - `request_id`: Unique request identifier (when available)
  - `user_id`: User identifier (when available)
  - `context`: Additional context data

### Environment Variables

```bash
LOG_LEVEL=INFO          # Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_FORMAT=json         # Log format (json or text)
```

### Example Log Entry

```json
{
  "timestamp": "2024-10-22T10:30:45.123456Z",
  "level": "INFO",
  "logger": "app.services.shipment_service",
  "message": "Created shipment SHP-2024-001",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": 123
}
```

## Request ID Tracking

### Middleware

The `RequestIDMiddleware` automatically:
- Generates a unique UUID for each incoming request
- Adds the request ID to the request state
- Includes the request ID in all log entries during request processing
- Returns the request ID in the `X-Request-ID` response header

### Usage

Clients can use the `X-Request-ID` header to:
- Track requests across distributed systems
- Correlate logs for debugging
- Report issues with specific request IDs

## Prometheus Metrics

### Metrics Endpoint

Prometheus metrics are exposed at:

```
GET /api/v1/metrics
```

This endpoint returns metrics in Prometheus text format for scraping.

### HTTP Metrics

**Request Count**
```
http_requests_total{method="GET", endpoint="/api/v1/shipments", status_code="200"}
```
Total number of HTTP requests by method, endpoint, and status code.

**Request Duration**
```
http_request_duration_seconds{method="GET", endpoint="/api/v1/shipments"}
```
HTTP request latency histogram in seconds.

**Requests In Progress**
```
http_requests_in_progress{method="GET", endpoint="/api/v1/shipments"}
```
Number of HTTP requests currently being processed.

### Database Metrics

**Connection Pool Size**
```
db_connection_pool_size
```
Total size of the database connection pool.

**Connections In Use**
```
db_connection_pool_in_use
```
Number of database connections currently in use.

**Overflow Connections**
```
db_connection_pool_overflow
```
Number of overflow connections in use.

### Celery Task Metrics

**Task Duration**
```
celery_task_duration_seconds{task_name="app.tasks.alert_tasks.evaluate_alerts_task", status="success"}
```
Celery task execution time histogram in seconds.

**Task Count**
```
celery_task_total{task_name="app.tasks.alert_tasks.evaluate_alerts_task", status="success"}
```
Total number of Celery tasks executed by task name and status.

### Alert Metrics

**Alert Evaluation Count**
```
alert_evaluation_total{severity="critical"}
```
Total number of alert evaluations by severity.

**Alert Evaluation Duration**
```
alert_evaluation_duration_seconds
```
Alert evaluation duration histogram in seconds.

**Alerts Created**
```
alerts_created_total{severity="critical"}
```
Total number of alerts created by severity.

### Email Metrics

**Emails Sent**
```
email_sent_total{status="success"}
```
Total number of emails sent by status (success/failure).

**Email Retries**
```
email_retry_total
```
Total number of email retry attempts.

### Business Metrics

**Shipments Created**
```
shipments_created_total
```
Total number of shipments created.

**Workflow Steps Completed**
```
workflow_steps_completed_total{department="Finance"}
```
Total number of workflow steps completed by department.

## Prometheus Configuration

### Scrape Configuration

Add the following to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'customs-clearance-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/api/v1/metrics'
```

### Grafana Dashboards

Example queries for Grafana dashboards:

**Request Rate**
```promql
rate(http_requests_total[5m])
```

**Request Latency (95th percentile)**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Error Rate**
```promql
rate(http_requests_total{status_code=~"5.."}[5m])
```

**Database Connection Pool Usage**
```promql
db_connection_pool_in_use / db_connection_pool_size * 100
```

**Celery Task Success Rate**
```promql
rate(celery_task_total{status="success"}[5m]) / rate(celery_task_total[5m]) * 100
```

**Alert Creation Rate by Severity**
```promql
rate(alerts_created_total[5m])
```

## Monitoring Best Practices

### Log Levels

- **DEBUG**: Detailed information for diagnosing problems (development only)
- **INFO**: General informational messages about application flow
- **WARNING**: Warning messages for potentially harmful situations
- **ERROR**: Error messages for serious problems
- **CRITICAL**: Critical messages for very serious errors

### Alerting Rules

Recommended Prometheus alerting rules:

```yaml
groups:
  - name: customs_clearance_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: HighRequestLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        annotations:
          summary: "High request latency detected"
          
      - alert: DatabaseConnectionPoolExhausted
        expr: db_connection_pool_in_use / db_connection_pool_size > 0.9
        for: 5m
        annotations:
          summary: "Database connection pool nearly exhausted"
          
      - alert: CeleryTaskFailureRate
        expr: rate(celery_task_total{status="failure"}[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High Celery task failure rate"
```

## Troubleshooting

### Viewing Logs

**Docker Compose**
```bash
docker-compose logs -f api
```

**Kubernetes**
```bash
kubectl logs -f deployment/customs-clearance-api
```

### Querying Metrics

**Check metrics endpoint**
```bash
curl http://localhost:8000/api/v1/metrics
```

**Query specific metric**
```bash
curl http://localhost:8000/api/v1/metrics | grep http_requests_total
```

### Request Tracing

To trace a specific request:

1. Make the API request and capture the `X-Request-ID` header
2. Search logs for that request ID:
   ```bash
   docker-compose logs api | grep "550e8400-e29b-41d4-a716-446655440000"
   ```

## Performance Considerations

- Metrics collection has minimal overhead (<1ms per request)
- JSON logging adds ~0.5ms per log entry
- Request ID generation uses UUID4 (cryptographically secure)
- Metrics are stored in memory and exposed via HTTP endpoint
- Database connection pool metrics are updated on each scrape

## Security

- The `/api/v1/metrics` endpoint is publicly accessible for Prometheus scraping
- Consider restricting access to metrics endpoint in production using network policies
- Request IDs are UUIDs and do not contain sensitive information
- Logs may contain sensitive data - ensure proper log retention and access controls
