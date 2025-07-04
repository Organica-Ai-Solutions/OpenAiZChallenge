"""Meta Protocol package for the NIS Protocol.

This package contains the MetaProtocolCoordinator and protocol adapters for the
Neuro-Inspired System (NIS) Protocol, providing a unified communication layer for
multi-agent systems.
"""

from .coordinator import MetaProtocolCoordinator
from .gpt_integration import GPTIntegration

__all__ = ["MetaProtocolCoordinator", "GPTIntegration"] 