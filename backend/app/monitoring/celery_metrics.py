"""Celery task metrics instrumentation."""

import time
from celery import signals

from app.monitoring.prometheus_metrics import (
    celery_task_duration_seconds,
    celery_task_total,
)

# Store task start times
_task_start_times = {}


@signals.task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, **kwargs):
    """
    Handler called before task execution starts.
    
    Records the start time for duration calculation.
    """
    _task_start_times[task_id] = time.time()


@signals.task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, state=None, **kwargs):
    """
    Handler called after task execution completes.
    
    Records task completion metrics.
    """
    if task_id in _task_start_times:
        duration = time.time() - _task_start_times.pop(task_id)
        task_name = task.name if task else "unknown"
        
        # Record duration
        celery_task_duration_seconds.labels(
            task_name=task_name,
            status="success"
        ).observe(duration)
        
        # Increment counter
        celery_task_total.labels(
            task_name=task_name,
            status="success"
        ).inc()


@signals.task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, **kwargs):
    """
    Handler called when task execution fails.
    
    Records task failure metrics.
    """
    if task_id in _task_start_times:
        duration = time.time() - _task_start_times.pop(task_id)
        task_name = sender.name if sender else "unknown"
        
        # Record duration
        celery_task_duration_seconds.labels(
            task_name=task_name,
            status="failure"
        ).observe(duration)
        
        # Increment counter
        celery_task_total.labels(
            task_name=task_name,
            status="failure"
        ).inc()
