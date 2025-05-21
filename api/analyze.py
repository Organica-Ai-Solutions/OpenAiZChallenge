from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Tuple, Union, Any
import logging

# Import the NIS Protocol integrator
from .agent_integrator import nis_protocol

# Set up logging
logger = logging.getLogger(__name__)

app = APIRouter()


class CoordinatesRequest(BaseModel):
    coordinates: str = Field(..., description="Comma-separated latitude and longitude")
    dataSources: Optional[Dict[str, bool]] = Field(
        default_factory=lambda: {
            "satellite": True,
            "lidar": True,
            "historicalTexts": True,
            "indigenousMaps": True,
        },
        description="Data sources to analyze"
    )


class Location(BaseModel):
    lat: float
    lon: float


class Recommendation(BaseModel):
    action: str
    description: str
    priority: str
    details: Optional[Dict[str, Any]] = None


class AnalysisResult(BaseModel):
    location: Location
    confidence: float
    description: str
    sources: List[str]
    historical_context: Optional[str] = None
    indigenous_perspective: Optional[str] = None
    pattern_type: Optional[str] = None
    finding_id: Optional[str] = None
    recommendations: Optional[List[Recommendation]] = None


def parse_coordinates(coord_str: str) -> Tuple[float, float]:
    """Parse a string containing latitude and longitude."""
    try:
        parts = coord_str.split(",")
        if len(parts) != 2:
            raise ValueError("Coordinates must be in format 'latitude, longitude'")
        
        lat = float(parts[0].strip())
        lon = float(parts[1].strip())
        
        # Basic validation
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise ValueError("Coordinates out of valid range")
            
        return lat, lon
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_coordinates(request: CoordinatesRequest = Body(...)):
    """Analyze coordinates for potential archaeological sites using the NIS Protocol."""
    # Parse and validate coordinates
    lat, lon = parse_coordinates(request.coordinates)
    
    # Get active data sources
    data_sources = request.dataSources or {
        "satellite": True,
        "lidar": True,
        "historicalTexts": True,
        "indigenousMaps": True,
    }
    
    logger.info(f"Analyzing coordinates {lat}, {lon} with data sources: {data_sources}")
    
    # Use the NIS Protocol to analyze the coordinates
    result = await nis_protocol.analyze_coordinates(
        lat=lat,
        lon=lon,
        use_satellite=data_sources.get("satellite", True),
        use_lidar=data_sources.get("lidar", True),
        use_historical=data_sources.get("historicalTexts", True),
        use_indigenous=data_sources.get("indigenousMaps", True)
    )
    
    # Recommendations should already be in the correct format from the NISProtocol/ActionAgent
    # The AnalysisResult model will validate them.
    recommendations_from_result = result.get("recommendations")
    
    # Return structured result
    return AnalysisResult(
        location=Location(lat=lat, lon=lon),
        confidence=result.get("confidence", 0.0),
        description=result.get("description", ""),
        sources=result.get("sources", []),
        historical_context=result.get("historical_context"),
        indigenous_perspective=result.get("indigenous_perspective"),
        pattern_type=result.get("pattern_type"),
        finding_id=result.get("finding_id"),
        recommendations=recommendations_from_result # Pass directly
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 