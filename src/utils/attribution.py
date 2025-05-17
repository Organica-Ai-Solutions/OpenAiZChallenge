"""Attribution Manager for Indigenous Knowledge.

Implements citation and attribution systems following best practices for indigenous knowledge.
Incorporates Traditional Knowledge (TK) and Biocultural (BC) Labels from Local Contexts.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class AttributionManager:
    """Manages citations and attributions for indigenous knowledge."""
    
    def __init__(self):
        """Initialize the attribution manager."""
        self.citation_templates = {
            'traditional_knowledge': {
                'format': "{community} Knowledge Holders. ({year}). {title}. "
                         "Traditional Knowledge contributed by {authority}. "
                         "{tk_label}. {access_date}.",
                'required_fields': ['community', 'year', 'title', 'authority']
            },
            'cultural_expressions': {
                'format': "{community} ({year}). {title}. Cultural expression "
                         "shared by {authority}. {bc_label}. {access_date}.",
                'required_fields': ['community', 'year', 'title', 'authority']
            },
            'biocultural_data': {
                'format': "{community} ({year}). {title}. Biocultural data "
                         "documented by {authority}. {bc_label}. {access_date}.",
                'required_fields': ['community', 'year', 'title', 'authority']
            },
            'spatial_knowledge': {
                'format': "{community} Knowledge Holders. ({year}). {title}. "
                         "Spatial knowledge contributed by {authority}. "
                         "{tk_label}. {access_date}.",
                'required_fields': ['community', 'year', 'title', 'authority']
            }
        }
        
        # Load TK and BC Labels
        self.tk_labels = self._load_tk_labels()
        self.bc_labels = self._load_bc_labels()
    
    def generate_notice(self, knowledge_id: str, attribution_info: Dict) -> Dict:
        """Generate attribution notice for knowledge use.
        
        Args:
            knowledge_id: Unique identifier for the knowledge
            attribution_info: Attribution requirements and information
            
        Returns:
            Attribution notice with citations and labels
        """
        try:
            # Extract knowledge type
            knowledge_type = knowledge_id.split('_')[0]
            
            # Validate required fields
            self._validate_attribution_info(knowledge_type, attribution_info)
            
            # Get appropriate labels
            tk_label = self._get_tk_label(attribution_info.get('tk_label_type', 'general'))
            bc_label = self._get_bc_label(attribution_info.get('bc_label_type', 'general'))
            
            # Format citation
            citation = self._format_citation(
                knowledge_type=knowledge_type,
                attribution_info=attribution_info,
                tk_label=tk_label,
                bc_label=bc_label
            )
            
            # Generate complete notice
            notice = {
                'citation': citation,
                'usage_guidelines': self._generate_usage_guidelines(attribution_info),
                'tk_label': tk_label,
                'bc_label': bc_label,
                'generated_date': datetime.now().isoformat()
            }
            
            return notice
            
        except Exception as e:
            logger.error(f"Error generating attribution notice: {str(e)}")
            return {
                'error': str(e)
            }
    
    def _validate_attribution_info(self, knowledge_type: str, attribution_info: Dict) -> None:
        """Validate attribution information completeness."""
        template = self.citation_templates.get(knowledge_type)
        if not template:
            raise ValueError(f"Invalid knowledge type: {knowledge_type}")
            
        missing_fields = [
            field for field in template['required_fields']
            if field not in attribution_info
        ]
        
        if missing_fields:
            raise ValueError(f"Missing required attribution fields: {missing_fields}")
    
    def _format_citation(
        self,
        knowledge_type: str,
        attribution_info: Dict,
        tk_label: Dict,
        bc_label: Dict
    ) -> str:
        """Format citation according to template."""
        template = self.citation_templates[knowledge_type]
        
        # Add current access date
        attribution_info['access_date'] = datetime.now().strftime('%Y-%m-%d')
        
        # Add label references
        attribution_info['tk_label'] = tk_label.get('reference', '')
        attribution_info['bc_label'] = bc_label.get('reference', '')
        
        return template['format'].format(**attribution_info)
    
    def _generate_usage_guidelines(self, attribution_info: Dict) -> List[str]:
        """Generate usage guidelines based on attribution requirements."""
        guidelines = [
            "1. Always include the provided citation when using this knowledge.",
            "2. Respect any cultural protocols specified by the knowledge holders.",
            "3. Use the knowledge only for the approved purposes.",
            "4. Contact the specified authority for any additional uses."
        ]
        
        # Add custom guidelines if specified
        if 'custom_guidelines' in attribution_info:
            guidelines.extend(attribution_info['custom_guidelines'])
            
        return guidelines
    
    def _load_tk_labels(self) -> Dict:
        """Load Traditional Knowledge Labels."""
        # In practice, these would be loaded from Local Contexts API
        return {
            'general': {
                'name': 'Traditional Knowledge Label',
                'reference': 'TK Label General',
                'description': 'This material has cultural and traditional knowledge significance.'
            },
            'sacred': {
                'name': 'Sacred Knowledge Label',
                'reference': 'TK Label Sacred',
                'description': 'This material contains sacred cultural knowledge.'
            },
            'seasonal': {
                'name': 'Seasonal Knowledge Label',
                'reference': 'TK Label Seasonal',
                'description': 'This knowledge has seasonal use restrictions.'
            }
        }
    
    def _load_bc_labels(self) -> Dict:
        """Load Biocultural Labels."""
        # In practice, these would be loaded from Local Contexts API
        return {
            'general': {
                'name': 'Biocultural Label',
                'reference': 'BC Label General',
                'description': 'This material has biocultural significance.'
            },
            'community': {
                'name': 'Community Label',
                'reference': 'BC Label Community',
                'description': 'This material belongs to a specific community.'
            },
            'provenance': {
                'name': 'Provenance Label',
                'reference': 'BC Label Provenance',
                'description': 'This material has specific provenance requirements.'
            }
        }
    
    def _get_tk_label(self, label_type: str) -> Dict:
        """Get Traditional Knowledge Label by type."""
        return self.tk_labels.get(label_type, self.tk_labels['general'])
    
    def _get_bc_label(self, label_type: str) -> Dict:
        """Get Biocultural Label by type."""
        return self.bc_labels.get(label_type, self.bc_labels['general']) 