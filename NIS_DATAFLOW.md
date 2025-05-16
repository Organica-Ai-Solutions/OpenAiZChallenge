# NIS Protocol Dataflow with GPT Integration

This document outlines the dataflow of the NIS (Neuro-Inspired System) Protocol with the GPT integration that powers the reasoning and vision capabilities.

## System Architecture Overview

The NIS Protocol is organized as a multi-agent system coordinated by the MetaProtocolCoordinator, which orchestrates communication between specialized agents. The system follows a modular design where each agent focuses on a specific aspect of the archaeological discovery process.

```
                    +-----------------+
                    |     REST API    |
                    |  /api/analyze   |
                    +--------+--------+
                             |
                             v
                  +----------+-----------+
                  | MetaProtocolCoordinator |
                  +----------+-----------+
                             |
         +------------------+-------------------+-------------------+
         |                  |                   |                   |
+--------v-------+ +--------v-------+ +---------v------+ +---------v------+
|  Vision Agent  | | Reasoning Agent | |  Memory Agent  | |  Action Agent  |
+----------------+ +----------------+ +----------------+ +----------------+
         |                  |                   |                   |
         |                  |                   |                   |
+--------v-------+ +--------v-------+           |                   |
|   GPT Vision   | |   GPT Turbo    |           |                   |
+----------------+ +----------------+           |                   |
                                                |                   |
                                                v                   v
```

## Dataflow Process

1. **API Request** → The process begins when a user sends coordinates to the `/api/analyze` endpoint
2. **Coordinator Pipeline** → The MetaProtocolCoordinator sets up a pipeline with three main steps:
   - Vision Analysis
   - Reasoning Analysis
   - Action Generation
3. **Vision Agent** → Processes satellite imagery and LIDAR data
   - Now powered by **GPT-4 Vision** for image analysis
   - Falls back to mock implementations if GPT is unavailable
4. **Reasoning Agent** → Analyzes the visual findings with historical and indigenous context
   - Now powered by **GPT-4 Turbo** for contextual reasoning
   - Combines multiple data sources for comprehensive analysis
5. **Action Agent** → Generates final reports and recommendations
6. **API Response** → The results are returned to the user

## Protocol Integration

The NIS Protocol uses three distinct protocols for communication:

1. **MCP (Managed Compute Protocol)** → For external API calls
   - Powers the connection to OpenAI API
   - Handles authentication and request formatting
2. **ACP (Agent Communication Protocol)** → For structured agent function calls
   - Used for the main pipeline steps
   - Maintains consistent data format between agents
3. **A2A (Agent-to-Agent Protocol)** → For direct peer-to-peer agent communication
   - Used for supplementary communication

## GPT Integration Details

The new GPT integration enhances the system in the following ways:

### Vision Agent Enhancements

- **GPT-4 Vision Analysis**: The Vision Agent now uses GPT-4 Vision to analyze satellite and LIDAR imagery
- **Natural Language Understanding**: Can extract patterns from unstructured image descriptions
- **Confidence Scoring**: Provides confidence scores based on language used in descriptions
- **Graceful Degradation**: Falls back to mock implementations if GPT is unavailable

### Reasoning Agent Enhancements

- **GPT-4 Turbo Analysis**: The Reasoning Agent uses GPT-4 Turbo for contextual analysis
- **Historical Integration**: Combines historical sources with visual findings
- **Indigenous Knowledge**: Incorporates indigenous perspectives
- **Recommendations**: Generates scientific recommendations for verification
- **Structured Format**: Returns consistent JSON structures for further processing

## Context Preservation

Data flows between agents with context preserved through the MetaProtocolCoordinator:

1. Vision Agent findings → Reasoning Agent input
2. Reasoning Agent analysis → Action Agent input
3. All agent data → Final report

GPT models are seamlessly integrated into this flow, replacing mock implementations when available.

## Sample Flow for Coordinate Analysis

```
1. User submits coordinates: (-3.4653, -62.2159)
2. MetaProtocolCoordinator initiates pipeline:
   a. Vision Agent uses GPT Vision to analyze satellite imagery
      - Detects "circular geometric structures"
      - Confidence: 0.75
   b. Reasoning Agent uses GPT Turbo to interpret findings
      - Analyzes with historical context
      - Incorporates indigenous knowledge
      - Confidence: 0.82
   c. Action Agent generates report and recommendations
3. User receives comprehensive analysis
```

## Benefits of GPT Integration

1. **Enhanced Accuracy**: GPT models provide more nuanced analysis
2. **Multi-Modal Integration**: Combines vision and language capabilities
3. **Contextual Understanding**: Better integration of multiple data sources
4. **Fallback Mechanisms**: System remains functional even without GPT
5. **Scalability**: Can leverage the latest GPT models as they become available 