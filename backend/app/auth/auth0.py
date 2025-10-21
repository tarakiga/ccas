"""Auth0 integration for JWT token validation."""

import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import requests
from functools import lru_cache

from app.config import settings

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()


class Auth0TokenValidator:
    """Validates Auth0 JWT tokens."""
    
    def __init__(self):
        self.domain = settings.AUTH0_DOMAIN
        self.audience = settings.AUTH0_AUDIENCE
        self.algorithms = settings.AUTH0_ALGORITHMS
        self._jwks_cache: Optional[Dict[str, Any]] = None
    
    @lru_cache(maxsize=1)
    def get_jwks(self) -> Dict[str, Any]:
        """
        Fetch JSON Web Key Set (JWKS) from Auth0.
        Cached to avoid repeated requests.
        
        Returns:
            JWKS dictionary containing public keys
            
        Raises:
            HTTPException: If JWKS cannot be fetched
        """
        try:
            jwks_url = f"https://{self.domain}/.well-known/jwks.json"
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to fetch JWKS from Auth0: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to verify authentication"
            )
    
    def get_signing_key(self, token: str) -> str:
        """
        Extract the signing key from JWKS based on token header.
        
        Args:
            token: JWT token string
            
        Returns:
            RSA public key for token verification
            
        Raises:
            HTTPException: If signing key cannot be found
        """
        try:
            # Decode token header without verification to get key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token header: missing key ID"
                )
            
            # Get JWKS and find matching key
            jwks = self.get_jwks()
            
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    # Construct RSA key from JWK
                    from jose.backends import RSAKey
                    return RSAKey(key, algorithm=self.algorithms[0]).to_pem().decode()
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate signing key"
            )
            
        except JWTError as e:
            logger.error(f"JWT error while extracting signing key: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate JWT token and extract claims.
        
        Args:
            token: JWT token string
            
        Returns:
            Dictionary containing token claims (sub, email, etc.)
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # Get signing key
            signing_key = self.get_signing_key(token)
            
            # Decode and validate token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=self.algorithms,
                audience=self.audience,
                issuer=f"https://{self.domain}/"
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTClaimsError as e:
            logger.warning(f"Invalid token claims: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims"
            )
        except JWTError as e:
            logger.error(f"JWT validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Unexpected error during token validation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication error"
            )


# Global validator instance
token_validator = Auth0TokenValidator()


async def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Dependency function to extract and validate JWT token from Authorization header.
    
    Args:
        credentials: HTTP Bearer credentials from request header
        
    Returns:
        Dictionary containing validated token claims
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
        
    Example:
        @app.get("/protected")
        async def protected_route(payload: dict = Depends(get_token_payload)):
            user_id = payload.get("sub")
            email = payload.get("email")
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials"
        )
    
    token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )
    
    # Validate token and return payload
    payload = token_validator.validate_token(token)
    
    # Extract and validate required claims
    auth0_id = payload.get("sub")
    email = payload.get("email")
    
    if not auth0_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing required claim: sub"
        )
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing required claim: email"
        )
    
    logger.info(
        "Token validated successfully",
        extra={"auth0_id": auth0_id, "email": email}
    )
    
    return payload
