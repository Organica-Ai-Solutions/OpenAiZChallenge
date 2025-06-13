"""Configuration package for the NIS Protocol."""

import os
import enum
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging

from pydantic import BaseModel, Field, ValidationError
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

from .data_sources import (
    DATA_DIR,
    OUTPUTS_DIR,
    REQUIRED_FILES,
    get_data_source_status,
    verify_all_data_sources,
    SATELLITE_DATA_DIR,
    LIDAR_DATA_DIR
)

# Load environment variables from .env file - SHOULD BE AT THE VERY TOP
load_dotenv()

# Assuming these are still relevant or will be used by Settings/ConfigManager
# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
SENTINEL_USERNAME = os.getenv('SENTINEL_USERNAME')
SENTINEL_PASSWORD = os.getenv('SENTINEL_PASSWORD')
LIDAR_USERNAME = os.getenv('LIDAR_USERNAME')
LIDAR_PASSWORD = os.getenv('LIDAR_PASSWORD')

# Data paths - these might be better defined within Settings or derived from a base dir in settings
# BASE_DIR_CONFIG = Path(__file__).resolve().parent.parent # src directory
# DATA_DIR_CONFIG = BASE_DIR_CONFIG / 'data'
# OUTPUTS_DIR_CONFIG = BASE_DIR_CONFIG / 'outputs'

# LIDAR_DATA_DIR_CONFIG = DATA_DIR_CONFIG / 'lidar'
# SATELLITE_DATA_DIR_CONFIG = DATA_DIR_CONFIG / 'satellite'

# Required files - these should ideally be part of a data validation step, not top-level config
# REQUIRED_FILES = {
#     LIDAR_DATA_DIR_CONFIG: ["file1.las", "file2.laz"],
#     SATELLITE_DATA_DIR_CONFIG: ["image1.tif", "image2.jp2"]
# }

# def get_data_source_status(): # This logic should move to a data management/validation module
#     pass
# def verify_all_data_sources(): # This logic should move to a data management/validation module
#     pass

class Environment(enum.Enum):
    """Environment types for the NIS Protocol."""
    LOCAL = "local"
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

    @classmethod
    def _missing_(cls, value):
        for member in cls:
            if member.value.lower() == str(value).lower():
                return member
        return None

class SecurityConfig(BaseModel):
    """Security configuration settings."""
    secret_key: str = Field(default_factory=lambda: os.getenv('SECRET_KEY', os.urandom(32).hex()))
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_allowed_origins: List[str] = Field(default_factory=lambda: [origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")])
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

class ProcessingConfig(BaseModel):
    """Distributed processing configuration."""
    mode: str = Field(default_factory=lambda: os.getenv("PROCESSING_MODE", "local"))
    max_workers: int = Field(default_factory=lambda: int(os.getenv("MAX_WORKERS", "4")))
    enable_satellite_processing: bool = Field(default_factory=lambda: os.getenv("ENABLE_SATELLITE_PROCESSING", "true").lower() == "true")
    enable_lidar_processing: bool = Field(default_factory=lambda: os.getenv("ENABLE_LIDAR_PROCESSING", "true").lower() == "true")
    enable_historical_texts: bool = Field(default_factory=lambda: os.getenv("ENABLE_HISTORICAL_TEXTS", "true").lower() == "true")
    enable_indigenous_maps: bool = Field(default_factory=lambda: os.getenv("ENABLE_INDIGENOUS_MAPS", "true").lower() == "true")
    data_collection_days_range: int = Field(default_factory=lambda: int(os.getenv("DATA_COLLECTION_DAYS_RANGE", "1825"))) # Default 5 years (5*365)

class DatabaseConfig(BaseModel):
    """Database connection configurations."""
    db_user: Optional[str] = Field(default_factory=lambda: os.getenv("POSTGRES_USER"))
    db_password: Optional[str] = Field(default_factory=lambda: os.getenv("POSTGRES_PASSWORD"))
    db_host: Optional[str] = Field(default_factory=lambda: os.getenv("POSTGRES_HOST"))
    db_port: Optional[int] = Field(default_factory=lambda: int(os.getenv("POSTGRES_PORT", 5432)))
    db_name: Optional[str] = Field(default_factory=lambda: os.getenv("POSTGRES_DB"))

    redis_host: str = Field(default_factory=lambda: os.getenv("REDIS_HOST", "localhost"))
    redis_port: int = Field(default_factory=lambda: int(os.getenv("REDIS_PORT", 6379)))
    redis_db: int = Field(default_factory=lambda: int(os.getenv("REDIS_DB", 0)))
    
    kafka_bootstrap_servers: List[str] = Field(default_factory=lambda: os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092").split(","))
    kafka_topic_prefix: str = Field(default_factory=lambda: os.getenv("KAFKA_TOPIC_PREFIX", "nis_protocol"))

class LoggingConfig(BaseModel):
    """Logging configuration."""
    level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO").upper())
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

class FeatureFlags(BaseModel):
    """Feature flags for conditional functionality."""
    enable_ml_processing: bool = Field(default_factory=lambda: os.getenv("ENABLE_ML_PROCESSING", "false").lower() == "true")
    enable_distributed_computing: bool = Field(default_factory=lambda: os.getenv("ENABLE_DISTRIBUTED_COMPUTING", "false").lower() == "true")
    enable_authentication: bool = Field(default_factory=lambda: os.getenv("ENABLE_AUTHENTICATION", "false").lower() == "true")
    enable_real_data_sources: bool = Field(default_factory=lambda: os.getenv("ENABLE_REAL_DATA_SOURCES", "false").lower() == "true")
    enable_agent_processing: bool = Field(default_factory=lambda: os.getenv("ENABLE_AGENT_PROCESSING", "false").lower() == "true")
    enable_health_monitoring: bool = Field(default_factory=lambda: os.getenv("ENABLE_HEALTH_MONITORING", "true").lower() == "true")

class AppSettings(BaseSettings):
    """Main application settings, loaded from environment or .env file."""
    APP_NAME: str = "NIS Protocol Backend"
    ENVIRONMENT: Environment = Field(default_factory=lambda: Environment._missing_(os.getenv("NIS_ENV", "local")))
    LOG_LEVEL: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO").upper())

    security: SecurityConfig = SecurityConfig()
    processing: ProcessingConfig = ProcessingConfig()
    database: DatabaseConfig = DatabaseConfig()
    logging_config: LoggingConfig = LoggingConfig()

    OPENAI_API_KEY: Optional[str] = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))
    USE_REAL_DATA: bool = Field(default_factory=lambda: os.getenv("USE_REAL_DATA", "true").lower() == "true")
    DISABLE_MOCK_RESPONSES: bool = Field(default_factory=lambda: os.getenv("DISABLE_MOCK_RESPONSES", "true").lower() == "true")
    
    API_HOST: str = Field(default_factory=lambda: os.getenv("API_HOST", "0.0.0.0"))
    API_PORT: int = Field(default_factory=lambda: int(os.getenv("API_PORT", "8000")))

    # Add missing setting for concurrent agents
    MAX_CONCURRENT_AGENTS: int = Field(default_factory=lambda: int(os.getenv("MAX_CONCURRENT_AGENTS", "4")))

    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    OUTPUTS_DIR: Path = BASE_DIR / "outputs"
    LOG_DIR: Path = OUTPUTS_DIR / "logs"

    SATELLITE_DATA_DIR: Path = DATA_DIR / "satellite"
    LIDAR_DATA_DIR: Path = DATA_DIR / "lidar"

    feature_flags: FeatureFlags = FeatureFlags()

    class Config:
        env_file = ".env"
        extra = "ignore"
        env_file_encoding = 'utf-8'

app_settings = AppSettings()

logging.basicConfig(
    level=app_settings.LOG_LEVEL,
    format=app_settings.logging_config.format,
)
Path(app_settings.LOG_DIR).mkdir(parents=True, exist_ok=True)

class ConfigManager:
    """Configuration manager for the NIS Protocol. 
    Provides a single point of access to various configuration sections.
    """
    
    def __init__(self, settings_instance: AppSettings = app_settings):
        self._settings = settings_instance

    def get_config(self, config_type: str) -> Optional[BaseModel]:
        if config_type == "security":
            return self._settings.security
        elif config_type == "processing":
            return self._settings.processing
        elif config_type == "database":
            return self._settings.database
        elif config_type == "logging":
            return self._settings.logging_config
        logging.warning(f"ConfigManager: Unknown config_type requested: {config_type}")
        return None

    @property
    def current_environment(self) -> Environment:
        return self._settings.ENVIRONMENT

    @property
    def data_dir(self) -> Path:
        return self._settings.DATA_DIR

    @property
    def outputs_dir(self) -> Path:
        return self._settings.OUTPUTS_DIR
    
    def validate_all_configs(self) -> bool:
        try:
            if not self._settings.DATA_DIR.exists():
                 logging.warning(f"Data directory {self._settings.DATA_DIR} does not exist. Creating.")
                 self._settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
            if not self._settings.OUTPUTS_DIR.exists():
                logging.warning(f"Outputs directory {self._settings.OUTPUTS_DIR} does not exist. Creating.")
                self._settings.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
            logging.info("AppSettings successfully validated.")
            return True
        except ValidationError as e:
            logging.error(f"AppSettings validation failed: {e}")
            return False

_config_manager_singleton: Optional[ConfigManager] = None

def get_config_manager() -> ConfigManager:
    """Get the global ConfigManager singleton instance."""
    global _config_manager_singleton
    if _config_manager_singleton is None:
        _config_manager_singleton = ConfigManager(settings_instance=app_settings)
        _config_manager_singleton.validate_all_configs()
    return _config_manager_singleton

config_manager: ConfigManager = get_config_manager()

def get_environment() -> Environment:
    return config_manager.current_environment

def get_settings() -> AppSettings:
    return app_settings

settings = app_settings

__all__ = [
    'config_manager',
    'get_config_manager',
    'AppSettings',
    'app_settings',
    'settings',
    'Environment',
    'get_environment',
    'get_settings',
    'SecurityConfig', 'ProcessingConfig', 'DatabaseConfig', 'LoggingConfig', 'FeatureFlags'
] 