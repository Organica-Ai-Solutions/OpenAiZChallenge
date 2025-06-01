"""Simplified Research Processing Pipeline.

Provides core functionality for processing indigenous knowledge research data.
"""

import logging
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import os
import asyncio

import numpy as np
import rasterio
# CORRECTED IMPORT: Only app_settings and global_config_manager
from ..config import app_settings, config_manager as global_app_config_manager
from ..core.enums import DataSourceType, ValidationStatus
from .satellite.sentinel_processor import SentinelProcessor
from .lidar.lidar_processor import LidarProcessor
# Assuming SatelliteDataCollector and LidarDataCollector are separate and needed:
from .satellite import SatelliteDataCollector
from .lidar import LidarDataCollector
from .image_processor import ImageProcessor
from ..analysis.pattern_detection import PatternDetectionEngine, PatternType
from .historical_texts import HistoricalTextProcessor
from .indigenous_maps import IndigenousMapProcessor
# from langchain.prompts import PromptTemplate # Uncomment if used

logger = logging.getLogger(__name__)

@dataclass
class ResearchDataPoint:
    """Comprehensive representation of a research data point."""
    site_id: str
    latitude: float
    longitude: float
    timestamp: datetime = field(default_factory=datetime.utcnow)
    area_definition: Optional[Dict[str, float]] = None
    data_sources: Dict[DataSourceType, Dict[str, Any]] = field(default_factory=dict)
    confidence_score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    validation_status: ValidationStatus = ValidationStatus.PENDING
    satellite_image_paths: Optional[List[str]] = None
    lidar_data_paths: Optional[List[str]] = None

class AnalysisPipeline:
    """Advanced research data processing pipeline."""
    
    def __init__(self, site_name: str, coordinates: Tuple[float, float], config_manager_instance: Any):
        self.site_name = site_name
        self.coordinates = coordinates
        self.config_manager = config_manager_instance # Use the passed instance

        # Paths from app_settings
        self.lidar_data_dir_path = app_settings.LIDAR_DATA_DIR
        self.satellite_data_dir_path = app_settings.SATELLITE_DATA_DIR
        
        # Feature flags from app_settings
        self.historical_texts_enabled = app_settings.processing.enable_historical_texts
        self.indigenous_maps_enabled = app_settings.processing.enable_indigenous_maps
        self.satellite_enabled = app_settings.processing.enable_satellite_processing
        self.lidar_enabled = app_settings.processing.enable_lidar_processing
        # self.max_concurrent_agents = app_settings.processing.max_concurrent_agents # If used

        self.historical_text_processor = HistoricalTextProcessor() if self.historical_texts_enabled else None
        self.indigenous_map_processor = IndigenousMapProcessor() if self.indigenous_maps_enabled else None

        # Credentials from app_settings
        sentinel_credentials = {
            "username": app_settings.sentinel.username,
            "password": app_settings.sentinel.password
        }
        lidar_credentials = {
            "username": app_settings.lidar_source.username,
            "password": app_settings.lidar_source.password,
            "token": app_settings.lidar_source.earthdata_token
        }

        # Initialize collectors and processors
        if self.satellite_enabled:
            self.satellite_collector = SatelliteDataCollector(
                credentials=sentinel_credentials,
                output_dir=str(self.satellite_data_dir_path)
            )
            self.satellite_processor = SentinelProcessor(
                credentials=sentinel_credentials,
                output_dir=str(self.satellite_data_dir_path)
            )
        else:
            self.satellite_collector = None
            self.satellite_processor = None
        
        if self.lidar_enabled:
            self.lidar_collector = LidarDataCollector(
                credentials=lidar_credentials,
                output_dir=str(self.lidar_data_dir_path)
            )
            self.lidar_processor = LidarProcessor(
                credentials=lidar_credentials,
                output_dir=str(self.lidar_data_dir_path)
            )
        else:
            self.lidar_collector = None
            self.lidar_processor = None
        
        self.image_processor = ImageProcessor()
        self.pattern_engine = PatternDetectionEngine()
    
    async def collect_data(self, site_id: str, bounds: Dict[str, float], data_sources: List[DataSourceType]) -> ResearchDataPoint:
        center_lat = (bounds['north'] + bounds['south']) / 2
        center_lon = (bounds['east'] + bounds['west']) / 2
        data_point = ResearchDataPoint(
            site_id=site_id, latitude=center_lat, longitude=center_lon, area_definition=bounds
        )
        
        loop = asyncio.get_event_loop()
        days_range = app_settings.processing.data_collection_days_range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_range * 365 if days_range > 0 else 5*365)

        if DataSourceType.SATELLITE in data_sources and self.satellite_collector and self.satellite_enabled:
            logger.info(f"Collecting Satellite data for {site_id}")
            try:
                logger.info(f"SITE_ID: {site_id} - STEP: Before satellite_collector.search_images")
                products = await loop.run_in_executor(None, self.satellite_collector.search_images, bounds, start_date, end_date)
                logger.info(f"SITE_ID: {site_id} - STEP: After satellite_collector.search_images, Products found: {'Yes' if products else 'No'}")
                if products:
                    logger.info(f"SITE_ID: {site_id} - STEP: Before satellite_collector.download_images")
                    satellite_images = await loop.run_in_executor(None, self.satellite_collector.download_images, products)
                    logger.info(f"SITE_ID: {site_id} - STEP: After satellite_collector.download_images, Images downloaded: {'Yes' if satellite_images else 'No'}")
                    if satellite_images:
                        data_point.satellite_image_paths = satellite_images
                        data_point.data_sources[DataSourceType.SATELLITE] = {'raw_image_paths': satellite_images}
            except Exception as e:
                logger.error(f"Error collecting satellite data for {site_id}: {e}", exc_info=True)

        if DataSourceType.LIDAR in data_sources and self.lidar_collector and self.lidar_enabled:
            logger.info(f"Collecting LIDAR data for {site_id}")
            try:
                logger.info(f"SITE_ID: {site_id} - STEP: Before lidar_collector.download_lidar_data")
                lidar_files = await loop.run_in_executor(None, self.lidar_collector.download_lidar_data, bounds, start_date, end_date)
                logger.info(f"SITE_ID: {site_id} - STEP: After lidar_collector.download_lidar_data, Files downloaded: {'Yes' if lidar_files else 'No'}")
                if lidar_files:
                    data_point.lidar_data_paths = lidar_files
                    data_point.data_sources[DataSourceType.LIDAR] = {'raw_lidar_paths': lidar_files}
            except Exception as e:
                logger.error(f"Error collecting LIDAR data for {site_id}: {e}", exc_info=True)

        if DataSourceType.HISTORICAL_TEXTS in data_sources and self.historical_text_processor and self.historical_texts_enabled:
            logger.info(f"Processing historical texts for {site_id}")
            try:
                logger.info(f"SITE_ID: {site_id} - STEP: Before historical_text_processor.process_area")
                texts_data = self.historical_text_processor.process_area(bounds)
                logger.info(f"SITE_ID: {site_id} - STEP: After historical_text_processor.process_area, Data found: {'Yes' if texts_data else 'No'}")
                data_point.data_sources[DataSourceType.HISTORICAL_TEXTS] = texts_data
            except Exception as e:
                logger.error(f"Error processing historical texts for {site_id}: {e}", exc_info=True)

        if DataSourceType.INDIGENOUS_MAPS in data_sources and self.indigenous_map_processor and self.indigenous_maps_enabled:
            logger.info(f"Processing indigenous maps for {site_id}")
            try:
                logger.info(f"SITE_ID: {site_id} - STEP: Before indigenous_map_processor.process_area")
                maps_data = self.indigenous_map_processor.process_area(bounds)
                logger.info(f"SITE_ID: {site_id} - STEP: After indigenous_map_processor.process_area, Data found: {'Yes' if maps_data else 'No'}")
                data_point.data_sources[DataSourceType.INDIGENOUS_MAPS] = maps_data
            except Exception as e:
                logger.error(f"Error processing indigenous maps for {site_id}: {e}", exc_info=True)
        return data_point
    
    def analyze_data(self, data_point: ResearchDataPoint) -> ResearchDataPoint:
        logger.info(f"Starting TEMPORARILY SIMPLIFIED analysis for {data_point.site_id}...")
        # --- User should restore full analysis logic from their original file here ---
        if data_point.data_sources:
            data_point.confidence_score = 0.1 * len(data_point.data_sources)
            data_point.validation_status = ValidationStatus.LOW_CONFIDENCE
            if data_point.confidence_score > 0.7: data_point.validation_status = ValidationStatus.HIGH_CONFIDENCE
            elif data_point.confidence_score > 0.4: data_point.validation_status = ValidationStatus.MEDIUM_CONFIDENCE
            else:
                data_point.confidence_score = 0.0
            data_point.validation_status = ValidationStatus.NO_DATA
        data_point.metadata['analysis_status'] = "Temporarily simplified analysis performed"
        logger.info(f"Completed TEMPORARILY SIMPLIFIED analysis for {data_point.site_id}. Confidence: {data_point.confidence_score}")
        return data_point

    async def _execute_tiled_processing(
        self, original_site_id: str, large_area_bounds: Dict[str, float],
        tile_height_deg: float, tile_width_deg: float, data_sources: List[DataSourceType]
    ) -> List[ResearchDataPoint]:
        all_tile_results = []
        min_lat, max_lat = large_area_bounds['south'], large_area_bounds['north']
        min_lon, max_lon = large_area_bounds['west'], large_area_bounds['east']
        num_rows = int(np.ceil((max_lat - min_lat) / tile_height_deg)) if tile_height_deg > 0 else 1
        num_cols = int(np.ceil((max_lon - min_lon) / tile_width_deg)) if tile_width_deg > 0 else 1

        for j in range(num_rows):
            tile_south = min_lat + j * tile_height_deg
            tile_north = min(min_lat + (j + 1) * tile_height_deg, max_lat)
            if tile_south >= tile_north: continue
            for i in range(num_cols):
                tile_west = min_lon + i * tile_width_deg
                tile_east = min(min_lon + (i + 1) * tile_width_deg, max_lon)
                if tile_west >= tile_east: continue

                tile_bounds_j_i = {'north': tile_north, 'south': tile_south, 'east': tile_east, 'west': tile_west}
                tile_site_id = f"{original_site_id}_tile_{j}_{i}"
                logger.info(f"Processing tile {tile_site_id}, Bounds: {tile_bounds_j_i}")
                try:
                    tile_data_point = await self.collect_data(tile_site_id, tile_bounds_j_i, data_sources)
                    analyzed_tile_data_point = self.analyze_data(tile_data_point)
                    all_tile_results.append(analyzed_tile_data_point)
                except Exception as e:
                    logger.error(f"Error processing tile {tile_site_id}: {e}", exc_info=True)
                    center_lat_err, center_lon_err = (tile_north + tile_south) / 2, (tile_east + tile_west) / 2
                    error_dp = ResearchDataPoint(
                        site_id=tile_site_id, latitude=center_lat_err, longitude=center_lon_err,
                        area_definition=tile_bounds_j_i, validation_status=ValidationStatus.ERROR,
                        metadata={'error': str(e)}
                    )
                    all_tile_results.append(error_dp)
        return all_tile_results

async def process_research_location(
    site_id: str, area_definition: Dict[str, float],
    data_sources: Optional[List[DataSourceType]] = None,
    tile_size_deg_lat: float = 0.2, tile_size_deg_lon: float = 0.2
) -> Union[ResearchDataPoint, List[ResearchDataPoint]]:
    if data_sources is None:
        data_sources = [DataSourceType.SATELLITE, DataSourceType.LIDAR]

    area_height_deg = area_definition['north'] - area_definition['south']
    area_width_deg = area_definition['east'] - area_definition['west']

    center_lat = (area_definition['north'] + area_definition['south']) / 2
    center_lon = (area_definition['east'] + area_definition['west']) / 2
    
    # CORRECTED Instantiation
    pipeline = AnalysisPipeline(
        site_name=site_id,
        coordinates=(center_lat, center_lon),
        config_manager_instance=global_app_config_manager # Use the global instance from src.config
    )

    if area_height_deg <= tile_size_deg_lat and area_width_deg <= tile_size_deg_lon:
        data_point = await pipeline.collect_data(site_id, area_definition, data_sources)
        return pipeline.analyze_data(data_point) 
    else:
        return await pipeline._execute_tiled_processing(
            original_site_id=site_id, large_area_bounds=area_definition,
            tile_height_deg=tile_size_deg_lat, tile_width_deg=tile_size_deg_lon,
            data_sources=data_sources
        )