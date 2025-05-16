"""Memory Agent for the NIS Protocol.

This agent stores and retrieves contextual information, including
previous findings, analysis results, and reference data.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any
import os
import time

# Setup logging
logger = logging.getLogger(__name__)


class MemoryAgent:
    """Agent for storing and retrieving contextual information."""
    
    def __init__(self, storage_dir: Optional[Path] = None):
        """Initialize the Memory Agent.
        
        Args:
            storage_dir: Directory to store memory files
        """
        self.storage_dir = storage_dir or Path("outputs") / "memory"
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        # In-memory cache for recent retrievals
        self.cache = {}
        
        # In production, we might use a database or vector store
        # For now, we'll use simple JSON files
        
        logger.info(f"Memory Agent initialized with storage at {self.storage_dir}")
    
    def store(self, key: str, data: Any, metadata: Optional[Dict] = None) -> str:
        """Store data in memory.
        
        Args:
            key: Unique identifier for the data
            data: The data to store
            metadata: Optional metadata about the data
            
        Returns:
            The storage key
        """
        if metadata is None:
            metadata = {}
        
        # Add timestamp and storage info
        metadata["timestamp"] = time.time()
        metadata["storage_format"] = "json"
        
        # Create the storage object
        storage_obj = {
            "key": key,
            "metadata": metadata,
            "data": data
        }
        
        # Store in the cache
        self.cache[key] = storage_obj
        
        # Store in a file
        try:
            safe_key = key.replace("/", "_").replace("\\", "_")
            file_path = self.storage_dir / f"{safe_key}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(storage_obj, f, indent=2)
            logger.info(f"Stored data with key '{key}' to {file_path}")
        except Exception as e:
            logger.error(f"Failed to store data with key '{key}': {str(e)}")
        
        return key
    
    def retrieve(self, key: str, use_cache: bool = True) -> Optional[Dict]:
        """Retrieve data from memory.
        
        Args:
            key: The key for the data to retrieve
            use_cache: Whether to use the in-memory cache
            
        Returns:
            The retrieved data or None if not found
        """
        # Check cache first if enabled
        if use_cache and key in self.cache:
            logger.info(f"Retrieved data with key '{key}' from cache")
            return self.cache[key]
        
        # Otherwise, try to load from file
        try:
            safe_key = key.replace("/", "_").replace("\\", "_")
            file_path = self.storage_dir / f"{safe_key}.json"
            
            if not file_path.exists():
                logger.warning(f"No data found for key '{key}'")
                return None
            
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Update cache
            self.cache[key] = data
            
            logger.info(f"Retrieved data with key '{key}' from {file_path}")
            return data
        except Exception as e:
            logger.error(f"Failed to retrieve data with key '{key}': {str(e)}")
            return None
    
    def store_finding(self, lat: float, lon: float, finding: Dict) -> str:
        """Store an archaeological finding.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            finding: The finding data
            
        Returns:
            The storage key
        """
        # Create a unique key based on coordinates
        key = f"finding_{lat:.6f}_{lon:.6f}"
        
        # Add coordinates to metadata
        metadata = {
            "lat": lat,
            "lon": lon,
            "type": "archaeological_finding"
        }
        
        # Store the finding
        return self.store(key, finding, metadata)
    
    def retrieve_finding(self, lat: float, lon: float) -> Optional[Dict]:
        """Retrieve a finding by coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            The finding data or None if not found
        """
        key = f"finding_{lat:.6f}_{lon:.6f}"
        result = self.retrieve(key)
        return result["data"] if result else None
    
    def store_analysis_history(self, session_id: str, history: List[Dict]) -> str:
        """Store analysis history for a session.
        
        Args:
            session_id: Unique session identifier
            history: List of analysis steps and results
            
        Returns:
            The storage key
        """
        key = f"history_{session_id}"
        metadata = {"type": "analysis_history"}
        return self.store(key, history, metadata)
    
    def retrieve_analysis_history(self, session_id: str) -> Optional[List[Dict]]:
        """Retrieve analysis history for a session.
        
        Args:
            session_id: The session identifier
            
        Returns:
            The analysis history or None if not found
        """
        key = f"history_{session_id}"
        result = self.retrieve(key)
        return result["data"] if result else None
    
    def store_reference_data(self, data_type: str, data_id: str, data: Any) -> str:
        """Store reference data (historical, indigenous, etc.).
        
        Args:
            data_type: Type of reference data
            data_id: Unique identifier for the data
            data: The reference data
            
        Returns:
            The storage key
        """
        key = f"reference_{data_type}_{data_id}"
        metadata = {"type": "reference_data", "data_type": data_type}
        return self.store(key, data, metadata)
    
    def retrieve_reference_data(self, data_type: str, data_id: str) -> Optional[Dict]:
        """Retrieve reference data.
        
        Args:
            data_type: Type of reference data
            data_id: Unique identifier for the data
            
        Returns:
            The reference data or None if not found
        """
        key = f"reference_{data_type}_{data_id}"
        result = self.retrieve(key)
        return result["data"] if result else None
    
    def find_nearby_findings(self, lat: float, lon: float, radius_km: float = 10.0) -> List[Dict]:
        """Find findings within a certain radius of coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            radius_km: Radius in kilometers to search
            
        Returns:
            List of findings within the radius
        """
        # In production, this would use a spatial database or index
        # For now, we'll just iterate through all files and filter
        
        nearby_findings = []
        
        try:
            # List all finding files
            finding_files = list(self.storage_dir.glob("finding_*.json"))
            
            for file_path in finding_files:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        stored_data = json.load(f)
                    
                    # Get coordinates from metadata
                    metadata = stored_data.get("metadata", {})
                    finding_lat = metadata.get("lat")
                    finding_lon = metadata.get("lon")
                    
                    if finding_lat is None or finding_lon is None:
                        continue
                    
                    # Calculate distance (simple approximation)
                    distance_km = self._calculate_distance(lat, lon, finding_lat, finding_lon)
                    
                    if distance_km <= radius_km:
                        # Add distance to the finding data
                        finding_data = stored_data["data"]
                        finding_data["distance_km"] = distance_km
                        nearby_findings.append(finding_data)
                except Exception as e:
                    logger.warning(f"Error processing finding file {file_path}: {str(e)}")
            
            # Sort by distance
            nearby_findings.sort(key=lambda x: x.get("distance_km", float('inf')))
            
            logger.info(f"Found {len(nearby_findings)} findings within {radius_km} km of {lat}, {lon}")
            
        except Exception as e:
            logger.error(f"Error finding nearby findings: {str(e)}")
        
        return nearby_findings
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers.
        
        This is a simple approximation. In production, use a proper geospatial library.
        
        Args:
            lat1: Latitude of first point
            lon1: Longitude of first point
            lat2: Latitude of second point
            lon2: Longitude of second point
            
        Returns:
            Distance in kilometers
        """
        import math
        
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = 6371 * c  # Earth radius in km
        
        return distance
    
    def clear_cache(self) -> None:
        """Clear the in-memory cache."""
        self.cache = {}
        logger.info("Memory cache cleared")
    
    def get_capabilities(self) -> Dict:
        """Return the capabilities of this agent."""
        return {
            "name": "MemoryAgent",
            "description": "Stores and retrieves information for the NIS Protocol",
            "storage_types": [
                "archaeological_findings",
                "analysis_history",
                "reference_data",
            ],
            "spatial_capabilities": ["nearby_search"],
        } 