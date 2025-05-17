import numpy as np
import rasterio
from rasterio.windows import Window
from sentinelsat import SentinelAPI
from datetime import datetime, timedelta
import os
from pathlib import Path
import logging
from typing import Optional, Tuple, Dict

logger = logging.getLogger(__name__)

class SatelliteDataCollector:
    def __init__(self):
        # Initialize Sentinel API client
        self.api = SentinelAPI(
            os.getenv('COPERNICUS_USER'),
            os.getenv('COPERNICUS_PASS'),
            'https://scihub.copernicus.eu/dhus'
        )
        
        # Create cache directory
        self.cache_dir = Path("data/satellite_cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    async def get_satellite_data(
        self,
        lat: float,
        lon: float,
        size_km: float = 10.0,
        max_cloud_cover: int = 20,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> np.ndarray:
        """
        Fetch satellite imagery for the given coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            size_km: Size of the area to fetch in kilometers
            max_cloud_cover: Maximum cloud cover percentage
            start_date: Start date for imagery search
            end_date: End date for imagery search
            
        Returns:
            np.ndarray: Satellite imagery data
        """
        try:
            # Set default date range if not provided
            if not end_date:
                end_date = datetime.now()
            if not start_date:
                start_date = end_date - timedelta(days=30)
            
            # Calculate bounding box
            bbox = self._calculate_bbox(lat, lon, size_km)
            
            # Check cache first
            cached_data = self._check_cache(lat, lon, size_km)
            if cached_data is not None:
                return cached_data
            
            # Query Sentinel-2 data
            products = self.api.query(
                area=bbox,
                date=(start_date, end_date),
                platformname='Sentinel-2',
                cloudcoverpercentage=(0, max_cloud_cover)
            )
            
            if not products:
                logger.warning(f"No Sentinel-2 data found for coordinates {lat}, {lon}")
                return None
            
            # Get the best product (least cloud cover)
            best_product = self._select_best_product(products)
            
            # Download and process the data
            data = await self._download_and_process(best_product, bbox)
            
            # Cache the results
            self._cache_data(lat, lon, size_km, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching satellite data for {lat}, {lon}: {str(e)}")
            raise
    
    def _calculate_bbox(self, lat: float, lon: float, size_km: float) -> Dict:
        """Calculate bounding box for the given coordinates and size."""
        # Approximate degrees per km at the equator
        deg_per_km = 1/111.32
        
        # Adjust for latitude
        lat_deg = size_km * deg_per_km
        lon_deg = size_km * deg_per_km / np.cos(np.radians(lat))
        
        return {
            'lon_min': lon - lon_deg/2,
            'lon_max': lon + lon_deg/2,
            'lat_min': lat - lat_deg/2,
            'lat_max': lat + lat_deg/2
        }
    
    def _check_cache(
        self,
        lat: float,
        lon: float,
        size_km: float
    ) -> Optional[np.ndarray]:
        """Check if data exists in cache."""
        cache_file = self.cache_dir / f"sentinel_{lat}_{lon}_{size_km}.npy"
        if cache_file.exists():
            return np.load(cache_file)
        return None
    
    def _cache_data(
        self,
        lat: float,
        lon: float,
        size_km: float,
        data: np.ndarray
    ) -> None:
        """Cache the downloaded data."""
        cache_file = self.cache_dir / f"sentinel_{lat}_{lon}_{size_km}.npy"
        np.save(cache_file, data)
    
    def _select_best_product(self, products: Dict) -> Dict:
        """Select the best product based on cloud cover and date."""
        return min(
            products.items(),
            key=lambda x: (x[1]['cloudcoverpercentage'], -x[1]['ingestiondate'].timestamp())
        )[1]
    
    async def _download_and_process(
        self,
        product: Dict,
        bbox: Dict
    ) -> np.ndarray:
        """Download and process the satellite data."""
        # Download the product
        product_path = self.api.download(product['uuid'])
        
        try:
            with rasterio.open(product_path) as src:
                # Calculate pixel coordinates
                window = self._get_window_from_bbox(src, bbox)
                
                # Read the data
                data = src.read(window=window)
                
                # Normalize the data
                data = self._normalize_data(data)
                
                return data
                
        finally:
            # Cleanup downloaded file
            if os.path.exists(product_path):
                os.remove(product_path)
    
    def _get_window_from_bbox(
        self,
        src: rasterio.DatasetReader,
        bbox: Dict
    ) -> Window:
        """Convert bbox to raster window."""
        # Transform bbox to pixel coordinates
        minx, miny = src.index(bbox['lon_min'], bbox['lat_min'])
        maxx, maxy = src.index(bbox['lon_max'], bbox['lat_max'])
        
        return Window(minx, miny, maxx - minx, maxy - miny)
    
    def _normalize_data(self, data: np.ndarray) -> np.ndarray:
        """Normalize the satellite data."""
        # Clip to valid range
        data = np.clip(data, 0, 10000)
        
        # Scale to 0-1
        data = data / 10000.0
        
        return data 