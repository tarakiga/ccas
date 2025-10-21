#!/usr/bin/env python3
"""
Database seeding script for initial users and workflow step templates.

Usage:
    python seed_database.py
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.utils.seed_data import seed_users


def main():
    """Main function to seed the database."""
    print("=" * 60)
    print("Customs Clearance System - Database Seeding")
    print("=" * 60)
    print()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed users
        print("Seeding users...")
        print("-" * 60)
        seed_users(db)
        
        print()
        print("=" * 60)
        print("Database seeding completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError during seeding: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
