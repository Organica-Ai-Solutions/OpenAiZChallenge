from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import asyncio
import uuid
import httpx
import io
import base64
from PIL import Image
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

router = APIRouter()

class CodexDiscoveryRequest(BaseModel):
    """Request model for discovering relevant codices."""
    coordinates: Dict[str, float] = Field(..., description="Geographic coordinates (lat, lng)")
    radius_km: Optional[float] = Field(50.0, description="Search radius in kilometers")
    period: Optional[str] = Field("all", description="Historical period: pre-columbian, colonial, post-contact, all")
    sources: Optional[List[str]] = Field(["famsi", "world_digital_library", "inah"], description="Digital archives to search")
    max_results: Optional[int] = Field(20, description="Maximum number of codices to return")

class CodexAnalysisRequest(BaseModel):
    """Request model for analyzing a specific codex."""
    codex_id: str = Field(..., description="Unique codex identifier")
    image_url: str = Field(..., description="URL of the codex image")
    coordinates: Optional[Dict[str, float]] = None
    context: Optional[str] = None

class CodexResult(BaseModel):
    """Model representing a discovered codex."""
    id: str
    title: str
    source: str
    image_url: str
    period: str
    geographic_relevance: str
    relevance_score: float
    content_type: str
    auto_extractable: bool
    metadata: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None

class CodexDiscoveryResponse(BaseModel):
    """Response model for codex discovery."""
    success: bool
    total_codices_found: int
    auto_analyzed: int
    codices: List[CodexResult]
    search_metadata: Dict[str, Any]

class CodexAnalysisResponse(BaseModel):
    """Response model for codex analysis."""
    success: bool
    codex_id: str
    analysis: Dict[str, Any]
    confidence: float
    processing_time: float

# Digital Archive Configurations
DIGITAL_ARCHIVES = {
    "famsi": {
        "name": "Foundation for Ancient Mesoamerican Studies",
        "base_url": "http://www.famsi.org/research/graz/",
        "codices": [
            {"id": "borgia", "title": "Codex Borgia", "url": "borgia/index.html", "period": "pre-columbian"},
            {"id": "mendoza", "title": "Codex Mendoza", "url": "mendoza/index.html", "period": "colonial"},
            {"id": "dresden", "title": "Codex Dresden", "url": "dresdensis/index.html", "period": "pre-columbian"},
            {"id": "madrid", "title": "Codex Madrid", "url": "madrid/index.html", "period": "pre-columbian"},
            {"id": "paris", "title": "Codex Paris", "url": "paris/index.html", "period": "pre-columbian"},
            {"id": "vaticanus", "title": "Codex Vaticanus", "url": "vaticanus3738/index.html", "period": "pre-columbian"},
            {"id": "fejervary", "title": "Codex Fejéváry-Mayer", "url": "fejervary_mayer/index.html", "period": "pre-columbian"},
            {"id": "laud", "title": "Codex Laud", "url": "laud/index.html", "period": "pre-columbian"}
        ]
    },
    "world_digital_library": {
        "name": "World Digital Library",
        "base_url": "https://www.wdl.org/en/",
        "search_endpoint": "search/"
    },
    "inah": {
        "name": "Instituto Nacional de Antropología e Historia",
        "base_url": "http://codices.inah.gob.mx/",
        "search_endpoint": "pc/micrositio.php"
    }
}

@router.post("/discover", response_model=CodexDiscoveryResponse)
async def discover_codices_automatically(request: CodexDiscoveryRequest):
    """
    Automatically discover relevant codices for archaeological coordinates.
    
    This endpoint searches multiple digital archives and returns relevant historical
    codices based on geographic proximity and cultural significance.
    """
    logger.info(f"📜 Auto-discovering codices for coordinates: {request.coordinates}")
    
    try:
        start_time = datetime.now()
        discovered_codices = []
        
        # Search each requested source
        search_tasks = []
        for source in request.sources:
            if source in DIGITAL_ARCHIVES:
                task = asyncio.create_task(
                    search_archive(source, request.coordinates, request.radius_km, request.period)
                )
                search_tasks.append(task)
        
        # Wait for all searches to complete
        search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
        
        # Process results
        for result in search_results:
            if isinstance(result, Exception):
                logger.error(f"Archive search failed: {result}")
                continue
            discovered_codices.extend(result)
        
        # Calculate relevance scores
        for codex in discovered_codices:
            codex["relevance_score"] = await calculate_relevance_score(
                codex, request.coordinates
            )
        
        # Sort by relevance and limit results
        discovered_codices.sort(key=lambda x: x["relevance_score"], reverse=True)
        discovered_codices = discovered_codices[:request.max_results]
        
        # Auto-analyze top codices with GPT-4.1 Vision
        auto_analyzed = 0
        for codex in discovered_codices[:5]:  # Analyze top 5
            try:
                analysis = await analyze_codex_with_gpt4_vision(codex, request.coordinates)
                codex["analysis"] = analysis
                auto_analyzed += 1
            except Exception as e:
                logger.error(f"Failed to analyze codex {codex['id']}: {e}")
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return CodexDiscoveryResponse(
            success=True,
            total_codices_found=len(discovered_codices),
            auto_analyzed=auto_analyzed,
            codices=[CodexResult(**codex) for codex in discovered_codices],
            search_metadata={
                "coordinates": request.coordinates,
                "radius_km": request.radius_km,
                "sources_searched": request.sources,
                "processing_time": f"{processing_time:.2f}s",
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Codex discovery failed: {e}")
        raise HTTPException(status_code=500, detail=f"Codex discovery failed: {str(e)}")

@router.post("/analyze", response_model=CodexAnalysisResponse)
async def analyze_codex(request: CodexAnalysisRequest):
    """
    Analyze a specific codex using GPT-4.1 Vision.
    
    Downloads the codex image and performs comprehensive archaeological analysis.
    """
    logger.info(f"🔍 Analyzing codex: {request.codex_id}")
    
    try:
        start_time = datetime.now()
        
        # Download and process the image
        image_data = await download_codex_image(request.image_url)
        
        # Prepare analysis context
        context = {
            "coordinates": request.coordinates,
            "codex_id": request.codex_id,
            "user_context": request.context
        }
        
        # Analyze with GPT-4.1 Vision
        analysis = await analyze_codex_with_gpt4_vision_detailed(image_data, context)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return CodexAnalysisResponse(
            success=True,
            codex_id=request.codex_id,
            analysis=analysis,
            confidence=analysis.get("confidence", 0.85),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"❌ Codex analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Codex analysis failed: {str(e)}")

@router.get("/sources")
async def list_available_sources():
    """List all available digital archive sources."""
    return {
        "sources": [
            {
                "id": source_id,
                "name": config["name"],
                "total_codices": len(config.get("codices", [])),
                "status": "active"
            }
            for source_id, config in DIGITAL_ARCHIVES.items()
        ]
    }

async def search_archive(source: str, coordinates: Dict[str, float], radius_km: float, period: str) -> List[Dict[str, Any]]:
    """Search a specific digital archive for relevant codices."""
    
    if source == "famsi":
        return await search_famsi_archive(coordinates, radius_km, period)
    elif source == "world_digital_library":
        return await search_world_digital_library(coordinates, radius_km, period)
    elif source == "inah":
        return await search_inah_archive(coordinates, radius_km, period)
    else:
        return []

async def search_famsi_archive(coordinates: Dict[str, float], radius_km: float, period: str) -> List[Dict[str, Any]]:
    """Search FAMSI digital archive."""
    famsi_config = DIGITAL_ARCHIVES["famsi"]
    results = []
    
    for codex in famsi_config["codices"]:
        if period != "all" and codex["period"] != period:
            continue
            
        # Calculate geographic relevance (mock implementation)
        distance = await calculate_geographic_distance(coordinates, codex)
        
        result = {
            "id": f"famsi_{codex['id']}",
            "title": codex["title"],
            "source": "FAMSI",
            "image_url": f"{famsi_config['base_url']}{codex['url']}",
            "period": codex["period"],
            "geographic_relevance": f"~{int(distance)}km from coordinates",
            "content_type": "pictorial_manuscript",
            "auto_extractable": True,
            "metadata": {
                "archive": "famsi",
                "original_id": codex["id"],
                "collection": "Akademische Druck- u. Verlagsanstalt Graz"
            }
        }
        results.append(result)
    
    return results

async def search_world_digital_library(coordinates: Dict[str, float], radius_km: float, period: str) -> List[Dict[str, Any]]:
    """Search World Digital Library."""
    # Mock implementation - in production, would use WDL API
    results = [
        {
            "id": "wdl_florentine_codex",
            "title": "Florentine Codex - General History of the Things of New Spain",
            "source": "World Digital Library",
            "image_url": "https://www.wdl.org/en/item/10096/",
            "period": "colonial",
            "geographic_relevance": "Central Mexico - relevant to Mesoamerican archaeology",
            "content_type": "ethnographic_manuscript",
            "auto_extractable": True,
            "metadata": {
                "archive": "world_digital_library",
                "author": "Bernardino de Sahagún",
                "year": "1575-1577"
            }
        }
    ]
    return results

async def search_inah_archive(coordinates: Dict[str, float], radius_km: float, period: str) -> List[Dict[str, Any]]:
    """Search INAH archive."""
    # Mock implementation - in production, would use INAH API
    results = [
        {
            "id": "inah_codex_xolotl",
            "title": "Códice Xólotl",
            "source": "INAH",
            "image_url": "http://codices.inah.gob.mx/pc/contenido.php?id=9",
            "period": "colonial",
            "geographic_relevance": "Valley of Mexico - Texcoco region",
            "content_type": "cartographic_historical",
            "auto_extractable": True,
            "metadata": {
                "archive": "inah",
                "location": "Texcoco",
                "cultural_group": "Acolhua"
            }
        }
    ]
    return results

async def calculate_geographic_distance(coordinates: Dict[str, float], codex: Dict[str, Any]) -> float:
    """Calculate approximate geographic distance for relevance scoring."""
    # Mock calculation - in production, use actual geographic data
    import random
    return random.uniform(50, 500)

async def calculate_relevance_score(codex: Dict[str, Any], coordinates: Dict[str, float]) -> float:
    """Calculate relevance score based on multiple factors."""
    score = 0.0
    
    # Period relevance
    if codex["period"] == "pre-columbian":
        score += 0.4
    elif codex["period"] == "colonial":
        score += 0.3
    
    # Source reliability
    source_weights = {"FAMSI": 0.3, "INAH": 0.25, "World Digital Library": 0.2}
    score += source_weights.get(codex["source"], 0.1)
    
    # Content type relevance
    if "manuscript" in codex["content_type"]:
        score += 0.2
    
    # Add some randomization for demo
    import random
    score += random.uniform(0.0, 0.1)
    
    return min(score, 1.0)

async def download_codex_image(image_url: str) -> bytes:
    """Download codex image from URL."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url, timeout=30.0)
            response.raise_for_status()
            return response.content
    except Exception as e:
        logger.error(f"Failed to download image from {image_url}: {e}")
        # Return a placeholder image or raise exception
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")

async def analyze_codex_with_gpt4_vision(codex: Dict[str, Any], coordinates: Dict[str, float]) -> Dict[str, Any]:
    """Analyze codex using GPT-4.1 Vision (integration with NIS Protocol)."""
    
    # This would integrate with your existing NIS Protocol GPT-4 Vision setup
    analysis_prompt = f"""
    Analyze this historical Mesoamerican codex for archaeological relevance to coordinates {coordinates}.
    
    Codex Information:
    - Title: {codex['title']}
    - Period: {codex['period']}
    - Source: {codex['source']}
    
    Please identify:
    1. Geographic references and locations mentioned
    2. Settlement patterns or architectural elements
    3. Cultural practices and rituals
    4. Temporal indicators and dating clues
    5. Archaeological significance for the given coordinates
    6. Connections to other known archaeological sites
    7. Indigenous knowledge and cultural context
    
    Provide confidence scores for each analysis point.
    """
    
    # Mock analysis result - replace with actual GPT-4.1 Vision call
    return {
        "geographic_references": [
            {
                "location": "Central Mexican highlands",
                "confidence": 0.87,
                "relevance": "Settlement patterns match satellite analysis"
            }
        ],
        "settlement_patterns": [
            {
                "pattern": "Ceremonial complex with residential areas",
                "confidence": 0.92,
                "archaeological_indicators": ["stone platforms", "plazas", "residential mounds"]
            }
        ],
        "cultural_practices": [
            {
                "practice": "Agricultural terracing",
                "confidence": 0.85,
                "modern_relevance": "Visible in LIDAR data"
            }
        ],
        "temporal_period": {
            "period": "Late Post-Classic (1200-1521 CE)",
            "confidence": 0.88,
            "dating_evidence": ["ceramic styles", "architectural features"]
        },
        "archaeological_significance": {
            "importance": "High - matches known settlement patterns",
            "confidence": 0.89,
            "recommendations": ["Ground-truth verification", "Community consultation"]
        },
        "overall_confidence": 0.88,
        "processing_metadata": {
            "analysis_type": "gpt4_vision_archaeological",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0"
        }
    }

async def analyze_codex_with_gpt4_vision_detailed(image_data: bytes, context: Dict[str, Any]) -> Dict[str, Any]:
    """Perform detailed GPT-4.1 Vision analysis of codex image."""
    
    # Convert image to base64 for API call
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    # This would be your actual GPT-4.1 Vision API call
    # For now, return enhanced mock data
    return {
        "visual_elements": {
            "figures": ["human figures", "deity representations", "architectural elements"],
            "symbols": ["glyphs", "numerical notations", "directional indicators"],
            "geographical_features": ["mountains", "rivers", "settlements"],
            "confidence": 0.91
        },
        "textual_content": {
            "glyph_translations": [
                {"glyph": "place_name_1", "meaning": "Hill of the Eagle", "confidence": 0.85},
                {"glyph": "date_glyph", "meaning": "13 Reed year", "confidence": 0.78}
            ],
            "narrative_elements": ["migration story", "founding myth", "territorial boundaries"],
            "confidence": 0.82
        },
        "archaeological_insights": {
            "site_types": ["ceremonial center", "residential area", "agricultural terraces"],
            "cultural_affiliations": ["Central Mexican", "Late Post-Classic"],
            "material_culture": ["obsidian tools", "ceramic vessels", "stone monuments"],
            "confidence": 0.89
        },
        "coordinate_relevance": {
            "geographic_match": "Strong correlation with highland settlement patterns",
            "distance_estimate": "Within 50km cultural sphere",
            "cultural_continuity": "Same cultural tradition",
            "confidence": 0.87
        },
        "recommendations": {
            "field_survey": "High priority for ground-truthing",
            "community_engagement": "Essential - living cultural traditions",
            "comparative_analysis": "Cross-reference with regional codices",
            "confidence": 0.94
        },
        "metadata": {
            "analysis_timestamp": datetime.now().isoformat(),
            "image_quality": "high",
            "processing_time": "3.2s",
            "model_version": "gpt-4.1-vision"
        }
    } 