#!/usr/bin/env python3
"""
Seed initial brands into the database.

Usage:
    python seed_brands.py
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.repositories.brand_repository import BrandRepository


# Initial brands based on automotive industry
SEED_BRANDS = [
    {"name": "Toyota", "category": "Automotive", "active": True},
    {"name": "Honda", "category": "Automotive", "active": True},
    {"name": "Nissan", "category": "Automotive", "active": True},
    {"name": "Mazda", "category": "Automotive", "active": True},
    {"name": "Ford", "category": "Automotive", "active": True},
    {"name": "Chevrolet", "category": "Automotive", "active": True},
    {"name": "Hyundai", "category": "Automotive", "active": True},
    {"name": "Kia", "category": "Automotive", "active": True},
    {"name": "Mitsubishi", "category": "Automotive", "active": True},
    {"name": "Suzuki", "category": "Automotive", "active": True},
]


def main():
    """Main function to seed brands."""
    print("=" * 60)
    print("Customs Clearance System - Seed Brands")
    print("=" * 60)
    print()
    
    # Create database session
    db = SessionLocal()
    repo = BrandRepository(db)
    
    try:
        print("Seeding brands...")
        print("-" * 60)
        
        created_count = 0
        skipped_count = 0
        
        for brand_data in SEED_BRANDS:
            # Check if brand already exists
            existing_brand = repo.get_by_name(brand_data["name"])
            
            if existing_brand:
                print(f"  ⊘ {brand_data['name']} - already exists, skipping...")
                skipped_count += 1
                continue
            
            # Create new brand
            brand = repo.create(**brand_data)
            print(f"  ✓ {brand.name} ({brand.category})")
            created_count += 1
        
        print()
        print("=" * 60)
        print(f"Brand seeding completed!")
        print(f"  Created: {created_count}")
        print(f"  Skipped: {skipped_count}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError during seeding: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
