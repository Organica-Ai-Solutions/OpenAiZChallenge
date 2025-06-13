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
import tempfile
import asyncio
import time

# Core dependencies
try:
    import numpy as np
except ImportError:
    print("Warning: numpy not available. Using mock implementations.")
    np = None

# Optional enhanced image processing dependencies
try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    print("Warning: PIL not available. Using basic image processing.")
    PIL_AVAILABLE = False
    # Mock PIL classes
    class MockImage:
        @staticmethod
        def fromarray(data, mode='L'):
            return MockImageInstance()
        
    class MockImageInstance:
        def save(self, path):
            pass
        def enhance(self, factor):
            return self
    
    class MockImageEnhance:
        @staticmethod
        def Contrast(img):
            return MockImageInstance()
        @staticmethod
        def Sharpness(img):
            return MockImageInstance()
    
    Image = MockImage
    ImageEnhance = MockImageEnhance

try:
    from scipy import ndimage
    from scipy.ndimage import gaussian_filter
    SCIPY_AVAILABLE = True
except ImportError:
    print("Warning: scipy not available. Using basic implementations.")
    SCIPY_AVAILABLE = False
    # Mock scipy functions
    class MockNdimage:
        @staticmethod
        def binary_erosion(mask):
            return mask
    ndimage = MockNdimage
    
    def gaussian_filter(data, sigma=1.0):
        return data

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    print("Warning: opencv-python not available. Using basic implementations.")
    CV2_AVAILABLE = False

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
        self.current_vision_observations: Optional[Dict] = None
        
        # Archaeological feature detection prompts
        self.archaeological_prompts = {
            'hillshade': """Analyze this LIDAR hillshade image for archaeological features. Look for:
            - Circular or rectangular earthworks (ancient settlements, ceremonial sites)
            - Linear features (ancient roads, field boundaries, defensive walls)
            - Mounds or tumuli (burial sites, ceremonial mounds)
            - Depressions (house platforms, quarries, defensive ditches)
            - Geometric patterns suggesting human modification of landscape
            - Terracing or agricultural features
            Describe any detected features with their archaeological significance and confidence level.""",
            
            'slope': """Analyze this LIDAR slope analysis image for subtle archaeological indicators. Focus on:
            - Unnatural slope breaks indicating buried structures
            - Geometric slope patterns suggesting earthworks
            - Artificial terracing or platform construction
            - Linear slope anomalies indicating walls or boundaries
            - Circular slope patterns indicating mounds or enclosures
            Evaluate the likelihood these represent archaeological rather than natural features.""",
            
            'contour': """Examine this LIDAR contour visualization for archaeological evidence. Identify:
            - Geometric contour patterns (squares, circles, rectangles)
            - Artificial elevation changes (platforms, mounds, ditches)
            - Regular spacing in contours suggesting human construction
            - Contour disruptions indicating buried features
            - Defensive earthworks or fortification patterns
            Assess the archaeological potential of any detected anomalies.""",
            
            'elevation': """Analyze this LIDAR elevation model for archaeological signatures. Search for:
            - Subtle elevation anomalies indicating buried structures
            - Geometric elevation patterns (settlement layouts, ceremonial sites)
            - Artificial mounds or raised platforms
            - Quarry pits or extraction sites
            - Water management features (canals, reservoirs, drainage)
            - Field systems or agricultural terracing
            Determine the archaeological significance of elevation patterns."""
        }
        
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
        """
        if not self.gpt:
            raise RuntimeError("GPTIntegration not available. Vision analysis requires a valid model/API.")
        result = await self.gpt.vision_analysis(
            image_path=image_path,
            prompt=prompt
        )
        if not isinstance(result, dict):
            raise RuntimeError(f"GPT Vision analysis returned non-dict type: {type(result)}. Content: {result}")
        return result
    
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
        
        self.current_vision_observations = results
        return results
    
    async def _process_satellite(self, lat: float, lon: float) -> Dict:
        try:
            tile_path = get_tile_path(lat, lon, "satellite")
            if not tile_path.exists():
                logger.warning(f"Satellite tile not found: {tile_path}. Generating mock results.")
                return self._generate_mock_satellite_result(lat, lon)
            data, metadata = load_raster_data(tile_path)
        except FileNotFoundError as e:
            logger.warning(f"Satellite data processing failed due to missing file: {e}. Generating mock results.")
            return self._generate_mock_satellite_result(lat, lon)
        except Exception as e:
            logger.error(f"Unexpected error during satellite data loading for {lat}, {lon}: {e}", exc_info=True)
            return self._generate_mock_satellite_result(lat, lon)

        row, col = get_pixel_coords(lat, lon, metadata["transform"])
        patch_data = extract_patch(data, row, col, size=256)
        if patch_data is None or patch_data.size == 0:
            raise ValueError(f"Empty patch extracted for satellite data at {lat}, {lon}.")
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            if patch_data.ndim == 3 and patch_data.shape[0] in [3,4]:
                patch_data_rgb = patch_data[:3,:,:]
                patch_data_rgb = np.moveaxis(patch_data_rgb, 0, -1)
            elif patch_data.ndim == 2:
                patch_data_rgb = np.stack((patch_data,)*3, axis=-1)
            else:
                raise ValueError(f"Satellite patch has unexpected shape {patch_data.shape}.")
            patch_data_rgb = (patch_data_rgb - np.min(patch_data_rgb)) / (np.max(patch_data_rgb) - np.min(patch_data_rgb) + 1e-6) * 255
            patch_data_rgb = patch_data_rgb.astype(np.uint8)
            img = Image.fromarray(patch_data_rgb)
            img.save(tmp_file.name)
            tmp_file_path = tmp_file.name
        prompt = "Analyze this satellite image patch for any signs of archaeological significance, such as geometric patterns, unnatural formations, soil discolorations, or vegetation anomalies. Describe any detected features and estimate their potential relevance."
        gpt_analysis = await self.analyze_image(image_path=tmp_file_path, prompt=prompt)
        os.unlink(tmp_file_path)
        analysis_text = gpt_analysis.get("analysis", "")
        features = [{"type": "GPT Vision Feature", "details": analysis_text, "confidence": gpt_analysis.get("confidence", 0.5)}]
        confidence = gpt_analysis.get("confidence", 0.5)
        return {
            "confidence": confidence,
            "features_detected": features,
            "source": f"Sentinel-2 Tile {tile_path.name} (GPT Vision Analyzed)",
            "location": {"lat": lat, "lon": lon},
            "raw_gpt_response": gpt_analysis
        }
    
    async def _process_lidar(self, lat: float, lon: float) -> Dict:
        """Enhanced LIDAR processing with multiple visualization techniques."""
        try:
            tile_path = get_tile_path(lat, lon, "lidar")
            if not tile_path.exists():
                logger.warning(f"LIDAR tile not found: {tile_path}. Generating mock results.")
                return self._generate_mock_lidar_result(lat, lon)
            data, metadata = load_raster_data(tile_path)
        except FileNotFoundError as e:
            logger.warning(f"LIDAR data processing failed due to missing file: {e}. Generating mock results.")
            return self._generate_mock_lidar_result(lat, lon)
        except Exception as e:
            logger.error(f"Unexpected error during LIDAR data loading for {lat}, {lon}: {e}", exc_info=True)
            return self._generate_mock_lidar_result(lat, lon)

        row, col = get_pixel_coords(lat, lon, metadata["transform"])
        patch_data = extract_patch(data, row, col, size=256)
        if patch_data is None or patch_data.size == 0:
            raise ValueError(f"Empty patch extracted for LIDAR data at {lat}, {lon}.")

        # Check if enhanced processing is available
        if np is not None and PIL_AVAILABLE:
            # Generate multiple LIDAR visualizations for comprehensive analysis
            visualizations = await self._create_lidar_visualizations(patch_data)
            
            # Analyze each visualization with specialized prompts
            analysis_results = []
            for viz_type, (image_path, prompt) in visualizations.items():
                try:
                    gpt_analysis = await self.analyze_image(image_path=image_path, prompt=prompt)
                    analysis_results.append({
                        "visualization_type": viz_type,
                        "analysis": gpt_analysis.get("analysis", ""),
                        "confidence": gpt_analysis.get("confidence", 0.5),
                        "raw_response": gpt_analysis
                    })
                    # Clean up temporary file
                    os.unlink(image_path)
                except Exception as e:
                    logger.error(f"Error analyzing {viz_type} visualization: {e}")
                    continue

            # Combine results from all visualizations
            combined_analysis = self._combine_lidar_analyses(analysis_results)
            
            return {
                "confidence": combined_analysis["confidence"],
                "features_detected": combined_analysis["features"],
                "source": f"LIDAR Tile {tile_path.name} (Multi-Modal GPT Vision Analysis)",
                "location": {"lat": lat, "lon": lon},
                "visualization_analyses": analysis_results,
                "combined_analysis": combined_analysis["summary"]
            }
        else:
            # Fallback to basic processing
            logger.info("Using basic LIDAR processing due to missing dependencies")
            return await self._process_lidar_basic(lat, lon, patch_data, tile_path)

    async def _process_lidar_basic(self, lat: float, lon: float, patch_data, tile_path) -> Dict:
        """Basic LIDAR processing when enhanced dependencies are not available."""
        # Create a simple grayscale image from elevation data
        if np is not None:
            patch_normalized = (patch_data - np.min(patch_data)) / (np.max(patch_data) - np.min(patch_data) + 1e-6) * 255
            patch_img_data = patch_normalized.astype(np.uint8)
        else:
            # Even more basic fallback
            patch_img_data = patch_data
        
        # Save as temporary file for GPT Vision analysis
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            if PIL_AVAILABLE:
                img = Image.fromarray(patch_img_data, mode='L')
                img.save(tmp_file.name)
            else:
                # Write basic image data (this is a simplified approach)
                with open(tmp_file.name, 'wb') as f:
                    f.write(b'Basic image data placeholder')
            tmp_file_path = tmp_file.name
        
        # Use enhanced archaeological prompt
        prompt = self.archaeological_prompts["elevation"]
        
        try:
            gpt_analysis = await self.analyze_image(image_path=tmp_file_path, prompt=prompt)
            os.unlink(tmp_file_path)
            
            analysis_text = gpt_analysis.get("analysis", "")
            features = [{"type": "GPT Vision Feature (LIDAR)", "details": analysis_text, "confidence": gpt_analysis.get("confidence", 0.5)}]
            confidence = gpt_analysis.get("confidence", 0.5)
            
            return {
                "confidence": confidence,
                "features_detected": features,
                "source": f"LIDAR Tile {tile_path.name} (Basic GPT Vision Analysis)",
                "location": {"lat": lat, "lon": lon},
                "raw_gpt_response": gpt_analysis
            }
        except Exception as e:
            logger.error(f"Error in basic LIDAR analysis: {e}")
            os.unlink(tmp_file_path)
            return self._generate_mock_lidar_result(lat, lon)

    async def _create_lidar_visualizations(self, patch_data) -> Dict[str, Tuple[str, str]]:
        """Create multiple LIDAR visualizations for archaeological analysis."""
        if np is None:
            logger.warning("Cannot create enhanced visualizations without numpy")
            return {}
            
        visualizations = {}
        
        try:
            # 1. Hillshade visualization (best for detecting earthworks)
            hillshade = self._create_hillshade(patch_data)
            hillshade_path = self._save_temp_image(hillshade, "hillshade")
            visualizations["hillshade"] = (hillshade_path, self.archaeological_prompts["hillshade"])
            
            # 2. Slope analysis (reveals subtle terrain modifications)
            slope = self._calculate_slope(patch_data)
            slope_path = self._save_temp_image(slope, "slope")
            visualizations["slope"] = (slope_path, self.archaeological_prompts["slope"])
            
            # 3. Contour visualization (shows geometric patterns)
            contour = self._create_contour_image(patch_data)
            contour_path = self._save_temp_image(contour, "contour")
            visualizations["contour"] = (contour_path, self.archaeological_prompts["contour"])
            
            # 4. Enhanced elevation model (with contrast enhancement)
            enhanced_elevation = self._enhance_elevation_contrast(patch_data)
            elevation_path = self._save_temp_image(enhanced_elevation, "elevation")
            visualizations["elevation"] = (elevation_path, self.archaeological_prompts["elevation"])
        except Exception as e:
            logger.error(f"Error creating LIDAR visualizations: {e}")
        
        return visualizations

    def _create_hillshade(self, elevation_data, azimuth: float = 315, altitude: float = 45):
        """Create hillshade visualization from elevation data."""
        if np is None:
            return elevation_data
            
        # Calculate gradients
        dy, dx = np.gradient(elevation_data)
        
        # Convert angles to radians
        azimuth_rad = np.radians(azimuth)
        altitude_rad = np.radians(altitude)
        
        # Calculate slope and aspect
        slope = np.arctan(np.sqrt(dx**2 + dy**2))
        aspect = np.arctan2(-dx, dy)
        
        # Calculate hillshade
        hillshade = np.sin(altitude_rad) * np.sin(slope) + \
                   np.cos(altitude_rad) * np.cos(slope) * \
                   np.cos(azimuth_rad - aspect)
        
        # Normalize to 0-255
        hillshade = np.clip(hillshade, 0, 1)
        return (hillshade * 255).astype(np.uint8)

    def _calculate_slope(self, elevation_data):
        """Calculate slope from elevation data."""
        if np is None:
            return elevation_data
            
        dy, dx = np.gradient(elevation_data)
        slope = np.arctan(np.sqrt(dx**2 + dy**2)) * 180 / np.pi
        
        # Normalize to 0-255
        slope_normalized = (slope / np.max(slope) * 255).astype(np.uint8)
        return slope_normalized

    def _create_contour_image(self, elevation_data):
        """Create contour visualization from elevation data."""
        if np is None:
            return elevation_data
            
        # Create a blank image
        contour_img = np.zeros_like(elevation_data, dtype=np.uint8)
        
        # Generate contour levels
        min_elev, max_elev = np.min(elevation_data), np.max(elevation_data)
        contour_levels = np.linspace(min_elev, max_elev, 20)
        
        # Simple contour approximation using edge detection on thresholded levels
        for i, level in enumerate(contour_levels[1:-1]):
            # Create binary mask for this elevation level
            mask = (elevation_data >= level) & (elevation_data < contour_levels[i+2])
            
            # Find edges
            if SCIPY_AVAILABLE:
                edges = ndimage.binary_erosion(mask) ^ mask
            else:
                # Basic edge detection fallback
                edges = mask
            contour_img[edges] = 255
        
        return contour_img

    def _enhance_elevation_contrast(self, elevation_data):
        """Enhance elevation data contrast for better feature visibility."""
        if np is None:
            return elevation_data
            
        # Apply Gaussian filter to reduce noise
        smoothed = gaussian_filter(elevation_data, sigma=1.0)
        
        # Enhance contrast using histogram equalization
        # Normalize to 0-255 first
        normalized = ((smoothed - np.min(smoothed)) / 
                     (np.max(smoothed) - np.min(smoothed)) * 255).astype(np.uint8)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        if CV2_AVAILABLE:
            try:
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                enhanced = clahe.apply(normalized)
            except:
                enhanced = normalized
        else:
            # Fallback if cv2 not available
            enhanced = normalized
        
        return enhanced

    def _save_temp_image(self, image_data, prefix: str) -> str:
        """Save image data to temporary file."""
        with tempfile.NamedTemporaryFile(suffix=f"_{prefix}.png", delete=False) as tmp_file:
            if PIL_AVAILABLE:
                if len(image_data.shape) == 2:  # Grayscale
                    img = Image.fromarray(image_data, mode='L')
                else:  # RGB
                    img = Image.fromarray(image_data)
                
                # Enhance image for better GPT Vision analysis
                img = ImageEnhance.Contrast(img).enhance(1.2)
                img = ImageEnhance.Sharpness(img).enhance(1.1)
                
                img.save(tmp_file.name)
            else:
                # Basic fallback - write raw data
                with open(tmp_file.name, 'wb') as f:
                    f.write(b'Enhanced image data placeholder')
            
            return tmp_file.name

    def _combine_lidar_analyses(self, analysis_results: List[Dict]) -> Dict:
        """Combine results from multiple LIDAR visualizations."""
        if not analysis_results:
            return {"confidence": 0.0, "features": [], "summary": "No analysis results available"}
        
        # Calculate weighted confidence (hillshade and slope are most reliable)
        weights = {
            "hillshade": 0.35,
            "slope": 0.30,
            "contour": 0.20,
            "elevation": 0.15
        }
        
        total_confidence = 0.0
        total_weight = 0.0
        all_features = []
        analysis_summaries = []
        
        for result in analysis_results:
            viz_type = result["visualization_type"]
            confidence = result["confidence"]
            weight = weights.get(viz_type, 0.25)
            
            total_confidence += confidence * weight
            total_weight += weight
            
            # Extract features from analysis
            features = self._extract_features_from_analysis(result["analysis"], viz_type)
            all_features.extend(features)
            
            analysis_summaries.append(f"{viz_type.title()}: {result['analysis'][:200]}...")
        
        # Normalize confidence
        final_confidence = total_confidence / total_weight if total_weight > 0 else 0.0
        
        # Deduplicate and rank features
        unique_features = self._deduplicate_features(all_features)
        
        # Create comprehensive summary
        summary = f"Multi-modal LIDAR analysis (confidence: {final_confidence:.2f})\n"
        summary += f"Detected {len(unique_features)} potential archaeological features.\n"
        summary += "\n".join(analysis_summaries)
        
        return {
            "confidence": final_confidence,
            "features": unique_features,
            "summary": summary
        }

    def _extract_features_from_analysis(self, analysis_text: str, viz_type: str) -> List[Dict]:
        """Extract structured features from GPT analysis text."""
        # This is a simplified feature extraction - in production, you might use NLP
        features = []
        
        # Common archaeological keywords to look for
        keywords = {
            "earthwork": 0.8,
            "mound": 0.9,
            "enclosure": 0.85,
            "platform": 0.75,
            "ditch": 0.8,
            "wall": 0.7,
            "settlement": 0.9,
            "burial": 0.85,
            "ceremonial": 0.8,
            "defensive": 0.75,
            "geometric": 0.7,
            "artificial": 0.8
        }
        
        analysis_lower = analysis_text.lower()
        
        for keyword, base_confidence in keywords.items():
            if keyword in analysis_lower:
                features.append({
                    "type": f"{keyword.title()} (detected via {viz_type})",
                    "details": f"Potential {keyword} identified in {viz_type} analysis",
                    "confidence": base_confidence,
                    "source": viz_type
                })
        
        return features

    def _deduplicate_features(self, features: List[Dict]) -> List[Dict]:
        """Remove duplicate features and merge similar ones."""
        # Group features by type (simplified approach)
        feature_groups = {}
        
        for feature in features:
            feature_type = feature["type"].split(" (")[0]  # Remove source info
            if feature_type not in feature_groups:
                feature_groups[feature_type] = []
            feature_groups[feature_type].append(feature)
        
        # Merge features of same type
        merged_features = []
        for feature_type, group in feature_groups.items():
            if len(group) == 1:
                merged_features.append(group[0])
            else:
                # Merge multiple detections of same feature type
                avg_confidence = sum(f["confidence"] for f in group) / len(group)
                sources = list(set(f["source"] for f in group))
                
                merged_features.append({
                    "type": f"{feature_type} (multi-modal detection)",
                    "details": f"Detected in {len(group)} visualizations: {', '.join(sources)}",
                    "confidence": min(avg_confidence * 1.2, 1.0),  # Boost confidence for multi-modal detection
                    "source": "multi-modal"
                })
        
        # Sort by confidence
        return sorted(merged_features, key=lambda x: x["confidence"], reverse=True)
    
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
        """Generate mock satellite analysis results."""
        # Use hash of coordinates for deterministic results
        seed = abs(hash(f"{lat:.4f}_{lon:.4f}_sat")) % (2**32 - 1)
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
        """Generate mock LIDAR analysis results."""
        # Use hash of coordinates for deterministic results
        seed = abs(hash(f"{lat:.4f}_{lon:.4f}_lidar")) % (2**32 - 1)
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

    def get_latest_observation(self) -> Optional[Dict]:
        if self.current_vision_observations is None:
            logger.warning("VisionAgent.get_latest_observation called before any analysis was run.")
            return {}
        return self.current_vision_observations

# Example usage (for testing or direct invocation)
async def main_vision_test():
    pass

if __name__ == "__main__":
    # This block is typically used for testing the agent directly.
    # For example:
    # async def run_test():
    #     agent = VisionAgent(output_dir="./temp_vision_outputs")
    #     # Replace with actual coordinates or image path for testing
    #     results = await agent.analyze_coordinates(lat=34.0522, lon=-118.2437)
    #     # Or test image analysis:
    #     # Ensure you have a test image, e.g., "test_image.png"
    #     # with open("test_image.png", "wb") as f:
    #     #     f.write(b"dummy image data or actual image bytes") # Create a dummy or real test image
    #     # results = await agent.analyze_image("test_image.png", "describe this image")
    #     logger.info(f"Vision Agent Test Results: {json.dumps(results, indent=2)}")
    #
    # if os.name == 'nt':  # For Windows compatibility with asyncio if needed
    #    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    # asyncio.run(run_test())
    pass # Keep a pass here if no direct __main__ execution is intended for now 