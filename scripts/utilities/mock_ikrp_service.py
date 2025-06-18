#!/usr/bin/env python3
"""
Mock IKRP Codex Discovery Service
Provides mock endpoints for demonstration of the codex discovery feature.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import random
import time
from datetime import datetime

app = FastAPI(
    title="Mock NIS Protocol Codex Discovery Service",
    description="Mock service for automated codex discovery and GPT-4.1 Vision analysis",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_CODICES = [
    {
        "id": "famsi_borgia",
        "title": "Codex Borgia",
        "source": "FAMSI",
        "image_url": "https://digi.vatlib.it/iiif/MSS_Borg.mess.1/canvas/p0001",
        "period": "pre-columbian",
        "geographic_relevance": "Central Mexico - relevant to highland settlements",
        "relevance_score": 0.92,
        "content_type": "pictorial_manuscript",
        "auto_extractable": True,
        "metadata": {
            "archive": "famsi",
            "original_id": "borgia",
            "collection": "Akademische Druck- u. Verlagsanstalt Graz"
        }
    },
    {
        "id": "famsi_mendoza",
        "title": "Codex Mendoza",
        "source": "FAMSI",
        "image_url": "https://digital.bodleian.ox.ac.uk/objects/2fea788e-2aa2-4f08-b6d9-648c00486220/surfaces/ms-arch-selden-a-1-002r/",
        "period": "colonial",
        "geographic_relevance": "Tenochtitlan region - urban settlement patterns",
        "relevance_score": 0.88,
        "content_type": "tribute_manuscript",
        "auto_extractable": True,
        "metadata": {
            "archive": "famsi",
            "original_id": "mendoza",
            "collection": "Bodleian Library"
        }
    },
    {
        "id": "wdl_florentine",
        "title": "Florentine Codex - General History of the Things of New Spain",
        "source": "World Digital Library",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Florentine_Codex_IX_Aztec_Warriors.jpg/1024px-Florentine_Codex_IX_Aztec_Warriors.jpg",
        "period": "colonial",
        "geographic_relevance": "Central Mexico - comprehensive ethnographic record",
        "relevance_score": 0.85,
        "content_type": "ethnographic_manuscript",
        "auto_extractable": True,
        "metadata": {
            "archive": "world_digital_library",
            "author": "Bernardino de Sahagún",
            "year": "1575-1577"
        }
    },
    {
        "id": "inah_xolotl",
        "title": "Códice Xólotl",
        "source": "INAH",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Codice_Xolotl_Lamina_I.jpg/1024px-Codice_Xolotl_Lamina_I.jpg",
        "period": "colonial",
        "geographic_relevance": "Valley of Mexico - Texcoco region",
        "relevance_score": 0.88,
        "content_type": "cartographic_historical",
        "auto_extractable": True,
        "metadata": {
            "archive": "inah",
            "location": "Texcoco",
            "cultural_group": "Acolhua"
        }
    }
]

MOCK_SOURCES = [
    {
        "id": "famsi",
        "name": "Foundation for Ancient Mesoamerican Studies",
        "total_codices": 8,
        "status": "active"
    },
    {
        "id": "world_digital_library",
        "name": "World Digital Library",
        "total_codices": 12,
        "status": "active"
    },
    {
        "id": "inah",
        "name": "Instituto Nacional de Antropología e Historia",
        "total_codices": 6,
        "status": "active"
    }
]

class CodexDiscoveryRequest(BaseModel):
    coordinates: Dict[str, float]
    radius_km: Optional[float] = 50.0
    period: Optional[str] = "all"
    sources: Optional[List[str]] = ["famsi", "world_digital_library", "inah"]
    max_results: Optional[int] = 20

class CodexAnalysisRequest(BaseModel):
    codex_id: str
    image_url: str
    coordinates: Optional[Dict[str, float]] = None
    context: Optional[str] = None

class CodexDownloadRequest(BaseModel):
    codex_id: str
    download_type: Optional[str] = "full"  # "full", "metadata", "images"
    include_metadata: Optional[bool] = True
    include_images: Optional[bool] = True

@app.get("/")
async def root():
    """Root endpoint with system information."""
    return {
        "message": "Mock NIS Protocol Codex Discovery Service",
        "version": "1.0.0",
        "features": [
            "Automated codex discovery",
            "GPT-4.1 Vision analysis (mock)",
            "Historical document integration",
            "Multi-archive search"
        ],
        "codex_sources": ["FAMSI", "World Digital Library", "INAH"],
        "status": "operational"
    }

@app.get("/codex/sources")
async def list_sources():
    """List available digital archive sources."""
    return {"sources": MOCK_SOURCES}

@app.post("/codex/discover")
async def discover_codices(request: CodexDiscoveryRequest):
    """Discover relevant codices for archaeological coordinates."""
    
    # Simulate processing time
    start_time = time.time()
    
    # Filter codices based on request
    filtered_codices = []
    for codex in MOCK_CODICES:
        if request.period != "all" and codex["period"] != request.period:
            continue
        if codex["metadata"]["archive"] not in request.sources:
            continue
        
        # Add some randomization to relevance scores
        codex_copy = codex.copy()
        codex_copy["relevance_score"] = min(1.0, codex["relevance_score"] + random.uniform(-0.1, 0.1))
        filtered_codices.append(codex_copy)
    
    # Sort by relevance and limit results
    filtered_codices.sort(key=lambda x: x["relevance_score"], reverse=True)
    filtered_codices = filtered_codices[:request.max_results]
    
    # Auto-analyze top 3 codices (mock)
    auto_analyzed = min(3, len(filtered_codices))
    for i in range(auto_analyzed):
        filtered_codices[i]["analysis"] = {
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
            "overall_confidence": 0.88
        }
    
    processing_time = time.time() - start_time
    
    return {
        "success": True,
        "total_codices_found": len(filtered_codices),
        "auto_analyzed": auto_analyzed,
        "codices": filtered_codices,
        "search_metadata": {
            "coordinates": request.coordinates,
            "radius_km": request.radius_km,
            "sources_searched": request.sources,
            "processing_time": f"{processing_time:.2f}s",
            "timestamp": datetime.now().isoformat()
        }
    }

@app.post("/codex/analyze")
async def analyze_codex(request: CodexAnalysisRequest):
    """Analyze a specific codex using GPT-4.1 Vision (mock)."""
    
    start_time = time.time()
    
    # Debug print
    print(f"🔍 Analyzing codex: {request.codex_id}")
    
    # Get specific analysis based on codex
    if request.codex_id == "inah_xolotl":
        print("✅ Using enhanced Códice Xólotl analysis")
        # Specific analysis for Códice Xólotl
        analysis = {
            "visual_elements": {
                "figures": [
                    "Acolhua nobles and rulers",
                    "Chichimec warriors", 
                    "Architectural structures",
                    "Genealogical sequences",
                    "Territorial markers"
                ],
                "symbols": [
                    "Texcoco glyph (hill with pottery)",
                    "Calendar signs (year bearers)",
                    "Place name glyphs",
                    "Genealogical connections",
                    "Tribute markers",
                    "Water symbols (Lake Texcoco)"
                ],
                "geographical_features": [
                    "Lake Texcoco basin",
                    "Tepeyac hill",
                    "Texcoco urban center", 
                    "Agricultural chinampas",
                    "Trade route networks",
                    "Ceremonial complexes"
                ],
                "confidence": 0.94
            },
            "textual_content": {
                "glyph_translations": [
                    {
                        "glyph": "texcoco_place_glyph", 
                        "meaning": "Texcoco - Place of the Stone Pot",
                        "confidence": 0.92
                    },
                    {
                        "glyph": "xolotl_ruler_glyph",
                        "meaning": "Xólotl - Chichimec leader",
                        "confidence": 0.89
                    },
                    {
                        "glyph": "quinatzin_glyph",
                        "meaning": "Quinatzin - Noble ruler",
                        "confidence": 0.87
                    },
                    {
                        "glyph": "acolhuacan_territory",
                        "meaning": "Acolhuacan - Land of the Acolhua",
                        "confidence": 0.85
                    },
                    {
                        "glyph": "year_10_rabbit",
                        "meaning": "10 Rabbit year (1274 CE)",
                        "confidence": 0.83
                    }
                ],
                "narrative_elements": [
                    "Chichimec migration from the north",
                    "Foundation of Texcoco dynasty",
                    "Acolhua territorial expansion",
                    "Alliance formations",
                    "Genealogical legitimacy claims",
                    "Lake Texcoco settlement patterns"
                ],
                "confidence": 0.88
            },
            "archaeological_insights": {
                "site_types": [
                    "Urban ceremonial center (Texcoco)",
                    "Lakeside settlement platforms",
                    "Agricultural terracing systems", 
                    "Defensive hilltop positions",
                    "Trade market complexes",
                    "Noble residential compounds"
                ],
                "cultural_affiliations": [
                    "Acolhua (primary)",
                    "Chichimec heritage",
                    "Central Mexican highlands",
                    "Late Post-Classic period",
                    "Triple Alliance member"
                ],
                "material_culture": [
                    "Texcoco polychrome ceramics",
                    "Obsidian blade workshops",
                    "Feathered textile production",
                    "Stone sculpture workshops",
                    "Codex paper manufacturing",
                    "Lacustrine resource exploitation"
                ],
                "temporal_markers": [
                    "1274 CE - Xólotl arrival",
                    "1298 CE - Texcoco foundation", 
                    "1431 CE - Triple Alliance formation",
                    "1515 CE - Nezahualcóyotl rule",
                    "1519 CE - Spanish contact"
                ],
                "confidence": 0.91
            },
            "coordinate_relevance": {
                "geographic_match": "Exact correspondence with Lake Texcoco basin",
                "distance_estimate": "Direct match - Valley of Mexico core area",
                "cultural_continuity": "Strong Acolhua cultural traditions preserved",
                "archaeological_correlation": "Matches known Texcoco archaeological zones",
                "confidence": 0.96
            },
            "recommendations": {
                "field_survey": "Priority excavation at Texcoco ceremonial center - high potential for royal burials and elite residential areas",
                "community_engagement": "Critical - Texcoco descendants maintain oral traditions and ceremonial knowledge",
                "comparative_analysis": "Cross-reference with Codex Mendoza tribute lists and Mapa Quinatzin genealogies",
                "archival_research": "Review INAH Texcoco excavation reports and colonial documentation",
                "cultural_protocols": "Coordinate with Texcoco cultural center and Acolhua heritage groups",
                "confidence": 0.93
            },
            "cultural_context": {
                "historical_significance": "Records the foundation of one of Mesoamerica's most important political centers",
                "genealogical_importance": "Documents legitimate succession from Chichimec founders to Acolhua nobility",
                "territorial_claims": "Maps Acolhua territorial expansion and tribute relationships",
                "urban_planning": "Shows early urban planning concepts in Lake Texcoco environment"
            },
            "metadata": {
                "analysis_timestamp": datetime.now().isoformat(),
                "image_quality": "excellent - high resolution scan",
                "processing_time": "4.7s",
                "model_version": "gpt-4.1-vision-archaeological-specialist",
                "cultural_specialist": "Acolhua/Texcoco cultural context",
                "confidence_overall": 0.91
            }
        }
    else:
        # Generic analysis for other codices
        analysis = {
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
                "model_version": "gpt-4.1-vision-mock"
            }
        }
    
    processing_time = time.time() - start_time
    confidence = random.uniform(0.85, 0.96) if request.codex_id == "inah_xolotl" else random.uniform(0.82, 0.94)
    
    return {
        "success": True,
        "codex_id": request.codex_id,
        "analysis": analysis,
        "confidence": confidence,
        "processing_time": processing_time
    }

@app.post("/codex/download")
async def download_full_codex(request: CodexDownloadRequest):
    """Download complete codex with all metadata and images."""
    
    start_time = time.time()
    
    # Find the requested codex
    codex = None
    for c in MOCK_CODICES:
        if c["id"] == request.codex_id:
            codex = c.copy()
            break
    
    if not codex:
        return {"success": False, "error": "Codex not found"}
    
    # Generate comprehensive download data
    full_data = {
        "codex_info": codex,
        "download_metadata": {
            "download_id": f"download_{request.codex_id}_{int(time.time())}",
            "download_timestamp": datetime.now().isoformat(),
            "download_type": request.download_type,
            "file_format": "json",
            "completeness": "100%"
        }
    }
    
    if request.include_metadata:
        full_data["extended_metadata"] = {
            "cultural_context": {
                "origin_culture": "Aztec/Mexica" if "mexica" in codex["title"].lower() else "Mesoamerican",
                "time_period": "1300-1600 CE" if codex["period"] == "colonial" else "1000-1521 CE",
                "geographic_origin": "Central Mexico" if "Central Mexico" in codex["geographic_relevance"] else "Mesoamerica",
                "language_family": "Nahuatl" if "mexica" in codex["title"].lower() else "Various Mesoamerican"
            },
            "physical_description": {
                "material": "Amate paper" if "pre-columbian" in codex["period"] else "European paper",
                "dimensions": "Variable folios",
                "preservation_state": "Well preserved",
                "total_folios": random.randint(20, 100)
            },
            "digital_collection": {
                "institution": codex["source"],
                "collection_id": codex["metadata"]["original_id"],
                "access_rights": "Public domain" if codex["source"] == "FAMSI" else "Restricted use",
                "digitization_quality": "High resolution"
            }
        }
    
    if request.include_images:
        # Generate sample image data references
        total_folios = full_data.get("extended_metadata", {}).get("physical_description", {}).get("total_folios", 50)
        full_data["image_collection"] = {
            "total_images": total_folios,
            "image_format": "TIFF/JPEG",
            "resolution": "300-600 DPI",
            "color_profile": "sRGB",
            "sample_images": [
                {
                    "folio_number": f"folio_{i:03d}",
                    "image_url": f"{codex['image_url']}/folio_{i:03d}.jpg",
                    "thumbnail_url": f"{codex['image_url']}/thumb_folio_{i:03d}.jpg",
                    "description": f"Folio {i} - {['Ritual scene', 'Calendar notation', 'Geographic reference', 'Genealogical record'][i % 4]}"
                }
                for i in range(1, min(6, total_folios + 1))  # Sample first 5 folios
            ]
        }
    
    # Add full transcription and translation data
    full_data["content_analysis"] = {
        "transcription": {
            "glyphs_identified": random.randint(200, 800),
            "transcription_confidence": 0.85,
            "languages_detected": ["Nahuatl", "Pictographic"],
            "sample_transcription": "Ōmextin tlācatl īpan in altepetl Tēnōchtitlan..." if "mexica" in codex["title"].lower() else "Sample ancient text transcription..."
        },
        "translation": {
            "translation_confidence": 0.78,
            "translator_notes": "This codex contains important historical and cultural information",
            "sample_translation": "Two people in the city of Tenochtitlan..." if "mexica" in codex["title"].lower() else "Sample translation of ancient text..."
        },
        "archaeological_significance": {
            "importance_level": "High",
            "research_applications": [
                "Settlement pattern analysis",
                "Cultural practice documentation",
                "Historical chronology",
                "Linguistic research"
            ],
            "comparative_codices": [c["id"] for c in MOCK_CODICES if c["id"] != request.codex_id][:3]
        }
    }
    
    processing_time = time.time() - start_time
    full_data["download_metadata"]["processing_time"] = f"{processing_time:.2f}s"
    
    return {
        "success": True,
        "message": f"Full codex data for {codex['title']} prepared for download",
        "data": full_data,
        "file_size_estimate": f"{random.randint(5, 50)}MB",
        "download_instructions": "Save this JSON response to access the complete codex data offline"
    }

if __name__ == "__main__":
    print("🚀 Starting Mock NIS Protocol Codex Discovery Service")
    print("📜 Automated codex discovery enabled (mock)")
    print("🔍 GPT-4.1 Vision integration active (mock)")
    uvicorn.run(app, host="0.0.0.0", port=8001) 