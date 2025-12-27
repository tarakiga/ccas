"""Brand API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.brand import Brand, BrandCreate, BrandUpdate, BrandList
from app.repositories.brand_repository import BrandRepository
from app.auth.permissions import require_admin, require_write_access
from app.models.user import User

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("", response_model=List[Brand])
def get_brands(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    active_only: bool = Query(False, description="Only return active brands"),
    search: str | None = Query(None, description="Search query for name or category"),
    db: Session = Depends(get_db),
):
    """
    Get all brands with optional filtering and pagination.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **active_only**: If true, only return active brands
    - **search**: Search query to filter by name or category
    """
    repo = BrandRepository(db)
    
    if search:
        brands = repo.search(search, skip=skip, limit=limit)
    else:
        brands = repo.get_all(skip=skip, limit=limit, active_only=active_only)
    
    return brands


@router.get("/{brand_id}", response_model=Brand)
def get_brand(
    brand_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a specific brand by ID.
    
    - **brand_id**: Brand ID
    """
    repo = BrandRepository(db)
    brand = repo.get_by_id(brand_id)
    
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand with ID {brand_id} not found"
        )
    
    return brand


@router.post("", response_model=Brand, status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_data: BrandCreate,
    db: Session = Depends(get_db),
    # user: User = Depends(require_admin),  # Uncomment when auth is ready
):
    """
    Create a new brand.
    
    Requires admin permissions.
    
    - **name**: Brand name (required, must be unique)
    - **category**: Brand category (default: "Automotive")
    - **active**: Whether the brand is active (default: true)
    """
    repo = BrandRepository(db)
    
    # Check if brand with same name already exists
    existing_brand = repo.get_by_name(brand_data.name)
    if existing_brand:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Brand with name '{brand_data.name}' already exists"
        )
    
    brand = repo.create(
        name=brand_data.name,
        category=brand_data.category,
        active=brand_data.active
    )
    
    return brand


@router.put("/{brand_id}", response_model=Brand)
def update_brand(
    brand_id: str,
    brand_data: BrandUpdate,
    db: Session = Depends(get_db),
    # user: User = Depends(require_admin),  # Uncomment when auth is ready
):
    """
    Update an existing brand.
    
    Requires admin permissions.
    
    - **brand_id**: Brand ID
    - **name**: New brand name (optional)
    - **category**: New brand category (optional)
    - **active**: New active status (optional)
    """
    repo = BrandRepository(db)
    
    # Check if brand exists
    existing_brand = repo.get_by_id(brand_id)
    if not existing_brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand with ID {brand_id} not found"
        )
    
    # Check if new name conflicts with another brand
    if brand_data.name and brand_data.name != existing_brand.name:
        name_conflict = repo.get_by_name(brand_data.name)
        if name_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Brand with name '{brand_data.name}' already exists"
            )
    
    # Update brand
    updated_brand = repo.update(
        brand_id,
        name=brand_data.name,
        category=brand_data.category,
        active=brand_data.active
    )
    
    return updated_brand


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(
    brand_id: str,
    db: Session = Depends(get_db),
    # user: User = Depends(require_admin),  # Uncomment when auth is ready
):
    """
    Delete a brand.
    
    Requires admin permissions.
    
    - **brand_id**: Brand ID
    """
    repo = BrandRepository(db)
    
    success = repo.delete(brand_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand with ID {brand_id} not found"
        )
    
    return None
