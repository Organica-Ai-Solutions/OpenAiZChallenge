"""MetaProtocolCoordinator for the NIS Protocol.

This module implements the core coordination functionality for the Neuro-Inspired System
(NIS) Protocol, providing a unified communication layer for multi-agent orchestration.
"""

import logging
from typing import Dict, List, Any, Optional, Callable, Union
import asyncio
import time
import uuid

# Setup logging
logger = logging.getLogger(__name__)


class MetaProtocolCoordinator:
    """Coordinates communication between agents using various protocols.
    
    The MetaProtocolCoordinator is the central component of the NIS Protocol that manages
    how agents communicate and share context. It supports multiple protocols:
    - MCP (Managed Compute Protocol): For orchestrating external resources/APIs
    - ACP (Agent Communication Protocol): For structured agent function calls
    - A2A (Agent-to-Agent Protocol): For direct peer-to-peer agent communication
    """
    
    def __init__(self):
        """Initialize the MetaProtocolCoordinator."""
        # Dictionary to store protocol adapters
        self.protocol_adapters = {}
        
        # Memory for storing context between calls
        self.context_memory = {}
        
        # Registered agents
        self.agents = {}
        
        # Task history for traceability
        self.task_history = []
        
        logger.info("MetaProtocolCoordinator initialized")
    
    def register_protocol(self, protocol_name: str, adapter: Any) -> None:
        """Register a protocol adapter with the coordinator.
        
        Args:
            protocol_name: Name of the protocol (e.g., 'mcp', 'acp', 'a2a')
            adapter: The protocol adapter implementation
        """
        self.protocol_adapters[protocol_name] = adapter
        logger.info(f"Registered protocol adapter: {protocol_name}")
    
    def register_agent(self, agent_id: str, agent: Any) -> None:
        """Register an agent with the coordinator.
        
        Args:
            agent_id: Unique identifier for the agent
            agent: The agent implementation
        """
        self.agents[agent_id] = agent
        logger.info(f"Registered agent: {agent_id}")
    
    def send_message(self, protocol: str, source: str, target: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send a message using the specified protocol.
        
        Args:
            protocol: Name of the protocol to use ('mcp', 'acp', or 'a2a')
            source: Source agent ID
            target: Target agent ID or service
            message: Message content
            
        Returns:
            Response from the target (if synchronous) or None (if asynchronous)
        """
        if protocol not in self.protocol_adapters:
            logger.error(f"Protocol '{protocol}' not registered")
            return None
        
        # Generate a unique ID for this message
        message_id = str(uuid.uuid4())
        
        # Add metadata to the message
        enhanced_message = {
            "id": message_id,
            "timestamp": time.time(),
            "source": source,
            "target": target,
            "protocol": protocol,
            "content": message
        }
        
        # Log the message dispatch
        logger.info(f"Sending message via {protocol}: {source} -> {target}, id={message_id}")
        
        # Track this in history
        self.task_history.append({
            "id": message_id,
            "type": "message_sent",
            "timestamp": enhanced_message["timestamp"],
            "protocol": protocol,
            "source": source,
            "target": target,
            "content_summary": str(message)[:100] + "..." if len(str(message)) > 100 else str(message)
        })
        
        # Use the appropriate protocol adapter to send the message
        try:
            # Delegate to the protocol adapter
            adapter = self.protocol_adapters[protocol]
            response = adapter.send_message(enhanced_message)
            
            # Store the response in history
            if response:
                self.task_history.append({
                    "id": message_id,
                    "type": "message_response",
                    "timestamp": time.time(),
                    "protocol": protocol,
                    "source": target,  # Now the source is the original target
                    "target": source,  # And target is the original source
                    "content_summary": str(response)[:100] + "..." if len(str(response)) > 100 else str(response)
                })
            
            return response
        except Exception as e:
            logger.error(f"Error sending message via {protocol}: {str(e)}")
            return None
    
    async def send_message_async(self, protocol: str, source: str, target: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send a message asynchronously using the specified protocol.
        
        Async version of send_message for use in asynchronous contexts.
        
        Args:
            protocol: Name of the protocol to use
            source: Source agent ID
            target: Target agent ID or service
            message: Message content
            
        Returns:
            Response from the target (if synchronous) or None (if asynchronous)
        """
        # Wrap the synchronous method in an async wrapper
        # In a real implementation, the adapters would have native async methods
        return await asyncio.to_thread(self.send_message, protocol, source, target, message)
    
    def store_context(self, key: str, data: Any) -> None:
        """Store data in the context memory.
        
        Args:
            key: Unique key to identify the data
            data: The data to store
        """
        self.context_memory[key] = {
            "data": data,
            "timestamp": time.time()
        }
        logger.debug(f"Stored context with key: {key}")
    
    def retrieve_context(self, key: str) -> Optional[Any]:
        """Retrieve data from the context memory.
        
        Args:
            key: Key of the data to retrieve
            
        Returns:
            The stored data or None if not found
        """
        if key in self.context_memory:
            logger.debug(f"Retrieved context with key: {key}")
            return self.context_memory[key]["data"]
        logger.debug(f"Context key not found: {key}")
        return None
    
    def run_pipeline(self, pipeline_config: List[Dict[str, Any]], initial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run a sequence of agent calls as a pipeline.
        
        Args:
            pipeline_config: List of steps defining the pipeline
            initial_data: Initial data to pass to the first step
            
        Returns:
            Result of the pipeline execution
        """
        current_data = initial_data
        
        # Generate a unique pipeline ID
        pipeline_id = str(uuid.uuid4())
        logger.info(f"Starting pipeline execution {pipeline_id}")
        
        for step_idx, step in enumerate(pipeline_config):
            step_id = f"{pipeline_id}-step-{step_idx}"
            logger.info(f"Executing pipeline step {step_idx+1}/{len(pipeline_config)}: {step['description']}")
            
            # Extract step configuration
            protocol = step.get("protocol", "acp")  # Default to ACP
            source = step.get("source", "coordinator")
            target = step["target"]  # Required
            
            # Prepare the message for this step
            message = {
                "action": step["action"],  # Required
                "data": current_data,
                "params": step.get("params", {})
            }
            
            # Send the message and get the response
            response = self.send_message(protocol, source, target, message)
            
            if response is None:
                logger.error(f"Pipeline step {step_idx+1} failed, no response received")
                return {
                    "status": "error",
                    "message": f"Pipeline step {step_idx+1} failed",
                    "pipeline_id": pipeline_id,
                    "partial_results": current_data
                }
            
            # Update current data with response for next step
            if step.get("update_strategy") == "merge":
                # Merge the response with current data
                current_data.update(response)
            else:
                # Replace current data with response
                current_data = response
        
        logger.info(f"Pipeline {pipeline_id} completed successfully")
        
        # Add pipeline ID to the final result
        if isinstance(current_data, dict):
            current_data["pipeline_id"] = pipeline_id
        
        return current_data
    
    async def run_pipeline_async(self, pipeline_config: List[Dict[str, Any]], initial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run a sequence of agent calls as a pipeline asynchronously.
        
        Async version of run_pipeline for use in asynchronous contexts.
        
        Args:
            pipeline_config: List of steps defining the pipeline
            initial_data: Initial data to pass to the first step
            
        Returns:
            Result of the pipeline execution
        """
        # Wrap the synchronous method in an async wrapper
        return await asyncio.to_thread(self.run_pipeline, pipeline_config, initial_data)
    
    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get the recent task history.
        
        Args:
            limit: Maximum number of history entries to return
            
        Returns:
            List of recent task history entries
        """
        return self.task_history[-limit:] if limit > 0 else self.task_history 