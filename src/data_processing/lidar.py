import numpy as np
import laspy
import pdal
import json
from pathlib import Path
import logging
from typing import Optional, Dict, List, Union
import requests
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class LidarDataCollector:
    def __init__(self):
        # Initialize Earth Archive API settings
        self.earth_archive_url = "https://api.eartharchive.org/v1"
        self.api_key = os.getenv("EARTH_ARCHIVE_KEY")
        
        # Create cache directory
        self.cache_dir = Path("data/lidar_cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure thread pool for parallel processing
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def get_lidar_data(
        self,
        lat: float,
        lon: float,
        size_km: float = 10.0,
        resolution: float = 1.0,  # meters per pixel
        include_intensity: bool = True,
        include_classification: bool = True
    ) -> Dict[str, np.ndarray]:
        """
        Fetch LIDAR data for the given coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            size_km: Size of the area to fetch in kilometers
            resolution: Resolution in meters per pixel
            include_intensity: Whether to include intensity data
            include_classification: Whether to include point classification
            
        Returns:
            Dict containing elevation, intensity (optional), and classification (optional) arrays
        """
        try:
            # Calculate bounding box
            bbox = self._calculate_bbox(lat, lon, size_km)
            
            # Check cache first
            cached_data = self._check_cache(lat, lon, size_km, resolution)
            if cached_data is not None:
                return cached_data
            
            # Query Earth Archive for available tiles
            tiles = await self._query_tiles(bbox)
            
            if not tiles:
                logger.warning(f"No LIDAR tiles found for coordinates {lat}, {lon}")
                return None
            
            # Download and process tiles in parallel
            processed_tiles = []
            with ThreadPoolExecutor() as executor:
                futures = [
                    executor.submit(self._process_tile, tile, resolution)
                    for tile in tiles
                ]
                for future in futures:
                    processed_tiles.append(future.result())
            
            # Merge tiles
            merged_data = self._merge_tiles(processed_tiles, bbox, resolution)
            
            # Cache the results
            self._cache_data(lat, lon, size_km, resolution, merged_data)
            
            return merged_data
            
        except Exception as e:
            logger.error(f"Error fetching LIDAR data for {lat}, {lon}: {str(e)}")
            raise
    
    def _calculate_bbox(self, lat: float, lon: float, size_km: float) -> Dict[str, float]:
        """Calculate bounding box for the given coordinates and size."""
        # Approximate degrees per km at the equator
        deg_per_km = 1/111.32
        
        # Adjust for latitude
        lat_deg = size_km * deg_per_km
        lon_deg = size_km * deg_per_km / np.cos(np.radians(lat))
        
        return {
            'minx': lon - lon_deg/2,
            'maxx': lon + lon_deg/2,
            'miny': lat - lat_deg/2,
            'maxy': lat + lat_deg/2
        }
    
    async def _query_tiles(self, bbox: Dict[str, float]) -> List[Dict]:
        """Query Earth Archive API for available tiles."""
        params = {
            'bbox': f"{bbox['minx']},{bbox['miny']},{bbox['maxx']},{bbox['maxy']}",
            'format': 'laz'
        }
        
        headers = {'Authorization': f'Bearer {self.api_key}'}
        
        response = requests.get(
            f"{self.earth_archive_url}/tiles",
            params=params,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()['tiles']
    
    def _process_tile(
        self,
        tile: Dict,
        resolution: float
    ) -> Dict[str, np.ndarray]:
        """Process a single LIDAR tile."""
        # Download tile
        tile_url = tile['url']
        local_path = self.cache_dir / f"tile_{tile['id']}.laz"
        
        if not local_path.exists():
            response = requests.get(tile_url)
            response.raise_for_status()
            local_path.write_bytes(response.content)
        
        # Define PDAL pipeline
        pipeline = {
            "pipeline": [
                {
                    "type": "readers.las",
                    "filename": str(local_path)
                },
                {
                    "type": "filters.range",
                    "limits": "Classification[1:2]"  # Ground and non-ground points
                },
                {
                    "type": "filters.assign",
                    "assignment": "Classification[:]=1"
                },
                {
                    "type": "writers.gdal",
                    "resolution": resolution,
                    "output_type": "mean",
                    "filename": "temp.tif"
                }
            ]
        }
        
        pipeline = pdal.Pipeline(json.dumps(pipeline))
        pipeline.execute()
        
        # Read results
        with rasterio.open("temp.tif") as src:
            elevation = src.read(1)
            
        # Cleanup
        os.remove("temp.tif")
        
        return {
            'elevation': elevation,
            'bounds': tile['bounds']
        }
    
    def _merge_tiles(
        self,
        tiles: List[Dict[str, Union[np.ndarray, Dict]]],
        bbox: Dict[str, float],
        resolution: float
    ) -> Dict[str, np.ndarray]:
        """Merge multiple LIDAR tiles into a single array."""
        # Calculate output dimensions
        width = int((bbox['maxx'] - bbox['minx']) * 1000 / resolution)
        height = int((bbox['maxy'] - bbox['miny']) * 1000 / resolution)
        
        # Create empty output array
        merged = np.zeros((height, width), dtype=np.float32)
        
        # Merge tiles
        for tile in tiles:
            # Calculate tile position in output array
            x_start = int((tile['bounds']['minx'] - bbox['minx']) * 1000 / resolution)
            y_start = int((tile['bounds']['miny'] - bbox['miny']) * 1000 / resolution)
            
            # Copy data
            h, w = tile['elevation'].shape
            merged[y_start:y_start+h, x_start:x_start+w] = tile['elevation']
        
        return {
            'elevation': merged
        }
    
    def _check_cache(
        self,
        lat: float,
        lon: float,
        size_km: float,
        resolution: float
    ) -> Optional[Dict[str, np.ndarray]]:
        """Check if data exists in cache."""
        cache_file = self.cache_dir / f"lidar_{lat}_{lon}_{size_km}_{resolution}.npz"
        if cache_file.exists():
            data = np.load(cache_file)
            return {
                'elevation': data['elevation']
            }
        return None
    
    def _cache_data(
        self,
        lat: float,
        lon: float,
        size_km: float,
        resolution: float,
        data: Dict[str, np.ndarray]
    ) -> None:
        """Cache the processed data."""
        cache_file = self.cache_dir / f"lidar_{lat}_{lon}_{size_km}_{resolution}.npz"
        np.savez(cache_file, **data) 