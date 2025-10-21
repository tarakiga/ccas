"""Database configuration and session management."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Enable connection health checks
    echo=settings.DB_ECHO,
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create Base class for declarative models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    
    Yields:
        Database session that will be automatically closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from contextlib import contextmanager


@contextmanager
def transaction_scope(db: Session):
    """
    Context manager for database transactions with automatic rollback on errors.
    
    Usage:
        with transaction_scope(db):
            # Perform database operations
            # Commit happens automatically on success
            # Rollback happens automatically on exception
    
    Args:
        db: SQLAlchemy database session
        
    Yields:
        Database session within transaction scope
        
    Raises:
        Any exception raised within the context will trigger rollback
    """
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
