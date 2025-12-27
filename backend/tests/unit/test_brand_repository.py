"""Unit tests for brand repository."""

import pytest
from sqlalchemy.orm import Session

from app.repositories.brand_repository import BrandRepository
from app.models.brand import Brand


class TestBrandRepository:
    """Test brand repository operations."""

    def test_create_brand(self, db: Session):
        """Test creating a new brand."""
        repo = BrandRepository(db)
        brand = repo.create(name="Test Brand", category="Test Category", active=True)

        assert brand.id is not None
        assert brand.name == "Test Brand"
        assert brand.category == "Test Category"
        assert brand.active is True
        assert brand.created_at is not None

    def test_get_by_id(self, db: Session):
        """Test getting brand by ID."""
        repo = BrandRepository(db)
        brand = repo.create(name="Test Brand", category="Automotive")

        retrieved = repo.get_by_id(brand.id)
        assert retrieved is not None
        assert retrieved.id == brand.id
        assert retrieved.name == "Test Brand"

    def test_get_by_id_not_found(self, db: Session):
        """Test getting non-existent brand."""
        repo = BrandRepository(db)
        brand = repo.get_by_id("non-existent-id")
        assert brand is None

    def test_get_by_name(self, db: Session):
        """Test getting brand by name."""
        repo = BrandRepository(db)
        repo.create(name="Toyota", category="Automotive")

        brand = repo.get_by_name("Toyota")
        assert brand is not None
        assert brand.name == "Toyota"

    def test_get_by_name_not_found(self, db: Session):
        """Test getting non-existent brand by name."""
        repo = BrandRepository(db)
        brand = repo.get_by_name("NonExistent")
        assert brand is None

    def test_get_all(self, db: Session):
        """Test getting all brands."""
        repo = BrandRepository(db)
        repo.create(name="Brand 1", category="Automotive")
        repo.create(name="Brand 2", category="Electronics")
        repo.create(name="Brand 3", category="Automotive", active=False)

        brands = repo.get_all()
        assert len(brands) >= 3

    def test_get_all_active_only(self, db: Session):
        """Test getting only active brands."""
        repo = BrandRepository(db)
        repo.create(name="Active Brand", category="Automotive", active=True)
        repo.create(name="Inactive Brand", category="Automotive", active=False)

        active_brands = repo.get_all(active_only=True)
        assert all(brand.active for brand in active_brands)

    def test_get_all_with_pagination(self, db: Session):
        """Test pagination."""
        repo = BrandRepository(db)
        for i in range(5):
            repo.create(name=f"Brand {i}", category="Automotive")

        page1 = repo.get_all(skip=0, limit=2)
        page2 = repo.get_all(skip=2, limit=2)

        assert len(page1) == 2
        assert len(page2) == 2
        assert page1[0].id != page2[0].id

    def test_update_brand(self, db: Session):
        """Test updating a brand."""
        repo = BrandRepository(db)
        brand = repo.create(name="Original Name", category="Automotive")

        updated = repo.update(brand.id, name="Updated Name", category="Electronics")
        assert updated is not None
        assert updated.name == "Updated Name"
        assert updated.category == "Electronics"

    def test_update_brand_not_found(self, db: Session):
        """Test updating non-existent brand."""
        repo = BrandRepository(db)
        updated = repo.update("non-existent-id", name="New Name")
        assert updated is None

    def test_delete_brand(self, db: Session):
        """Test deleting a brand."""
        repo = BrandRepository(db)
        brand = repo.create(name="To Delete", category="Automotive")

        success = repo.delete(brand.id)
        assert success is True

        deleted = repo.get_by_id(brand.id)
        assert deleted is None

    def test_delete_brand_not_found(self, db: Session):
        """Test deleting non-existent brand."""
        repo = BrandRepository(db)
        success = repo.delete("non-existent-id")
        assert success is False

    def test_count_all_brands(self, db: Session):
        """Test counting all brands."""
        repo = BrandRepository(db)
        initial_count = repo.count()

        repo.create(name="Brand A", category="Automotive")
        repo.create(name="Brand B", category="Automotive")

        new_count = repo.count()
        assert new_count == initial_count + 2

    def test_count_active_brands(self, db: Session):
        """Test counting only active brands."""
        repo = BrandRepository(db)
        repo.create(name="Active 1", category="Automotive", active=True)
        repo.create(name="Active 2", category="Automotive", active=True)
        repo.create(name="Inactive", category="Automotive", active=False)

        active_count = repo.count(active_only=True)
        total_count = repo.count(active_only=False)

        assert active_count < total_count

    def test_search_brands(self, db: Session):
        """Test searching brands."""
        repo = BrandRepository(db)
        repo.create(name="Toyota Camry", category="Automotive")
        repo.create(name="Honda Civic", category="Automotive")
        repo.create(name="Samsung", category="Electronics")

        results = repo.search("Toyota")
        assert len(results) >= 1
        assert any("Toyota" in brand.name for brand in results)

    def test_search_by_category(self, db: Session):
        """Test searching brands by category."""
        repo = BrandRepository(db)
        repo.create(name="Brand X", category="Electronics")
        repo.create(name="Brand Y", category="Automotive")

        results = repo.search("Electronics")
        assert len(results) >= 1
        assert any("Electronics" in brand.category for brand in results)

    def test_search_case_insensitive(self, db: Session):
        """Test search is case insensitive."""
        repo = BrandRepository(db)
        repo.create(name="Toyota", category="Automotive")

        results = repo.search("TOYOTA")
        assert len(results) >= 1

        results = repo.search("toyota")
        assert len(results) >= 1
