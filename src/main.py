"""Main Application Entrypoint for Indigenous Knowledge Research Platform.

Configures and launches the distributed research platform with 
comprehensive security, monitoring, and processing capabilities.
"""

import os
import logging
from typing import Optional

import uvicorn
from fastapi import FastAPI, Request, Form, HTTPException
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

# Import API routers
from api.analyze import app as analyze_router
from api.batch import app as batch_router
from api.statistics import app as statistics_router
from ikrp.src.api.research import router as research_router
from ikrp.src.api.agents import router as agents_router

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

        # Include other API routers
        app.include_router(analyze_router, prefix="") # Assuming /analyze is at root
        app.include_router(batch_router, prefix="/batch")
        app.include_router(statistics_router, prefix="/statistics")
        app.include_router(research_router, prefix="/research")
        app.include_router(agents_router, prefix="/agents")

        # Configure Role-Based Access Control
        # app.add_middleware(
        #     RBACMiddleware,
        #     auth_manager=self.authentication_manager,
        #     role_permissions={
        #         'researcher': [
        #             'read_research',
        #             'create_research'
        #         ],
        #         'admin': [
        #             'read_research',
        #             'create_research',
        #             'update_research',
        #             'delete_research'
        #         ]
        #     }
        # )

        # Add authentication routes
        # self._add_authentication_routes(app)

        return app

    def _add_authentication_routes(self, app: FastAPI):
        """Add authentication-related routes."""
        # @app.post("/token")
        # async def login(username: str = Form(...), password: str = Form(...)):
        #     """Generate access token for authenticated users."""
        #     user = await self.authentication_manager.authenticate_user(username, password)
        #     if not user:
        #         raise HTTPException(
        #             status_code=401,
        #             detail="Incorrect username or password"
        #         )

        #     # Create access token
        #     access_token = self.authentication_manager.create_access_token(
        #         data={"sub": user.username, "role": user.role}
        #     )

        #     return {"access_token": access_token, "token_type": "bearer"}

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

# Instantiate the platform and expose the FastAPI app for Uvicorn
platform = IndigenousKnowledgePlatform(
    environment=get_environment(), # Use get_environment() for flexibility
    processing_mode=os.getenv("PROCESSING_MODE", "local") # Get mode from env or default
)
app = platform.app

# Optional: Keep main() for direct execution if needed, but ensure it doesn't conflict with Docker CMD
# For instance, the main() here would try to run uvicorn again if not careful.
# If Docker's CMD is the primary way to run, this main() might only be for local non-Docker testing.
def main_cli(): # Renamed to avoid confusion
    """Application entry point for direct CLI execution (e.g., local testing)."""
    # The platform is already instantiated globally, so platform.run() can be called
    # But Uvicorn is started by Docker CMD, so this might be redundant or for a different purpose.
    logger.info("Attempting to run platform via main_cli(). Note: Docker CMD is the primary runner.")
    # To avoid running uvicorn twice if this script is imported by the Docker CMD's uvicorn:
    # We might not want to call platform.run() here if uvicorn is started by Docker CMD.
    # For now, let's assume this is for optional direct script execution.
    platform.run() # This will start another Uvicorn if not careful with how the script is invoked.

if __name__ == "__main__":
    # This block will execute if you run `python src/main.py` directly.
    # Docker's uvicorn command will import `src.main` and look for `app`.
    # It will NOT run this __main__ block when importing.
    logger.info("src/main.py executed directly. Starting server via main_cli().")
    main_cli()