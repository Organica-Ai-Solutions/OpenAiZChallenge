"""GPT Integration for the NIS Protocol.

This module provides integration with the latest GPT models from OpenAI
to power the reasoning capabilities of the NIS Protocol.
"""

import os
import logging
import json
from typing import Dict, List, Optional, Union, Any
from pathlib import Path

from openai import OpenAI
from openai.types.chat import ChatCompletion

# Setup logging
logger = logging.getLogger(__name__)

class GPTIntegration:
    """Integration with OpenAI's GPT models for the NIS Protocol."""
    
    def __init__(self, model_name: str = "gpt-4o"):
        """Initialize the GPT integration.
        
        Args:
            model_name: The GPT model to use (default: gpt-4o)
        """
        self.model_name = model_name
        self.api_key = os.environ.get("OPENAI_API_KEY")
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables.")
            raise ValueError("OpenAI API key is required. Set the OPENAI_API_KEY environment variable.")
            
        self.client = OpenAI(api_key=self.api_key)
        logger.info(f"GPT Integration initialized with model: {model_name}")
    
    def reasoning_analysis(self, 
                          prompt: str, 
                          pattern_type: str,
                          lat: float, 
                          lon: float,
                          historical_sources: List[Dict],
                          indigenous_knowledge: List[Dict],
                          temperature: float = 0.2) -> Dict:
        """Run reasoning analysis using GPT.
        
        Args:
            prompt: The prompt template to use
            pattern_type: The type of pattern detected
            lat: Latitude coordinate
            lon: Longitude coordinate
            historical_sources: List of historical source metadata
            indigenous_knowledge: List of indigenous knowledge data
            temperature: Temperature for generation (default: 0.2)
            
        Returns:
            Dictionary with reasoned interpretation
        """
        try:
            # Format historical sources as a string
            historical_str = "\n".join([
                f"- {source['title']} ({source['year']}): {source['excerpt']}"
                for source in historical_sources
            ]) if historical_sources else "No historical sources available."
            
            # Format indigenous knowledge as a string
            indigenous_str = "\n".join([
                f"- {source['source']}: {source['knowledge']}"
                for source in indigenous_knowledge
            ]) if indigenous_knowledge else "No indigenous knowledge available."
            
            system_prompt = """You are an expert archaeological analysis assistant specializing in 
            pre-Columbian civilizations of the Amazon rainforest. Analyze the provided pattern detection 
            with historical context and indigenous knowledge to determine if this represents a potential 
            archaeological site. Your response should be in valid JSON format with the following keys:
            {
                "description": "Detailed interpretation of what this pattern likely represents",
                "confidence": "A value between 0.0 and 1.0 representing confidence in this being an archaeological site",
                "historical_context": "How this relates to historical records",
                "indigenous_perspective": "How this relates to indigenous knowledge",
                "recommended_next_steps": "Scientific recommendations for verification"
            }
            """
            
            user_prompt = f"""
            PATTERN DETECTED: {pattern_type}
            COORDINATES: {lat}, {lon}
            
            HISTORICAL SOURCES:
            {historical_str}
            
            INDIGENOUS KNOWLEDGE:
            {indigenous_str}
            
            ADDITIONAL CONTEXT:
            {prompt}
            
            Based on this information, provide your archaeological analysis in JSON format.
            """
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            content = response.choices[0].message.content
            result = json.loads(content)
            
            logger.info(f"GPT analysis completed for pattern {pattern_type} at {lat}, {lon}")
            return result
            
        except Exception as e:
            logger.error(f"Error during GPT analysis: {str(e)}")
            # Return a fallback response
            return {
                "description": f"Analysis of {pattern_type} at coordinates {lat}, {lon} failed due to an error.",
                "confidence": 0.0,
                "historical_context": "Analysis error",
                "indigenous_perspective": "Analysis error",
                "recommended_next_steps": "Retry the analysis with different parameters"
            }

    def vision_analysis(self,
                      image_url: str,
                      question: str,
                      temperature: float = 0.2) -> Dict:
        """Run vision analysis using GPT-4o vision capabilities.
        
        Args:
            image_url: URL to the image to analyze
            question: Question to ask about the image
            temperature: Temperature for generation (default: 0.2)
            
        Returns:
            Dictionary with vision analysis results
        """
        try:
            system_prompt = """You are an expert in analyzing satellite and LIDAR imagery for archaeological features.
            Identify potential human-made structures, earthworks, or landscape modifications that may indicate
            archaeological sites. Focus on geometric patterns, soil discolorations, and vegetation anomalies."""
            
            # Use gpt-4-vision-preview or gpt-4o depending on availability
            vision_model = "gpt-4o"  # Updated to use the latest model with vision capabilities
            
            response = self.client.chat.completions.create(
                model=vision_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user", 
                        "content": [
                            {"type": "text", "text": question},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ],
                temperature=temperature,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            
            # For vision, we return a structured format but not JSON
            result = {
                "analysis": content,
                "image_url": image_url,
                "question": question
            }
            
            logger.info(f"Vision analysis completed for image: {image_url}")
            return result
            
        except Exception as e:
            logger.error(f"Error during vision analysis: {str(e)}")
            return {
                "analysis": f"Image analysis failed due to an error: {str(e)}",
                "image_url": image_url,
                "question": question
            }
    
    def multimodal_research(self,
                           query: str,
                           context: List[Dict],
                           images: Optional[List[str]] = None,
                           temperature: float = 0.3) -> Dict:
        """Perform deep research using multimodal capabilities.
        
        Args:
            query: The research question
            context: List of context documents with metadata
            images: Optional list of image URLs to analyze alongside text
            temperature: Temperature for generation (default: 0.3)
            
        Returns:
            Dictionary with research results
        """
        try:
            system_prompt = """You are an archaeological research assistant with expertise in 
            Amazonian civilizations. Analyze the provided materials and answer the research query 
            with detailed evidence, making connections between different sources of information."""
            
            # Build the multimodal message
            message_content = [{"type": "text", "text": f"RESEARCH QUERY: {query}\n\nCONTEXT:"}]
            
            # Add text context
            for doc in context:
                doc_text = f"\n\n{doc.get('title', 'Document')}"
                if 'type' in doc:
                    doc_text += f" ({doc['type']})"
                if 'date' in doc:
                    doc_text += f" - {doc['date']}"
                doc_text += f":\n{doc.get('content', '')}"
                message_content.append({"type": "text", "text": doc_text})
            
            # Add images if provided
            if images and len(images) > 0:
                message_content.append({"type": "text", "text": "\nVISUAL EVIDENCE:"})
                for i, img_url in enumerate(images):
                    message_content.append({"type": "image_url", "image_url": {"url": img_url}})
                    message_content.append({"type": "text", "text": f"Image {i+1}"})
            
            # Add final instruction
            message_content.append({
                "type": "text", 
                "text": "\nBased on all the information above, please provide a comprehensive answer to the research query."
            })
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message_content}
                ],
                temperature=temperature,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            # Return structured result
            result = {
                "query": query,
                "analysis": content,
                "sources": {
                    "text": len(context),
                    "images": len(images) if images else 0
                }
            }
            
            logger.info(f"Multimodal research completed for query: {query}")
            return result
            
        except Exception as e:
            logger.error(f"Error during multimodal research: {str(e)}")
            return {
                "query": query,
                "analysis": f"Research failed due to an error: {str(e)}",
                "sources": {"text": 0, "images": 0}
            }
    
    def knowledge_integration(self,
                            historical_sources: List[Dict],
                            indigenous_knowledge: List[Dict],
                            satellite_analysis: Dict,
                            lidar_analysis: Dict,
                            region_name: str,
                            temperature: float = 0.3) -> Dict:
        """Integrate different knowledge sources for holistic understanding.
        
        Args:
            historical_sources: Colonial and academic historical records
            indigenous_knowledge: Traditional knowledge from indigenous groups
            satellite_analysis: Results from satellite image analysis
            lidar_analysis: Results from LIDAR data analysis
            region_name: Name of the region being analyzed
            temperature: Temperature for generation (default: 0.3)
            
        Returns:
            Dictionary with integrated knowledge analysis
        """
        try:
            system_prompt = """You are an expert in integrating diverse knowledge systems related to 
            Amazonian archaeology. Your task is to synthesize academic historical records, indigenous 
            traditional knowledge, and modern remote sensing data into a cohesive understanding of past 
            human activity in this region. Respect all knowledge systems equally while identifying patterns 
            and connections between them."""
            
            # Format historical sources
            historical_text = "\n\nHISTORICAL SOURCES:\n"
            for source in historical_sources:
                historical_text += f"- {source.get('title', 'Document')} ({source.get('year', 'Unknown')}): {source.get('excerpt', '')}\n"
            
            # Format indigenous knowledge
            indigenous_text = "\n\nINDIGENOUS KNOWLEDGE:\n"
            for knowledge in indigenous_knowledge:
                indigenous_text += f"- {knowledge.get('source', 'Source')}: {knowledge.get('knowledge', '')}\n"
            
            # Format remote sensing data
            remote_sensing_text = "\n\nREMOTE SENSING ANALYSIS:\n"
            remote_sensing_text += f"Satellite analysis: {satellite_analysis.get('description', '')}\n"
            remote_sensing_text += f"LIDAR analysis: {lidar_analysis.get('description', '')}\n"
            
            # Combine all text
            combined_text = f"REGION: {region_name}\n{historical_text}{indigenous_text}{remote_sensing_text}\n\nPlease integrate these knowledge sources to provide a holistic understanding of the archaeological significance of this region."
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": combined_text}
                ],
                temperature=temperature,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            
            # Return structured result
            result = {
                "region": region_name,
                "integrated_analysis": content,
                "confidence": self._extract_confidence_from_text(content),
                "knowledge_sources": {
                    "historical": len(historical_sources),
                    "indigenous": len(indigenous_knowledge),
                    "remote_sensing": 2  # Satellite and LIDAR
                }
            }
            
            logger.info(f"Knowledge integration completed for region: {region_name}")
            return result
            
        except Exception as e:
            logger.error(f"Error during knowledge integration: {str(e)}")
            return {
                "region": region_name,
                "integrated_analysis": f"Integration failed due to an error: {str(e)}",
                "confidence": 0.0,
                "knowledge_sources": {}
            }
    
    def temporal_analysis(self,
                         site_data: Dict,
                         historical_timeline: List[Dict],
                         region_context: str,
                         temperature: float = 0.3) -> Dict:
        """Analyze archaeological site in temporal context.
        
        Args:
            site_data: Data about the specific site
            historical_timeline: Timeline events for the region
            region_context: Description of the broader region
            temperature: Temperature for generation (default: 0.3)
            
        Returns:
            Dictionary with temporal analysis
        """
        try:
            system_prompt = """You are an archaeological chronology expert specializing in Amazonian 
            cultures. Your task is to place archaeological findings in their appropriate temporal 
            context, creating a timeline of human activity and cultural development for the site."""
            
            # Format the site data
            site_text = f"SITE INFORMATION:\nCoordinates: {site_data.get('lat', 0)}, {site_data.get('lon', 0)}\n"
            site_text += f"Pattern type: {site_data.get('pattern_type', 'Unknown')}\n"
            site_text += f"Description: {site_data.get('description', '')}\n"
            
            # Format the timeline
            timeline_text = "\nHISTORICAL TIMELINE EVENTS:\n"
            # Sort timeline by year
            sorted_timeline = sorted(historical_timeline, key=lambda x: x.get('year', 0))
            for event in sorted_timeline:
                timeline_text += f"- {event.get('year', 'Unknown')}: {event.get('event', '')}\n"
            
            # Combine all text
            combined_text = f"{site_text}\n{timeline_text}\n\nREGION CONTEXT:\n{region_context}\n\nPlease analyze this site within its temporal context, identifying likely periods of construction, use, and abandonment. Suggest a chronological timeline for the site's development and place it within the broader regional history."
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": combined_text}
                ],
                temperature=temperature,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            
            # Return structured result
            result = {
                "site_coordinates": f"{site_data.get('lat', 0)}, {site_data.get('lon', 0)}",
                "temporal_analysis": content,
                "likely_time_periods": self._extract_time_periods(content)
            }
            
            logger.info(f"Temporal analysis completed for site: {site_data.get('lat', 0)}, {site_data.get('lon', 0)}")
            return result
            
        except Exception as e:
            logger.error(f"Error during temporal analysis: {str(e)}")
            return {
                "site_coordinates": f"{site_data.get('lat', 0)}, {site_data.get('lon', 0)}",
                "temporal_analysis": f"Analysis failed due to an error: {str(e)}",
                "likely_time_periods": []
            }
    
    def get_available_models(self) -> List[str]:
        """Get a list of available GPT models.
        
        Returns:
            List of available model names
        """
        try:
            models = self.client.models.list()
            gpt_models = [model.id for model in models.data if model.id.startswith("gpt")]
            return gpt_models
        except Exception as e:
            logger.error(f"Error getting available models: {str(e)}")
            return [self.model_name]  # Return the current model as fallback
            
    def _extract_confidence_from_text(self, text: str) -> float:
        """Helper method to extract confidence score from text."""
        # Simple heuristic to extract confidence
        confidence = 0.5  # Default medium confidence
        
        confidence_indicators = {
            "high confidence": 0.8,
            "very confident": 0.85,
            "strong evidence": 0.75,
            "clear indication": 0.8,
            "certainly": 0.85,
            "likely": 0.7,
            "possibly": 0.5,
            "suggests": 0.6,
            "uncertain": 0.4,
            "limited evidence": 0.3,
            "unclear": 0.35
        }
        
        text_lower = text.lower()
        for indicator, value in confidence_indicators.items():
            if indicator in text_lower:
                confidence = value
                break
                
        return confidence
        
    def _extract_time_periods(self, text: str) -> List[Dict]:
        """Helper method to extract time periods from analysis text."""
        # This is a simplistic extraction - in production would use more sophisticated NLP
        time_periods = []
        
        # Look for year ranges in the text
        import re
        year_patterns = [
            r'(\d{3,4})\s*(?:-|to|–|until)\s*(\d{3,4})\s*(?:CE|AD|BC|BCE)?',  # 800-1200 CE
            r'(\d+)(?:st|nd|rd|th)\s+century'  # 9th century
        ]
        
        for pattern in year_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple) and len(match) == 2:
                    # Year range
                    time_periods.append({
                        "start_year": match[0],
                        "end_year": match[1],
                        "description": self._extract_context(text, match[0], match[1])
                    })
                else:
                    # Century
                    century = match
                    time_periods.append({
                        "century": century,
                        "description": self._extract_context(text, century)
                    })
        
        return time_periods
    
    def _extract_context(self, text: str, *terms) -> str:
        """Extract context around specific terms."""
        # Find the sentence containing the terms
        sentences = text.split('.')
        relevant_sentences = []
        
        for sentence in sentences:
            if any(term in sentence for term in terms):
                relevant_sentences.append(sentence.strip())
        
        return ". ".join(relevant_sentences) + "." if relevant_sentences else "" 