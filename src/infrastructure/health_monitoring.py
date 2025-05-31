"""Health Monitoring and System Status Tracking.

Provides comprehensive health checks, system diagnostics, 
and performance monitoring for the Indigenous Knowledge Research Platform.
"""

import os
import time
import psutil
import platform
import logging
from typing import Dict, Any, Optional

import redis
import kafka
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

# MODIFIED: Import app_settings and the global config_manager instance
from ..config import app_settings, config_manager as global_config_manager, Environment, DatabaseConfig

from ..infrastructure.distributed_processing import DistributedProcessingManager

logger = logging.getLogger(__name__)

class SystemHealth(BaseModel):
    """Comprehensive system health status."""
    status: str
    timestamp: float
    environment: str
    
    # System resources
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    
    # Service dependencies
    redis_status: bool
    kafka_status: bool
    processing_status: bool
    
    # Detailed diagnostics
    system_info: Dict[str, str]
    feature_flags: Dict[str, bool]

class HealthMonitor:
    """Centralized health monitoring and diagnostic system."""
    
    def __init__(self):
        """Initialize health monitoring system. Call startup() to initialize Dask."""
        self.distributed_manager: Optional[DistributedProcessingManager] = None
        # Use the globally imported config_manager
        self.config_manager = global_config_manager

    async def startup(self):
        """Initialize long-running resources like DistributedProcessingManager."""
        logger.info("HealthMonitor starting up...")
        self.distributed_manager = DistributedProcessingManager() # Uses settings.PROCESSING_MODE
        try:
            await self.distributed_manager.startup()
            logger.info("HealthMonitor: DistributedProcessingManager started successfully.")
        except Exception as e:
            logger.error(f"HealthMonitor: Failed to start DistributedProcessingManager: {e}")
            # Decide if this is critical. For now, HealthMonitor will continue but processing checks will fail.
            # self.distributed_manager will exist but its client/cluster might be None.

    async def shutdown(self):
        """Clean up resources, like shutting down DistributedProcessingManager."""
        logger.info("HealthMonitor shutting down...")
        if self.distributed_manager:
            try:
                await self.distributed_manager.shutdown()
                logger.info("HealthMonitor: DistributedProcessingManager shut down successfully.")
            except Exception as e:
                logger.error(f"HealthMonitor: Error shutting down DistributedProcessingManager: {e}")
        self.distributed_manager = None

    def check_redis_health(self) -> bool:
        """Check Redis connection health."""
        try:
            # Use app_settings directly or get DatabaseConfig from config_manager
            db_config = self.config_manager.get_config("database")
            if not isinstance(db_config, DatabaseConfig):
                logger.error("Redis health check: Invalid DatabaseConfig from ConfigManager")
                return False

            redis_client = redis.Redis(
                host=db_config.redis_host, # MODIFIED
                port=db_config.redis_port, # MODIFIED
                db=db_config.redis_db,     # MODIFIED
                socket_timeout=2
            )
            redis_client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
    
    def check_kafka_health(self) -> bool:
        """Check Kafka broker health."""
        try:
            # Use app_settings directly or get DatabaseConfig from config_manager
            db_config = self.config_manager.get_config("database")
            if not isinstance(db_config, DatabaseConfig):
                logger.error("Kafka health check: Invalid DatabaseConfig from ConfigManager")
                return False
                
            kafka_client = kafka.KafkaConsumer(
                bootstrap_servers=db_config.kafka_bootstrap_servers, # MODIFIED
                request_timeout_ms=2000,
                # Add other necessary Kafka consumer configs if needed for a simple health check
                # For example, if security protocols are enabled via app_settings
                # security_protocol=app_settings.kafka_security_protocol or "PLAINTEXT", 
                # ssl_cafile=app_settings.kafka_ssl_cafile,
                # etc.
            )
            kafka_client.topics()  # Attempt to list topics
            kafka_client.close() # Close the consumer
            return True
        except Exception as e:
            logger.error(f"Kafka health check failed: {e}")
            return False
    
    def get_system_resources(self) -> Dict[str, float]:
        """Retrieve current system resource utilization."""
        return {
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent
        }
    
    def get_system_info(self) -> Dict[str, str]:
        """Collect detailed system information."""
        return {
            "os": platform.system(),
            "os_version": platform.version(),
            "python_version": platform.python_version(),
            "processor": platform.processor(),
            "machine": platform.machine()
        }
    
    def check_processing_health(self) -> bool:
        """Check distributed processing system health."""
        if not self.distributed_manager or not self.distributed_manager.client:
            logger.warning("Processing health check: DistributedProcessingManager or Dask client not available.")
            return False
        try:
            cluster_status = self.distributed_manager.get_cluster_status()
            # Check if status is 'running' and there's at least one worker
            return cluster_status.get('status') == 'running' and cluster_status.get('workers', 0) > 0
        except Exception as e:
            logger.error(f"Processing health check failed: {e}")
            return False
    
    def generate_health_report(self) -> SystemHealth:
        """Generate comprehensive system health report."""
        resources = self.get_system_resources()
        
        # Access feature flags through app_settings
        current_feature_flags = {
            "distributed_processing": app_settings.processing.mode != "local", # Example, adjust as per actual flag
            "caching": True, # Placeholder, link to actual app_settings if available
            "event_logging": True, # Placeholder
            "performance_tracking": True, # Placeholder
            "gpt_vision": app_settings.OPENAI_API_KEY is not None, # Example: simple check if API key is set
            "web_search": True # Placeholder
        }

        redis_ok = self.check_redis_health()
        kafka_ok = self.check_kafka_health()
        processing_ok = self.check_processing_health()

        return SystemHealth(
            status="healthy" if all([
                redis_ok,
                kafka_ok, 
                processing_ok 
            ]) else "degraded",
            timestamp=time.time(),
            environment=self.config_manager.current_environment.value, # MODIFIED to use .value for Enum member
            
            cpu_usage=resources['cpu_usage'],
            memory_usage=resources['memory_usage'],
            disk_usage=resources['disk_usage'],
            
            redis_status=redis_ok,
            kafka_status=kafka_ok, 
            processing_status=processing_ok, 
            
            system_info=self.get_system_info(),
            feature_flags=current_feature_flags
        )

def create_health_router() -> APIRouter:
    """Create FastAPI router for health checks.
       HealthMonitor instance is expected to be in request.app.state.health_monitor.
    """
    router = APIRouter()
    
    # Dependency to get HealthMonitor from app.state
    async def get_health_monitor(request: Request) -> HealthMonitor:
        if not hasattr(request.app.state, 'health_monitor') or request.app.state.health_monitor is None:
            logger.error("HealthMonitor not found in app.state. Check lifespan initialization.")
            raise HTTPException(status_code=500, detail="HealthMonitor not initialized")
        return request.app.state.health_monitor

    @router.get("/health", response_model=SystemHealth)
    async def health_check(health_monitor: HealthMonitor = Depends(get_health_monitor)):
        """Comprehensive system health check endpoint."""
        try:
            health_report = health_monitor.generate_health_report()
            if health_report.status == "healthy":
                return health_report
            else:
                raise HTTPException(
                    status_code=503, 
                    detail="Service Unavailable: System is in a degraded state"
                )
        except Exception as e:
            logger.error(f"Health check failed: {e}", exc_info=True) # Add exc_info for more details
            raise HTTPException(
                status_code=500, 
                detail="Internal Server Error during health check"
            )
    
    @router.get("/diagnostics")
    async def system_diagnostics(health_monitor: HealthMonitor = Depends(get_health_monitor)):
        """Detailed system diagnostics endpoint."""
        try:
            health_report = health_monitor.generate_health_report()
            return {
                "health_report": health_report.dict(),
                "detailed_system_info": health_monitor.get_system_info(),
                "resource_usage": health_monitor.get_system_resources()
            }
        except Exception as e:
            logger.error(f"Diagnostics retrieval failed: {e}", exc_info=True) # Add exc_info
            raise HTTPException(
                status_code=500, 
                detail="Could not retrieve system diagnostics"
            )
    
    return router 