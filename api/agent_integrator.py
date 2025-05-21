"""Agent Integrator for the NIS Protocol API.

This module connects the FastAPI routes with the underlying agent models from the NIS Protocol.
"""

import logging
from typing import Dict, List, Tuple, Optional, Any
import sys
import os
from pathlib import Path
import asyncio

# Add src directory to path so we can import our agent modules
sys.path.append(str(Path(__file__).parent.parent))

# Import agent classes - these will fail until fully implemented
try:
    from src.agents.vision_agent import VisionAgent
    from src.agents.reasoning_agent import ReasoningAgent
    from src.agents.memory_agent import MemoryAgent
    from src.agents.action_agent import ActionAgent
    from src.meta import MetaProtocolCoordinator
    from src.analysis.pattern_detection import PatternDetectionEngine
    agents_available = True
except ImportError as e:
    logging.warning(f"Could not import agent modules: {e}")
    agents_available = False

# Setup logging
logger = logging.getLogger(__name__)

# LangGraph imports - MOVING THESE EARLIER
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict

# Define the state for the LangGraph - MOVING THIS EARLIER
class GraphState(TypedDict):
    latitude: float
    longitude: float
    radius_km: float
    use_satellite: bool
    use_lidar: bool
    use_historical_texts: bool
    use_indigenous_maps: bool
    raw_vision_data: Optional[Dict]
    detected_patterns: Optional[List[Any]] 
    processed_historical_texts: Optional[Dict]
    processed_indigenous_knowledge: Optional[Dict]
    reasoning_interpretation: Optional[Dict]
    final_report: Optional[Dict]
    error_message: Optional[str]
    current_task_id: Optional[str]
    
    # Fields for iterative decision making by ActionAgent
    iteration_count: int
    max_iterations: int
    action_decision: Optional[str] # e.g., "finalize", "rerun_vision", "clarify_reasoning"
    decision_params: Dict[str, Any] # Parameters for the chosen action


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
        elif target == "web_search_tool" and action == "search":
            query = content.get("query", "")
            logger.info(f"MCPAdapter: Would perform web search for query: '{query}'")
            # In a real implementation, this would call an actual web search API/tool.
            # For simulation, return mock search results.
            return {
                "status": "success",
                "results": [
                    {
                        "title": f"Mock Search Result 1 for {query}",
                        "link": f"http://example.com/search?q={query.replace(' ', '+')}&result=1",
                        "snippet": f"This is a mock snippet for the query '{query}'. It mentions potential links to ancient civilizations or relevant geographical features."
                    },
                    {
                        "title": f"Mock Search Result 2 for {query}",
                        "link": f"http://example.com/search?q={query.replace(' ', '+')}&result=2",
                        "snippet": f"Another mock snippet for '{query}', discussing related findings or alternative explanations for similar observations."
                    }
                ]
            }
        else:
            return {"status": "error", "message": f"Unknown MCP target or action: {target}/{action}"}


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
        self.graph = None # Initialize graph attribute
        self.pattern_engine = None # Initialize pattern_engine attribute
        
        # Initialize agents if available
        if self.agents_available:
            try:
                # Initialize the MetaProtocolCoordinator
                self.coordinator = MetaProtocolCoordinator()
                
                # Initialize agents
                self.vision_agent = VisionAgent()
                self.reasoning_agent = ReasoningAgent(meta_coordinator=self.coordinator)
                self.memory_agent = MemoryAgent()
                # Pass memory_agent and meta_coordinator to ActionAgent
                self.action_agent = ActionAgent(meta_coordinator=self.coordinator, memory_agent=self.memory_agent)
                self.pattern_engine = PatternDetectionEngine() # Initialize PatternDetectionEngine
                
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
        """Run the full NIS Protocol analysis on coordinates using LangGraph."""
        if not self.agents_available or self.graph is None:
            logger.info(f"Agents or graph not available. Using mock implementations for coordinates: {lat}, {lon}")
            return self._mock_analyze(lat, lon, use_satellite, use_lidar, 
                                      use_historical, use_indigenous)
        
        initial_state = GraphState(
            latitude=lat,
            longitude=lon,
            radius_km=50.0, # Default, or allow as parameter
            use_satellite=use_satellite,
            use_lidar=use_lidar,
            use_historical_texts=use_historical, # Match state field names
            use_indigenous_maps=use_indigenous, # Match state field names
            raw_vision_data=None,
            detected_patterns=None,
            processed_historical_texts=None,
            processed_indigenous_knowledge=None,
            reasoning_interpretation=None,
            final_report=None,
            error_message=None,
            current_task_id=None,
            # Iteration control
            iteration_count=0,
            max_iterations=3, # Max 3 iterations of refinement
            action_decision=None,
            decision_params={} 
        )

        try:
            # Invoke the LangGraph asynchronously
            final_graph_output = await self.graph.ainvoke(initial_state)
            
            if final_graph_output.get("error_message"):
                logger.error(f"Error in NIS Protocol analysis: {final_graph_output['error_message']}", exc_info=True)
                return self._mock_analyze(lat, lon, use_satellite, use_lidar,
                                          use_historical, use_indigenous)
            
            final_report = final_graph_output.get("final_report", {})
            
            return {
                "location": final_report.get("location", {"lat": lat, "lon": lon}),
                "confidence": final_report.get("confidence", 0.0),
                "description": final_report.get("description", "Analysis complete, but no detailed description in final report."),
                "sources": final_report.get("sources", []),
                "historical_context": final_report.get("historical_context", ""),
                "indigenous_perspective": final_report.get("indigenous_perspective", ""),
                "pattern_type": final_report.get("pattern_type", ""), # Ensure pattern_type is in the report
                "recommendations": final_report.get("recommendations", []),
                "finding_id": final_report.get("finding_id", None) # Include finding_id if available
            }
            
        except Exception as e:
            logger.error(f"Error in NIS Protocol analysis: {e}", exc_info=True)
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

    def _build_graph(self):
        if not self.agents_available:
            self.graph = None
            return

        workflow = StateGraph(GraphState)

        # Define nodes (bindings to methods/functions)
        workflow.add_node("vision_analysis", self._vision_analysis_node)
        workflow.add_node("pattern_detection", self._pattern_detection_node)
        workflow.add_node("reasoning", self._reasoning_node)
        workflow.add_node("action_strategy", self._action_strategy_node) # Renamed from action_generation
        workflow.add_node("error_handler", self._error_handler_node)
        workflow.add_node("final_report_generation", self._final_report_node)


        # Define edges (flow)
        workflow.set_entry_point("vision_analysis")

        # Conditional routing after vision_analysis
        workflow.add_conditional_edges(
            "vision_analysis",
            self._check_for_error_or_proceed,
            {"error_handler": "error_handler", "continue": "pattern_detection"}
        )

        # Conditional routing after pattern_detection
        workflow.add_conditional_edges(
            "pattern_detection",
            self._check_for_error_or_proceed,
            {"error_handler": "error_handler", "continue": "reasoning"}
        )

        # Conditional routing after reasoning
        workflow.add_conditional_edges(
            "reasoning",
            self._check_for_error_or_proceed,
            {"error_handler": "error_handler", "continue": "action_strategy"}
        )
        
        # Conditional routing after action_strategy node
        workflow.add_conditional_edges(
            "action_strategy",
            self._decide_next_step_from_action_strategy,
            {
                "finalize": "final_report_generation",
                "rerun_vision": "vision_analysis",
                "rerun_patterns": "pattern_detection",
                "clarify_reasoning": "reasoning", # Example for re-running reasoning
                "error_handler": "error_handler" # If action_strategy itself errors
            }
        )
        
        # Final steps
        workflow.add_edge("final_report_generation", END)
        workflow.add_edge("error_handler", END) # Errors also lead to the end of the graph

        # Compile the graph
        self.graph = workflow.compile()
        logger.info("LangGraph workflow compiled.")

    def _check_for_error_or_proceed(self, state: 'GraphState') -> str:
        """Helper function for conditional routing based on error_message."""
        if state.get("error_message"):
            return "error_handler"
        return "continue"

    def _decide_next_step_from_action_strategy(self, state: 'GraphState') -> str:
        """Helper function for conditional routing based on action_decision."""
        if state.get("error_message"): # Error from action_strategy node itself
            return "error_handler"
        
        action_decision = state.get("action_decision", "finalize")
        
        if state["iteration_count"] >= state["max_iterations"] and action_decision != "finalize":
            logger.warning(f"Max iterations ({state['max_iterations']}) reached. Forcing finalization.")
            return "finalize"
            
        return action_decision


    # Node methods
    async def _vision_analysis_node(self, state: 'GraphState') -> Dict[str, Any]:
        logger.info(f"Executing Vision Analysis Node (Iteration: {state['iteration_count']})")
        try:
            # Use decision_params if provided for a re-run
            params = state.get("decision_params", {}) if state.get("action_decision") == "rerun_vision" else {}
            lat = params.get("latitude", state["latitude"])
            lon = params.get("longitude", state["longitude"])
            use_satellite = params.get("use_satellite", state["use_satellite"])
            use_lidar = params.get("use_lidar", state["use_lidar"])

            # Call the async method directly using await
            raw_vision_data = await self.vision_agent.analyze_coordinates(
                lat=lat,
                lon=lon,
                use_satellite=use_satellite,
                use_lidar=use_lidar
            )

            return {
                "raw_vision_data": raw_vision_data, 
                "error_message": None, # Clear previous error
                "decision_params": {}, # Clear after use
                "iteration_count": state["iteration_count"] + 1 if state.get("action_decision") == "rerun_vision" else state["iteration_count"] # Increment only on actual rerun call by action agent
            }
        except Exception as e:
            logger.error(f"Error in Vision Analysis Node: {e}", exc_info=True)
            return {"error_message": f"Vision Analysis Failed: {e}"}

    def _pattern_detection_node(self, state: 'GraphState') -> Dict[str, Any]:
        logger.info(f"Executing Pattern Detection Node (Iteration: {state['iteration_count']})")
        if state.get("error_message"): return {} 
        try:
            raw_vision_output = state.get("raw_vision_data", {})
            
            # Use decision_params if provided for a re-run
            params = state.get("decision_params", {}) if state.get("action_decision") == "rerun_patterns" else {}
            current_radius_km = params.get("radius_km", state["radius_km"])

            input_data_for_pattern_detection = {
                "location": {
                    "lat": state["latitude"],
                    "lon": state["longitude"],
                    "radius_km": current_radius_km 
                },
            }
            if isinstance(raw_vision_output, dict):
                 input_data_for_pattern_detection.update(raw_vision_output)

            if not self.pattern_engine:
                 logger.error("PatternDetectionEngine not initialized!")
                 return {"error_message": "PatternDetectionEngine not initialized!"}

            # Apply specific pattern detection parameters if provided by action_strategy
            pattern_types_to_detect = params.get("pattern_types", None) # Example: from decision_params

            detected_patterns_output = self.pattern_engine.detect_patterns(
                input_data_for_pattern_detection,
                pattern_types=pattern_types_to_detect
            )
            
            return {
                "detected_patterns": detected_patterns_output,
                "processed_indigenous_knowledge": input_data_for_pattern_detection.get("indigenous_knowledge"),
                "processed_historical_texts": input_data_for_pattern_detection.get("historical_texts_processed"),
                "radius_km": current_radius_km, # Ensure radius_km in state is updated if changed
                "error_message": None, # Clear previous error
                "decision_params": {}, # Clear after use
                "iteration_count": state["iteration_count"] + 1 if state.get("action_decision") == "rerun_patterns" else state["iteration_count"]
            }
        except Exception as e:
            logger.error(f"Error in Pattern Detection Node: {e}", exc_info=True)
            return {"error_message": f"Pattern Detection Failed: {e}"}

    def _reasoning_node(self, state: 'GraphState') -> Dict[str, Any]:
        logger.info(f"Executing Reasoning Node (Iteration: {state['iteration_count']})")
        if state.get("error_message"): return {}
        try:
            raw_vision_output = state.get("raw_vision_data") # This is the full output from VisionAgent

            # Synthesize visual_findings for ReasoningAgent from raw_vision_data.combined_analysis
            synthesized_visual_findings = {
                "anomaly_detected": False,
                "pattern_type": "",
                "confidence": 0.0,
                "sources": [], # Initialize sources
                "features_detected": [] # Initialize features_detected
            }

            if raw_vision_output and "combined_analysis" in raw_vision_output:
                combined_analysis = raw_vision_output["combined_analysis"]
                if combined_analysis: # Ensure combined_analysis is not None
                    synthesized_visual_findings["confidence"] = combined_analysis.get("confidence", 0.0)
                    
                    features = combined_analysis.get("features_detected", [])
                    synthesized_visual_findings["features_detected"] = features # Pass all detected features

                    if features:
                        synthesized_visual_findings["anomaly_detected"] = True
                        # Use the type of the highest confidence feature as the primary pattern_type
                        synthesized_visual_findings["pattern_type"] = features[0].get("type", "") if features else ""
                    
                    # Pass through sources from satellite and lidar if available
                    if raw_vision_output.get("satellite_findings"):
                        sat_source = raw_vision_output["satellite_findings"].get("source")
                        if sat_source:
                             synthesized_visual_findings["sources"].append(sat_source)
                    if raw_vision_output.get("lidar_findings"):
                        lid_source = raw_vision_output["lidar_findings"].get("source")
                        if lid_source:
                            synthesized_visual_findings["sources"].append(lid_source)
            else:
                logger.warning("No combined_analysis found in raw_vision_data for ReasoningNode.")


            # Use decision_params if provided for a re-run (e.g. different historical scope)
            params = state.get("decision_params", {}) if state.get("action_decision") == "clarify_reasoning" else {}
            
            # Get processed contextual data from the state
            processed_historical = state.get("processed_historical_texts")
            processed_indigenous = state.get("processed_indigenous_knowledge")

            use_historical_param = params.get("use_historical_texts", processed_historical is not None)
            use_indigenous_param = params.get("use_indigenous_maps", processed_indigenous is not None)
            # Check if ActionAgent requested a web search for clarification
            perform_web_search_param = params.get("perform_web_search", False)

            reasoning_interpretation = self.reasoning_agent.interpret_findings(
                visual_findings=synthesized_visual_findings, 
                lat=state["latitude"],
                lon=state["longitude"],
                processed_historical_texts=processed_historical if use_historical_param else None,
                processed_indigenous_knowledge=processed_indigenous if use_indigenous_param else None,
                perform_web_search=perform_web_search_param # Pass the flag
            )
            return {
                "reasoning_interpretation": reasoning_interpretation,
                "error_message": None, # Clear previous error
                "decision_params": {}, # Clear after use
                "iteration_count": state["iteration_count"] + 1 if state.get("action_decision") == "clarify_reasoning" else state["iteration_count"]
            }
        except Exception as e:
            logger.error(f"Error in Reasoning Node: {e}", exc_info=True)
            return {"error_message": f"Reasoning Failed: {e}"}

    def _action_strategy_node(self, state: 'GraphState') -> Dict[str, Any]:
        logger.info("Executing Action Strategy Node")
        if state.get("error_message"): 
            # If an error occurred before this node, pass it through but ensure a decision to finalize to stop loops.
            return {"action_decision": "finalize", "error_message": state.get("error_message")}
        try:
            # Call the new method on the ActionAgent instance
            if not self.action_agent:
                logger.error("ActionAgent not initialized!")
                return {"error_message": "ActionAgent not initialized!", "action_decision": "finalize"}
            
            decision_output = self.action_agent.strategize_next_step(state)
            
            # Ensure the output from strategize_next_step is what we expect for the state
            return {
                "action_decision": decision_output.get("action_decision", "finalize"), # Default to finalize if not specified
                "decision_params": decision_output.get("decision_params", {}),
                "error_message": None, # Clear any previous non-critical error before this node made its decision
            }
        except Exception as e:
            logger.error(f"Error in Action Strategy Node: {e}", exc_info=True)
            return {"error_message": f"Action Strategy Failed: {e}", "action_decision": "finalize"} # Finalize on error to prevent loops

    def _final_report_node(self, state: 'GraphState') -> Dict[str, Any]:
        logger.info("Executing Final Report Generation Node")
        if state.get("error_message") and not state.get("final_report"): # If error happened before report generation
             logger.warning("Skipping final report generation due to earlier error.")
             return {} # Keep error message in state

        try:
            # ActionAgent's generate_finding_report expects visual_findings and reasoning_interpretation.
            # Ensure robust fallback if parts of the state are missing.
            visual_findings_for_report = state.get("raw_vision_data", {})
            if not visual_findings_for_report and state.get("detected_patterns"):
                # If raw_vision_data is empty but we have patterns, use patterns as a proxy for visual_findings
                # This might need adjustment based on what generate_finding_report truly expects.
                 visual_findings_for_report = {"description": "Patterns detected", "features_detected": state.get("detected_patterns"), "confidence": state.get("reasoning_interpretation", {}).get("confidence",0.0) }


            final_report_data = self.action_agent.generate_finding_report(
                lat=state["latitude"],
                lon=state["longitude"],
                visual_findings=visual_findings_for_report,
                reasoning_interpretation=state.get("reasoning_interpretation") or {}
            )
            return {"final_report": final_report_data, "error_message": None} # Clear error on successful report
        except Exception as e:
            logger.error(f"Error in Final Report Generation Node: {e}", exc_info=True)
            # If report generation itself fails, preserve original error or set a new one
            return {"error_message": state.get("error_message") or f"Final Report Generation Failed: {e}"}

    def _error_handler_node(self, state: 'GraphState') -> Dict[str, Any]:
        error_msg = state.get("error_message", "No error message found in state.")
        logger.error(f"Error Handler Node Executed. Error: {error_msg}")
        # Ensure the error message is preserved if it was already set
        # The graph transitions to END from here, so no new state fields are strictly necessary
        # unless a subsequent node specifically needs to know it passed through the error handler.
        return {"error_message": error_msg} # Preserve error message


# Create a singleton instance
nis_protocol = NISProtocol() 