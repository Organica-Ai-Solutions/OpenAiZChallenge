"""
OpenAI Archaeological Discovery Agent
Specialized integration with GPT-4.1 and o3-mini for archaeological site discovery
Built for the OpenAI to Z Challenge competition
"""

import os
import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import base64
import json

# Set up logger first
logger = logging.getLogger(__name__)

# Fix OpenAI import for proper AsyncClient usage
try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
    logger.info("OpenAI library imported successfully")
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available")

from ..config import app_settings


class OpenAIArchaeologyAgent:
    """
    OpenAI-powered archaeological discovery agent using GPT-4 and latest models
    Specifically designed for Amazon archaeological site discovery
    """
    
    def __init__(self):
        """Initialize OpenAI clients for archaeological analysis"""
        if not OPENAI_AVAILABLE or not app_settings.OPENAI_API_KEY:
            logger.warning("OpenAI not available - using mock mode")
            self.client = None
            self.mock_mode = True
        else:
            try:
                # Initialize AsyncOpenAI client with proper error handling
                self.client = AsyncOpenAI(
                    api_key=app_settings.OPENAI_API_KEY
                )
                self.mock_mode = False
                logger.info("✅ OpenAI client initialized successfully for live API calls")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                self.client = None
                self.mock_mode = True
        
        # Updated model names for latest OpenAI models (Competition requirement: GPT-4.1)
        self.models = {
            'vision': 'gpt-4.1-preview',  # GPT-4.1 with vision capabilities for competition
            'reasoning': 'gpt-4.1-preview',  # GPT-4.1 for reasoning as required by competition
            'analysis': 'gpt-4.1-preview'  # GPT-4.1 for all analysis as per competition rules
        }
        
        # Archaeological analysis prompts
        self.prompts = {
            'satellite_analysis': self._get_satellite_analysis_prompt(),
            'archaeological_reasoning': self._get_reasoning_prompt(),
            'historical_correlation': self._get_historical_prompt(),
            'discovery_synthesis': self._get_synthesis_prompt()
        }
        
        logger.info(f"OpenAI Archaeological Agent initialized - Mock mode: {self.mock_mode}")
    
    async def analyze_archaeological_site(
        self,
        coordinates: Tuple[float, float],
        satellite_data: Dict[str, Any],
        lidar_data: Optional[Dict[str, Any]] = None,
        historical_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Complete archaeological site analysis using OpenAI models
        
        Args:
            coordinates: (latitude, longitude) of the site
            satellite_data: Satellite imagery and metadata
            lidar_data: LiDAR elevation data if available
            historical_context: Historical texts or references
            
        Returns:
            Comprehensive archaeological analysis results
        """
        try:
            logger.info(f"Starting OpenAI archaeological analysis for {coordinates}")
            
            if self.mock_mode:
                return self._generate_mock_analysis(coordinates, satellite_data, lidar_data, historical_context)
            
            # Parallel analysis using different OpenAI capabilities
            tasks = [
                self._analyze_satellite_imagery(coordinates, satellite_data),
                self._generate_archaeological_hypothesis(coordinates, satellite_data, historical_context),
                self._correlate_historical_data(coordinates, historical_context)
            ]
            
            if lidar_data:
                tasks.append(self._analyze_terrain_features(coordinates, lidar_data))
            
            # Execute all analyses in parallel
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Synthesize results using GPT-4
            synthesis = await self._synthesize_discovery_results(
                coordinates, results, satellite_data, lidar_data, historical_context
            )
            
            return {
                'coordinates': coordinates,
                'timestamp': datetime.utcnow().isoformat(),
                'satellite_analysis': results[0] if not isinstance(results[0], Exception) else None,
                'archaeological_hypothesis': results[1] if not isinstance(results[1], Exception) else None,
                'historical_correlation': results[2] if not isinstance(results[2], Exception) else None,
                'terrain_analysis': results[3] if len(results) > 3 and not isinstance(results[3], Exception) else None,
                'synthesis': synthesis,
                'openai_models_used': list(self.models.values()),
                'confidence_score': synthesis.get('confidence_score', 0.0)
            }
            
        except Exception as e:
            logger.error(f"Error in OpenAI archaeological analysis: {e}")
            return {'error': str(e), 'coordinates': coordinates}
    
    def _generate_mock_analysis(
        self,
        coordinates: Tuple[float, float],
        satellite_data: Dict[str, Any],
        lidar_data: Optional[Dict[str, Any]],
        historical_context: Optional[str]
    ) -> Dict[str, Any]:
        """Generate mock analysis for testing when OpenAI is not available"""
        logger.info("Generating mock OpenAI analysis for testing")
        
        mock_satellite_analysis = {
            'analysis': f"Mock satellite analysis for coordinates {coordinates}. Geometric patterns detected indicating potential archaeological structures. Vegetation anomalies suggest buried features. Water management systems visible in terrain patterns. Confidence: 75%",
            'features_detected': ['geometric_patterns', 'vegetation_anomalies', 'water_management'],
            'confidence': 0.75,
            'model_used': 'mock-gpt-4-vision'
        }
        
        mock_hypothesis = {
            'hypothesis': f"Archaeological analysis of site at {coordinates} suggests a pre-Columbian settlement with advanced water management capabilities. The geometric patterns and vegetation anomalies indicate organized settlement planning consistent with complex Amazonian societies. The site likely represents a ceremonial or administrative center with associated agricultural infrastructure.",
            'reasoning_chain': [
                "1. Geometric patterns indicate planned settlement layout",
                "2. Vegetation anomalies suggest buried architectural features", 
                "3. Water management systems indicate sophisticated engineering",
                "4. Site location optimal for resource access and defense"
            ],
            'cultural_significance': "High cultural significance as potential pre-Columbian ceremonial and administrative center",
            'research_recommendations': [
                "Recommend ground-penetrating radar survey",
                "Suggest botanical analysis of vegetation anomalies",
                "Recommend consultation with local indigenous communities"
            ],
            'model_used': 'mock-gpt-4-turbo'
        }
        
        mock_historical = {
            'historical_correlation': "Historical analysis indicates alignment with known pre-Columbian settlement patterns in the Amazon Basin. Colonial documents from the 16th century reference organized settlements in this region. Indigenous oral histories confirm cultural significance of the area.",
            'temporal_period': 'Pre-Columbian',
            'cultural_groups': ['Indigenous', 'Pre-Columbian'],
            'similar_sites': [],
            'model_used': 'mock-gpt-4-turbo'
        }
        
        mock_synthesis = {
            'synthesis': f"Comprehensive analysis of archaeological site at {coordinates} indicates high probability of significant pre-Columbian settlement. Multiple lines of evidence including satellite imagery, historical documentation, and terrain analysis converge on a confidence assessment of 78%. The site represents a high-priority target for further archaeological investigation.",
            'confidence_score': 0.78,
            'archaeological_interpretation': "Pre-Columbian settlement with ceremonial and administrative functions",
            'research_priority': 'High',
            'next_steps': [
                "Conduct ground survey with local archaeologists",
                "Engage with indigenous communities for traditional knowledge",
                "Apply for research permits and approvals",
                "Plan detailed geophysical survey",
                "Develop collaborative research framework"
            ],
            'openai_synthesis': True
        }
        
        return {
            'coordinates': coordinates,
            'timestamp': datetime.utcnow().isoformat(),
            'satellite_analysis': mock_satellite_analysis,
            'archaeological_hypothesis': mock_hypothesis,
            'historical_correlation': mock_historical,
            'terrain_analysis': None,
            'synthesis': mock_synthesis,
            'openai_models_used': ['mock-gpt-4-vision', 'mock-gpt-4-turbo'],
            'confidence_score': 0.78,
            'mock_mode': True
        }
    
    async def _analyze_satellite_imagery(
        self,
        coordinates: Tuple[float, float],
        satellite_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Use GPT-4 Vision to analyze satellite imagery for archaeological features"""
        try:
            if self.mock_mode or not self.client:
                return self._generate_mock_analysis(coordinates, satellite_data, None, None)['satellite_analysis']
            
            # Prepare satellite imagery for vision analysis
            image_description = self._prepare_satellite_description(satellite_data)
            
            response = await self.client.chat.completions.create(
                model=self.models['vision'],
                messages=[
                    {
                        "role": "system",
                        "content": self.prompts['satellite_analysis']
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Analyze this satellite imagery for archaeological features at coordinates {coordinates}.
                        
                        Satellite Data Description:
                        {image_description}
                        
                        Focus on:
                        1. Geometric patterns that might indicate human-made structures
                        2. Vegetation anomalies that could hide archaeological sites
                        3. Terrain modifications suggesting past human activity
                        4. Water management features (canals, reservoirs, elevated areas)
                        5. Settlement patterns and organization
                        
                        Provide confidence percentages for each identified feature.
                        """
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            analysis_text = response.choices[0].message.content
            
            # Parse structured results from the response
            return {
                'analysis': analysis_text,
                'features_detected': self._extract_features_from_analysis(analysis_text),
                'confidence': self._extract_confidence_from_analysis(analysis_text),
                'model_used': self.models['vision']
            }
            
        except Exception as e:
            logger.error(f"Satellite imagery analysis error: {e}")
            return {'error': str(e)}
    
    async def _generate_archaeological_hypothesis(
        self,
        coordinates: Tuple[float, float],
        satellite_data: Dict[str, Any],
        historical_context: Optional[str]
    ) -> Dict[str, Any]:
        """Use o3-mini equivalent for archaeological reasoning and hypothesis generation"""
        try:
            if self.mock_mode or not self.client:
                return self._generate_mock_analysis(coordinates, satellite_data, None, historical_context)['archaeological_hypothesis']
            
            context = f"""
            Archaeological Site Analysis Request
            Location: {coordinates[0]:.6f}, {coordinates[1]:.6f}
            Region: Amazon Basin
            
            Satellite Evidence Summary:
            {self._summarize_satellite_data(satellite_data)}
            
            Historical Context:
            {historical_context or 'No specific historical context provided'}
            """
            
            response = await self.client.chat.completions.create(
                model=self.models['reasoning'],
                messages=[
                    {
                        "role": "system", 
                        "content": self.prompts['archaeological_reasoning']
                    },
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                max_tokens=1200,
                temperature=0.4
            )
            
            hypothesis_text = response.choices[0].message.content
            
            return {
                'hypothesis': hypothesis_text,
                'reasoning_chain': self._extract_reasoning_chain(hypothesis_text),
                'cultural_significance': self._extract_cultural_significance(hypothesis_text),
                'research_recommendations': self._extract_recommendations(hypothesis_text),
                'model_used': self.models['reasoning']
            }
            
        except Exception as e:
            logger.error(f"Archaeological hypothesis generation error: {e}")
            return {'error': str(e)}
    
    async def _correlate_historical_data(
        self,
        coordinates: Tuple[float, float],
        historical_context: Optional[str]
    ) -> Dict[str, Any]:
        """Correlate site location with historical records and documentation"""
        try:
            if self.mock_mode or not self.client:
                return self._generate_mock_analysis(coordinates, {}, None, historical_context)['historical_correlation']
            
            if not historical_context:
                return {'message': 'No historical context provided for correlation'}
            
            response = await self.client.chat.completions.create(
                model=self.models['analysis'],
                messages=[
                    {
                        "role": "system",
                        "content": self.prompts['historical_correlation']
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Correlate this archaeological site at {coordinates} with historical records:
                        
                        Historical Context:
                        {historical_context}
                        
                        Analyze:
                        1. Temporal alignment with known archaeological periods
                        2. Cultural group associations
                        3. Trade route connections
                        4. Environmental context and resource access
                        5. Similar sites in the region
                        """
                    }
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            correlation_text = response.choices[0].message.content
            
            return {
                'historical_correlation': correlation_text,
                'temporal_period': self._extract_temporal_period(correlation_text),
                'cultural_groups': self._extract_cultural_groups(correlation_text),
                'similar_sites': self._extract_similar_sites(correlation_text),
                'model_used': self.models['analysis']
            }
            
        except Exception as e:
            logger.error(f"Historical correlation error: {e}")
            return {'error': str(e)}
    
    async def _analyze_terrain_features(
        self,
        coordinates: Tuple[float, float],
        lidar_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze LiDAR terrain data for archaeological features"""
        try:
            if self.mock_mode or not self.client:
                return {
                    'terrain_analysis': f"Mock terrain analysis for {coordinates} indicates elevation anomalies consistent with archaeological features. Linear features suggest organized settlement layout. Terracing visible in elevation data.",
                    'elevation_anomalies': ['mound', 'terrace', 'linear_features'],
                    'model_used': 'mock-gpt-4-turbo'
                }
            
            terrain_description = self._prepare_lidar_description(lidar_data)
            
            response = await self.client.chat.completions.create(
                model=self.models['analysis'],
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert in archaeological LiDAR analysis specializing in Amazon archaeological sites. Analyze terrain data for evidence of past human activity."""
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Analyze this LiDAR terrain data for archaeological features at {coordinates}:
                        
                        {terrain_description}
                        
                        Look for:
                        1. Elevation anomalies indicating structures or earthworks
                        2. Linear features suggesting roads, canals, or boundaries
                        3. Circular or geometric patterns
                        4. Terracing or agricultural modifications
                        5. Defensive features or settlement organization
                        """
                    }
                ],
                max_tokens=600,
                temperature=0.3
            )
            
            return {
                'terrain_analysis': response.choices[0].message.content,
                'elevation_anomalies': self._extract_elevation_features(response.choices[0].message.content),
                'model_used': self.models['analysis']
            }
            
        except Exception as e:
            logger.error(f"Terrain analysis error: {e}")
            return {'error': str(e)}
    
    async def _synthesize_discovery_results(
        self,
        coordinates: Tuple[float, float],
        analysis_results: List[Any],
        satellite_data: Dict[str, Any],
        lidar_data: Optional[Dict[str, Any]],
        historical_context: Optional[str]
    ) -> Dict[str, Any]:
        """Synthesize all analysis results into final archaeological assessment"""
        try:
            if self.mock_mode or not self.client:
                return self._generate_mock_analysis(coordinates, satellite_data, lidar_data, historical_context)['synthesis']
            
            # Combine all valid analysis results
            combined_evidence = self._combine_analysis_results(analysis_results)
            
            response = await self.client.chat.completions.create(
                model=self.models['reasoning'],
                messages=[
                    {
                        "role": "system",
                        "content": self.prompts['discovery_synthesis']
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Synthesize archaeological discovery results for site at {coordinates}:
                        
                        Combined Evidence:
                        {combined_evidence}
                        
                        Provide:
                        1. Overall confidence assessment (0-100%)
                        2. Primary archaeological interpretation
                        3. Supporting evidence summary
                        4. Recommended next steps
                        5. Potential cultural significance
                        6. Research priority level (Low/Medium/High)
                        """
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            synthesis_text = response.choices[0].message.content
            
            return {
                'synthesis': synthesis_text,
                'confidence_score': self._extract_final_confidence(synthesis_text),
                'archaeological_interpretation': self._extract_interpretation(synthesis_text),
                'research_priority': self._extract_priority(synthesis_text),
                'next_steps': self._extract_next_steps(synthesis_text),
                'openai_synthesis': True
            }
            
        except Exception as e:
            logger.error(f"Discovery synthesis error: {e}")
            return {'error': str(e), 'confidence_score': 0.0}
    
    # Helper methods for prompt templates
    def _get_satellite_analysis_prompt(self) -> str:
        return """You are an expert in archaeological remote sensing and satellite imagery analysis, specializing in Amazon archaeological sites. You have extensive experience identifying pre-Columbian settlements, earthworks, and cultural landscapes from satellite imagery.

When analyzing satellite imagery, focus on:
- Geometric patterns that contrast with natural formations
- Vegetation anomalies that might indicate buried structures
- Soil marks and cropmarks revealing archaeological features
- Water management systems (canals, reservoirs, raised fields)
- Settlement organization and site hierarchy
- Evidence of landscape modification

Provide specific, technical analysis with confidence percentages for each identified feature. Consider the unique characteristics of Amazon archaeological sites including geoglyphs, raised fields, forest islands, and riverine settlements."""
    
    def _get_reasoning_prompt(self) -> str:
        return """You are a leading expert in Amazon archaeology and pre-Columbian cultures. You specialize in interpreting archaeological evidence and generating testable hypotheses about ancient settlements and cultural practices.

Your analysis should:
- Consider multiple lines of evidence (environmental, cultural, temporal)
- Reference known archaeological patterns in the Amazon
- Propose testable hypotheses based on the evidence
- Assess cultural significance and regional importance
- Suggest appropriate research methodologies
- Consider indigenous knowledge and perspectives

Be specific about temporal periods, cultural groups, and archaeological phenomena. Provide clear reasoning chains that can be evaluated and tested."""
    
    def _get_historical_prompt(self) -> str:
        return """You are an expert in Amazon ethnohistory and archaeological documentation. You specialize in correlating archaeological sites with historical records, colonial documents, and ethnographic accounts.

Analyze historical evidence for:
- Temporal context and dating
- Cultural group associations
- Regional settlement patterns
- Environmental and resource contexts
- Trade and interaction networks
- Colonial period impacts

Reference specific historical sources and archaeological parallels where relevant. Consider both indigenous oral histories and colonial documentation."""
    
    def _get_synthesis_prompt(self) -> str:
        return """You are a senior archaeological researcher specializing in Amazon prehistory. Your role is to synthesize multiple lines of evidence into comprehensive archaeological assessments.

Provide balanced, critical evaluation that:
- Weighs evidence quality and reliability
- Considers alternative interpretations
- Assesses site significance and research potential
- Recommends appropriate next steps
- Evaluates confidence levels honestly
- Considers ethical and collaborative research approaches

Your synthesis should be suitable for academic peer review while being accessible to broader archaeological communities."""
    
    # Helper methods for data processing
    def _prepare_satellite_description(self, satellite_data: Dict[str, Any]) -> str:
        """Convert satellite data into descriptive text for analysis"""
        return f"""
        Resolution: {satellite_data.get('resolution', 'Unknown')}
        Bands: {satellite_data.get('bands', 'RGB')}
        Date: {satellite_data.get('acquisition_date', 'Unknown')}
        Quality: {satellite_data.get('cloud_cover', 'Unknown')} cloud cover
        Source: {satellite_data.get('source', 'Satellite imagery')}
        """
    
    def _prepare_lidar_description(self, lidar_data: Dict[str, Any]) -> str:
        """Convert LiDAR data into descriptive text for analysis"""
        return f"""
        Resolution: {lidar_data.get('resolution', 'Unknown')}m
        Elevation range: {lidar_data.get('elevation_range', 'Unknown')}
        Acquisition: {lidar_data.get('acquisition_date', 'Unknown')}
        Processing: {lidar_data.get('processing_type', 'Digital Terrain Model')}
        """
    
    def _summarize_satellite_data(self, satellite_data: Dict[str, Any]) -> str:
        """Create summary of satellite data for reasoning"""
        return f"High-resolution satellite imagery showing {satellite_data.get('description', 'Amazon region terrain and vegetation patterns')}"
    
    def _combine_analysis_results(self, results: List[Any]) -> str:
        """Combine all analysis results into coherent summary"""
        valid_results = [r for r in results if not isinstance(r, Exception) and r is not None]
        
        summary_parts = []
        for i, result in enumerate(valid_results):
            if isinstance(result, dict):
                if 'analysis' in result:
                    summary_parts.append(f"Satellite Analysis: {result['analysis'][:200]}...")
                elif 'hypothesis' in result:
                    summary_parts.append(f"Archaeological Hypothesis: {result['hypothesis'][:200]}...")
                elif 'historical_correlation' in result:
                    summary_parts.append(f"Historical Context: {result['historical_correlation'][:200]}...")
                elif 'terrain_analysis' in result:
                    summary_parts.append(f"Terrain Analysis: {result['terrain_analysis'][:200]}...")
        
        return "\n\n".join(summary_parts)
    
    # Helper methods for extracting structured data from OpenAI responses
    def _extract_features_from_analysis(self, text: str) -> List[str]:
        """Extract detected archaeological features from analysis text"""
        # Simple extraction - could be enhanced with more sophisticated parsing
        features = []
        if 'geometric pattern' in text.lower():
            features.append('geometric_patterns')
        if 'vegetation anomal' in text.lower():
            features.append('vegetation_anomalies')
        if 'terrain modification' in text.lower():
            features.append('terrain_modifications')
        if 'water management' in text.lower():
            features.append('water_management')
        return features
    
    def _extract_confidence_from_analysis(self, text: str) -> float:
        """Extract confidence score from analysis text"""
        # Look for percentage indicators
        import re
        percentages = re.findall(r'(\d+)%', text)
        if percentages:
            return float(percentages[0]) / 100.0
        return 0.5  # Default moderate confidence
    
    def _extract_reasoning_chain(self, text: str) -> List[str]:
        """Extract reasoning steps from hypothesis text"""
        # Simple extraction - look for numbered points or logical flow
        lines = text.split('\n')
        reasoning_steps = [line.strip() for line in lines if line.strip() and any(char.isdigit() for char in line[:3])]
        return reasoning_steps[:5]  # Limit to top 5 steps
    
    def _extract_cultural_significance(self, text: str) -> str:
        """Extract cultural significance assessment"""
        # Look for cultural significance discussion
        if 'cultural' in text.lower() and 'significance' in text.lower():
            sentences = text.split('.')
            for sentence in sentences:
                if 'cultural' in sentence.lower() and 'significance' in sentence.lower():
                    return sentence.strip()
        return "Cultural significance requires further analysis"
    
    def _extract_recommendations(self, text: str) -> List[str]:
        """Extract research recommendations"""
        # Look for recommendation sections
        recommendations = []
        if 'recommend' in text.lower():
            lines = text.split('\n')
            for line in lines:
                if 'recommend' in line.lower():
                    recommendations.append(line.strip())
        return recommendations[:3]  # Limit to top 3
    
    def _extract_temporal_period(self, text: str) -> str:
        """Extract temporal period from historical analysis"""
        periods = ['pre-columbian', 'colonial', 'post-contact', 'ceramic', 'formative', 'late period']
        for period in periods:
            if period in text.lower():
                return period.title()
        return "Temporal period requires further analysis"
    
    def _extract_cultural_groups(self, text: str) -> List[str]:
        """Extract mentioned cultural groups"""
        # Common Amazon cultural groups
        groups = ['tupí', 'jê', 'arawak', 'karib', 'indigenous', 'pre-columbian']
        found_groups = []
        text_lower = text.lower()
        for group in groups:
            if group in text_lower:
                found_groups.append(group.title())
        return found_groups
    
    def _extract_similar_sites(self, text: str) -> List[str]:
        """Extract references to similar archaeological sites"""
        # Look for site names or references
        sites = []
        if 'similar' in text.lower() and 'site' in text.lower():
            # This would need more sophisticated named entity recognition
            pass
        return sites
    
    def _extract_elevation_features(self, text: str) -> List[str]:
        """Extract elevation features from terrain analysis"""
        features = []
        feature_keywords = ['mound', 'terrace', 'elevation', 'ridge', 'depression', 'earthwork']
        text_lower = text.lower()
        for keyword in feature_keywords:
            if keyword in text_lower:
                features.append(keyword)
        return features
    
    def _extract_final_confidence(self, text: str) -> float:
        """Extract final confidence score from synthesis"""
        import re
        # Look for confidence percentage
        confidence_match = re.search(r'confidence[:\s]*(\d+)%', text, re.IGNORECASE)
        if confidence_match:
            return float(confidence_match.group(1)) / 100.0
        
        # Look for general percentage
        percentages = re.findall(r'(\d+)%', text)
        if percentages:
            return float(percentages[0]) / 100.0
        
        return 0.5  # Default moderate confidence
    
    def _extract_interpretation(self, text: str) -> str:
        """Extract primary archaeological interpretation"""
        lines = text.split('\n')
        for line in lines:
            if 'interpretation' in line.lower() or 'conclusion' in line.lower():
                return line.strip()
        return text.split('\n')[0] if text else "Interpretation requires further analysis"
    
    def _extract_priority(self, text: str) -> str:
        """Extract research priority level"""
        priority_levels = ['high', 'medium', 'low']
        text_lower = text.lower()
        for level in priority_levels:
            if f'{level} priority' in text_lower:
                return level.title()
        return "Medium"  # Default
    
    def _extract_next_steps(self, text: str) -> List[str]:
        """Extract recommended next steps"""
        steps = []
        if 'next steps' in text.lower() or 'recommend' in text.lower():
            lines = text.split('\n')
            for line in lines:
                if any(word in line.lower() for word in ['step', 'recommend', 'suggest', 'should']):
                    steps.append(line.strip())
        return steps[:5]  # Limit to top 5 steps


# Integration function for existing system
async def analyze_site_with_openai(
    coordinates: Tuple[float, float],
    data_sources: Dict[str, Any],
    **kwargs
) -> Dict[str, Any]:
    """
    Main integration function for OpenAI archaeological analysis
    Compatible with existing NIS Protocol agent system
    """
    agent = OpenAIArchaeologyAgent()
    
    # Extract data components
    satellite_data = data_sources.get('satellite', {})
    lidar_data = data_sources.get('lidar')
    historical_context = data_sources.get('historical_text', '')
    
    # Run complete analysis
    results = await agent.analyze_archaeological_site(
        coordinates=coordinates,
        satellite_data=satellite_data,
        lidar_data=lidar_data,
        historical_context=historical_context
    )
    
    # Format for compatibility with existing system
    return {
        'agent_type': 'openai_archaeology',
        'coordinates': coordinates,
        'results': results,
        'confidence_score': results.get('confidence_score', 0.0),
        'openai_enhanced': True,
        'competition_ready': True
    } 