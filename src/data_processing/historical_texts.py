import pandas as pd
import numpy as np
from pathlib import Path
import logging
from typing import Dict, List, Optional, Tuple
import spacy
import geopandas as gpd
from shapely.geometry import Point, box
import json
from transformers import pipeline
import torch
from concurrent.futures import ThreadPoolExecutor
import re

logger = logging.getLogger(__name__)

class HistoricalTextProcessor:
    def __init__(self):
        # Initialize directories
        self.data_dir = Path("data/historical_texts")
        self.cache_dir = Path("data/historical_cache")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Load NLP models
        self.nlp = spacy.load("pt_core_news_lg")  # Portuguese language model
        
        # Load location extraction model
        self.location_extractor = pipeline(
            "token-classification",
            model="dslim/bert-base-NER",
            aggregation_strategy="simple"
        )
        
        # Load historical place names database
        self.historical_places = self._load_historical_places()
        
        # Configure thread pool
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def process_historical_texts(
        self,
        lat: float,
        lon: float,
        radius_km: float = 50.0
    ) -> Dict:
        """
        Process historical texts relevant to the given coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Search radius in kilometers
            
        Returns:
            Dict containing relevant text excerpts, references, and confidence scores
        """
        try:
            # Check cache first
            cached_data = self._check_cache(lat, lon, radius_km)
            if cached_data is not None:
                return cached_data
            
            # Get relevant documents
            relevant_docs = self._find_relevant_documents(lat, lon, radius_km)
            
            # Process documents in parallel
            results = []
            with ThreadPoolExecutor() as executor:
                futures = [
                    executor.submit(self._process_document, doc)
                    for doc in relevant_docs
                ]
                for future in futures:
                    results.extend(future.result())
            
            # Aggregate and score results
            processed_results = self._aggregate_results(results, lat, lon)
            
            # Cache results
            self._cache_results(lat, lon, radius_km, processed_results)
            
            return processed_results
            
        except Exception as e:
            logger.error(f"Error processing historical texts for {lat}, {lon}: {str(e)}")
            raise
    
    def _load_historical_places(self) -> pd.DataFrame:
        """Load and prepare historical place names database."""
        try:
            # Load from CSV (you would need to prepare this database)
            df = pd.read_csv(self.data_dir / "historical_places.csv")
            
            # Create GeoDataFrame
            geometry = [Point(xy) for xy in zip(df.longitude, df.latitude)]
            return gpd.GeoDataFrame(df, geometry=geometry)
            
        except Exception as e:
            logger.warning(f"Could not load historical places database: {str(e)}")
            return gpd.GeoDataFrame()
    
    def _find_relevant_documents(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> List[Dict]:
        """Find documents relevant to the location."""
        # Create search box
        search_area = box(
            lon - radius_km/111.32,
            lat - radius_km/111.32,
            lon + radius_km/111.32,
            lat + radius_km/111.32
        )
        
        # Find historical places in the area
        if not self.historical_places.empty:
            places_in_area = self.historical_places[
                self.historical_places.geometry.intersects(search_area)
            ]
            place_names = places_in_area['historical_name'].tolist()
        else:
            place_names = []
        
        # Collect relevant documents
        documents = []
        for doc_path in self.data_dir.glob("**/*.txt"):
            try:
                with open(doc_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if content mentions any place names
                if any(name.lower() in content.lower() for name in place_names):
                    documents.append({
                        'path': doc_path,
                        'content': content,
                        'metadata': self._extract_metadata(doc_path)
                    })
            except Exception as e:
                logger.error(f"Error reading document {doc_path}: {str(e)}")
        
        return documents
    
    def _process_document(self, doc: Dict) -> List[Dict]:
        """Process a single historical document."""
        results = []
        
        # Split into paragraphs
        paragraphs = re.split(r'\n\n+', doc['content'])
        
        for para in paragraphs:
            # Extract locations
            locations = self.location_extractor(para)
            
            # Skip if no locations found
            if not locations:
                continue
            
            # Process with spaCy for additional entity recognition
            doc_nlp = self.nlp(para)
            
            # Extract relevant information
            result = {
                'text': para,
                'source': str(doc['path']),
                'year': doc['metadata'].get('year'),
                'locations': locations,
                'entities': [
                    {
                        'text': ent.text,
                        'label': ent.label_,
                        'start': ent.start_char,
                        'end': ent.end_char
                    }
                    for ent in doc_nlp.ents
                ],
                'metadata': doc['metadata']
            }
            
            results.append(result)
        
        return results
    
    def _aggregate_results(
        self,
        results: List[Dict],
        target_lat: float,
        target_lon: float
    ) -> Dict:
        """Aggregate and score results."""
        # Group by location
        location_groups = {}
        
        for result in results:
            for loc in result['locations']:
                loc_key = loc['word'].lower()
                if loc_key not in location_groups:
                    location_groups[loc_key] = []
                location_groups[loc_key].append(result)
        
        # Score and rank references
        scored_references = []
        
        for location, references in location_groups.items():
            # Calculate confidence score based on multiple factors
            score = self._calculate_confidence_score(
                references,
                location,
                target_lat,
                target_lon
            )
            
            scored_references.append({
                'location': location,
                'references': references,
                'confidence': score,
                'total_mentions': len(references),
                'unique_sources': len(set(ref['source'] for ref in references)),
                'earliest_reference': min(
                    (ref['year'] for ref in references if ref.get('year')),
                    default=None
                )
            })
        
        # Sort by confidence
        scored_references.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'references': scored_references,
            'total_documents': len(set(ref['source'] for refs in location_groups.values() for ref in refs)),
            'analysis_timestamp': pd.Timestamp.now().isoformat()
        }
    
    def _calculate_confidence_score(
        self,
        references: List[Dict],
        location: str,
        target_lat: float,
        target_lon: float
    ) -> float:
        """Calculate confidence score for a set of references."""
        # Base score
        score = 0.0
        
        # Factors to consider
        num_references = len(references)
        unique_sources = len(set(ref['source'] for ref in references))
        has_coordinates = any('coordinates' in ref['metadata'] for ref in references)
        temporal_range = self._calculate_temporal_range(references)
        
        # Weight factors
        score += min(num_references / 5.0, 1.0) * 0.3  # Number of references
        score += min(unique_sources / 3.0, 1.0) * 0.2  # Source diversity
        score += (1.0 if has_coordinates else 0.0) * 0.3  # Geographic precision
        score += min(temporal_range / 100.0, 1.0) * 0.2  # Temporal coverage
        
        return score
    
    def _calculate_temporal_range(self, references: List[Dict]) -> float:
        """Calculate the temporal range of references in years."""
        years = [ref['year'] for ref in references if ref.get('year')]
        if not years:
            return 0.0
        return max(years) - min(years)
    
    def _extract_metadata(self, doc_path: Path) -> Dict:
        """Extract metadata from document path and content."""
        # Try to find year in filename or path
        year_match = re.search(r'(\d{4})', str(doc_path))
        year = int(year_match.group(1)) if year_match else None
        
        return {
            'year': year,
            'type': doc_path.suffix[1:],
            'filename': doc_path.name
        }
    
    def _check_cache(
        self,
        lat: float,
        lon: float,
        radius_km: float
    ) -> Optional[Dict]:
        """Check if results exist in cache."""
        cache_file = self.cache_dir / f"historical_{lat}_{lon}_{radius_km}.json"
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
        cache_file = self.cache_dir / f"historical_{lat}_{lon}_{radius_km}.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2) 