"""Database Connection and Session Management.

Provides robust database connection, session management, 
and migration support for the Indigenous Knowledge Research Platform.
"""

import logging
from typing import Optional, AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession, 
    create_async_engine, 
    AsyncEngine, 
    async_sessionmaker
)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from ..config import get_config, get_environment, Environment
from ..models.user import Base

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Centralized database connection and session management."""
    
    _instance = None
    
    def __new__(cls):
        """Singleton implementation."""
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize database connection parameters."""
        # Get database configuration
        db_config = get_config("database")
        env = get_environment()
        
        # Connection string templates
        CONNECTION_STRINGS = {
            Environment.LOCAL: "sqlite+aiosqlite:///local_dev.db",
            Environment.DEVELOPMENT: "postgresql+asyncpg://dev_user:dev_pass@localhost/nis_dev",
            Environment.STAGING: "postgresql+asyncpg://staging_user:staging_pass@staging-db/nis_staging",
            Environment.PRODUCTION: "postgresql+asyncpg://prod_user:prod_pass@prod-db/nis_prod"
        }
        
        # Select connection string
        self.connection_string = CONNECTION_STRINGS.get(
            env, 
            CONNECTION_STRINGS[Environment.LOCAL]
        )
        
        # Create async engine
        self.engine: AsyncEngine = create_async_engine(
            self.connection_string,
            echo=env in [Environment.DEVELOPMENT, Environment.LOCAL],
            poolclass=NullPool  # Disable connection pooling for async operations
        )
        
        # Create async session factory
        self.async_session_factory = async_sessionmaker(
            self.engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )
    
    async def create_tables(self):
        """Create all database tables."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    
    async def drop_tables(self):
        """Drop all database tables (use with caution)."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        logger.warning("All database tables dropped")
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Create a new database session.
        
        Yields:
            Async database session
        """
        async with self.async_session_factory() as session:
            try:
                yield session
            finally:
                await session.close()
    
    def get_sync_session(self):
        """Create a synchronous session factory (for migrations)."""
        return sessionmaker(bind=self.engine)

# Global database manager
db_manager = DatabaseManager()

# Convenience functions
async def get_db_session() -> AsyncSession:
    """Get a database session for dependency injection."""
    async for session in db_manager.get_session():
        return session

async def init_db():
    """Initialize database (create tables)."""
    await db_manager.create_tables()

async def reset_db():
    """Reset database (drop and recreate tables)."""
    await db_manager.drop_tables()
    await db_manager.create_tables() 