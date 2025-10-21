"""Pydantic schemas for metrics request/response validation."""

from datetime import date
from decimal import Decimal
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class DateRange(BaseModel):
    """
    Schema for date range query parameters in metrics endpoints.
    
    Used to specify the time period for metrics calculations.
    Maximum range is 1 year (365 days).
    """
    
    start_date: date = Field(
        ...,
        description="Start date for metrics calculation (inclusive). Format: YYYY-MM-DD",
        examples=["2024-01-01", "2024-10-01"]
    )
    end_date: date = Field(
        ...,
        description="End date for metrics calculation (inclusive). Must be after or equal to start_date. Maximum range: 365 days. Format: YYYY-MM-DD",
        examples=["2024-12-31", "2024-10-31"]
    )
    
    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v: date, info) -> date:
        """
        Validate that end_date is after start_date.
        
        Business rule: Date range must be valid (end >= start).
        """
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("end_date must be after or equal to start_date")
        return v
    
    @field_validator("end_date")
    @classmethod
    def validate_max_range(cls, v: date, info) -> date:
        """
        Validate that date range does not exceed 1 year.
        
        Business rule: Maximum date range is 365 days to ensure reasonable query performance.
        """
        if "start_date" in info.data:
            days_diff = (v - info.data["start_date"]).days
            if days_diff > 365:
                raise ValueError("Date range cannot exceed 1 year (365 days)")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "start_date": "2024-01-01",
                "end_date": "2024-12-31"
            }
        }
    )


class DepartmentClearanceTime(BaseModel):
    """Schema for department-specific clearance time data."""
    
    department: str = Field(..., description="Department name")
    average_days: float = Field(..., description="Average clearance time in days")
    shipment_count: int = Field(..., description="Number of shipments processed")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "department": "C&C",
                "average_days": 5.2,
                "shipment_count": 45
            }
        }
    )


class ClearanceTimeMetrics(BaseModel):
    """Schema for average clearance time response grouped by department."""
    
    overall_average_days: float = Field(..., description="Overall average clearance time across all departments")
    total_shipments: int = Field(..., description="Total number of shipments in the period")
    by_department: List[DepartmentClearanceTime] = Field(..., description="Clearance time breakdown by department")
    date_range: DateRange = Field(..., description="Date range for the metrics")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "overall_average_days": 5.8,
                "total_shipments": 120,
                "by_department": [
                    {
                        "department": "C&C",
                        "average_days": 5.2,
                        "shipment_count": 45
                    },
                    {
                        "department": "Finance",
                        "average_days": 6.1,
                        "shipment_count": 40
                    }
                ],
                "date_range": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31"
                }
            }
        }
    )


class OnTimeRateMetrics(BaseModel):
    """Schema for on-time clearance percentage (cleared within 7 days)."""
    
    on_time_count: int = Field(..., description="Number of shipments cleared within 7 days")
    total_count: int = Field(..., description="Total number of completed shipments")
    on_time_percentage: float = Field(..., ge=0, le=100, description="Percentage of on-time clearances")
    late_count: int = Field(..., description="Number of shipments cleared after 7 days")
    date_range: DateRange = Field(..., description="Date range for the metrics")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "on_time_count": 95,
                "total_count": 120,
                "on_time_percentage": 79.17,
                "late_count": 25,
                "date_range": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31"
                }
            }
        }
    )


class DemurrageSavings(BaseModel):
    """Schema for demurrage cost avoidance calculation."""
    
    on_time_clearances: int = Field(..., description="Number of shipments cleared on time")
    estimated_savings_omr: Decimal = Field(..., description="Estimated cost savings in OMR")
    demurrage_rate_per_day: Decimal = Field(..., description="Assumed demurrage cost per day in OMR")
    average_days_saved: float = Field(..., description="Average days saved per on-time clearance")
    date_range: DateRange = Field(..., description="Date range for the metrics")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "on_time_clearances": 95,
                "estimated_savings_omr": "38.462",
                "demurrage_rate_per_day": "38.462",
                "average_days_saved": 1.0,
                "date_range": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31"
                }
            }
        }
    )


class DelayedStepInfo(BaseModel):
    """Schema for individual delayed step information."""
    
    step_id: int
    step_name: str
    shipment_number: str
    target_date: date
    actual_date: date
    days_delayed: int = Field(..., description="Number of days the step was delayed")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "step_id": 5,
                "step_name": "Bayan approval",
                "shipment_number": "SHP-2024-001",
                "target_date": "2024-12-04",
                "actual_date": "2024-12-07",
                "days_delayed": 3
            }
        }
    )


class DelayedStepsMetrics(BaseModel):
    """Schema for delayed steps grouped by department."""
    
    total_delayed_steps: int = Field(..., description="Total number of delayed steps")
    by_department: Dict[str, List[DelayedStepInfo]] = Field(..., description="Delayed steps grouped by department")
    date_range: DateRange = Field(..., description="Date range for the metrics")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_delayed_steps": 15,
                "by_department": {
                    "C&C": [
                        {
                            "step_id": 5,
                            "step_name": "Bayan approval",
                            "shipment_number": "SHP-2024-001",
                            "target_date": "2024-12-04",
                            "actual_date": "2024-12-07",
                            "days_delayed": 3
                        }
                    ],
                    "Finance": [
                        {
                            "step_id": 8,
                            "step_name": "Payment processing",
                            "shipment_number": "SHP-2024-002",
                            "target_date": "2024-12-05",
                            "actual_date": "2024-12-08",
                            "days_delayed": 3
                        }
                    ]
                },
                "date_range": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31"
                }
            }
        }
    )
