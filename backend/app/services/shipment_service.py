"""Shipment service for business logic operations."""

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.shipment import Shipment, ShipmentStatus
from app.models.user import User
from app.repositories.shipment_repository import ShipmentRepository
from app.repositories.workflow_repository import WorkflowRepository
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentImport, ShipmentFilters
from app.schemas.common import Page
from app.exceptions import ConcurrentModificationError
from app.database import transaction_scope
from app.monitoring.prometheus_metrics import shipments_created_total


class ShipmentService:
    """Service for shipment business logic operations."""
    
    def __init__(
        self,
        db: Session,
        audit_service: Optional[Any] = None,
        workflow_service: Optional[Any] = None,
        alert_service: Optional[Any] = None
    ):
        """
        Initialize service with database session and dependencies.
        
        Args:
            db: SQLAlchemy database session
            audit_service: Optional audit service for logging changes
            workflow_service: Optional workflow service for step generation
            alert_service: Optional alert service for alert evaluation
        """
        self.db = db
        self.shipment_repo = ShipmentRepository(db)
        self.workflow_repo = WorkflowRepository(db)
        self.audit_service = audit_service
        self.workflow_service = workflow_service
        self.alert_service = alert_service
    
    def create_shipment(
        self,
        data: ShipmentCreate,
        user: User,
        ip_address: Optional[str] = None
    ) -> Shipment:
        """
        Create a new shipment with auto-calculated financial fields and workflow generation.
        
        Uses database transaction to ensure atomic creation of shipment and workflow steps.
        
        Args:
            data: Shipment creation data
            user: User creating the shipment
            ip_address: Optional IP address for audit logging
            
        Returns:
            Created shipment with workflow steps
            
        Raises:
            ValueError: If shipment_number already exists
        """
        try:
            # Use transaction scope for atomic multi-table operations
            with transaction_scope(self.db):
                # Create shipment model instance
                shipment = Shipment(
                    shipment_number=data.shipment_number,
                    principal=data.principal,
                    brand=data.brand,
                    lc_number=data.lc_number,
                    invoice_amount_omr=data.invoice_amount_omr,
                    eta=data.eta,
                    eta_edit_count=0,
                    status=ShipmentStatus.ACTIVE,
                    created_by_id=user.id
                )
                
                # Financial fields are auto-calculated via hybrid properties
                # customs_duty_omr = invoice_amount_omr * 0.05
                # vat_omr = invoice_amount_omr * 0.05
                # insurance_omr = invoice_amount_omr * 0.01
                
                # Save shipment to database (within transaction)
                self.db.add(shipment)
                self.db.flush()  # Flush to get shipment.id without committing
                
                # Generate workflow steps if workflow service is available
                if self.workflow_service:
                    self.workflow_service.generate_workflow_steps(shipment)
                
                # Log creation in audit trail
                if self.audit_service:
                    self.audit_service.log_change(
                        entity_type="shipment",
                        entity_id=shipment.id,
                        field_name="created",
                        old_value=None,
                        new_value=shipment.shipment_number,
                        user=user,
                        ip_address=ip_address
                    )
                
                # Transaction commits automatically on context exit
            
            # Refresh to get latest state after commit
            self.db.refresh(shipment)
            
            # Record metrics
            shipments_created_total.inc()
            
            return shipment
            
        except IntegrityError as e:
            raise ValueError(f"Shipment with number '{data.shipment_number}' already exists")
    
    def update_shipment(
        self,
        shipment_id: int,
        data: ShipmentUpdate,
        user: User,
        ip_address: Optional[str] = None
    ) -> Shipment:
        """
        Update an existing shipment with audit logging.
        
        Args:
            shipment_id: ID of shipment to update
            data: Shipment update data
            user: User updating the shipment
            ip_address: Optional IP address for audit logging
            
        Returns:
            Updated shipment
            
        Raises:
            ValueError: If shipment not found
        """
        # Get existing shipment
        shipment = self.shipment_repo.get_by_id(shipment_id)
        if not shipment:
            raise ValueError(f"Shipment with ID {shipment_id} not found")
        
        # Track changes for audit logging
        changes = {}
        
        # Update fields if provided
        if data.principal is not None and data.principal != shipment.principal:
            changes["principal"] = (shipment.principal, data.principal)
            shipment.principal = data.principal
        
        if data.brand is not None and data.brand != shipment.brand:
            changes["brand"] = (shipment.brand, data.brand)
            shipment.brand = data.brand
        
        if data.lc_number is not None and data.lc_number != shipment.lc_number:
            changes["lc_number"] = (shipment.lc_number, data.lc_number)
            shipment.lc_number = data.lc_number
        
        if data.invoice_amount_omr is not None and data.invoice_amount_omr != shipment.invoice_amount_omr:
            changes["invoice_amount_omr"] = (str(shipment.invoice_amount_omr), str(data.invoice_amount_omr))
            shipment.invoice_amount_omr = data.invoice_amount_omr
        
        if data.status is not None and data.status != shipment.status:
            changes["status"] = (shipment.status.value, data.status.value)
            shipment.status = data.status
        
        # Save changes
        shipment = self.shipment_repo.update(shipment)
        
        # Log all changes in audit trail
        if self.audit_service and changes:
            for field_name, (old_value, new_value) in changes.items():
                self.audit_service.log_change(
                    entity_type="shipment",
                    entity_id=shipment.id,
                    field_name=field_name,
                    old_value=old_value,
                    new_value=new_value,
                    user=user,
                    ip_address=ip_address
                )
        
        return shipment
    
    def update_eta(
        self,
        shipment_id: int,
        new_eta: date,
        user: User,
        ip_address: Optional[str] = None
    ) -> Shipment:
        """
        Update shipment ETA with validation, edit count tracking, and workflow recalculation.
        
        Uses database transaction to ensure atomic update of shipment and workflow steps.
        
        Args:
            shipment_id: ID of shipment to update
            new_eta: New ETA date
            user: User updating the ETA
            ip_address: Optional IP address for audit logging
            
        Returns:
            Updated shipment
            
        Raises:
            ValueError: If shipment not found or edit limit exceeded
        """
        # Get existing shipment
        shipment = self.shipment_repo.get_by_id(shipment_id)
        if not shipment:
            raise ValueError(f"Shipment with ID {shipment_id} not found")
        
        # Validate edit count limit (max 3 edits)
        if shipment.eta_edit_count >= 3:
            raise ValueError(
                f"ETA edit limit reached. Maximum 3 edits allowed. "
                f"Current count: {shipment.eta_edit_count}"
            )
        
        # Store old ETA for audit logging
        old_eta = shipment.eta
        
        # Use transaction scope for atomic multi-table operations
        with transaction_scope(self.db):
            # Update ETA and increment edit counter
            shipment.eta = new_eta
            shipment.eta_edit_count += 1
            
            # Save changes (within transaction)
            shipment = self.shipment_repo.update(shipment)
            
            # Recalculate workflow target dates (within same transaction)
            self.workflow_repo.update_target_dates_bulk(shipment_id, new_eta)
            
            # Log ETA change in audit trail
            if self.audit_service:
                self.audit_service.log_change(
                    entity_type="shipment",
                    entity_id=shipment.id,
                    field_name="eta",
                    old_value=str(old_eta),
                    new_value=str(new_eta),
                    user=user,
                    ip_address=ip_address
                )
                
                self.audit_service.log_change(
                    entity_type="shipment",
                    entity_id=shipment.id,
                    field_name="eta_edit_count",
                    old_value=str(shipment.eta_edit_count - 1),
                    new_value=str(shipment.eta_edit_count),
                    user=user,
                    ip_address=ip_address
                )
            
            # Transaction commits automatically on context exit
        
        # Trigger alert evaluation if alert service is available (after commit)
        if self.alert_service:
            self.alert_service.evaluate_shipment_alerts(shipment)
        
        return shipment
    
    def get_shipment(
        self,
        shipment_id: int,
        user: User
    ) -> Shipment:
        """
        Get shipment by ID with authorization check.
        
        Args:
            shipment_id: ID of shipment to retrieve
            user: User requesting the shipment
            
        Returns:
            Shipment if found and authorized
            
        Raises:
            ValueError: If shipment not found
        """
        shipment = self.shipment_repo.get_by_id(shipment_id)
        if not shipment:
            raise ValueError(f"Shipment with ID {shipment_id} not found")
        
        # Authorization check would be implemented here based on user role
        # For now, all authenticated users can view shipments
        
        return shipment
    
    def list_shipments(
        self,
        filters: ShipmentFilters,
        user: User,
        page: int = 1,
        size: int = 50
    ) -> Page:
        """
        List shipments with filters and pagination.
        
        Args:
            filters: Filter criteria
            user: User requesting the list
            page: Page number (1-indexed)
            size: Page size
            
        Returns:
            Paginated list of shipments
        """
        # Build filter dictionary
        filter_dict = {}
        if filters.status:
            filter_dict["status"] = filters.status
        if filters.principal:
            filter_dict["principal"] = filters.principal
        if filters.eta_start:
            filter_dict["eta_start"] = filters.eta_start
        if filters.eta_end:
            filter_dict["eta_end"] = filters.eta_end
        
        # Get shipments from repository
        shipments, total = self.shipment_repo.list(
            filters=filter_dict,
            page=page,
            size=size
        )
        
        # Calculate total pages
        pages = (total + size - 1) // size if total > 0 else 0
        
        # Return paginated response
        return Page(
            items=shipments,
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    
    def delete_shipment(
        self,
        shipment_id: int,
        user: User,
        ip_address: Optional[str] = None
    ) -> bool:
        """
        Soft delete a shipment by setting deleted_at timestamp.
        
        Args:
            shipment_id: ID of shipment to delete
            user: User deleting the shipment
            ip_address: Optional IP address for audit logging
            
        Returns:
            True if shipment was deleted, False if not found
        """
        # Get existing shipment
        shipment = self.shipment_repo.get_by_id(shipment_id)
        if not shipment:
            return False
        
        # Set deleted_at timestamp
        shipment.deleted_at = datetime.now(timezone.utc)
        shipment.status = ShipmentStatus.CANCELLED
        
        # Save changes
        self.shipment_repo.update(shipment)
        
        # Log deletion in audit trail
        if self.audit_service:
            self.audit_service.log_change(
                entity_type="shipment",
                entity_id=shipment.id,
                field_name="deleted_at",
                old_value=None,
                new_value=str(shipment.deleted_at),
                user=user,
                ip_address=ip_address
            )
        
        return True
    
    def import_shipments(
        self,
        data: List[ShipmentImport],
        user: User,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Bulk import shipments with validation and error collection.
        
        Args:
            data: List of shipment import data
            user: User performing the import
            ip_address: Optional IP address for audit logging
            
        Returns:
            Dictionary with import summary:
                - successful: Number of successfully imported shipments
                - failed: Number of failed imports
                - errors: List of error details
        """
        successful = 0
        failed = 0
        errors = []
        
        for idx, shipment_data in enumerate(data):
            try:
                # Create shipment using the standard create method
                create_data = ShipmentCreate(
                    shipment_number=shipment_data.shipment_number,
                    principal=shipment_data.principal,
                    brand=shipment_data.brand,
                    lc_number=shipment_data.lc_number,
                    invoice_amount_omr=shipment_data.invoice_amount_omr,
                    eta=shipment_data.eta
                )
                
                self.create_shipment(create_data, user, ip_address)
                successful += 1
                
            except Exception as e:
                failed += 1
                errors.append({
                    "row": idx + 1,
                    "shipment_number": shipment_data.shipment_number,
                    "error": str(e)
                })
        
        return {
            "successful": successful,
            "failed": failed,
            "total": len(data),
            "errors": errors
        }
