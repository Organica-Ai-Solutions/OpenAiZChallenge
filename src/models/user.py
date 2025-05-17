"""User Model and Authentication Management.

Provides a comprehensive user model with role-based access,
permissions, and advanced authentication features.
"""

from typing import List, Dict, Optional
from enum import Enum, auto
from datetime import datetime, timedelta
from uuid import uuid4

from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from ..infrastructure.auth_middleware import AuthenticationManager

Base = declarative_base()

class UserRole(Enum):
    """Predefined user roles with hierarchical permissions."""
    GUEST = 0
    RESEARCHER = 1
    SENIOR_RESEARCHER = 2
    DATA_CURATOR = 3
    ADMIN = 4
    SYSTEM_ADMIN = 5

class UserStatus(Enum):
    """User account status."""
    PENDING = 'pending'
    ACTIVE = 'active'
    SUSPENDED = 'suspended'
    ARCHIVED = 'archived'

class UserPermission(str, Enum):
    """Granular user permissions."""
    # Research Permissions
    READ_RESEARCH = 'read_research'
    CREATE_RESEARCH = 'create_research'
    UPDATE_RESEARCH = 'update_research'
    DELETE_RESEARCH = 'delete_research'
    
    # Data Permissions
    UPLOAD_DATA = 'upload_data'
    VALIDATE_DATA = 'validate_data'
    EDIT_DATA = 'edit_data'
    
    # System Permissions
    MANAGE_USERS = 'manage_users'
    VIEW_SYSTEM_LOGS = 'view_system_logs'
    CONFIGURE_SYSTEM = 'configure_system'

class UserModel(Base):
    """SQLAlchemy User Model for persistent storage."""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True, default=lambda: str(uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # User metadata
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String)  # Enum representation
    status = Column(String, default=UserStatus.PENDING.value)
    
    # Tracking and audit
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    last_password_change = Column(DateTime)
    
    # Advanced configurations
    permissions = Column(JSON)
    metadata = Column(JSON)
    
    # Relationships
    research_projects = relationship("ResearchProject", back_populates="owner")

class UserDTO(BaseModel):
    """Data Transfer Object for User interactions."""
    uuid: str = Field(default_factory=lambda: str(uuid4()))
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: UserRole = UserRole.GUEST
    status: UserStatus = UserStatus.PENDING
    
    # Computed properties
    @property
    def full_name(self) -> str:
        """Generate full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format."""
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v

class UserService:
    """Service layer for user management with advanced features."""
    
    def __init__(
        self, 
        auth_manager: AuthenticationManager,
        session_factory
    ):
        """Initialize user service.
        
        Args:
            auth_manager: Authentication manager
            session_factory: Database session factory
        """
        self.auth_manager = auth_manager
        self.session_factory = session_factory
    
    async def create_user(
        self, 
        user_dto: UserDTO, 
        password: str
    ) -> UserDTO:
        """Create a new user with secure password handling.
        
        Args:
            user_dto: User data transfer object
            password: User's password
            
        Returns:
            Created user DTO
        """
        # Hash password
        hashed_password = self.auth_manager.get_password_hash(password)
        
        # Determine default permissions based on role
        default_permissions = self._get_role_permissions(user_dto.role)
        
        # Create user model
        user_model = UserModel(
            username=user_dto.username,
            email=user_dto.email,
            hashed_password=hashed_password,
            first_name=user_dto.first_name,
            last_name=user_dto.last_name,
            role=user_dto.role.name,
            status=user_dto.status.value,
            permissions=default_permissions
        )
        
        # Save to database
        async with self.session_factory() as session:
            session.add(user_model)
            await session.commit()
            await session.refresh(user_model)
        
        return user_dto
    
    def _get_role_permissions(self, role: UserRole) -> List[str]:
        """Generate default permissions for a given role.
        
        Args:
            role: User role
            
        Returns:
            List of default permissions
        """
        permission_mapping = {
            UserRole.GUEST: [
                UserPermission.READ_RESEARCH
            ],
            UserRole.RESEARCHER: [
                UserPermission.READ_RESEARCH,
                UserPermission.CREATE_RESEARCH,
                UserPermission.UPLOAD_DATA
            ],
            UserRole.SENIOR_RESEARCHER: [
                UserPermission.READ_RESEARCH,
                UserPermission.CREATE_RESEARCH,
                UserPermission.UPDATE_RESEARCH,
                UserPermission.UPLOAD_DATA,
                UserPermission.VALIDATE_DATA
            ],
            UserRole.ADMIN: [
                UserPermission.READ_RESEARCH,
                UserPermission.CREATE_RESEARCH,
                UserPermission.UPDATE_RESEARCH,
                UserPermission.DELETE_RESEARCH,
                UserPermission.UPLOAD_DATA,
                UserPermission.VALIDATE_DATA,
                UserPermission.EDIT_DATA,
                UserPermission.MANAGE_USERS
            ],
            UserRole.SYSTEM_ADMIN: [
                *[permission.value for permission in UserPermission]
            ]
        }
        
        return permission_mapping.get(role, []) 