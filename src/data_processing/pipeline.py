"""Simplified Research Processing Pipeline.

Provides core functionality for processing indigenous knowledge research data.
"""

import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import os
import asyncio

import numpy as np
import rasterio
from ..config import get_settings
from ..core.enums import DataSourceType, ValidationStatus
from .satellite.sentinel_processor import SentinelProcessor
from .lidar.lidar_processor import LidarProcessor
from .lidar import LidarDataCollector
from .image_processor import ImageProcessor
from ..analysis.pattern_detection import PatternDetectionEngine, PatternType
from .. import config as app_config # Assuming direct import of config.py works
from .satellite import SatelliteDataCollector, SatelliteProcessor
from .historical_texts import HistoricalTextProcessor
from .indigenous_maps import IndigenousMapProcessor

logger = logging.getLogger(__name__)

@dataclass
class ResearchDataPoint:
    """Comprehensive representation of a research data point."""
    site_id: str
    latitude: float
    longitude: float
    timestamp: datetime = field(default_factory=datetime.utcnow)
    data_sources: Dict[DataSourceType, Dict[str, Any]] = field(default_factory=dict)
    confidence_score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    validation_status: ValidationStatus = ValidationStatus.PENDING

# Dummy settings for now - replace with actual config loading if available
class DummySettings:
    LIDAR_ENABLED = True
    SATELLITE_ENABLED = True
    HISTORICAL_TEXTS_ENABLED = True
    INDIGENOUS_MAPS_ENABLED = True
    # Simulate credential structure based on Processor __init__ methods
    SENTINEL_CREDENTIALS = {
        "username": app_config.SENTINEL_USERNAME, 
        "password": app_config.SENTINEL_PASSWORD
    }
    LIDAR_CREDENTIALS = {
        "username": app_config.LIDAR_USERNAME,
        "password": app_config.LIDAR_PASSWORD,
        "token": os.getenv("LIDAR_TOKEN") # Attempt to get token if set, else None
    }

settings = DummySettings() # Use dummy settings for now

class AnalysisPipeline:
    """Advanced research data processing pipeline."""
    
    def __init__(self):
        """Initialize research pipeline with configuration."""
        self.settings = get_settings()
        self.max_concurrent_agents = self.settings.MAX_CONCURRENT_AGENTS
        
        self.historical_text_processor = (
            HistoricalTextProcessor()
            if settings.HISTORICAL_TEXTS_ENABLED
            else None
        )
        self.indigenous_map_processor = (
            IndigenousMapProcessor()
            if settings.INDIGENOUS_MAPS_ENABLED
            else None
        )

        # Initialize data source processors
        if settings.SATELLITE_ENABLED:
            self.satellite_collector = SatelliteDataCollector(
                credentials=settings.SENTINEL_CREDENTIALS,
                output_dir=str(app_config.SATELLITE_DATA_DIR) # Use defined data dir
            )
            self.satellite_processor = SatelliteProcessor(
                credentials=settings.SENTINEL_CREDENTIALS,
                output_dir=str(app_config.SATELLITE_DATA_DIR)
            )
        else:
            self.satellite_collector = None
            self.satellite_processor = None
        
        # Initialize LidarDataCollector instead of LidarProcessor for primary LiDAR DEM fetching
        if settings.LIDAR_ENABLED:
            self.lidar_collector = LidarDataCollector(
                credentials=settings.LIDAR_CREDENTIALS,
                output_dir=str(app_config.LIDAR_DATA_DIR) # Use defined data dir
            )
            self.lidar_processor = LidarProcessor(
                credentials=settings.LIDAR_CREDENTIALS,
                output_dir=str(app_config.LIDAR_DATA_DIR)
            )
        else:
            self.lidar_collector = None
            self.lidar_processor = None
        
        # Initialize ImageProcessor
        self.image_processor = ImageProcessor()
        
        # Initialize PatternDetectionEngine
        self.pattern_engine = PatternDetectionEngine()
    
    async def collect_data(self, site_id: str, bounds: Dict[str, float], data_sources: List[DataSourceType]) -> ResearchDataPoint:
        data_point = ResearchDataPoint(site_id=site_id, area_definition=bounds)
        loop = asyncio.get_event_loop()

        # Define a default date range if not provided (e.g., last 5 years)
        # This is needed because processor methods expect it.
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5*365) 

        if DataSourceType.SATELLITE in data_sources and self.satellite_collector:
            logger.info(f"Collecting Satellite data for {site_id}")
            try:
                # SentinelProcessor methods are synchronous, run in executor
                products = await loop.run_in_executor(
                    None, 
                    self.satellite_collector.search_images, 
                    bounds, start_date, end_date
                )
                if products:
                    satellite_images = await loop.run_in_executor(
                        None,
                        self.satellite_collector.download_images,
                        products # Pass the found products to download_images
                    )
                    if satellite_images:
                        data_point.satellite_image_paths = satellite_images
                        # data_point.data_sources[DataSourceType.SATELLITE] = {'raw_image_paths': satellite_images} # Example update
            except Exception as e:
                logger.error(f"Error collecting satellite data for {site_id}: {e}")

        if DataSourceType.LIDAR in data_sources and self.lidar_collector:
            logger.info(f"Collecting LIDAR data for {site_id}")
            try:
                # LidarProcessor.download_lidar_data is synchronous
                lidar_files = await loop.run_in_executor(
                    None,
                    self.lidar_collector.download_lidar_data, 
                    bounds, start_date, end_date # area, start_date, end_date
                )
                if lidar_files:
                    data_point.lidar_data_paths = lidar_files
                    # data_point.data_sources[DataSourceType.LIDAR] = {'raw_lidar_paths': lidar_files} # Example update
            except Exception as e:
                logger.error(f"Error collecting LIDAR data for {site_id}: {e}")

        # TODO: Implement Historical Text and Indigenous Map data collection similarly if they involve IO
        if DataSourceType.HISTORICAL_TEXTS in data_sources and self.historical_text_processor:
            logger.info(f"Processing historical texts for {site_id}")
            # data_point.historical_texts_data = self.historical_text_processor.process_area(bounds)

        if DataSourceType.INDIGENOUS_MAPS in data_sources and self.indigenous_map_processor:
            logger.info(f"Processing indigenous maps for {site_id}")
            # data_point.indigenous_maps_data = self.indigenous_map_processor.process_area(bounds)
        
        return data_point
    
    def analyze_data(self, data_point: ResearchDataPoint) -> ResearchDataPoint:
        """
        Comprehensive analysis of collected research data.
        Includes confidence scoring and advanced feature detection using ImageProcessor.
        
        Args:
            data_point: Research data point to analyze
        
        Returns:
            Updated research data point with analysis results
        """
        try:
            # --- Advanced Feature Detection using ImageProcessor ---
            if DataSourceType.SATELLITE in data_point.data_sources and data_point.data_sources[DataSourceType.SATELLITE]:
                sat_data = data_point.data_sources[DataSourceType.SATELLITE]
                # Option 1: Process NDVI array
                if 'ndvi' in sat_data and isinstance(sat_data['ndvi'], np.ndarray):
                    logger.info(f"Running ImageProcessor on satellite NDVI for site {data_point.site_id}")
                    ndvi_array = sat_data['ndvi']
                    # Ensure ndvi_array is 2D if it's not already (ImageProcessor expects 2D image)
                    if ndvi_array.ndim > 2:
                        # This can happen if NDVI is stored with a band dimension, e.g. (1, H, W)
                        # Squeeze it or take the first band if appropriate
                        if ndvi_array.shape[0] == 1: # if first dimension is 1, squeeze it
                           ndvi_array = np.squeeze(ndvi_array, axis=0)
                        else: # if more than one band, log warning and take first. This case should be reviewed.
                           logger.warning(f"NDVI array for site {data_point.site_id} has unexpected shape {ndvi_array.shape}. Using first band.")
                           ndvi_array = ndvi_array[0]
                    
                    if ndvi_array.ndim == 2:
                        ip_sat_results = self.image_processor.process_large_dataset(data_input=ndvi_array)
                        if ip_sat_results and ip_sat_results['success']:
                            data_point.metadata['image_processor_satellite_ndvi'] = {
                                'features': ip_sat_results.get('features_detected'),
                                'statistics': ip_sat_results.get('statistics')
                                # 'processed_array': ip_sat_results.get('processed_array') # Optionally store processed array
                            }
                        else:
                            logger.error(f"ImageProcessor failed for satellite NDVI on site {data_point.site_id}: {ip_sat_results.get('error')}")
                    else:
                        logger.error(f"Satellite NDVI array for site {data_point.site_id} is not 2D after squeeze attempt, shape: {ndvi_array.shape}. Skipping ImageProcessor.")

                # Process other standard indices (EVI, SAVI, NDWI_Gao) with ImageProcessor
                indices_to_process_with_ip = {
                    'evi': 'image_processor_satellite_evi',
                    'savi': 'image_processor_satellite_savi',
                    'ndwi_gao': 'image_processor_satellite_ndwi_gao'
                }

                for index_key, metadata_key in indices_to_process_with_ip.items():
                    if index_key in sat_data and isinstance(sat_data[index_key], np.ndarray):
                        logger.info(f"Running ImageProcessor on satellite {index_key.upper()} for site {data_point.site_id}")
                        index_array = sat_data[index_key]
                        if index_array.ndim > 2:
                            if index_array.shape[0] == 1:
                                index_array = np.squeeze(index_array, axis=0)
                            else:
                                logger.warning(f"{index_key.upper()} array for site {data_point.site_id} has unexpected shape {index_array.shape}. Using first band.")
                                index_array = index_array[0]
                        
                        if index_array.ndim == 2:
                            ip_results = self.image_processor.process_large_dataset(data_input=index_array)
                            if ip_results and ip_results['success']:
                                data_point.metadata[metadata_key] = {
                                    'features': ip_results.get('features_detected'),
                                    'statistics': ip_results.get('statistics')
                                }
                            else:
                                logger.error(f"ImageProcessor failed for satellite {index_key.upper()} on site {data_point.site_id}: {ip_results.get('error')}")
                        else:
                            logger.error(f"Satellite {index_key.upper()} array for site {data_point.site_id} is not 2D after squeeze. Shape: {index_array.shape}. Skipping ImageProcessor.")

                # Option 2: Process NDVI anomaly mask (if preferred, or in addition)
                if 'ndvi_anomalies_mask' in sat_data and isinstance(sat_data['ndvi_anomalies_mask'], np.ndarray):
                    logger.info(f"Running ImageProcessor on satellite NDVI anomaly mask for site {data_point.site_id}")
                    ip_sat_anomaly_results = self.image_processor.process_large_dataset(data_input=sat_data['ndvi_anomalies_mask'])
                    if ip_sat_anomaly_results and ip_sat_anomaly_results['success']:
                        data_point.metadata['image_processor_satellite_ndvi_anomalies'] = {
                            'features': ip_sat_anomaly_results.get('features_detected'),
                            'statistics': ip_sat_anomaly_results.get('statistics')
                        }

            if DataSourceType.LIDAR in data_point.data_sources and data_point.data_sources[DataSourceType.LIDAR]:
                lidar_data = data_point.data_sources[DataSourceType.LIDAR]
                if 'dem' in lidar_data and isinstance(lidar_data['dem'], np.ndarray):
                    logger.info(f"Running ImageProcessor on LiDAR DEM for site {data_point.site_id}")
                    dem_array = lidar_data['dem']
                    # Ensure dem_array is 2D
                    if dem_array.ndim > 2:
                        if dem_array.shape[0] == 1:
                           dem_array = np.squeeze(dem_array, axis=0)
                        else:
                           logger.warning(f"DEM array for site {data_point.site_id} has unexpected shape {dem_array.shape}. Using first band.")
                           dem_array = dem_array[0]

                    if dem_array.ndim == 2:
                        ip_lidar_results = self.image_processor.process_large_dataset(data_input=dem_array)
                        if ip_lidar_results and ip_lidar_results['success']:
                            data_point.metadata['image_processor_lidar_dem'] = {
                                'features': ip_lidar_results.get('features_detected'),
                                'statistics': ip_lidar_results.get('statistics')
                                # 'processed_array': ip_lidar_results.get('processed_array')
                            }
                        else:
                            logger.error(f"ImageProcessor failed for LiDAR DEM on site {data_point.site_id}: {ip_lidar_results.get('error')}")
                    else:
                        logger.error(f"LiDAR DEM array for site {data_point.site_id} is not 2D after squeeze attempt, shape: {dem_array.shape}. Skipping ImageProcessor.")

            # --- Pattern Detection using PatternDetectionEngine ---
            all_geo_features_for_patterns = []
            logger.info(f"Preparing features for PatternDetectionEngine for site {data_point.site_id}")

            # Process Satellite Features from ImageProcessor
            # Store ImageProcessor results directly for simpler access later
            ip_sat_results_data = data_point.metadata.get('image_processor_satellite_ndvi', {})
            if ip_sat_results_data.get('features'):
                sat_ip_features = ip_sat_results_data['features']
                sat_image_path = data_point.data_sources.get(DataSourceType.SATELLITE, {}).get('image_path')
                if sat_image_path:
                    try:
                        with rasterio.open(sat_image_path) as src:
                            sat_transform = src.transform
                            for feature in sat_ip_features:
                                centroid_row, centroid_col = feature['centroid']
                                lon, lat = rasterio.transform.xy(sat_transform, centroid_row, centroid_col)
                                all_geo_features_for_patterns.append({
                                    'longitude': lon, 'latitude': lat,
                                    'type': feature.get('type', 'unknown'), 'area': feature.get('area'),
                                    'source': 'satellite_ndvi_ip', 'source_metadata': feature # Keep original feature for context
                                })
                    except Exception as e:
                        logger.error(f"Error getting transform for satellite image {sat_image_path} or converting feature coords: {e}")
                else:
                    logger.warning("Satellite image path not found for converting ImageProcessor feature coordinates for NDVI results.")

            # Add features from other ImageProcessor-processed satellite indices to PatternDetectionEngine input
            for index_key, metadata_key in indices_to_process_with_ip.items():
                ip_index_results_data = data_point.metadata.get(metadata_key, {})
                if ip_index_results_data.get('features'):
                    index_ip_features = ip_index_results_data['features']
                    # Satellite image path and transform are the same as for NDVI
                    if sat_image_path: # Check if we successfully got it for NDVI
                        try:
                            # Assuming sat_transform is still in scope from NDVI processing or re-open
                            # For safety, might be better to re-open or ensure sat_transform is reliably available
                            with rasterio.open(sat_image_path) as src: # Re-open to be safe
                                sat_transform = src.transform 
                                for feature in index_ip_features:
                                    centroid_row, centroid_col = feature['centroid']
                                    lon, lat = rasterio.transform.xy(sat_transform, centroid_row, centroid_col)
                                    all_geo_features_for_patterns.append({
                                        'longitude': lon, 'latitude': lat,
                                        'type': feature.get('type', 'unknown'), 'area': feature.get('area'),
                                        'source': f'satellite_{index_key}_ip', 'source_metadata': feature
                                    })
                        except Exception as e:
                            logger.error(f"Error getting transform for satellite image {sat_image_path} or converting {index_key.upper()} feature coords: {e}")
                    else:
                        logger.warning(f"Satellite image path not found for converting {index_key.upper()} ImageProcessor feature coordinates.")

            # Process LiDAR DEM Features from ImageProcessor
            ip_lidar_results_data = data_point.metadata.get('image_processor_lidar_dem', {})
            if ip_lidar_results_data.get('features'):
                lidar_ip_features = ip_lidar_results_data['features']
                lidar_geo_info = data_point.data_sources.get(DataSourceType.LIDAR, {})
                dem_transform = lidar_geo_info.get('transform')
                if dem_transform:
                    for feature in lidar_ip_features:
                        centroid_row, centroid_col = feature['centroid']
                        lon, lat = rasterio.transform.xy(dem_transform, centroid_row, centroid_col)
                        all_geo_features_for_patterns.append({
                            'longitude': lon, 'latitude': lat,
                            'type': feature.get('type', 'unknown'), 'area': feature.get('area'),
                            'source': 'lidar_dem_ip', 'source_metadata': feature # Keep original feature for context
                        })
                else:
                    logger.warning("LiDAR DEM transform not found for converting ImageProcessor feature coordinates.")
            
            pattern_engine_results = [] # Initialize to empty list
            if all_geo_features_for_patterns:
                logger.info(f"Running PatternDetectionEngine with {len(all_geo_features_for_patterns)} features for site {data_point.site_id}")
                # PatternDetectionEngine expects a dict with a 'features' key,
                # where 'features' is a list of dicts, each having 'latitude' and 'longitude'.
                # Our 'all_geo_features_for_patterns' matches this structure.
                pattern_engine_input = {'features': all_geo_features_for_patterns} 
                try:
                    detected_patterns = self.pattern_engine.detect_patterns(pattern_engine_input)
                    data_point.metadata['pattern_engine_results'] = detected_patterns
                    pattern_engine_results = detected_patterns # for use in confidence scoring
                    logger.info(f"PatternDetectionEngine found {len(detected_patterns)} patterns for site {data_point.site_id}")
                except Exception as e:
                    logger.error(f"PatternDetectionEngine failed for site {data_point.site_id}: {e}")
            else:
                logger.info(f"No features for PatternDetectionEngine for site {data_point.site_id}")


            # --- Multi-source confidence scoring (REVISED) ---
            confidence_components = []
            
            # 1. Satellite Confidence
            if DataSourceType.SATELLITE in data_point.data_sources and data_point.data_sources[DataSourceType.SATELLITE]:
                sat_data = data_point.data_sources[DataSourceType.SATELLITE]
                ndvi_val = sat_data.get('ndvi', np.array([0]))
                if not isinstance(ndvi_val, np.ndarray): ndvi_val = np.array([0])
                
                # Base quality on original image_quality field if it exists, else on ndvi > 0
                img_quality_metric = sat_data.get('image_quality', np.mean(ndvi_val > 0) if ndvi_val.size > 0 else 0.0)
                base_sat_confidence = (np.mean(ndvi_val > 0.3) + img_quality_metric) / 2
                
                ip_satellite_score = 0.0
                if ip_sat_results_data.get('success'):
                    stats = ip_sat_results_data.get('statistics', {})
                    num_features = stats.get('total_features', 0)
                    density = stats.get('density', 0)
                    ip_satellite_score += min(num_features / 100.0, 1.0) * 0.25 # Max 0.25 from num features
                    ip_satellite_score += min(density / 0.1, 1.0) * 0.25    # Max 0.25 from density
                                
                # Combine base satellite confidence with ImageProcessor score (max 1.0)
                # Each part (base, IP) contributes, let's average them if IP score is substantial
                if ip_satellite_score > 0.05: # only factor in if IP found something
                    final_sat_confidence = (base_sat_confidence + ip_satellite_score) / 2
                else:
                    final_sat_confidence = base_sat_confidence
                confidence_components.append(min(final_sat_confidence, 1.0))

            # 2. LiDAR Confidence
            if DataSourceType.LIDAR in data_point.data_sources and data_point.data_sources[DataSourceType.LIDAR]:
                lidar_ds_data = data_point.data_sources[DataSourceType.LIDAR]
                dem_available = 1.0 if 'dem' in lidar_ds_data and lidar_ds_data['dem'] is not None and lidar_ds_data['dem'].size > 0 else 0.0
                dem_quality_metric = 0.5 # Placeholder for actual quality
                base_lidar_confidence = dem_available * dem_quality_metric # Max 0.5

                ip_lidar_score = 0.0
                if ip_lidar_results_data.get('success'):
                    stats = ip_lidar_results_data.get('statistics', {})
                    features = ip_lidar_results_data.get('features', [])
                    num_features = stats.get('total_features', 0)
                    density = stats.get('density', 0)
                    ip_lidar_score += min(num_features / 50.0, 1.0) * 0.15 
                    ip_lidar_score += min(density / 0.05, 1.0) * 0.1
                    
                    num_circular = sum(1 for f in features if f.get('type') == 'circular')
                    num_linear = sum(1 for f in features if f.get('type') == 'linear')
                    ip_lidar_score += min(num_circular / 5.0, 1.0) * 0.15
                    ip_lidar_score += min(num_linear / 5.0, 1.0) * 0.1
                
                # Combine base LiDAR confidence with ImageProcessor score (max 1.0)
                if ip_lidar_score > 0.05:
                     final_lidar_confidence = (base_lidar_confidence + ip_lidar_score) / 2
                else:
                    final_lidar_confidence = base_lidar_confidence
                confidence_components.append(min(final_lidar_confidence, 1.0))

            # 3. Pattern Score (adds as a separate component if significant)
            pattern_confidence_score = 0.0
            if pattern_engine_results: # Use the variable populated earlier
                num_geometric_patterns = sum(1 for p in pattern_engine_results if p.type == PatternType.GEOMETRIC and p.confidence > 0.6) # Stricter confidence
                avg_geometric_confidence = 0.0
                if num_geometric_patterns > 0:
                    confident_geo_patterns = [p.confidence for p in pattern_engine_results if p.type == PatternType.GEOMETRIC and p.confidence > 0.6]
                    if confident_geo_patterns:
                         avg_geometric_confidence = np.mean(confident_geo_patterns)
                
                pattern_confidence_score += min(num_geometric_patterns / 2.0, 1.0) * 0.3 # Max 0.3 from num geo patterns
                pattern_confidence_score += avg_geometric_confidence * 0.2 # Max 0.2 from avg confidence
            
            if pattern_confidence_score > 0.1: # Only add if pattern signal is notable
                confidence_components.append(min(pattern_confidence_score, 0.5)) # Cap pattern contribution to overall
            
            # Calculate overall confidence score
            if confidence_components:
                data_point.confidence_score = np.mean(confidence_components)
                data_point.confidence_score = min(data_point.confidence_score, 1.0) # Ensure capped at 1.0
            else:
                data_point.confidence_score = 0.0
            
            # Determine validation status
            data_point.validation_status = (
                ValidationStatus.HIGH_CONFIDENCE if data_point.confidence_score > 0.7 else
                ValidationStatus.MEDIUM_CONFIDENCE if data_point.confidence_score > 0.4 else
                ValidationStatus.LOW_CONFIDENCE
            )
            
            # Add analysis metadata
            data_point.metadata.update({
                'analysis_timestamp': datetime.utcnow(),
                'sources_analyzed': list(data_point.data_sources.keys()),
                'confidence_breakdown': {
                    source.value: score 
                    for source, score in zip(
                        data_point.data_sources.keys(), 
                        confidence_components
                    )
                }
            })
        
        except Exception as e:
            logger.error(f"Data analysis error: {e}")
            data_point.validation_status = ValidationStatus.ANALYSIS_ERROR
        
        return data_point

    async def _execute_tiled_processing(
        self,
        original_site_id: str,
        large_area_bounds: Dict[str, float],
        tile_height_deg: float,
        tile_width_deg: float,
        data_sources: List[DataSourceType] = None
    ) -> List[ResearchDataPoint]:
        """Internal method to perform tiled processing over a large area."""
        all_tile_results = []
        
        min_lat, max_lat = large_area_bounds['south'], large_area_bounds['north']
        min_lon, max_lon = large_area_bounds['west'], large_area_bounds['east']

        # Calculate number of tiles
        # Ensure we cover the whole area, hence math.ceil equivalent
        num_rows = int(np.ceil((max_lat - min_lat) / tile_height_deg))
        num_cols = int(np.ceil((max_lon - min_lon) / tile_width_deg))

        if num_rows == 0: num_rows = 1 # ensure at least one row if bounds are very small but non-zero
        if num_cols == 0: num_cols = 1 # ensure at least one col

        logger.info(f"Large area processing: {num_rows} rows, {num_cols} columns of tiles.")

        for j in range(num_rows): # Iterate through rows (south to north)
            tile_south = min_lat + j * tile_height_deg
            tile_north = min_lat + (j + 1) * tile_height_deg
            # Ensure tile_north does not exceed the max_lat of the large area
            tile_north = min(tile_north, max_lat)

            # If tile_south is already >= tile_north (can happen with last tile if perfectly aligned or due to float precision), skip
            if tile_south >= tile_north: continue

            for i in range(num_cols): # Iterate through columns (west to east)
                tile_west = min_lon + i * tile_width_deg
                tile_east = min_lon + (i + 1) * tile_width_deg
                # Ensure tile_east does not exceed the max_lon of the large area
                tile_east = min(tile_east, max_lon)

                if tile_west >= tile_east: continue

                tile_bounds_j_i = {
                    'north': tile_north,
                    'south': tile_south,
                    'east': tile_east,
                    'west': tile_west
                }
                tile_site_id = f"{original_site_id}_tile_{j}_{i}"

                logger.info(f"Processing tile {j+1}/{num_rows}, {i+1}/{num_cols}: ID {tile_site_id}, Bounds: {tile_bounds_j_i}")
                
                try:
                    # Collect data for the current tile
                    tile_data_point = await self.collect_data(
                        tile_site_id,
                        tile_bounds_j_i,
                        data_sources
                    )
                    
                    # Analyze data for the current tile
                    analyzed_tile_data_point = self.analyze_data(tile_data_point)
                    all_tile_results.append(analyzed_tile_data_point)
                    logger.info(f"Finished processing tile {tile_site_id}. Confidence: {analyzed_tile_data_point.confidence_score:.2f}")
                except Exception as e:
                    logger.error(f"Error processing tile {tile_site_id}: {e}. Skipping this tile.")
                    # Optionally, create a placeholder ResearchDataPoint with an error status
                    error_data_point = ResearchDataPoint(
                        site_id=tile_site_id,
                        latitude=(tile_north + tile_south) / 2,
                        longitude=(tile_east + tile_west) / 2,
                        validation_status=ValidationStatus.ERROR,
                        metadata={'error': str(e), 'tile_bounds': tile_bounds_j_i}
                    )
                    all_tile_results.append(error_data_point)
        
        return all_tile_results

async def process_research_location(
    site_id: str,
    area_definition: Dict[str, float],
    data_sources: List[DataSourceType] = None,
    tile_size_deg_lat: float = 0.2,
    tile_size_deg_lon: float = 0.2
) -> Union[ResearchDataPoint, List[ResearchDataPoint]]:
    """
    Asynchronous convenience function to process a research location or area.
    If the area_definition is larger than a single tile, it performs tiled processing.
    
    Args:
        site_id: Unique identifier for the research site
        area_definition: Dictionary with 'north', 'south', 'east', 'west' coordinates for the specific tile/area to process.
        data_sources: List of data sources to collect
        tile_size_deg_lat: Latitude tile size in degrees
        tile_size_deg_lon: Longitude tile size in degrees
    
    Returns:
        Research data point or list of research data points with analysis results
    """
    # Calculate area height and width from area_definition
    area_height_deg = area_definition['north'] - area_definition['south']
    area_width_deg = area_definition['east'] - area_definition['west']

    pipeline = AnalysisPipeline() # Instantiate the pipeline

    if area_height_deg <= tile_size_deg_lat and area_width_deg <= tile_size_deg_lon:
        logger.info(f"Processing {site_id} as a single tile.")
    data_point = await pipeline.collect_data(
        site_id, 
            area_definition, # Pass the full area_definition as the bounds for this single tile
        data_sources
    )
    return pipeline.analyze_data(data_point) 
    else: # Correctly paired with the 'if'
        # Area is larger than a single tile, initiate tiled processing
        logger.info(f"Processing {site_id} using tiling for large area.")
        return await pipeline._execute_tiled_processing(
            original_site_id=site_id,
            large_area_bounds=area_definition,
            tile_height_deg=tile_size_deg_lat,
            tile_width_deg=tile_size_deg_lon,
            data_sources=data_sources
        )