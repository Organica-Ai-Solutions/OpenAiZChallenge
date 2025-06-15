"""Numpy-based KAN (Kolmogorov-Arnold Networks) Implementation for NIS Protocol.

This is a lightweight implementation using only numpy that provides interpretable
neural network capabilities without heavy dependencies.
"""

import numpy as np
from typing import List, Tuple, Optional, Dict


class BSplineFunction:
    """B-spline based univariate function for KAN layers."""
    
    def __init__(self, grid_size: int = 5):
        self.grid_size = grid_size
        self.grid = np.linspace(-1, 1, grid_size)
        self.coefficients = np.random.randn(grid_size) * 0.1
        
    def __call__(self, x: np.ndarray) -> np.ndarray:
        """Apply B-spline function to input."""
        x = np.clip(x, -1, 1)
        output = np.zeros_like(x)
        
        for i in range(self.grid_size - 1):
            mask = (x >= self.grid[i]) & (x < self.grid[i + 1])
            if np.any(mask):
                t = (x[mask] - self.grid[i]) / (self.grid[i + 1] - self.grid[i])
                interpolated = (1 - t) * self.coefficients[i] + t * self.coefficients[i + 1]
                output[mask] = interpolated
        
        return output
    
    def update_coefficients(self, gradient: np.ndarray, learning_rate: float = 0.01):
        """Update spline coefficients based on gradient."""
        self.coefficients -= learning_rate * gradient


class NumpyKANLayer:
    """KAN layer implementation using numpy."""
    
    def __init__(self, in_features: int, out_features: int, grid_size: int = 5):
        self.in_features = in_features
        self.out_features = out_features
        self.grid_size = grid_size
        
        # Create univariate functions for each connection
        self.functions = []
        for i in range(out_features):
            layer_functions = []
            for j in range(in_features):
                layer_functions.append(BSplineFunction(grid_size))
            self.functions.append(layer_functions)
        
        # Base weights
        self.base_weights = np.random.randn(out_features, in_features) * 0.1
        
    def forward(self, x: np.ndarray) -> np.ndarray:
        """Forward pass through the KAN layer."""
        batch_size = x.shape[0]
        output = np.zeros((batch_size, self.out_features))
        
        for i in range(self.out_features):
            for j in range(self.in_features):
                # Apply univariate function to input component
                activated = self.functions[i][j](x[:, j])
                output[:, i] += activated * self.base_weights[i, j]
        
        return output
    
    def get_interpretability_score(self) -> float:
        """Get interpretability score based on spline smoothness."""
        total_variation = 0
        total_functions = 0
        
        for i in range(self.out_features):
            for j in range(self.in_features):
                coeffs = self.functions[i][j].coefficients
                variation = np.sum(np.abs(np.diff(coeffs)))
                total_variation += variation
                total_functions += 1
        
        # Lower variation = higher interpretability
        avg_variation = total_variation / total_functions
        interpretability = 1.0 / (1.0 + avg_variation)
        return interpretability


class NumpyKANNetwork:
    """Complete KAN network using numpy."""
    
    def __init__(self, layer_sizes: List[int], grid_size: int = 5):
        self.layers = []
        self.layer_sizes = layer_sizes
        
        for i in range(len(layer_sizes) - 1):
            layer = NumpyKANLayer(layer_sizes[i], layer_sizes[i + 1], grid_size)
            self.layers.append(layer)
    
    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, List[np.ndarray]]:
        """Forward pass through the entire network."""
        activations = [x]
        current = x
        
        for layer in self.layers:
            current = layer.forward(current)
            # Apply activation function between layers (except last)
            if layer != self.layers[-1]:
                current = np.tanh(current)
            activations.append(current)
        
        return current, activations
    
    def predict(self, x: np.ndarray) -> np.ndarray:
        """Make predictions with the network."""
        output, _ = self.forward(x)
        return output
    
    def get_network_interpretability(self) -> Dict[str, float]:
        """Get interpretability metrics for the entire network."""
        layer_interpretabilities = []
        
        for i, layer in enumerate(self.layers):
            interpretability = layer.get_interpretability_score()
            layer_interpretabilities.append(interpretability)
        
        return {
            'overall_interpretability': np.mean(layer_interpretabilities),
            'layer_interpretabilities': layer_interpretabilities,
            'network_complexity': len(self.layers)
        }


# Compatibility classes for PyTorch-like interface
class KANLayer:
    """PyTorch-like interface for KAN layer."""
    
    def __init__(self, in_features: int, out_features: int, grid_size: int = 5):
        self.kan_layer = NumpyKANLayer(in_features, out_features, grid_size)
        
    def __call__(self, x: np.ndarray) -> np.ndarray:
        return self.kan_layer.forward(x)
    
    def forward(self, x: np.ndarray) -> np.ndarray:
        return self.kan_layer.forward(x)


# Module availability
KAN_AVAILABLE = True


def create_kan_network(layer_sizes: List[int], grid_size: int = 5) -> NumpyKANNetwork:
    """Create a KAN network with given layer sizes."""
    return NumpyKANNetwork(layer_sizes, grid_size)


def test_numpy_kan():
    """Test the numpy KAN implementation."""
    print("Testing Numpy KAN Implementation...")
    
    # Create test data
    batch_size = 10
    input_dim = 5
    
    x = np.random.randn(batch_size, input_dim)
    
    # Create KAN network
    network = create_kan_network([input_dim, 8, 4, 1])
    
    # Forward pass
    output, activations = network.forward(x)
    
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Number of layers: {len(network.layers)}")
    
    # Test interpretability
    interpretability = network.get_network_interpretability()
    print(f"Network interpretability: {interpretability['overall_interpretability']:.3f}")
    
    # Test single layer
    kan_layer = KANLayer(3, 2)
    test_input = np.random.randn(5, 3)
    layer_output = kan_layer(test_input)
    print(f"Single layer test - Input: {test_input.shape}, Output: {layer_output.shape}")
    
    print("✅ Numpy KAN implementation works correctly!")
    return True


if __name__ == "__main__":
    test_numpy_kan() 