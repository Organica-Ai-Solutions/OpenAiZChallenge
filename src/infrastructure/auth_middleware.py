"""Authentication and Authorization Middleware.

Provides robust authentication and role-based access control 
for the Indigenous Knowledge Research Platform.
"""

import logging
from typing import Dict, List, Optional, Callable, Any, TYPE_CHECKING
from datetime import datetime, timedelta

import jwt
from fastapi import Request, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

if TYPE_CHECKING:
    from ..models.user import User
from ..infrastructure.distributed_processing import DistributedProcessingManager

logger = logging.getLogger(__name__)

class AuthenticationManager:
    """Manages authentication, authorization, and token generation."""
    
    def __init__(
        self, 
        secret_key: str,
        algorithm: str = 'HS256',
        access_token_expire_minutes: int = 30,
        distributed_manager: Optional[DistributedProcessingManager] = None
    ):
        """Initialize authentication manager.
        
        Args:
            secret_key: Secret key for JWT token generation
            algorithm: JWT encryption algorithm
            access_token_expire_minutes: Token expiration time
            distributed_manager: Optional distributed processing manager
        """
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.distributed_manager = distributed_manager
        
        # Password hashing context
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # OAuth2 password bearer for token authentication
        self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify user password.
        
        Args:
            plain_password: Unhashed password
            hashed_password: Hashed password to compare against
            
        Returns:
            Boolean indicating password validity
        """
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        return self.pwd_context.hash(password)
    
    def create_access_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token.
        
        Args:
            data: Payload data to encode
            expires_delta: Optional token expiration time
            
        Returns:
            Encoded JWT token
        """
        to_encode = data.copy()
        
        # Set token expiration
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        
        # Encode token
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        return encoded_jwt
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT token.
        
        Args:
            token: JWT token to decode
            
        Returns:
            Decoded token payload
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.PyJWTError as e:
            logger.error(f"Token decoding error: {str(e)}")
            raise HTTPException(
                status_code=401, 
                detail="Could not validate credentials"
            )
    
    async def authenticate_user(
        self, 
        username: str, 
        password: str
    ) -> Optional['User']:
        """Authenticate user credentials.
        
        Args:
            username: User's username
            password: User's password
            
        Returns:
            Authenticated user or None
        """
        try:
            # Distributed user lookup (if distributed manager is available)
            if self.distributed_manager:
                user = await self.distributed_manager.distribute_task(
                    self._lookup_user, 
                    [username], 
                    {},
                    task_category='validation'
                )
            else:
                user = self._lookup_user(username)
            
            # Verify user and password
            if not user or not self.verify_password(password, user.hashed_password):
                return None
            
            return user
        
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None
    
    def _lookup_user(self, username: str) -> Optional['User']:
        """Lookup user in the database.
        
        This is a placeholder method. Replace with actual database lookup.
        
        Args:
            username: Username to lookup
            
        Returns:
            User object or None
        """
        # TODO: Implement actual user database lookup
        raise NotImplementedError("User lookup not implemented")

class RBACMiddleware(BaseHTTPMiddleware):
    """Role-Based Access Control Middleware."""
    
    PUBLIC_PATHS = [
        "/docs", 
        "/openapi.json", 
        # Add other public paths like /redoc if you use it
    ]

    def __init__(
        self, 
        app, 
        auth_manager: AuthenticationManager,
        role_permissions: Dict[str, List[str]]
    ):
        """Initialize RBAC middleware.
        
        Args:
            app: FastAPI application
            auth_manager: Authentication manager
            role_permissions: Mapping of roles to allowed permissions
        """
        super().__init__(app)
        self.auth_manager = auth_manager
        self.role_permissions = role_permissions
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        """Middleware dispatch method for access control.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware or request handler
            
        Returns:
            HTTP response
        """

        # Check if the request path is public
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode and validate token
            payload = self.auth_manager.decode_token(token)
            
            # Extract user role and permissions
            user_role = payload.get('role')
            if not user_role:
                raise HTTPException(status_code=403, detail="No role assigned")
            
            # Check route-specific permissions
            allowed_permissions = self.role_permissions.get(user_role, [])
            request_path = request.url.path
            request_method = request.method
            
            # Implement permission check logic
            if not self._check_permission(request_path, request_method, allowed_permissions):
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            # Continue request processing
            response = await call_next(request)
            return response
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Access control error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal authentication error")
    
    def _check_permission(
        self, 
        path: str, 
        method: str, 
        allowed_permissions: List[str]
    ) -> bool:
        """Check if the user has required permissions.
        
        Args:
            path: Request path
            method: HTTP method
            allowed_permissions: List of allowed permissions
            
        Returns:
            Boolean indicating permission status
        """
        # Implement complex permission mapping logic
        # This is a simplified example
        permission_mapping = {
            '/api/research': {
                'GET': 'read_research',
                'POST': 'create_research',
                'PUT': 'update_research',
                'DELETE': 'delete_research'
            }
            # Add more route-specific mappings
        }
        
        for route, methods in permission_mapping.items():
            if path.startswith(route):
                required_permission = methods.get(method)
                return required_permission in allowed_permissions
        
        # Default to deny if no matching route found
        return False 