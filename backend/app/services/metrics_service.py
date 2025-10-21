"""Metrics service for calculating clearance performance metrics."""

from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.shipment import Shipment, ShipmentStatus
from app.models.workflow_step import WorkflowStep, StepStatus
from app.schemas.metrics import (
    DateRange,
    ClearanceTimeMetrics,
    DepartmentClearanceTime,
    OnTimeRateMetrics,
    DemurrageSavings,
    DelayedStepsMetrics,
    DelayedStepInfo
)


class MetricsService:
    """Service for calculating clearance performance metrics."""
    
    # Demurrage cost per day in OMR (converted from $100 at ~0.385 OMR/USD)
    DEMURRAGE_RATE_PER_DAY_OMR = Decimal("38.462")
    
    # Target clearance time in days
    TARGET_CLEARANCE_DAYS = 7
    
    def __init__(self, db: Session):
        """
        Initialize service with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def get_average_clearance_time(
        self,
        date_range: DateRange,
        department: Optional[str] = None
    ) -> ClearanceTimeMetrics:
        """
        Calculate average days from ETA to final step completion, grouped by department.
        
        This method calculates the clearance time as the difference between ETA and the
        actual completion date of the last workflow step for each shipment.
        
        Args:
            date_range: Date range for metrics calculation
            department: Optional department filter
            
        Returns:
            ClearanceTimeMetrics with overall and per-department averages
        """
        # Query completed shipments within date range
        shipments_query = (
            self.db.query(Shipment)
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.COMPLETED,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= date_range.start_date,
                    Shipment.eta <= date_range.end_date
                )
            )
        )
        
        shipments = shipments_query.all()
        
        if not shipments:
            return ClearanceTimeMetrics(
                overall_average_days=0.0,
                total_shipments=0,
                by_department=[],
                date_range=date_range
            )
        
        # Calculate clearance time for each shipment by department
        department_data: Dict[str, List[float]] = {}
        
        for shipment in shipments:
            # Get all completed workflow steps for this shipment
            completed_steps = [
                step for step in shipment.workflow_steps
                if step.actual_date is not None
            ]
            
            if not completed_steps:
                continue
            
            # Find the last completed step (by actual_date)
            last_step = max(completed_steps, key=lambda s: s.actual_date)
            
            # Calculate clearance time in days
            clearance_days = (last_step.actual_date - shipment.eta).days
            
            # Group by department (use the department of the last step)
            dept = last_step.department
            
            # Apply department filter if specified
            if department and dept != department:
                continue
            
            if dept not in department_data:
                department_data[dept] = []
            
            department_data[dept].append(float(clearance_days))
        
        # Calculate per-department averages
        by_department = []
        total_days = 0.0
        total_count = 0
        
        for dept, days_list in department_data.items():
            if days_list:
                avg_days = sum(days_list) / len(days_list)
                by_department.append(
                    DepartmentClearanceTime(
                        department=dept,
                        average_days=round(avg_days, 2),
                        shipment_count=len(days_list)
                    )
                )
                total_days += sum(days_list)
                total_count += len(days_list)
        
        # Sort by department name
        by_department.sort(key=lambda x: x.department)
        
        # Calculate overall average
        overall_average = round(total_days / total_count, 2) if total_count > 0 else 0.0
        
        return ClearanceTimeMetrics(
            overall_average_days=overall_average,
            total_shipments=total_count,
            by_department=by_department,
            date_range=date_range
        )
    
    def get_on_time_rate(self, date_range: DateRange) -> OnTimeRateMetrics:
        """
        Calculate percentage of shipments with all critical steps completed by Day 7.
        
        A shipment is considered "on-time" if all its critical workflow steps are
        completed within 7 days of the ETA.
        
        Args:
            date_range: Date range for metrics calculation
            
        Returns:
            OnTimeRateMetrics with on-time percentage and counts
        """
        # Query completed shipments within date range
        shipments = (
            self.db.query(Shipment)
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.COMPLETED,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= date_range.start_date,
                    Shipment.eta <= date_range.end_date
                )
            )
            .all()
        )
        
        if not shipments:
            return OnTimeRateMetrics(
                on_time_count=0,
                total_count=0,
                on_time_percentage=0.0,
                late_count=0,
                date_range=date_range
            )
        
        on_time_count = 0
        late_count = 0
        
        for shipment in shipments:
            # Get all critical steps for this shipment
            critical_steps = [
                step for step in shipment.workflow_steps
                if step.is_critical
            ]
            
            if not critical_steps:
                # If no critical steps, consider it on-time
                on_time_count += 1
                continue
            
            # Check if all critical steps are completed within 7 days of ETA
            day_7_deadline = shipment.eta + timedelta(days=self.TARGET_CLEARANCE_DAYS)
            
            all_on_time = True
            for step in critical_steps:
                if step.actual_date is None or step.actual_date > day_7_deadline:
                    all_on_time = False
                    break
            
            if all_on_time:
                on_time_count += 1
            else:
                late_count += 1
        
        total_count = len(shipments)
        on_time_percentage = round((on_time_count / total_count * 100), 2) if total_count > 0 else 0.0
        
        return OnTimeRateMetrics(
            on_time_count=on_time_count,
            total_count=total_count,
            on_time_percentage=on_time_percentage,
            late_count=late_count,
            date_range=date_range
        )
    
    def calculate_demurrage_savings(self, date_range: DateRange) -> DemurrageSavings:
        """
        Estimate cost avoidance based on on-time clearances.
        
        Assumes demurrage costs start on Day 8 after ETA. For each shipment cleared
        on-time (within 7 days), we estimate savings based on how many days before
        Day 8 it was cleared.
        
        Args:
            date_range: Date range for metrics calculation
            
        Returns:
            DemurrageSavings with estimated cost avoidance
        """
        # Get on-time rate metrics first
        on_time_metrics = self.get_on_time_rate(date_range)
        
        if on_time_metrics.on_time_count == 0:
            return DemurrageSavings(
                on_time_clearances=0,
                estimated_savings_omr=Decimal("0.00"),
                demurrage_rate_per_day=self.DEMURRAGE_RATE_PER_DAY_OMR,
                average_days_saved=0.0,
                date_range=date_range
            )
        
        # Query completed shipments within date range
        shipments = (
            self.db.query(Shipment)
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.COMPLETED,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= date_range.start_date,
                    Shipment.eta <= date_range.end_date
                )
            )
            .all()
        )
        
        total_days_saved = 0
        on_time_count = 0
        
        for shipment in shipments:
            # Get all critical steps
            critical_steps = [
                step for step in shipment.workflow_steps
                if step.is_critical and step.actual_date is not None
            ]
            
            if not critical_steps:
                continue
            
            # Find the last completed critical step
            last_critical_step = max(critical_steps, key=lambda s: s.actual_date)
            
            # Check if cleared on-time (within 7 days)
            day_7_deadline = shipment.eta + timedelta(days=self.TARGET_CLEARANCE_DAYS)
            
            if last_critical_step.actual_date <= day_7_deadline:
                # Calculate days saved (assuming demurrage starts on Day 8)
                # If cleared on Day 7, saved 1 day; if cleared on Day 6, saved 2 days, etc.
                day_8_start = shipment.eta + timedelta(days=8)
                days_saved = (day_8_start - last_critical_step.actual_date).days
                
                if days_saved > 0:
                    total_days_saved += days_saved
                    on_time_count += 1
        
        # Calculate average days saved and total savings
        average_days_saved = round(total_days_saved / on_time_count, 2) if on_time_count > 0 else 0.0
        estimated_savings = Decimal(str(total_days_saved)) * self.DEMURRAGE_RATE_PER_DAY_OMR
        
        return DemurrageSavings(
            on_time_clearances=on_time_count,
            estimated_savings_omr=estimated_savings.quantize(Decimal("0.001")),
            demurrage_rate_per_day=self.DEMURRAGE_RATE_PER_DAY_OMR,
            average_days_saved=average_days_saved,
            date_range=date_range
        )
    
    def get_delayed_steps_by_department(self, date_range: DateRange) -> DelayedStepsMetrics:
        """
        Return steps with actual_date > target_date grouped by department.
        
        This identifies workflow steps that were completed late (after their target date)
        and groups them by the responsible department.
        
        Args:
            date_range: Date range for metrics calculation
            
        Returns:
            DelayedStepsMetrics with delayed steps grouped by department
        """
        # Query workflow steps that are completed but delayed
        # (actual_date > target_date) within the date range
        delayed_steps = (
            self.db.query(WorkflowStep)
            .join(Shipment, WorkflowStep.shipment_id == Shipment.id)
            .filter(
                and_(
                    WorkflowStep.actual_date.isnot(None),
                    WorkflowStep.actual_date > WorkflowStep.target_date,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= date_range.start_date,
                    Shipment.eta <= date_range.end_date
                )
            )
            .all()
        )
        
        # Group by department
        by_department: Dict[str, List[DelayedStepInfo]] = {}
        
        for step in delayed_steps:
            dept = step.department
            
            if dept not in by_department:
                by_department[dept] = []
            
            # Calculate days delayed
            days_delayed = (step.actual_date - step.target_date).days
            
            by_department[dept].append(
                DelayedStepInfo(
                    step_id=step.id,
                    step_name=step.step_name,
                    shipment_number=step.shipment.shipment_number,
                    target_date=step.target_date,
                    actual_date=step.actual_date,
                    days_delayed=days_delayed
                )
            )
        
        # Sort each department's list by days_delayed (descending)
        for dept in by_department:
            by_department[dept].sort(key=lambda x: x.days_delayed, reverse=True)
        
        return DelayedStepsMetrics(
            total_delayed_steps=len(delayed_steps),
            by_department=by_department,
            date_range=date_range
        )
    
    def get_completion_metrics(
        self,
        start_date: date,
        end_date: date
    ) -> Dict:
        """
        Get comprehensive completion metrics for shipments.
        
        Args:
            start_date: Start date for metrics
            end_date: End date for metrics
            
        Returns:
            Dictionary with completion metrics including on-time rate and average delay
        """
        date_range = DateRange(start_date=start_date, end_date=end_date)
        
        # Get on-time rate
        on_time_metrics = self.get_on_time_rate(date_range)
        
        # Get clearance time metrics
        clearance_metrics = self.get_average_clearance_time(date_range)
        
        # Calculate average delay for late shipments
        shipments = (
            self.db.query(Shipment)
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.COMPLETED,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= start_date,
                    Shipment.eta <= end_date
                )
            )
            .all()
        )
        
        total_delay_days = 0
        late_shipment_count = 0
        
        for shipment in shipments:
            # Get all critical steps
            critical_steps = [
                step for step in shipment.workflow_steps
                if step.is_critical and step.actual_date is not None
            ]
            
            if not critical_steps:
                continue
            
            # Find the last completed critical step
            last_critical_step = max(critical_steps, key=lambda s: s.actual_date)
            
            # Check if cleared late (after Day 7)
            day_7_deadline = shipment.eta + timedelta(days=self.TARGET_CLEARANCE_DAYS)
            
            if last_critical_step.actual_date > day_7_deadline:
                delay_days = (last_critical_step.actual_date - day_7_deadline).days
                total_delay_days += delay_days
                late_shipment_count += 1
        
        average_delay = round(total_delay_days / late_shipment_count, 2) if late_shipment_count > 0 else 0.0
        
        return {
            "on_time_completion_rate": on_time_metrics.on_time_percentage,
            "on_time_count": on_time_metrics.on_time_count,
            "late_count": on_time_metrics.late_count,
            "total_count": on_time_metrics.total_count,
            "average_clearance_days": clearance_metrics.overall_average_days,
            "average_delay_days": average_delay,
            "late_shipment_count": late_shipment_count,
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        }
    
    def get_department_metrics(
        self,
        start_date: date,
        end_date: date
    ) -> List[Dict]:
        """
        Get performance metrics grouped by department.
        
        Args:
            start_date: Start date for metrics
            end_date: End date for metrics
            
        Returns:
            List of department metrics dictionaries
        """
        date_range = DateRange(start_date=start_date, end_date=end_date)
        
        # Get clearance time by department
        clearance_metrics = self.get_average_clearance_time(date_range)
        
        # Get delayed steps by department
        delayed_metrics = self.get_delayed_steps_by_department(date_range)
        
        # Combine metrics by department
        department_metrics = []
        
        # Create a set of all departments
        all_departments = set()
        for dept_clearance in clearance_metrics.by_department:
            all_departments.add(dept_clearance.department)
        for dept in delayed_metrics.by_department.keys():
            all_departments.add(dept)
        
        for department in sorted(all_departments):
            # Find clearance metrics for this department
            dept_clearance = next(
                (d for d in clearance_metrics.by_department if d.department == department),
                None
            )
            
            # Find delayed steps for this department
            delayed_steps = delayed_metrics.by_department.get(department, [])
            
            department_metrics.append({
                "department": department,
                "average_clearance_days": dept_clearance.average_days if dept_clearance else 0.0,
                "shipment_count": dept_clearance.shipment_count if dept_clearance else 0,
                "delayed_steps_count": len(delayed_steps),
                "average_delay_days": round(
                    sum(s.days_delayed for s in delayed_steps) / len(delayed_steps), 2
                ) if delayed_steps else 0.0
            })
        
        return department_metrics
    
    def get_shipment_metrics(
        self,
        start_date: date,
        end_date: date
    ) -> Dict:
        """
        Get shipment count and status metrics.
        
        Args:
            start_date: Start date for metrics
            end_date: End date for metrics
            
        Returns:
            Dictionary with shipment count metrics
        """
        # Query all shipments within date range
        total_shipments = (
            self.db.query(func.count(Shipment.id))
            .filter(
                and_(
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= start_date,
                    Shipment.eta <= end_date
                )
            )
            .scalar()
        )
        
        # Count by status
        completed_shipments = (
            self.db.query(func.count(Shipment.id))
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.COMPLETED,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= start_date,
                    Shipment.eta <= end_date
                )
            )
            .scalar()
        )
        
        active_shipments = (
            self.db.query(func.count(Shipment.id))
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.ACTIVE,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= start_date,
                    Shipment.eta <= end_date
                )
            )
            .scalar()
        )
        
        cancelled_shipments = (
            self.db.query(func.count(Shipment.id))
            .filter(
                and_(
                    Shipment.status == ShipmentStatus.CANCELLED,
                    Shipment.deleted_at.is_(None),
                    Shipment.eta >= start_date,
                    Shipment.eta <= end_date
                )
            )
            .scalar()
        )
        
        return {
            "total_shipments": total_shipments or 0,
            "completed_shipments": completed_shipments or 0,
            "active_shipments": active_shipments or 0,
            "cancelled_shipments": cancelled_shipments or 0,
            "completion_rate": round(
                (completed_shipments / total_shipments * 100), 2
            ) if total_shipments > 0 else 0.0,
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        }
