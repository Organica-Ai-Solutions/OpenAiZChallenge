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

async def test_nis_protocol_flow(test_location):
    """Test the complete NIS Protocol flow for a location."""
    
    logger.info(f"Testing NIS Protocol flow for {test_location['name']} at ({test_location['lat']}, {test_location['lon']})")
    
    try:
        # Import the agent integrator
        from api.agent_integrator import nis_protocol
        
        # Run the full analysis pipeline
        result = await nis_protocol.analyze_coordinates(
            lat=test_location["lat"],
            lon=test_location["lon"],
            use_satellite=True,
            use_lidar=True,
            use_historical=True,
            use_indigenous=True
        )
        
        # Log key results
        logger.info(f"Analysis completed with confidence: {result.get('confidence', 0.0):.2f}")
        logger.info(f"Description: {result.get('description', '')[:100]}...")
        logger.info(f"Sources used: {', '.join(result.get('sources', []))}")
        
        # Log details about GPT integration
        if "GPT" in " ".join(result.get("sources", [])):
            logger.info("GPT integration was used in the analysis")
        
        # Save results to a file for inspection
        output_dir = Path("outputs")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / f"analysis_{test_location['name'].replace(' ', '_').lower()}.json"
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
            
        logger.info(f"Results saved to {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error testing NIS Protocol flow: {str(e)}")
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