"""Validation Framework for Indigenous Knowledge Integration.

Implements a comprehensive validation system that combines:
- Confidence scoring for discoveries
- Multi-evidence verification workflow
- Peer review system
"""

import logging
from typing import Dict, List, Optional, Union
from datetime import datetime
import json
from pathlib import Path
from enum import Enum
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class EvidenceType(Enum):
    """Types of evidence that can support a discovery."""
    SATELLITE_DATA = "satellite_data"
    LIDAR_DATA = "lidar_data"
    HISTORICAL_TEXT = "historical_text"
    ORAL_HISTORY = "oral_history"
    ARCHAEOLOGICAL = "archaeological"
    INDIGENOUS_KNOWLEDGE = "indigenous_knowledge"
    FIELD_OBSERVATION = "field_observation"
    EXPERT_OPINION = "expert_opinion"

class ConfidenceLevel(Enum):
    """Confidence levels for validated discoveries."""
    VERIFIED = "verified"  # Multiple evidence types, peer reviewed
    HIGHLY_LIKELY = "highly_likely"  # Strong evidence, pending peer review
    PROBABLE = "probable"  # Good evidence, needs more verification
    POSSIBLE = "possible"  # Initial evidence, needs investigation
    SPECULATIVE = "speculative"  # Limited evidence, needs substantial verification

@dataclass
class ValidationCriteria:
    """Criteria for validating a discovery."""
    min_evidence_types: int = 2  # Minimum number of different evidence types
    min_confidence_score: float = 0.7  # Minimum confidence score (0-1)
    required_peer_reviews: int = 2  # Minimum number of peer reviews
    min_reviewer_expertise: float = 0.8  # Minimum expertise level for reviewers (0-1)

class ValidationFramework:
    """Framework for validating discoveries and knowledge."""
    
    def __init__(self):
        """Initialize the validation framework."""
        self.evidence_weights = {
            EvidenceType.SATELLITE_DATA: 0.8,
            EvidenceType.LIDAR_DATA: 0.9,
            EvidenceType.HISTORICAL_TEXT: 0.7,
            EvidenceType.ORAL_HISTORY: 0.8,
            EvidenceType.ARCHAEOLOGICAL: 0.9,
            EvidenceType.INDIGENOUS_KNOWLEDGE: 0.9,
            EvidenceType.FIELD_OBSERVATION: 0.8,
            EvidenceType.EXPERT_OPINION: 0.7
        }
        
        self.validation_criteria = ValidationCriteria()
        self.peer_reviews = {}
        self.validated_discoveries = {}
    
    async def validate_discovery(
        self,
        discovery_id: str,
        evidence_list: List[Dict],
        peer_reviews: Optional[List[Dict]] = None
    ) -> Dict:
        """Validate a discovery using multiple evidence types and peer reviews.
        
        Args:
            discovery_id: Unique identifier for the discovery
            evidence_list: List of evidence supporting the discovery
            peer_reviews: Optional list of peer reviews
            
        Returns:
            Validation result with confidence score and status
        """
        try:
            # Calculate confidence score from evidence
            confidence_score = self._calculate_confidence_score(evidence_list)
            
            # Verify evidence diversity
            evidence_diversity = self._check_evidence_diversity(evidence_list)
            
            # Process peer reviews if available
            peer_review_score = self._process_peer_reviews(peer_reviews) if peer_reviews else None
            
            # Determine overall confidence level
            confidence_level = self._determine_confidence_level(
                confidence_score,
                evidence_diversity,
                peer_review_score
            )
            
            # Create validation record
            validation_record = {
                'discovery_id': discovery_id,
                'confidence_score': confidence_score,
                'evidence_diversity': evidence_diversity,
                'peer_review_score': peer_review_score,
                'confidence_level': confidence_level.value,
                'timestamp': datetime.now().isoformat(),
                'evidence_summary': self._summarize_evidence(evidence_list),
                'validation_status': self._get_validation_status(confidence_level)
            }
            
            # Store validation record
            self.validated_discoveries[discovery_id] = validation_record
            
            return validation_record
            
        except Exception as e:
            logger.error(f"Error validating discovery: {str(e)}")
            return {
                'error': str(e),
                'discovery_id': discovery_id
            }
    
    async def submit_peer_review(
        self,
        discovery_id: str,
        reviewer_info: Dict,
        review_content: Dict
    ) -> Dict:
        """Submit a peer review for a discovery.
        
        Args:
            discovery_id: ID of the discovery being reviewed
            reviewer_info: Information about the reviewer
            review_content: The actual review content
            
        Returns:
            Review submission result
        """
        try:
            # Validate reviewer expertise
            if reviewer_info.get('expertise_level', 0) < self.validation_criteria.min_reviewer_expertise:
                return {
                    'success': False,
                    'error': 'Insufficient reviewer expertise level'
                }
            
            # Create review record
            review_record = {
                'review_id': self._generate_review_id(discovery_id, reviewer_info),
                'discovery_id': discovery_id,
                'reviewer': reviewer_info,
                'content': review_content,
                'timestamp': datetime.now().isoformat(),
                'status': 'pending'
            }
            
            # Store review
            if discovery_id not in self.peer_reviews:
                self.peer_reviews[discovery_id] = []
            self.peer_reviews[discovery_id].append(review_record)
            
            # Check if we have enough reviews to update validation
            if len(self.peer_reviews[discovery_id]) >= self.validation_criteria.required_peer_reviews:
                await self._update_validation_status(discovery_id)
            
            return {
                'success': True,
                'review_id': review_record['review_id']
            }
            
        except Exception as e:
            logger.error(f"Error submitting peer review: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_confidence_score(self, evidence_list: List[Dict]) -> float:
        """Calculate confidence score based on evidence weights and quality."""
        if not evidence_list:
            return 0.0
            
        total_weight = 0
        weighted_sum = 0
        
        for evidence in evidence_list:
            evidence_type = EvidenceType(evidence['type'])
            evidence_quality = evidence.get('quality', 0.5)  # Default to medium quality
            weight = self.evidence_weights[evidence_type]
            
            weighted_sum += weight * evidence_quality
            total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def _check_evidence_diversity(self, evidence_list: List[Dict]) -> Dict:
        """Check the diversity of evidence types."""
        evidence_types = set(evidence['type'] for evidence in evidence_list)
        
        return {
            'unique_types': len(evidence_types),
            'meets_minimum': len(evidence_types) >= self.validation_criteria.min_evidence_types,
            'types_present': list(evidence_types)
        }
    
    def _process_peer_reviews(self, peer_reviews: List[Dict]) -> Dict:
        """Process peer reviews and calculate aggregate score."""
        if not peer_reviews:
            return None
            
        review_scores = [
            review.get('score', 0) * review['reviewer'].get('expertise_level', 0)
            for review in peer_reviews
        ]
        
        return {
            'average_score': np.mean(review_scores) if review_scores else 0,
            'review_count': len(peer_reviews),
            'meets_minimum': len(peer_reviews) >= self.validation_criteria.required_peer_reviews
        }
    
    def _determine_confidence_level(
        self,
        confidence_score: float,
        evidence_diversity: Dict,
        peer_review_score: Optional[Dict]
    ) -> ConfidenceLevel:
        """Determine the overall confidence level."""
        if (confidence_score >= 0.9 and 
            evidence_diversity['meets_minimum'] and 
            peer_review_score and 
            peer_review_score['meets_minimum'] and 
            peer_review_score['average_score'] >= 0.8):
            return ConfidenceLevel.VERIFIED
            
        if confidence_score >= 0.8 and evidence_diversity['meets_minimum']:
            return ConfidenceLevel.HIGHLY_LIKELY
            
        if confidence_score >= 0.7:
            return ConfidenceLevel.PROBABLE
            
        if confidence_score >= 0.5:
            return ConfidenceLevel.POSSIBLE
            
        return ConfidenceLevel.SPECULATIVE
    
    def _summarize_evidence(self, evidence_list: List[Dict]) -> Dict:
        """Create a summary of the evidence."""
        return {
            'total_evidence': len(evidence_list),
            'evidence_types': self._check_evidence_diversity(evidence_list),
            'strongest_evidence': self._get_strongest_evidence(evidence_list),
            'evidence_gaps': self._identify_evidence_gaps(evidence_list)
        }
    
    def _get_strongest_evidence(self, evidence_list: List[Dict]) -> Optional[Dict]:
        """Identify the strongest piece of evidence."""
        if not evidence_list:
            return None
            
        return max(
            evidence_list,
            key=lambda e: self.evidence_weights[EvidenceType(e['type'])] * e.get('quality', 0.5)
        )
    
    def _identify_evidence_gaps(self, evidence_list: List[Dict]) -> List[str]:
        """Identify missing evidence types that would strengthen the validation."""
        present_types = {EvidenceType(e['type']) for e in evidence_list}
        all_types = set(EvidenceType)
        
        return [
            missing_type.value for missing_type in (all_types - present_types)
            if self.evidence_weights[missing_type] >= 0.8  # Only suggest high-weight evidence
        ]
    
    def _get_validation_status(self, confidence_level: ConfidenceLevel) -> str:
        """Get the validation status based on confidence level."""
        status_map = {
            ConfidenceLevel.VERIFIED: "Fully validated",
            ConfidenceLevel.HIGHLY_LIKELY: "Pending final verification",
            ConfidenceLevel.PROBABLE: "Additional verification needed",
            ConfidenceLevel.POSSIBLE: "Initial validation phase",
            ConfidenceLevel.SPECULATIVE: "Preliminary assessment"
        }
        return status_map[confidence_level]
    
    def _generate_review_id(self, discovery_id: str, reviewer_info: Dict) -> str:
        """Generate unique identifier for a peer review."""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        reviewer_id = reviewer_info.get('id', 'anonymous')
        return f"review_{discovery_id}_{reviewer_id}_{timestamp}"
    
    async def _update_validation_status(self, discovery_id: str) -> None:
        """Update validation status when new peer reviews are added."""
        if discovery_id in self.validated_discoveries:
            validation_record = self.validated_discoveries[discovery_id]
            peer_reviews = self.peer_reviews.get(discovery_id, [])
            
            # Recalculate confidence with new peer reviews
            await self.validate_discovery(
                discovery_id=discovery_id,
                evidence_list=validation_record.get('evidence_summary', {}).get('evidence_list', []),
                peer_reviews=peer_reviews
            ) 