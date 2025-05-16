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
    
    def __init__(self, model_name: str = "gpt-4-turbo"):
        """Initialize the GPT integration.
        
        Args:
            model_name: The GPT model to use (default: gpt-4-turbo)
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
        """Run vision analysis using GPT-4 Vision.
        
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