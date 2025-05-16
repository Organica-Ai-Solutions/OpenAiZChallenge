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
    
    def __init__(self, output_dir: Optional[Path] = None, meta_coordinator=None):
        """Initialize the Action Agent.
        
        Args:
            output_dir: Directory to store outputs
            meta_coordinator: NIS MetaProtocolCoordinator for agent communication
        """
        self.output_dir = output_dir or Path("outputs") / "findings"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Store reference to MetaProtocolCoordinator if provided
        self.meta_coordinator = meta_coordinator
        
        logger.info(f"Action Agent initialized with output dir at {self.output_dir}")
    
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
        
        # If we have a MetaProtocolCoordinator, notify it about the new finding
        if self.meta_coordinator:
            try:
                # Using Agent-to-Agent protocol to notify other agents about this finding
                self.meta_coordinator.send_message(
                    protocol="a2a",
                    source="action_agent",
                    target="memory_agent",
                    message={
                        "action": "store_finding",
                        "data": report
                    }
                )
                logger.info(f"Notified memory agent about new finding {finding_id} via MetaProtocol")
            except Exception as e:
                logger.error(f"Error notifying memory agent: {str(e)}")
        
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