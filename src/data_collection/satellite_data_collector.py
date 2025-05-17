from typing import Dict, Optional, Tuple
import os
from datetime import datetime, timedelta
from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
import rasterio
import numpy as np
from pathlib import Path
import logging
from ..config import SENTINEL_USERNAME, SENTINEL_PASSWORD

logger = logging.getLogger(__name__)

class SatelliteDataCollector:
    def __init__(self):
        """Initialize the Sentinel-2 data collector."""
        self.api = SentinelAPI(
            SENTINEL_USERNAME,
            SENTINEL_PASSWORD,
            'https://apihub.copernicus.eu/apihub'
        )
        
        # Configure data paths
        self.data_dir = Path('data/satellite')
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure Sentinel-2 search parameters
        self.search_params = {
            'platformname': 'Sentinel-2',
            'producttype': 'S2MSI2A',  # Level-2A products (surface reflectance)
            'cloudcoverpercentage': (0, 30)  # Max 30% cloud cover
        }
    
    async def get_satellite_data(
        self,
        lat: float,
        lon: float,
        date_range: Optional[Tuple[datetime, datetime]] = None
    ) -> Dict:
        """
        Fetch Sentinel-2 satellite data for the given coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            date_range: Optional tuple of (start_date, end_date)
            
        Returns:
            Dictionary containing the processed satellite data
        """
        try:
            # Set default date range if not provided (last 30 days)
            if date_range is None:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=30)
            else:
                start_date, end_date = date_range
            
            # Create bounding box around coordinates
            bbox = self._create_bbox(lat, lon, size_km=10)
            
            # Search for Sentinel-2 products
            products = self.api.query(
                bbox,
                date=(start_date, end_date),
                **self.search_params
            )
            
            if not products:
                logger.warning(f"No Sentinel-2 products found for coordinates {lat}, {lon}")
                return {}
            
            # Get the best product (least cloud cover)
            product_id = self._get_best_product(products)
            
            # Download if not already available
            product_path = self.data_dir / f"{product_id}.zip"
            if not product_path.exists():
                self.api.download(product_id, str(self.data_dir))
            
            # Process the satellite data
            data = self._process_satellite_data(product_path, lat, lon)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching satellite data: {str(e)}")
            return {}
    
    def _create_bbox(
        self,
        lat: float,
        lon: float,
        size_km: float = 10
    ) -> str:
        """Create a WKT bounding box around the coordinates."""
        # Convert km to degrees (approximate)
        size_deg = size_km / 111  # 1 degree ≈ 111 km
        
        bbox = {
            'type': 'Polygon',
            'coordinates': [[
                [lon - size_deg, lat - size_deg],
                [lon + size_deg, lat - size_deg],
                [lon + size_deg, lat + size_deg],
                [lon - size_deg, lat + size_deg],
                [lon - size_deg, lat - size_deg]
            ]]
        }
        
        return geojson_to_wkt(bbox)
    
    def _get_best_product(self, products: Dict) -> str:
        """Get the product ID with the lowest cloud cover."""
        best_product = None
        min_cloud_cover = 100
        
        for product_id, product_info in products.items():
            cloud_cover = product_info['cloudcoverpercentage']
            if cloud_cover < min_cloud_cover:
                min_cloud_cover = cloud_cover
                best_product = product_id
        
        return best_product
    
    def _process_satellite_data(
        self,
        product_path: Path,
        lat: float,
        lon: float
    ) -> Dict:
        """
        Process the downloaded satellite data.
        
        This is a simplified version. In practice, you would:
        1. Extract the ZIP file
        2. Read the relevant bands (e.g., RGB, NIR)
        3. Apply atmospheric corrections
        4. Calculate vegetation indices (e.g., NDVI)
        5. Crop to the area of interest
        """
        try:
            # Mock processing for now
            # In practice, you would use rasterio to read and process the data
            processed_data = {
                'coordinates': (lat, lon),
                'timestamp': datetime.now().isoformat(),
                'bands': {
                    'red': np.random.rand(100, 100),  # Mock 100x100 pixel data
                    'green': np.random.rand(100, 100),
                    'blue': np.random.rand(100, 100),
                    'nir': np.random.rand(100, 100)
                },
                'cloud_cover': 15.5,  # Mock cloud cover percentage
                'resolution': 10  # 10m resolution
            }
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing satellite data: {str(e)}")
            return {} 