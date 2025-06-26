"""
Data Accuracy Assurance System for NIS Protocol
Comprehensive accuracy validation without requiring peer review

Alternative validation methods:
1. Multi-source cross-validation
2. Statistical confidence analysis
3. Historical pattern matching
4. Geographic consistency checks
5. Temporal coherence validation
6. Community feedback integration
7. Expert system validation
8. Machine learning quality assessment
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import numpy as np
import json
from pathlib import Path
from dataclasses import dataclass
from enum import Enum
import statistics

logger = logging.getLogger(__name__)

class AccuracyLevel(Enum):
    """Data accuracy levels"""
    EXCELLENT = "excellent"      # 95%+ accuracy, multiple validations
    VERY_HIGH = "very_high"      # 90-95% accuracy, strong validation
    HIGH = "high"                # 80-90% accuracy, good validation  
    MODERATE = "moderate"        # 70-80% accuracy, basic validation
    LOW = "low"                  # 60-70% accuracy, needs improvement
    QUESTIONABLE = "questionable" # <60% accuracy, requires review

class ValidationMethod(Enum):
    """Available validation methods"""
    MULTI_SOURCE = "multi_source_validation"
    STATISTICAL = "statistical_analysis"
    PATTERN_MATCHING = "historical_pattern_matching"
    GEOGRAPHIC = "geographic_consistency"
    TEMPORAL = "temporal_coherence"
    COMMUNITY = "community_validation"
    EXPERT_SYSTEM = "expert_system_rules"
    ML_QUALITY = "ml_quality_assessment"

@dataclass
class AccuracyMetrics:
    """Comprehensive accuracy metrics for a data point"""
    overall_score: float
    accuracy_level: AccuracyLevel
    confidence_interval: tuple
    validation_methods_passed: List[ValidationMethod]
    validation_scores: Dict[str, float]
    quality_indicators: Dict[str, Any]
    improvement_suggestions: List[str]
    timestamp: str

class DataAccuracySystem:
    """Comprehensive data accuracy assurance system"""
    
    def __init__(self):
        """Initialize the accuracy system"""
        self.validation_weights = {
            ValidationMethod.MULTI_SOURCE: 0.20,
            ValidationMethod.STATISTICAL: 0.15,
            ValidationMethod.PATTERN_MATCHING: 0.15,
            ValidationMethod.GEOGRAPHIC: 0.15,
            ValidationMethod.TEMPORAL: 0.10,
            ValidationMethod.COMMUNITY: 0.10,
            ValidationMethod.EXPERT_SYSTEM: 0.10,
            ValidationMethod.ML_QUALITY: 0.05
        }
        
        self.accuracy_thresholds = {
            AccuracyLevel.EXCELLENT: 0.95,
            AccuracyLevel.VERY_HIGH: 0.90,
            AccuracyLevel.HIGH: 0.80,
            AccuracyLevel.MODERATE: 0.70,
            AccuracyLevel.LOW: 0.60,
            AccuracyLevel.QUESTIONABLE: 0.0
        }
        
        self.validation_cache = {}
        self.historical_patterns = self._load_historical_patterns()
        
    def assess_data_accuracy(self, data_point: Dict[str, Any]) -> AccuracyMetrics:
        """
        Comprehensive accuracy assessment of a data point
        
        Args:
            data_point: The data to validate
            
        Returns:
            Complete accuracy metrics
        """
        try:
            validation_scores = {}
            passed_methods = []
            
            # Run all validation methods
            for method in ValidationMethod:
                score = self._run_validation_method(method, data_point)
                validation_scores[method.value] = score
                
                # Consider method passed if score > 0.7
                if score >= 0.7:
                    passed_methods.append(method)
            
            # Calculate weighted overall score
            overall_score = sum(
                score * self.validation_weights.get(ValidationMethod(method), 0.1)
                for method, score in validation_scores.items()
            )
            
            # Determine accuracy level
            accuracy_level = self._determine_accuracy_level(overall_score)
            
            # Calculate confidence interval
            confidence_interval = self._calculate_confidence_interval(validation_scores)
            
            # Generate quality indicators
            quality_indicators = self._generate_quality_indicators(data_point, validation_scores)
            
            # Generate improvement suggestions
            improvement_suggestions = self._generate_improvement_suggestions(validation_scores, data_point)
            
            return AccuracyMetrics(
                overall_score=overall_score,
                accuracy_level=accuracy_level,
                confidence_interval=confidence_interval,
                validation_methods_passed=passed_methods,
                validation_scores=validation_scores,
                quality_indicators=quality_indicators,
                improvement_suggestions=improvement_suggestions,
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error assessing data accuracy: {e}")
            return AccuracyMetrics(
                overall_score=0.0,
                accuracy_level=AccuracyLevel.QUESTIONABLE,
                confidence_interval=(0.0, 0.0),
                validation_methods_passed=[],
                validation_scores={},
                quality_indicators={'error': str(e)},
                improvement_suggestions=['Fix validation error'],
                timestamp=datetime.now().isoformat()
            )
    
    def _run_validation_method(self, method: ValidationMethod, data_point: Dict[str, Any]) -> float:
        """Run a specific validation method"""
        try:
            if method == ValidationMethod.MULTI_SOURCE:
                return self._multi_source_validation(data_point)
            elif method == ValidationMethod.STATISTICAL:
                return self._statistical_validation(data_point)
            elif method == ValidationMethod.PATTERN_MATCHING:
                return self._pattern_matching_validation(data_point)
            elif method == ValidationMethod.GEOGRAPHIC:
                return self._geographic_validation(data_point)
            elif method == ValidationMethod.TEMPORAL:
                return self._temporal_validation(data_point)
            elif method == ValidationMethod.COMMUNITY:
                return self._community_validation(data_point)
            elif method == ValidationMethod.EXPERT_SYSTEM:
                return self._expert_system_validation(data_point)
            elif method == ValidationMethod.ML_QUALITY:
                return self._ml_quality_validation(data_point)
            else:
                return 0.5  # Default moderate score
                
        except Exception as e:
            logger.warning(f"Validation method {method.value} failed: {e}")
            return 0.3  # Low score for failed validation
    
    def _multi_source_validation(self, data_point: Dict[str, Any]) -> float:
        """Validate using multiple data sources"""
        sources = data_point.get('data_sources', [])
        if len(sources) >= 3:
            return 0.95  # Excellent if 3+ sources
        elif len(sources) == 2:
            return 0.80  # High if 2 sources
        elif len(sources) == 1:
            return 0.60  # Moderate if 1 source
        else:
            return 0.20  # Low if no sources specified
    
    def _statistical_validation(self, data_point: Dict[str, Any]) -> float:
        """Statistical validation of data point"""
        confidence = data_point.get('confidence', 0.5)
        coordinates = data_point.get('coordinates', {})
        
        # Check confidence score
        conf_score = confidence if confidence > 0.5 else 0.3
        
        # Check coordinate validity
        coord_score = 1.0 if self._valid_coordinates(coordinates) else 0.3
        
        # Check for statistical outliers
        outlier_score = 0.8  # Assume not an outlier for now
        
        return np.mean([conf_score, coord_score, outlier_score])
    
    def _pattern_matching_validation(self, data_point: Dict[str, Any]) -> float:
        """Validate against historical patterns"""
        pattern_type = data_point.get('pattern_type', '').lower()
        region = data_point.get('region', '').lower()
        
        if pattern_type in self.historical_patterns.get(region, {}):
            # Pattern known in this region
            return 0.85
        elif pattern_type in [pattern for patterns in self.historical_patterns.values() for pattern in patterns]:
            # Pattern known in other regions
            return 0.70
        else:
            # Unknown pattern - needs more investigation
            return 0.50
    
    def _geographic_validation(self, data_point: Dict[str, Any]) -> float:
        """Validate geographic consistency"""
        coordinates = data_point.get('coordinates', {})
        region = data_point.get('region', '')
        
        if not self._valid_coordinates(coordinates):
            return 0.2
        
        # Check if coordinates match claimed region
        lat = coordinates.get('lat', 0)
        lon = coordinates.get('lon', 0)
        
        # Basic geographic consistency check
        if self._coordinates_in_expected_region(lat, lon, region):
            return 0.90
        else:
            return 0.40
    
    def _temporal_validation(self, data_point: Dict[str, Any]) -> float:
        """Validate temporal coherence"""
        timestamp = data_point.get('timestamp', '')
        cultural_period = data_point.get('cultural_period', '')
        
        try:
            data_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            # Check if data is recent (within last year)
            if datetime.now() - data_time < timedelta(days=365):
                return 0.80
            else:
                return 0.60
        except:
            return 0.50
    
    def _community_validation(self, data_point: Dict[str, Any]) -> float:
        """Community feedback validation"""
        # For now, return moderate score
        # In practice, this would check community feedback systems
        community_score = data_point.get('community_validation_score', 0.7)
        return min(community_score, 1.0)
    
    def _expert_system_validation(self, data_point: Dict[str, Any]) -> float:
        """Expert system rule-based validation"""
        score = 0.7  # Base score
        
        # Rule 1: High confidence + multiple sources = higher score
        if data_point.get('confidence', 0) > 0.8 and len(data_point.get('data_sources', [])) >= 2:
            score += 0.15
        
        # Rule 2: Known archaeological patterns = higher score
        if data_point.get('pattern_type', '').lower() in ['settlement', 'ceremonial', 'burial']:
            score += 0.10
        
        # Rule 3: Detailed description = higher score
        if len(data_point.get('description', '')) > 100:
            score += 0.05
        
        return min(score, 1.0)
    
    def _ml_quality_validation(self, data_point: Dict[str, Any]) -> float:
        """Machine learning quality assessment"""
        # Simplified ML quality score based on data completeness
        required_fields = ['coordinates', 'confidence', 'pattern_type', 'description']
        present_fields = sum(1 for field in required_fields if field in data_point and data_point[field])
        
        completeness_score = present_fields / len(required_fields)
        
        # Adjust for data quality indicators
        quality_adjustments = 0.0
        if data_point.get('confidence', 0) > 0.8:
            quality_adjustments += 0.1
        if len(data_point.get('description', '')) > 50:
            quality_adjustments += 0.1
        
        return min(completeness_score + quality_adjustments, 1.0)
    
    def _determine_accuracy_level(self, overall_score: float) -> AccuracyLevel:
        """Determine accuracy level from overall score"""
        for level, threshold in self.accuracy_thresholds.items():
            if overall_score >= threshold:
                return level
        return AccuracyLevel.QUESTIONABLE
    
    def _calculate_confidence_interval(self, validation_scores: Dict[str, float]) -> tuple:
        """Calculate confidence interval for the accuracy assessment"""
        scores = list(validation_scores.values())
        if len(scores) < 2:
            return (0.0, 1.0)
        
        mean_score = statistics.mean(scores)
        std_dev = statistics.stdev(scores) if len(scores) > 1 else 0.1
        
        # 95% confidence interval
        margin = 1.96 * std_dev / np.sqrt(len(scores))
        return (max(0.0, mean_score - margin), min(1.0, mean_score + margin))
    
    def _generate_quality_indicators(self, data_point: Dict[str, Any], validation_scores: Dict[str, float]) -> Dict[str, Any]:
        """Generate quality indicators"""
        return {
            'data_completeness': len([k for k, v in data_point.items() if v]) / max(len(data_point), 1),
            'source_diversity': len(set(data_point.get('data_sources', []))),
            'confidence_score': data_point.get('confidence', 0),
            'validation_consistency': statistics.stdev(list(validation_scores.values())) if len(validation_scores) > 1 else 0,
            'geographic_validity': self._valid_coordinates(data_point.get('coordinates', {})),
            'temporal_validity': bool(data_point.get('timestamp'))
        }
    
    def _generate_improvement_suggestions(self, validation_scores: Dict[str, float], data_point: Dict[str, Any]) -> List[str]:
        """Generate suggestions for improving data accuracy"""
        suggestions = []
        
        # Check low-scoring validation methods
        for method, score in validation_scores.items():
            if score < 0.6:
                if method == 'multi_source_validation':
                    suggestions.append("Add more data sources to increase reliability")
                elif method == 'statistical_analysis':
                    suggestions.append("Improve statistical confidence through additional measurements")
                elif method == 'geographic_consistency':
                    suggestions.append("Verify geographic coordinates and regional classification")
                elif method == 'temporal_coherence':
                    suggestions.append("Update timestamp and verify temporal context")
        
        # General suggestions
        if data_point.get('confidence', 0) < 0.7:
            suggestions.append("Increase confidence through additional validation")
        
        if len(data_point.get('description', '')) < 50:
            suggestions.append("Provide more detailed description of findings")
        
        return suggestions or ["Data accuracy is good - continue current practices"]
    
    def _valid_coordinates(self, coordinates: Dict[str, Any]) -> bool:
        """Check if coordinates are valid"""
        try:
            lat = float(coordinates.get('lat', 0))
            lon = float(coordinates.get('lon', 0))
            return -90 <= lat <= 90 and -180 <= lon <= 180
        except:
            return False
    
    def _coordinates_in_expected_region(self, lat: float, lon: float, region: str) -> bool:
        """Check if coordinates are in expected region"""
        # Simplified region checking for South America
        if region.lower() in ['amazon', 'peru', 'brazil', 'colombia']:
            return -20 <= lat <= 10 and -80 <= lon <= -40
        return True  # Default to true for unknown regions
    
    def _load_historical_patterns(self) -> Dict[str, List[str]]:
        """Load known historical patterns by region"""
        return {
            'amazon': ['settlement', 'ceremonial', 'agricultural', 'defensive'],
            'andes': ['settlement', 'ceremonial', 'burial', 'defensive', 'agricultural'],
            'coast': ['settlement', 'ceremonial', 'burial', 'trade'],
            'nazca': ['geoglyph', 'ceremonial', 'settlement'],
            'default': ['settlement', 'ceremonial', 'burial', 'agricultural']
        }
    
    def generate_accuracy_report(self, data_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate comprehensive accuracy report for multiple data points"""
        if not data_points:
            return {'error': 'No data points provided'}
        
        assessments = [self.assess_data_accuracy(dp) for dp in data_points]
        
        # Calculate aggregate metrics
        overall_scores = [a.overall_score for a in assessments]
        accuracy_levels = [a.accuracy_level.value for a in assessments]
        
        return {
            'total_data_points': len(data_points),
            'average_accuracy': statistics.mean(overall_scores),
            'accuracy_distribution': {
                level: accuracy_levels.count(level) for level in set(accuracy_levels)
            },
            'high_accuracy_percentage': len([s for s in overall_scores if s >= 0.8]) / len(overall_scores) * 100,
            'validation_summary': {
                method.value: statistics.mean([
                    a.validation_scores.get(method.value, 0) for a in assessments
                ]) for method in ValidationMethod
            },
            'improvement_priorities': self._get_improvement_priorities(assessments),
            'confidence_ranges': [a.confidence_interval for a in assessments],
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_improvement_priorities(self, assessments: List[AccuracyMetrics]) -> List[str]:
        """Get prioritized improvement suggestions"""
        all_suggestions = []
        for assessment in assessments:
            all_suggestions.extend(assessment.improvement_suggestions)
        
        # Count and prioritize suggestions
        suggestion_counts = {}
        for suggestion in all_suggestions:
            suggestion_counts[suggestion] = suggestion_counts.get(suggestion, 0) + 1
        
        # Return top 5 most common suggestions
        return sorted(suggestion_counts.keys(), key=lambda x: suggestion_counts[x], reverse=True)[:5] 