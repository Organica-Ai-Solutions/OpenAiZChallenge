"""Indigenous Knowledge Manager implementing CARE Principles.

This module implements the CARE Principles for Indigenous Data Governance:
- Collective Benefit
- Authority to Control 
- Responsibility
- Ethics

References:
- CARE Principles: https://www.gida-global.org/care
- Local Contexts: https://localcontexts.org/
"""

import logging
from typing import Dict, List, Optional, Union
from pathlib import Path
from datetime import datetime
import json

from ..infrastructure.database import get_database_client
from ..validation.data_validator import DataValidator
from ..utils.attribution import AttributionManager
from ..utils.consent import ConsentManager

logger = logging.getLogger(__name__)

class IndigenousKnowledgeManager:
    """Manages indigenous knowledge integration following CARE principles."""
    
    def __init__(self, output_dir: Optional[Path] = None):
        """Initialize the indigenous knowledge manager.
        
        Args:
            output_dir: Directory for outputs
        """
        self.output_dir = Path(output_dir) if output_dir else Path('outputs/indigenous')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.db = get_database_client()
        self.validator = DataValidator()
        self.attribution = AttributionManager()
        self.consent = ConsentManager()
        
        # Initialize knowledge base structure
        self.knowledge_base = {
            'traditional_knowledge': {},
            'cultural_expressions': {},
            'biocultural_data': {},
            'spatial_knowledge': {}
        }
    
    async def register_knowledge(
        self,
        knowledge_type: str,
        content: Dict,
        source: Dict,
        permissions: Dict,
        attribution: Dict
    ) -> Dict:
        """Register new indigenous knowledge with proper attribution and permissions.
        
        Args:
            knowledge_type: Type of knowledge (traditional, cultural, biocultural, spatial)
            content: The knowledge content
            source: Source information including community/individual
            permissions: Usage permissions and restrictions
            attribution: Attribution requirements
            
        Returns:
            Registration receipt with unique identifier
        """
        try:
            # Validate inputs
            self._validate_registration(knowledge_type, content, source, permissions)
            
            # Generate unique identifier
            knowledge_id = self._generate_id(knowledge_type, source)
            
            # Create knowledge record
            knowledge_record = {
                'id': knowledge_id,
                'type': knowledge_type,
                'content': content,
                'source': source,
                'permissions': permissions,
                'attribution': attribution,
                'metadata': {
                    'registered_date': datetime.now().isoformat(),
                    'last_modified': datetime.now().isoformat(),
                    'version': '1.0'
                }
            }
            
            # Store in knowledge base
            self.knowledge_base[knowledge_type][knowledge_id] = knowledge_record
            
            # Save to persistent storage
            await self._save_to_database(knowledge_record)
            
            # Generate attribution notice
            attribution_notice = self.attribution.generate_notice(
                knowledge_id=knowledge_id,
                attribution_info=attribution
            )
            
            return {
                'success': True,
                'knowledge_id': knowledge_id,
                'attribution_notice': attribution_notice
            }
            
        except Exception as e:
            logger.error(f"Error registering knowledge: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def access_knowledge(
        self,
        knowledge_id: str,
        purpose: str,
        user_info: Dict
    ) -> Dict:
        """Access registered knowledge with proper permissions checking.
        
        Args:
            knowledge_id: Unique identifier for the knowledge
            purpose: Intended purpose of access
            user_info: Information about the requesting user
            
        Returns:
            Knowledge content if access granted
        """
        try:
            # Check permissions
            if not await self._check_permissions(knowledge_id, purpose, user_info):
                return {
                    'success': False,
                    'error': 'Access denied - insufficient permissions'
                }
            
            # Get knowledge record
            knowledge_type = self._get_knowledge_type(knowledge_id)
            record = self.knowledge_base[knowledge_type][knowledge_id]
            
            # Log access
            await self._log_access(knowledge_id, user_info, purpose)
            
            # Return content with attribution notice
            return {
                'success': True,
                'content': record['content'],
                'attribution_notice': record['attribution'],
                'permissions': record['permissions']
            }
            
        except Exception as e:
            logger.error(f"Error accessing knowledge: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def update_permissions(
        self,
        knowledge_id: str,
        new_permissions: Dict,
        authority_proof: Dict
    ) -> Dict:
        """Update permissions for registered knowledge.
        
        Args:
            knowledge_id: Unique identifier for the knowledge
            new_permissions: New permission settings
            authority_proof: Proof of authority to modify permissions
            
        Returns:
            Update confirmation
        """
        try:
            # Verify authority
            if not await self._verify_authority(knowledge_id, authority_proof):
                return {
                    'success': False,
                    'error': 'Unauthorized to modify permissions'
                }
            
            # Update permissions
            knowledge_type = self._get_knowledge_type(knowledge_id)
            record = self.knowledge_base[knowledge_type][knowledge_id]
            record['permissions'] = new_permissions
            record['metadata']['last_modified'] = datetime.now().isoformat()
            
            # Save changes
            await self._save_to_database(record)
            
            return {
                'success': True,
                'knowledge_id': knowledge_id,
                'new_permissions': new_permissions
            }
            
        except Exception as e:
            logger.error(f"Error updating permissions: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _validate_registration(
        self,
        knowledge_type: str,
        content: Dict,
        source: Dict,
        permissions: Dict
    ) -> None:
        """Validate registration inputs."""
        if knowledge_type not in self.knowledge_base:
            raise ValueError(f"Invalid knowledge type: {knowledge_type}")
            
        required_source_fields = ['community', 'authority', 'contact']
        if not all(field in source for field in required_source_fields):
            raise ValueError(f"Source must contain: {required_source_fields}")
            
        required_permission_fields = ['access_level', 'usage_restrictions', 'expiry_date']
        if not all(field in permissions for field in required_permission_fields):
            raise ValueError(f"Permissions must contain: {required_permission_fields}")
    
    def _generate_id(self, knowledge_type: str, source: Dict) -> str:
        """Generate unique identifier for knowledge record."""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        community = source['community'].lower().replace(' ', '_')
        return f"{knowledge_type}_{community}_{timestamp}"
    
    async def _save_to_database(self, record: Dict) -> None:
        """Save knowledge record to persistent storage."""
        await self.db.save_record(
            collection='indigenous_knowledge',
            record=record
        )
    
    async def _check_permissions(
        self,
        knowledge_id: str,
        purpose: str,
        user_info: Dict
    ) -> bool:
        """Check if access should be granted."""
        knowledge_type = self._get_knowledge_type(knowledge_id)
        record = self.knowledge_base[knowledge_type][knowledge_id]
        
        # Check basic access level
        if record['permissions']['access_level'] == 'restricted':
            if 'authorized_users' not in record['permissions']:
                return False
            if user_info['id'] not in record['permissions']['authorized_users']:
                return False
        
        # Check purpose against usage restrictions
        if purpose not in record['permissions']['allowed_purposes']:
            return False
        
        # Check expiry
        if datetime.now().isoformat() > record['permissions']['expiry_date']:
            return False
            
        return True
    
    def _get_knowledge_type(self, knowledge_id: str) -> str:
        """Extract knowledge type from ID."""
        return knowledge_id.split('_')[0]
    
    async def _log_access(
        self,
        knowledge_id: str,
        user_info: Dict,
        purpose: str
    ) -> None:
        """Log access to knowledge."""
        access_log = {
            'knowledge_id': knowledge_id,
            'user': user_info,
            'purpose': purpose,
            'timestamp': datetime.now().isoformat()
        }
        await self.db.save_record(
            collection='access_logs',
            record=access_log
        )
    
    async def _verify_authority(
        self,
        knowledge_id: str,
        authority_proof: Dict
    ) -> bool:
        """Verify authority to modify knowledge record."""
        knowledge_type = self._get_knowledge_type(knowledge_id)
        record = self.knowledge_base[knowledge_type][knowledge_id]
        
        # Check if proof matches source authority
        if authority_proof['authority_id'] != record['source']['authority']:
            return False
            
        # Verify proof signature
        return await self.consent.verify_authority_signature(
            authority_proof['signature'],
            authority_proof['authority_id']
        ) 