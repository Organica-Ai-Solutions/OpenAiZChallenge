import numpy as np
import pandas as pd
import geopandas as gpd
from pathlib import Path
import logging
from typing import Dict, List, Optional, Union
import json
import rasterio
from rasterio.warp import transform_bounds
from shapely.geometry import Point, Polygon, box
import cv2
from PIL import Image
import torch
from transformers import pipeline
from concurrent.futures import ThreadPoolExecutor
import re

logger = logging.getLogger(__name__)

class IndigenousMapProcessor:
    def __init__(self):
        # Initialize directories
        self.data_dir = Path("data/indigenous_maps")
        self.cache_dir = Path("data/indigenous_cache")
        self.oral_history_dir = Path("data/oral_histories")
        
        for directory in [self.data_dir, self.cache_dir, self.oral_history_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Load models
        self.feature_extractor = self._load_feature_extractor()
        self.text_analyzer = pipeline(
            "text-classification",
            model="bert-base-multilingual-uncased",
            return_all_scores=True
        )
        
        # Load reference data
        self.reference_features = self._load_reference_features()
        self.known_locations = self._load_known_locations()
        
        # Configure thread pool
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def process_indigenous_knowledge(
        self,
        lat: float,
        lon: float,
        radius_km: float = 50.0
    ) -> Dict:
        """
        Process indigenous maps and oral histories for the given coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Search radius in kilometers
            
        Returns:
            Dict containing relevant features, oral histories, and confidence scores
        """
        try:
            # Check cache first
            cached_data = self._check_cache(lat, lon, radius_km)
            if cached_data is not None:
                return cached_data
            
            # Process in parallel
            with ThreadPoolExecutor() as executor:
                # Process maps
                map_future = executor.submit(
                    self._process_maps,
                    lat, lon, radius_km
                )
                
                # Process oral histories
                oral_future = executor.submit(
                    self._process_oral_histories,
                    lat, lon, radius_km
                )
                
                map_results = map_future.result()
                oral_results = oral_future.result()
            
            # Combine and analyze results
            combined_results = self._combine_results(
                map_results,
                oral_results,
                lat,
                lon
            )
            
            # Cache results
            self._cache_results(lat, lon, radius_km, combined_results)
            
            return combined_results
            
        except Exception as e:
            logger.error(f"Error processing indigenous knowledge for {lat}, {lon}: {str(e)}")
            raise
    
    def _load_feature_extractor(self) -> torch.nn.Module:
        """Load the feature extraction model."""
        # Use a pre-trained vision model
        return pipeline(
            "image-classification",
            model="microsoft/resnet-50",
            feature_extraction=True
        )
    
    def _load_reference_features(self) -> Dict:
        """Load reference features for pattern matching."""
        try:
            with open(self.data_dir / "reference_features.json", 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load reference features: {str(e)}")
            return {}
    
    def _load_known_locations(self) -> gpd.GeoDataFrame:
        """Load known indigenous location database."""
        try:
            # Load from GeoJSON
            return gpd.read_file(self.data_dir / "known_locations.geojson")
        except Exception as e:
            logger.warning(f"Could not load known locations: {str(e)}")
            return gpd.GeoDataFrame()
    
    def _process_maps(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> List[Dict]:
        """Process indigenous maps for the area."""
        results = []
        search_area = self._create_search_area(lat, lon, radius_km)
        
        # Find relevant maps
        for map_path in self.data_dir.glob("**/*.tif"):
            try:
                with rasterio.open(map_path) as src:
                    # Check if map covers the area
                    bounds = transform_bounds(
                        src.crs,
                        'EPSG:4326',
                        *src.bounds
                    )
                    map_box = box(*bounds)
                    
                    if not map_box.intersects(search_area):
                        continue
                    
                    # Process the map
                    result = self._analyze_map(
                        src,
                        map_path,
                        search_area
                    )
                    
                    if result:
                        results.append(result)
                        
            except Exception as e:
                logger.error(f"Error processing map {map_path}: {str(e)}")
        
        return results
    
    def _process_oral_histories(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> List[Dict]:
        """Process oral histories for the area."""
        results = []
        search_area = self._create_search_area(lat, lon, radius_km)
        
        # Find relevant oral histories
        for history_path in self.oral_history_dir.glob("**/*.txt"):
            try:
                with open(history_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Process the oral history
                result = self._analyze_oral_history(
                    content,
                    history_path,
                    search_area
                )
                
                if result:
                    results.append(result)
                    
            except Exception as e:
                logger.error(f"Error processing oral history {history_path}: {str(e)}")
        
        return results
    
    def _analyze_map(
        self,
        src: rasterio.DatasetReader,
        map_path: Path,
        search_area: Polygon
    ) -> Optional[Dict]:
        """Analyze a single indigenous map."""
        try:
            # Read the map data
            data = src.read()
            
            # Extract features
            features = self._extract_map_features(data)
            
            # Match against reference features
            matches = self._match_features(features)
            
            # Calculate confidence
            confidence = self._calculate_map_confidence(matches)
            
            return {
                'type': 'map',
                'source': str(map_path),
                'features': matches,
                'confidence': confidence,
                'bounds': src.bounds,
                'metadata': self._extract_map_metadata(map_path)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing map {map_path}: {str(e)}")
            return None
    
    def _analyze_oral_history(
        self,
        content: str,
        history_path: Path,
        search_area: Polygon
    ) -> Optional[Dict]:
        """Analyze a single oral history text."""
        try:
            # Split into sections
            sections = re.split(r'\n\n+', content)
            
            relevant_sections = []
            for section in sections:
                # Analyze sentiment and relevance
                analysis = self.text_analyzer(section)
                
                # Check if section mentions locations
                locations = self._extract_locations(section)
                
                if locations:
                    relevant_sections.append({
                        'text': section,
                        'locations': locations,
                        'analysis': analysis
                    })
            
            if not relevant_sections:
                return None
            
            return {
                'type': 'oral_history',
                'source': str(history_path),
                'sections': relevant_sections,
                'confidence': self._calculate_oral_confidence(relevant_sections),
                'metadata': self._extract_history_metadata(history_path)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing oral history {history_path}: {str(e)}")
            return None
    
    def _extract_map_features(self, data: np.ndarray) -> np.ndarray:
        """Extract features from map data."""
        # Convert to RGB if necessary
        if data.shape[0] == 1:
            data = np.repeat(data, 3, axis=0)
        
        # Normalize
        data = data / np.max(data)
        
        # Extract features using the model
        features = self.feature_extractor(data.transpose(1, 2, 0))
        
        return features
    
    def _match_features(self, features: np.ndarray) -> List[Dict]:
        """Match extracted features against reference database."""
        matches = []
        
        for ref_name, ref_features in self.reference_features.items():
            similarity = self._calculate_similarity(features, ref_features)
            if similarity > 0.8:  # Threshold
                matches.append({
                    'type': ref_name,
                    'similarity': float(similarity)
                })
        
        return matches
    
    def _calculate_similarity(
        self,
        features1: np.ndarray,
        features2: np.ndarray
    ) -> float:
        """Calculate cosine similarity between feature vectors."""
        return float(
            np.dot(features1, features2) /
            (np.linalg.norm(features1) * np.linalg.norm(features2))
        )
    
    def _extract_locations(self, text: str) -> List[Dict]:
        """Extract location references from text."""
        locations = []
        
        # Check against known locations
        if not self.known_locations.empty:
            for _, location in self.known_locations.iterrows():
                if location['name'].lower() in text.lower():
                    locations.append({
                        'name': location['name'],
                        'type': location['type'],
                        'coordinates': [
                            location.geometry.x,
                            location.geometry.y
                        ]
                    })
        
        return locations
    
    def _create_search_area(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> Polygon:
        """Create a search area polygon."""
        return box(
            lon - radius_km/111.32,
            lat - radius_km/111.32,
            lon + radius_km/111.32,
            lat + radius_km/111.32
        )
    
    def _combine_results(
        self,
        map_results: List[Dict],
        oral_results: List[Dict],
        lat: float,
        lon: float
    ) -> Dict:
        """Combine and analyze all results."""
        # Combine all evidence
        combined = {
            'map_evidence': map_results,
            'oral_evidence': oral_results,
            'total_sources': len(map_results) + len(oral_results),
            'analysis': {
                'target_location': [lat, lon],
                'confidence_scores': {
                    'maps': np.mean([r['confidence'] for r in map_results]) if map_results else 0.0,
                    'oral': np.mean([r['confidence'] for r in oral_results]) if oral_results else 0.0
                }
            }
        }
        
        # Calculate overall confidence
        combined['analysis']['overall_confidence'] = (
            combined['analysis']['confidence_scores']['maps'] * 0.6 +
            combined['analysis']['confidence_scores']['oral'] * 0.4
        )
        
        return combined
    
    def _calculate_map_confidence(self, matches: List[Dict]) -> float:
        """Calculate confidence score for map analysis."""
        if not matches:
            return 0.0
        
        return np.mean([m['similarity'] for m in matches])
    
    def _calculate_oral_confidence(self, sections: List[Dict]) -> float:
        """Calculate confidence score for oral history analysis."""
        if not sections:
            return 0.0
        
        # Consider number of location mentions and sentiment analysis
        location_score = min(len(sections) / 5.0, 1.0)
        sentiment_score = np.mean([
            max(s['analysis'][0]['score'] for s in section['analysis'])
            for section in sections
        ])
        
        return (location_score * 0.6 + sentiment_score * 0.4)
    
    def _extract_map_metadata(self, map_path: Path) -> Dict:
        """Extract metadata from map file."""
        return {
            'filename': map_path.name,
            'type': map_path.suffix[1:],
            'size': map_path.stat().st_size
        }
    
    def _extract_history_metadata(self, history_path: Path) -> Dict:
        """Extract metadata from oral history file."""
        return {
            'filename': history_path.name,
            'type': 'text',
            'size': history_path.stat().st_size
        }
    
    def _check_cache(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> Optional[Dict]:
        """Check if results exist in cache."""
        cache_file = self.cache_dir / f"indigenous_{lat}_{lon}_{radius_km}.json"
        if cache_file.exists():
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def _cache_results(
        self,
        lat: float,
        lon: float,
        radius_km: float,
        results: Dict
    ) -> None:
        """Cache the processed results."""
        cache_file = self.cache_dir / f"indigenous_{lat}_{lon}_{radius_km}.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2) 