"""Celery application configuration."""

from celery import Celery
from celery.schedules import crontab

from app.config import settings

# Import Celery metrics handlers to register signal handlers
from app.monitoring import celery_metrics  # noqa: F401

# Create Celery application
celery_app = Celery(
    "customs_clearance",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
    include=["app.tasks.alert_tasks", "app.tasks.email_tasks"]
)

# Configure Celery
celery_app.conf.update(
    # Task routing and priorities
    task_routes={
        "app.tasks.alert_tasks.*": {"queue": "alerts", "priority": 8},
        "app.tasks.email_tasks.*": {"queue": "emails", "priority": 5},
    },
    task_default_queue="default",
    task_default_priority=5,
    
    # Task result expiration (24 hours)
    result_expires=86400,
    
    # Task serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    
    # Timezone
    timezone="UTC",
    enable_utc=True,
    
    # Task execution settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Worker settings
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

# Configure Celery Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    # Daily alert evaluation at 08:00 UTC
    "evaluate-alerts-daily": {
        "task": "app.tasks.alert_tasks.evaluate_alerts_task",
        "schedule": crontab(hour=8, minute=0),
        "options": {"queue": "alerts", "priority": 10},
    },
    # Email notification processing every 5 minutes
    "process-email-notifications": {
        "task": "app.tasks.email_tasks.process_email_notifications_task",
        "schedule": crontab(minute="*/5"),
        "options": {"queue": "emails", "priority": 7},
    },
}

# Optional: Configure logging
celery_app.conf.update(
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s",
)
