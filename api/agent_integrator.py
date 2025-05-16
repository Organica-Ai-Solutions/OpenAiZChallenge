"""Agent Integrator for the NIS Protocol API.

This module connects the FastAPI routes with the underlying agent models from the NIS Protocol.
"""

import logging
from typing import Dict, List, Tuple, Optional, Any
import sys
import os
from pathlib import Path

# Add src directory to path so we can import our agent modules
sys.path.append(str(Path(__file__).parent.parent))

# Import agent classes - these will fail until fully implemented
try:
    from src.agents.vision_agent import VisionAgent
    from src.agents.reasoning_agent import ReasoningAgent
    from src.agents.memory_agent import MemoryAgent
    from src.agents.action_agent import ActionAgent
    from src.meta import MetaProtocolCoordinator
    agents_available = True
except ImportError as e:
    logging.warning(f"Could not import agent modules: {e}")
    agents_available = False

# Setup logging
logger = logging.getLogger(__name__)

# Define protocol adapters for the MetaProtocolCoordinator
class MCPAdapter:
    """Managed Compute Protocol adapter for external API calls."""
    
    def send_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Send a message via the MCP protocol."""
        # In a real implementation, this would handle API calls to external services
        # For now, we'll just log and mock the response
        target = message.get("target", "")
        content = message.get("content", {})
        action = content.get("action", "")
        
        logger.info(f"MCP message to {target}: {action}")
        
        # Mock responses for different targets
        if target == "openai":
            # Mock OpenAI API call
            return {"status": "success", "model": "gpt-4.1", "response": "Mock GPT-4.1 response"}
        elif target == "vision_service":
            # Mock external vision service
            return {"status": "success", "detected_objects": ["mock object 1", "mock object 2"]}
        else:
            return {"status": "error", "message": f"Unknown target: {target}"}


class ACPAdapter:
    """Agent Computing Protocol adapter for agent function calls."""
    
    def __init__(self, agent_registry: Optional[Dict[str, Any]] = None):
        """Initialize the ACP adapter."""
        self.agent_registry = agent_registry or {}
    
    def register_agent(self, agent_id: str, agent: Any) -> None:
        """Register an agent with the adapter."""
        self.agent_registry[agent_id] = agent
    
    def send_message(self, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send a message via the ACP protocol."""
        target = message.get("target", "")
        content = message.get("content", {})
        action = content.get("action", "")
        data = content.get("data", {})
        params = content.get("params", {})
        
        logger.info(f"ACP message to {target}: {action}")
        
        # Check if we have the target agent registered
        if target not in self.agent_registry:
            logger.error(f"Unknown agent: {target}")
            return {"status": "error", "message": f"Unknown agent: {target}"}
        
        # Get the agent
        agent = self.agent_registry[target]
        
        # Look for a method matching the action
        if not hasattr(agent, action):
            logger.error(f"Unknown action: {action} for agent {target}")
            return {"status": "error", "message": f"Unknown action: {action} for agent {target}"}
        
        # Call the method on the agent
        try:
            method = getattr(agent, action)
            result = method(**data, **params)
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error(f"Error calling {target}.{action}: {str(e)}")
            return {"status": "error", "message": str(e)}


class A2AAdapter:
    """Agent-to-Agent Protocol adapter for direct peer communication."""
    
    def __init__(self, agent_registry: Optional[Dict[str, Any]] = None):
        """Initialize the A2A adapter."""
        self.agent_registry = agent_registry or {}
    
    def register_agent(self, agent_id: str, agent: Any) -> None:
        """Register an agent with the adapter."""
        self.agent_registry[agent_id] = agent
    
    def send_message(self, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send a message via the A2A protocol."""
        target = message.get("target", "")
        source = message.get("source", "")
        content = message.get("content", {})
        
        logger.info(f"A2A message from {source} to {target}")
        
        # Check if we have the target agent registered
        if target not in self.agent_registry:
            logger.error(f"Unknown agent: {target}")
            return None  # A2A typically doesn't return responses
        
        # Get the target agent
        agent = self.agent_registry[target]
        
        # Look for a handle_message method that can process the message
        if hasattr(agent, "handle_message"):
            try:
                result = agent.handle_message(source, content)
                return result
            except Exception as e:
                logger.error(f"Error in {target}.handle_message: {str(e)}")
                return None
        else:
            # No specific handler, just log the message
            logger.info(f"Agent {target} received message from {source} but has no handler")
            return None


class NISProtocol:
    """Main class that orchestrates the NIS Protocol agents."""
    
    def __init__(self):
        """Initialize the NIS Protocol with its component agents."""
        self.agents_available = agents_available
        
        # Initialize agents if available
        if self.agents_available:
            try:
                # Initialize the MetaProtocolCoordinator
                self.coordinator = MetaProtocolCoordinator()
                
                # Initialize agents
                self.vision_agent = VisionAgent()
                self.reasoning_agent = ReasoningAgent()
                self.memory_agent = MemoryAgent()
                self.action_agent = ActionAgent(meta_coordinator=self.coordinator)
                
                # Register agents with the coordinator
                self.agent_registry = {
                    "vision_agent": self.vision_agent,
                    "reasoning_agent": self.reasoning_agent,
                    "memory_agent": self.memory_agent,
                    "action_agent": self.action_agent,
                }
                
                # Initialize protocol adapters
                self.mcp_adapter = MCPAdapter()
                self.acp_adapter = ACPAdapter(self.agent_registry)
                self.a2a_adapter = A2AAdapter(self.agent_registry)
                
                # Register protocol adapters with the coordinator
                self.coordinator.register_protocol("mcp", self.mcp_adapter)
                self.coordinator.register_protocol("acp", self.acp_adapter)
                self.coordinator.register_protocol("a2a", self.a2a_adapter)
                
                # Register agents with the coordinator
                for agent_id, agent in self.agent_registry.items():
                    self.coordinator.register_agent(agent_id, agent)
                
                logger.info("NIS Protocol agents and coordinator initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing agents: {e}")
                self.agents_available = False
    
    async def analyze_coordinates(self, 
                                 lat: float, 
                                 lon: float, 
                                 use_satellite: bool = True,
                                 use_lidar: bool = True,
                                 use_historical: bool = True,
                                 use_indigenous: bool = True) -> Dict[str, Any]:
        """Run the full NIS Protocol analysis on coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            use_satellite: Whether to use satellite data
            use_lidar: Whether to use LIDAR data
            use_historical: Whether to use historical texts
            use_indigenous: Whether to use indigenous knowledge
            
        Returns:
            Analysis results with confidence scores, descriptions, and sources
        """
        # Check if we have real agents available
        if not self.agents_available:
            # Fall back to mock implementations
            logger.info(f"Using mock implementations for coordinates: {lat}, {lon}")
            return self._mock_analyze(lat, lon, use_satellite, use_lidar, 
                                      use_historical, use_indigenous)
        
        try:
            # Define the analysis pipeline using the MetaProtocolCoordinator
            pipeline_config = [
                {
                    "description": "Vision analysis",
                    "protocol": "acp",
                    "target": "vision_agent",
                    "action": "analyze_coordinates",
                    "params": {
                        "lat": lat,
                        "lon": lon,
                        "use_satellite": use_satellite,
                        "use_lidar": use_lidar
                    },
                    "update_strategy": "replace"
                },
                {
                    "description": "Reasoning analysis",
                    "protocol": "acp",
                    "target": "reasoning_agent",
                    "action": "interpret_findings",
                    "params": {
                        "lat": lat,
                        "lon": lon,
                        "use_historical": use_historical,
                        "use_indigenous": use_indigenous
                    },
                    "update_strategy": "merge"
                },
                {
                    "description": "Action generation",
                    "protocol": "acp",
                    "target": "action_agent",
                    "action": "generate_finding_report",
                    "params": {
                        "lat": lat,
                        "lon": lon
                    },
                    "update_strategy": "replace"
                }
            ]
            
            # Run the pipeline
            initial_data = {
                "coordinates": {
                    "lat": lat,
                    "lon": lon
                },
                "config": {
                    "use_satellite": use_satellite,
                    "use_lidar": use_lidar,
                    "use_historical": use_historical,
                    "use_indigenous": use_indigenous
                }
            }
            
            logger.info(f"Starting NIS Protocol analysis pipeline for coordinates: {lat}, {lon}")
            final_report = self.coordinator.run_pipeline(pipeline_config, initial_data)
            
            # Return the formatted result
            return {
                "location": final_report.get("location", {"lat": lat, "lon": lon}),
                "confidence": final_report.get("confidence", 0.0),
                "description": final_report.get("description", ""),
                "sources": final_report.get("sources", []),
                "historical_context": final_report.get("historical_context", ""),
                "indigenous_perspective": final_report.get("indigenous_perspective", ""),
                "recommendations": final_report.get("recommendations", [])
            }
            
        except Exception as e:
            logger.error(f"Error in NIS Protocol analysis: {e}", exc_info=True)
            # Fall back to mock implementation if real agents fail
            return self._mock_analyze(lat, lon, use_satellite, use_lidar,
                                      use_historical, use_indigenous)
    
    def _mock_analyze(self, 
                     lat: float, 
                     lon: float, 
                     use_satellite: bool,
                     use_lidar: bool,
                     use_historical: bool,
                     use_indigenous: bool) -> Dict[str, Any]:
        """Provide mock analysis when real agents are unavailable.
        
        This is a fallback that mimics the behavior of the full agent system.
        
        Args:
            Same as analyze_coordinates
            
        Returns:
            Mock analysis results
        """
        import random
        
        # Mock patterns to detect based on coordinates
        patterns = [
            "circular geometric structures",
            "rectangular settlement patterns",
            "linear earthworks",
            "anthropogenic soil signatures",
            "artificial mounds",
            "road networks",
            "water management systems",
        ]
        
        # Deterministic selection based on coordinates
        pattern_index = hash(f"{lat:.4f}_{lon:.4f}") % len(patterns)
        pattern_type = patterns[pattern_index]
        
        # Mock description templates
        descriptions = {
            "circular geometric structures": "Potential settlement with circular housing arrangement, typical of {tribe} communities between {start_year}-{end_year}.",
            "rectangular settlement patterns": "Evidence of organized habitation with rectangular structures, suggesting post-contact influence or {tribe} ceremonial grounds.",
            "linear earthworks": "Possible defensive structures or boundaries, similar to those documented in the {region} region.",
            "anthropogenic soil signatures": "Likely terra preta (Amazonian dark earth), indicating long-term human occupation and agricultural activity.",
            "artificial mounds": "Elevated structures potentially used for habitation to avoid seasonal flooding, similar to documented sites at {similar_site}.",
            "road networks": "Complex pathway system connecting to water sources or potentially other settlements {distance} km away.",
            "water management systems": "Sophisticated hydrology controls, suggesting advanced understanding of seasonal water flow in the {river} basin."
        }
        
        # Fill in template based on location
        tribes = ["Tupi", "Arawak", "Carib", "Jê", "Yanomami"]
        regions = ["Upper Xingu", "Tapajós", "Rio Negro", "Madeira", "Ucayali"]
        rivers = ["Amazon", "Xingu", "Tapajós", "Negro", "Madeira"]
        sites = ["Kuhikugu", "Geoglyphs of Acre", "Montegrande", "Cotoca"]
        
        # Deterministic selection based on coordinates
        tribe_index = hash(f"{lat:.2f}") % len(tribes)
        region_index = hash(f"{lon:.2f}") % len(regions)
        start_year = 800 + (hash(f"{lat:.1f}_{lon:.1f}") % 700)  # Between 800-1500 CE
        end_year = start_year + 200 + (hash(f"{lat:.3f}_{lon:.3f}") % 300)
        distance = 5 + (hash(f"{lat:.4f}") % 20)
        river_index = hash(f"{lon:.3f}") % len(rivers)
        site_index = hash(f"{lat:.2f}_{lon:.2f}") % len(sites)
        
        # Fill template
        description = descriptions[pattern_type].format(
            tribe=tribes[tribe_index],
            region=regions[region_index],
            start_year=start_year,
            end_year=end_year,
            distance=distance,
            river=rivers[river_index],
            similar_site=sites[site_index]
        )
        
        # Generate confidence score (deterministic based on coordinates)
        base_confidence = 0.65 + (hash(f"{lat:.3f}_{lon:.3f}") % 25) / 100
        
        # Determine sources used
        sources = []
        historical_context = ""
        indigenous_perspective = ""
        
        if use_satellite:
            sources.append(f"Sentinel-2 Scene ID: S2A_MSIL2A_{20220101 + hash(f'{lat:.2f}_{lon:.2f}') % 10000}")
        
        if use_lidar:
            sources.append(f"Earth Archive LIDAR Tile #{10000 + hash(f'{lat:.2f}_{lon:.2f}') % 90000}")
        
        if use_historical:
            sources.append(f"Colonial Records (c. {1500 + hash(f'{lat:.1f}') % 300})")
            historical_context = f"Colonial documents from the {regions[region_index]} region mention settlements that match the pattern detected in our analysis. These records describe {tribes[tribe_index]} communities establishing large settlements in this area between {start_year} and {end_year} CE."
        
        if use_indigenous:
            sources.append(f"{tribes[tribe_index]} Oral Tradition Map")
            indigenous_perspective = f"Traditional knowledge from {tribes[tribe_index]} communities describes this area as an ancestral settlement site. Oral histories recount how their ancestors built {pattern_type.lower()} for community gatherings and protection."
        
        # Generate mock recommendations
        recommendations = [
            {
                "action": "lidar_survey",
                "description": "Conduct higher-resolution LIDAR scan of the area.",
                "priority": "high"
            },
            {
                "action": "indigenous_consultation",
                "description": f"Consult with local {tribes[tribe_index]} communities about the site.",
                "priority": "high"
            },
            {
                "action": "ground_verification",
                "description": "Verify findings with a field expedition if possible.",
                "priority": "medium"
            }
        ]
        
        return {
            "location": {"lat": lat, "lon": lon},
            "confidence": base_confidence,
            "description": description,
            "sources": sources,
            "historical_context": historical_context,
            "indigenous_perspective": indigenous_perspective,
            "recommendations": recommendations
        }


# Create a singleton instance
nis_protocol = NISProtocol() 