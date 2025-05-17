from typing import Tuple, Optional, List, Dict
import os
from datetime import datetime, timedelta
import numpy as np
import rasterio
from rasterio.warp import transform_bounds, calculate_default_transform, reproject, Resampling
from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
from ..utils.geo_utils import get_bbox_from_coords
from scipy import ndimage
import requests
from pathlib import Path
import json
from scipy.ndimage import uniform_filter, binary_opening, binary_closing
import logging
from shapely.geometry import box

logger = logging.getLogger(__name__)

class SentinelProcessor:
    """Processor for Sentinel-2 satellite imagery."""
    
    def __init__(
        self, 
        credentials: Dict[str, str], 
        output_dir: str = 'data/satellite'
    ):
        """
        Initialize Sentinel-2 data processor.
        
        Args:
            credentials: Dictionary with 'username' and 'password'
            output_dir: Directory to save downloaded satellite images
        """
        self.username = credentials['username']
        self.password = credentials['password']
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Initialize Sentinel API client
        self.api = SentinelAPI(self.username, self.password, 'https://scihub.copernicus.eu/dhus')
    
    def search_images(
        self, 
        area: Dict[str, float], 
        start_date: datetime, 
        end_date: datetime,
        cloud_cover: Optional[Tuple[float, float]] = (0, 10)
    ) -> List[Dict]:
        """
        Search for Sentinel-2 images matching criteria.
        
        Args:
            area: Dictionary with 'north', 'south', 'east', 'west' coordinates
            start_date: Start of search period
            end_date: End of search period
            cloud_cover: Tuple of (min, max) acceptable cloud cover percentage
        
        Returns:
            List of matching image metadata
        """
        # Create a bounding box for the area
        footprint = geojson_to_wkt(box(
            area['west'], area['south'], 
            area['east'], area['north']
        ))
        
        # Search for images
        products = self.api.query(
            footprint,
            date=(start_date, end_date),
            platformname='Sentinel-2',
            cloudcoverpercentage=cloud_cover
        )
        
        return list(products.values())
    
    def download_images(
        self, 
        products: List[Dict], 
        max_images: int = 5
    ) -> List[str]:
        """
        Download selected satellite images.
        
        Args:
            products: List of product metadata
            max_images: Maximum number of images to download
        
        Returns:
            List of downloaded image file paths
        """
        downloaded_images = []
        
        for product in products[:max_images]:
            try:
                # Download the product
                path = self.api.download(
                    product['uuid'], 
                    directory_path=self.output_dir
                )
                downloaded_images.append(path)
            except Exception as e:
                logger.warning(f"Failed to download image: {e}")
        
        return downloaded_images
    
    def process_image(
        self, 
        image_path: str, 
        bands: List[str] = ['B04', 'B03', 'B02']  # Red, Green, Blue
    ) -> Dict[str, np.ndarray]:
        """
        Process a downloaded Sentinel-2 image.
        
        Args:
            image_path: Path to the downloaded image
            bands: List of bands to extract
        
        Returns:
            Dictionary of extracted band arrays
        """
        try:
            with rasterio.open(image_path) as src:
                processed_bands = {}
                for band in bands:
                    # Find the band index
                    band_index = src.descriptions.index(band)
                    processed_bands[band] = src.read(band_index + 1)
                
                return processed_bands
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {e}")
            return {}
    
    def analyze_vegetation_index(
        self, 
        red_band: np.ndarray, 
        near_infrared_band: np.ndarray
    ) -> np.ndarray:
        """
        Calculate Normalized Difference Vegetation Index (NDVI).
        
        Args:
            red_band: Red band array
            near_infrared_band: Near-infrared band array
        
        Returns:
            NDVI array
        """
        # Avoid division by zero
        near_infrared_band = near_infrared_band.astype(float)
        red_band = red_band.astype(float)
        
        ndvi = (near_infrared_band - red_band) / (near_infrared_band + red_band + 1e-10)
        return ndvi
    
    def calculate_ndvi(self, image: np.ndarray) -> np.ndarray:
        """Calculate Normalized Difference Vegetation Index (NDVI)."""
        # Assuming bands are in order: B02 (Blue), B03 (Green), B04 (Red), B08 (NIR)
        red = image[2]  # Red band
        nir = image[3]  # NIR band
        
        # Calculate NDVI
        ndvi = (nir - red) / (nir + red + 1e-6)  # Add small epsilon to avoid division by zero
        
        return ndvi
    
    def detect_anomalies(self, ndvi: np.ndarray, threshold: float = 2.0) -> np.ndarray:
        """Detect anomalies in NDVI data that might indicate archaeological features."""
        # Apply median filter to reduce noise
        filtered = uniform_filter(ndvi, size=3)
        
        # Calculate local statistics
        local_mean = uniform_filter(filtered, size=15)
        local_std = np.sqrt(uniform_filter(filtered**2, size=15) - local_mean**2)
        
        # Calculate z-scores
        z_scores = (filtered - local_mean) / (local_std + 1e-6)
        
        # Create binary mask of anomalies
        anomalies = np.abs(z_scores) > threshold
        
        # Clean up the mask using morphological operations
        cleaned = binary_opening(anomalies, structure=np.ones((3,3)))
        cleaned = binary_closing(cleaned, structure=np.ones((3,3)))
        
        return cleaned
    
    def process_area(self, 
                    area: Dict[str, float],
                    start_date: datetime,
                    end_date: datetime,
                    max_cloud_cover: float = 20.0) -> Dict:
        """Process a specific area for archaeological features."""
        # Search for available imagery
        products = self.search_images(area, start_date, end_date)
        
        if not products:
            return {
                'status': 'error',
                'message': 'No suitable imagery found for the specified area and time period'
            }
        
        results = []
        for product in products:
            try:
                # Download the product
                product_path = self.download_images([product])[0]
                
                # Process the image
                image = self.process_image(product_path)
                
                # Calculate NDVI
                ndvi = self.analyze_vegetation_index(image['B04'], image['B08'])
                
                # Detect anomalies
                anomalies = self.detect_anomalies(ndvi)
                
                # Store results
                results.append({
                    'product_id': product['uuid'],
                    'acquisition_date': product['date'],
                    'cloud_cover': product['cloudcoverpercentage'],
                    'anomalies': anomalies.tolist()
                })
                
            except Exception as e:
                print(f"Error processing product {product['uuid']}: {str(e)}")
                continue
        
        return {
            'status': 'success',
            'results': results
        } 