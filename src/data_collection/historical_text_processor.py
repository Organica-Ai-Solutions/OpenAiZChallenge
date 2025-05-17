from typing import Dict, List, Optional
import os
from datetime import datetime
from pathlib import Path
import logging
import json
import re
from dataclasses import dataclass, asdict
import numpy as np
from ..config import OPENAI_API_KEY

logger = logging.getLogger(__name__)

@dataclass
class HistoricalReference:
    text: str
    source: str
    date: str
    location: Optional[Dict[str, float]]  # lat, lon if available
    confidence: float
    keywords: List[str]
    relevance_score: float

class HistoricalTextProcessor:
    def __init__(self):
        """Initialize the historical text processor."""
        self.data_dir = Path('data/colonial_texts')
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Load historical text database
        self.database = self._load_database()
        
        # Configure text processing parameters
        self.max_distance_km = 50  # Maximum distance to consider texts relevant
        self.min_confidence = 0.7  # Minimum confidence for inclusion
        self.date_patterns = [
            r'\b\d{4}\b',  # Year
            r'\b(?:1[0-9]|20)\d{2}s\b',  # Decades
            r'\b(?:early|mid|late) (?:1[0-9]|20)\d{2}s\b',  # Approximate decades
            r'\b(?:1[0-9]|20)\d{2}-(?:1[0-9]|20)\d{2}\b'  # Date ranges
        ]
    
    async def process_historical_texts(
        self,
        lat: float,
        lon: float,
        radius_km: float = None
    ) -> Dict:
        """
        Process historical texts relevant to the given coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Search radius in kilometers
            
        Returns:
            Dictionary containing processed historical text data
        """
        try:
            radius = radius_km or self.max_distance_km
            
            # Find relevant texts
            relevant_texts = self._find_relevant_texts(lat, lon, radius)
            
            if not relevant_texts:
                logger.warning(f"No historical texts found for coordinates {lat}, {lon}")
                return {}
            
            # Process and analyze texts
            processed_data = self._analyze_texts(relevant_texts, lat, lon)
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing historical texts: {str(e)}")
            return {}
    
    def _load_database(self) -> List[Dict]:
        """Load the historical text database."""
        try:
            database_file = self.data_dir / 'historical_texts.json'
            
            if not database_file.exists():
                # Create mock database if it doesn't exist
                mock_database = self._create_mock_database()
                with open(database_file, 'w') as f:
                    json.dump(mock_database, f, indent=2)
                return mock_database
            
            with open(database_file) as f:
                return json.load(f)
                
        except Exception as e:
            logger.error(f"Error loading historical text database: {str(e)}")
            return []
    
    def _create_mock_database(self) -> List[Dict]:
        """Create a mock database for testing."""
        return [
            {
                "text": "Early settlers reported extensive earthworks in this region...",
                "source": "Colonial Records Vol. 1",
                "date": "1845",
                "location": {"lat": -3.4567, "lon": -62.7890},
                "confidence": 0.85,
                "keywords": ["settlement", "earthworks", "indigenous"],
                "relevance_score": 0.9
            },
            {
                "text": "The expedition encountered several large geometric patterns...",
                "source": "Explorer's Journal",
                "date": "1872",
                "location": {"lat": -3.4789, "lon": -62.7654},
                "confidence": 0.75,
                "keywords": ["expedition", "geometric", "patterns"],
                "relevance_score": 0.8
            }
        ]
    
    def _find_relevant_texts(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> List[HistoricalReference]:
        """Find texts relevant to the given location."""
        relevant_texts = []
        
        for text_entry in self.database:
            # Skip entries without location data
            if not text_entry.get('location'):
                continue
            
            # Calculate distance
            text_lat = text_entry['location']['lat']
            text_lon = text_entry['location']['lon']
            distance = self._calculate_distance(lat, lon, text_lat, text_lon)
            
            # Include if within radius and meets confidence threshold
            if (distance <= radius_km and 
                text_entry['confidence'] >= self.min_confidence):
                relevant_texts.append(HistoricalReference(**text_entry))
        
        return relevant_texts
    
    def _analyze_texts(
        self,
        texts: List[HistoricalReference],
        lat: float,
        lon: float
    ) -> Dict:
        """
        Analyze historical texts for patterns and insights.
        
        This is a simplified version. In practice, you would:
        1. Extract temporal information
        2. Identify geographical features
        3. Detect patterns across multiple texts
        4. Cross-reference with other sources
        5. Apply NLP for entity recognition
        """
        try:
            # Extract dates
            dates = []
            for text in texts:
                for pattern in self.date_patterns:
                    matches = re.findall(pattern, text.text)
                    dates.extend(matches)
            
            # Calculate temporal distribution
            if dates:
                dates = [int(re.sub(r'\D', '', d)) for d in dates]  # Extract years
                temporal_range = {
                    'earliest': min(dates),
                    'latest': max(dates),
                    'mean': np.mean(dates),
                    'count': len(dates)
                }
            else:
                temporal_range = {}
            
            # Aggregate keywords
            all_keywords = []
            for text in texts:
                all_keywords.extend(text.keywords)
            keyword_freq = {
                k: all_keywords.count(k)
                for k in set(all_keywords)
            }
            
            # Prepare processed data
            processed_data = {
                'coordinates': (lat, lon),
                'timestamp': datetime.now().isoformat(),
                'text_count': len(texts),
                'temporal_range': temporal_range,
                'keyword_frequency': keyword_freq,
                'references': [asdict(text) for text in texts],
                'metadata': {
                    'processing_date': datetime.now().isoformat(),
                    'confidence_threshold': self.min_confidence,
                    'search_radius_km': self.max_distance_km
                }
            }
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error analyzing historical texts: {str(e)}")
            return {}
    
    def _calculate_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate distance between two points in kilometers.
        Uses the Haversine formula.
        """
        try:
            # Convert to radians
            lat1, lon1 = np.radians([lat1, lon1])
            lat2, lon2 = np.radians([lat2, lon2])
            
            # Haversine formula
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = (np.sin(dlat/2)**2 + 
                 np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2)
            c = 2 * np.arcsin(np.sqrt(a))
            
            # Earth's radius in kilometers
            r = 6371
            
            return c * r
            
        except Exception as e:
            logger.error(f"Error calculating distance: {str(e)}")
            return float('inf')  # Return infinity to exclude from results 