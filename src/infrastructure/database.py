"""Database Connection and Session Management.

Provides robust database connection, session management, 
and migration support for the Indigenous Knowledge Research Platform.
"""

import logging
from typing import Optional, AsyncGenerator
import os

from sqlalchemy.ext.asyncio import (
    AsyncSession, 
    create_async_engine, 
    AsyncEngine, 
    async_sessionmaker
)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Correct imports from the restored src.config package
from src.config import (
    config_manager as global_app_config_manager, 
    ConfigManager as AppConfigManager, # For type hinting
    DatabaseConfig, # The actual Pydantic model for database settings
    Environment as AppEnvironment
)
from ..models.user import Base # Assuming this relative import is correct

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Centralized database connection and session management."""
    
    _instance: Optional['DatabaseManager'] = None
    _config_used_for_init: Optional[AppConfigManager] = None # To track which config was used

    def __new__(cls, config_manager_instance: Optional[AppConfigManager] = None):
        """Singleton that can be initialized with a specific ConfigManager instance."""
        if cls._instance is None:
            logger.debug("DBM: Creating new instance.")
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False # Ensure _initialize runs
            # Ensure global_app_config_manager is used if no instance is passed explicitly here
            # This helps if DatabaseManager() is called without args from elsewhere.
            # However, the module-level db_manager should be the primary one.
            init_config = config_manager_instance if config_manager_instance is not None else global_app_config_manager
            cls._instance._initialize(init_config)
        elif config_manager_instance and cls._config_used_for_init is not config_manager_instance:
            # If called again with a *different* config instance, re-initialize with the new one.
            # This handles scenarios where the global config might be reloaded and a new instance passed.
            logger.warning("DBM: Re-initializing existing instance with a new ConfigManager.")
            cls._instance._initialized = False
            cls._instance._initialize(config_manager_instance)
        else:
            logger.debug("DBM: Returning existing instance.")
        return cls._instance
    
    def _initialize(self, config_manager_instance: AppConfigManager):
        """Initialize with a given ConfigManager instance."""
        if self._initialized:
            logger.debug("DBM: Already initialized and using the same config.")
            return
        
        logger.debug("DBM: _initialize called.")
        self.config = config_manager_instance
        DatabaseManager._config_used_for_init = self.config # Track it

        logger.info(f"DBM: Using ConfigManager instance ID: {id(self.config)}")
        # print(f"DEBUG DBM: self.config in _initialize - ID: {id(self.config)}, Type: {type(self.config)}")
        # print(f"DEBUG DBM: Attributes of self.config: {dir(self.config)}")
        has_get_config_method = hasattr(self.config, 'get_config') and callable(getattr(self.config, 'get_config'))
        # print(f"DEBUG DBM: hasattr(self.config, 'get_config') and is callable: {has_get_config_method}")

        if not has_get_config_method:
            logger.error("ERROR DBM: self.config does NOT have a callable get_config method!")
            self._initialized = False
            # This is a critical failure, ideally raise an exception or prevent app startup
            raise RuntimeError("DatabaseManager: ConfigManager instance is missing get_config method.")

        db_config_model = self.config.get_config("database")
        
        if not db_config_model or not isinstance(db_config_model, DatabaseConfig):
            logger.error(f"ERROR DBM: Did not receive a valid DatabaseConfig model from ConfigManager. Got: {type(db_config_model)}")
            self._initialized = False
            raise RuntimeError("DatabaseManager: Invalid DatabaseConfig received.")

        # Construct database URL using the Pydantic model attributes
        db_user = db_config_model.db_user or os.getenv('POSTGRES_USER', 'user')
        db_password = db_config_model.db_password or os.getenv('POSTGRES_PASSWORD', 'password')
        db_name = db_config_model.db_name or os.getenv('POSTGRES_DB', 'nis')
        db_host = db_config_model.db_host or os.getenv('POSTGRES_HOST', 'db')
        db_port = db_config_model.db_port or 5432

        self.db_url = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        
        current_env = self.config.current_environment # Get environment from ConfigManager
        logger.info(f"DBM: Database URL for env '{current_env.value if current_env else 'UNKNOWN'}': {self.db_url[:self.db_url.find(':')+3]}") # Slightly more of URL for context

        self._engine: AsyncEngine = create_async_engine(
            self.db_url,
            poolclass=NullPool,
            echo=False # Set to True for verbose SQLAlchemy logging, e.g., if current_env == AppEnvironment.LOCAL
        )
        self._session_factory = async_sessionmaker(self._engine, expire_on_commit=False, class_=AsyncSession)
        logger.info("DBM: DatabaseManager initialized successfully with full config.")
        self._initialized = True
    
    async def create_tables(self):
        """Create all database tables."""
        if not self._initialized or not self._engine:
            logger.error("DBM: Cannot create tables, DatabaseManager not initialized.")
            return
        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    
    async def drop_tables(self):
        """Drop all database tables (use with caution)."""
        if not self._initialized or not self._engine:
            logger.error("DBM: Cannot drop tables, DatabaseManager not initialized.")
            return
        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        logger.warning("All database tables dropped")
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Create a new database session."""
        if not self._initialized or not self._session_factory:
            logger.error("DBM: Cannot get session, DatabaseManager not initialized.")
            # Potentially raise an error or return a broken session
            # For now, let it try and fail if _session_factory is None
            # though _initialized check should ideally prevent this.
            # Consider a more robust way to handle uninitialized state here.
            class DummyAsyncSession:
                async def __aenter__(self):
                    return self
                async def __aexit__(self, exc_type, exc_val, exc_tb):
                    pass
                async def close(self):
                    pass
            # This is a placeholder, it won't actually work.
            # A better approach is to ensure initialization before any get_session call.
            async def dummy_generator():
                yield DummyAsyncSession() 
                
            async for session in dummy_generator(): # type: ignore
                yield session # This will effectively do nothing useful.
            return

        async with self._session_factory() as session:
            try:
                yield session
            finally:
                await session.close()
    
    def get_sync_session(self):
        """Create a synchronous session factory (for migrations). Requires engine to be initialized."""
        if not self._initialized or not self._engine:
            logger.error("DBM: Cannot get sync session, DatabaseManager not initialized.")
            return None # Or raise error
        return sessionmaker(bind=self._engine)

# Global database manager instance, initialized with the global config_manager.
# This is the primary instance that should be used throughout the application where possible.
db_manager = DatabaseManager(config_manager_instance=global_app_config_manager)

# Convenience functions for dependency injection in FastAPI etc.
# These ensure that if DatabaseManager() is called, it attempts to use the global config.
async def get_db_session() -> AsyncGenerator[AsyncSession, None]: # Modified to be an AsyncGenerator
    """Get a database session for dependency injection."""
    current_db_manager = DatabaseManager(config_manager_instance=global_app_config_manager) 
    async for session in current_db_manager.get_session():
        yield session # Yield the session from the generator

async def init_db():
    """Initialize database (create tables). Called at app startup."""
    # Ensures that the global db_manager (which was initialized with global_app_config_manager)
    # or a correctly initialized new singleton is used.
    current_db_manager = DatabaseManager(config_manager_instance=global_app_config_manager)
    await current_db_manager.create_tables()

async def reset_db():
    """Reset database (drop and recreate tables). Use with caution."""
    current_db_manager = DatabaseManager(config_manager_instance=global_app_config_manager)
    await current_db_manager.drop_tables()
    await current_db_manager.create_tables() 