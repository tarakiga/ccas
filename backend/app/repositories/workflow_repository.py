"""Workflow step repository for data access operations."""

from datetime import date
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.models.workflow_step import WorkflowStep, StepStatus


class WorkflowRepository:
    """Repository for workflow step data access operations."""
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def create_bulk(self, steps: List[WorkflowStep]) -> List[WorkflowStep]:
        """
        Create multiple workflow steps efficiently in a single transaction.
        
        Args:
            steps: List of WorkflowStep model instances to create
            
        Returns:
            List of created workflow steps with assigned IDs
        """
        self.db.add_all(steps)
        self.db.commit()
        
        # Refresh all steps to get assigned IDs
        for step in steps:
            self.db.refresh(step)
        
        return steps
    
    def update(self, step: WorkflowStep) -> WorkflowStep:
        """
        Update a single workflow step.
        
        Args:
            step: WorkflowStep model instance to update
            
        Returns:
            Updated workflow step
        """
        self.db.commit()
        self.db.refresh(step)
        return step
    
    def get_by_id(self, step_id: int) -> Optional[WorkflowStep]:
        """
        Get workflow step by ID with relationships loaded.
        
        Args:
            step_id: Workflow step ID
            
        Returns:
            WorkflowStep if found, None otherwise
        """
        return (
            self.db.query(WorkflowStep)
            .options(
                joinedload(WorkflowStep.shipment),
                joinedload(WorkflowStep.ppr_user),
                joinedload(WorkflowStep.apr_user)
            )
            .filter(WorkflowStep.id == step_id)
            .first()
        )
    
    def get_by_shipment_id(self, shipment_id: int) -> List[WorkflowStep]:
        """
        Get all workflow steps for a shipment with user assignments loaded.
        
        Args:
            shipment_id: Shipment ID
            
        Returns:
            List of workflow steps ordered by step number
        """
        return (
            self.db.query(WorkflowStep)
            .options(
                joinedload(WorkflowStep.ppr_user),
                joinedload(WorkflowStep.apr_user)
            )
            .filter(WorkflowStep.shipment_id == shipment_id)
            .order_by(WorkflowStep.step_number)
            .all()
        )
    
    def get_by_user_assignment(
        self,
        user_id: int,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[WorkflowStep]:
        """
        Get workflow steps assigned to a user (as PPR or APR).
        
        Args:
            user_id: User ID
            filters: Optional dictionary of filter criteria
                - status: StepStatus enum value
                - department: Department name
                - is_critical: Boolean for critical steps only
                
        Returns:
            List of workflow steps assigned to the user
        """
        query = self.db.query(WorkflowStep).options(
            joinedload(WorkflowStep.shipment),
            joinedload(WorkflowStep.ppr_user),
            joinedload(WorkflowStep.apr_user)
        )
        
        # Filter by user assignment (PPR or APR)
        query = query.filter(
            or_(
                WorkflowStep.ppr_user_id == user_id,
                WorkflowStep.apr_user_id == user_id
            )
        )
        
        # Apply additional filters if provided
        if filters:
            if "status" in filters and filters["status"]:
                query = query.filter(WorkflowStep.status == filters["status"])
            
            if "department" in filters and filters["department"]:
                query = query.filter(WorkflowStep.department == filters["department"])
            
            if "is_critical" in filters and filters["is_critical"] is not None:
                query = query.filter(WorkflowStep.is_critical == filters["is_critical"])
        
        return query.order_by(WorkflowStep.target_date, WorkflowStep.step_number).all()
    
    def update_target_dates_bulk(self, shipment_id: int, new_eta: date) -> None:
        """
        Update target dates for all workflow steps based on new ETA.
        
        Uses bulk update for better performance instead of updating each row individually.
        
        Args:
            shipment_id: Shipment ID
            new_eta: New ETA date to calculate target dates from
        """
        from datetime import timedelta
        from sqlalchemy import case, func
        
        # Get all steps for this shipment
        steps = self.db.query(WorkflowStep).filter(
            WorkflowStep.shipment_id == shipment_id
        ).all()
        
        # Build case statement for bulk update
        # This is more efficient than updating each row individually
        for step in steps:
            step.target_date = new_eta + timedelta(days=step.offset_days)
        
        # Commit all changes at once
        self.db.commit()
