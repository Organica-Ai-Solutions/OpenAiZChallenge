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
    
    def detect_patterns(
        self,
        data: Dict,
        pattern_types: Optional[List[PatternType]] = None
    ) -> List[Pattern]:
        """
        Detect patterns in the analysis data.
        
        Args:
            data: Dictionary containing analysis results
            pattern_types: Optional list of pattern types to detect
            
        Returns:
            List of detected patterns
        """
        try:
            if pattern_types is None:
                pattern_types = list(PatternType)
            
            patterns = []
            
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
                dates = [item["date"] for item in data["satellite"]]
                values = [item["value"] for item in data["satellite"]]
                temporal_features["satellite"] = {
                    "dates": dates,
                    "values": values
                }
            
            if "historical" in data:
                dates = [item["date"] for item in data["historical"]]
                values = [item["value"] for item in data["historical"]]
                temporal_features["historical"] = {
                    "dates": dates,
                    "values": values
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
        """Extract coordinates from the data dictionary."""
        coordinates = []
        
        try:
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, (list, tuple)) and len(value) == 2:
                        try:
                            lat, lon = float(value[0]), float(value[1])
                            coordinates.append((lat, lon))
                        except (ValueError, TypeError):
                            continue
                    elif isinstance(value, dict):
                        coordinates.extend(self._extract_coordinates(value))
                    elif isinstance(value, list):
                        for item in value:
                            if isinstance(item, dict):
                                coordinates.extend(self._extract_coordinates(item))
            
            return coordinates
            
        except Exception as e:
            logger.error(f"Error extracting coordinates: {str(e)}")
            return coordinates 