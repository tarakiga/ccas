"""Brand repository for database operations."""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from app.models.brand import Brand


class BrandRepository:
    """Repository for brand database operations."""
    
    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = False) -> List[Brand]:
        """
        Get all brands with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            active_only: If True, only return active brands
            
        Returns:
            List of Brand objects
        """
        query = self.db.query(Brand)
        
        if active_only:
            query = query.filter(Brand.active == True)
        
        return query.offset(skip).limit(limit).all()
    
    def get_by_id(self, brand_id: str) -> Optional[Brand]:
        """
        Get brand by ID.
        
        Args:
            brand_id: Brand ID
            
        Returns:
            Brand object or None if not found
        """
        return self.db.query(Brand).filter(Brand.id == brand_id).first()
    
    def get_by_name(self, name: str) -> Optional[Brand]:
        """
        Get brand by name.
        
        Args:
            name: Brand name
            
        Returns:
            Brand object or None if not found
        """
        return self.db.query(Brand).filter(Brand.name == name).first()
    
    def create(self, name: str, category: str = "Automotive", active: bool = True) -> Brand:
        """
        Create a new brand.
        
        Args:
            name: Brand name
            category: Brand category
            active: Whether the brand is active
            
        Returns:
            Created Brand object
        """
        brand = Brand(
            id=str(uuid.uuid4()),
            name=name,
            category=category,
            active=active
        )
        self.db.add(brand)
        self.db.commit()
        self.db.refresh(brand)
        return brand
    
    def update(self, brand_id: str, **kwargs) -> Optional[Brand]:
        """
        Update a brand.
        
        Args:
            brand_id: Brand ID
            **kwargs: Fields to update
            
        Returns:
            Updated Brand object or None if not found
        """
        brand = self.get_by_id(brand_id)
        if not brand:
            return None
        
        for key, value in kwargs.items():
            if value is not None and hasattr(brand, key):
                setattr(brand, key, value)
        
        self.db.commit()
        self.db.refresh(brand)
        return brand
    
    def delete(self, brand_id: str) -> bool:
        """
        Delete a brand.
        
        Args:
            brand_id: Brand ID
            
        Returns:
            True if deleted, False if not found
        """
        brand = self.get_by_id(brand_id)
        if not brand:
            return False
        
        self.db.delete(brand)
        self.db.commit()
        return True
    
    def count(self, active_only: bool = False) -> int:
        """
        Count total brands.
        
        Args:
            active_only: If True, only count active brands
            
        Returns:
            Total number of brands
        """
        query = self.db.query(func.count(Brand.id))
        
        if active_only:
            query = query.filter(Brand.active == True)
        
        return query.scalar()
    
    def search(self, query: str, skip: int = 0, limit: int = 100) -> List[Brand]:
        """
        Search brands by name or category.
        
        Args:
            query: Search query
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of matching Brand objects
        """
        search_pattern = f"%{query}%"
        return (
            self.db.query(Brand)
            .filter(
                (Brand.name.ilike(search_pattern)) |
                (Brand.category.ilike(search_pattern))
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
