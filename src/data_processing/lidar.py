import numpy as np
import laspy
import pdal
import json
from pathlib import Path
import logging
from typing import Optional, Dict, List, Union
import requests
from concurrent.futures import ThreadPoolExecutor
import rasterio
from rasterio.merge import merge
from rasterio.transform import from_origin

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
            tiles_metadata = await self._query_tiles(bbox)
            
            if not tiles_metadata:
                logger.warning(f"No LIDAR tiles found for coordinates {lat}, {lon}")
                return None
            
            # Download and process tiles in parallel
            processed_tile_results = []
            temp_files_to_merge = []

            with ThreadPoolExecutor() as executor:
                futures = [
                    executor.submit(self._process_tile, tile_meta, resolution, idx)
                    for idx, tile_meta in enumerate(tiles_metadata)
                ]
                for future in futures:
                    tile_result_path = future.result()
                    if tile_result_path:
                        temp_files_to_merge.append(tile_result_path)
            
            if not temp_files_to_merge:
                logger.warning(f"No tiles were successfully processed for {lat}, {lon}")
                return None

            merged_array, merged_transform = merge(temp_files_to_merge)
            
            first_tile_crs = None
            if temp_files_to_merge:
                with rasterio.open(temp_files_to_merge[0]) as src_tile:
                    first_tile_crs = src_tile.crs
            
            for temp_file_path in temp_files_to_merge:
                try:
                    os.remove(temp_file_path)
                except OSError as e:
                    logger.error(f"Error deleting temporary file {temp_file_path}: {e}")

            if merged_array.ndim == 3 and merged_array.shape[0] == 1:
                merged_array = merged_array.squeeze(axis=0)
            elif merged_array.ndim != 2:
                logger.error(f"Merged DEM array has unexpected shape: {merged_array.shape}")
                return None

            merged_data = {
                'elevation': merged_array,
                'transform': merged_transform,
                'crs': first_tile_crs,
                'resolution': resolution
            }
            
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
        resolution: float,
        tile_index: int
    ) -> Optional[str]:
        """Process a single LIDAR tile, save to temp TIF, return path."""
        # Download tile
        tile_url = tile['url']
        local_laz_path = self.cache_dir / f"tile_{tile['id']}_{tile_index}.laz"
        
        temp_tif_path = self.cache_dir / f"temp_pdal_out_{tile['id']}_{tile_index}.tif"

        try:
            if not local_laz_path.exists():
                response = requests.get(tile_url)
                response.raise_for_status()
                local_laz_path.write_bytes(response.content)
            
            # Define PDAL pipeline
            pdal_pipeline_json = {
                "pipeline": [
                    {
                        "type": "readers.las",
                        "filename": str(local_laz_path)
                    },
                    {
                        "type": "filters.range",
                        "limits": "Classification[1:2]"
                    },
                    {
                        "type": "filters.assign",
                        "value": "Classification = 2 WHERE Classification == 2"
                    },
                    {
                        "type": "filters.reprojection",
                        "out_srs": "EPSG:4326"
                    },
                    {
                        "type": "writers.gdal",
                        "resolution": resolution,
                        "output_type": "mean",
                        "gdaldriver": "GTiff",
                        "filename": str(temp_tif_path)
                    }
                ]
            }
            
            pipeline = pdal.Pipeline(json.dumps(pdal_pipeline_json))
            pipeline.execute()
            
            if temp_tif_path.exists():
                return str(temp_tif_path)
            else:
                logger.error(f"PDAL output TIFF not created for tile {tile['id']}")
                return None

        except Exception as e:
            logger.error(f"Error processing tile {tile.get('id', 'unknown')}: {e}")
            if temp_tif_path.exists():
                try: os.remove(temp_tif_path) 
                except: pass
            return None
        finally:
            if local_laz_path.exists():
                 try: os.remove(local_laz_path)
                 except OSError as e: logger.warning(f"Could not remove temp LAZ {local_laz_path}: {e}")
                 pass
    
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
                'elevation': data['elevation'],
                'transform': data['transform'] if 'transform' in data else None,
                'crs': data['crs'] if 'crs' in data else None,
                'resolution': data['resolution'] if 'resolution' in data else 1.0
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
        """Cache the processed data, including transform and crs."""
        cache_file = self.cache_dir / f"lidar_{lat}_{lon}_{size_km}_{resolution}.npz"
        save_data = {
            'elevation': data['elevation'],
            'resolution': data.get('resolution', 1.0)
        }
        if data.get('transform'):
            save_data['transform'] = list(data['transform'])[:6]
        if data.get('crs'):
            save_data['crs'] = str(data['crs'])
        
        np.savez(cache_file, **save_data) 