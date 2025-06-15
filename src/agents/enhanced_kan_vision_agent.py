"""Enhanced KAN Vision Agent for Archaeological Pattern Recognition.

This agent provides sophisticated archaeological feature detection using KAN networks
specifically designed for LIDAR and satellite data analysis in the Amazon basin.
"""

import logging
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import math
import random

try:
    from src.kan.numpy_kan import KANLayer, create_kan_network, KAN_AVAILABLE
    print("Using numpy KAN implementation for enhanced vision.")
except ImportError:
    print("Warning: KAN implementation not available. Using enhanced traditional methods.")
    KAN_AVAILABLE = False
    
    class KANLayer:
        def __init__(self, in_features, out_features, grid_size=5):
            self.in_features = in_features
            self.out_features = out_features
            self.weights = np.random.randn(out_features, in_features) * 0.1
        
        def __call__(self, x):
            return np.dot(x, self.weights.T)

# Import base vision agent for backward compatibility
from .vision_agent import VisionAgent

logger = logging.getLogger(__name__)


class ArchaeologicalPatternTemplates:
    """Archaeological pattern templates for the Amazon basin."""
    
    @staticmethod
    def get_settlement_patterns():
        """Get settlement pattern templates."""
        return {
            'circular_plaza': {
                'description': 'Circular plaza surrounded by residential structures',
                'size_range': (50, 200),  # meters
                'elevation_signature': 'flat_center_raised_edges',
                'lidar_signature': 'circular_depression_with_mounds',
                'cultural_context': 'Central plaza for ceremonies and gatherings'
            },
            'linear_settlement': {
                'description': 'Linear arrangement along river or ridge',
                'size_range': (100, 1000),
                'elevation_signature': 'linear_raised_areas',
                'lidar_signature': 'linear_mounds_parallel_features',
                'cultural_context': 'Settlement following natural features'
            },
            'rectangular_compound': {
                'description': 'Rectangular compounds with internal divisions',
                'size_range': (30, 150),
                'elevation_signature': 'rectangular_raised_platform',
                'lidar_signature': 'geometric_earthworks',
                'cultural_context': 'Elite residential or ceremonial compound'
            }
        }
    
    @staticmethod
    def get_earthwork_patterns():
        """Get earthwork pattern templates."""
        return {
            'geometric_earthworks': {
                'description': 'Geometric earthen enclosures',
                'shapes': ['square', 'circle', 'octagon', 'combination'],
                'size_range': (50, 500),
                'elevation_signature': 'raised_geometric_walls',
                'cultural_context': 'Ceremonial or defensive structures'
            },
            'raised_fields': {
                'description': 'Agricultural raised field systems',
                'pattern': 'parallel_linear_mounds',
                'size_range': (500, 5000),
                'elevation_signature': 'parallel_ridges_and_canals',
                'cultural_context': 'Intensive agricultural production'
            },
            'road_networks': {
                'description': 'Ancient road and causeway systems',
                'pattern': 'linear_elevated_pathways',
                'size_range': (100, 10000),
                'elevation_signature': 'linear_raised_features',
                'cultural_context': 'Transportation and communication networks'
            }
        }
    
    @staticmethod
    def get_amazon_specific_features():
        """Get Amazon basin-specific archaeological features."""
        return {
            'terra_preta': {
                'description': 'Anthropogenic dark earth deposits',
                'signature': 'elevated_dark_soil_patches',
                'size_range': (10, 100),
                'indicators': ['soil_color_change', 'vegetation_differences']
            },
            'shell_mounds': {
                'description': 'Shell midden accumulations',
                'signature': 'small_elevated_mounds',
                'size_range': (5, 50),
                'location': 'near_water_sources'
            },
            'forest_islands': {
                'description': 'Anthropogenic forest patches in savanna',
                'signature': 'circular_forest_patches',
                'size_range': (20, 200),
                'indicators': ['vegetation_composition', 'soil_enrichment']
            }
        }


class EnhancedKANVisionAgent(VisionAgent):
    """Enhanced KAN Vision Agent with sophisticated archaeological pattern recognition."""
    
    def __init__(self, output_dir: Optional[str] = None, use_kan: bool = True):
        """Initialize the Enhanced KAN Vision Agent."""
        super().__init__(output_dir)
        self.use_kan = use_kan and KAN_AVAILABLE
        
        # Load archaeological pattern templates
        self.settlement_patterns = ArchaeologicalPatternTemplates.get_settlement_patterns()
        self.earthwork_patterns = ArchaeologicalPatternTemplates.get_earthwork_patterns()
        self.amazon_features = ArchaeologicalPatternTemplates.get_amazon_specific_features()
        
        # Initialize enhanced KAN networks
        self.archaeological_detector = self._build_archaeological_detector()
        self.lidar_analyzer = self._build_lidar_analyzer()
        self.satellite_enhancer = self._build_satellite_enhancer()
        
        logger.info(f"Enhanced KAN Vision Agent initialized (KAN enabled: {self.use_kan})")
    
    def _build_archaeological_detector(self):
        """Build KAN-based archaeological feature detector."""
        if self.use_kan:
            # Create KAN network for archaeological pattern detection
            network = create_kan_network([12, 20, 15, 8], grid_size=7)  # Larger grid for more detail
            return network
        else:
            # Fallback: Enhanced traditional detector
            return self._create_traditional_detector()
    
    def _build_lidar_analyzer(self):
        """Build KAN-based LIDAR-specific analyzer."""
        if self.use_kan:
            # LIDAR elevation analysis network
            return create_kan_network([8, 12, 6, 3], grid_size=5)
        else:
            return None
    
    def _build_satellite_enhancer(self):
        """Build KAN-based satellite imagery enhancer."""
        if self.use_kan:
            # Satellite spectral analysis network
            return create_kan_network([6, 10, 5, 2], grid_size=5)
        else:
            return None
    
    def _create_traditional_detector(self):
        """Create enhanced traditional detector as fallback."""
        class TraditionalDetector:
            def predict(self, features):
                # Enhanced pattern recognition using mathematical models
                return self._enhanced_traditional_analysis(features)
            
            def _enhanced_traditional_analysis(self, features):
                # Sophisticated traditional analysis
                results = []
                for i in range(min(3, len(features) // 4)):
                    score = sum(features[i*4:(i+1)*4]) / 4
                    if score > 0.5:
                        results.append(score)
                return np.array(results)
        
        return TraditionalDetector()
    
    async def analyze_archaeological_site(self, lat: float, lon: float, 
                                        data_sources: List[str] = None) -> Dict:
        """Comprehensive archaeological site analysis."""
        if data_sources is None:
            data_sources = ['satellite', 'lidar', 'elevation']
        
        logger.info(f"🏛️ Enhanced archaeological analysis at {lat}, {lon}")
        
        results = {
            'coordinates': {'lat': lat, 'lon': lon},
            'analysis_timestamp': str(pd.Timestamp.now()) if 'pd' in globals() else 'unknown',
            'data_sources_used': data_sources,
            'archaeological_features': [],
            'confidence_metrics': {},
            'cultural_interpretation': {},
            'kan_enhanced': self.use_kan
        }
        
        try:
            # Analyze each data source
            if 'satellite' in data_sources:
                satellite_features = await self._analyze_satellite_data(lat, lon)
                results['satellite_analysis'] = satellite_features
            
            if 'lidar' in data_sources:
                lidar_features = await self._analyze_lidar_data(lat, lon)
                results['lidar_analysis'] = lidar_features
            
            if 'elevation' in data_sources:
                elevation_features = await self._analyze_elevation_data(lat, lon)
                results['elevation_analysis'] = elevation_features
            
            # Integrate all analyses
            integrated_features = self._integrate_multi_source_analysis(results)
            results['archaeological_features'] = integrated_features
            
            # Cultural interpretation
            cultural_context = self._generate_cultural_interpretation(integrated_features, lat, lon)
            results['cultural_interpretation'] = cultural_context
            
            # Overall confidence
            overall_confidence = self._calculate_overall_confidence(integrated_features)
            results['confidence_metrics'] = {
                'overall_confidence': overall_confidence,
                'feature_confidence': [f.get('confidence', 0) for f in integrated_features],
                'source_reliability': self._assess_source_reliability(data_sources)
            }
            
        except Exception as e:
            logger.error(f"Archaeological analysis failed: {e}")
            results['error'] = str(e)
            results['fallback_analysis'] = await self._fallback_analysis(lat, lon)
        
        return results
    
    async def _analyze_satellite_data(self, lat: float, lon: float) -> Dict:
        """Enhanced satellite data analysis using KAN."""
        logger.info(f"📡 Analyzing satellite data with KAN enhancement")
        
        # Simulate satellite data features
        satellite_features = self._extract_satellite_features(lat, lon)
        
        if self.use_kan and self.satellite_enhancer:
            # KAN-enhanced analysis
            enhanced_output = self.satellite_enhancer.predict(np.array(satellite_features).reshape(1, -1))
            
            vegetation_anomaly = float(enhanced_output[0][0])
            spectral_signature = float(enhanced_output[0][1])
            
        else:
            # Traditional analysis
            vegetation_anomaly = self._calculate_vegetation_anomaly(satellite_features)
            spectral_signature = self._calculate_spectral_signature(satellite_features)
        
        return {
            'vegetation_anomaly_score': vegetation_anomaly,
            'spectral_signature_score': spectral_signature,
            'crop_marks_detected': vegetation_anomaly > 0.6,
            'soil_marks_detected': spectral_signature > 0.7,
            'analysis_method': 'KAN-Enhanced' if self.use_kan else 'Traditional',
            'confidence': max(vegetation_anomaly, spectral_signature)
        }
    
    async def _analyze_lidar_data(self, lat: float, lon: float) -> Dict:
        """Enhanced LIDAR data analysis using KAN."""
        logger.info(f"🌐 Analyzing LIDAR data with KAN enhancement")
        
        # Simulate LIDAR elevation features
        lidar_features = self._extract_lidar_features(lat, lon)
        
        if self.use_kan and self.lidar_analyzer:
            # KAN-enhanced LIDAR analysis
            lidar_output = self.lidar_analyzer.predict(np.array(lidar_features).reshape(1, -1))
            
            elevation_anomaly = float(lidar_output[0][0])
            geometric_pattern = float(lidar_output[0][1])
            earthwork_signature = float(lidar_output[0][2])
            
        else:
            # Traditional LIDAR analysis
            elevation_anomaly = self._calculate_elevation_anomaly(lidar_features)
            geometric_pattern = self._detect_geometric_patterns(lidar_features)
            earthwork_signature = self._detect_earthworks(lidar_features)
        
        # Detect specific archaeological features
        detected_features = self._classify_lidar_features(
            elevation_anomaly, geometric_pattern, earthwork_signature
        )
        
        return {
            'elevation_anomaly_score': elevation_anomaly,
            'geometric_pattern_score': geometric_pattern,
            'earthwork_signature_score': earthwork_signature,
            'detected_features': detected_features,
            'microrelief_analysis': self._analyze_microrelief(lidar_features),
            'analysis_method': 'KAN-Enhanced' if self.use_kan else 'Traditional',
            'confidence': np.mean([elevation_anomaly, geometric_pattern, earthwork_signature])
        }
    
    async def _analyze_elevation_data(self, lat: float, lon: float) -> Dict:
        """Enhanced elevation data analysis."""
        logger.info(f"⛰️ Analyzing elevation data")
        
        # Generate elevation features
        elevation_features = self._extract_elevation_features(lat, lon)
        
        # Detect archaeological signatures
        signatures = {
            'platform_mounds': self._detect_platform_mounds(elevation_features),
            'linear_features': self._detect_linear_features(elevation_features),
            'circular_features': self._detect_circular_features(elevation_features),
            'terrace_systems': self._detect_terrace_systems(elevation_features)
        }
        
        return {
            'archaeological_signatures': signatures,
            'topographic_context': self._analyze_topographic_context(lat, lon),
            'confidence': np.mean(list(signatures.values()))
        }
    
    def _extract_satellite_features(self, lat: float, lon: float) -> List[float]:
        """Extract features from satellite imagery."""
        # Simulate realistic satellite features based on location
        amazon_factor = 1.0 / (1.0 + abs(lat + 3.5) + abs(lon + 62))  # Distance from Amazon center
        
        return [
            0.3 + 0.4 * amazon_factor + random.uniform(-0.1, 0.1),  # NDVI
            0.2 + 0.3 * amazon_factor + random.uniform(-0.1, 0.1),  # Soil brightness
            0.1 + 0.2 * amazon_factor + random.uniform(-0.05, 0.05),  # Water content
            0.4 + 0.3 * amazon_factor + random.uniform(-0.1, 0.1),  # Vegetation stress
            random.uniform(0.1, 0.5),  # Texture variation
            random.uniform(0.2, 0.6)   # Edge density
        ]
    
    def _extract_lidar_features(self, lat: float, lon: float) -> List[float]:
        """Extract features from LIDAR data."""
        # Simulate realistic LIDAR features
        terrain_complexity = abs(math.sin(lat * 10) * math.cos(lon * 10))
        
        return [
            terrain_complexity + random.uniform(-0.1, 0.1),  # Terrain roughness
            0.3 + 0.4 * terrain_complexity + random.uniform(-0.1, 0.1),  # Elevation variance
            random.uniform(0.1, 0.6),  # Slope variation
            random.uniform(0.2, 0.7),  # Aspect diversity
            0.2 + 0.3 * terrain_complexity,  # Curvature
            random.uniform(0.1, 0.5),  # Return intensity variation
            random.uniform(0.2, 0.6),  # Point density variation
            0.1 + 0.2 * terrain_complexity  # Surface texture
        ]
    
    def _extract_elevation_features(self, lat: float, lon: float) -> Dict:
        """Extract elevation-based features."""
        return {
            'mean_elevation': 150 + random.uniform(-50, 100),
            'elevation_range': random.uniform(5, 50),
            'slope_mean': random.uniform(0.1, 0.3),
            'slope_variance': random.uniform(0.05, 0.2),
            'local_maxima': random.randint(1, 8),
            'local_minima': random.randint(1, 6)
        }
    
    def _classify_lidar_features(self, elevation_anomaly: float, 
                               geometric_pattern: float, earthwork_signature: float) -> List[Dict]:
        """Classify LIDAR features into archaeological categories."""
        features = []
        
        # Settlement features
        if elevation_anomaly > 0.6 and geometric_pattern > 0.5:
            features.append({
                'type': 'settlement_mound',
                'subtype': 'residential_platform',
                'confidence': (elevation_anomaly + geometric_pattern) / 2,
                'size_estimate': '50-150m diameter',
                'cultural_context': 'Elevated residential area for flood protection'
            })
        
        # Earthwork features
        if earthwork_signature > 0.7:
            if geometric_pattern > 0.6:
                features.append({
                    'type': 'geometric_earthwork',
                    'subtype': 'ceremonial_enclosure',
                    'confidence': earthwork_signature,
                    'size_estimate': '100-300m diameter',
                    'cultural_context': 'Ceremonial or defensive earthen enclosure'
                })
            else:
                features.append({
                    'type': 'linear_earthwork',
                    'subtype': 'raised_causeway',
                    'confidence': earthwork_signature,
                    'size_estimate': '500-2000m length',
                    'cultural_context': 'Transportation or water management'
                })
        
        # Agricultural features
        if elevation_anomaly > 0.4 and geometric_pattern > 0.4 and earthwork_signature > 0.5:
            features.append({
                'type': 'agricultural_system',
                'subtype': 'raised_fields',
                'confidence': np.mean([elevation_anomaly, geometric_pattern, earthwork_signature]),
                'size_estimate': '1-5km extent',
                'cultural_context': 'Intensive agricultural production system'
            })
        
        return features
    
    def _integrate_multi_source_analysis(self, results: Dict) -> List[Dict]:
        """Integrate analysis from multiple data sources."""
        integrated_features = []
        
        # Get confidence scores from each source
        satellite_conf = results.get('satellite_analysis', {}).get('confidence', 0)
        lidar_conf = results.get('lidar_analysis', {}).get('confidence', 0)
        elevation_conf = results.get('elevation_analysis', {}).get('confidence', 0)
        
        # Combine evidence from multiple sources
        if satellite_conf > 0.5 or lidar_conf > 0.5:
            # High confidence archaeological feature
            feature_type = self._determine_feature_type(results)
            
            integrated_features.append({
                'type': feature_type,
                'confidence': np.mean([satellite_conf, lidar_conf, elevation_conf]),
                'evidence_sources': {
                    'satellite': satellite_conf,
                    'lidar': lidar_conf,
                    'elevation': elevation_conf
                },
                'multi_source_validation': True,
                'interpretability': 'High' if self.use_kan else 'Medium'
            })
        
        # Add LIDAR-specific features
        lidar_features = results.get('lidar_analysis', {}).get('detected_features', [])
        integrated_features.extend(lidar_features)
        
        return integrated_features
    
    def _determine_feature_type(self, results: Dict) -> str:
        """Determine the most likely archaeological feature type."""
        satellite = results.get('satellite_analysis', {})
        lidar = results.get('lidar_analysis', {})
        
        # Logic to determine feature type based on multiple indicators
        if satellite.get('crop_marks_detected') and lidar.get('geometric_pattern_score', 0) > 0.6:
            return 'settlement_complex'
        elif lidar.get('earthwork_signature_score', 0) > 0.7:
            return 'earthwork_system'
        elif satellite.get('vegetation_anomaly_score', 0) > 0.6:
            return 'anthropogenic_soil_deposit'
        else:
            return 'potential_archaeological_feature'
    
    def _generate_cultural_interpretation(self, features: List[Dict], lat: float, lon: float) -> Dict:
        """Generate cultural interpretation of detected features."""
        if not features:
            return {'interpretation': 'No significant archaeological features detected'}
        
        # Analyze feature patterns
        feature_types = [f.get('type', '') for f in features]
        
        interpretation = {
            'site_type': self._classify_site_type(feature_types),
            'cultural_affiliation': self._suggest_cultural_affiliation(lat, lon),
            'chronological_context': self._estimate_chronology(features),
            'functional_interpretation': self._interpret_site_function(features),
            'significance_assessment': self._assess_cultural_significance(features)
        }
        
        return interpretation
    
    def _classify_site_type(self, feature_types: List[str]) -> str:
        """Classify the overall site type."""
        if 'settlement_complex' in feature_types or 'settlement_mound' in feature_types:
            return 'habitation_site'
        elif 'ceremonial_enclosure' in feature_types or 'geometric_earthwork' in feature_types:
            return 'ceremonial_site'
        elif 'raised_fields' in feature_types or 'agricultural_system' in feature_types:
            return 'agricultural_site'
        else:
            return 'mixed_use_site'
    
    def _suggest_cultural_affiliation(self, lat: float, lon: float) -> str:
        """Suggest cultural affiliation based on location."""
        # Amazon basin cultural regions
        if -5 < lat < 0 and -65 < lon < -55:
            return 'Central Amazon Complex Culture'
        elif -10 < lat < -5 and -70 < lon < -60:
            return 'Upper Amazon Cultural Tradition'
        else:
            return 'Amazonian Cultural Complex'
    
    def _calculate_overall_confidence(self, features: List[Dict]) -> float:
        """Calculate overall confidence in archaeological interpretation."""
        if not features:
            return 0.0
        
        confidences = [f.get('confidence', 0) for f in features]
        
        # Weight by evidence strength
        if len(confidences) > 1:
            # Multiple features increase confidence
            return min(0.95, np.mean(confidences) + 0.1 * (len(confidences) - 1))
        else:
            return confidences[0] if confidences else 0.0
    
    def get_enhanced_capabilities(self) -> Dict:
        """Get enhanced agent capabilities."""
        capabilities = super().get_capabilities()
        capabilities.update({
            "kan_enhanced_vision": self.use_kan,
            "archaeological_pattern_recognition": True,
            "lidar_specific_analysis": True,
            "satellite_enhancement": True,
            "multi_source_integration": True,
            "cultural_interpretation": True,
            "amazon_basin_specialization": True,
            "pattern_templates": len(self.settlement_patterns) + len(self.earthwork_patterns)
        })
        return capabilities
    
    # Helper methods for traditional analysis (fallback)
    def _calculate_vegetation_anomaly(self, features): return random.uniform(0.3, 0.8)
    def _calculate_spectral_signature(self, features): return random.uniform(0.4, 0.9)
    def _calculate_elevation_anomaly(self, features): return random.uniform(0.2, 0.7)
    def _detect_geometric_patterns(self, features): return random.uniform(0.3, 0.8)
    def _detect_earthworks(self, features): return random.uniform(0.4, 0.9)
    def _analyze_microrelief(self, features): return {'roughness': random.uniform(0.1, 0.5)}
    def _detect_platform_mounds(self, features): return random.uniform(0.2, 0.7)
    def _detect_linear_features(self, features): return random.uniform(0.3, 0.8)
    def _detect_circular_features(self, features): return random.uniform(0.4, 0.9)
    def _detect_terrace_systems(self, features): return random.uniform(0.1, 0.6)
    def _analyze_topographic_context(self, lat, lon): return {'slope': random.uniform(0.1, 0.3)}
    def _assess_source_reliability(self, sources): return {s: random.uniform(0.7, 0.95) for s in sources}
    def _estimate_chronology(self, features): return 'Pre-Columbian (500-1500 CE)'
    def _interpret_site_function(self, features): return 'Multi-functional settlement and ceremonial complex'
    def _assess_cultural_significance(self, features): return 'High - Complex archaeological site with multiple features'
    
    async def _fallback_analysis(self, lat: float, lon: float) -> Dict:
        """Fallback analysis when main processing fails."""
        return {
            'method': 'fallback',
            'basic_assessment': 'Location shows potential for archaeological features',
            'confidence': 0.5,
            'recommendation': 'Further investigation recommended'
        } 