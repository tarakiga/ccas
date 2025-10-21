"""Pydantic schemas for shipment request/response validation."""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from enum import Enum


class ShipmentStatus(str, Enum):
    """Shipment status enumeration."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ShipmentCreate(BaseModel):
    """
    Schema for creating a new shipment.
    
    All fields are required. Financial fields (customs duty, VAT, insurance) are
    automatically calculated based on the invoice amount.
    """
    
    shipment_number: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique shipment identifier (e.g., SHP-2024-001). Must be unique across all shipments.",
        examples=["SHP-2024-001", "SHIP-2024-12345"]
    )
    principal: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Principal company name responsible for the shipment",
        examples=["Al Hashar Group", "Toyota Motor Corporation"]
    )
    brand: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Brand or product line name",
        examples=["Toyota", "Lexus", "Honda"]
    )
    lc_number: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Letter of Credit number for the shipment",
        examples=["LC-2024-12345", "LC/2024/001"]
    )
    invoice_amount_omr: Decimal = Field(
        ...,
        gt=0,
        description="Invoice amount in Omani Rials (OMR). Must be greater than zero. Used to calculate customs duty (5%), VAT (5%), and insurance (1%).",
        examples=["50000.000", "125000.500"]
    )
    eta: date = Field(
        ...,
        description="Estimated Time of Arrival at port. This is the anchor date for all workflow step target date calculations. Format: YYYY-MM-DD",
        examples=["2024-12-01", "2024-11-15"]
    )
    
    @field_validator("invoice_amount_omr")
    @classmethod
    def validate_positive_amount(cls, v: Decimal) -> Decimal:
        """Validate that invoice amount is positive."""
        if v <= 0:
            raise ValueError("Invoice amount must be greater than zero")
        return v
    
    @field_validator("eta")
    @classmethod
    def validate_eta_date(cls, v: date) -> date:
        """Validate ETA is a valid date."""
        if not isinstance(v, date):
            raise ValueError("ETA must be a valid date")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "shipment_number": "SHP-2024-001",
                "principal": "Al Hashar Group",
                "brand": "Toyota",
                "lc_number": "LC-2024-12345",
                "invoice_amount_omr": "50000.000",
                "eta": "2024-12-01"
            }
        }
    )


class ShipmentUpdate(BaseModel):
    """Schema for updating an existing shipment."""
    
    principal: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, min_length=1, max_length=255)
    lc_number: Optional[str] = Field(None, min_length=1, max_length=100)
    invoice_amount_omr: Optional[Decimal] = Field(None, gt=0)
    status: Optional[ShipmentStatus] = None
    
    @field_validator("invoice_amount_omr")
    @classmethod
    def validate_positive_amount(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Validate that invoice amount is positive if provided."""
        if v is not None and v <= 0:
            raise ValueError("Invoice amount must be greater than zero")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "principal": "Al Hashar Group",
                "brand": "Toyota",
                "status": "active"
            }
        }
    )


class ShipmentResponse(BaseModel):
    """
    Schema for shipment response with computed financial fields.
    
    This schema includes all shipment data plus automatically calculated
    financial fields and metadata.
    """
    
    id: int = Field(..., description="Unique database identifier for the shipment")
    shipment_number: str = Field(..., description="Unique shipment identifier")
    principal: str = Field(..., description="Principal company name")
    brand: str = Field(..., description="Brand or product line name")
    lc_number: str = Field(..., description="Letter of Credit number")
    invoice_amount_omr: Decimal = Field(..., description="Invoice amount in Omani Rials (OMR)")
    customs_duty_omr: Decimal = Field(
        ...,
        description="Customs duty automatically computed as 5% of invoice amount"
    )
    vat_omr: Decimal = Field(
        ...,
        description="Value Added Tax (VAT) automatically computed as 5% of invoice amount"
    )
    insurance_omr: Decimal = Field(
        ...,
        description="Insurance cost automatically computed as 1% of invoice amount"
    )
    eta: date = Field(
        ...,
        description="Estimated Time of Arrival - anchor date for all workflow calculations"
    )
    eta_edit_count: int = Field(
        ...,
        description="Number of times ETA has been modified (max 3 edits allowed)",
        ge=0,
        le=3
    )
    status: ShipmentStatus = Field(
        ...,
        description="Current shipment status (active, completed, cancelled)"
    )
    created_by_id: int = Field(..., description="User ID of the person who created the shipment")
    created_at: datetime = Field(..., description="Timestamp when shipment was created (ISO 8601 format)")
    updated_at: datetime = Field(..., description="Timestamp when shipment was last updated (ISO 8601 format)")
    deleted_at: Optional[datetime] = Field(
        None,
        description="Timestamp when shipment was soft-deleted (null if not deleted)"
    )
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "shipment_number": "SHP-2024-001",
                "principal": "Al Hashar Group",
                "brand": "Toyota",
                "lc_number": "LC-2024-12345",
                "invoice_amount_omr": "50000.000",
                "customs_duty_omr": "2500.000",
                "vat_omr": "2500.000",
                "insurance_omr": "500.000",
                "eta": "2024-12-01",
                "eta_edit_count": 0,
                "status": "active",
                "created_by_id": 1,
                "created_at": "2024-10-21T10:00:00Z",
                "updated_at": "2024-10-21T10:00:00Z",
                "deleted_at": None
            }
        }
    )


class ShipmentFilters(BaseModel):
    """Schema for filtering shipments in list endpoint."""
    
    status: Optional[ShipmentStatus] = Field(None, description="Filter by shipment status")
    principal: Optional[str] = Field(None, description="Filter by principal name (partial match)")
    eta_start: Optional[date] = Field(None, description="Filter by ETA start date (inclusive)")
    eta_end: Optional[date] = Field(None, description="Filter by ETA end date (inclusive)")
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    size: int = Field(50, ge=1, le=100, description="Page size (max 100)")
    
    @field_validator("eta_end")
    @classmethod
    def validate_date_range(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that eta_end is after eta_start if both provided."""
        if v is not None and "eta_start" in info.data and info.data["eta_start"] is not None:
            if v < info.data["eta_start"]:
                raise ValueError("eta_end must be after or equal to eta_start")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "active",
                "principal": "Al Hashar",
                "eta_start": "2024-10-01",
                "eta_end": "2024-12-31",
                "page": 1,
                "size": 50
            }
        }
    )


class ShipmentImport(BaseModel):
    """Schema for bulk shipment import."""
    
    shipment_number: str = Field(..., min_length=1, max_length=100)
    principal: str = Field(..., min_length=1, max_length=255)
    brand: str = Field(..., min_length=1, max_length=255)
    lc_number: str = Field(..., min_length=1, max_length=100)
    invoice_amount_omr: Decimal = Field(..., gt=0)
    eta: date
    
    @field_validator("invoice_amount_omr")
    @classmethod
    def validate_positive_amount(cls, v: Decimal) -> Decimal:
        """Validate that invoice amount is positive."""
        if v <= 0:
            raise ValueError("Invoice amount must be greater than zero")
        return v
    
    @field_validator("eta")
    @classmethod
    def validate_eta_date(cls, v: date) -> date:
        """Validate ETA is a valid date."""
        if not isinstance(v, date):
            raise ValueError("ETA must be a valid date")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "shipment_number": "SHP-2024-001",
                "principal": "Al Hashar Group",
                "brand": "Toyota",
                "lc_number": "LC-2024-12345",
                "invoice_amount_omr": "50000.000",
                "eta": "2024-12-01"
            }
        }
    )


class ETAUpdate(BaseModel):
    """Schema for updating shipment ETA."""
    
    eta: date = Field(..., description="New Estimated Time of Arrival")
    
    @field_validator("eta")
    @classmethod
    def validate_eta_date(cls, v: date) -> date:
        """Validate ETA is a valid date."""
        if not isinstance(v, date):
            raise ValueError("ETA must be a valid date")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "eta": "2024-12-15"
            }
        }
    )
