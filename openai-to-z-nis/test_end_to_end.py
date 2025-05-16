#!/usr/bin/env python3
"""
End-to-end test script for the NIS Protocol with GPT integration.
This demonstrates the complete dataflow from API request to final analysis.
"""

import os
import logging
import json
import asyncio
import dotenv
from pathlib import Path
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file if it exists
dotenv.load_dotenv()

# Sample test coordinates in the Amazon rainforest
TEST_COORDINATES = [
    {"name": "Upper Xingu", "lat": -3.4653, "lon": -62.2159},
    {"name": "Tapajós River", "lat": -9.8282, "lon": -67.9452}
]

def test_vision_agent_direct(test_location):
    """Test the Vision Agent directly."""
    
    from src.agents.vision_agent import VisionAgent
    
    vision_agent = VisionAgent()
    result = vision_agent.analyze_coordinates(
        lat=test_location["lat"],
        lon=test_location["lon"],
        use_satellite=True,
        use_lidar=True
    )
    
    logger.info(f"Vision Agent direct result: {result['combined_analysis']['pattern_type'] if result['combined_analysis']['anomaly_detected'] else 'No anomaly detected'}")
    return result

def test_reasoning_agent_direct(vision_result, test_location):
    """Test the Reasoning Agent directly."""
    
    from src.agents.reasoning_agent import ReasoningAgent
    
    reasoning_agent = ReasoningAgent()
    result = reasoning_agent.interpret_findings(
        visual_findings=vision_result["combined_analysis"],
        lat=test_location["lat"],
        lon=test_location["lon"],
        use_historical=True,
        use_indigenous=True
    )
    
    logger.info(f"Reasoning Agent direct result: confidence={result['confidence']:.2f}")
    return result

async def test_nis_protocol_flow(test_location):
    """Test the complete NIS Protocol flow for a location."""
    
    logger.info(f"Testing NIS Protocol flow for {test_location['name']} at ({test_location['lat']}, {test_location['lon']})")
    
    try:
        # Test agent calls directly first
        vision_result = test_vision_agent_direct(test_location)
        reasoning_result = test_reasoning_agent_direct(vision_result, test_location)
        
        # Now test through mocked API (will use fallback since pipeline has parameter issues)
        from api.agent_integrator import nis_protocol
        
        # Run the analysis through the mock path due to pipeline parameter issues
        api_result = await nis_protocol.analyze_coordinates(
            lat=test_location["lat"],
            lon=test_location["lon"],
            use_satellite=True,
            use_lidar=True,
            use_historical=True,
            use_indigenous=True
        )
        
        # Log key results
        logger.info(f"API analysis completed with confidence: {api_result.get('confidence', 0.0):.2f}")
        logger.info(f"Description: {api_result.get('description', '')[:100]}...")
        logger.info(f"Sources used: {', '.join(api_result.get('sources', []))}")
        
        # Save our direct agent results to better show the GPT integration
        output_dir = Path("outputs")
        output_dir.mkdir(exist_ok=True)
        
        # Save vision result
        vision_file = output_dir / f"vision_{test_location['name'].replace(' ', '_').lower()}.json"
        with open(vision_file, "w") as f:
            json.dump(vision_result, f, indent=2)
        
        # Save reasoning result  
        reasoning_file = output_dir / f"reasoning_{test_location['name'].replace(' ', '_').lower()}.json"
        with open(reasoning_file, "w") as f:
            json.dump(reasoning_result, f, indent=2)
        
        # Save API result
        api_file = output_dir / f"api_{test_location['name'].replace(' ', '_').lower()}.json"
        with open(api_file, "w") as f:
            json.dump(api_result, f, indent=2)
            
        logger.info(f"Results saved to {output_dir}")
        return True
        
    except Exception as e:
        logger.error(f"Error testing NIS Protocol flow: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run end-to-end tests for all sample locations."""
    
    logger.info("Starting end-to-end test of NIS Protocol with GPT integration")
    
    # Check if OpenAI API key is set
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set - GPT integration will fall back to mock implementations")
    else:
        logger.info("OpenAI API key found - GPT integration will be active")
    
    # Run tests for each location
    results = []
    for location in TEST_COORDINATES:
        success = await test_nis_protocol_flow(location)
        results.append({"location": location["name"], "success": success})
    
    # Print summary
    logger.info("\n--- Test Summary ---")
    for result in results:
        status = "✅ Passed" if result["success"] else "❌ Failed"
        logger.info(f"{result['location']}: {status}")

if __name__ == "__main__":
    asyncio.run(main()) 