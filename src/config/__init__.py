"""Configuration package for the NIS Protocol."""

import os
import enum
from pathlib import Path
from typing import Optional
from pydantic import BaseSettings

from .data_sources import (
    DATA_DIR,
    OUTPUTS_DIR,
    REQUIRED_FILES,
    get_data_source_status,
    verify_all_data_sources
)

class Environment(enum.Enum):
    """Environment types for the NIS Protocol."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class ConfigManager:
    """Configuration manager for the NIS Protocol."""
    
    def __init__(self):
        self.kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "nis-kafka:9092")
        self.kafka_topic_prefix = os.getenv("KAFKA_TOPIC_PREFIX", "nis_protocol")
        self.redis_url = os.getenv("REDIS_URL", "redis://nis-redis:6379")
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.log_dir = os.getenv("LOG_DIR", "logs")
        self.use_real_data = os.getenv("USE_REAL_DATA", "true").lower() == "true"
        self.disable_mock_responses = os.getenv("DISABLE_MOCK_RESPONSES", "true").lower() == "true"
        self.enable_gpt_vision = os.getenv("ENABLE_GPT_VISION", "true").lower() == "true"
        self.enable_web_search = os.getenv("ENABLE_WEB_SEARCH", "true").lower() == "true"
        
        # Data paths
        self.data_dir = DATA_DIR
        self.outputs_dir = OUTPUTS_DIR
        
        # Security settings
        self.secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-for-development")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.rate_limit_requests = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
        self.rate_limit_window = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
        self.cors_allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
        
        # Processing settings
        self.max_workers = int(os.getenv("MAX_WORKERS", "4"))
        self.batch_size = int(os.getenv("BATCH_SIZE", "10"))
        self.timeout_seconds = int(os.getenv("TIMEOUT_SECONDS", "300"))
    
    def validate_config(self) -> bool:
        """Validate the current configuration."""
        try:
            # Check data directories
            if not self.data_dir.exists():
                raise ValueError(f"Data directory {self.data_dir} does not exist")
            if not self.outputs_dir.exists():
                raise ValueError(f"Outputs directory {self.outputs_dir} does not exist")
            
            # Verify data sources
            if self.use_real_data and not verify_all_data_sources():
                raise ValueError("Real data mode enabled but not all data sources are available")
            
            return True
        except Exception as e:
            print(f"Configuration validation failed: {str(e)}")
            return False

class Settings(BaseSettings):
    """Settings for the NIS Protocol."""
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    USE_REAL_DATA: bool = os.getenv("USE_REAL_DATA", "true").lower() == "true"
    DISABLE_MOCK_RESPONSES: bool = os.getenv("DISABLE_MOCK_RESPONSES", "true").lower() == "true"

    class Config:
        env_file = ".env"

def get_settings() -> Settings:
    """Get application settings."""
    return Settings()

_config_instance: Optional[ConfigManager] = None

def get_config() -> ConfigManager:
    """Get the global configuration instance."""
    global _config_instance
    if _config_instance is None:
        _config_instance = ConfigManager()
    return _config_instance

def get_environment() -> Environment:
    """Get the current environment."""
    env = os.getenv("ENVIRONMENT", "development").lower()
    try:
        return Environment(env)
    except ValueError:
        print(f"Warning: Invalid environment '{env}', defaulting to development")
        return Environment.DEVELOPMENT

config_manager = get_config()

# Export settings
settings = get_settings()
OPENAI_API_KEY = settings.OPENAI_API_KEY

__all__ = [
    'DATA_DIR',
    'OUTPUTS_DIR',
    'REQUIRED_FILES',
    'get_data_source_status',
    'verify_all_data_sources',
    'config_manager',
    'get_config',
    'get_environment',
    'Environment',
    'get_settings',
    'settings',
    'OPENAI_API_KEY'
] 