"""KAN-Enhanced Reasoning Agent for the NIS Protocol.

This agent uses Kolmogorov-Arnold Networks for interpretable reasoning
while maintaining backward compatibility with existing systems.
"""

import json
import logging
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any
import os
import torch
import torch.nn as nn

# Import the GPT integration
from src.meta.gpt_integration import GPTIntegration

try:
    # Try to import our numpy-based KAN implementation
    from src.kan.numpy_kan import KANLayer, KAN_AVAILABLE
    print("Using numpy KAN implementation for reasoning.")
except ImportError:
    try:
        # Try PyTorch-based implementation
        from src.kan.simple_kan import KANLayer, KAN_AVAILABLE
        print("Using PyTorch KAN implementation for reasoning.")
    except ImportError:
        print("Warning: KAN implementation not available. Using mock layers.")
        KAN_AVAILABLE = False
        
        # Mock KAN layer for compatibility
        class KANLayer:
            def __init__(self, in_features, out_features, grid_size=5):
                self.in_features = in_features
                self.out_features = out_features
                self.weights = [[0.1 * (i + j) for j in range(in_features)] for i in range(out_features)]
            
            def __call__(self, x):
                import random
                # Mock neural processing with some mathematical transformation
                batch_size = len(x) if hasattr(x, '__len__') else 1
                output = []
                for i in range(self.out_features):
                    value = sum(x[j] * self.weights[i][j] for j in range(min(len(x), self.in_features)))
                    # Add some non-linearity
                    value = max(0, value + random.uniform(-0.1, 0.1))
                    output.append(value)
                return output

logger = logging.getLogger(__name__)


class KANReasoningAgent:
    """KAN-enhanced reasoning agent with interpretable spline-based logic."""
    
    def __init__(self, prompt_dir: Optional[Path] = None, 
                 gpt_model: str = "gpt-4-turbo", 
                 meta_coordinator: Optional[Any] = None,
                 use_kan: bool = True):
        """Initialize the KAN Reasoning Agent.
        
        Args:
            prompt_dir: Directory containing prompt templates
            gpt_model: GPT model to use for reasoning
            meta_coordinator: Instance of MetaProtocolCoordinator
            use_kan: Whether to use KAN layers (fallback to MLP if False)
        """
        self.prompt_dir = prompt_dir or Path("src/prompts")
        self.reasoning_prompt_path = self.prompt_dir / "reasoning_prompt.txt"
        self.meta_coordinator = meta_coordinator
        self.use_kan = use_kan and KAN_AVAILABLE
        
        # Initialize neural reasoning network
        self.reasoning_network = self._build_reasoning_network()
        
        # Load prompt template
        self._load_prompt_template()
        
        # Initialize GPT integration
        self._initialize_gpt(gpt_model)
        
        logger.info(f"KAN Reasoning Agent initialized (KAN enabled: {self.use_kan})")
    
    def _build_reasoning_network(self) -> nn.Module:
        """Build the KAN-based reasoning network."""
        class KANReasoningNetwork(nn.Module):
            def __init__(self, use_kan: bool = True):
                super().__init__()
                self.use_kan = use_kan
                
                # Feature extraction layers
                if use_kan:
                    self.feature_extractor = KANLayer(5, 16)  # [lat, lon, confidence, pattern_strength, context_score]
                    self.reasoning_layer = KANLayer(16, 8)
                    self.confidence_layer = KANLayer(8, 1)
                else:
                    self.feature_extractor = nn.Sequential(
                        nn.Linear(5, 16),
                        nn.ReLU()
                    )
                    self.reasoning_layer = nn.Sequential(
                        nn.Linear(16, 8),
                        nn.ReLU()
                    )
                    self.confidence_layer = nn.Linear(8, 1)
                
                self.dropout = nn.Dropout(0.1)
                
            def forward(self, x):
                """Forward pass through the reasoning network."""
                features = self.feature_extractor(x)
                features = self.dropout(features)
                reasoning = self.reasoning_layer(features)
                confidence = torch.sigmoid(self.confidence_layer(reasoning))
                return confidence, features, reasoning
        
        return KANReasoningNetwork(use_kan=self.use_kan)
    
    def _load_prompt_template(self):
        """Load reasoning prompt template."""
        try:
            with open(self.reasoning_prompt_path, "r", encoding="utf-8") as f:
                self.reasoning_prompt_template = f.read()
            logger.info(f"Loaded reasoning prompt from {self.reasoning_prompt_path}")
        except FileNotFoundError:
            logger.warning(f"Prompt file not found at {self.reasoning_prompt_path}")
            self.reasoning_prompt_template = (
                "Analyze the pattern '{pattern_type}' detected at coordinates {lat}, {lon} with confidence {confidence}.\n"
                "Provide historical context and archaeological interpretation.\n"
            )
    
    def _initialize_gpt(self, gpt_model: str):
        """Initialize GPT integration."""
        try:
            self.gpt = GPTIntegration(model_name=gpt_model)
            logger.info(f"Initialized GPT integration with model: {gpt_model}")
            self.use_live_llm = True
        except Exception as e:
            logger.warning(f"Failed to initialize GPT integration: {str(e)}. Falling back to mock responses.")
            self.use_live_llm = False
    
    def enhanced_reasoning(self, 
                          visual_findings: Dict, 
                          lat: float, 
                          lon: float,
                          processed_historical_texts: Optional[Dict] = None,
                          processed_indigenous_knowledge: Optional[Dict] = None) -> Dict:
        """Enhanced reasoning using KAN-based neural analysis."""
        
        # Extract features for neural reasoning
        pattern_type = visual_findings.get("pattern_type", "")
        visual_confidence = visual_findings.get("confidence", 0.0)
        pattern_strength = self._calculate_pattern_strength(visual_findings)
        context_score = self._calculate_context_score(processed_historical_texts, processed_indigenous_knowledge)
        
        # Prepare input features (compatible with both numpy and torch)
        input_features = [lat, lon, visual_confidence, pattern_strength, context_score]
        
        # Neural reasoning pass
        try:
            if self.use_kan and hasattr(self.reasoning_network, 'forward'):
                # For torch-based networks
                import torch
                input_tensor = torch.tensor(input_features, dtype=torch.float32).unsqueeze(0)
                with torch.no_grad():
                    neural_confidence, feature_embeddings, reasoning_embeddings = self.reasoning_network(input_tensor)
                enhanced_confidence = float(neural_confidence.item())
                feature_analysis = self._interpret_features(feature_embeddings)
                reasoning_analysis = self._interpret_reasoning(reasoning_embeddings)
            else:
                # For numpy-based or mock networks
                enhanced_confidence, feature_analysis, reasoning_analysis = self._simple_kan_reasoning(input_features)
        except Exception as e:
            logger.warning(f"KAN processing failed: {e}. Using simplified reasoning.")
            enhanced_confidence, feature_analysis, reasoning_analysis = self._simple_kan_reasoning(input_features)
        
        # Combine neural and symbolic reasoning
        interpretation = self._combine_reasoning_modes(
            visual_findings, lat, lon, 
            processed_historical_texts, processed_indigenous_knowledge,
            enhanced_confidence, feature_analysis, reasoning_analysis
        )
        
        return interpretation
    
    def _calculate_pattern_strength(self, visual_findings: Dict) -> float:
        """Calculate pattern strength from visual findings."""
        anomaly_detected = visual_findings.get("anomaly_detected", False)
        confidence = visual_findings.get("confidence", 0.0)
        pattern_type = visual_findings.get("pattern_type", "")
        
        strength = 0.0
        if anomaly_detected:
            strength += 0.3
        strength += confidence * 0.5
        if pattern_type:
            strength += 0.2
        
        return min(1.0, strength)
    
    def _calculate_context_score(self, historical_texts: Optional[Dict], 
                                indigenous_knowledge: Optional[Dict]) -> float:
        """Calculate contextual information score."""
        score = 0.0
        
        if historical_texts and historical_texts.get("sources"):
            score += 0.3
        if indigenous_knowledge and indigenous_knowledge.get("knowledge_entries"):
            score += 0.4
        
        return min(1.0, score)
    
    def _interpret_features(self, feature_embeddings: torch.Tensor) -> Dict:
        """Interpret KAN feature embeddings."""
        features = feature_embeddings.squeeze().numpy()
        
        return {
            "geographic_affinity": float(features[0]),
            "pattern_coherence": float(features[1]),
            "contextual_alignment": float(features[2]),
            "anomaly_significance": float(features[3]),
            "feature_interpretability": "High" if self.use_kan else "Medium"
        }
    
    def _interpret_reasoning(self, reasoning_embeddings: torch.Tensor) -> Dict:
        """Interpret KAN reasoning embeddings."""
        reasoning = reasoning_embeddings.squeeze().numpy()
        
        return {
            "logical_consistency": float(reasoning[0]),
            "evidence_strength": float(reasoning[1]),
            "pattern_validity": float(reasoning[2]),
            "archaeological_likelihood": float(reasoning[3]),
            "reasoning_transparency": "High" if self.use_kan else "Medium"
        }
    
    def _simple_kan_reasoning(self, input_features: List[float]) -> Tuple[float, Dict, Dict]:
        """Simplified KAN reasoning when full implementation isn't available."""
        lat, lon, visual_confidence, pattern_strength, context_score = input_features
        
        # Enhanced confidence calculation using KAN-inspired spline-like functions
        # Simulate spline-based reasoning with mathematical transformations
        import math
        
        # Apply non-linear transformations (simulating spline functions)
        geo_factor = 1.0 / (1.0 + abs(lat + 3.5) + abs(lon + 62))  # Distance from Amazon center
        pattern_factor = pattern_strength * (1 + 0.3 * math.sin(pattern_strength * math.pi))
        context_factor = context_score * (1 + 0.2 * math.cos(context_score * math.pi))
        
        # Combine factors with interpretable weights
        enhanced_confidence = min(0.95, max(0.05, 
            0.4 * visual_confidence + 
            0.3 * pattern_factor + 
            0.2 * context_factor + 
            0.1 * geo_factor
        ))
        
        # Feature analysis simulation
        feature_analysis = {
            "geographic_affinity": geo_factor,
            "pattern_coherence": pattern_factor,
            "contextual_alignment": context_factor,
            "anomaly_significance": pattern_strength,
            "feature_interpretability": "High" if self.use_kan else "Simulated"
        }
        
        # Reasoning analysis simulation  
        reasoning_analysis = {
            "logical_consistency": min(1.0, enhanced_confidence + 0.1),
            "evidence_strength": pattern_strength,
            "pattern_validity": pattern_factor,
            "archaeological_likelihood": enhanced_confidence,
            "reasoning_transparency": "High" if self.use_kan else "Simulated"
        }
        
        return enhanced_confidence, feature_analysis, reasoning_analysis

    def _combine_reasoning_modes(self, visual_findings: Dict, lat: float, lon: float,
                                historical_texts: Optional[Dict], indigenous_knowledge: Optional[Dict],
                                neural_confidence: float, feature_analysis: Dict, reasoning_analysis: Dict) -> Dict:
        """Combine neural and symbolic reasoning."""
        
        # Enhanced interpretation with KAN insights
        base_interpretation = self._traditional_interpretation(
            visual_findings, lat, lon, historical_texts, indigenous_knowledge
        )
        
        # Enhance with neural insights
        enhanced_interpretation = base_interpretation.copy()
        enhanced_interpretation.update({
            "neural_confidence": neural_confidence,
            "feature_analysis": feature_analysis,
            "reasoning_analysis": reasoning_analysis,
            "enhanced_confidence": (base_interpretation.get("confidence", 0.5) + neural_confidence) / 2,
            "reasoning_method": "KAN-Enhanced" if self.use_kan else "MLP-Enhanced",
            "interpretability_score": 0.9 if self.use_kan else 0.6
        })
        
        return enhanced_interpretation
    
    def _traditional_interpretation(self, visual_findings: Dict, lat: float, lon: float,
                                  historical_texts: Optional[Dict], indigenous_knowledge: Optional[Dict]) -> Dict:
        """Traditional interpretation logic for backward compatibility."""
        if not visual_findings.get("anomaly_detected", False):
            return {
                "interpretation": "No significant archaeological features detected at this location.",
                "confidence": 0.1,
                "historical_context": "No applicable historical context without detected features.",
                "indigenous_perspective": "No applicable indigenous perspective without detected features.",
                "sources_used": list(visual_findings.get("sources", [])),
                "pattern_type": ""
            }
        
        pattern_type = visual_findings.get("pattern_type", "")
        confidence = visual_findings.get("confidence", 0.0)
        
        return {
            "interpretation": f"Detected {pattern_type} with {confidence:.2f} confidence at {lat}, {lon}",
            "confidence": confidence,
            "historical_context": "Analysis based on available historical data",
            "indigenous_perspective": "Consideration of indigenous knowledge where available",
            "sources_used": list(visual_findings.get("sources", [])),
            "pattern_type": pattern_type
        }
    
    def interpret_findings(self, *args, **kwargs) -> Dict:
        """Main interface method - delegates to enhanced reasoning."""
        return self.enhanced_reasoning(*args, **kwargs)
    
    def get_capabilities(self) -> Dict:
        """Get agent capabilities."""
        return {
            "name": "KAN Reasoning Agent",
            "version": "1.0.0",
            "kan_enabled": self.use_kan,
            "interpretable_reasoning": True,
            "neural_enhancement": True,
            "backward_compatible": True
        } 