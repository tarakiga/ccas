"""Custom exception classes for the application."""


class ConcurrentModificationError(Exception):
    """
    Exception raised when a concurrent modification is detected.
    
    This is used for optimistic locking when a resource has been
    modified by another transaction since it was read.
    """
    pass


class ResourceNotFoundError(Exception):
    """Exception raised when a requested resource is not found."""
    pass


class ValidationError(Exception):
    """Exception raised when validation fails."""
    pass
