# Simple analyze endpoint for testing
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SimpleLocation(BaseModel):
    lat: float
    lon: float

class SimpleRecommendation(BaseModel):
    action: str
    description: str
    priority: str
    details: Optional[Dict[str, Any]] = None

class SimpleAnalysisResult(BaseModel):
    location: SimpleLocation
    confidence: float
    description: str
    sources: List[str]
    historical_context: Optional[str] = None
    indigenous_perspective: Optional[str] = None
    pattern_type: Optional[str] = None
    finding_id: Optional[str] = None
    recommendations: Optional[List[SimpleRecommendation]] = None

class SimpleCoordinatesRequest(BaseModel):
    lat: float
    lon: float

@app.post("/analyze", response_model=SimpleAnalysisResult)
async def simple_analyze_coordinates(request: SimpleCoordinatesRequest):
    """Simple analyze endpoint for testing without heavy dependencies."""
    import uuid
    
    # Mock analysis result
    finding_id = str(uuid.uuid4())[:8]
    
    # Simple mock recommendations
    recommendations = [
        SimpleRecommendation(
            action="verify_natural_formation",
            description="Verify that the pattern is not a natural formation or imaging artifact.",
            priority="high",
            details={
                "methods": ["multi-temporal imagery", "geological consultation", "spectral analysis"],
                "comparison": "Check against known natural patterns in the region"
            }
        ),
        SimpleRecommendation(
            action="indigenous_consultation",
            description="Consult with local Indigenous communities about the site and its potential significance.",
            priority="high",
            details={
                "approach": "Respectful engagement with proper protocols",
                "purpose": "Incorporate traditional knowledge and ensure ethical research",
                "ethics": "Follow appropriate guidelines for working with Indigenous knowledge"
            }
        ),
        SimpleRecommendation(
            action="dual_verification",
            description="Ensure findings are verified through two independent methods as required by the challenge.",
            priority="high",
            details={
                "method1": "Visual analysis",
                "method2": f"Sentinel-2 Scene ID: S2A_MSIL2A_20224267",
                "requirement": "OpenAI to Z Challenge requires each finding to be verified by at least two independent methods"
            }
        )
    ]
    
    return SimpleAnalysisResult(
        location=SimpleLocation(lat=request.lat, lon=request.lon),
        confidence=0.06,
        description="No significant archaeological features detected at this location.",
        sources=[
            "Sentinel-2 Scene ID: S2A_MSIL2A_20224267",
            "Earth Archive LIDAR Tile #74166"
        ],
        historical_context="No applicable historical context without detected features.",
        indigenous_perspective="No applicable indigenous perspective without detected features.",
        pattern_type="",
        finding_id=finding_id,
        recommendations=recommendations
    ) 