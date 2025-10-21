"""Celery tasks for alert evaluation and processing."""

import logging
from datetime import date, timedelta
from typing import List
from time import time

from app.celery_app import celery_app
from app.database import SessionLocal
from app.repositories.shipment_repository import ShipmentRepository
from app.services.alert_service import AlertService
from app.services.workflow_service import WorkflowService
from app.monitoring.prometheus_metrics import alert_evaluation_duration_seconds

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.alert_tasks.evaluate_alerts_task", bind=True)
def evaluate_alerts_task(self):
    """
    Scheduled task that runs daily at 08:00 UTC to evaluate shipment alerts.
    
    Queries active shipments with ETA in past 30 days and evaluates alert conditions.
    Processes shipments in batches of 100 for performance.
    
    Returns:
        Dictionary with task execution summary
    """
    start_time = time()
    logger.info("Starting alert evaluation task")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Initialize repositories and services
        shipment_repo = ShipmentRepository(db)
        workflow_service = WorkflowService(db)
        alert_service = AlertService(db, workflow_service=workflow_service)
        
        # Calculate date range: past 30 days from today
        today = date.today()
        start_date = today - timedelta(days=30)
        end_date = today
        
        logger.info(
            f"Querying active shipments with ETA between {start_date} and {end_date}"
        )
        
        # Get active shipments within ETA range
        shipments = shipment_repo.get_active_shipments_by_eta_range(
            start_date=start_date,
            end_date=end_date
        )
        
        total_shipments = len(shipments)
        logger.info(f"Found {total_shipments} active shipments to evaluate")
        
        # Process shipments in batches of 100
        batch_size = 100
        total_alerts_created = 0
        processed_count = 0
        error_count = 0
        
        for i in range(0, total_shipments, batch_size):
            batch = shipments[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            logger.info(
                f"Processing batch {batch_num} "
                f"({len(batch)} shipments, {i + 1}-{i + len(batch)} of {total_shipments})"
            )
            
            for shipment in batch:
                try:
                    # Evaluate alerts for this shipment
                    alerts = alert_service.evaluate_shipment_alerts(shipment)
                    total_alerts_created += len(alerts)
                    processed_count += 1
                    
                    if alerts:
                        logger.info(
                            f"Created {len(alerts)} alert(s) for shipment {shipment.shipment_number}"
                        )
                
                except Exception as e:
                    error_count += 1
                    logger.error(
                        f"Error evaluating alerts for shipment {shipment.id}: {str(e)}",
                        exc_info=True
                    )
                    # Continue processing other shipments
                    continue
            
            # Commit batch changes
            try:
                db.commit()
            except Exception as e:
                logger.error(f"Error committing batch {batch_num}: {str(e)}", exc_info=True)
                db.rollback()
        
        # Calculate execution time
        execution_time = time() - start_time
        
        # Record metrics
        alert_evaluation_duration_seconds.observe(execution_time)
        
        # Log summary
        summary = {
            "status": "completed",
            "total_shipments": total_shipments,
            "processed": processed_count,
            "errors": error_count,
            "alerts_created": total_alerts_created,
            "execution_time_seconds": round(execution_time, 2),
            "date_range": {
                "start": str(start_date),
                "end": str(end_date)
            }
        }
        
        logger.info(
            f"Alert evaluation task completed: "
            f"processed {processed_count}/{total_shipments} shipments, "
            f"created {total_alerts_created} alerts, "
            f"errors: {error_count}, "
            f"execution time: {execution_time:.2f}s"
        )
        
        # Check performance requirement: 1000 shipments within 5 minutes (300 seconds)
        if total_shipments >= 1000 and execution_time > 300:
            logger.warning(
                f"Performance requirement not met: "
                f"processed {total_shipments} shipments in {execution_time:.2f}s "
                f"(requirement: 5 minutes for 1000 shipments)"
            )
        
        return summary
    
    except Exception as e:
        logger.error(f"Fatal error in alert evaluation task: {str(e)}", exc_info=True)
        db.rollback()
        
        execution_time = time() - start_time
        
        return {
            "status": "failed",
            "error": str(e),
            "execution_time_seconds": round(execution_time, 2)
        }
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.alert_tasks.evaluate_single_shipment_alerts", bind=True)
def evaluate_single_shipment_alerts(self, shipment_id: int):
    """
    Evaluate alerts for a single shipment (triggered by ETA updates).
    
    Args:
        shipment_id: ID of shipment to evaluate
        
    Returns:
        Dictionary with evaluation result
    """
    logger.info(f"Evaluating alerts for shipment {shipment_id}")
    
    db = SessionLocal()
    
    try:
        # Initialize repositories and services
        shipment_repo = ShipmentRepository(db)
        workflow_service = WorkflowService(db)
        alert_service = AlertService(db, workflow_service=workflow_service)
        
        # Get shipment
        shipment = shipment_repo.get_by_id(shipment_id)
        if not shipment:
            logger.warning(f"Shipment {shipment_id} not found")
            return {
                "status": "not_found",
                "shipment_id": shipment_id
            }
        
        # Evaluate alerts
        alerts = alert_service.evaluate_shipment_alerts(shipment)
        
        # Commit changes
        db.commit()
        
        logger.info(
            f"Created {len(alerts)} alert(s) for shipment {shipment.shipment_number}"
        )
        
        return {
            "status": "completed",
            "shipment_id": shipment_id,
            "alerts_created": len(alerts)
        }
    
    except Exception as e:
        logger.error(
            f"Error evaluating alerts for shipment {shipment_id}: {str(e)}",
            exc_info=True
        )
        db.rollback()
        
        return {
            "status": "failed",
            "shipment_id": shipment_id,
            "error": str(e)
        }
    
    finally:
        db.close()
