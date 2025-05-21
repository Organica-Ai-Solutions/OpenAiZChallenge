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
    
    def _fill_prompt_template(self, 
                            pattern_type: str, 
                            confidence: float, 
                            lat: float, 
                            lon: float,
                            historical_sources: List[Dict],
                            indigenous_knowledge: List[Dict],
                            web_search_snippets: Optional[List[Dict]] = None) -> str:
        """Fill the prompt template with the specific data.
        
        Args:
            pattern_type: The type of pattern detected
            confidence: Confidence score for the detection
            lat: Latitude coordinate
            lon: Longitude coordinate
            historical_sources: List of historical source metadata
            indigenous_knowledge: List of indigenous knowledge data
            web_search_snippets: List of web search snippets
            
        Returns:
            Filled prompt string
        """
        # Format historical sources as a string
        historical_str = "\n".join([
            f"- {source['title']} ({source['year']}): {source['excerpt']}"
            for source in historical_sources
        ]) if historical_sources else "No historical sources available."
        
        # Format indigenous knowledge as a string
        indigenous_str = "\n".join([
            f"- {source['source']}: {source['knowledge']}"
            for source in indigenous_knowledge
        ]) if indigenous_knowledge else "No indigenous knowledge available."
        
        web_context_str = "No additional web context found or searched."
        if web_search_snippets:
            web_context_str = "\n".join([
                f"- [{snippet.get('title', 'Web Result')}]({snippet.get('link', '#' )}): {snippet.get('snippet', 'N/A')}"
                for snippet in web_search_snippets
            ])

        # Create a simplified prompt that doesn't rely on the template's JSON example
        # This avoids the KeyError with the template format string
        simplified_prompt = f"""
# NIS Protocol Analysis Request

## Location: {lat}, {lon}

## Visual Pattern Detected: {pattern_type}
- Confidence: {confidence:.2f}

## Historical Sources:
{historical_str}

## Indigenous Knowledge:
{indigenous_str}

## Additional Web Context:
{web_context_str}

Please analyze this potential archaeological site considering the visual pattern detected,
historical context, indigenous knowledge, and any relevant web context. Determine the archaeological significance
and provide recommendations for further investigation.
"""
        
        return simplified_prompt
    
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
        """Get mock historical sources for the coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            List of historical source dictionaries
        """
        # In production, this would query a database or vector store of actual documents
        # Here we'll generate deterministic mock data based on the coordinates
        
        # Use hash of coordinates to seed random, making results reproducible
        seed = hash(f"{lat:.2f}_{lon:.2f}_hist")
        import random
        random.seed(seed)
        
        # Possible mock sources
        sources = [
            {
                "title": "Chronicles of the Amazon",
                "author": "Antonio de Herrera",
                "year": 1601 + (seed % 150),
                "excerpt": "The natives spoke of great settlements with circular houses arranged around a central plaza, where ceremonies were conducted under the full moon."
            },
            {
                "title": "Travels in Brazil",
                "author": "Johann Baptiste von Spix",
                "year": 1817 + (seed % 30),
                "excerpt": "We observed remnants of what appeared to be ancient earthworks stretching in straight lines across several leagues, their purpose unknown to the current inhabitants."
            },
            {
                "title": "Expedition to the Headwaters",
                "author": "Richard Spruce",
                "year": 1849 + (seed % 20),
                "excerpt": "The soil in certain areas was remarkably dark and fertile, unlike the surrounding terra firme. The Indians called it 'terra preta' and claimed it was made by their ancestors."
            },
            {
                "title": "Mission Records of São Gabriel",
                "author": "Father Manuel da Nóbrega",
                "year": 1550 + (seed % 200),
                "excerpt": "The heathens have constructed curious mounds upon which they place their dwellings, thus avoiding the seasonal floods that inundate the surrounding lands."
            },
            {
                "title": "Survey of the Upper Amazon",
                "author": "Colonel Percy Fawcett",
                "year": 1914 + (seed % 12),
                "excerpt": "Local legends speak of a vast network of ancient roads connecting major settlements, now overgrown but visible from elevated positions. I believe these accounts have merit."
            },
        ]
        
        # Select 1-3 sources based on coordinates
        num_sources = 1 + (seed % 3)
        selected_indices = random.sample(range(len(sources)), min(num_sources, len(sources)))
        
        return [sources[i] for i in selected_indices]
    
    def _get_mock_indigenous_knowledge(self, lat: float, lon: float) -> List[Dict]:
        """Get mock indigenous knowledge for the coordinates.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            
        Returns:
            List of indigenous knowledge dictionaries
        """
        # In production, this would access a curated database of indigenous knowledge
        # with proper attribution and permissions
        
        # Use hash of coordinates to seed random, making results reproducible
        seed = hash(f"{lat:.2f}_{lon:.2f}_indig")
        import random
        random.seed(seed)
        
        # Possible mock sources
        sources = [
            {
                "source": "Tupi Oral Tradition Map",
                "tribe": "Tupi",
                "knowledge": "Our ancestors built large villages with houses arranged in circles around the central plaza where the chief's house stood. Many such villages were connected by wide roads through the forest."
            },
            {
                "source": "Arawak Elders' Accounts",
                "tribe": "Arawak",
                "knowledge": "The old ones made the black earth (terra preta) by mixing charcoal, bone, and pottery with the soil over many generations, creating fertile grounds for growing food in otherwise poor soils."
            },
            {
                "source": "Yanomami Traditional Territory Map",
                "tribe": "Yanomami",
                "knowledge": "Before the great sickness came with the white men, our people had many more malocas (communal houses) throughout this region, connected by paths that our hunters still use today."
            },
            {
                "source": "Kayapó Geographical Knowledge",
                "tribe": "Kayapó",
                "knowledge": "Our ancestors built raised fields in the wetlands using a system of canals that controlled the water during rainy seasons. These ancient gardens are marked by distinct plant species that still grow there."
            },
            {
                "source": "Kalapalo Historical Narratives",
                "tribe": "Kalapalo",
                "knowledge": "The ancient ones built defensive ditches around their settlements to protect against rival groups. These ditches were connected to the rivers and filled with water during attacks."
            },
        ]
        
        # Select 0-2 sources based on coordinates
        num_sources = seed % 3
        if num_sources == 0:
            return []
        
        selected_indices = random.sample(range(len(sources)), min(num_sources, len(sources)))
        
        return [sources[i] for i in selected_indices]
    
    def _mock_llm_interpretation(self, 
                               pattern_type: str, 
                               confidence: float, 
                               lat: float, 
                               lon: float,
                               historical_sources: List[Dict],
                               indigenous_knowledge: List[Dict],
                               web_search_snippets: Optional[List[Dict]] = None) -> Dict:
        """Generate a mock LLM interpretation.
        
        Args:
            pattern_type: The type of pattern detected
            confidence: Confidence score for the detection
            lat: Latitude coordinate
            lon: Longitude coordinate
            historical_sources: List of historical source metadata
            indigenous_knowledge: List of indigenous knowledge data
            web_search_snippets: List of web search snippets
            
        Returns:
            Mock interpretation dictionary
        """
        # In production, this would be the result of an actual LLM call
        # Here we'll generate deterministic mock data based on the inputs
        
        # Pattern-specific interpretations
        pattern_interpretations = {
            "circular geometric structures": {
                "description": "The circular patterns detected are consistent with traditional settlement layouts of Indigenous communities in the Amazon Basin. These typically feature concentric rings of housing around a central plaza used for ceremonies and community gatherings.",
                "historical_context": "Colonial records from the early 17th century describe large, organized settlements with circular layouts throughout this region, though many were abandoned following European contact and the subsequent population collapse due to disease.",
                "indigenous_perspective": "Oral traditions from multiple Indigenous groups confirm that circular village layouts held cosmological significance, reflecting their understanding of the universe and social organization.",
                "confidence_base": 0.8,
            },
            "rectangular settlement patterns": {
                "description": "The rectangular structures identified suggest a post-contact settlement pattern or specialized ceremonial site. The regularity and alignment indicate deliberate planning rather than natural formation.",
                "historical_context": "European influence often led to the adoption of rectangular building patterns, though some pre-Columbian cultures in the region also constructed rectangular ceremonial structures for specific purposes.",
                "indigenous_perspective": "Some Indigenous accounts describe special-purpose buildings with rectangular designs used for particular ceremonies or social functions, distinct from the typical circular residential structures.",
                "confidence_base": 0.75,
            },
            "linear earthworks": {
                "description": "The linear features detected are consistent with ancient earthworks that likely served as defensive structures, boundaries between territories, or ceremonial alignments.",
                "historical_context": "Early explorers documented extensive earthwork systems throughout the Amazon, many of which were already abandoned and overgrown by the time of European contact.",
                "indigenous_perspective": "Traditional knowledge holders describe these linear features as boundaries created by ancestral groups to mark territory or defend against rival groups.",
                "confidence_base": 0.7,
            },
            "anthropogenic soil signatures": {
                "description": "The soil patterns detected strongly suggest the presence of terra preta (Amazonian Dark Earth), anthropogenically modified soil created through centuries of human habitation and agricultural practices.",
                "historical_context": "Terra preta soils are rich in carbon, bone fragments, and ceramic pieces, indicating long-term human occupation and sophisticated soil management practices that enhanced fertility.",
                "indigenous_perspective": "Knowledge of creating enriched soils has been passed down through generations, with traditional understanding of mixing charcoal, organic waste, and pottery fragments to create fertile growing areas.",
                "confidence_base": 0.85,
            },
            "artificial mounds": {
                "description": "The elevated features detected appear to be artificial mounds that likely served as foundations for structures, raising them above seasonal flood levels or for ceremonial purposes.",
                "historical_context": "Mound-building was a common adaptation to the Amazonian floodplain environment, allowing permanent settlements in otherwise seasonally inundated areas.",
                "indigenous_perspective": "Raised areas are described in oral histories as places of safety during floods and as important markers of ancestral settlements that maintained dry living areas year-round.",
                "confidence_base": 0.75,
            },
            "road networks": {
                "description": "The linear patterns identified are consistent with ancient road networks that connected settlements, resource areas, or ceremonial sites across substantial distances.",
                "historical_context": "Early colonial accounts describe wide, straight roads connecting major Indigenous settlements, contradicting the notion that Amazonian peoples lived in small, isolated groups.",
                "indigenous_perspective": "Traditional knowledge confirms extensive networks of paths and roads that facilitated trade, communication, and seasonal movements between communities.",
                "confidence_base": 0.7,
            },
            "water management systems": {
                "description": "The features detected appear to be intentional water management systems, possibly including canals, dams, or fish weirs that demonstrate sophisticated environmental engineering.",
                "historical_context": "Historical records document complex hydrological knowledge among Amazonian peoples, who modified waterways for transportation, flood control, and resource management.",
                "indigenous_perspective": "Traditional ecological knowledge includes sophisticated understanding of water flow patterns and techniques for creating fish-rich environments through landscape modification.",
                "confidence_base": 0.8,
            },
        }
        
        # Default values if pattern type isn't recognized
        default_interpretation = {
            "description": f"The detected pattern '{pattern_type}' suggests possible human modification of the landscape that warrants further investigation.",
            "historical_context": "Limited historical documentation exists for this specific type of feature in the region.",
            "indigenous_perspective": "Further consultation with Indigenous knowledge holders would be valuable to interpret this pattern.",
            "confidence_base": 0.5,
        }
        
        # Get the interpretation for this pattern type
        interp = pattern_interpretations.get(pattern_type, default_interpretation)
        
        # Adjust confidence based on visual confidence and available sources
        adjusted_confidence = interp["confidence_base"] * confidence
        
        # Boost confidence if we have corroborating historical or indigenous knowledge
        if historical_sources:
            adjusted_confidence += 0.05 * len(historical_sources)
        if indigenous_knowledge:
            adjusted_confidence += 0.07 * len(indigenous_knowledge)
        if web_search_snippets: # Consider web search in confidence
            adjusted_confidence += 0.03 * len(web_search_snippets) # Smaller boost for web context
        
        # Cap at 0.95
        adjusted_confidence = min(adjusted_confidence, 0.95)
        
        # Format historical context if we have sources
        historical_context = interp["historical_context"]
        if historical_sources:
            historical_context += " Specifically: "
            historical_context += " ".join([source["excerpt"] for source in historical_sources])
        
        # Format indigenous perspective if we have sources
        indigenous_perspective = interp["indigenous_perspective"]
        if indigenous_knowledge:
            indigenous_perspective += " Specifically: "
            indigenous_perspective += " ".join([source["knowledge"] for source in indigenous_knowledge])
        
        web_context_summary = ""
        if web_search_snippets:
            web_context_summary = " Web context suggests: " + "; ".join([s.get("snippet","")[:100] + "..." for s in web_search_snippets])

        return {
            "description": interp["description"] + web_context_summary,
            "confidence": adjusted_confidence,
            "historical_context": historical_context,
            "indigenous_perspective": indigenous_perspective,
        }
    
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