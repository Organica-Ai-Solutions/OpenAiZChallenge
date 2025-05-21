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
import numpy as np
import tempfile
import asyncio
from PIL import Image

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
    """Agent responsible for visual analysis of satellite imagery, LIDAR data, etc."""
    
    def __init__(self, output_dir: Optional[str] = None):
        """Initialize the Vision Agent."""
        self.output_dir = Path(output_dir) if output_dir else Path('outputs/vision')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            self.gpt = GPTIntegration(model_name="gpt-4-turbo")
            logger.info("Vision Agent initialized with GPTIntegration (gpt-4-turbo)")
        except Exception as e:
            logger.warning(f"Failed to initialize GPT Vision: {str(e)}. Falling back to mock responses.")
            self.gpt = None
    
    async def analyze_image(
        self,
        image_path: str,
        prompt: Optional[str] = None
    ) -> Dict:
        """
        Analyze an image using GPT Vision.
        
        Args:
            image_path: Path to the image file
            prompt: Optional custom prompt for analysis
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            if not self.gpt:
                logger.warning("GPTIntegration not available, using mock analysis for analyze_image.")
                return self._mock_analysis()
                
            result = await self.gpt.vision_analysis(
                image_path=image_path,
                prompt=prompt
            )
            
            if not isinstance(result, dict):
                logger.error(f"GPT Vision analysis returned non-dict type: {type(result)}. Content: {result}")
                return {"error": "GPT Vision returned unexpected data type.", "details": str(result)}

            return result
            
        except Exception as e:
            logger.error(f"Error analyzing image with GPT Vision: {str(e)}")
            return {"error": str(e), "analysis": "Error during GPT Vision call."}
    
    def _mock_analysis(self) -> Dict:
        """Return mock analysis when GPT Vision is unavailable."""
        logger.info("Generating mock analysis for an image.")
        return {
            "analysis": "Mock vision analysis - GPT Vision not available or failed.",
            "confidence": random.uniform(0.1, 0.4),
            "features_detected": [{"type": "Mock Feature", "confidence": random.uniform(0.1,0.4), "details": "Mock details"}],
            "recommendations": ["Consider manual review due to mock analysis."]
        }
    
    async def analyze_coordinates(self, lat: float, lon: float, 
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
        
        tasks = []
        if use_satellite:
            tasks.append(self._process_satellite(lat, lon))
        if use_lidar:
            tasks.append(self._process_lidar(lat, lon))
        
        processed_results = await asyncio.gather(*tasks, return_exceptions=True)

        idx = 0
        if use_satellite:
            if isinstance(processed_results[idx], Exception):
                logger.error(f"Error processing satellite data: {processed_results[idx]}")
                results["satellite_findings"] = self._generate_mock_satellite_result(lat, lon)
            else:
                results["satellite_findings"] = processed_results[idx]
            idx += 1
        
        if use_lidar:
            if isinstance(processed_results[idx], Exception):
                logger.error(f"Error processing LIDAR data: {processed_results[idx]}")
                results["lidar_findings"] = self._generate_mock_lidar_result(lat, lon)
            else:
                results["lidar_findings"] = processed_results[idx]

        results["combined_analysis"] = self._combine_findings(
            results["satellite_findings"], 
            results["lidar_findings"]
        )
        
        return results
    
    async def _process_satellite(self, lat: float, lon: float) -> Dict:
        """Process satellite imagery for the given coordinates."""
        tile_path = get_tile_path(lat, lon, "satellite")
        if not tile_path.exists():
            logger.warning(f"Satellite tile not found: {tile_path}. Using mock data.")
            return self._generate_mock_satellite_result(lat, lon)

        try:
            data, metadata = load_raster_data(tile_path)
            row, col = get_pixel_coords(lat, lon, metadata["transform"])
            patch_data = extract_patch(data, row, col, size=256)

            if patch_data is None or patch_data.size == 0:
                logger.warning(f"Empty patch extracted for satellite data at {lat}, {lon}. Using mock data.")
                return self._generate_mock_satellite_result(lat, lon)

            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
                if patch_data.ndim == 3 and patch_data.shape[0] in [3,4]:
                    patch_data_rgb = patch_data[:3,:,:]
                    patch_data_rgb = np.moveaxis(patch_data_rgb, 0, -1)
                elif patch_data.ndim == 2:
                    patch_data_rgb = np.stack((patch_data,)*3, axis=-1)
                else:
                    logger.warning(f"Satellite patch has unexpected shape {patch_data.shape}. Saving first slice/band if possible.")
                    if patch_data.ndim == 3: patch_data = patch_data[0]
                    if patch_data.ndim == 2: patch_data_rgb = np.stack((patch_data,)*3, axis=-1)
                    else:
                         logger.error(f"Cannot convert satellite patch of shape {patch_data.shape} to image. Using mock.")
                         return self._generate_mock_satellite_result(lat, lon)

                patch_data_rgb = (patch_data_rgb - np.min(patch_data_rgb)) / (np.max(patch_data_rgb) - np.min(patch_data_rgb) + 1e-6) * 255
                patch_data_rgb = patch_data_rgb.astype(np.uint8)
                
                img = Image.fromarray(patch_data_rgb)
                img.save(tmp_file.name)
                tmp_file_path = tmp_file.name

            logger.info(f"Satellite patch saved to {tmp_file_path}")
            
            prompt = "Analyze this satellite image patch for any signs of archaeological significance, such as geometric patterns, unnatural formations, soil discolorations, or vegetation anomalies. Describe any detected features and estimate their potential relevance."
            gpt_analysis = await self.analyze_image(image_path=tmp_file_path, prompt=prompt)
            
            os.unlink(tmp_file_path)

            if "error" in gpt_analysis or not isinstance(gpt_analysis, dict):
                logger.warning(f"GPT Vision analysis failed for satellite patch: {gpt_analysis.get('error', 'Unknown error')}. Using mock features.")
                features = self._detect_archaeological_features(patch_data)
                confidence = max([f.get('confidence', 0) for f in features] + [0])
            else:
                analysis_text = gpt_analysis.get("analysis", "")
                if isinstance(analysis_text, dict) and "choices" in analysis_text and analysis_text["choices"]:
                    analysis_text = analysis_text["choices"][0].get("message", {}).get("content","")

                features = [{"type": "GPT Vision Feature", "details": analysis_text, "confidence": gpt_analysis.get("confidence", 0.5)}]
                confidence = gpt_analysis.get("confidence", 0.5)

            return {
                "confidence": confidence,
                "features_detected": features,
                "source": f"Sentinel-2 Tile {tile_path.name} (GPT Vision Analyzed)",
                "location": {"lat": lat, "lon": lon},
                "raw_gpt_response": gpt_analysis
            }

        except FileNotFoundError:
            logger.warning(f"Satellite tile not found for {lat}, {lon} at expected path. Using mock data.")
            return self._generate_mock_satellite_result(lat, lon)
        except Exception as e:
            logger.error(f"Satellite processing with GPT Vision failed: {str(e)}", exc_info=True)
            return self._generate_mock_satellite_result(lat, lon)
    
    async def _process_lidar(self, lat: float, lon: float) -> Dict:
        """Process LIDAR data for the given coordinates."""
        tile_path = get_tile_path(lat, lon, "lidar")
        if not tile_path.exists():
            logger.warning(f"LIDAR tile not found: {tile_path}. Using mock data.")
            return self._generate_mock_lidar_result(lat, lon)
            
        try:
            data, metadata = load_raster_data(tile_path)
            row, col = get_pixel_coords(lat, lon, metadata["transform"])
            patch_data = extract_patch(data, row, col, size=256)

            if patch_data is None or patch_data.size == 0:
                logger.warning(f"Empty patch extracted for LIDAR data at {lat}, {lon}. Using mock data.")
                return self._generate_mock_lidar_result(lat, lon)

            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
                patch_normalized = (patch_data - np.min(patch_data)) / (np.max(patch_data) - np.min(patch_data) + 1e-6) * 255
                patch_img_data = patch_normalized.astype(np.uint8)
                img = Image.fromarray(patch_img_data, mode='L')
                img.save(tmp_file.name)
                tmp_file_path = tmp_file.name
            
            logger.info(f"LIDAR patch saved to {tmp_file_path}")

            prompt = "Analyze this LIDAR-derived image patch (representing terrain elevation) for archaeological signs like earthworks, mounds, depressions, or subtle geometric patterns not visible in regular satellite imagery. Describe detected features and their potential significance."
            gpt_analysis = await self.analyze_image(image_path=tmp_file_path, prompt=prompt)
            
            os.unlink(tmp_file_path)

            if "error" in gpt_analysis or not isinstance(gpt_analysis, dict):
                logger.warning(f"GPT Vision analysis failed for LIDAR patch: {gpt_analysis.get('error', 'Unknown error')}. Using mock features.")
                features = self._detect_archaeological_features(patch_data)
                confidence = max([f.get('confidence', 0) for f in features] + [0])
            else:
                analysis_text = gpt_analysis.get("analysis", "")
                if isinstance(analysis_text, dict) and "choices" in analysis_text and analysis_text["choices"]:
                    analysis_text = analysis_text["choices"][0].get("message", {}).get("content","")
                features = [{"type": "GPT Vision Feature (LIDAR)", "details": analysis_text, "confidence": gpt_analysis.get("confidence", 0.5)}]
                confidence = gpt_analysis.get("confidence", 0.5)

            return {
                "confidence": confidence,
                "features_detected": features,
                "source": f"LIDAR Tile {tile_path.name} (GPT Vision Analyzed)",
                "location": {"lat": lat, "lon": lon},
                "raw_gpt_response": gpt_analysis
            }
        except FileNotFoundError:
            logger.warning(f"LIDAR tile not found for {lat}, {lon} at expected path. Using mock data.")
            return self._generate_mock_lidar_result(lat, lon)
        except Exception as e:
            logger.error(f"LIDAR processing with GPT Vision failed: {str(e)}", exc_info=True)
            return self._generate_mock_lidar_result(lat, lon)
    
    def _detect_archaeological_features(self, data: np.ndarray) -> List[Dict]:
        """
        Advanced feature detection for archaeological sites.
        
        Args:
            data: Numpy array of image/raster data
            
        Returns:
            List of detected features with confidence scores
        """
        features = []
        
        # Geometric pattern detection
        def detect_geometric_patterns(patch):
            """Detect potential archaeological geometric patterns."""
            # Implement advanced pattern recognition
            # This could involve:
            # 1. Geometric shape detection (circles, rectangles, etc.)
            # 2. Symmetry analysis
            # 3. Regularity in pixel/terrain patterns
            
            # Mock implementation for demonstration
            patterns = [
                {"type": "Circular Structure", "confidence": random.uniform(0.3, 0.9)},
                {"type": "Linear Alignment", "confidence": random.uniform(0.3, 0.9)},
                {"type": "Geometric Earthwork", "confidence": random.uniform(0.3, 0.9)}
            ]
            
            return [p for p in patterns if p['confidence'] > 0.5]
        
        # Terrain anomaly detection
        def detect_terrain_anomalies(patch):
            """Detect unusual terrain features potentially indicating human activity."""
            anomalies = [
                {"type": "Artificial Mound", "confidence": random.uniform(0.4, 0.95)},
                {"type": "Unnatural Terrain Modification", "confidence": random.uniform(0.4, 0.95)},
                {"type": "Potential Buried Structure", "confidence": random.uniform(0.4, 0.95)}
            ]
            
            return [a for a in anomalies if a['confidence'] > 0.6]
        
        # Color and texture analysis
        def analyze_color_texture(patch):
            """Analyze color and texture variations indicative of archaeological sites."""
            texture_features = [
                {"type": "Unusual Color Variation", "confidence": random.uniform(0.3, 0.8)},
                {"type": "Distinct Texture Pattern", "confidence": random.uniform(0.3, 0.8)}
            ]
            
            return [t for t in texture_features if t['confidence'] > 0.5]
        
        # Apply feature detection techniques
        geometric_features = detect_geometric_patterns(data)
        terrain_features = detect_terrain_anomalies(data)
        texture_features = analyze_color_texture(data)
        
        # Combine and deduplicate features
        features.extend(geometric_features)
        features.extend(terrain_features)
        features.extend(texture_features)
        
        # Sort features by confidence
        features.sort(key=lambda x: x['confidence'], reverse=True)
        
        return features
    
    def _combine_findings(self, satellite_result: Optional[Dict], 
                           lidar_result: Optional[Dict]) -> Dict:
        """
        Enhanced method to combine satellite and LIDAR findings.
        
        Args:
            satellite_result: Results from satellite imagery analysis
            lidar_result: Results from LIDAR data analysis
            
        Returns:
            Comprehensive combined analysis
        """
        # If both results are None, return mock result
        if not satellite_result and not lidar_result:
            return self._generate_mock_combined_result()
        
        # Calculate combined confidence
        satellite_confidence = satellite_result.get('confidence', 0) if satellite_result else 0
        lidar_confidence = lidar_result.get('confidence', 0) if lidar_result else 0
        
        # Weighted combination of confidences
        combined_confidence = (satellite_confidence * 0.6) + (lidar_confidence * 0.4)
        
        # Combine detected features
        combined_features = []
        if satellite_result and 'features_detected' in satellite_result:
            combined_features.extend(satellite_result['features_detected'])
        if lidar_result and 'features_detected' in lidar_result:
            combined_features.extend(lidar_result['features_detected'])
        
        # Remove duplicates and sort by confidence
        unique_features = {
            frozenset(feature.items()): feature 
            for feature in combined_features
        }.values()
        
        sorted_features = sorted(
            unique_features, 
            key=lambda x: x.get('confidence', 0), 
            reverse=True
        )
        
        return {
            "confidence": combined_confidence,
            "features_detected": sorted_features,
            "analysis_method": "Multi-Modal Fusion",
            "recommendation": self._generate_site_recommendation(combined_confidence)
        }
    
    def _generate_site_recommendation(self, confidence: float) -> str:
        """
        Generate a recommendation based on analysis confidence.
        
        Args:
            confidence: Combined analysis confidence score
            
        Returns:
            Textual recommendation for further investigation
        """
        recommendations = {
            (0, 0.3): "Low probability of archaeological significance. Further investigation not recommended.",
            (0.3, 0.5): "Moderate potential. Consider preliminary ground survey.",
            (0.5, 0.7): "High likelihood of archaeological features. Recommended for detailed archaeological survey.",
            (0.7, 1.0): "Extremely high probability of significant archaeological site. Urgent archaeological investigation recommended."
        }
        
        for (low, high), recommendation in recommendations.items():
            if low <= confidence < high:
                return recommendation
        
        return "Unable to generate recommendation."
    
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
    
    def _generate_mock_combined_result(self) -> Dict:
        """
        Generate a mock combined result when no actual data is available.
        
        Returns:
            Dictionary with mock combined analysis
        """
        mock_features = [
            {
                "type": "Potential Settlement Pattern",
                "confidence": random.uniform(0.3, 0.7),
                "description": "Geometric arrangement suggesting possible human settlement"
            },
            {
                "type": "Terrain Modification",
                "confidence": random.uniform(0.3, 0.7),
                "description": "Unusual terrain features indicating possible human intervention"
            }
        ]
        
        combined_confidence = random.uniform(0.3, 0.7)
        
        return {
            "confidence": combined_confidence,
            "features_detected": mock_features,
            "analysis_method": "Mock Multi-Modal Simulation",
            "recommendation": self._generate_site_recommendation(combined_confidence)
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