"""Configuration for real data sources used by the NIS Protocol."""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Data source paths
SATELLITE_DATA_DIR = DATA_DIR / "satellite"
LIDAR_DATA_DIR = DATA_DIR / "lidar"
COLONIAL_TEXTS_DIR = DATA_DIR / "colonial_texts"
INDIGENOUS_MAPS_DIR = DATA_DIR / "indigenous_maps"
HISTORICAL_CACHE_DIR = DATA_DIR / "historical_cache"
INDIGENOUS_CACHE_DIR = DATA_DIR / "indigenous_cache"
ORAL_HISTORIES_DIR = DATA_DIR / "oral_histories"
OVERLAYS_DIR = DATA_DIR / "overlays"

# Output paths
FINDINGS_DIR = OUTPUTS_DIR / "findings"
LOGS_DIR = OUTPUTS_DIR / "logs"
MEMORY_DIR = OUTPUTS_DIR / "memory"

# Required file patterns for each data source
REQUIRED_FILES = {
    "satellite": [".tif", ".jp2", ".json"],  # Added .json for our data
    "lidar": [".laz", ".las", ".json"],      # Added .json for our data
    "colonial_texts": [".txt", ".csv", ".json"],
    "indigenous_maps": [".geojson", ".json"],
    "historical_cache": [".json"],
    "indigenous_cache": [".json"],
    "oral_histories": [".json", ".txt"],
    "overlays": [".tif", ".png", ".json"]    # Added .json for our data
}

def verify_data_source(source_dir: Path, required_extensions: list) -> bool:
    """Verify that a data source directory contains required file types."""
    if not source_dir.exists():
        return False
    
    # Check all files recursively
    for ext in required_extensions:
        if list(source_dir.glob(f"**/*{ext}")):
            return True
    return False

def get_data_source_status() -> dict:
    """Get the status of all data sources."""
    return {
        "satellite": verify_data_source(SATELLITE_DATA_DIR, REQUIRED_FILES["satellite"]),
        "lidar": verify_data_source(LIDAR_DATA_DIR, REQUIRED_FILES["lidar"]),
        "colonial_texts": verify_data_source(COLONIAL_TEXTS_DIR, REQUIRED_FILES["colonial_texts"]),
        "indigenous_maps": verify_data_source(INDIGENOUS_MAPS_DIR, REQUIRED_FILES["indigenous_maps"]),
        "historical_cache": verify_data_source(HISTORICAL_CACHE_DIR, REQUIRED_FILES["historical_cache"]),
        "indigenous_cache": verify_data_source(INDIGENOUS_CACHE_DIR, REQUIRED_FILES["indigenous_cache"]),
        "oral_histories": verify_data_source(ORAL_HISTORIES_DIR, REQUIRED_FILES["oral_histories"]),
        "overlays": verify_data_source(OVERLAYS_DIR, REQUIRED_FILES["overlays"])
    }

def verify_all_data_sources() -> bool:
    """Verify that all required data sources are available."""
    status = get_data_source_status()
    return all(status.values()) 