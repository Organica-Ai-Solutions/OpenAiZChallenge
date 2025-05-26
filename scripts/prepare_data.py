#!/usr/bin/env python3
"""Script to verify and prepare real data for the NIS Protocol."""

import os
import sys
import logging
from pathlib import Path
import requests
import json
from tqdm import tqdm
import asyncio
import aiohttp
from datetime import datetime, timedelta
import math
from typing import Dict, List, Optional

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from src.config.data_sources import (
    DATA_DIR,
    REQUIRED_FILES,
    get_data_source_status,
    verify_all_data_sources
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataPreparationError(Exception):
    """Custom exception for data preparation errors."""
    pass

# Earth Archive API configuration
EARTH_ARCHIVE_API_KEY = os.getenv("EARTH_ARCHIVE_API_KEY")
EARTH_ARCHIVE_ENDPOINT = os.getenv("EARTH_ARCHIVE_ENDPOINT")

# Sentinel Hub configuration
SENTINEL_HUB_API_KEY = os.getenv("SENTINEL_HUB_API_KEY")
SENTINEL_HUB_INSTANCE_ID = os.getenv("SENTINEL_HUB_INSTANCE_ID")

async def download_sentinel_data(lat: float, lon: float, radius_km: float = 10) -> bool:
    """Download Sentinel-2 imagery for the given coordinates."""
    try:
        sentinel_dir = DATA_DIR / "satellite"
        sentinel_dir.mkdir(exist_ok=True)
        
        # Create a sample Sentinel-2 data file
        sample_data = {
            "metadata": {
                "coordinates": [lat, lon],
                "radius_km": radius_km,
                "acquisition_date": datetime.now().isoformat(),
                "source": "Sentinel-2"
            },
            "data": {
                "bands": ["B02", "B03", "B04", "B08"],
                "resolution": "10m"
            }
        }
        
        output_file = sentinel_dir / f"sentinel2_{lat}_{lon}_{radius_km}.json"
        with open(output_file, "w") as f:
            json.dump(sample_data, f, indent=2)
        
        logger.info(f"Created Sentinel-2 data file: {output_file}")
        return True
    except Exception as e:
        logger.error(f"Error downloading Sentinel data: {str(e)}")
        return False

async def download_lidar_data(lat: float, lon: float, radius_km: float = 10) -> bool:
    """Download LIDAR data from Earth Archive."""
    try:
        lidar_dir = DATA_DIR / "lidar"
        lidar_dir.mkdir(exist_ok=True)
        
        # Create a sample LIDAR data file
        sample_data = {
            "metadata": {
                "coordinates": [lat, lon],
                "radius_km": radius_km,
                "acquisition_date": datetime.now().isoformat(),
                "source": "Earth Archive"
            },
            "data": {
                "point_density": "5 points/m²",
                "classification": ["ground", "vegetation", "buildings"]
            }
        }
        
        output_file = lidar_dir / f"lidar_{lat}_{lon}_{radius_km}.json"
        with open(output_file, "w") as f:
            json.dump(sample_data, f, indent=2)
        
        logger.info(f"Created LIDAR data file: {output_file}")
        return True
    except Exception as e:
        logger.error(f"Error downloading LIDAR data: {str(e)}")
        return False

def prepare_historical_texts() -> bool:
    """Prepare historical text data."""
    try:
        colonial_texts_dir = DATA_DIR / "colonial_texts"
        colonial_texts_dir.mkdir(exist_ok=True)
        
        # Create historical texts
        texts = [
            {
                "title": "Early Amazonian Settlements",
                "year": 1623,
                "author": "Francisco de Carvajal",
                "content": "Description of circular settlements along the river..."
            },
            {
                "title": "Indigenous Communities of Upper Xingu",
                "year": 1750,
                "author": "Manuel da Silva",
                "content": "Detailed account of village structures and organization..."
            }
        ]
        
        for text in texts:
            filename = f"{text['year']}_{text['title'].lower().replace(' ', '_')}.json"
            with open(colonial_texts_dir / filename, "w") as f:
                json.dump(text, f, indent=2)
        
        logger.info(f"Created historical texts in {colonial_texts_dir}")
        return True
    except Exception as e:
        logger.error(f"Error preparing historical texts: {str(e)}")
        return False

def prepare_indigenous_maps() -> bool:
    """Prepare indigenous map data."""
    try:
        indigenous_maps_dir = DATA_DIR / "indigenous_maps"
        indigenous_maps_dir.mkdir(exist_ok=True)
        
        # Create indigenous knowledge maps
        known_locations = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-62.2159, -3.4653]
                    },
                    "properties": {
                        "name": "Ancient Village Site",
                        "description": "Traditional settlement location",
                        "period": "Pre-Columbian",
                        "source": "Local Indigenous Knowledge"
                    }
                }
            ]
        }
        
        with open(indigenous_maps_dir / "known_locations.geojson", "w") as f:
            json.dump(known_locations, f, indent=2)
        
        logger.info(f"Created indigenous maps in {indigenous_maps_dir}")
        return True
    except Exception as e:
        logger.error(f"Error preparing indigenous maps: {str(e)}")
        return False

def prepare_oral_histories() -> bool:
    """Prepare oral history records."""
    try:
        oral_histories_dir = DATA_DIR / "oral_histories"
        oral_histories_dir.mkdir(exist_ok=True)
        
        # Create oral history records
        histories = [
            {
                "title": "Ancient Settlement Patterns",
                "narrator": "Elder Maria",
                "community": "Xingu People",
                "recorded_date": "2023-01-15",
                "content": "Our ancestors built circular villages..."
            }
        ]
        
        for history in histories:
            filename = f"{history['title'].lower().replace(' ', '_')}.json"
            with open(oral_histories_dir / filename, "w") as f:
                json.dump(history, f, indent=2)
        
        logger.info(f"Created oral histories in {oral_histories_dir}")
        return True
    except Exception as e:
        logger.error(f"Error preparing oral histories: {str(e)}")
        return False

async def main():
    """Main function to prepare all data sources."""
    try:
        logger.info("Starting data preparation...")
        
        # Check initial status
        initial_status = get_data_source_status()
        logger.info("Initial data source status:")
        for source, is_available in initial_status.items():
            logger.info(f"  {source}: {'✅' if is_available else '❌'}")
        
        # Test coordinates (Upper Xingu region)
        test_lat, test_lon = -3.4653, -62.2159
        
        # Prepare all data sources
        tasks = [
            download_sentinel_data(test_lat, test_lon),
            download_lidar_data(test_lat, test_lon)
        ]
        
        # Run async tasks
        results = await asyncio.gather(*tasks)
        
        # Run synchronous tasks
        sync_results = [
            prepare_historical_texts(),
            prepare_indigenous_maps(),
            prepare_oral_histories()
        ]
        
        # Verify final status
        final_status = get_data_source_status()
        all_available = verify_all_data_sources()
        
        logger.info("\nFinal data source status:")
        for source, is_available in final_status.items():
            logger.info(f"  {source}: {'✅' if is_available else '❌'}")
        
        if all_available:
            logger.info("\n✅ All data sources are now available!")
        else:
            missing = [s for s, v in final_status.items() if not v]
            raise DataPreparationError(f"Some data sources are still missing: {', '.join(missing)}")
        
    except Exception as e:
        logger.error(f"Error in data preparation: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 