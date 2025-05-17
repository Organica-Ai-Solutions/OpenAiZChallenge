"""Discovery Manager for Indigenous Knowledge Integration.

Manages the lifecycle of discoveries from initial registration through validation.
Integrates with the validation framework for confidence scoring and peer review.
"""

import logging
from typing import Dict, List, Optional, Union
from datetime import datetime
import json
from pathlib import Path
import uuid

from ..validation.validation_framework import ValidationFramework, EvidenceType
from ..utils.attribution import AttributionManager
from ..utils.consent import ConsentManager

logger = logging.getLogger(__name__)

class DiscoveryManager:
    """Manages the lifecycle of discoveries and their validation."""
    
    def __init__(self):
        """Initialize the discovery manager."""
        self.validation_framework = ValidationFramework()
        self.attribution_manager = AttributionManager()
        self.consent_manager = ConsentManager()
        
        self.discoveries = {}
        self.evidence_collections = {}
        self.review_assignments = {}
    
    async def register_discovery(
        self,
        title: str,
        description: str,
        discoverer: Dict,
        initial_evidence: List[Dict],
        source_community: Optional[Dict] = None
    ) -> Dict:
        """Register a new discovery for validation.
        
        Args:
            title: Title of the discovery
            description: Detailed description
            discoverer: Information about who made the discovery
            initial_evidence: Initial evidence supporting the discovery
            source_community: Optional information about source community
            
        Returns:
            Registration result with discovery ID
        """
        try:
            # Generate unique identifier
            discovery_id = self._generate_discovery_id()
            
            # Create discovery record
            discovery_record = {
                'id': discovery_id,
                'title': title,
                'description': description,
                'discoverer': discoverer,
                'source_community': source_community,
                'status': 'registered',
                'registration_date': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat()
            }
            
            # Store discovery
            self.discoveries[discovery_id] = discovery_record
            
            # Initialize evidence collection
            self.evidence_collections[discovery_id] = initial_evidence
            
            # Perform initial validation
            validation_result = await self.validation_framework.validate_discovery(
                discovery_id=discovery_id,
                evidence_list=initial_evidence
            )
            
            # Update discovery record with validation
            discovery_record['validation'] = validation_result
            discovery_record['status'] = 'validating'
            
            # Assign initial peer reviewers if needed
            if validation_result['confidence_level'] in ['probable', 'highly_likely']:
                await self._assign_peer_reviewers(discovery_id)
            
            return {
                'success': True,
                'discovery_id': discovery_id,
                'validation_result': validation_result
            }
            
        except Exception as e:
            logger.error(f"Error registering discovery: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def add_evidence(
        self,
        discovery_id: str,
        new_evidence: Dict,
        contributor: Dict
    ) -> Dict:
        """Add new evidence to an existing discovery.
        
        Args:
            discovery_id: ID of the discovery
            new_evidence: New evidence to add
            contributor: Information about who is adding the evidence
            
        Returns:
            Updated validation result
        """
        try:
            if discovery_id not in self.discoveries:
                raise ValueError(f"Discovery {discovery_id} not found")
            
            # Validate evidence format
            self._validate_evidence(new_evidence)
            
            # Add contributor information
            new_evidence['contributor'] = contributor
            new_evidence['added_date'] = datetime.now().isoformat()
            
            # Add to evidence collection
            self.evidence_collections[discovery_id].append(new_evidence)
            
            # Revalidate discovery
            validation_result = await self.validation_framework.validate_discovery(
                discovery_id=discovery_id,
                evidence_list=self.evidence_collections[discovery_id],
                peer_reviews=self.validation_framework.peer_reviews.get(discovery_id, [])
            )
            
            # Update discovery record
            self.discoveries[discovery_id]['validation'] = validation_result
            self.discoveries[discovery_id]['last_updated'] = datetime.now().isoformat()
            
            return {
                'success': True,
                'validation_result': validation_result
            }
            
        except Exception as e:
            logger.error(f"Error adding evidence: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def assign_reviewer(
        self,
        discovery_id: str,
        reviewer_info: Dict,
        assignment_type: str = 'peer_review'
    ) -> Dict:
        """Assign a reviewer to a discovery.
        
        Args:
            discovery_id: ID of the discovery
            reviewer_info: Information about the reviewer
            assignment_type: Type of review assignment
            
        Returns:
            Assignment confirmation
        """
        try:
            if discovery_id not in self.discoveries:
                raise ValueError(f"Discovery {discovery_id} not found")
            
            # Create review assignment
            assignment = {
                'assignment_id': self._generate_assignment_id(discovery_id),
                'discovery_id': discovery_id,
                'reviewer': reviewer_info,
                'type': assignment_type,
                'status': 'assigned',
                'assigned_date': datetime.now().isoformat(),
                'due_date': self._calculate_due_date(assignment_type)
            }
            
            # Store assignment
            if discovery_id not in self.review_assignments:
                self.review_assignments[discovery_id] = []
            self.review_assignments[discovery_id].append(assignment)
            
            return {
                'success': True,
                'assignment': assignment
            }
            
        except Exception as e:
            logger.error(f"Error assigning reviewer: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_discovery_status(self, discovery_id: str) -> Dict:
        """Get the current status of a discovery.
        
        Args:
            discovery_id: ID of the discovery
            
        Returns:
            Current status including validation and reviews
        """
        try:
            if discovery_id not in self.discoveries:
                raise ValueError(f"Discovery {discovery_id} not found")
            
            discovery = self.discoveries[discovery_id]
            evidence = self.evidence_collections[discovery_id]
            reviews = self.validation_framework.peer_reviews.get(discovery_id, [])
            assignments = self.review_assignments.get(discovery_id, [])
            
            return {
                'success': True,
                'discovery': discovery,
                'evidence_count': len(evidence),
                'evidence_types': self._summarize_evidence_types(evidence),
                'review_status': self._summarize_review_status(reviews, assignments),
                'validation_status': discovery['validation']['validation_status'],
                'confidence_level': discovery['validation']['confidence_level']
            }
            
        except Exception as e:
            logger.error(f"Error getting discovery status: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_discovery_id(self) -> str:
        """Generate unique identifier for a discovery."""
        return f"discovery_{uuid.uuid4().hex[:12]}"
    
    def _generate_assignment_id(self, discovery_id: str) -> str:
        """Generate unique identifier for a review assignment."""
        return f"assignment_{discovery_id}_{uuid.uuid4().hex[:8]}"
    
    def _validate_evidence(self, evidence: Dict) -> None:
        """Validate evidence format and required fields."""
        required_fields = ['type', 'description', 'source', 'quality']
        missing_fields = [f for f in required_fields if f not in evidence]
        
        if missing_fields:
            raise ValueError(f"Missing required evidence fields: {missing_fields}")
            
        if evidence['type'] not in [e.value for e in EvidenceType]:
            raise ValueError(f"Invalid evidence type: {evidence['type']}")
    
    def _calculate_due_date(self, assignment_type: str) -> str:
        """Calculate due date based on assignment type."""
        from datetime import timedelta
        
        delays = {
            'peer_review': timedelta(days=14),
            'expert_review': timedelta(days=21),
            'community_review': timedelta(days=30)
        }
        
        due_date = datetime.now() + delays.get(assignment_type, timedelta(days=14))
        return due_date.isoformat()
    
    async def _assign_peer_reviewers(self, discovery_id: str) -> None:
        """Automatically assign peer reviewers based on expertise."""
        # In practice, this would match reviewers based on expertise
        # For now, we'll just create placeholder assignments
        for _ in range(2):
            await self.assign_reviewer(
                discovery_id=discovery_id,
                reviewer_info={
                    'id': f"reviewer_{uuid.uuid4().hex[:8]}",
                    'expertise_level': 0.9,
                    'expertise_areas': ['archaeology', 'indigenous_knowledge']
                }
            )
    
    def _summarize_evidence_types(self, evidence: List[Dict]) -> Dict:
        """Summarize the types of evidence available."""
        type_counts = {}
        for e in evidence:
            type_counts[e['type']] = type_counts.get(e['type'], 0) + 1
            
        return {
            'type_counts': type_counts,
            'total_types': len(type_counts),
            'strongest_type': max(
                type_counts.keys(),
                key=lambda t: self.validation_framework.evidence_weights[EvidenceType(t)]
            )
        }
    
    def _summarize_review_status(
        self,
        reviews: List[Dict],
        assignments: List[Dict]
    ) -> Dict:
        """Summarize the current review status."""
        return {
            'completed_reviews': len(reviews),
            'pending_reviews': len([a for a in assignments if a['status'] == 'assigned']),
            'average_score': self._calculate_average_review_score(reviews),
            'review_coverage': self._calculate_review_coverage(reviews)
        }
    
    def _calculate_average_review_score(self, reviews: List[Dict]) -> float:
        """Calculate average review score."""
        if not reviews:
            return 0.0
            
        scores = [r.get('content', {}).get('score', 0) for r in reviews]
        return sum(scores) / len(scores)
    
    def _calculate_review_coverage(self, reviews: List[Dict]) -> Dict:
        """Calculate review coverage metrics."""
        total_aspects = 4  # evidence, methodology, interpretation, impact
        
        covered_aspects = set()
        for review in reviews:
            covered_aspects.update(review.get('content', {}).get('reviewed_aspects', []))
            
        return {
            'covered_aspects': len(covered_aspects),
            'total_aspects': total_aspects,
            'coverage_percentage': (len(covered_aspects) / total_aspects) * 100
        } 