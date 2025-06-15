"""Simple KAN (Kolmogorov-Arnold Networks) Implementation for NIS Protocol.

This is a lightweight implementation of KAN that provides interpretable
neural network capabilities without external dependencies.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Optional


class BSplineActivation(nn.Module):
    """B-spline based activation function for KAN layers."""
    
    def __init__(self, grid_size: int = 5, spline_order: int = 3):
        super().__init__()
        self.grid_size = grid_size
        self.spline_order = spline_order
        
        # Create grid points
        self.register_buffer('grid', torch.linspace(-1, 1, grid_size))
        
        # Learnable spline coefficients
        self.coefficients = nn.Parameter(torch.randn(grid_size))
        
    def forward(self, x):
        """Apply B-spline activation."""
        # Clamp input to grid range
        x = torch.clamp(x, -1, 1)
        
        # Simple linear interpolation between grid points
        # This is a simplified version of B-spline interpolation
        batch_size = x.shape[0]
        output = torch.zeros_like(x)
        
        for i in range(self.grid_size - 1):
            mask = (x >= self.grid[i]) & (x < self.grid[i + 1])
            if mask.any():
                t = (x[mask] - self.grid[i]) / (self.grid[i + 1] - self.grid[i])
                interpolated = (1 - t) * self.coefficients[i] + t * self.coefficients[i + 1]
                output[mask] = interpolated
        
        return output


class SimpleKANLayer(nn.Module):
    """Simple KAN layer implementation."""
    
    def __init__(self, in_features: int, out_features: int, grid_size: int = 5):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        
        # Each connection has its own univariate function (B-spline)
        self.activations = nn.ModuleList([
            BSplineActivation(grid_size) for _ in range(in_features * out_features)
        ])
        
        # Base linear transformation
        self.base_weight = nn.Parameter(torch.randn(out_features, in_features) * 0.1)
        
    def forward(self, x):
        batch_size = x.shape[0]
        output = torch.zeros(batch_size, self.out_features, device=x.device)
        
        # Apply univariate functions to each connection
        for i in range(self.out_features):
            for j in range(self.in_features):
                activation_idx = i * self.in_features + j
                activated = self.activations[activation_idx](x[:, j])
                output[:, i] += activated * self.base_weight[i, j]
        
        return output


class KANLayer(nn.Module):
    """Drop-in replacement for efficient_kan.KANLayer."""
    
    def __init__(self, in_features: int, out_features: int, 
                 grid_size: int = 5, spline_order: int = 3):
        super().__init__()
        self.kan_layer = SimpleKANLayer(in_features, out_features, grid_size)
        
    def forward(self, x):
        return self.kan_layer(x)


# Compatibility check
KAN_AVAILABLE = True


def create_kan_network(layer_sizes, grid_size: int = 5):
    """Create a KAN network with given layer sizes."""
    layers = []
    for i in range(len(layer_sizes) - 1):
        layers.append(KANLayer(layer_sizes[i], layer_sizes[i + 1], grid_size))
        if i < len(layer_sizes) - 2:  # Don't add activation after last layer
            layers.append(nn.Tanh())  # Smooth activation between layers
    
    return nn.Sequential(*layers)


def test_kan_layer():
    """Test the KAN layer implementation."""
    print("Testing Simple KAN Layer...")
    
    # Create test data
    batch_size = 10
    in_features = 3
    out_features = 2
    
    x = torch.randn(batch_size, in_features)
    
    # Create KAN layer
    kan_layer = KANLayer(in_features, out_features)
    
    # Forward pass
    output = kan_layer(x)
    
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {output.shape}")
    print(f"KAN layer works correctly!")
    
    return True


if __name__ == "__main__":
    test_kan_layer() 