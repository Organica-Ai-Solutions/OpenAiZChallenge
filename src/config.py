"""Configuration Management for Indigenous Knowledge Research Platform.

Provides centralized configuration management with environment-specific settings,
feature flags, and secure credential management.
"""

import os
import logging
from typing import Dict, Any, Optional
from enum import Enum, auto

import yaml
from pydantic import BaseModel, Field, ValidationError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SENTINEL_USERNAME = os.getenv('SENTINEL_USERNAME')
SENTINEL_PASSWORD = os.getenv('SENTINEL_PASSWORD')

# Data paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
OUTPUTS_DIR = BASE_DIR / 'outputs'

# Create data directories
LIDAR_DATA_DIR = DATA_DIR / 'lidar'
SATELLITE_DATA_DIR = DATA_DIR / 'satellite'
COLONIAL_TEXTS_DIR = DATA_DIR / 'colonial_texts'
OVERLAYS_DIR = DATA_DIR / 'overlays'

# Create output directories
FINDINGS_DIR = OUTPUTS_DIR / 'findings'
LOGS_DIR = OUTPUTS_DIR / 'logs'
MEMORY_DIR = OUTPUTS_DIR / 'memory'

# Ensure directories exist
for directory in [LIDAR_DATA_DIR, SATELLITE_DATA_DIR, COLONIAL_TEXTS_DIR, OVERLAYS_DIR,
                 FINDINGS_DIR, LOGS_DIR, MEMORY_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Service configurations
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))

KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC_PREFIX = os.getenv('KAFKA_TOPIC_PREFIX', 'nis-protocol')

# LIDAR Data credentials
LIDAR_USERNAME = os.getenv('LIDAR_USERNAME')
LIDAR_PASSWORD = os.getenv('LIDAR_PASSWORD')

# Validate required credentials
def validate_credentials():
    """Validate that all required credentials are set."""
    missing_credentials = []
    
    if not SENTINEL_USERNAME or not SENTINEL_PASSWORD:
        missing_credentials.append("Sentinel-2 Copernicus Open Access Hub")
    
    if not LIDAR_USERNAME or not LIDAR_PASSWORD:
        missing_credentials.append("LIDAR data source")
    
    if missing_credentials:
        print("Warning: Missing credentials for:")
        for source in missing_credentials:
            print(f"- {source}")
        print("\nPlease set the required credentials in your .env file.")
        return False
    
    return True

# Create required directories
def setup_directories():
    """Create required directories if they don't exist."""
    os.makedirs(LIDAR_DATA_DIR, exist_ok=True)
    os.makedirs(SATELLITE_DATA_DIR, exist_ok=True)
    os.makedirs(COLONIAL_TEXTS_DIR, exist_ok=True)
    os.makedirs(OVERLAYS_DIR, exist_ok=True)
    os.makedirs(FINDINGS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)
    os.makedirs(MEMORY_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUTS_DIR, 'satellite'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUTS_DIR, 'lidar'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUTS_DIR, 'combined'), exist_ok=True)

class Environment(Enum):
    """Supported deployment environments."""
    LOCAL = auto()
    DEVELOPMENT = auto()
    STAGING = auto()
    PRODUCTION = auto()

class SecurityConfig(BaseModel):
    """Security configuration settings."""
    secret_key: str = Field(..., env="SECRET_KEY")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_allowed_origins: list = ["*"]
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

class ProcessingConfig(BaseModel):
    """Distributed processing configuration."""
    mode: str = os.getenv("PROCESSING_MODE", "local")
    max_workers: int = os.getenv("MAX_WORKERS", 4)
    memory_limit: str = os.getenv("MEMORY_LIMIT", "4GB")
    
    # Feature flags for processing components
    enable_satellite_processing: bool = True
    enable_lidar_processing: bool = True
    enable_historical_text_processing: bool = True
    enable_indigenous_map_processing: bool = True

class DatabaseConfig(BaseModel):
    """Database connection configurations."""
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", 6379))
    redis_db: int = int(os.getenv("REDIS_DB", 0))
    
    kafka_bootstrap_servers: list = os.getenv("KAFKA_SERVERS", "localhost:9092").split(",")
    kafka_topics: Dict[str, str] = {
        "analysis_events": "nis.analysis.events",
        "error_events": "nis.error.events"
    }

class LoggingConfig(BaseModel):
    """Logging configuration."""
    level: str = os.getenv("LOG_LEVEL", "INFO")
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    file_path: Optional[str] = os.getenv("LOG_FILE_PATH")

class MLConfig(BaseModel):
    """Machine Learning model configurations."""
    vision_model_path: str = os.getenv("VISION_MODEL_PATH", "")
    reasoning_model_path: str = os.getenv("REASONING_MODEL_PATH", "")
    confidence_threshold: float = float(os.getenv("ML_CONFIDENCE_THRESHOLD", 0.7))

class FeatureFlags(BaseModel):
    """Application-wide feature flags."""
    enable_distributed_processing: bool = True
    enable_caching: bool = True
    enable_event_logging: bool = True
    enable_performance_tracking: bool = True

class ConfigManager:
    """Centralized configuration management."""
    
    _instance = None
    
    def __new__(cls, environment: Optional[Environment] = None):
        """Singleton implementation."""
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance._initialize(environment)
        return cls._instance
    
    def _initialize(self, environment: Optional[Environment] = None):
        """Initialize configuration based on environment."""
        self.environment = environment or self._detect_environment()
        
        # Load base configuration
        self.security = SecurityConfig()
        self.processing = ProcessingConfig()
        self.database = DatabaseConfig()
        self.logging = LoggingConfig()
        self.ml = MLConfig()
        self.features = FeatureFlags()
        
        # Configure logging
        self._configure_logging()
    
    @classmethod
    def _detect_environment(cls) -> Environment:
        """Detect current deployment environment."""
        env_name = os.getenv("NIS_ENV", "local").upper()
        return Environment[env_name]
    
    def _configure_logging(self):
        """Configure logging based on environment settings."""
        log_level = getattr(logging, self.logging.level.upper())
        logging.basicConfig(
            level=log_level,
            format=self.logging.format,
            filename=self.logging.file_path
        )
    
    def get_config(self, config_type: str) -> BaseModel:
        """Retrieve specific configuration."""
        config_map = {
            "security": self.security,
            "processing": self.processing,
            "database": self.database,
            "logging": self.logging,
            "ml": self.ml,
            "features": self.features
        }
        return config_map.get(config_type)
    
    def export_config(self) -> Dict[str, Any]:
        """Export current configuration as a dictionary."""
        return {
            "environment": self.environment.name,
            "security": self.security.dict(),
            "processing": self.processing.dict(),
            "database": self.database.dict(),
            "logging": self.logging.dict(),
            "ml": self.ml.dict(),
            "features": self.features.dict()
        }
    
    def validate_config(self) -> bool:
        """Validate all configurations."""
        try:
            # Validate each configuration section
            SecurityConfig(**self.security.dict())
            ProcessingConfig(**self.processing.dict())
            DatabaseConfig(**self.database.dict())
            LoggingConfig(**self.logging.dict())
            MLConfig(**self.ml.dict())
            FeatureFlags(**self.features.dict())
            return True
        except ValidationError as e:
            logging.error(f"Configuration validation failed: {e}")
            return False

# Global configuration manager
config_manager = ConfigManager()

# Convenience functions for accessing configurations
def get_config(config_type: str) -> BaseModel:
    """Get configuration by type."""
    return config_manager.get_config(config_type)

def get_environment() -> Environment:
    """Get current deployment environment."""
    return config_manager.environment 