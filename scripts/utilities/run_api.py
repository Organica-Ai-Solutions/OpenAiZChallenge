#!/usr/bin/env python

"""Script to run the NIS Protocol API server."""

import uvicorn
import os
from pathlib import Path
import logging

# Configure logging
log_dir = Path("outputs/logs")
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_dir / "api.log"),
        logging.StreamHandler()
    ]
)

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("outputs/findings", exist_ok=True)
    os.makedirs("outputs/memory", exist_ok=True)
    
    # Run the API server
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"Starting NIS Protocol API server on {host}:{port}")
    uvicorn.run("api.main:app", host=host, port=port, reload=True) 