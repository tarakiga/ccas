"""Prometheus metrics definitions for application monitoring."""

from prometheus_client import Counter, Histogram, Gauge, Info

# Application info
app_info = Info("customs_clearance_app", "Application information")

# HTTP request metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status_code"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0)
)

http_requests_in_progress = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests currently being processed",
    ["method", "endpoint"]
)

# Database connection pool metrics
db_connection_pool_size = Gauge(
    "db_connection_pool_size",
    "Total size of the database connection pool"
)

db_connection_pool_in_use = Gauge(
    "db_connection_pool_in_use",
    "Number of database connections currently in use"
)

db_connection_pool_overflow = Gauge(
    "db_connection_pool_overflow",
    "Number of overflow connections in use"
)

# Celery task metrics
celery_task_duration_seconds = Histogram(
    "celery_task_duration_seconds",
    "Celery task execution time in seconds",
    ["task_name", "status"],
    buckets=(0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0)
)

celery_task_total = Counter(
    "celery_task_total",
    "Total number of Celery tasks executed",
    ["task_name", "status"]
)

# Alert evaluation metrics
alert_evaluation_total = Counter(
    "alert_evaluation_total",
    "Total number of alert evaluations",
    ["severity"]
)

alert_evaluation_duration_seconds = Histogram(
    "alert_evaluation_duration_seconds",
    "Alert evaluation duration in seconds",
    buckets=(0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0)
)

# Email notification metrics
email_sent_total = Counter(
    "email_sent_total",
    "Total number of emails sent",
    ["status"]
)

email_retry_total = Counter(
    "email_retry_total",
    "Total number of email retry attempts"
)

# Business metrics
shipments_created_total = Counter(
    "shipments_created_total",
    "Total number of shipments created"
)

workflow_steps_completed_total = Counter(
    "workflow_steps_completed_total",
    "Total number of workflow steps completed",
    ["department"]
)

alerts_created_total = Counter(
    "alerts_created_total",
    "Total number of alerts created",
    ["severity"]
)
