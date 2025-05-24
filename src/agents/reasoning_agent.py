"""Reasoning Agent for the NIS Protocol.

This agent analyzes visual findings and connects them with historical context
to determine the likelihood and nature of archaeological sites.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union, Any
import os

# Import the GPT integration
from src.meta.gpt_integration import GPTIntegration

# Setup logging
logger = logging.getLogger(__name__)


class ReasoningAgent:
    """Agent for analyzing and interpreting findings with historical context."""
    
    def __init__(self, prompt_dir: Optional[Path] = None, gpt_model: str = "gpt-4-turbo", meta_coordinator: Optional[Any] = None):
        """Initialize the Reasoning Agent.
        
        Args:
            prompt_dir: Directory containing prompt templates
            gpt_model: GPT model to use for reasoning
            meta_coordinator: Instance of MetaProtocolCoordinator for tool usage
        """
        self.prompt_dir = prompt_dir or Path("src/prompts")
        self.reasoning_prompt_path = self.prompt_dir / "reasoning_prompt.txt"
        self.meta_coordinator = meta_coordinator # Store coordinator
        
        # Load the prompt template if it exists
        try:
            with open(self.reasoning_prompt_path, "r", encoding="utf-8") as f:
                self.reasoning_prompt_template = f.read()
            logger.info(f"Loaded reasoning prompt from {self.reasoning_prompt_path}")
        except FileNotFoundError:
            logger.warning(f"Prompt file not found at {self.reasoning_prompt_path}")
            # Fallback template
            self.reasoning_prompt_template = (
                "Analyze the pattern '{pattern_type}' detected at coordinates {lat}, {lon} with confidence {confidence}.\n"
                "Provide historical context and archaeological interpretation.\n"
            )
        
        # Initialize the GPT integration
        try:
            # GPTIntegration will handle API key loading from src.config
            self.gpt = GPTIntegration(model_name=gpt_model)
            logger.info(f"Initialized GPT integration with model: {gpt_model}")
            self.use_live_llm = True
        except Exception as e:
            logger.warning(f"Failed to initialize GPT integration: {str(e)}. Falling back to mock responses.")
            self.use_live_llm = False
        
        logger.info("Reasoning Agent initialized")
    
    def interpret_findings(self, 
                          visual_findings: Dict, 
                          lat: float, 
                          lon: float,
                          processed_historical_texts: Optional[Dict] = None,
                          processed_indigenous_knowledge: Optional[Dict] = None,
                          perform_web_search: bool = False) -> Dict:
        """Interpret visual findings with historical and cultural context.
        
        Args:
            visual_findings: Output from the Vision Agent
            lat: Latitude coordinate
            lon: Longitude coordinate
            processed_historical_texts: Processed historical text data.
            processed_indigenous_knowledge: Processed indigenous knowledge data.
            perform_web_search: Flag to explicitly trigger web search.
            
        Returns:
            Dictionary with reasoned interpretation
        """
        # First, check if there's anything to interpret
        sources_used = list(visual_findings.get("sources", [])) # Initialize with visual sources

        if not visual_findings.get("anomaly_detected", False):
            return {
                "interpretation": "No significant archaeological features detected at this location.",
                "confidence": 0.1,
                "historical_context": "No applicable historical context without detected features.",
                "indigenous_perspective": "No applicable indigenous perspective without detected features.",
                "sources_used": sources_used,
                "pattern_type": ""
            }
        
        # Get the detected pattern and confidence
        pattern_type = visual_findings.get("pattern_type", "")
        confidence = visual_findings.get("confidence", 0.0)
        
        # Use provided processed data, or fall back to mock/empty if not available
        historical_sources_list: List[Dict] = []
        if processed_historical_texts and isinstance(processed_historical_texts.get("sources"), list):
            historical_sources_list = processed_historical_texts["sources"]
        elif not processed_historical_texts: 
            logger.info(f"No processed historical texts provided for {lat}, {lon}. Using mock data.")
            historical_sources_list = self._get_mock_historical_sources(lat, lon)

        indigenous_knowledge_list: List[Dict] = []
        if processed_indigenous_knowledge and isinstance(processed_indigenous_knowledge.get("knowledge_entries"), list):
            indigenous_knowledge_list = processed_indigenous_knowledge["knowledge_entries"]
        elif not processed_indigenous_knowledge: 
            logger.info(f"No processed indigenous knowledge provided for {lat}, {lon}. Using mock data.")
            indigenous_knowledge_list = self._get_mock_indigenous_knowledge(lat, lon)
        
        web_search_snippets = []
        # Decide if web search is needed
        # Trigger if explicitly requested OR if local context is sparse and a pattern is known.
        trigger_web_search = perform_web_search or ((not historical_sources_list and not indigenous_knowledge_list) and pattern_type and self.meta_coordinator)

        if trigger_web_search and self.meta_coordinator: # Ensure coordinator exists
            logger.info(f"Web search triggered for pattern '{pattern_type}' at {lat}, {lon}. Explicit request: {perform_web_search}")
            search_query = f"archaeological context and interpretations for {pattern_type} near {lat}, {lon}"
            try:
                mcp_response = self.meta_coordinator.send_message(
                    protocol="mcp",
                    source="reasoning_agent",
                    target="web_search_tool",
                    message={"action": "search", "content": {"query": search_query}}
                )
                if mcp_response and mcp_response.get("status") == "success" and mcp_response.get("results"):
                    logger.info(f"Web search successful for query: '{search_query}'")
                    for item in mcp_response["results"]:
                        web_search_snippets.append(item) 
                        link_or_title = item.get("link", item.get("title", "Web Search Result"))
                        if link_or_title not in sources_used:
                            sources_used.append(link_or_title)
                else:
                    logger.warning(f"Web search for '{search_query}' did not return successful results. Response: {mcp_response}")
            except Exception as e:
                logger.error(f"Error performing web search via MCP: {e}", exc_info=True)
        elif perform_web_search and not self.meta_coordinator:
            logger.warning("Web search requested, but MetaProtocolCoordinator is not available to ReasoningAgent.")

        # Prepare the prompt, now potentially including web search snippets
        detailed_user_prompt = self._fill_prompt_template(
            pattern_type, 
            confidence, 
            lat, 
            lon, 
            historical_sources_list,
            indigenous_knowledge_list,
            web_search_snippets
        )

        # Use agent's pre-loaded prompt template as the system prompt
        system_prompt_for_gpt = self.reasoning_prompt_template

        if self.use_live_llm:
            try:
                interpretation_json_str = self.gpt.reasoning_analysis(
                    user_prompt_string=detailed_user_prompt,
                    system_prompt=system_prompt_for_gpt 
                )["analysis"]
                
                try:
                    interpretation = json.loads(interpretation_json_str)
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode JSON from GPT reasoning_analysis: {interpretation_json_str}")
                    interpretation = self._create_fallback_interpretation_from_text(interpretation_json_str)

                logger.info(f"Using live GPT for analysis at {lat}, {lon}")
            except Exception as e:
                logger.error(f"Error calling GPT: {e}. Falling back to mock responses.")
                interpretation = self._mock_llm_interpretation(
                    pattern_type, 
                    confidence, 
                    lat, 
                    lon, 
                    historical_sources_list,
                    indigenous_knowledge_list,
                    web_search_snippets
                )
        else:
            interpretation = self._mock_llm_interpretation(
                pattern_type, 
                confidence, 
                lat, 
                lon, 
                historical_sources_list,
                indigenous_knowledge_list,
                web_search_snippets
            )
        
        # Consolidate sources_used
        if historical_sources_list:
            for source in historical_sources_list:
                title = source.get("title")
                if title and title not in sources_used:
                     sources_used.append(title)
        if indigenous_knowledge_list:
            for source in indigenous_knowledge_list:
                src_name = source.get("source")
                if src_name and src_name not in sources_used:
                    sources_used.append(src_name)
        
        result = {
            "interpretation": interpretation.get("description", "No interpretation available."),
            "confidence": interpretation.get("confidence", 0.0),
            "historical_context": interpretation.get("historical_context", "No historical context available."),
            "indigenous_perspective": interpretation.get("indigenous_perspective", "No indigenous perspective available."),
            "sources_used": list(dict.fromkeys(sources_used)), # Deduplicate while preserving order
            "pattern_type": pattern_type 
        }
        
        if "recommended_next_steps" in interpretation:
            result["recommended_next_steps"] = interpretation["recommended_next_steps"]
        
        return result
    
    def _fill_prompt_template(self, pattern_type: str, confidence: float, lat: float, lon: float, historical_sources: List[Dict], indigenous_knowledge: List[Dict], web_search_snippets: Optional[List[Dict]] = None) -> str:
        raise NotImplementedError("_fill_prompt_template must be implemented with real prompt logic and data.")
    
    def _call_llm(self, prompt: str) -> Dict:
        """Call the LLM with the prompt.
        
        Args:
            prompt: Filled prompt template
            
        Returns:
            LLM response as a dictionary
        """
        # In production, this would call the actual LLM API
        # Example:
        # response = self.client.chat.completions.create(
        #    model="gpt-4",
        #    messages=[
        #        {"role": "system", "content": "You are an archaeological analysis assistant."},
        #        {"role": "user", "content": prompt}
        #    ]
        # )
        # result = json.loads(response.choices[0].message.content)
        
        # For demo purposes, we'll return a mock response
        logger.info("Would call LLM with prompt, using mock for demo")
        return {
            "pattern_interpretation": "Mock interpretation of the pattern.",
            "historical_context": "Mock historical context.",
            "indigenous_perspective": "Mock indigenous perspective.",
            "archaeological_significance": "Mock archaeological significance.",
            "confidence": 85,
            "reasons_for_confidence": "Mock reasons for confidence.",
            "description": "Mock detailed description for archaeologists.",
            "recommended_next_steps": "Mock recommended next steps."
        }
    
    def _get_mock_historical_sources(self, lat: float, lon: float) -> List[Dict]:
        raise NotImplementedError("_get_mock_historical_sources must be replaced with real historical source retrieval.")
    
    def _get_mock_indigenous_knowledge(self, lat: float, lon: float) -> List[Dict]:
        raise NotImplementedError("_get_mock_indigenous_knowledge must be replaced with real indigenous knowledge retrieval.")
    
    def _mock_llm_interpretation(self, pattern_type: str, confidence: float, lat: float, lon: float, historical_sources: List[Dict], indigenous_knowledge: List[Dict], web_search_snippets: Optional[List[Dict]] = None) -> Dict:
        raise NotImplementedError("_mock_llm_interpretation must be replaced with real LLM interpretation logic.")
    
    def _create_fallback_interpretation_from_text(self, text_response: str) -> Dict:
        """Creates a fallback interpretation dictionary if GPT response is not valid JSON."""
        return {
            "description": text_response, # Use the raw text as description
            "confidence": 0.3, # Assign a low default confidence
            "historical_context": "Could not parse detailed historical context from LLM response.",
            "indigenous_perspective": "Could not parse detailed indigenous perspective from LLM response.",
            "recommended_next_steps": []
        }
    
    def get_capabilities(self) -> Dict:
        """Return the capabilities of this agent."""
        return {
            "name": "ReasoningAgent",
            "description": "Analyzes visual findings with historical and cultural context",
            "data_types": ["historical_texts", "indigenous_knowledge"],
            "reasoning_capabilities": [
                "archaeological interpretation",
                "historical contextualization",
                "indigenous knowledge integration",
                "confidence assessment",
            ],
        }

    def synthesize(self, visual_data: dict, contextual_memories: dict) -> dict:
        """
        Combine visual and memory context into a reasoned output (mock for integration).
        """
        # In a real implementation, this would perform reasoning over both inputs.
        # For now, return a mock synthesis for integration testing.
        return {
            "synthesis": "Mock synthesis of visual and contextual memory.",
            "visual_data": visual_data,
            "contextual_memories": contextual_memories,
            "confidence": 0.5
        } 