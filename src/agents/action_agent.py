"""Action Agent for the NIS Protocol.

This agent generates outputs, recommendations, and actions based on the 
findings and interpretations of the other agents.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any
import os
import uuid
import time

# Setup logging
logger = logging.getLogger(__name__)


class ActionAgent:
    """Agent for generating outputs and recommendations based on findings."""
    
    def __init__(self, output_dir: Optional[Path] = None, meta_coordinator=None, memory_agent=None):
        """Initialize the Action Agent.
        
        Args:
            output_dir: Directory to store outputs
            meta_coordinator: NIS MetaProtocolCoordinator for agent communication
            memory_agent: Instance of MemoryAgent for direct memory operations
        """
        self.output_dir = output_dir or Path("outputs") / "findings"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Store reference to MetaProtocolCoordinator if provided
        self.meta_coordinator = meta_coordinator
        # Store reference to MemoryAgent if provided
        self.memory_agent = memory_agent
        
        logger.info(f"Action Agent initialized with output dir at {self.output_dir}")
    
    def strategize_next_step(self, current_graph_state: Dict) -> Dict:
        """
        Analyzes the current state of findings and decides the next course of action.
        This can be to finalize the report or to suggest further analytical iterations.

        Args:
            current_graph_state (Dict): The current state from the LangGraph execution.
                                        Expected to contain fields like 'reasoning_interpretation',
                                        'iteration_count', 'max_iterations', etc.

        Returns:
            Dict: A dictionary containing "action_decision" (e.g., "finalize", "rerun_vision")
                  and "decision_params" (parameters for the chosen action).
        """
        logger.info(f"ActionAgent strategizing next step. Iteration: {current_graph_state.get('iteration_count')}")

        action_decision = "finalize"  # Default to finalizing
        decision_params = {}
        
        iteration_count = current_graph_state.get("iteration_count", 0)
        max_iterations = current_graph_state.get("max_iterations", 3)

        reasoning_interpretation = current_graph_state.get("reasoning_interpretation", {})
        reasoning_confidence = reasoning_interpretation.get("confidence", 0.0)
        current_pattern_type = reasoning_interpretation.get("pattern_type", visual_findings.get("pattern_type", "")) # Get pattern from reasoning or visual

        # Access visual_findings from the state for pattern_type fallback
        visual_findings = current_graph_state.get("raw_vision_data", {}).get("combined_analysis", {})
        if not current_pattern_type:
            # If reasoning_interpretation didn't yield a pattern_type, try to get it from the primary visual feature.
            # This assumes `raw_vision_data` structure as synthesized by _reasoning_node or directly from VisionAgent.
            # The _reasoning_node synthesizes visual_findings which has pattern_type, so that should be preferred.
            # However, direct access to raw_vision_data is also possible.
            # Let's assume reasoning_interpretation is the primary source for pattern_type after reasoning node.
            # If reasoning_interpretation exists but pattern_type is empty, it implies no clear pattern from reasoning.
            # If reasoning_interpretation itself is empty/None, then visual_findings might be the only source.
            reasoned_pattern = reasoning_interpretation.get("pattern_type") # More direct from reasoning
            if reasoned_pattern:
                current_pattern_type = reasoned_pattern
            else:
                # Fallback to visual_findings if reasoning_interpretation is missing or has no pattern_type
                # This needs to be consistent with how visual_findings is structured in the state by _vision_analysis_node
                # or synthesized by _reasoning_node before being passed to reasoning_agent.
                # Let's assume the `synthesized_visual_findings` by _reasoning_node is what we should rely on
                # if we were to look at `visual_findings` directly in this state.
                # For simplicity, if reasoning_interpretation is the main input here, its pattern_type is key.
                pass # current_pattern_type would remain empty if not in reasoning_interpretation

        # Example Logic:
        # 1. If confidence is high, finalize.
        # 2. If confidence is very low, and iterations left, try to get broader context or different patterns.
        # 3. If confidence is moderate, and iterations left, try to refine vision or reasoning.

        if reasoning_confidence >= 0.85:
            action_decision = "finalize"
            logger.info("Strategy: High confidence. Finalizing.")
        elif iteration_count < max_iterations:
            # Memory Agent Consultation for moderate/low confidence
            consulted_memory = False
            if self.memory_agent and current_pattern_type and 0.5 <= reasoning_confidence < 0.85:
                try:
                    logger.info(f"Moderate confidence ({reasoning_confidence}) for pattern '{current_pattern_type}'. Consulting MemoryAgent.")
                    # Note: Region finding logic is basic here. Could be improved.
                    # For now, not using region to keep it simple.
                    similar_sites = self.memory_agent.find_similar_sites(pattern_type=current_pattern_type, max_results=3)
                    if similar_sites:
                        # Simple heuristic: if confident similar sites exist, it might bolster the current finding.
                        # Or, it might suggest the current analysis is on the right track.
                        # For now, just log and potentially lean towards finalize if strong matches.
                        logger.info(f"MemoryAgent found {len(similar_sites)} similar sites for pattern '{current_pattern_type}'. First one: {similar_sites[0].get('data',{}).get('finding_id', 'N/A')}")
                        # Example: if similar_sites[0].get("data",{}).get("confidence", 0) > 0.8:
                        #     action_decision = "finalize" # Bolstered by similar findings
                        #     logger.info("Decision to finalize bolstered by similar high-confidence sites in memory.")
                        #     consulted_memory = True # Mark that memory influenced decision
                    else:
                        logger.info(f"MemoryAgent found no similar sites for pattern '{current_pattern_type}'.")
                    consulted_memory = True # Mark that memory was consulted, even if no decision change yet
                except Exception as e:
                    logger.error(f"Error consulting MemoryAgent in strategize_next_step: {e}")
            
            # If memory consultation didn't lead to finalization, proceed with other rules.
            if action_decision == "finalize" and consulted_memory:
                pass # Decision already made based on memory
            elif reasoning_confidence < 0.5 and reasoning_confidence > 0.0: # Very low but not zero
                action_decision = "rerun_patterns"
                decision_params = {
                    "radius_km": current_graph_state.get("radius_km", 50.0) * 1.5, # Expand search radius
                    "pattern_types": None # Search for all pattern types
                }
                logger.info(f"Strategy: Very low confidence ({reasoning_confidence}). Expanding pattern search.")
            elif reasoning_confidence < 0.75 and reasoning_confidence > 0.0: # Moderate/low
                # Alternate between rerunning vision and clarifying reasoning on subsequent iterations
                if iteration_count % 2 == 0: # Even iterations (0, 2)
                    action_decision = "rerun_vision"
                    # Potentially request different parameters for vision, e.g., specific bands, different dates if supported
                    decision_params = {"use_satellite": True, "use_lidar": True, "enhance_contrast": True} # Example param
                    logger.info(f"Strategy: Moderate confidence ({reasoning_confidence}). Rerunning vision.")
                else: # Odd iterations (1)
                    action_decision = "clarify_reasoning" 
                    # This would imply reasoning_agent.interpret_findings might take some params to guide its LLM,
                    # or we are just re-running it hoping for a different stochastic outcome from the LLM.
                    # For now, no specific params, just re-triggering it.
                    decision_params = {} 
                    logger.info(f"Strategy: Moderate confidence ({reasoning_confidence}). Clarifying reasoning.")
            else: # Confidence is acceptable or no clear strategy for low confidence and iterations left
                action_decision = "finalize"
                logger.info(f"Strategy: Confidence ({reasoning_confidence}) acceptable or no specific rerun strategy. Finalizing.")
        else:
            logger.info(f"Strategy: Max iterations reached or high confidence. Finalizing. Confidence: {reasoning_confidence}")
            action_decision = "finalize"

        return {
            "action_decision": action_decision,
            "decision_params": decision_params
        }
    
    def generate_finding_report(self, 
                              lat: float, 
                              lon: float,
                              visual_findings: Dict,
                              reasoning_interpretation: Dict) -> Dict:
        """Generate a comprehensive report for a potential archaeological finding.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            visual_findings: Results from the Vision Agent
            reasoning_interpretation: Results from the Reasoning Agent
            
        Returns:
            Dictionary with the complete finding report
        """
        # Create a unique ID for this finding
        finding_id = str(uuid.uuid4())[:8]
        
        # Combine confidence scores with a bias toward reasoning
        visual_confidence = visual_findings.get("confidence", 0.0)
        reasoning_confidence = reasoning_interpretation.get("confidence", 0.0)
        combined_confidence = (visual_confidence * 0.4) + (reasoning_confidence * 0.6)
        
        # Collect all sources used
        sources = []
        sources.extend(visual_findings.get("sources", []))
        sources.extend(reasoning_interpretation.get("sources_used", []))
        # Remove duplicates while preserving order
        sources = list(dict.fromkeys(sources))
        
        # Get the pattern type for more specific recommendations
        pattern_type = visual_findings.get("pattern_type", "")
        
        # Create the report
        report = {
            "finding_id": finding_id,
            "timestamp": time.time(),
            "location": {
                "lat": lat,
                "lon": lon,
                "geo_uri": f"geo:{lat},{lon}"
            },
            "confidence": combined_confidence,
            "pattern_type": pattern_type,
            "description": reasoning_interpretation.get("interpretation", visual_findings.get("description", "")),
            "historical_context": reasoning_interpretation.get("historical_context", ""),
            "indigenous_perspective": reasoning_interpretation.get("indigenous_perspective", ""),
            "visual_evidence": {
                "detected_features": visual_findings.get("description", ""),
                "confidence": visual_confidence,
            },
            "sources": sources,
            "recommendations": self._generate_recommendations(
                visual_findings, reasoning_interpretation, lat, lon, pattern_type
            )
        }
        
        # Store the finding using the MemoryAgent directly
        if self.memory_agent:
            try:
                success = self.memory_agent.store_site_data(
                    lat=report['location']['lat'], 
                    lon=report['location']['lon'], 
                    data=report # Storing the whole report as the site data
                )
                if success:
                    logger.info(f"Successfully stored finding {finding_id} in MemoryAgent.")
                else:
                    logger.error(f"Failed to store finding {finding_id} in MemoryAgent.")
            except Exception as e:
                logger.error(f"Error directly storing finding {finding_id} in MemoryAgent: {str(e)}")
        elif self.meta_coordinator: # Fallback to old method if direct memory_agent is not available
            logger.warning("MemoryAgent not directly available to ActionAgent, attempting to use MetaProtocolCoordinator.")
            try:
                # Using Agent-to-Agent protocol to notify other agents about this finding
                # This part needs to align with how MemoryAgent handles A2A messages or have a specific handler.
                # For store_site_data, it expects lat, lon, data directly, not in a nested message.
                # This fallback might not work as intended without MemoryAgent A2A handling for "store_site_data".
                self.meta_coordinator.send_message(
                    protocol="acp", # ACP is for agent function calls
                    source="action_agent",
                    target="memory_agent", # Target agent ID
                    message={
                        "action": "store_site_data", # Method name on MemoryAgent
                        "params": { # Parameters for the method
                            "lat": report['location']['lat'], 
                            "lon": report['location']['lon'], 
                            "data": report
                        }
                    }
                )
                logger.info(f"Attempted to notify memory agent about new finding {finding_id} via MetaProtocol.")
            except Exception as e:
                logger.error(f"Error notifying memory agent via MetaProtocol: {str(e)}")
        
        # Save the report to a file
        self._save_report(report)
        
        return report
    
    def _generate_recommendations(self, 
                                visual_findings: Dict, 
                                reasoning_interpretation: Dict,
                                lat: float,
                                lon: float,
                                pattern_type: str = "") -> List[Dict]:
        """Generate action recommendations based on findings.
        
        Args:
            visual_findings: Results from the Vision Agent
            reasoning_interpretation: Results from the Reasoning Agent
            lat: Latitude coordinate
            lon: Longitude coordinate
            pattern_type: The type of pattern detected
            
        Returns:
            List of recommended actions
        """
        recommendations = []
        combined_confidence = (visual_findings.get("confidence", 0.0) * 0.4) + \
                           (reasoning_interpretation.get("confidence", 0.0) * 0.6)
        
        # Basic recommendations that apply to all findings
        recommendations.append({
            "action": "download_additional_imagery",
            "description": "Download higher resolution satellite imagery to confirm the pattern.",
            "priority": "medium",
            "details": {
                "source": "Planet SuperDove",
                "resolution": "0.5m",
                "spectral_bands": ["RGB", "NIR"]
            }
        })
        
        # If we have high confidence, recommend more specific actions
        if combined_confidence > 0.7:
            recommendations.append({
                "action": "consult_archaeologist",
                "description": "Share findings with archaeological experts specializing in Amazonian civilizations.",
                "priority": "high",
                "details": {
                    "expertise": "Amazonian archaeologist",
                    "collaboration_type": "remote consultation"
                }
            })
            
            # Add recommendation based on pattern type
            if "circular" in pattern_type.lower():
                recommendations.append({
                    "action": "lidar_survey",
                    "description": "Conduct targeted LIDAR survey to map the complete extent of the circular structures.",
                    "priority": "high",
                    "details": {
                        "area": "5km x 5km centered on coordinates",
                        "resolution": "50cm",
                        "focus": "Detect subtle elevation changes typical of Xingu circular village patterns"
                    }
                })
            elif "rectangular" in pattern_type.lower():
                recommendations.append({
                    "action": "drone_photography",
                    "description": "Deploy aerial drone for high-resolution orthophotos of the rectangular structures.",
                    "priority": "high",
                    "details": {
                        "flight_altitude": "100m",
                        "image_overlap": "70%",
                        "camera": "20MP+",
                        "optimal_time": "Early morning for better shadow definition"
                    }
                })
            elif "earthwork" in pattern_type.lower() or "linear" in pattern_type.lower():
                recommendations.append({
                    "action": "ground_survey",
                    "description": "Conduct non-invasive ground survey to confirm the human origin of the linear features.",
                    "priority": "high",
                    "details": {
                        "methods": ["ground-penetrating radar", "magnetometry"],
                        "area": "1km x 1km centered on coordinates",
                        "transect_spacing": "10m"
                    }
                })
            elif "soil" in pattern_type.lower() or "terra preta" in pattern_type.lower():
                recommendations.append({
                    "action": "soil_sampling",
                    "description": "Collect soil samples to test for anthropogenic soil modifications (terra preta).",
                    "priority": "medium",
                    "details": {
                        "tests": ["carbon content", "pottery fragments", "organic remains", "phosphorus levels"],
                        "sampling_pattern": "grid",
                        "sample_depth": "0-30cm, 30-60cm"
                    }
                })
            elif "mound" in pattern_type.lower():
                recommendations.append({
                    "action": "elevation_mapping",
                    "description": "Create detailed elevation map to determine if mounds are natural or anthropogenic.",
                    "priority": "high",
                    "details": {
                        "method": "RTK GPS survey",
                        "point_spacing": "1m",
                        "vertical_accuracy": "±5cm"
                    }
                })
            elif "road" in pattern_type.lower() or "path" in pattern_type.lower() or "network" in pattern_type.lower():
                recommendations.append({
                    "action": "connectivity_analysis",
                    "description": "Analyze potential connections to other known sites or landscape features.",
                    "priority": "medium",
                    "details": {
                        "radius": "20km",
                        "methods": ["least-cost path analysis", "viewshed analysis"],
                        "data": "Regional DEM at 10m resolution"
                    }
                })
            elif "water" in pattern_type.lower() or "canal" in pattern_type.lower():
                recommendations.append({
                    "action": "hydrological_survey",
                    "description": "Assess relationship to water sources and potential water management features.",
                    "priority": "high",
                    "details": {
                        "focus": "Seasonal flow patterns",
                        "methods": ["Drainage analysis", "Water retention assessment"],
                        "equipment": "Portable soil moisture sensors"
                    }
                })
        
        # Lower confidence recommendations
        if combined_confidence <= 0.7:
            recommendations.append({
                "action": "additional_analysis",
                "description": "Reprocess with additional data sources before field investigation.",
                "priority": "high",
                "details": {
                    "sources": ["historical maps", "additional satellite bands", "seasonal imagery"],
                    "methods": ["multi-temporal analysis", "spectral unmixing", "texture analysis"]
                }
            })
        
        # Low confidence recommendations
        if combined_confidence < 0.5:
            recommendations = [{
                "action": "verify_natural_formation",
                "description": "Verify that the pattern is not a natural formation or imaging artifact.",
                "priority": "high",
                "details": {
                    "methods": ["multi-temporal imagery", "geological consultation", "spectral analysis"],
                    "comparison": "Check against known natural patterns in the region"
                }
            }]
        
        # Indigenous consultation recommendation (always include)
        recommendations.append({
            "action": "indigenous_consultation",
            "description": "Consult with local Indigenous communities about the site and its potential significance.",
            "priority": "high",
            "details": {
                "approach": "Respectful engagement with proper protocols",
                "purpose": "Incorporate traditional knowledge and ensure ethical research",
                "ethics": "Follow appropriate guidelines for working with Indigenous knowledge"
            }
        })
        
        # Implementation of the two independent verification methods requirement
        recommendations.append({
            "action": "dual_verification",
            "description": "Ensure findings are verified through two independent methods as required by the challenge.",
            "priority": "high",
            "details": {
                "method1": visual_findings.get("sources", [""])[0] if visual_findings.get("sources") else "Visual analysis",
                "method2": reasoning_interpretation.get("sources_used", [""])[0] if reasoning_interpretation.get("sources_used") else "Contextual analysis",
                "requirement": "OpenAI to Z Challenge requires each finding to be verified by at least two independent methods"
            }
        })
        
        return recommendations
    
    def _save_report(self, report: Dict) -> None:
        """Save a finding report to disk.
        
        Args:
            report: The report to save
        """
        finding_id = report["finding_id"]
        lat = report["location"]["lat"]
        lon = report["location"]["lon"]
        
        file_name = f"finding_{finding_id}_{lat:.4f}_{lon:.4f}.json"
        file_path = self.output_dir / file_name
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=2)
            logger.info(f"Saved finding report to {file_path}")
        except Exception as e:
            logger.error(f"Failed to save finding report: {str(e)}")
    
    def generate_analysis_summary(self, session_id: str, analyses: List[Dict]) -> Dict:
        """Generate a summary of multiple analyses for a session.
        
        Args:
            session_id: Unique identifier for the session
            analyses: List of analysis results to summarize
            
        Returns:
            Summary of the analyses
        """
        if not analyses:
            return {
                "session_id": session_id,
                "timestamp": time.time(),
                "num_analyses": 0,
                "summary": "No analyses to summarize.",
                "findings": []
            }
        
        # Count analyses by confidence level
        confidence_groups = {
            "high": [],   # > 0.7
            "medium": [], # 0.5 - 0.7
            "low": []     # < 0.5
        }
        
        for analysis in analyses:
            confidence = analysis.get("confidence", 0.0)
            if confidence > 0.7:
                confidence_groups["high"].append(analysis)
            elif confidence >= 0.5:
                confidence_groups["medium"].append(analysis)
            else:
                confidence_groups["low"].append(analysis)
        
        # Generate a summary based on the findings
        num_high = len(confidence_groups["high"])
        num_medium = len(confidence_groups["medium"])
        num_low = len(confidence_groups["low"])
        
        summary_text = f"Analysis of {len(analyses)} locations. "
        
        if num_high > 0:
            summary_text += f"Found {num_high} high-confidence potential archaeological sites. "
        if num_medium > 0:
            summary_text += f"Found {num_medium} medium-confidence locations requiring further investigation. "
        if num_low > 0:
            summary_text += f"Found {num_low} low-confidence anomalies that may be natural formations. "
        
        # Get pattern types
        pattern_types = {}
        for analysis in analyses:
            pattern = analysis.get("pattern_type", "")
            if pattern:
                pattern_types[pattern] = pattern_types.get(pattern, 0) + 1
        
        pattern_summary = ", ".join([f"{count} {pattern}" for pattern, count in pattern_types.items()])
        if pattern_summary:
            summary_text += f"Pattern types identified: {pattern_summary}."
        
        # Prepare the summary object
        summary = {
            "session_id": session_id,
            "timestamp": time.time(),
            "num_analyses": len(analyses),
            "summary": summary_text,
            "confidence_distribution": {
                "high": num_high,
                "medium": num_medium,
                "low": num_low
            },
            "pattern_types": pattern_types,
            "findings": [
                {
                    "finding_id": analysis.get("finding_id", "unknown"),
                    "location": analysis.get("location", {}),
                    "confidence": analysis.get("confidence", 0.0),
                    "pattern_type": analysis.get("pattern_type", ""),
                    "description": analysis.get("description", "")
                }
                for analysis in sorted(analyses, key=lambda x: x.get("confidence", 0.0), reverse=True)
            ]
        }
        
        # Save the summary
        summary_path = self.output_dir / f"summary_{session_id}.json"
        try:
            with open(summary_path, "w", encoding="utf-8") as f:
                json.dump(summary, f, indent=2)
            logger.info(f"Saved analysis summary to {summary_path}")
        except Exception as e:
            logger.error(f"Failed to save analysis summary: {str(e)}")
        
        return summary
    
    def get_capabilities(self) -> Dict:
        """Return the capabilities of this agent."""
        return {
            "name": "ActionAgent",
            "description": "Generates outputs and recommendations based on findings",
            "output_types": [
                "finding_reports",
                "analysis_summaries",
                "recommendations",
            ],
            "protocols": ["a2a"] if self.meta_coordinator else []
        } 