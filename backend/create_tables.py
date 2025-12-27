#!/usr/bin/env python3
"""
Create all database tables.

Usage:
    python create_tables.py
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import engine, Base
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


def main():
    """Main function to create all tables."""
    print("=" * 60)
    print("Customs Clearance System - Create Database Tables")
    print("=" * 60)
    print()
    
    try:
        print("Creating all tables...")
        print("-" * 60)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print()
        print("Tables created successfully:")
        for table in Base.metadata.sorted_tables:
            print(f"  ✓ {table.name}")
        
        print()
        print("=" * 60)
        print("Database tables created successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError creating tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
