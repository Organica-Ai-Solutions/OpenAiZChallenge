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
from .infrastructure.load_balancer import APIGateway
from .infrastructure.auth_middleware import (
    AuthenticationManager, 
    RBACMiddleware
)
from .infrastructure.health_monitoring import create_health_router, HealthMonitor
from .infrastructure.redis_client import get_redis_client, RedisClient

# Processing Pipeline
from .data_processing.pipeline import AnalysisPipeline

# Monitoring
from .monitoring.statistics import StatisticsCollector

# Import API routers
from api.analyze import app as analyze_router
from api.batch import app as batch_router
from api.statistics import app as statistics_router
from ikrp.src.api.research import router as research_router
from ikrp.src.api.agents import router as agents_router

# Logging Configuration
logging.basicConfig(
    level=settings.LOG_LEVEL.upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifespan events for resource initialization and cleanup."""
    logger.info("Application startup: Initializing resources...")
    
    # Initialize Redis client
    try:
        redis_client_instance = get_redis_client()
        app.state.redis = redis_client_instance
        logger.info("Redis client initialized and attached to app.state.redis")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize Redis: {e}", exc_info=True)
        app.state.redis = None

    # Initialize StatisticsCollector
    if app.state.redis:
        stats_collector_instance = StatisticsCollector() 
        app.state.stats_collector = stats_collector_instance
        logger.info("StatisticsCollector initialized and attached to app.state.stats_collector")
    else:
        app.state.stats_collector = None
        logger.warning("StatisticsCollector not initialized as Redis is unavailable.")

    # Initialize HealthMonitor (which starts DistributedProcessingManager)
    health_monitor_instance = HealthMonitor()
    try:
        await health_monitor_instance.startup() # This will start Dask
        app.state.health_monitor = health_monitor_instance
        logger.info("HealthMonitor initialized and Dask started, attached to app.state.health_monitor")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize HealthMonitor or Dask: {e}", exc_info=True)
        app.state.health_monitor = None # Indicate failure
        # Potentially re-raise or handle if Dask/HealthMonitor is critical for app function

    # Initialize AnalysisPipeline (if it needs specific startup/shutdown, manage it here too)
    # For now, assuming it can be instantiated directly if needed by routers/dependencies
    # app.state.analysis_pipeline = AnalysisPipeline() 
    # logger.info("AnalysisPipeline initialized.")

    yield # Application is ready to serve requests

    logger.info("Application shutdown: Cleaning up resources...")
    if hasattr(app.state, 'health_monitor') and app.state.health_monitor:
        try:
            await app.state.health_monitor.shutdown() # This will shut down Dask
        except Exception as e:
            logger.error(f"Error shutting down HealthMonitor/Dask: {e}", exc_info=True)
    
    if hasattr(app.state, 'redis') and app.state.redis:
        try:
            app.state.redis.close()
            logger.info("Redis client connection closed.")
        except Exception as e:
            logger.error(f"Error closing Redis client: {e}", exc_info=True)
    
    logger.info("Application shutdown complete.")

# Create FastAPI app with lifespan manager
app = FastAPI(
    title="Indigenous Knowledge Research Platform", # Restore original title
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

# Add health monitoring routes
health_router_instance = create_health_router() 
app.include_router(health_router_instance, prefix="/system", tags=["System"])

# Include other API routers
app.include_router(analyze_router, prefix="", tags=["Analysis"])
app.include_router(batch_router, prefix="/batch", tags=["Batch Processing"])
app.include_router(statistics_router, prefix="", tags=["Statistics"])
app.include_router(research_router, prefix="/research", tags=["IKRP Research"])
app.include_router(agents_router, prefix="/agents", tags=["IKRP Agents"])

# TODO: Setup AuthenticationManager and RBACMiddleware if needed and if they are async-compatible
# auth_manager = AuthenticationManager(secret_key=settings.SECRET_KEY)
# app.add_middleware(RBACMiddleware, permission_map=auth_manager.get_permission_map())


if __name__ == "__main__":
    logger.info(f"Starting server on http://{settings.API_HOST}:{settings.API_PORT}") # Restore original log message
    uvicorn.run("src.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)