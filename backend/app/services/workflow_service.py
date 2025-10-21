"""Workflow service for business logic operations."""

from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.workflow_step import WorkflowStep, StepStatus
from app.models.workflow_step_template import WorkflowStepTemplate
from app.models.shipment import Shipment
from app.models.user import User
from app.repositories.workflow_repository import WorkflowRepository
from app.repositories.workflow_step_template_repository import WorkflowStepTemplateRepository
from app.schemas.workflow_step import WorkflowStepComplete, StepFilters
from app.utils.constants import WORKFLOW_STEP_TEMPLATES, DEFAULT_USER_ASSIGNMENTS
from app.database import transaction_scope
from app.monitoring.prometheus_metrics import workflow_steps_completed_total


class WorkflowService:
    """Service for workflow step business logic operations."""
    
    def __init__(
        self,
        db: Session,
        audit_service: Optional[Any] = None,
        use_db_templates: bool = True
    ):
        """
        Initialize service with database session and dependencies.
        
        Args:
            db: SQLAlchemy database session
            audit_service: Optional audit service for logging changes
            use_db_templates: Whether to use database templates (True) or constants (False)
        """
        self.db = db
        self.workflow_repo = WorkflowRepository(db)
        self.template_repo = WorkflowStepTemplateRepository(db)
        self.audit_service = audit_service
        self.use_db_templates = use_db_templates
    
    def generate_workflow_steps(
        self,
        shipment: Shipment
    ) -> List[WorkflowStep]:
        """
        Generate 34 workflow steps with predefined configurations.
        
        Creates all workflow steps based on templates with:
        - Step numbers, names, departments
        - Offset days for target date calculation
        - Critical step flags
        - PPR/APR assignments
        
        Args:
            shipment: Shipment to generate workflow steps for
            
        Returns:
            List of created workflow steps
        """
        steps = []
        
        # Get templates from database or constants
        if self.use_db_templates:
            db_templates = self.template_repo.get_all_active()
            templates = self._convert_db_templates_to_dict(db_templates)
        else:
            templates = WORKFLOW_STEP_TEMPLATES
        
        # Get default user assignments (in production, fetch from database)
        # For now, we'll use placeholder user IDs
        # This should be replaced with actual user lookup by email
        user_assignments = self._get_user_assignments()
        
        for template in templates:
            # Calculate target date: ETA + offset_days
            target_date = shipment.eta + timedelta(days=template["offset_days"])
            
            # Get PPR and APR user IDs for this department
            department = template["department"]
            ppr_user_id = user_assignments.get(department, {}).get("ppr_user_id", 1)
            apr_user_id = user_assignments.get(department, {}).get("apr_user_id", None)
            
            # Create workflow step
            step = WorkflowStep(
                shipment_id=shipment.id,
                step_number=template["step_number"],
                step_name=template["step_name"],
                description=template.get("description", ""),
                department=department,
                target_date=target_date,
                offset_days=template["offset_days"],
                actual_date=None,
                status=StepStatus.PENDING,
                is_critical=template["is_critical"],
                ppr_user_id=ppr_user_id,
                apr_user_id=apr_user_id
            )
            
            steps.append(step)
        
        # Bulk create all steps
        created_steps = self.workflow_repo.create_bulk(steps)
        
        return created_steps
    
    def recalculate_target_dates(
        self,
        shipment: Shipment
    ) -> None:
        """
        Recalculate all workflow step target dates based on new ETA.
        
        Updates target_date for all steps using: new_eta + offset_days
        
        Args:
            shipment: Shipment with updated ETA
        """
        self.workflow_repo.update_target_dates_bulk(
            shipment_id=shipment.id,
            new_eta=shipment.eta
        )
    
    def complete_step(
        self,
        step_id: int,
        actual_date: date,
        user: User,
        ip_address: Optional[str] = None
    ) -> WorkflowStep:
        """
        Mark a workflow step as complete with validation.
        
        Validates:
        - User is PPR or APR for the step
        - Actual date is not in the future
        
        Args:
            step_id: ID of workflow step to complete
            actual_date: Date when step was actually completed
            user: User completing the step
            ip_address: Optional IP address for audit logging
            
        Returns:
            Updated workflow step
            
        Raises:
            ValueError: If step not found or validation fails
            PermissionError: If user is not authorized
        """
        # Get workflow step
        step = self.workflow_repo.get_by_id(step_id)
        if not step:
            raise ValueError(f"Workflow step with ID {step_id} not found")
        
        # Validate user is PPR or APR
        if user.id != step.ppr_user_id and user.id != step.apr_user_id:
            raise PermissionError(
                f"User {user.email} is not authorized to complete this step. "
                f"Only PPR or APR can complete this step."
            )
        
        # Validate actual_date is not in future (already validated by schema)
        # But double-check here for safety
        if actual_date > date.today():
            raise ValueError(f"Actual date cannot be in the future")
        
        # Store old values for audit logging
        old_actual_date = step.actual_date
        old_status = step.status
        
        # Update step
        step.actual_date = actual_date
        step.status = StepStatus.COMPLETED
        
        # Save changes
        step = self.workflow_repo.update(step)
        
        # Log changes in audit trail
        if self.audit_service:
            self.audit_service.log_change(
                entity_type="workflow_step",
                entity_id=step.id,
                field_name="actual_date",
                old_value=str(old_actual_date) if old_actual_date else None,
                new_value=str(actual_date),
                user=user,
                ip_address=ip_address
            )
            
            self.audit_service.log_change(
                entity_type="workflow_step",
                entity_id=step.id,
                field_name="status",
                old_value=old_status.value,
                new_value=step.status.value,
                user=user,
                ip_address=ip_address
            )
        
        # Record metrics
        workflow_steps_completed_total.labels(department=step.department).inc()
        
        return step
    
    def get_user_assigned_steps(
        self,
        user: User,
        filters: Optional[StepFilters] = None
    ) -> List[WorkflowStep]:
        """
        Get workflow steps assigned to user (as PPR or APR).
        
        Args:
            user: User to get assigned steps for
            filters: Optional filters for the steps
            
        Returns:
            List of workflow steps assigned to the user
        """
        # Build filter dictionary
        filter_dict = {}
        if filters:
            if filters.status:
                filter_dict["status"] = filters.status
            if filters.department:
                filter_dict["department"] = filters.department
            if filters.is_critical is not None:
                filter_dict["is_critical"] = filters.is_critical
        
        # Get steps from repository
        steps = self.workflow_repo.get_by_user_assignment(
            user_id=user.id,
            filters=filter_dict
        )
        
        return steps
    
    def get_critical_incomplete_steps(
        self,
        shipment: Shipment
    ) -> List[WorkflowStep]:
        """
        Get critical workflow steps that are incomplete for alert evaluation.
        
        Args:
            shipment: Shipment to check for incomplete critical steps
            
        Returns:
            List of incomplete critical workflow steps
        """
        # Get all workflow steps for the shipment
        steps = self.workflow_repo.get_by_shipment_id(shipment.id)
        
        # Filter for critical steps that are not completed
        critical_incomplete = [
            step for step in steps
            if step.is_critical and step.status != StepStatus.COMPLETED
        ]
        
        return critical_incomplete
    
    def get_shipment_workflow(
        self,
        shipment_id: int,
        user: User
    ) -> List[WorkflowStep]:
        """
        Get all workflow steps for a shipment.
        
        Args:
            shipment_id: ID of shipment to get workflow steps for
            user: User requesting the workflow steps
            
        Returns:
            List of workflow steps for the shipment
        """
        steps = self.workflow_repo.get_by_shipment_id(shipment_id)
        return steps
    
    def get_workflow_step(
        self,
        step_id: int,
        user: User
    ) -> Optional[WorkflowStep]:
        """
        Get a single workflow step by ID.
        
        Args:
            step_id: ID of workflow step to retrieve
            user: User requesting the workflow step
            
        Returns:
            Workflow step if found, None otherwise
        """
        step = self.workflow_repo.get_by_id(step_id)
        return step
    
    def _get_user_assignments(self) -> Dict[str, Dict[str, int]]:
        """
        Get user assignments for workflow steps.
        
        Queries the database for actual users based on department and role.
        Falls back to placeholder IDs if users not found.
        
        Returns:
            Dictionary mapping department to PPR/APR user IDs
        """
        assignments = {}
        
        for department, emails in DEFAULT_USER_ASSIGNMENTS.items():
            ppr_email = emails.get("ppr_email")
            apr_email = emails.get("apr_email")
            
            # Query for PPR user
            ppr_user = None
            if ppr_email:
                ppr_user = self.db.query(User).filter(User.email == ppr_email).first()
            
            # Query for APR user
            apr_user = None
            if apr_email:
                apr_user = self.db.query(User).filter(User.email == apr_email).first()
            
            assignments[department] = {
                "ppr_user_id": ppr_user.id if ppr_user else 1,
                "apr_user_id": apr_user.id if apr_user else None
            }
        
        return assignments
    
    def _convert_db_templates_to_dict(
        self,
        db_templates: List[WorkflowStepTemplate]
    ) -> List[Dict[str, Any]]:
        """
        Convert database template objects to dictionary format.
        
        Args:
            db_templates: List of WorkflowStepTemplate objects
            
        Returns:
            List of template dictionaries
        """
        return [
            {
                "step_number": template.step_number,
                "step_name": template.step_name,
                "description": template.description,
                "department": template.department,
                "offset_days": template.offset_days,
                "is_critical": template.is_critical
            }
            for template in db_templates
        ]
