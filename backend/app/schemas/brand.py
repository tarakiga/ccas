"""Brand schemas for API requests and responses."""

from datetime import datetime
from pydantic import BaseModel, Field


class BrandBase(BaseModel):
    """Base brand schema with common fields."""
    name: str = Field(..., min_length=1, max_length=100, description="Brand name")
    category: str = Field(default="Automotive", max_length=50, description="Brand category")
    active: bool = Field(default=True, description="Whether the brand is active")


class BrandCreate(BrandBase):
    """Schema for creating a new brand."""
    pass


class BrandUpdate(BaseModel):
    """Schema for updating an existing brand."""
    name: str | None = Field(None, min_length=1, max_length=100, description="Brand name")
    category: str | None = Field(None, max_length=50, description="Brand category")
    active: bool | None = Field(None, description="Whether the brand is active")


class Brand(BrandBase):
    """Schema for brand response."""
    id: str = Field(..., description="Brand ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    model_config = {"from_attributes": True}


class BrandList(BaseModel):
    """Schema for paginated brand list response."""
    items: list[Brand] = Field(..., description="List of brands")
    total: int = Field(..., description="Total number of brands")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    pages: int = Field(..., description="Total number of pages")
