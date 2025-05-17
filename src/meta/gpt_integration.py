"""GPT Integration for the NIS Protocol.

This module provides integration with the latest GPT models from OpenAI
for vision analysis, reasoning, and memory operations.
"""

from typing import Dict, List, Optional, Union
import os
import logging
from pathlib import Path
import json
from datetime import datetime
import base64
from openai import OpenAI, OpenAIError
from openai.types.chat import ChatCompletion
from ..config import OPENAI_API_KEY

logger = logging.getLogger(__name__)

class GPTIntegration:
    """Integration with OpenAI's GPT models for the NIS Protocol."""
    
    def __init__(self, model_name: str = "gpt-4"):
        """Initialize the GPT integration.
        
        Args:
            model_name: The GPT model to use
        """
        try:
            self.client = OpenAI(api_key=OPENAI_API_KEY)
            self.model = model_name
            self.max_tokens = 4096
            self.temperature = 0.7
            
            # Load system prompts
            self.prompts = self._load_prompts()
            
            # Test connection
            self._test_connection()
            
        except Exception as e:
            logger.error(f"Failed to initialize GPT integration: {str(e)}")
            raise
    
    def _load_prompts(self) -> Dict[str, str]:
        """Load system prompts from files."""
        try:
            prompts_dir = Path(__file__).parent / 'prompts'
            prompts = {}
            
            if prompts_dir.exists():
                for prompt_file in prompts_dir.glob('*.txt'):
                    prompt_name = prompt_file.stem
                    with open(prompt_file) as f:
                        prompts[prompt_name] = f.read().strip()
            
            return prompts
            
        except Exception as e:
            logger.error(f"Error loading prompts: {str(e)}")
            return {}
    
    def _test_connection(self) -> bool:
        """Test the OpenAI connection."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Test connection."}
                ],
                max_tokens=10
            )
            return True
            
        except Exception as e:
            logger.error(f"OpenAI connection test failed: {str(e)}")
            raise
    
    def vision_analysis(
        self,
        image_path: Union[str, Path],
        prompt: Optional[str] = None,
        max_tokens: Optional[int] = None
    ) -> Dict:
        """
        Analyze an image using GPT Vision.
        
        Args:
            image_path: Path to the image file
            prompt: Custom prompt for analysis
            max_tokens: Maximum tokens for response
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Encode image
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Use default vision prompt if none provided
            if not prompt:
                prompt = self.prompts.get('vision_analysis', 
                    "Analyze this image for archaeological or cultural features.")
            
            # Create message with image
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ]
            
            # Get analysis
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=messages,
                max_tokens=max_tokens or self.max_tokens
            )
            
            # Extract and format response
            analysis = response.choices[0].message.content
            
            return {
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "model": "gpt-4-vision-preview",
                "prompt": prompt
            }
            
        except Exception as e:
            logger.error(f"Error in vision analysis: {str(e)}")
            raise
    
    def reasoning_analysis(
        self,
        context: Dict,
        prompt: Optional[str] = None,
        max_tokens: Optional[int] = None
    ) -> Dict:
        """
        Perform reasoning analysis on findings.
        
        Args:
            context: Dictionary containing analysis context
            prompt: Custom prompt for analysis
            max_tokens: Maximum tokens for response
            
        Returns:
            Dictionary containing reasoning results
        """
        try:
            # Use default reasoning prompt if none provided
            if not prompt:
                prompt = self.prompts.get('reasoning_analysis',
                    "Analyze the following findings and provide insights:")
            
            # Format context for GPT
            context_str = json.dumps(context, indent=2)
            
            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": context_str}
            ]
            
            # Get analysis
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.max_tokens,
                temperature=self.temperature
            )
            
            # Extract and format response
            analysis = response.choices[0].message.content
            
            return {
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "model": self.model,
                "prompt": prompt
            }
            
        except Exception as e:
            logger.error(f"Error in reasoning analysis: {str(e)}")
            raise
    
    def temporal_analysis(
        self,
        timeline_data: List[Dict],
        prompt: Optional[str] = None,
        max_tokens: Optional[int] = None
    ) -> Dict:
        """
        Analyze temporal patterns in findings.
        
        Args:
            timeline_data: List of temporal data points
            prompt: Custom prompt for analysis
            max_tokens: Maximum tokens for response
            
        Returns:
            Dictionary containing temporal analysis
        """
        try:
            # Use default temporal prompt if none provided
            if not prompt:
                prompt = self.prompts.get('temporal_analysis',
                    "Analyze the following timeline for patterns and insights:")
            
            # Format timeline data
            timeline_str = json.dumps(timeline_data, indent=2)
            
            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": timeline_str}
            ]
            
            # Get analysis
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.max_tokens,
                temperature=self.temperature
            )
            
            # Extract and format response
            analysis = response.choices[0].message.content
            
            return {
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "model": self.model,
                "prompt": prompt
            }
            
        except Exception as e:
            logger.error(f"Error in temporal analysis: {str(e)}")
            raise
    
    def multimodal_research(
        self,
        research_data: Dict,
        prompt: Optional[str] = None,
        max_tokens: Optional[int] = None
    ) -> Dict:
        """
        Perform multimodal research analysis.
        
        Args:
            research_data: Dictionary containing research data
            prompt: Custom prompt for analysis
            max_tokens: Maximum tokens for response
            
        Returns:
            Dictionary containing research analysis
        """
        try:
            # Use default research prompt if none provided
            if not prompt:
                prompt = self.prompts.get('multimodal_research',
                    "Analyze the following research data across multiple modalities:")
            
            # Format research data
            research_str = json.dumps(research_data, indent=2)
            
            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": research_str}
            ]
            
            # Get analysis
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.max_tokens,
                temperature=self.temperature
            )
            
            # Extract and format response
            analysis = response.choices[0].message.content
            
            return {
                "analysis": analysis,
                "timestamp": datetime.now().isoformat(),
                "model": self.model,
                "prompt": prompt
            }
            
        except Exception as e:
            logger.error(f"Error in multimodal research: {str(e)}")
            raise
    
    def _extract_time_periods(self, text: str) -> List[Dict]:
        """Extract time periods from analysis text."""
        try:
            # Use GPT to extract structured time periods
            messages = [
                {
                    "role": "system",
                    "content": "Extract time periods from the following text and return them in a structured format:"
                },
                {"role": "user", "content": text}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=1000,
                temperature=0.3
            )
            
            # Parse response
            periods_text = response.choices[0].message.content
            try:
                periods = json.loads(periods_text)
            except json.JSONDecodeError:
                periods = []
            
            return periods
            
        except Exception as e:
            logger.error(f"Error extracting time periods: {str(e)}")
            return [] 