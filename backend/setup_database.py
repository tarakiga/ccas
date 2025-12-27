#!/usr/bin/env python3
"""
Complete database setup script.

This script will:
1. Create all database tables
2. Seed initial users
3. Seed initial brands
4. Verify the setup

Usage:
    python setup_database.py
"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables from .env file
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

from app.database import engine, Base, SessionLocal
from app.models import (
    User,
    Shipment,
    WorkflowStep,
    WorkflowStepTemplate,
    Alert,
    AuditLog,
    Brand,
    WorkflowActionLog,
)
from app.utils.seed_data import seed_users
from app.repositories.brand_repository import BrandRepository


# Initial brands
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


def create_tables():
    """Create all database tables."""
    print("\n" + "=" * 60)
    print("STEP 1: Creating Database Tables")
    print("=" * 60)
    
    try:
        Base.metadata.create_all(bind=engine)
        
        print("\nTables created successfully:")
        for table in Base.metadata.sorted_tables:
            print(f"  ✓ {table.name}")
        
        return True
    except Exception as e:
        print(f"\n✗ Error creating tables: {e}")
        return False


def seed_brands_data(db):
    """Seed initial brands."""
    print("\n" + "=" * 60)
    print("STEP 3: Seeding Brands")
    print("=" * 60)
    
    repo = BrandRepository(db)
    created_count = 0
    skipped_count = 0
    
    try:
        for brand_data in SEED_BRANDS:
            existing_brand = repo.get_by_name(brand_data["name"])
            
            if existing_brand:
                print(f"  ⊘ {brand_data['name']} - already exists")
                skipped_count += 1
                continue
            
            brand = repo.create(**brand_data)
            print(f"  ✓ {brand.name} ({brand.category})")
            created_count += 1
        
        print(f"\nBrands seeded: {created_count} created, {skipped_count} skipped")
        return True
    except Exception as e:
        print(f"\n✗ Error seeding brands: {e}")
        db.rollback()
        return False


def verify_setup(db):
    """Verify the database setup."""
    print("\n" + "=" * 60)
    print("STEP 4: Verifying Setup")
    print("=" * 60)
    
    try:
        # Count users
        user_count = db.query(User).count()
        print(f"\n  ✓ Users: {user_count}")
        
        # Count brands
        brand_count = db.query(Brand).count()
        print(f"  ✓ Brands: {brand_count}")
        
        # List some users
        if user_count > 0:
            print("\n  Sample users:")
            users = db.query(User).limit(5).all()
            for user in users:
                print(f"    - {user.email} ({user.department} - {user.role})")
        
        # List some brands
        if brand_count > 0:
            print("\n  Sample brands:")
            brands = db.query(Brand).limit(5).all()
            for brand in brands:
                print(f"    - {brand.name} ({brand.category})")
        
        return True
    except Exception as e:
        print(f"\n✗ Error verifying setup: {e}")
        return False


def main():
    """Main function to set up the database."""
    print("\n" + "=" * 70)
    print(" " * 15 + "CUSTOMS CLEARANCE SYSTEM")
    print(" " * 15 + "Database Setup Script")
    print("=" * 70)
    
    # Step 1: Create tables
    if not create_tables():
        print("\n✗ Setup failed at table creation")
        sys.exit(1)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Step 2: Seed users
        print("\n" + "=" * 60)
        print("STEP 2: Seeding Users")
        print("=" * 60)
        seed_users(db)
        
        # Step 3: Seed brands
        if not seed_brands_data(db):
            print("\n✗ Setup failed at brand seeding")
            sys.exit(1)
        
        # Step 4: Verify setup
        if not verify_setup(db):
            print("\n✗ Setup verification failed")
            sys.exit(1)
        
        # Success!
        print("\n" + "=" * 70)
        print(" " * 20 + "✓ SETUP COMPLETE!")
        print("=" * 70)
        print("\nYour database is ready for use!")
        print("\nNext steps:")
        print("  1. Start the backend server: uvicorn app.main:app --reload")
        print("  2. Start the frontend: cd frontend && npm run dev")
        print("  3. Access the application at http://localhost:3000")
        print("\nTest credentials are available in TEST_LOGIN_CREDENTIALS.md")
        print("=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n✗ Setup failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
