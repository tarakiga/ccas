# Celery Tasks

This directory contains Celery tasks for background processing in the Customs Clearance Automation System.

## Overview

The system uses Celery for asynchronous task processing with Redis as the message broker and result backend.

### Tasks

1. **Alert Evaluation Task** (`alert_tasks.py`)
   - Runs daily at 08:00 UTC
   - Evaluates active shipments for alert conditions
   - Processes shipments in batches of 100
   - Creates alerts based on days post-ETA thresholds

2. **Email Notification Tasks** (`email_tasks.py`)
   - `process_email_notifications_task`: Runs every 5 minutes to queue pending emails
   - `send_alert_email`: Sends individual alert emails with retry logic (max 3 retries)

## Running Celery

### Start Celery Worker

To process tasks, start a Celery worker:

```bash
# From the backend directory
celery -A app.tasks worker --loglevel=info
```

For multiple queues with different priorities:

```bash
celery -A app.tasks worker --loglevel=info -Q alerts,emails,default
```

### Start Celery Beat Scheduler

To run scheduled periodic tasks, start Celery Beat:

```bash
# From the backend directory
celery -A app.tasks beat --loglevel=info
```

### Run Both Worker and Beat Together

For development, you can run both in a single process:

```bash
celery -A app.tasks worker --beat --loglevel=info
```

**Note:** In production, run worker and beat as separate processes.

## Docker Compose

The recommended way to run Celery in production is using Docker Compose:

```yaml
services:
  worker:
    image: customs-clearance-api:latest
    command: celery -A app.tasks worker --loglevel=info
    environment:
      - DATABASE_URL
      - REDIS_URL
      - SMTP_HOST
      - SMTP_PORT
      - SMTP_USER
      - SMTP_PASSWORD
      - SMTP_FROM
    depends_on:
      - db
      - redis
  
  beat:
    image: customs-clearance-api:latest
    command: celery -A app.tasks beat --loglevel=info
    environment:
      - REDIS_URL
    depends_on:
      - redis
```

## Configuration

Celery configuration is defined in `app/celery_app.py`:

- **Broker:** Redis (from `REDIS_URL` or `CELERY_BROKER_URL` env var)
- **Result Backend:** Redis (from `REDIS_URL` or `CELERY_RESULT_BACKEND` env var)
- **Task Queues:**
  - `alerts`: High priority (8) - Alert evaluation tasks
  - `emails`: Medium priority (5) - Email sending tasks
  - `default`: Normal priority (5) - Other tasks
- **Result Expiration:** 24 hours
- **Serialization:** JSON

## Monitoring

### Flower (Web-based Monitoring)

Install and run Flower to monitor Celery tasks:

```bash
pip install flower
celery -A app.tasks flower
```

Access the web interface at http://localhost:5555

### Task Status

Check task status programmatically:

```python
from app.tasks.alert_tasks import evaluate_alerts_task

# Queue a task
result = evaluate_alerts_task.delay()

# Check status
print(result.status)  # PENDING, STARTED, SUCCESS, FAILURE, RETRY

# Get result (blocks until task completes)
task_result = result.get(timeout=10)
```

## Task Schedules

### Alert Evaluation
- **Schedule:** Daily at 08:00 UTC
- **Task:** `app.tasks.alert_tasks.evaluate_alerts_task`
- **Purpose:** Evaluate all active shipments for alert conditions
- **Performance:** Processes 1000 shipments within 5 minutes

### Email Notification Processing
- **Schedule:** Every 5 minutes
- **Task:** `app.tasks.email_tasks.process_email_notifications_task`
- **Purpose:** Queue email tasks for pending alert notifications
- **Retry Logic:** Up to 3 retries with 5-minute intervals

## Manual Task Execution

You can manually trigger tasks for testing:

```python
from app.tasks.alert_tasks import evaluate_alerts_task, evaluate_single_shipment_alerts
from app.tasks.email_tasks import send_alert_email, process_email_notifications_task

# Evaluate all alerts
evaluate_alerts_task.delay()

# Evaluate single shipment
evaluate_single_shipment_alerts.delay(shipment_id=123)

# Send email for specific alert
send_alert_email.delay(alert_id=456)

# Process all pending emails
process_email_notifications_task.delay()
```

## Troubleshooting

### Worker Not Processing Tasks

1. Check Redis connection:
   ```bash
   redis-cli ping
   ```

2. Verify worker is running:
   ```bash
   celery -A app.tasks inspect active
   ```

3. Check worker logs for errors

### Email Sending Failures

1. Verify SMTP configuration in `.env`:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`

2. Check email task logs for specific errors

3. Verify email retry count in database:
   ```sql
   SELECT id, email_retry_count, email_sent 
   FROM alerts 
   WHERE email_sent = false;
   ```

### Performance Issues

1. Increase worker concurrency:
   ```bash
   celery -A app.tasks worker --concurrency=8
   ```

2. Use multiple workers for different queues:
   ```bash
   # Worker 1: High priority alerts
   celery -A app.tasks worker -Q alerts --concurrency=4
   
   # Worker 2: Email processing
   celery -A app.tasks worker -Q emails --concurrency=4
   ```

3. Monitor task execution times in logs

## Environment Variables

Required environment variables for Celery tasks:

```bash
# Redis (required)
REDIS_URL=redis://localhost:6379/0

# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/customs_clearance

# SMTP (required for email tasks)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com
SMTP_TLS=true

# Optional: Override Celery URLs
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```
