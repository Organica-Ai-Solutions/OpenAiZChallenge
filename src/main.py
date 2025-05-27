"""Main Application Entrypoint for Indigenous Knowledge Research Platform.

Configures and launches the distributed research platform with 
comprehensive security, monitoring, and processing capabilities.
"""

import os
import logging
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Configuration and Environment Management
from .config import (
    settings, # Use the global settings instance
    get_config, 
    get_environment, 
    Environment,
    config_manager
)

# Infrastructure Components
# from .infrastructure.load_balancer import APIGateway 
# from .infrastructure.auth_middleware import (
#     AuthenticationManager, 
#     RBACMiddleware
# )
from .infrastructure.health_monitoring import create_health_router # Keep this for the simple health route
from .infrastructure.redis_client import get_redis_client, RedisClient # Uncomment for lifespan

# Processing Pipeline
# from .data_processing.pipeline import AnalysisPipeline

# Monitoring
from .monitoring.statistics import StatisticsCollector # Uncomment for lifespan

# Import API routers
# from api.analyze import app as analyze_router
# from api.batch import app as batch_router
# from api.statistics import app as statistics_router
# from ikrp.src.api.research import router as research_router
# from ikrp.src.api.agents import router as agents_router

# Logging Configuration
logging.basicConfig(
    level=settings.LOG_LEVEL.upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifespan events for resource initialization and cleanup."""
    logger.info("Application startup: Initializing resources (Redis, StatsCollector)...")
    # Initialize Redis client first as other components might depend on it
    try:
        redis_client = get_redis_client() # This will now use the correct settings
        app.state.redis = redis_client
        logger.info("Redis client initialized and attached to app.state.redis")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize Redis during application startup: {e}")
        app.state.redis = None # Indicate Redis is not available

    # Initialize StatisticsCollector, it should use the get_redis_client which is now settings-aware
    if app.state.redis: # Only initialize if Redis is available
        stats_collector = StatisticsCollector() 
        app.state.stats_collector = stats_collector
        logger.info("StatisticsCollector initialized and attached to app.state.stats_collector")
    else:
        app.state.stats_collector = None
        logger.warning("StatisticsCollector not initialized as Redis is unavailable.")
    
    yield # Application is ready to serve requests

    logger.info("Application shutdown: Cleaning up resources (Redis)...")
    if app.state.redis:
        app.state.redis.close()
        logger.info("Redis client connection closed.")

# Create FastAPI app with lifespan manager
app = FastAPI(
    title="Indigenous Knowledge Research Platform - Test 3", # Updated title
    description="Advanced distributed platform for indigenous knowledge validation",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS (Uncommented)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add health monitoring routes (using the simplified version from health_monitoring.py)
health_router = create_health_router() 
app.include_router(health_router, prefix="/system")

# Include other API routers (Commented out)
# app.include_router(analyze_router, prefix="")
# app.include_router(batch_router, prefix="/batch")
# app.include_router(statistics_router, prefix="")
# app.include_router(research_router, prefix="/research")
# app.include_router(agents_router, prefix="/agents")


if __name__ == "__main__":
    logger.info(f"Starting server (Test 3) directly on http://{settings.API_HOST}:{settings.API_PORT}")
    uvicorn.run("src.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)