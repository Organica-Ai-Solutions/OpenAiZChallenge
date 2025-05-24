"""
Consciousness Module for the NIS Protocol

Implements a Global Workspace and Consciousness Monitor for neuro-inspired agent integration.
"""
import time
import logging
from typing import Dict, Any, Optional
from .vision_agent import VisionAgent
from .memory_agent import MemoryAgent
from .reasoning_agent import ReasoningAgent

logger = logging.getLogger(__name__)

class GlobalWorkspace:
    """
    Integrates cognitive agents (Vision, Memory, Reasoning) and provides a unified context.
    Designed for compatibility with LangGraph workflows.
    """
    def __init__(self, agents: Dict[str, Any]):
        self.perception: VisionAgent = agents['vision']
        self.memory: MemoryAgent = agents['memory']
        self.reasoning: ReasoningAgent = agents['reasoning']

    def integrate_information(self) -> Dict[str, Any]:
        """
        Combines inputs from all cognitive agents into a unified context.
        Returns a dictionary representing the integrated workspace state.
        """
        # Example: get latest observation from VisionAgent
        visual_data = self.perception.get_latest_observation() if hasattr(self.perception, 'get_latest_observation') else None
        # Example: recall context from MemoryAgent
        contextual_memories = self.memory.recall_context(visual_data) if hasattr(self.memory, 'recall_context') else None
        # Example: synthesize with ReasoningAgent
        integrated = self.reasoning.synthesize(visual_data, contextual_memories) if hasattr(self.reasoning, 'synthesize') else {
            'visual_data': visual_data,
            'contextual_memories': contextual_memories
        }
        return integrated

class ConsciousnessMonitor:
    """
    Orchestrates global workspace operations, attention cycles, and meta-cognition.
    """
    def __init__(self, workspace: GlobalWorkspace):
        self.workspace = workspace
        self.attention_cycle = 0
        self.active = False

    def maintain_awareness(self, max_cycles: Optional[int] = None):
        """
        Orchestrates global workspace theory operations in a loop.
        If max_cycles is set, runs for that many cycles; otherwise, runs indefinitely.
        """
        self.active = True
        cycles = 0
        while self.active:
            integrated_info = self.workspace.integrate_information()
            self._broadcast_to_modules(integrated_info)
            self.attention_cycle += 1
            cycles += 1
            logger.info(f"Consciousness cycle {self.attention_cycle}: {integrated_info}")
            if max_cycles and cycles >= max_cycles:
                break
            time.sleep(0.1)  # Cognitive cycle timing

    def _broadcast_to_modules(self, integrated_info: Dict[str, Any]):
        """
        Broadcasts integrated information to all registered modules/agents.
        Now logs and simulates feedback to each agent for richer inter-agent communication.
        """
        # Example: Log the broadcast and simulate feedback
        logger.info(f"Broadcasting integrated info to agents: {integrated_info}")
        # Simulate feedback to each agent (could be replaced with actual method calls)
        if hasattr(self.workspace.perception, 'receive_broadcast'):
            self.workspace.perception.receive_broadcast(integrated_info)
        if hasattr(self.workspace.memory, 'receive_broadcast'):
            self.workspace.memory.receive_broadcast(integrated_info)
        if hasattr(self.workspace.reasoning, 'receive_broadcast'):
            self.workspace.reasoning.receive_broadcast(integrated_info)

    def stop(self):
        """Stops the awareness loop."""
        self.active = False

# Example stubs for agent integration (to be implemented in actual agents)
# VisionAgent should implement get_latest_observation()
# MemoryAgent should implement recall_context(visual_data)
# ReasoningAgent should implement synthesize(visual_data, contextual_memories) 