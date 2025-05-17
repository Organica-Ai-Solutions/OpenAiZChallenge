"""Consent Manager for Indigenous Knowledge.

Implements consent and authority verification systems following indigenous data sovereignty principles.
Based on the CARE Principles and Traditional Knowledge Labels.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime
import json
from pathlib import Path
import hashlib
import hmac
import base64

logger = logging.getLogger(__name__)

class ConsentManager:
    """Manages consent and authority verification for indigenous knowledge."""
    
    def __init__(self):
        """Initialize the consent manager."""
        self.authority_types = {
            'community_elder': {
                'description': 'Traditional community elder or leader',
                'verification_level': 'high',
                'requirements': ['official_position', 'community_recognition']
            },
            'knowledge_keeper': {
                'description': 'Recognized keeper of specific traditional knowledge',
                'verification_level': 'high',
                'requirements': ['knowledge_domain', 'community_recognition']
            },
            'cultural_authority': {
                'description': 'Designated cultural authority or organization',
                'verification_level': 'high',
                'requirements': ['organization_role', 'community_mandate']
            },
            'research_partner': {
                'description': 'Authorized research partner or institution',
                'verification_level': 'medium',
                'requirements': ['research_agreement', 'ethics_approval']
            }
        }
        
        self.consent_levels = {
            'full': {
                'description': 'Full consent for use and sharing',
                'restrictions': []
            },
            'restricted': {
                'description': 'Use restricted to specific purposes',
                'restrictions': ['purpose_limited', 'no_redistribution']
            },
            'ceremonial': {
                'description': 'Ceremonial or sacred knowledge',
                'restrictions': ['ceremony_only', 'elder_supervision']
            },
            'research': {
                'description': 'Research use only',
                'restrictions': ['research_only', 'attribution_required']
            }
        }
    
    async def verify_authority_signature(
        self,
        signature: str,
        authority_id: str
    ) -> bool:
        """Verify digital signature of authority.
        
        Args:
            signature: Digital signature to verify
            authority_id: ID of the claimed authority
            
        Returns:
            Whether signature is valid
        """
        try:
            # In practice, this would verify against a secure key store
            # For now, we'll do a simple HMAC verification
            stored_key = await self._get_authority_key(authority_id)
            if not stored_key:
                return False
                
            # Verify HMAC signature
            expected_signature = self._generate_signature(authority_id, stored_key)
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Error verifying authority signature: {str(e)}")
            return False
    
    async def register_consent(
        self,
        authority_id: str,
        consent_type: str,
        scope: Dict,
        duration: Optional[str] = None
    ) -> Dict:
        """Register consent for knowledge use.
        
        Args:
            authority_id: ID of consenting authority
            consent_type: Type of consent being given
            scope: Scope of the consent
            duration: Optional duration of consent
            
        Returns:
            Consent record
        """
        try:
            # Validate consent type
            if consent_type not in self.consent_levels:
                raise ValueError(f"Invalid consent type: {consent_type}")
            
            # Validate authority
            if not await self._verify_authority(authority_id):
                raise ValueError(f"Invalid or unauthorized authority: {authority_id}")
            
            # Create consent record
            consent_record = {
                'id': self._generate_consent_id(authority_id),
                'authority_id': authority_id,
                'consent_type': consent_type,
                'scope': scope,
                'restrictions': self.consent_levels[consent_type]['restrictions'],
                'timestamp': datetime.now().isoformat(),
                'duration': duration,
                'status': 'active'
            }
            
            # Store consent record
            await self._store_consent(consent_record)
            
            return consent_record
            
        except Exception as e:
            logger.error(f"Error registering consent: {str(e)}")
            return {
                'error': str(e)
            }
    
    async def verify_consent(
        self,
        consent_id: str,
        purpose: str
    ) -> Dict:
        """Verify if consent allows specific use.
        
        Args:
            consent_id: ID of the consent record
            purpose: Intended purpose of use
            
        Returns:
            Verification result
        """
        try:
            # Retrieve consent record
            consent_record = await self._get_consent(consent_id)
            if not consent_record:
                return {
                    'verified': False,
                    'reason': 'Consent record not found'
                }
            
            # Check if consent is still active
            if not self._is_consent_active(consent_record):
                return {
                    'verified': False,
                    'reason': 'Consent has expired'
                }
            
            # Check if purpose is allowed
            if not self._is_purpose_allowed(purpose, consent_record):
                return {
                    'verified': False,
                    'reason': 'Purpose not allowed by consent'
                }
            
            return {
                'verified': True,
                'consent_record': consent_record
            }
            
        except Exception as e:
            logger.error(f"Error verifying consent: {str(e)}")
            return {
                'verified': False,
                'error': str(e)
            }
    
    async def _verify_authority(self, authority_id: str) -> bool:
        """Verify if authority is valid and active."""
        # In practice, this would check against a secure authority registry
        return True
    
    async def _get_authority_key(self, authority_id: str) -> Optional[str]:
        """Retrieve authority's verification key."""
        # In practice, this would retrieve from a secure key store
        return 'test_key'
    
    def _generate_signature(self, authority_id: str, key: str) -> str:
        """Generate HMAC signature."""
        message = f"{authority_id}:{datetime.now().date().isoformat()}"
        h = hmac.new(
            key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        )
        return base64.b64encode(h.digest()).decode('utf-8')
    
    def _generate_consent_id(self, authority_id: str) -> str:
        """Generate unique consent identifier."""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"consent_{authority_id}_{timestamp}"
    
    async def _store_consent(self, consent_record: Dict) -> None:
        """Store consent record."""
        # In practice, this would store in a secure database
        pass
    
    async def _get_consent(self, consent_id: str) -> Optional[Dict]:
        """Retrieve consent record."""
        # In practice, this would retrieve from a secure database
        return None
    
    def _is_consent_active(self, consent_record: Dict) -> bool:
        """Check if consent is still active."""
        if consent_record['status'] != 'active':
            return False
            
        if consent_record['duration']:
            expiry = datetime.fromisoformat(consent_record['timestamp'])
            duration = datetime.strptime(consent_record['duration'], '%Y-%m-%d')
            if datetime.now() > expiry + duration:
                return False
                
        return True
    
    def _is_purpose_allowed(self, purpose: str, consent_record: Dict) -> bool:
        """Check if purpose is allowed by consent."""
        if 'allowed_purposes' in consent_record['scope']:
            return purpose in consent_record['scope']['allowed_purposes']
            
        # If no specific purposes listed, check against restrictions
        if 'research_only' in consent_record['restrictions']:
            return purpose == 'research'
        if 'ceremony_only' in consent_record['restrictions']:
            return purpose == 'ceremonial'
            
        return True 