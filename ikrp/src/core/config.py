from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    """
    Application configuration management
    Supports environment-specific configurations
    """
    # Server Configuration
    APP_NAME: str = "Indigenous Knowledge Research Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # Authentication Settings
    JWT_SECRET_KEY: str = "development_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Configuration
    DATABASE_URL: Optional[str] = None
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: List[str] = ["localhost:9092"]
    
    # Research Platform Specific
    RESEARCH_DATA_PATH: str = "/data/research"
    MAX_CONCURRENT_AGENTS: int = 5
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    
    # Security Settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    class Config:
        """
        Pydantic settings configuration
        Allows loading from .env file and environment variables
        """
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra environment variables

# Create a singleton settings instance
settings = Settings()

def get_settings() -> Settings:
    """
    Retrieve application settings
    
    Returns:
        Settings: Configured application settings
    """
    return settings 