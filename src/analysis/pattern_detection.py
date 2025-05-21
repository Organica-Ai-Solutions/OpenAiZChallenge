from typing import Dict, List, Optional, Union, Tuple
import numpy as np
from scipy import signal, ndimage
from sklearn.cluster import DBSCAN
from shapely.geometry import Point, Polygon, MultiPolygon
import geopandas as gpd
import pandas as pd
from datetime import datetime
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

# Import the processors from the data_processing directory
from ..data_processing.indigenous_maps import IndigenousMapProcessor
from ..data_processing.historical_texts import HistoricalTextProcessor

class PatternType(Enum):
    GEOMETRIC = "geometric"
    TEMPORAL = "temporal"
    SPATIAL = "spatial"
    COMPOSITE = "composite"

@dataclass
class Pattern:
    type: PatternType
    confidence: float
    coordinates: List[Tuple[float, float]]
    metadata: Dict
    timestamp: str = datetime.now().isoformat()

class PatternDetectionEngine:
    def __init__(self):
        # Configure detection parameters
        self.spatial_threshold = 0.8
        self.temporal_threshold = 0.7
        self.geometric_threshold = 0.75
        self.min_pattern_size = 3
        
        # Initialize detection algorithms
        self.spatial_detector = DBSCAN(
            eps=0.1,  # 100m in decimal degrees
            min_samples=self.min_pattern_size
        )
        
        # Initialize contextual processors
        self.indigenous_map_processor = IndigenousMapProcessor()
        self.historical_text_processor = HistoricalTextProcessor()
    
    def detect_patterns(
        self,
        data: Dict,
        pattern_types: Optional[List[PatternType]] = None
    ) -> List[Pattern]:
        """
        Detect patterns in the analysis data.
        
        Args:
            data: Dictionary containing analysis results. 
                  It's expected to have a 'location' key with 'lat', 'lon', 
                  and optionally 'radius_km'.
            pattern_types: Optional list of pattern types to detect
            
        Returns:
            List of detected patterns
        """
        try:
            if pattern_types is None:
                pattern_types = list(PatternType)
            
            patterns = []
            
            # Extract location data for contextual processors
            location_info = data.get("location", {})
            lat = location_info.get("lat")
            lon = location_info.get("lon")
            radius_km = location_info.get("radius_km", 50.0) # Default radius if not provided

            # Process indigenous knowledge
            if lat is not None and lon is not None:
                try:
                    indigenous_data = self.indigenous_map_processor.process_indigenous_knowledge(
                        lat=lat, lon=lon, radius_km=radius_km
                    )
                    # Merge indigenous_data into the main data dictionary
                    # We'll store it under a specific key, e.g., "indigenous_knowledge"
                    data["indigenous_knowledge"] = indigenous_data
                except Exception as e:
                    logger.error(f"Error processing indigenous knowledge: {str(e)}")

                # Process historical texts
                try:
                    historical_text_data = self.historical_text_processor.process_historical_texts(
                        lat=lat, lon=lon, radius_km=radius_km
                    )
                    # Merge historical_text_data into the main data dictionary
                    # We'll store it under a specific key, e.g., "historical_texts_processed"
                    # to avoid collision if 'historical' key is already used.
                    data["historical_texts_processed"] = historical_text_data
                except Exception as e:
                    logger.error(f"Error processing historical texts: {str(e)}")
            else:
                logger.warning("Latitude or Longitude not provided in data['location'], skipping contextual processors.")

            
            # Process each pattern type
            for pattern_type in pattern_types:
                if pattern_type == PatternType.GEOMETRIC:
                    patterns.extend(self._detect_geometric_patterns(data))
                elif pattern_type == PatternType.TEMPORAL:
                    patterns.extend(self._detect_temporal_patterns(data))
                elif pattern_type == PatternType.SPATIAL:
                    patterns.extend(self._detect_spatial_patterns(data))
                elif pattern_type == PatternType.COMPOSITE:
                    patterns.extend(self._detect_composite_patterns(data))
            
            # Filter and rank patterns
            ranked_patterns = self._rank_patterns(patterns)
            
            return ranked_patterns
            
        except Exception as e:
            logger.error(f"Error detecting patterns: {str(e)}")
            raise
    
    def _detect_geometric_patterns(self, data: Dict) -> List[Pattern]:
        """Detect geometric patterns like circles, lines, and grids."""
        patterns = []
        
        try:
            # Extract coordinates and features
            coordinates = self._extract_coordinates(data)
            if len(coordinates) < self.min_pattern_size:
                return patterns
            
            # Convert to numpy array
            points = np.array(coordinates)
            
            # Detect circular patterns
            circular = self._detect_circular_arrangement(points)
            if circular:
                patterns.append(Pattern(
                    type=PatternType.GEOMETRIC,
                    confidence=circular["confidence"],
                    coordinates=circular["coordinates"],
                    metadata={"shape": "circular"}
                ))
            
            # Detect linear patterns
            linear = self._detect_linear_arrangement(points)
            if linear:
                patterns.append(Pattern(
                    type=PatternType.GEOMETRIC,
                    confidence=linear["confidence"],
                    coordinates=linear["coordinates"],
                    metadata={"shape": "linear"}
                ))
            
            # Detect grid patterns
            grid = self._detect_grid_arrangement(points)
            if grid:
                patterns.append(Pattern(
                    type=PatternType.GEOMETRIC,
                    confidence=grid["confidence"],
                    coordinates=grid["coordinates"],
                    metadata={"shape": "grid"}
                ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detecting geometric patterns: {str(e)}")
            return patterns
    
    def _detect_temporal_patterns(self, data: Dict) -> List[Pattern]:
        """Detect temporal patterns in the data."""
        patterns = []
        
        try:
            # Extract temporal features
            temporal_data = self._extract_temporal_features(data)
            if not temporal_data:
                return patterns
            
            # Detect seasonal patterns
            seasonal = self._detect_seasonal_patterns(temporal_data)
            if seasonal:
                patterns.append(Pattern(
                    type=PatternType.TEMPORAL,
                    confidence=seasonal["confidence"],
                    coordinates=seasonal["coordinates"],
                    metadata={"pattern": "seasonal"}
                ))
            
            # Detect progressive patterns
            progressive = self._detect_progressive_patterns(temporal_data)
            if progressive:
                patterns.append(Pattern(
                    type=PatternType.TEMPORAL,
                    confidence=progressive["confidence"],
                    coordinates=progressive["coordinates"],
                    metadata={"pattern": "progressive"}
                ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detecting temporal patterns: {str(e)}")
            return patterns
    
    def _detect_spatial_patterns(self, data: Dict) -> List[Pattern]:
        """Detect spatial patterns using clustering."""
        patterns = []
        
        try:
            # Extract coordinates and features
            coordinates = self._extract_coordinates(data)
            if len(coordinates) < self.min_pattern_size:
                return patterns
            
            # Convert to numpy array
            points = np.array(coordinates)
            
            # Perform DBSCAN clustering
            clusters = self.spatial_detector.fit_predict(points)
            
            # Process clusters
            unique_clusters = np.unique(clusters)
            for cluster_id in unique_clusters:
                if cluster_id == -1:  # Skip noise points
                    continue
                
                # Get cluster points
                cluster_points = points[clusters == cluster_id]
                
                # Calculate cluster properties
                centroid = np.mean(cluster_points, axis=0)
                density = len(cluster_points) / self._calculate_area(cluster_points)
                
                patterns.append(Pattern(
                    type=PatternType.SPATIAL,
                    confidence=self._calculate_cluster_confidence(density),
                    coordinates=cluster_points.tolist(),
                    metadata={
                        "cluster_id": int(cluster_id),
                        "centroid": centroid.tolist(),
                        "density": float(density)
                    }
                ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detecting spatial patterns: {str(e)}")
            return patterns
    
    def _detect_composite_patterns(self, data: Dict) -> List[Pattern]:
        """Detect patterns that combine multiple pattern types."""
        patterns = []
        
        try:
            # Get individual patterns
            geometric = self._detect_geometric_patterns(data)
            temporal = self._detect_temporal_patterns(data)
            spatial = self._detect_spatial_patterns(data)
            
            # Look for overlapping patterns
            for g in geometric:
                for t in temporal:
                    overlap = self._calculate_pattern_overlap(g, t)
                    if overlap > 0.7:  # 70% overlap threshold
                        patterns.append(Pattern(
                            type=PatternType.COMPOSITE,
                            confidence=(g.confidence + t.confidence) / 2,
                            coordinates=g.coordinates,
                            metadata={
                                "components": ["geometric", "temporal"],
                                "overlap": overlap
                            }
                        ))
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error detecting composite patterns: {str(e)}")
            return patterns
    
    def _detect_circular_arrangement(self, points: np.ndarray) -> Optional[Dict]:
        """Detect circular arrangements of points."""
        if len(points) < self.min_pattern_size:
            return None
            
        try:
            # Calculate center and distances
            center = np.mean(points, axis=0)
            distances = np.linalg.norm(points - center, axis=1)
            
            # Check if distances are similar (circular arrangement)
            distance_std = np.std(distances)
            mean_distance = np.mean(distances)
            
            if distance_std / mean_distance < 0.2:  # 20% variation threshold
                return {
                    "confidence": 1 - (distance_std / mean_distance),
                    "coordinates": points.tolist()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting circular arrangement: {str(e)}")
            return None
    
    def _detect_linear_arrangement(self, points: np.ndarray) -> Optional[Dict]:
        """Detect linear arrangements of points."""
        if len(points) < self.min_pattern_size:
            return None
            
        try:
            # Fit line using linear regression
            x = points[:, 0]
            y = points[:, 1]
            
            coeffs = np.polyfit(x, y, 1)
            line = np.poly1d(coeffs)
            
            # Calculate residuals
            residuals = y - line(x)
            residual_std = np.std(residuals)
            
            if residual_std < 0.1:  # 100m threshold
                return {
                    "confidence": 1 - min(residual_std * 10, 0.9),  # Scale to 0-1
                    "coordinates": points.tolist()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting linear arrangement: {str(e)}")
            return None
    
    def _detect_grid_arrangement(self, points: np.ndarray) -> Optional[Dict]:
        """Detect grid arrangements of points."""
        if len(points) < 4:  # Minimum points for a grid
            return None
            
        try:
            # Calculate all pairwise distances
            distances = []
            for i in range(len(points)):
                for j in range(i + 1, len(points)):
                    distance = np.linalg.norm(points[i] - points[j])
                    distances.append(distance)
            
            distances = np.array(distances)
            
            # Look for common distances (grid spacing)
            hist, bins = np.histogram(distances, bins=20)
            peaks = signal.find_peaks(hist)[0]
            
            if len(peaks) >= 2:  # At least two common distances
                return {
                    "confidence": min(len(peaks) / 4, 0.9),  # Scale based on peaks
                    "coordinates": points.tolist()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting grid arrangement: {str(e)}")
            return None
    
    def _extract_temporal_features(self, data: Dict) -> Optional[Dict]:
        """Extract temporal features from the data."""
        try:
            temporal_features = {}
            
            # Extract dates and values
            if "satellite" in data:
                # Ensure data["satellite"] is a list of dicts with "date" and "value"
                if isinstance(data["satellite"], list) and \
                   all(isinstance(item, dict) and "date" in item and "value" in item for item in data["satellite"]):
                    dates = [item["date"] for item in data["satellite"]]
                    values = [item["value"] for item in data["satellite"]]
                    temporal_features["satellite"] = {
                        "dates": dates,
                        "values": values
                    }
                else:
                    logger.warning("Satellite data is not in the expected format for temporal feature extraction.")

            
            # Existing historical data extraction (if any, distinct from new historical_texts_processed)
            if "historical" in data:
                 # Ensure data["historical"] is a list of dicts with "date" and "value"
                if isinstance(data["historical"], list) and \
                   all(isinstance(item, dict) and "date" in item and "value" in item for item in data["historical"]):
                    dates = [item["date"] for item in data["historical"]]
                    values = [item["value"] for item in data["historical"]]
                    temporal_features["historical_original"] = { # Renamed to avoid conflict
                        "dates": dates,
                        "values": values
                    }
                else:
                    logger.warning("Original historical data is not in the expected format for temporal feature extraction.")

            # Extract temporal data from historical_texts_processed
            if "historical_texts_processed" in data and isinstance(data["historical_texts_processed"], dict):
                processed_texts = data["historical_texts_processed"]
                # Assuming 'references' is a list of dicts, each with a 'year' or 'date'
                # This needs to align with the actual output structure of HistoricalTextProcessor
                # From HistoricalTextProcessor: it returns a dict with "references": List[HistoricalReference]
                # HistoricalReference has a 'date' field.
                # And the aggregated output has 'temporal_range': {'earliest': min(dates), 'latest': max(dates), ...}
                
                # Let's try to extract from 'references' if available
                # The HistoricalTextProcessor from src/data_collection has a 'references' list
                # and each reference has a 'date'.
                # The one from src/data_processing returns a dict with 'references' which is a list of scored_references.
                # Each scored_reference has 'earliest_reference' (year) and 'references' (list of detailed refs with 'year')
                
                # For src/data_processing.historical_texts.HistoricalTextProcessor:
                # The main output `processed_results` contains `references`: list of `scored_references`.
                # Each `scored_reference` has `earliest_reference` (a year).
                # And each `scored_reference` also has `references` (list of dicts), where each dict has a `year`.
                
                # Let's focus on the output of `src/data_processing.historical_texts.HistoricalTextProcessor`
                # `process_historical_texts` returns `processed_results` which is a Dict.
                # This dict contains a key `references` which is a List[Dict] (scored_references).
                # Each dict in `scored_references` has an `earliest_reference` (year) and `references` (list of detailed text objects, each with a `year`).
                
                ht_references = processed_texts.get("references", [])
                historical_dates = []
                historical_values = [] # Placeholder for values if applicable, often not direct for texts

                for ref_group in ht_references: # ref_group is a scored_reference
                    if isinstance(ref_group.get("references"), list):
                        for detailed_ref in ref_group["references"]:
                            if detailed_ref and isinstance(detailed_ref, dict) and detailed_ref.get("year"):
                                try:
                                    # Attempt to parse year, could be string or int
                                    year_str = str(detailed_ref["year"])
                                    # For simplicity, we'll treat each mention as an event at that year.
                                    # We might need a more nuanced way to represent text "values".
                                    # For now, let's assume '1' as a value indicating presence/mention.
                                    historical_dates.append(f"{year_str}-01-01") # Convert year to a full date string for pd.to_datetime
                                    historical_values.append(detailed_ref.get("confidence", 1.0)) # Use confidence or a dummy value
                                except (ValueError, TypeError) as e:
                                    logger.warning(f"Could not parse year from historical text reference: {detailed_ref.get('year')}, error: {e}")
                
                if historical_dates:
                    temporal_features["historical_texts"] = {
                        "dates": historical_dates,
                        "values": historical_values
                    }
            
            return temporal_features if temporal_features else None
            
        except Exception as e:
            logger.error(f"Error extracting temporal features: {str(e)}")
            return None
    
    def _detect_seasonal_patterns(self, temporal_data: Dict) -> Optional[Dict]:
        """Detect seasonal patterns in temporal data."""
        try:
            seasonal_patterns = {}
            
            for source, data in temporal_data.items():
                dates = pd.to_datetime(data["dates"])
                values = np.array(data["values"])
                
                # Group by month and calculate mean
                monthly = pd.DataFrame({
                    "month": dates.month,
                    "value": values
                }).groupby("month").mean()
                
                # Check for seasonal variation
                variation = monthly["value"].std() / monthly["value"].mean()
                
                if variation > 0.1:  # 10% variation threshold
                    seasonal_patterns[source] = {
                        "confidence": min(variation * 2, 0.9),
                        "monthly_means": monthly["value"].tolist()
                    }
            
            if seasonal_patterns:
                return {
                    "confidence": np.mean([p["confidence"] for p in seasonal_patterns.values()]),
                    "coordinates": self._extract_coordinates(temporal_data)
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting seasonal patterns: {str(e)}")
            return None
    
    def _detect_progressive_patterns(self, temporal_data: Dict) -> Optional[Dict]:
        """Detect progressive patterns (trends) in temporal data."""
        try:
            progressive_patterns = {}
            
            for source, data in temporal_data.items():
                dates = pd.to_datetime(data["dates"])
                values = np.array(data["values"])
                
                # Calculate trend using linear regression
                days = (dates - dates.min()).days
                coeffs = np.polyfit(days, values, 1)
                slope = coeffs[0]
                
                # Calculate R-squared
                trend = np.poly1d(coeffs)(days)
                r_squared = 1 - np.sum((values - trend) ** 2) / np.sum((values - np.mean(values)) ** 2)
                
                if abs(slope) > 0.001 and r_squared > 0.7:  # Significant trend
                    progressive_patterns[source] = {
                        "confidence": r_squared,
                        "slope": float(slope)
                    }
            
            if progressive_patterns:
                return {
                    "confidence": np.mean([p["confidence"] for p in progressive_patterns.values()]),
                    "coordinates": self._extract_coordinates(temporal_data)
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting progressive patterns: {str(e)}")
            return None
    
    def _calculate_cluster_confidence(self, density: float) -> float:
        """Calculate confidence score for a spatial cluster."""
        # Normalize density to 0-1 range
        normalized_density = min(density / 10, 1.0)  # Assume max density of 10 points per unit area
        return normalized_density
    
    def _calculate_area(self, points: np.ndarray) -> float:
        """Calculate the area of a point cluster."""
        try:
            # Create convex hull
            hull = MultiPoint(points).convex_hull
            return hull.area
        except Exception:
            # Fallback to simple bounding box
            min_coords = np.min(points, axis=0)
            max_coords = np.max(points, axis=0)
            return (max_coords[0] - min_coords[0]) * (max_coords[1] - min_coords[1])
    
    def _calculate_pattern_overlap(self, pattern1: Pattern, pattern2: Pattern) -> float:
        """Calculate the overlap between two patterns."""
        try:
            # Convert coordinates to sets for comparison
            coords1 = set(map(tuple, pattern1.coordinates))
            coords2 = set(map(tuple, pattern2.coordinates))
            
            # Calculate Jaccard similarity
            intersection = len(coords1.intersection(coords2))
            union = len(coords1.union(coords2))
            
            return intersection / union if union > 0 else 0
            
        except Exception as e:
            logger.error(f"Error calculating pattern overlap: {str(e)}")
            return 0
    
    def _rank_patterns(self, patterns: List[Pattern]) -> List[Pattern]:
        """Rank patterns by confidence and complexity."""
        try:
            # Calculate composite scores
            scored_patterns = []
            for pattern in patterns:
                # Base score is the confidence
                score = pattern.confidence
                
                # Boost score based on pattern type
                if pattern.type == PatternType.COMPOSITE:
                    score *= 1.2  # 20% boost for composite patterns
                
                # Boost score based on number of points
                num_points = len(pattern.coordinates)
                score *= min(1 + (num_points / 20), 1.5)  # Up to 50% boost
                
                scored_patterns.append((score, pattern))
            
            # Sort by score
            scored_patterns.sort(reverse=True, key=lambda x: x[0])
            
            return [pattern for _, pattern in scored_patterns]
            
        except Exception as e:
            logger.error(f"Error ranking patterns: {str(e)}")
            return patterns
    
    def _extract_coordinates(self, data: Dict) -> List[Tuple[float, float]]:
        """Extract coordinates (longitude, latitude) from the data dictionary."""
        coordinates = []
        
        try:
            # First, try to get coordinates from a potential 'location' key if it's a simple lat/lon dict
            if 'location' in data and isinstance(data['location'], dict):
                loc = data['location']
                if 'longitude' in loc and 'latitude' in loc:
                    try:
                        lon = float(loc['longitude'])
                        lat = float(loc['latitude'])
                        coordinates.append((lon, lat))
                        # If this top-level location is the primary point of interest, 
                        # we might stop here or continue to gather more from nested structures.
                        # For pattern detection, we usually want all available points.
                    except (ValueError, TypeError):
                        logger.warning(f"Could not parse longitude/latitude from data['location']: {loc}")
            
            # Recursive extraction from the rest of the data structure
            # This will also explore data['indigenous_knowledge'] and data['historical_texts_processed']
            
            # Define a recursive helper function to avoid code duplication for different main keys
            def _recursive_extract(sub_data):
                extracted_coords = []
                if isinstance(sub_data, dict):
                    # Check for direct longitude/latitude keys
                    if 'longitude' in sub_data and 'latitude' in sub_data:
                        try:
                            lon = float(sub_data['longitude'])
                            lat = float(sub_data['latitude'])
                            extracted_coords.append((lon, lat))
                        except (ValueError, TypeError):
                            logger.warning(f"Could not parse longitude/latitude from dict: {sub_data}")
                    
                    # Check for 'geometry' field with 'coordinates' (common in GeoJSON-like structures)
                    # IndigenousMapProcessor (src/data_collection) uses this.
                    # IndigenousMapProcessor (src/data_processing) output: 'map_evidence' (list of dicts). Each dict can have 'bounds'.
                    #   'oral_evidence' (list of dicts). Each section can have 'locations' with 'coordinates'.
                    # HistoricalTextProcessor (src/data_collection) output: 'references' (list of HistoricalReference). Each has 'location': {'lat': ..., 'lon': ...}.
                    # HistoricalTextProcessor (src/data_processing) output: 'references' (list of scored_references).
                    #   Each scored_reference has 'references' (list of text dicts). Each text dict's 'locations' field (from NER) might have coordinates.
                    #   The NER output format for locations: [{'word': 'Amazon', 'entity_group': 'LOC', 'score': ..., 'start':..., 'end':...}] - no direct coords.
                    #   However, the input `historical_places.csv` for `src/data_processing/historical_texts.py` has lat/lon.
                    #   The `_process_document` method extracts 'locations' using NER, but these are entity mentions, not coords.
                    #   The `_find_relevant_documents` method uses `historical_places` (which has coords) to find relevant docs.
                    #   The output `processed_results` has 'references' -> list of scored_references. Each scored_reference has 'references' -> list of actual text segments.
                    #   These text segments have `locations` (NER output).
                    #   The `IndigenousMapProcessor` from `src/data_processing/indigenous_maps.py` has `known_locations` GeoDataFrame.
                    #   Its `_extract_locations` function (used for oral histories) returns `coordinates`: [lon, lat].

                    if 'geometry' in sub_data and isinstance(sub_data['geometry'], dict):
                        geom = sub_data['geometry']
                        if geom.get('type') == 'Point' and 'coordinates' in geom and isinstance(geom['coordinates'], (list, tuple)) and len(geom['coordinates']) == 2:
                            try:
                                lon, lat = float(geom['coordinates'][0]), float(geom['coordinates'][1])
                                extracted_coords.append((lon, lat))
                            except (ValueError, TypeError):
                                logger.warning(f"Could not parse Point geometry coordinates: {geom['coordinates']}")
                        elif geom.get('type') == 'Polygon' and 'coordinates' in geom and isinstance(geom['coordinates'], list):
                            # For polygons, we can take the centroid or all vertices.
                            # Taking all vertices might be too many for some pattern algos.
                            # For simplicity, let's try to get a representative point (e.g., first vertex of exterior ring).
                            try:
                                exterior_ring = geom['coordinates'][0]
                                if exterior_ring and isinstance(exterior_ring[0], (list, tuple)) and len(exterior_ring[0]) == 2:
                                    lon, lat = float(exterior_ring[0][0]), float(exterior_ring[0][1])
                                    extracted_coords.append((lon, lat))
                            except (IndexError, ValueError, TypeError):
                                logger.warning(f"Could not parse Polygon geometry coordinates: {geom['coordinates']}")
                    
                    # For HistoricalTextProcessor (src/data_collection format)
                    if 'location' in sub_data and isinstance(sub_data['location'], dict) and \
                       'lat' in sub_data['location'] and 'lon' in sub_data['location']:
                        try:
                            lat = float(sub_data['location']['lat'])
                            lon = float(sub_data['location']['lon'])
                            extracted_coords.append((lon, lat))
                        except (ValueError, TypeError):
                             logger.warning(f"Could not parse lat/lon from 'location' dict: {sub_data['location']}")


                    # Iterate over values for further recursion or direct coordinate extraction
                    for key, value in sub_data.items():
                        if key in ['longitude', 'latitude', 'geometry', 'location'] and isinstance(value, (dict, str, float, int)): # Already handled above or not coordinate container
                            continue
                        
                        extracted_coords.extend(_recursive_extract(value))

                elif isinstance(sub_data, list):
                    for item in sub_data:
                        extracted_coords.extend(_recursive_extract(item))
                
                # Handling tuples that might directly be coordinates (lon, lat)
                # This was in the original logic, keep as a fallback.
                elif isinstance(sub_data, (list, tuple)) and len(sub_data) == 2:
                    try:
                        v1, v2 = float(sub_data[0]), float(sub_data[1])
                        # Basic check to see if they look like lon/lat
                        if -180 <= v1 <= 180 and -90 <= v2 <= 90:
                             extracted_coords.append((v1, v2))
                        elif -180 <= v2 <= 180 and -90 <= v1 <= 90: # (lat, lon) case
                             extracted_coords.append((v2, v1))
                    except (ValueError, TypeError):
                        pass # Not a coordinate tuple

                return extracted_coords

            # Apply recursive extraction to the entire data dictionary
            # The initial coordinate from data['location'] (if present) is already added.
            # _recursive_extract will explore all other parts.
            all_extracted_coords = _recursive_extract(data)
            coordinates.extend(all_extracted_coords)
            
            # Remove duplicates and sort for deterministic output
            if coordinates:
                unique_coordinates = sorted(list(set(coordinates)))
                return unique_coordinates
            return []
            
        except Exception as e:
            logger.error(f"Error extracting coordinates: {str(e)}")
            return [] 