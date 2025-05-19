"""Main Application Entrypoint for Indigenous Knowledge Research Platform.

Configures and launches the distributed research platform with 
comprehensive security, monitoring, and processing capabilities.
"""

import os
import logging
from typing import Optional

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Configuration and Environment Management
from .config import (
    config_manager, 
    get_config, 
    get_environment, 
    Environment
)

# Infrastructure Components
from .infrastructure.load_balancer import APIGateway
from .infrastructure.auth_middleware import (
    AuthenticationManager, 
    RBACMiddleware
)
from .infrastructure.health_monitoring import create_health_router

# Processing Pipeline
from .data_processing.pipeline import AnalysisPipeline

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IndigenousKnowledgePlatform:
    """Centralized application orchestrator."""
    
    def __init__(
        self, 
        environment: Optional[Environment] = None,
        processing_mode: str = 'local'
    ):
        """Initialize the Indigenous Knowledge Research Platform.
        
        Args:
            environment: Deployment environment
            processing_mode: Distributed processing configuration
        """
        # Set environment
        self.environment = environment or get_environment()
        
        # Load configurations
        self.security_config = get_config("security")
        self.processing_config = get_config("processing")
        
        # Initialize core components
        self.authentication_manager = AuthenticationManager(
            secret_key=self.security_config.secret_key,
            algorithm=self.security_config.jwt_algorithm,
            access_token_expire_minutes=self.security_config.access_token_expire_minutes
        )
        
        # Create API Gateway
        self.api_gateway = APIGateway(
            processing_mode=processing_mode,
            rate_limit_config={
                'max_requests': self.security_config.rate_limit_requests,
                'window_seconds': self.security_config.rate_limit_window
            },
            security_config={
                'allowed_origins': self.security_config.cors_allowed_origins
            }
        )
        
        # Initialize application
        self.app = self._create_application()
    
    def _create_application(self) -> FastAPI:
        """Create and configure FastAPI application."""
        app = FastAPI(
            title="Indigenous Knowledge Research Platform",
            description="Advanced distributed platform for indigenous knowledge validation",
            version="1.0.0"
        )
        
        # Configure CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[
                "http://localhost:3000",  # Default Next.js dev server
                "http://localhost:3001",  # Alternate port
                "http://localhost:3002",  # Another alternate port
                "http://localhost:3003",  # Yet another alternate port
                f"http://localhost:{os.getenv('FRONTEND_PORT', '3000')}",  # Dynamic port
                "*"  # Be cautious with this in production
            ],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Add health monitoring routes
        health_router = create_health_router()
        app.include_router(health_router, prefix="/system")
        
        # Configure Role-Based Access Control
        rbac_middleware = RBACMiddleware(
            app, 
            self.authentication_manager,
            role_permissions={
                'researcher': [
                    'read_research', 
                    'create_research'
                ],
                'admin': [
                    'read_research', 
                    'create_research', 
                    'update_research', 
                    'delete_research'
                ]
            }
        )
        app.add_middleware(rbac_middleware)
        
        # Add authentication routes
        self._add_authentication_routes(app)
        
        return app
    
    def _add_authentication_routes(self, app: FastAPI):
        """Add authentication-related routes."""
        @app.post("/token")
        async def login(username: str, password: str):
            """Generate access token for authenticated users."""
            user = await self.authentication_manager.authenticate_user(username, password)
            if not user:
                raise HTTPException(
                    status_code=401, 
                    detail="Incorrect username or password"
                )
            
            # Create access token
            access_token = self.authentication_manager.create_access_token(
                data={"sub": user.username, "role": user.role}
            )
            
            return {"access_token": access_token, "token_type": "bearer"}
    
    def run(
        self, 
        host: str = '0.0.0.0', 
        port: int = 8000
    ):
        """Run the application server."""
        logger.info(f"Starting Indigenous Knowledge Platform in {self.environment.name} environment")
        
        # Validate configuration
        if not config_manager.validate_config():
            logger.error("Configuration validation failed. Exiting.")
            return
        
        # Start server
        uvicorn.run(
            self.app, 
            host=host, 
            port=port, 
            workers=self.processing_config.max_workers
        )

def main():
    """Application entry point."""
    platform = IndigenousKnowledgePlatform(
        environment=Environment.DEVELOPMENT,
        processing_mode='local'
    )
    platform.run()

if __name__ == "__main__":
    main() 