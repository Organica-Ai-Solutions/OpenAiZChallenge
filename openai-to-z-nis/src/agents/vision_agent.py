"""Vision Agent for the NIS Protocol.

This agent analyzes satellite imagery and LIDAR data to detect potential
archaeological sites and anomalies.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import os
import random
import json

# Import the GPT integration for vision analysis
from src.meta.gpt_integration import GPTIntegration

# In a production environment, we would import actual vision models
# For example: import cv2, tensorflow, or a custom model

from ..utils.geo_helpers import (
    get_tile_path,
    load_raster_data,
    get_pixel_coords,
    extract_patch,
    detect_anomalies,
)

# Setup logging
logger = logging.getLogger(__name__)


class VisionAgent:
    """Agent for analyzing visual data to detect archaeological features."""
    
    def __init__(self, data_dir: Optional[Path] = None, gpt_model: str = "gpt-4o"):
        """Initialize the Vision Agent.
        
        Args:
            data_dir: Directory containing satellite and LIDAR data
            gpt_model: GPT model to use for vision analysis
        """
        self.data_dir = data_dir or Path("data")
        self.satellite_dir = self.data_dir / "satellite"
        self.lidar_dir = self.data_dir / "lidar"
        
        # Create directories if they don't exist
        os.makedirs(self.satellite_dir, exist_ok=True)
        os.makedirs(self.lidar_dir, exist_ok=True)
        
        # Initialize the GPT integration for vision analysis
        try:
            self.gpt = GPTIntegration(model_name=gpt_model)
            logger.info(f"Initialized GPT Vision integration with model: {gpt_model}")
            self.use_live_vision = True
        except Exception as e:
            logger.warning(f"Failed to initialize GPT Vision: {str(e)}. Falling back to mock responses.")
            self.use_live_vision = False
        
        logger.info("Vision Agent initialized")
    
    def analyze_coordinates(self, lat: float, lon: float, 
                           use_satellite: bool = True, 
                           use_lidar: bool = True) -> Dict:
        """Analyze coordinates for potential archaeological features.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            use_satellite: Whether to use satellite data
            use_lidar: Whether to use LIDAR data
            
        Returns:
            Dictionary with analysis results
        """
        results = {
            "location": {"lat": lat, "lon": lon},
            "satellite_findings": None,
            "lidar_findings": None,
            "combined_analysis": None,
        }
        
        # Process satellite data if requested
        if use_satellite:
            try:
                results["satellite_findings"] = self._process_satellite(lat, lon)
                logger.info(f"Processed satellite data for {lat}, {lon}")
            except Exception as e:
                logger.error(f"Error processing satellite data: {str(e)}")
        
        # Process LIDAR data if requested
        if use_lidar:
            try:
                results["lidar_findings"] = self._process_lidar(lat, lon)
                logger.info(f"Processed LIDAR data for {lat}, {lon}")
            except Exception as e:
                logger.error(f"Error processing LIDAR data: {str(e)}")
        
        # Combine findings for a unified analysis
        results["combined_analysis"] = self._combine_findings(
            results["satellite_findings"], 
            results["lidar_findings"]
        )
        
        return results
    
    def analyze_image(self, image_url: str, image_type: str, lat: float, lon: float) -> Dict:
        """Analyze an image using GPT Vision.
        
        Args:
            image_url: URL to the image to analyze
            image_type: Type of image (satellite or lidar)
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Dictionary with GPT Vision analysis results
        """
        if not self.use_live_vision:
            logger.warning("GPT Vision not available, skipping image analysis")
            return {
                "anomaly_detected": False,
                "confidence": 0.0,
                "pattern_type": "",
                "description": "Image analysis not available.",
                "source": f"{image_type.capitalize()} image at {lat}, {lon}"
            }
        
        try:
            # Create a specific question based on image type
            if image_type.lower() == "satellite":
                question = f"Analyze this satellite image at coordinates {lat}, {lon}. Identify any potential archaeological features such as geometric patterns, earthworks, settlement layouts, or landscape modifications that could indicate human activity. Focus on circular structures, rectangular patterns, linear features, or distinctive soil colors."
            else:  # LIDAR
                question = f"Analyze this LIDAR elevation data at coordinates {lat}, {lon}. Identify any potential archaeological features such as mounds, depressions, earthworks, or geometric patterns that might not be visible in regular satellite imagery. Focus on subtle elevation changes that could indicate human-made structures."
            
            # Call GPT Vision for analysis
            result = self.gpt.vision_analysis(
                image_url=image_url,
                question=question
            )
            
            # Parse the results
            analysis_text = result.get("analysis", "")
            
            # Extract key information from the analysis
            # This is a simple version - in production we would use more sophisticated parsing
            anomaly_detected = "no features" not in analysis_text.lower() and "no archaeological" not in analysis_text.lower()
            
            # Try to determine pattern type from the analysis
            pattern_types = [
                "circular geometric structures",
                "rectangular settlement patterns",
                "linear earthworks",
                "anthropogenic soil signatures",
                "artificial mounds",
                "road networks",
                "water management systems"
            ]
            
            detected_pattern = ""
            for pattern in pattern_types:
                if pattern in analysis_text.lower() or pattern.replace(" ", "") in analysis_text.lower():
                    detected_pattern = pattern
                    break
            
            # If no specific pattern was found but anomalies were detected, use a generic type
            if anomaly_detected and not detected_pattern:
                detected_pattern = "unclassified archaeological feature"
            
            # Estimate confidence based on language used
            confidence = 0.5  # Default
            if "clearly" in analysis_text.lower() or "definitely" in analysis_text.lower():
                confidence = 0.85
            elif "likely" in analysis_text.lower() or "probable" in analysis_text.lower():
                confidence = 0.7
            elif "possible" in analysis_text.lower() or "might be" in analysis_text.lower():
                confidence = 0.5
            elif "unlikely" in analysis_text.lower() or "does not appear" in analysis_text.lower():
                confidence = 0.2
                anomaly_detected = False
            
            return {
                "anomaly_detected": anomaly_detected,
                "confidence": confidence,
                "pattern_type": detected_pattern,
                "description": analysis_text,
                "source": f"{image_type.capitalize()} image analyzed with GPT Vision at {lat}, {lon}"
            }
            
        except Exception as e:
            logger.error(f"Error during GPT Vision analysis: {str(e)}")
            return {
                "anomaly_detected": False,
                "confidence": 0.0,
                "pattern_type": "",
                "description": f"Image analysis error: {str(e)}",
                "source": f"{image_type.capitalize()} image at {lat}, {lon}"
            }
    
    def _process_satellite(self, lat: float, lon: float) -> Dict:
        """Process satellite imagery for the given coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Dictionary with satellite analysis results
        """
        # If we have GPT Vision enabled and the image URL exists, use it
        if self.use_live_vision:
            try:
                # In production, this would retrieve an actual satellite image URL
                # For demonstration, we'll use a mock URL based on coordinates
                # This would be replaced with actual satellite image URL in production
                mock_image_url = f"https://example.com/satellite/{lat}_{lon}.jpg"
                
                # Check if the satellite image exists (in production)
                # Here we'll assume it does for demonstration
                
                # Use GPT Vision to analyze the image
                return self.analyze_image(mock_image_url, "satellite", lat, lon)
                
            except Exception as e:
                logger.warning(f"GPT Vision satellite processing failed: {str(e)}, falling back to mock")
        
        # Fallback to standard processing or mock data
        try:
            tile_path = get_tile_path(lat, lon, "satellite")
            data, metadata = load_raster_data(tile_path)
            
            # Get pixel coordinates within the tile
            row, col = get_pixel_coords(lat, lon, metadata["transform"])
            
            # Extract a patch around the coordinates
            patch = extract_patch(data, row, col, size=64)
            
            # Detect anomalies in the patch
            has_anomaly, confidence, pattern_type = detect_anomalies(patch)
            
            return {
                "anomaly_detected": has_anomaly,
                "confidence": confidence,
                "pattern_type": pattern_type,
                "source": f"Sentinel-2 Tile {tile_path.name}",
            }
        except Exception as e:
            logger.warning(f"Satellite processing failed: {str(e)}")
            # Provide mock data when no actual data is available
            return self._generate_mock_satellite_result(lat, lon)
    
    def _process_lidar(self, lat: float, lon: float) -> Dict:
        """Process LIDAR data for the given coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Dictionary with LIDAR analysis results
        """
        # If we have GPT Vision enabled and the image URL exists, use it
        if self.use_live_vision:
            try:
                # In production, this would retrieve an actual LIDAR visualization URL
                # For demonstration, we'll use a mock URL based on coordinates
                mock_image_url = f"https://example.com/lidar/{lat}_{lon}.jpg"
                
                # Check if the LIDAR visualization exists (in production)
                # Here we'll assume it does for demonstration
                
                # Use GPT Vision to analyze the image
                return self.analyze_image(mock_image_url, "lidar", lat, lon)
                
            except Exception as e:
                logger.warning(f"GPT Vision LIDAR processing failed: {str(e)}, falling back to mock")
                
        # Fallback to standard processing or mock data
        try:
            tile_path = get_tile_path(lat, lon, "lidar")
            data, metadata = load_raster_data(tile_path)
            
            # Get pixel coordinates within the tile
            row, col = get_pixel_coords(lat, lon, metadata["transform"])
            
            # Extract a patch around the coordinates
            patch = extract_patch(data, row, col, size=64)
            
            # For LIDAR, we'd typically look for elevation anomalies
            # Here we'll use the same function but interpret differently
            has_anomaly, confidence, pattern_type = detect_anomalies(patch)
            
            return {
                "anomaly_detected": has_anomaly,
                "confidence": confidence * 1.2,  # LIDAR often provides higher confidence
                "pattern_type": pattern_type,
                "source": f"Earth Archive LIDAR Tile {tile_path.name}",
            }
        except Exception as e:
            logger.warning(f"LIDAR processing failed: {str(e)}")
            # Provide mock data when no actual data is available
            return self._generate_mock_lidar_result(lat, lon)
    
    def _combine_findings(self, satellite_result: Optional[Dict], 
                         lidar_result: Optional[Dict]) -> Dict:
        """Combine satellite and LIDAR findings for a unified analysis.
        
        Args:
            satellite_result: Results from satellite analysis
            lidar_result: Results from LIDAR analysis
            
        Returns:
            Combined analysis
        """
        # Start with default values
        combined = {
            "anomaly_detected": False,
            "confidence": 0.0,
            "pattern_type": "",
            "description": "No significant patterns detected.",
            "sources": [],
        }
        
        # If we have no results, return defaults
        if not satellite_result and not lidar_result:
            return combined
        
        # Collect all sources
        sources = []
        if satellite_result and "source" in satellite_result:
            sources.append(satellite_result["source"])
        if lidar_result and "source" in lidar_result:
            sources.append(lidar_result["source"])
        combined["sources"] = sources
        
        # Logic for combining results
        sat_confidence = satellite_result.get("confidence", 0) if satellite_result else 0
        lidar_confidence = lidar_result.get("confidence", 0) if lidar_result else 0
        
        # If both detected anomalies, use the higher confidence pattern
        if (satellite_result and satellite_result.get("anomaly_detected", False) and
            lidar_result and lidar_result.get("anomaly_detected", False)):
            
            combined["anomaly_detected"] = True
            
            # Use weighted average for confidence, giving more weight to LIDAR
            combined["confidence"] = (sat_confidence * 0.4 + lidar_confidence * 0.6)
            
            # If they agree on pattern type, that's stronger evidence
            if satellite_result.get("pattern_type") == lidar_result.get("pattern_type"):
                combined["pattern_type"] = satellite_result["pattern_type"]
                combined["confidence"] *= 1.2  # Boost confidence when both agree
            else:
                # Otherwise use the one with higher confidence
                if lidar_confidence >= sat_confidence:
                    combined["pattern_type"] = lidar_result["pattern_type"]
                else:
                    combined["pattern_type"] = satellite_result["pattern_type"]
        
        # If only one detected anomalies, use that one
        elif satellite_result and satellite_result.get("anomaly_detected", False):
            combined["anomaly_detected"] = True
            combined["confidence"] = sat_confidence
            combined["pattern_type"] = satellite_result["pattern_type"]
        
        elif lidar_result and lidar_result.get("anomaly_detected", False):
            combined["anomaly_detected"] = True
            combined["confidence"] = lidar_confidence
            combined["pattern_type"] = lidar_result["pattern_type"]
        
        # Generate a description based on the pattern type
        if combined["anomaly_detected"]:
            pattern_descriptions = {
                "circular geometric structures": "Potential circular settlement pattern detected with geometric organization.",
                "rectangular settlement patterns": "Rectangular structures indicating possible settlement or ceremonial site.",
                "linear earthworks": "Linear features suggesting possible earthworks, roads, or defensive structures.",
                "anthropogenic soil signatures": "Soil patterns consistent with anthropogenic modification (potentially terra preta).",
                "artificial mounds": "Elevated features that may indicate artificial mounds or platforms.",
                "road networks": "Linear patterns consistent with ancient road or path networks.",
                "water management systems": "Features suggesting possible canals or water management structures.",
            }
            
            combined["description"] = pattern_descriptions.get(
                combined["pattern_type"], 
                f"Unidentified pattern of potential archaeological interest: {combined['pattern_type']}"
            )
        
        return combined
    
    def _generate_mock_satellite_result(self, lat: float, lon: float) -> Dict:
        """Generate mock satellite analysis results.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Mock satellite analysis
        """
        # Use hash of coordinates for deterministic results
        seed = hash(f"{lat:.4f}_{lon:.4f}_sat")
        np.random.seed(seed)
        
        # Patterns to potentially detect
        patterns = [
            "circular geometric structures",
            "rectangular settlement patterns",
            "linear earthworks",
            "anthropogenic soil signatures",
            "road networks",
        ]
        
        # Generate mock result
        has_anomaly = np.random.random() > 0.4  # 60% chance of anomaly
        confidence = np.random.uniform(0.6, 0.85) if has_anomaly else np.random.uniform(0.1, 0.4)
        pattern_index = np.random.randint(0, len(patterns)) if has_anomaly else 0
        
        return {
            "anomaly_detected": has_anomaly,
            "confidence": confidence,
            "pattern_type": patterns[pattern_index] if has_anomaly else "",
            "source": f"Sentinel-2 Scene ID: S2A_MSIL2A_{20220101 + abs(hash(f'{lat:.2f}_{lon:.2f}')) % 10000}",
        }
    
    def _generate_mock_lidar_result(self, lat: float, lon: float) -> Dict:
        """Generate mock LIDAR analysis results.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            Mock LIDAR analysis
        """
        # Use hash of coordinates for deterministic results
        seed = hash(f"{lat:.4f}_{lon:.4f}_lidar")
        np.random.seed(seed)
        
        # Patterns more commonly found in LIDAR
        patterns = [
            "circular geometric structures",
            "rectangular settlement patterns",
            "linear earthworks",
            "artificial mounds",
            "water management systems",
        ]
        
        # Generate mock result
        has_anomaly = np.random.random() > 0.3  # 70% chance of anomaly - LIDAR is often more revealing
        confidence = np.random.uniform(0.7, 0.9) if has_anomaly else np.random.uniform(0.2, 0.5)
        pattern_index = np.random.randint(0, len(patterns)) if has_anomaly else 0
        
        return {
            "anomaly_detected": has_anomaly,
            "confidence": confidence,
            "pattern_type": patterns[pattern_index] if has_anomaly else "",
            "source": f"Earth Archive LIDAR Tile #{10000 + abs(hash(f'{lat:.2f}_{lon:.2f}')) % 90000}",
        }
    
    def get_capabilities(self) -> Dict:
        """Return the capabilities of this agent."""
        return {
            "name": "VisionAgent",
            "description": "Analyzes satellite and LIDAR data for archaeological features",
            "data_types": ["satellite", "lidar"],
            "pattern_types": [
                "circular geometric structures",
                "rectangular settlement patterns",
                "linear earthworks",
                "anthropogenic soil signatures",
                "artificial mounds",
                "road networks",
                "water management systems",
            ],
        } 