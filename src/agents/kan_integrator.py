"""KAN Agent Integrator for the NIS Protocol.

This module provides seamless integration of KAN-enhanced agents while
maintaining backward compatibility with existing systems.
"""

import logging
import pandas as pd
from typing import Dict, Any, Optional, Union
from pathlib import Path

# Import KAN-enhanced agents
from .kan_reasoning_agent import KANReasoningAgent
from .kan_vision_agent import KANVisionAgent

# Import original agents for fallback
from .reasoning_agent import ReasoningAgent
from .vision_agent import VisionAgent

logger = logging.getLogger(__name__)


class KANAgentIntegrator:
    """Integrator for seamless KAN agent deployment with fallback support."""
    
    def __init__(self, use_kan: bool = True, fallback_on_error: bool = True):
        """Initialize the KAN Agent Integrator.
        
        Args:
            use_kan: Whether to use KAN-enhanced agents by default
            fallback_on_error: Whether to fallback to original agents on KAN errors
        """
        self.use_kan = use_kan
        self.fallback_on_error = fallback_on_error
        self.agents = {}
        
        logger.info(f"KAN Agent Integrator initialized (KAN enabled: {use_kan}, fallback: {fallback_on_error})")
    
    def get_reasoning_agent(self, **kwargs) -> Union[KANReasoningAgent, ReasoningAgent]:
        """Get reasoning agent (KAN-enhanced or fallback)."""
        if 'reasoning' not in self.agents:
            try:
                if self.use_kan:
                    self.agents['reasoning'] = KANReasoningAgent(use_kan=True, **kwargs)
                    logger.info("Loaded KAN Reasoning Agent")
                else:
                    self.agents['reasoning'] = ReasoningAgent(**kwargs)
                    logger.info("Loaded standard Reasoning Agent")
            except Exception as e:
                logger.error(f"Failed to load KAN Reasoning Agent: {e}")
                if self.fallback_on_error:
                    self.agents['reasoning'] = ReasoningAgent(**kwargs)
                    logger.info("Fallback to standard Reasoning Agent")
                else:
                    raise
        
        return self.agents['reasoning']
    
    def get_vision_agent(self, **kwargs) -> Union[KANVisionAgent, VisionAgent]:
        """Get vision agent (KAN-enhanced or fallback)."""
        if 'vision' not in self.agents:
            try:
                if self.use_kan:
                    self.agents['vision'] = KANVisionAgent(use_kan=True, **kwargs)
                    logger.info("Loaded KAN Vision Agent")
                else:
                    self.agents['vision'] = VisionAgent(**kwargs)
                    logger.info("Loaded standard Vision Agent")
            except Exception as e:
                logger.error(f"Failed to load KAN Vision Agent: {e}")
                if self.fallback_on_error:
                    self.agents['vision'] = VisionAgent(**kwargs)
                    logger.info("Fallback to standard Vision Agent")
                else:
                    raise
        
        return self.agents['vision']
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all managed agents."""
        status = {
            'integrator_config': {
                'kan_enabled': self.use_kan,
                'fallback_enabled': self.fallback_on_error,
                'loaded_agents': list(self.agents.keys())
            },
            'agents': {}
        }
        
        for agent_name, agent in self.agents.items():
            agent_status = {
                'type': type(agent).__name__,
                'kan_enhanced': hasattr(agent, 'use_kan') and getattr(agent, 'use_kan', False),
                'capabilities': agent.get_capabilities() if hasattr(agent, 'get_capabilities') else {}
            }
            status['agents'][agent_name] = agent_status
        
        return status
    
    def benchmark_agents(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Benchmark KAN vs traditional agents on test data."""
        benchmark_results = {
            'test_timestamp': str(pd.Timestamp.now()),
            'test_data_summary': {
                'coordinates_tested': len(test_data.get('coordinates', [])),
                'patterns_tested': len(test_data.get('patterns', []))
            },
            'agent_comparisons': {}
        }
        
        # Test coordinates if provided
        if 'coordinates' in test_data:
            coords = test_data['coordinates']
            
            try:
                # KAN Reasoning Agent test
                kan_reasoning = KANReasoningAgent(use_kan=True)
                standard_reasoning = ReasoningAgent()
                
                kan_results = []
                standard_results = []
                
                for coord in coords[:3]:  # Test first 3 coordinates
                    lat, lon = coord['lat'], coord['lon']
                    mock_visual = {'anomaly_detected': True, 'confidence': 0.7, 'pattern_type': 'circular'}
                    
                    kan_result = kan_reasoning.interpret_findings(mock_visual, lat, lon)
                    standard_result = standard_reasoning.interpret_findings(mock_visual, lat, lon)
                    
                    kan_results.append(kan_result)
                    standard_results.append(standard_result)
                
                benchmark_results['agent_comparisons']['reasoning'] = {
                    'kan_confidence_avg': sum(r.get('enhanced_confidence', 0) for r in kan_results) / len(kan_results),
                    'standard_confidence_avg': sum(r.get('confidence', 0) for r in standard_results) / len(standard_results),
                    'kan_interpretability': kan_results[0].get('interpretability_score', 0) if kan_results else 0,
                    'feature_enhancement': any('feature_analysis' in r for r in kan_results)
                }
                
            except Exception as e:
                logger.error(f"Reasoning agent benchmark failed: {e}")
                benchmark_results['agent_comparisons']['reasoning'] = {'error': str(e)}
        
        return benchmark_results


# Global integrator instance
_global_integrator: Optional[KANAgentIntegrator] = None


def get_kan_integrator(use_kan: bool = True, fallback_on_error: bool = True) -> KANAgentIntegrator:
    """Get global KAN integrator instance."""
    global _global_integrator
    if _global_integrator is None:
        _global_integrator = KANAgentIntegrator(use_kan=use_kan, fallback_on_error=fallback_on_error)
    return _global_integrator


def reset_integrator():
    """Reset global integrator (useful for testing)."""
    global _global_integrator
    _global_integrator = None


# Convenience functions for easy agent access
def get_enhanced_reasoning_agent(**kwargs) -> Union[KANReasoningAgent, ReasoningAgent]:
    """Get enhanced reasoning agent."""
    return get_kan_integrator().get_reasoning_agent(**kwargs)


def get_enhanced_vision_agent(**kwargs) -> Union[KANVisionAgent, VisionAgent]:
    """Get enhanced vision agent.""" 
    return get_kan_integrator().get_vision_agent(**kwargs)


def get_agent_benchmark_data() -> Dict[str, Any]:
    """Get benchmark comparison data."""
    test_data = {
        'coordinates': [
            {'lat': -3.4653, 'lon': -62.2159},
            {'lat': -2.1234, 'lon': -61.5678},
            {'lat': -4.7890, 'lon': -63.1234}
        ]
    }
    return get_kan_integrator().benchmark_agents(test_data) 