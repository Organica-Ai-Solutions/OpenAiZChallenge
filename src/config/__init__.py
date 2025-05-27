"""Configuration package for the NIS Protocol."""

import os
import enum
from pathlib import Path
from typing import Optional, List
from pydantic_settings import BaseSettings

from .data_sources import (
    DATA_DIR,
    OUTPUTS_DIR,
    REQUIRED_FILES,
    get_data_source_status,
    verify_all_data_sources,
    SATELLITE_DATA_DIR,
    LIDAR_DATA_DIR
)

class Environment(enum.Enum):
    """Environment types for the NIS Protocol."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class Settings(BaseSettings):
    """Settings for the NIS Protocol."""
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    USE_REAL_DATA: bool = os.getenv("USE_REAL_DATA", "true").lower() == "true"
    DISABLE_MOCK_RESPONSES: bool = os.getenv("DISABLE_MOCK_RESPONSES", "true").lower() == "true"
    ENABLE_MOCK_MODE: bool = os.getenv("ENABLE_MOCK_MODE", "true").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-development")
    PROCESSING_MODE: str = os.getenv("PROCESSING_MODE", "local")
    
    SENTINEL_USERNAME: Optional[str] = None
    SENTINEL_PASSWORD: Optional[str] = None
    LIDAR_USERNAME: Optional[str] = None
    LIDAR_PASSWORD: Optional[str] = None
    EARTHDATA_TOKEN: Optional[str] = None
    CDSE_CLIENT_ID: Optional[str] = None
    CDSE_AUTH_URL: Optional[str] = None
    CDSE_STAC_URL: Optional[str] = None

    API_HOST: str = os.getenv("API_HOST", "localhost")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    EARTHDATA_API_URL: Optional[str] = None
    EARTHDATA_COLLECTION_ID: Optional[str] = None
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    FRONTEND_PORT: int = int(os.getenv("FRONTEND_PORT", "3000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    REDIS_HOST: str = os.getenv("REDIS_HOST", "nis-redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))

    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "nis-kafka:9092")
    KAFKA_TOPIC_PREFIX: str = os.getenv("KAFKA_TOPIC_PREFIX", "nis_protocol")
    LOG_DIR: str = os.getenv("LOG_DIR", "logs")
    ENABLE_GPT_VISION: bool = os.getenv("ENABLE_GPT_VISION", "true").lower() == "true"
    ENABLE_WEB_SEARCH: bool = os.getenv("ENABLE_WEB_SEARCH", "true").lower() == "true"
    
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    CORS_ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")]
    
    MAX_WORKERS: int = int(os.getenv("MAX_WORKERS", "4"))
    MAX_CONCURRENT_AGENTS: int = int(os.getenv("MAX_CONCURRENT_AGENTS", "5"))
    BATCH_SIZE: int = int(os.getenv("BATCH_SIZE", "10"))
    TIMEOUT_SECONDS: int = int(os.getenv("TIMEOUT_SECONDS", "300"))

    LIDAR_DATA_DIR_ENV: str = os.getenv("LIDAR_DATA_DIR", "./data/lidar")
    OUTPUT_DIR_ENV: str = os.getenv("OUTPUT_DIR", "./outputs")
    
    # Enable flags for pipeline components - to be controlled by env vars
    HISTORICAL_TEXTS_ENABLED: bool = os.getenv("HISTORICAL_TEXTS_ENABLED", "true").lower() == "true"
    INDIGENOUS_MAPS_ENABLED: bool = os.getenv("INDIGENOUS_MAPS_ENABLED", "true").lower() == "true"
    SATELLITE_ENABLED: bool = os.getenv("SATELLITE_ENABLED", "true").lower() == "true"
    LIDAR_ENABLED: bool = os.getenv("LIDAR_ENABLED", "true").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "allow"
        env_file_encoding = 'utf-8'

def get_settings() -> Settings:
    """Get application settings."""
    return Settings()

# Centralized settings instance - DEFINED FIRST
settings = get_settings()

# The ConfigManager class can be refactored or removed if all settings are managed by the Settings class.
class ConfigManager:
    """Configuration manager for the NIS Protocol."""
    
    def __init__(self):
        # These now come from the settings object, which is defined above
        self.kafka_bootstrap_servers = settings.KAFKA_BOOTSTRAP_SERVERS
        self.kafka_topic_prefix = settings.KAFKA_TOPIC_PREFIX
        self.redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
        self.log_level = settings.LOG_LEVEL
        self.log_dir = settings.LOG_DIR
        self.use_real_data = settings.USE_REAL_DATA
        self.disable_mock_responses = settings.DISABLE_MOCK_RESPONSES
        self.enable_gpt_vision = settings.ENABLE_GPT_VISION
        self.enable_web_search = settings.ENABLE_WEB_SEARCH
        
        self.data_dir = Path(settings.LIDAR_DATA_DIR_ENV).parent
        self.outputs_dir = Path(settings.OUTPUT_DIR_ENV)
        self.satellite_data_dir = SATELLITE_DATA_DIR
        self.lidar_data_dir = LIDAR_DATA_DIR

        self.secret_key = settings.SECRET_KEY
        self.jwt_algorithm = settings.JWT_ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.rate_limit_requests = settings.RATE_LIMIT_REQUESTS
        self.rate_limit_window = settings.RATE_LIMIT_WINDOW
        self.cors_allowed_origins = settings.CORS_ALLOWED_ORIGINS
        
        self.max_workers = settings.MAX_WORKERS
        self.batch_size = settings.BATCH_SIZE
        self.timeout_seconds = settings.TIMEOUT_SECONDS
    
    def validate_config(self) -> bool:
        """Validate the current configuration."""
        try:
            if not self.data_dir.exists():
                raise ValueError(f"Data directory {self.data_dir} does not exist")
            if not self.outputs_dir.exists():
                raise ValueError(f"Outputs directory {self.outputs_dir} does not exist")
            
            if self.use_real_data and not verify_all_data_sources():
                raise ValueError("Real data mode enabled but not all data sources are available")
            
            return True
        except Exception as e:
            print(f"Configuration validation failed: {str(e)}")
            return False

_config_instance: Optional[ConfigManager] = None

def get_config() -> ConfigManager:
    """Get the global configuration instance."""
    global _config_instance
    if _config_instance is None:
        _config_instance = ConfigManager() # Now settings will be defined when this is called
    return _config_instance

def get_environment() -> Environment:
    """Get the current environment."""
    env = settings.ENVIRONMENT.lower()
    try:
        return Environment(env)
    except ValueError:
        print(f"Warning: Invalid environment '{env}', defaulting to development")
        return Environment.DEVELOPMENT

config_manager = get_config() # settings is defined before this now

__all__ = [
    'DATA_DIR',
    'OUTPUTS_DIR',
    'SATELLITE_DATA_DIR',
    'LIDAR_DATA_DIR',
    'REQUIRED_FILES',
    'get_data_source_status',
    'verify_all_data_sources',
    'config_manager',
    'get_config',
    'get_environment',
    'Environment',
    'get_settings',
    'settings',
] 