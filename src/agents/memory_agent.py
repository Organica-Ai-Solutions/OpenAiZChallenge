"""Memory Agent for the NIS Protocol.

This agent stores and retrieves information about archaeological sites
and previous analyses.
"""

import logging
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
import time

# Import the GPT integration
from src.meta.gpt_integration import GPTIntegration

# Import infrastructure
from src.infrastructure import get_redis_client, get_kafka_client

# Setup logging
logger = logging.getLogger(__name__)


class MemoryAgent:
    """Agent for storing and retrieving information about archaeological sites."""
    
    def __init__(self, storage_dir: Optional[Path] = None, gpt_model: str = "gpt-4o"):
        """Initialize the Memory Agent.
        
        Args:
            storage_dir: Directory for storing memory data
            gpt_model: GPT model to use for memory operations
        """
        self.storage_dir = storage_dir or Path("outputs/memory")
        self.sites_dir = self.storage_dir / "sites"
        self.regions_dir = self.storage_dir / "regions"
        self.patterns_dir = self.storage_dir / "patterns"
        
        # Create directories if they don't exist
        os.makedirs(self.sites_dir, exist_ok=True)
        os.makedirs(self.regions_dir, exist_ok=True)
        os.makedirs(self.patterns_dir, exist_ok=True)
        
        # Initialize GPT for enhanced memory operations
        try:
            self.gpt = GPTIntegration(model_name=gpt_model)
            logger.info(f"Initialized GPT integration for Memory Agent with model: {gpt_model}")
            self.use_live_gpt = True
        except Exception as e:
            logger.warning(f"Failed to initialize GPT integration: {str(e)}. Using basic memory functions.")
            self.use_live_gpt = False
        
        # Initialize Redis for caching
        try:
            self.redis = get_redis_client()
            logger.info("Initialized Redis for Memory Agent caching")
            self.use_redis = True
        except Exception as e:
            logger.warning(f"Failed to initialize Redis: {str(e)}. Using file-based storage only.")
            self.use_redis = False
        
        # Initialize Kafka for event streaming
        try:
            self.kafka = get_kafka_client()
            logger.info("Initialized Kafka for Memory Agent events")
            self.use_kafka = True
        except Exception as e:
            logger.warning(f"Failed to initialize Kafka: {str(e)}. Using local events only.")
            self.use_kafka = False
        
        logger.info("Memory Agent initialized with storage at {}".format(self.storage_dir))
    
    def store_site_data(self, lat: float, lon: float, data: Dict) -> bool:
        """Store data about a specific archaeological site.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            data: Site data to store
            
        Returns:
            Success status
        """
        try:
            # Create a unique ID for the site based on coordinates
            site_id = self._get_site_id(lat, lon)
            
            # Prepare the data for storage
            storage_data = {
                "site_id": site_id,
                "coordinates": {"lat": lat, "lon": lon},
                "last_updated": time.time(),
            "data": data
        }
        
            # Write to Redis cache if available
            if self.use_redis:
                cache_key = f"site:{site_id}"
                self.redis.cache_set(cache_key, storage_data)
                logger.debug(f"Stored site data in Redis cache with key: {cache_key}")
            
            # Write to disk
            site_file = self.sites_dir / f"{site_id}.json"
            with open(site_file, "w", encoding="utf-8") as f:
                json.dump(storage_data, f, indent=2)
            
            # Also store patterns for cross-referencing
            if "pattern_type" in data:
                self._update_pattern_index(data["pattern_type"], site_id, {"lat": lat, "lon": lon})
                
            # Update region index
            region = self._get_region_for_coordinates(lat, lon)
            if region:
                self._update_region_index(region, site_id, {"lat": lat, "lon": lon})
            
            # Publish event to Kafka
            if self.use_kafka:
                event_data = {
                    "event_type": "site_data_stored",
                    "site_id": site_id,
                    "coordinates": {"lat": lat, "lon": lon},
                    "pattern_type": data.get("pattern_type", "unknown"),
                    "confidence": data.get("confidence", 0.0),
                    "timestamp": time.time()
                }
                self.kafka.produce("nis.memory.events", event_data, key=site_id)
                logger.debug(f"Published site data storage event to Kafka for site: {site_id}")
            
            logger.info(f"Stored data for site at {lat}, {lon} with ID {site_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing site data: {str(e)}")
            return False
    
    def retrieve_site_data(self, lat: float, lon: float) -> Optional[Dict]:
        """Retrieve data about a specific archaeological site.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Site data or None if not found
        """
        try:
            site_id = self._get_site_id(lat, lon)
            
            # Try to get from Redis cache first
            if self.use_redis:
                cache_key = f"site:{site_id}"
                cached_data = self.redis.cache_get(cache_key)
                if cached_data:
                    logger.debug(f"Retrieved site data from Redis cache with key: {cache_key}")
                    return cached_data["data"]
            
            # Fall back to file storage
            site_file = self.sites_dir / f"{site_id}.json"
            
            if not site_file.exists():
                logger.info(f"No data found for site at {lat}, {lon}")
                return None
            
            with open(site_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Cache the data in Redis for future requests
            if self.use_redis:
                cache_key = f"site:{site_id}"
                self.redis.cache_set(cache_key, data, ttl=3600)  # Cache for 1 hour
            
            logger.info(f"Retrieved data for site at {lat}, {lon}")
            return data["data"]
            
        except Exception as e:
            logger.error(f"Error retrieving site data: {str(e)}")
            return None
    
    def find_similar_sites(self, 
                          pattern_type: str, 
                          region: Optional[str] = None, 
                          max_results: int = 5) -> List[Dict]:
        """Find similar archaeological sites based on pattern type.
        
        Args:
            pattern_type: Type of pattern to search for
            region: Optional region to restrict search
            max_results: Maximum number of results to return
            
        Returns:
            List of similar sites
        """
        try:
            # Check Redis cache first
            cache_key = f"similar:pattern:{pattern_type}"
            if region:
                cache_key += f":region:{region}"
            
            if self.use_redis:
                cached_results = self.redis.cache_get(cache_key)
                if cached_results:
                    logger.debug(f"Retrieved similar sites from Redis cache with key: {cache_key}")
                    return cached_results[:max_results]
            
            # Look up sites with this pattern
            pattern_file = self.patterns_dir / f"{self._sanitize_filename(pattern_type)}.json"
            
            if not pattern_file.exists():
                logger.info(f"No sites found with pattern type: {pattern_type}")
                return []
            
            with open(pattern_file, "r", encoding="utf-8") as f:
                pattern_data = json.load(f)
            
            sites = pattern_data.get("sites", [])
            
            # Filter by region if specified
            if region:
                region_file = self.regions_dir / f"{self._sanitize_filename(region)}.json"
                if region_file.exists():
                    with open(region_file, "r", encoding="utf-8") as f:
                        region_data = json.load(f)
                    
                    region_sites = set(site["site_id"] for site in region_data.get("sites", []))
                    sites = [site for site in sites if site["site_id"] in region_sites]
            
            # Limit results
            sites = sites[:max_results]
            
            # Load full site data for each result
            result = []
            for site in sites:
                site_data = self.retrieve_site_data(site["coordinates"]["lat"], site["coordinates"]["lon"])
                if site_data:
                    result.append({
                        "coordinates": site["coordinates"],
                        "data": site_data
                    })
            
            # Cache the results
            if self.use_redis:
                self.redis.cache_set(cache_key, result, ttl=3600)  # Cache for 1 hour
            
            logger.info(f"Found {len(result)} similar sites with pattern type: {pattern_type}")
            return result
            
        except Exception as e:
            logger.error(f"Error finding similar sites: {str(e)}")
            return []
    
    def get_regional_summary(self, region: str) -> Optional[Dict]:
        """Get a summary of archaeological findings in a region.
        
        Args:
            region: Name of the region
            
        Returns:
            Summary data or None if not found
        """
        try:
            # Check Redis cache first
            cache_key = f"summary:region:{region}"
            
            if self.use_redis:
                cached_summary = self.redis.cache_get(cache_key)
                if cached_summary:
                    logger.debug(f"Retrieved regional summary from Redis cache with key: {cache_key}")
                    return cached_summary
            
            region_file = self.regions_dir / f"{self._sanitize_filename(region)}.json"
            
            if not region_file.exists():
                logger.info(f"No data found for region: {region}")
                return None
            
            with open(region_file, "r", encoding="utf-8") as f:
                region_data = json.load(f)
            
            # Get site data for each site in the region
            sites = []
            for site_ref in region_data.get("sites", []):
                site_data = self.retrieve_site_data(
                    site_ref["coordinates"]["lat"], 
                    site_ref["coordinates"]["lon"]
                )
                if site_data:
                    sites.append({
                        "coordinates": site_ref["coordinates"],
                        "data": site_data
                    })
            
            # Generate summary with GPT if available
            if self.use_live_gpt and sites:
                summary = self._generate_region_summary(region, sites)
            else:
                summary = region_data.get("summary", {
                    "description": f"Region {region} contains {len(sites)} known archaeological sites.",
                    "dominant_patterns": self._get_dominant_patterns(sites),
                    "time_periods": []
                })
            
            result = {
                "region": region,
                "site_count": len(sites),
                "summary": summary,
                "sites": [{"lat": s["coordinates"]["lat"], "lon": s["coordinates"]["lon"]} for s in sites]
            }
            
            # Cache the results
            if self.use_redis:
                self.redis.cache_set(cache_key, result, ttl=7200)  # Cache for 2 hours
            
            logger.info(f"Retrieved summary for region: {region}")
            return result
            
        except Exception as e:
            logger.error(f"Error getting regional summary: {str(e)}")
            return None
    
    def find_potential_connections(self, site_ids: List[str]) -> Dict:
        """Find potential connections between archaeological sites.
        
        Args:
            site_ids: List of site IDs to analyze
            
        Returns:
            Dictionary with connection analysis
        """
        try:
            # Generate cache key based on sorted site IDs
            cache_key = f"connections:{','.join(sorted(site_ids))}"
            
            # Check Redis cache first
            if self.use_redis:
                cached_connections = self.redis.cache_get(cache_key)
                if cached_connections:
                    logger.debug(f"Retrieved connection analysis from Redis cache")
                    return cached_connections
            
            # Load site data for each ID
            sites = []
            for site_id in site_ids:
                site_file = self.sites_dir / f"{site_id}.json"
                if site_file.exists():
                    with open(site_file, "r", encoding="utf-8") as f:
                        site_data = json.load(f)
                        sites.append(site_data)
            
            if not sites:
                logger.info("No valid sites found for connection analysis")
                return {"connections": [], "analysis": "No valid sites found"}
            
            # For basic analysis without GPT
            if not self.use_live_gpt:
                connections = self._basic_connection_analysis(sites)
                result = {
                    "site_count": len(sites),
                    "connections": connections,
                    "analysis": f"Found {len(connections)} potential connections between {len(sites)} sites."
                }
            else:
                # Use GPT for enhanced connection analysis
                # Format site data for GPT
                site_contexts = []
                for site in sites:
                    coord = site.get("coordinates", {})
                    data = site.get("data", {})
                    
                    context = {
                        "title": f"Site {site.get('site_id', 'Unknown')}",
                        "type": "archaeological_site",
                        "content": (
                            f"Coordinates: {coord.get('lat', 0)}, {coord.get('lon', 0)}\n"
                            f"Pattern: {data.get('pattern_type', 'Unknown')}\n"
                            f"Description: {data.get('description', '')}\n"
                            f"Confidence: {data.get('confidence', 0)}\n"
                        )
                    }
                    site_contexts.append(context)
                
                # Call GPT for analysis
                gpt_result = self.gpt.multimodal_research(
                    query="Analyze the potential connections between these archaeological sites. Identify patterns, possible trade routes, cultural relationships, or other significant connections.",
                    context=site_contexts
                )
                
                connections = self._extract_connections_from_text(gpt_result.get("analysis", ""))
                
                result = {
                    "site_count": len(sites),
                    "connections": connections,
                    "analysis": gpt_result.get("analysis", ""),
                    "site_ids": site_ids
                }
            
            # Cache the results
            if self.use_redis:
                self.redis.cache_set(cache_key, result, ttl=86400)  # Cache for 24 hours
            
            # Publish event to Kafka
            if self.use_kafka:
                event_data = {
                    "event_type": "connection_analysis",
                    "site_count": len(sites),
                    "connection_count": len(connections),
                    "site_ids": site_ids,
                    "timestamp": time.time()
                }
                self.kafka.produce("nis.analysis.events", event_data)
            
            logger.info(f"Completed connection analysis for {len(sites)} sites")
            return result
            
        except Exception as e:
            logger.error(f"Error finding potential connections: {str(e)}")
            return {"connections": [], "analysis": f"Error: {str(e)}"}
    
    def analyze_temporal_patterns(self, 
                                 region: str,
                                 historical_timeline: Optional[List[Dict]] = None) -> Dict:
        """Analyze temporal patterns in archaeological sites for a region.
        
        Args:
            region: Name of the region
            historical_timeline: Optional list of historical events
            
        Returns:
            Temporal analysis
        """
        try:
            # Generate cache key
            cache_key = f"temporal:region:{region}"
            
            # Check Redis cache first
            if self.use_redis:
                cached_analysis = self.redis.cache_get(cache_key)
                if cached_analysis:
                    logger.debug(f"Retrieved temporal analysis from Redis cache")
                    return cached_analysis
            
            # Get sites in the region
            region_summary = self.get_regional_summary(region)
            if not region_summary:
                return {"error": f"No data found for region: {region}"}
            
            site_refs = region_summary.get("sites", [])
            
            # If no historical timeline provided, use a default one
            if not historical_timeline:
                historical_timeline = self._get_default_historical_timeline()
            
            # If we have GPT, use it for enhanced analysis
            if self.use_live_gpt and site_refs:
                # Get the first site to use as an example
                example_site = None
                if site_refs and len(site_refs) > 0:
                    site_data = self.retrieve_site_data(site_refs[0]["lat"], site_refs[0]["lon"])
                    if site_data:
                        example_site = {
                            "lat": site_refs[0]["lat"],
                            "lon": site_refs[0]["lon"],
                            "pattern_type": site_data.get("pattern_type", ""),
                            "description": site_data.get("description", "")
                        }
                
                if example_site:
                    # Get region context
                    region_context = region_summary.get("summary", {}).get("description", f"Region in the Amazon basin")
                    
                    # Use GPT for temporal analysis
                    analysis = self.gpt.temporal_analysis(
                        site_data=example_site,
                        historical_timeline=historical_timeline,
                        region_context=region_context
                    )
                    
                    # Add site count information
                    analysis["site_count"] = len(site_refs)
                    analysis["region"] = region
                    
                    # Cache the results
                    if self.use_redis:
                        self.redis.cache_set(cache_key, analysis, ttl=86400)  # Cache for 24 hours
                    
                    # Publish event to Kafka
                    if self.use_kafka:
                        event_data = {
                            "event_type": "temporal_analysis",
                            "region": region,
                            "site_count": len(site_refs),
                            "timestamp": time.time()
                        }
                        self.kafka.produce("nis.analysis.events", event_data)
                    
                    logger.info(f"Completed temporal analysis for region: {region}")
                    return analysis
            
            # Fallback basic analysis
            result = {
                "region": region,
                "site_count": len(site_refs),
                "temporal_analysis": f"Region {region} contains {len(site_refs)} archaeological sites.",
                "likely_time_periods": []
            }
            
            # Cache the fallback results
            if self.use_redis:
                self.redis.cache_set(cache_key, result, ttl=3600)  # Cache for 1 hour (shorter for fallback)
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing temporal patterns: {str(e)}")
            return {"error": str(e)}
    
    def _get_site_id(self, lat: float, lon: float) -> str:
        """Generate a unique ID for a site based on coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Site ID string
        """
        # Format coordinates to 4 decimal places and combine
        return f"site_{lat:.4f}_{lon:.4f}".replace("-", "n").replace(".", "p")
    
    def _update_pattern_index(self, pattern_type: str, site_id: str, coordinates: Dict) -> None:
        """Update the index of sites with a particular pattern.
        
        Args:
            pattern_type: Type of pattern
            site_id: Site ID to add
            coordinates: Site coordinates
        """
        pattern_file = self.patterns_dir / f"{self._sanitize_filename(pattern_type)}.json"
        
        if pattern_file.exists():
            with open(pattern_file, "r", encoding="utf-8") as f:
                pattern_data = json.load(f)
        else:
            pattern_data = {
                "pattern_type": pattern_type,
                "sites": []
            }
        
        # Check if site already exists
        site_exists = any(site["site_id"] == site_id for site in pattern_data["sites"])
        
        if not site_exists:
            pattern_data["sites"].append({
                "site_id": site_id,
                "coordinates": coordinates
            })
        
        with open(pattern_file, "w", encoding="utf-8") as f:
            json.dump(pattern_data, f, indent=2)
        
        # Update Redis cache
        if self.use_redis:
            cache_key = f"pattern:{self._sanitize_filename(pattern_type)}"
            self.redis.cache_set(cache_key, pattern_data)
    
    def _update_region_index(self, region: str, site_id: str, coordinates: Dict) -> None:
        """Update the index of sites in a particular region.
        
        Args:
            region: Region name
            site_id: Site ID to add
            coordinates: Site coordinates
        """
        region_file = self.regions_dir / f"{self._sanitize_filename(region)}.json"
        
        if region_file.exists():
            with open(region_file, "r", encoding="utf-8") as f:
                region_data = json.load(f)
        else:
            region_data = {
                "region": region,
                "sites": [],
                "summary": {
                    "description": f"Region {region}",
                    "dominant_patterns": [],
                    "time_periods": []
                }
            }
        
        # Check if site already exists
        site_exists = any(site["site_id"] == site_id for site in region_data["sites"])
        
        if not site_exists:
            region_data["sites"].append({
                "site_id": site_id,
                "coordinates": coordinates
            })
        
        with open(region_file, "w", encoding="utf-8") as f:
            json.dump(region_data, f, indent=2)
        
        # Update Redis cache
        if self.use_redis:
            cache_key = f"region:{self._sanitize_filename(region)}"
            self.redis.cache_set(cache_key, region_data)
            
            # Also invalidate any regional summary cache
            summary_key = f"summary:region:{region}"
            self.redis.cache_delete(summary_key)
    
    def _sanitize_filename(self, text: str) -> str:
        """Sanitize text for use in filenames.
        
        Args:
            text: Text to sanitize
            
        Returns:
            Sanitized text
        """
        # Replace characters that are invalid in filenames
        return text.replace(" ", "_").replace("/", "_").replace("\\\\", "_").replace(":", "_").lower()
    
    def _get_region_for_coordinates(self, lat: float, lon: float) -> Optional[str]:
        """Determine the region name for given coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Region name or None
        """
        # This is a simplified approach - in production would use proper GIS
        # Define regions based on coordinate ranges
        regions = {
            "Upper Xingu": (-13.0, -3.0, -55.0, -50.0),  # lat_min, lat_max, lon_min, lon_max
            "Tapajós": (-8.0, -2.0, -60.0, -54.0),
            "Rio Negro": (-3.0, 3.0, -68.0, -60.0),
            "Llanos de Moxos": (-15.0, -10.0, -68.0, -63.0),
            "Ucayali": (-10.0, -7.0, -76.0, -73.0)
        }
        
        for region_name, bounds in regions.items():
            lat_min, lat_max, lon_min, lon_max = bounds
            if lat_min <= lat <= lat_max and lon_min <= lon <= lon_max:
                return region_name
        
        # Default to a general name based on the quadrant
        ns = "North" if lat >= 0 else "South"
        ew = "East" if lon >= 0 else "West"
        return f"{ns} Amazon {ew}"
    
    def _generate_region_summary(self, region: str, sites: List[Dict]) -> Dict:
        """Generate a summary of a region using GPT.
        
        Args:
            region: Region name
            sites: List of sites in the region
            
        Returns:
            Summary dictionary
        """
        if not self.use_live_gpt or not sites:
            return {
                "description": f"Region {region} contains {len(sites)} known archaeological sites.",
                "dominant_patterns": self._get_dominant_patterns(sites),
                "time_periods": []
            }
        
        # Check Redis cache first
        cache_key = f"summary_text:region:{region}"
        if self.use_redis:
            cached_summary = self.redis.cache_get(cache_key)
            if cached_summary:
                logger.debug(f"Retrieved region summary text from Redis cache")
                return cached_summary
        
        # Format site data for GPT
        site_contexts = []
        for site in sites:
            coord = site.get("coordinates", {})
            data = site.get("data", {})
            
            context = {
                "title": f"Site at {coord.get('lat', 0)}, {coord.get('lon', 0)}",
                "type": "archaeological_site",
                "content": (
                    f"Pattern: {data.get('pattern_type', 'Unknown')}\n"
                    f"Description: {data.get('description', '')}\n"
                    f"Confidence: {data.get('confidence', 0)}\n"
                )
            }
            site_contexts.append(context)
        
        # Call GPT for analysis
        result = self.gpt.multimodal_research(
            query=f"Summarize the archaeological significance of the {region} region based on these sites. Identify dominant patterns, likely time periods, and potential cultural connections.",
            context=site_contexts
        )
        
        # Extract time periods
        time_periods = self.gpt._extract_time_periods(result.get("analysis", ""))
        
        # Create structured summary
        summary = {
            "description": result.get("analysis", f"Region {region} contains {len(sites)} known archaeological sites."),
            "dominant_patterns": self._get_dominant_patterns(sites),
            "time_periods": time_periods
        }
        
        # Cache the summary
        if self.use_redis:
            self.redis.cache_set(cache_key, summary, ttl=86400)  # Cache for 24 hours
        
        # Publish event to Kafka
        if self.use_kafka:
            event_data = {
                "event_type": "region_summary_generated",
                "region": region,
                "site_count": len(sites),
                "timestamp": time.time()
            }
            self.kafka.produce("nis.analysis.events", event_data)
        
        return summary
    
    def _get_dominant_patterns(self, sites: List[Dict]) -> List[str]:
        """Get the most common pattern types from a list of sites.
        
        Args:
            sites: List of site data
            
        Returns:
            List of dominant pattern types
        """
        pattern_counts = {}
        
        for site in sites:
            data = site.get("data", {})
            pattern = data.get("pattern_type", "unknown")
            
            if pattern in pattern_counts:
                pattern_counts[pattern] += 1
            else:
                pattern_counts[pattern] = 1
        
        # Sort by count and return the patterns
        sorted_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)
        return [p[0] for p in sorted_patterns]
    
    def _basic_connection_analysis(self, sites: List[Dict]) -> List[Dict]:
        """Perform basic connection analysis without GPT.
        
        Args:
            sites: List of site data
            
        Returns:
            List of potential connections
        """
        connections = []
        
        # Look for sites with the same pattern type
        pattern_groups = {}
        for site in sites:
            site_id = site.get("site_id", "")
            pattern = site.get("data", {}).get("pattern_type", "unknown")
            
            if pattern in pattern_groups:
                pattern_groups[pattern].append(site_id)
            else:
                pattern_groups[pattern] = [site_id]
        
        # Create connections for sites with the same pattern
        for pattern, site_ids in pattern_groups.items():
            if len(site_ids) > 1:
                connections.append({
                    "type": "shared_pattern",
                    "pattern": pattern,
                    "site_ids": site_ids,
                    "strength": 0.7,
                    "description": f"These sites share the same pattern type: {pattern}"
                })
        
        return connections
    
    def _extract_connections_from_text(self, text: str) -> List[Dict]:
        """Extract connection information from GPT analysis text.
        
        Args:
            text: Analysis text from GPT
            
        Returns:
            List of extracted connections
        """
        # This is a simplistic extraction - in production would use more sophisticated NLP
        connections = []
        
        # Look for connection indicators in the text
        connection_indicators = [
            "connection", "relationship", "network", "linked", "route", 
            "trade", "cultural exchange", "influence", "similar to"
        ]
        
        # Simple sentence-based extraction
        sentences = text.split(".")
        for sentence in sentences:
            for indicator in connection_indicators:
                if indicator in sentence.lower():
                    connections.append({
                        "type": "inferred_connection",
                        "strength": 0.6,
                        "description": sentence.strip() + "."
                    })
                    break
        
        return connections
    
    def _get_default_historical_timeline(self) -> List[Dict]:
        """Get a default historical timeline for the Amazon region.
        
        Returns:
            List of historical events
        """
        # Try to get from Redis cache first
        cache_key = "default_historical_timeline"
        if self.use_redis:
            cached_timeline = self.redis.cache_get(cache_key)
            if cached_timeline:
                return cached_timeline
        
        timeline = [
            {"year": 500, "event": "Evidence of complex societies forming in the Upper Xingu region"},
            {"year": 800, "event": "Expansion of earthwork construction throughout the Amazon basin"},
            {"year": 1000, "event": "Peak of pre-Columbian population and cultural development"},
            {"year": 1200, "event": "Widespread use of Terra Preta agricultural techniques"},
            {"year": 1450, "event": "Development of complex road networks connecting settlements"},
            {"year": 1500, "event": "European contact begins affecting Amazonian societies"},
            {"year": 1600, "event": "Population collapse due to European diseases"},
            {"year": 1750, "event": "Portuguese and Spanish colonization intensifies"},
            {"year": 1900, "event": "Rubber boom brings new economic activity to the region"},
            {"year": 1950, "event": "Modern archaeological research begins in the Amazon"},
            {"year": 2000, "event": "LIDAR and remote sensing technologies reveal extent of ancient settlements"}
        ]
        
        # Cache the timeline
        if self.use_redis:
            self.redis.cache_set(cache_key, timeline, ttl=604800)  # Cache for 1 week
        
        return timeline
    
    def recall_context(self, visual_data: dict) -> dict:
        logger.info(f"MemoryAgent.recall_context received visual_data keys: {list(visual_data.keys()) if visual_data else 'None'}")

        recalled_info = {
            "similar_sites_in_region": [],
            "historical_context_for_region": "No specific historical context generated by placeholder.",
            "relevant_patterns_from_visual_data": [],
            "notes": "Context recall placeholder: Provides basic regional similarity and attempts to interpret visual data patterns."
        }

        if not visual_data or "location" not in visual_data:
            recalled_info["notes"] = "Context recall placeholder: Missing location in visual_data."
            logger.warning("MemoryAgent.recall_context: visual_data is None or missing 'location'.")
            return recalled_info

        lat = visual_data["location"].get("lat")
        lon = visual_data["location"].get("lon")

        if lat is None or lon is None:
            recalled_info["notes"] = "Context recall placeholder: Missing lat/lon in visual_data location."
            logger.warning("MemoryAgent.recall_context: visual_data location is missing lat/lon.")
            return recalled_info

        region = self._get_region_for_coordinates(lat, lon)
        if not region:
            logger.debug(f"MemoryAgent.recall_context: Could not determine region for {lat}, {lon}.")
            recalled_info["notes"] = f"Context recall placeholder: Could not determine region for coordinates {lat}, {lon}."
            # Proceed without region-specific search if region is not found
        else:
            recalled_info["notes"] = f"Context recall placeholder: Determined region as '{region}'. Searching for context."
             # Add basic historical context based on region (very simplified)
            if "Upper Xingu" in region:
                recalled_info["historical_context_for_region"] = "The Upper Xingu is known for its complex pre-Columbian societies, ring villages, and earthworks."
            elif "Tapajós" in region:
                recalled_info["historical_context_for_region"] = "The Tapajós region is associated with Tapajonic pottery and large riverside settlements."
            elif "Llanos de Moxos" in region:
                recalled_info["historical_context_for_region"] = "Llanos de Moxos is characterized by extensive earthworks, causeways, and agricultural mounds."
            else:
                recalled_info["historical_context_for_region"] = f"General Amazonian context for region '{region}' would include diverse indigenous cultures and varying settlement patterns over millennia."


        # Try to extract patterns from visual_data (e.g., from VisionAgent's combined_analysis)
        extracted_patterns = []
        if "combined_analysis" in visual_data and visual_data["combined_analysis"]:
            combined_analysis = visual_data["combined_analysis"]
            if "features_detected" in combined_analysis:
                for feature in combined_analysis["features_detected"]:
                    if "type" in feature and feature["type"] not in extracted_patterns:
                         # Example: "Circular Structure", "Linear Alignment"
                        extracted_patterns.append(feature["type"])
        
        if extracted_patterns:
            recalled_info["relevant_patterns_from_visual_data"] = extracted_patterns
            logger.info(f"MemoryAgent.recall_context: Extracted patterns from visual_data: {extracted_patterns}")
            
            # If region and patterns are available, try to find similar sites for the first extracted pattern
            if region and extracted_patterns:
                # Using the first pattern found for simplicity in this placeholder
                pattern_to_search = self._sanitize_filename(extracted_patterns[0]) # Sanitize for consistency
                similar = self.find_similar_sites(pattern_type=pattern_to_search, region=region, max_results=3)
                if similar:
                    recalled_info["similar_sites_in_region"] = similar
                    logger.info(f"MemoryAgent.recall_context: Found {len(similar)} similar sites in region '{region}' for pattern '{pattern_to_search}'.")
                else:
                    logger.info(f"MemoryAgent.recall_context: No similar sites found in region '{region}' for pattern '{pattern_to_search}'.")
        elif region: # No patterns from visual, but region is known
            # Fallback to a generic search if no specific patterns from vision agent
            logger.info(f"MemoryAgent.recall_context: No specific patterns from visual_data. Attempting generic search for region '{region}'.")
            # You might have a default "common_patterns_in_region_X" or just broader search
            # For this placeholder, let's assume a very generic pattern type for demonstration
            similar = self.find_similar_sites(pattern_type="geometric_earthwork", region=region, max_results=2)
            if similar:
                 recalled_info["similar_sites_in_region"] = similar
                 logger.info(f"MemoryAgent.recall_context: Found {len(similar)} similar sites in region '{region}' using generic pattern search.")
            else:
                 logger.info(f"MemoryAgent.recall_context: No similar sites found in region '{region}' using generic pattern search.")
        else: # No region and no patterns
            logger.info("MemoryAgent.recall_context: No region determined and no specific patterns from visual_data. Skipping similar sites search.")


        logger.info(f"MemoryAgent.recall_context returning: {json.dumps(recalled_info, indent=2, default=str)}")
        return recalled_info

    # Ensure all other methods from the outline are present or correctly stubbed if very long
    # For example, if _get_site_id was duplicated, ensure only one definition
    # For brevity, I am assuming the other methods are correctly defined as per the outline provided earlier.

# Main function for testing or direct invocation (if any)
if __name__ == "__main__":
    # Example Test (requires a running Redis & Kafka if not mocked in methods)
    # async def test_memory_agent():
    #     agent = MemoryAgent()
    #     # test storing
    #     agent.store_site_data(10.0, 20.0, {"description": "Test site", "confidence": 0.8, "pattern_type": "circular"})
    #     # test retrieval
    #     data = agent.retrieve_site_data(10.0, 20.0)
    #     logger.info(f"Retrieved: {data}")
    #     # test similarity
    #     similar = agent.find_similar_sites("circular")
    #     logger.info(f"Similar: {similar}")
    #     # test context recall (mock visual data)
    #     mock_visual = {"location": {"lat": 10.0, "lon": 20.0}, "combined_analysis": {"dominant_pattern": "circular"}}
    #     context = agent.recall_context(mock_visual)
    #     logger.info(f"Recalled context: {context}")

    # import asyncio
    # if os.name == 'nt':
    #     asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    # asyncio.run(test_memory_agent())
    pass 