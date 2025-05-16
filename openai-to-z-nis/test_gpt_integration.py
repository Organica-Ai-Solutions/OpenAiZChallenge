#!/usr/bin/env python3
"""
Test script for GPT integration in the NIS Protocol.
This script tests both reasoning and vision agent capabilities.
"""

import os
import logging
import dotenv
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file if it exists
dotenv.load_dotenv()

def test_gpt_integration():
    """Test the GPT integration functionality."""
    
    logger.info("Testing GPT integration...")
    
    # Check if the OpenAI API key is set
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.error("OPENAI_API_KEY environment variable not found.")
        logger.info("Please set your OpenAI API key in a .env file or export it as an environment variable:")
        logger.info("Example .env file content: OPENAI_API_KEY=your_api_key_here")
        return False
    
    try:
        # Import the GPT integration
        from src.meta.gpt_integration import GPTIntegration
        
        # Initialize the GPT integration
        gpt = GPTIntegration()
        logger.info(f"Successfully initialized GPT integration with model: {gpt.model_name}")
        
        # Test basic model availability
        models = gpt.get_available_models()
        logger.info(f"Available models: {', '.join(models[:5])}{'...' if len(models) > 5 else ''}")
        
        # Test reasoning capabilities with minimal input
        test_pattern = "circular geometric structures"
        test_lat, test_lon = -3.4653, -62.2159  # Example coordinates in the Amazon
        
        logger.info(f"Testing reasoning analysis with pattern '{test_pattern}'...")
        reasoning_result = gpt.reasoning_analysis(
            prompt="Test analysis",
            pattern_type=test_pattern,
            lat=test_lat,
            lon=test_lon,
            historical_sources=[{"title": "Test Source", "year": 1800, "excerpt": "Test excerpt."}],
            indigenous_knowledge=[{"source": "Test Tribe", "knowledge": "Test knowledge."}]
        )
        
        logger.info(f"Reasoning analysis result (confidence: {reasoning_result.get('confidence', 'N/A')}):")
        logger.info(f"Description: {reasoning_result.get('description', 'N/A')[:100]}...")
        
        # Skip vision test by default as it requires valid image URLs
        # Uncomment to test with actual image URLs
        """
        logger.info("Testing vision analysis...")
        vision_result = gpt.vision_analysis(
            image_url="https://example.com/path/to/actual/satellite/image.jpg",
            question="Identify any archaeological features in this satellite image."
        )
        logger.info(f"Vision analysis result: {vision_result.get('analysis', 'N/A')[:100]}...")
        """
        
        logger.info("GPT integration tests completed successfully.")
        return True
        
    except Exception as e:
        logger.error(f"Error testing GPT integration: {str(e)}")
        return False

def main():
    """Main function to run the test script."""
    success = test_gpt_integration()
    if success:
        logger.info("All tests passed! ✅")
    else:
        logger.error("Tests failed! ❌")

if __name__ == "__main__":
    main() 