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

class SentinelProcessor:
    """Process Sentinel-2 satellite imagery for archaeological site detection."""
    
    def __init__(self, credentials: Dict[str, str], output_dir: str):
        """Initialize the processor with credentials and output directory."""
        self.username = credentials.get('username')
        self.password = credentials.get('password')
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # STAC API endpoints
        self.stac_api_url = "https://catalogue.dataspace.copernicus.eu/stac"
        self.auth_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
        
        # Get access token
        self.access_token = self._get_access_token()
    
    def _get_access_token(self) -> str:
        """Get OAuth2 access token for STAC API."""
        data = {
            'grant_type': 'password',
            'username': self.username,
            'password': self.password,
            'client_id': 'cdse-public'
        }
        
        response = requests.post(self.auth_url, data=data)
        response.raise_for_status()
        return response.json()['access_token']
    
    def search_imagery(self, 
                      area: Dict[str, float],
                      start_date: datetime,
                      end_date: datetime,
                      max_cloud_cover: float = 20.0) -> List[Dict]:
        """Search for Sentinel-2 imagery using STAC API."""
        # Convert dates to ISO format
        start_date_str = start_date.isoformat() + 'Z'
        end_date_str = end_date.isoformat() + 'Z'
        
        # Create STAC query
        query = {
            "collections": ["SENTINEL-2"],
            "datetime": f"{start_date_str}/{end_date_str}",
            "query": {
                "eo:cloud_cover": {
                    "lte": max_cloud_cover
                }
            },
            "intersects": {
                "type": "Polygon",
                "coordinates": [[
                    [area['west'], area['south']],
                    [area['east'], area['south']],
                    [area['east'], area['north']],
                    [area['west'], area['north']],
                    [area['west'], area['south']]
                ]]
            }
        }
        
        # Make request to STAC API
        headers = {'Authorization': f'Bearer {self.access_token}'}
        response = requests.post(
            f"{self.stac_api_url}/search",
            json=query,
            headers=headers
        )
        response.raise_for_status()
        
        return response.json()['features']
    
    def download_product(self, product_id: str) -> str:
        """Download a Sentinel-2 product using STAC API."""
        # Get product download URL
        headers = {'Authorization': f'Bearer {self.access_token}'}
        response = requests.get(
            f"{self.stac_api_url}/collections/SENTINEL-2/items/{product_id}",
            headers=headers
        )
        response.raise_for_status()
        
        # Get download URL for the product
        product_data = response.json()
        download_url = product_data['assets']['data']['href']
        
        # Download the product
        output_path = self.output_dir / f"{product_id}.zip"
        response = requests.get(download_url, headers=headers, stream=True)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return str(output_path)
    
    def process_image(self, image_path: str) -> np.ndarray:
        """Process a Sentinel-2 image for archaeological feature detection."""
        # Read the image using rasterio
        with rasterio.open(image_path) as src:
            # Read the image data
            image = src.read()
            
            # Convert to float32 for processing
            image = image.astype(np.float32)
            
            # Normalize the data
            image = (image - image.min()) / (image.max() - image.min())
            
            return image
    
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
        products = self.search_imagery(area, start_date, end_date, max_cloud_cover)
        
        if not products:
            return {
                'status': 'error',
                'message': 'No suitable imagery found for the specified area and time period'
            }
        
        results = []
        for product in products:
            try:
                # Download the product
                product_path = self.download_product(product['id'])
                
                # Process the image
                image = self.process_image(product_path)
                
                # Calculate NDVI
                ndvi = self.calculate_ndvi(image)
                
                # Detect anomalies
                anomalies = self.detect_anomalies(ndvi)
                
                # Store results
                results.append({
                    'product_id': product['id'],
                    'acquisition_date': product['properties']['datetime'],
                    'cloud_cover': product['properties']['eo:cloud_cover'],
                    'anomalies': anomalies.tolist()
                })
                
            except Exception as e:
                print(f"Error processing product {product['id']}: {str(e)}")
                continue
        
        return {
            'status': 'success',
            'results': results
        } 