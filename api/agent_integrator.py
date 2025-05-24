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
    from src.agents.consciousness_module import GlobalWorkspace, ConsciousnessMonitor
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
        target = message.get("target", "")
        content = message.get("content", {})
        action = content.get("action", "")
        logger.info(f"MCP message to {target}: {action}")
        raise NotImplementedError("MCPAdapter.send_message must be implemented for production use.")


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
                
                # Create the global workspace
                self.workspace = GlobalWorkspace({
                    'vision': self.vision_agent,
                    'memory': self.memory_agent,
                    'reasoning': self.reasoning_agent
                })
                
                # Optionally, start the consciousness monitor in a background thread or async task
                self.monitor = ConsciousnessMonitor(self.workspace)
                # self.monitor.maintain_awareness(max_cycles=10)  # For testing, run 10 cycles
                
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
            logger.error("NISProtocol: Agents or graph not available. Real data/models are required in production.")
            raise RuntimeError("NISProtocol: Agents or graph not available. Real data/models are required in production.")
        
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
            # Fields for iterative decision making by ActionAgent
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
                raise RuntimeError(f"NIS Protocol analysis failed: {final_graph_output['error_message']}")
            
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
            raise

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
        workflow.add_node("consciousness", self.consciousness_node)

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
                "finalize": "consciousness",  # Route to consciousness node before final report
                "rerun_vision": "vision_analysis",
                "rerun_patterns": "pattern_detection",
                "clarify_reasoning": "reasoning", # Example for re-running reasoning
                "error_handler": "error_handler" # If action_strategy itself errors
            }
        )
        
        # Add edge from consciousness node to final report
        workflow.add_edge("consciousness", "final_report_generation")
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
            # Return all state keys, updating final_report and error_message
            return {**state, "final_report": final_report_data, "error_message": None}
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

    def consciousness_node(self, state: dict) -> dict:
        import logging
        logger = logging.getLogger(__name__)
        # Use the workspace to integrate information
        integrated = self.workspace.integrate_information()
        logger.info(f"[Consciousness Node] Integrated info: {integrated}")
        # Return a new dict with the consciousness key set
        new_state = dict(state)
        new_state['consciousness'] = integrated
        return new_state


# Create a singleton instance
nis_protocol = NISProtocol() 