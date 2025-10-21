"""Celery tasks for email notification processing."""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Optional

from app.celery_app import celery_app
from app.config import settings
from app.database import SessionLocal
from app.repositories.alert_repository import AlertRepository
from app.models.alert import Alert
from app.monitoring.prometheus_metrics import email_sent_total, email_retry_total

logger = logging.getLogger(__name__)


def send_email_smtp(
    to_email: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
) -> bool:
    """
    Send email via SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body_html: HTML email body
        body_text: Plain text email body (optional)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        
        # Add plain text part if provided
        if body_text:
            part1 = MIMEText(body_text, "plain")
            msg.attach(part1)
        
        # Add HTML part
        part2 = MIMEText(body_html, "html")
        msg.attach(part2)
        
        # Connect to SMTP server and send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}", exc_info=True)
        return False


def generate_alert_email_html(alert: Alert) -> str:
    """
    Generate HTML email body for an alert.
    
    Args:
        alert: Alert to generate email for
        
    Returns:
        HTML email body
    """
    severity_colors = {
        "warning": "#FFA500",
        "critical": "#FF4500",
        "urgent": "#DC143C"
    }
    
    color = severity_colors.get(alert.severity.value, "#000000")
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: {color}; color: white; padding: 20px; text-align: center; }}
            .content {{ background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
            .detail {{ margin: 10px 0; }}
            .label {{ font-weight: bold; }}
            .footer {{ margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{alert.severity.value.upper()} ALERT</h1>
            </div>
            <div class="content">
                <p>{alert.message}</p>
                
                <div class="detail">
                    <span class="label">Shipment Number:</span> {alert.shipment.shipment_number}
                </div>
                
                <div class="detail">
                    <span class="label">Step Name:</span> {alert.workflow_step.step_name}
                </div>
                
                <div class="detail">
                    <span class="label">Target Date:</span> {alert.workflow_step.target_date}
                </div>
                
                <div class="detail">
                    <span class="label">Days Post-ETA:</span> {alert.days_post_eta}
                </div>
                
                <div class="detail">
                    <span class="label">Severity:</span> {alert.severity.value.capitalize()}
                </div>
                
                <div class="detail">
                    <span class="label">Principal:</span> {alert.shipment.principal}
                </div>
                
                <div class="detail">
                    <span class="label">Brand:</span> {alert.shipment.brand}
                </div>
            </div>
            <div class="footer">
                <p>This is an automated notification from the Customs Clearance Automation System.</p>
                <p>Please log in to the system to acknowledge this alert and take necessary action.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


def generate_alert_email_text(alert: Alert) -> str:
    """
    Generate plain text email body for an alert.
    
    Args:
        alert: Alert to generate email for
        
    Returns:
        Plain text email body
    """
    text = f"""
{alert.severity.value.upper()} ALERT

{alert.message}

Shipment Details:
- Shipment Number: {alert.shipment.shipment_number}
- Step Name: {alert.workflow_step.step_name}
- Target Date: {alert.workflow_step.target_date}
- Days Post-ETA: {alert.days_post_eta}
- Severity: {alert.severity.value.capitalize()}
- Principal: {alert.shipment.principal}
- Brand: {alert.shipment.brand}

---
This is an automated notification from the Customs Clearance Automation System.
Please log in to the system to acknowledge this alert and take necessary action.
    """
    
    return text.strip()


@celery_app.task(
    name="app.tasks.email_tasks.send_alert_email",
    bind=True,
    max_retries=3,
    default_retry_delay=300  # 5 minutes
)
def send_alert_email(self, alert_id: int):
    """
    Send email notification for a specific alert.
    
    Retries up to 3 times with 5-minute intervals on failure.
    
    Args:
        alert_id: ID of alert to send email for
        
    Returns:
        Dictionary with send result
    """
    logger.info(f"Sending email for alert {alert_id}")
    
    db = SessionLocal()
    
    try:
        # Get alert with relationships
        alert_repo = AlertRepository(db)
        alert = alert_repo.get_by_id(alert_id)
        
        if not alert:
            logger.warning(f"Alert {alert_id} not found")
            return {
                "status": "not_found",
                "alert_id": alert_id
            }
        
        # Check if email already sent
        if alert.email_sent:
            logger.info(f"Email already sent for alert {alert_id}")
            return {
                "status": "already_sent",
                "alert_id": alert_id
            }
        
        # Get recipient email
        recipient_email = alert.recipient_user.email
        
        # Generate email content
        subject = f"{alert.severity.value.upper()}: Customs Clearance Alert - {alert.shipment.shipment_number}"
        body_html = generate_alert_email_html(alert)
        body_text = generate_alert_email_text(alert)
        
        # Send email
        success = send_email_smtp(
            to_email=recipient_email,
            subject=subject,
            body_html=body_html,
            body_text=body_text
        )
        
        if success:
            # Update alert email status
            alert.email_sent = True
            alert.email_sent_at = datetime.now(timezone.utc)
            alert_repo.update(alert)
            db.commit()
            
            # Record metrics
            email_sent_total.labels(status="success").inc()
            
            logger.info(f"Email sent successfully for alert {alert_id}")
            
            return {
                "status": "sent",
                "alert_id": alert_id,
                "recipient": recipient_email
            }
        else:
            # Increment retry count
            alert.email_retry_count += 1
            alert_repo.update(alert)
            db.commit()
            
            # Record retry metric
            email_retry_total.inc()
            
            # Retry if under max retries
            if alert.email_retry_count < 3:
                logger.warning(
                    f"Email send failed for alert {alert_id}, "
                    f"retry {alert.email_retry_count}/3"
                )
                raise self.retry(exc=Exception("Email send failed"))
            else:
                logger.error(
                    f"Email send failed for alert {alert_id} after 3 retries"
                )
                
                # Record failure metric
                email_sent_total.labels(status="failure").inc()
                
                return {
                    "status": "failed",
                    "alert_id": alert_id,
                    "retries": alert.email_retry_count
                }
    
    except Exception as e:
        logger.error(
            f"Error sending email for alert {alert_id}: {str(e)}",
            exc_info=True
        )
        db.rollback()
        
        # Retry on exception
        try:
            raise self.retry(exc=e)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for alert {alert_id}")
            return {
                "status": "failed",
                "alert_id": alert_id,
                "error": str(e)
            }
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.email_tasks.process_email_notifications_task", bind=True)
def process_email_notifications_task(self):
    """
    Scheduled task that runs every 5 minutes to process pending email notifications.
    
    Queries alerts with email_sent=False and sends emails for each.
    
    Returns:
        Dictionary with task execution summary
    """
    logger.info("Starting email notification processing task")
    
    db = SessionLocal()
    
    try:
        # Get pending email notifications
        alert_repo = AlertRepository(db)
        pending_alerts = alert_repo.get_pending_notifications()
        
        total_pending = len(pending_alerts)
        logger.info(f"Found {total_pending} pending email notifications")
        
        if total_pending == 0:
            return {
                "status": "completed",
                "total_pending": 0,
                "emails_queued": 0
            }
        
        # Queue email tasks for each pending alert
        emails_queued = 0
        
        for alert in pending_alerts:
            try:
                # Queue email task
                send_alert_email.delay(alert.id)
                emails_queued += 1
                
                logger.info(f"Queued email task for alert {alert.id}")
            
            except Exception as e:
                logger.error(
                    f"Error queuing email for alert {alert.id}: {str(e)}",
                    exc_info=True
                )
                continue
        
        logger.info(
            f"Email notification processing completed: "
            f"queued {emails_queued}/{total_pending} emails"
        )
        
        return {
            "status": "completed",
            "total_pending": total_pending,
            "emails_queued": emails_queued
        }
    
    except Exception as e:
        logger.error(
            f"Fatal error in email notification processing task: {str(e)}",
            exc_info=True
        )
        
        return {
            "status": "failed",
            "error": str(e)
        }
    
    finally:
        db.close()
