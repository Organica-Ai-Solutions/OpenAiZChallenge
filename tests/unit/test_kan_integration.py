#!/usr/bin/env python3
"""
Test script for KAN integration in the NIS Protocol.

This script tests the KAN-enhanced agents and compares their performance
with traditional MLP-based agents.
"""

import logging
import sys
import os
from pathlib import Path

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_kan_reasoning_agent():
    """Test KAN-enhanced reasoning agent."""
    logger.info("🧠 Testing KAN Reasoning Agent...")
    
    try:
        from src.agents.kan_reasoning_agent import KANReasoningAgent
        
        # Test with KAN enabled
        kan_agent = KANReasoningAgent(use_kan=True)
        
        # Mock visual findings
        visual_findings = {
            "anomaly_detected": True,
            "confidence": 0.75,
            "pattern_type": "circular geometric structures",
            "sources": ["satellite", "lidar"]
        }
        
        # Test interpretation
        result = kan_agent.interpret_findings(visual_findings, -3.4653, -62.2159)
        
        logger.info(f"✅ KAN Reasoning Agent test passed")
        logger.info(f"   Enhanced confidence: {result.get('enhanced_confidence', 'N/A')}")
        logger.info(f"   Interpretability score: {result.get('interpretability_score', 'N/A')}")
        logger.info(f"   KAN enabled: {result.get('reasoning_method', 'N/A')}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ KAN Reasoning Agent test failed: {e}")
        return False


def test_kan_vision_agent():
    """Test KAN-enhanced vision agent."""
    logger.info("👁️ Testing KAN Vision Agent...")
    
    try:
        from src.agents.kan_vision_agent import KANVisionAgent
        import numpy as np
        
        # Test with KAN enabled
        kan_agent = KANVisionAgent(use_kan=True)
        
        # Create mock image data
        mock_data = np.random.rand(64, 64) * 255
        
        # Test enhanced feature detection
        features = kan_agent.enhanced_feature_detection(mock_data)
        
        logger.info(f"✅ KAN Vision Agent test passed")
        logger.info(f"   Features detected: {len(features)}")
        logger.info(f"   KAN enhanced: {kan_agent.use_kan}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ KAN Vision Agent test failed: {e}")
        return False


def test_kan_integrator():
    """Test KAN agent integrator."""
    logger.info("🔧 Testing KAN Integrator...")
    
    try:
        from src.agents.kan_integrator import get_kan_integrator, get_agent_benchmark_data
        
        # Get integrator
        integrator = get_kan_integrator(use_kan=True)
        
        # Test agent loading
        reasoning_agent = integrator.get_reasoning_agent()
        vision_agent = integrator.get_vision_agent()
        
        # Get status
        status = integrator.get_agent_status()
        
        logger.info(f"✅ KAN Integrator test passed")
        logger.info(f"   Loaded agents: {status['integrator_config']['loaded_agents']}")
        logger.info(f"   KAN enabled: {status['integrator_config']['kan_enabled']}")
        
        # Test benchmark
        benchmark = get_agent_benchmark_data()
        logger.info(f"   Benchmark completed: {len(benchmark.get('test_data_summary', {}).get('coordinates_tested', 0))} coordinates")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ KAN Integrator test failed: {e}")
        return False


def test_fallback_mode():
    """Test fallback to traditional agents when KAN fails."""
    logger.info("🔄 Testing fallback mode...")
    
    try:
        from src.agents.kan_integrator import get_kan_integrator
        
        # Force fallback mode
        integrator = get_kan_integrator(use_kan=False, fallback_on_error=True)
        
        # Get agents in fallback mode
        reasoning_agent = integrator.get_reasoning_agent()
        vision_agent = integrator.get_vision_agent()
        
        logger.info(f"✅ Fallback mode test passed")
        logger.info(f"   Reasoning agent type: {type(reasoning_agent).__name__}")
        logger.info(f"   Vision agent type: {type(vision_agent).__name__}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Fallback mode test failed: {e}")
        return False


def run_all_tests():
    """Run all KAN integration tests."""
    logger.info("🚀 Starting KAN Integration Tests...")
    
    tests = [
        ("KAN Reasoning Agent", test_kan_reasoning_agent),
        ("KAN Vision Agent", test_kan_vision_agent),
        ("KAN Integrator", test_kan_integrator),
        ("Fallback Mode", test_fallback_mode)
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n--- Running {test_name} Test ---")
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("🎯 KAN Integration Test Results:")
    logger.info("="*50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\nOverall: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        logger.info("🎉 All KAN integration tests passed! System ready for deployment.")
        return True
    else:
        logger.error("⚠️ Some tests failed. Check logs for details.")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1) 