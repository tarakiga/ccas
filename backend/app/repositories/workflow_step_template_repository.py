"""Repository for workflow step template data access."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.workflow_step_template import WorkflowStepTemplate


class WorkflowStepTemplateRepository:
    """Repository for workflow step template database operations."""
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def get_all_active(self) -> List[WorkflowStepTemplate]:
        """
        Get all active workflow step templates ordered by display_order.
        
        Returns:
            List of active workflow step templates
        """
        return (
            self.db.query(WorkflowStepTemplate)
            .filter(WorkflowStepTemplate.is_active == True)
            .order_by(WorkflowStepTemplate.display_order)
            .all()
        )
    
    def get_by_step_number(self, step_number: float) -> Optional[WorkflowStepTemplate]:
        """
        Get workflow step template by step number.
        
        Args:
            step_number: Step number to search for
            
        Returns:
            WorkflowStepTemplate if found, None otherwise
        """
        return (
            self.db.query(WorkflowStepTemplate)
            .filter(WorkflowStepTemplate.step_number == step_number)
            .first()
        )
    
    def get_by_department(self, department: str) -> List[WorkflowStepTemplate]:
        """
        Get all active workflow step templates for a specific department.
        
        Args:
            department: Department name to filter by
            
        Returns:
            List of workflow step templates for the department
        """
        return (
            self.db.query(WorkflowStepTemplate)
            .filter(
                WorkflowStepTemplate.department == department,
                WorkflowStepTemplate.is_active == True
            )
            .order_by(WorkflowStepTemplate.display_order)
            .all()
        )
    
    def get_critical_steps(self) -> List[WorkflowStepTemplate]:
        """
        Get all critical workflow step templates.
        
        Returns:
            List of critical workflow step templates
        """
        return (
            self.db.query(WorkflowStepTemplate)
            .filter(
                WorkflowStepTemplate.is_critical == True,
                WorkflowStepTemplate.is_active == True
            )
            .order_by(WorkflowStepTemplate.display_order)
            .all()
        )
    
    def create(self, template: WorkflowStepTemplate) -> WorkflowStepTemplate:
        """
        Create a new workflow step template.
        
        Args:
            template: WorkflowStepTemplate to create
            
        Returns:
            Created workflow step template
        """
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template
    
    def update(self, template: WorkflowStepTemplate) -> WorkflowStepTemplate:
        """
        Update an existing workflow step template.
        
        Args:
            template: WorkflowStepTemplate with updated values
            
        Returns:
            Updated workflow step template
        """
        self.db.commit()
        self.db.refresh(template)
        return template
