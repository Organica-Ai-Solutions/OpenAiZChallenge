from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import asyncio
import uuid
import numpy as np

from ..data_processing.pipeline import process_research_location, ResearchDataPoint
from ..core.enums import DataSourceType, ValidationStatus

router = APIRouter()

class ResearchSiteRequest(BaseModel):
    """Request model for submitting a research site."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude of the research site")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude of the research site")
    data_sources: Optional[List[DataSourceType]] = None
    description: Optional[str] = None
    researcher_metadata: Optional[Dict[str, Any]] = None

class ResearchSite(BaseModel):
    """Comprehensive research site model."""
    site_id: str
    latitude: float
    longitude: float
    confidence_score: float
    data_sources: List[DataSourceType]
    validation_status: ValidationStatus
    description: Optional[str] = None
    cultural_significance: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ResearchSubmission(BaseModel):
    """Model for submitting multiple research sites."""
    researcher_id: Optional[str] = None
    sites: List[ResearchSiteRequest]

class ResearchSubmissionResponse(BaseModel):
    """Response model for research site submissions."""
    submission_id: str
    researcher_id: Optional[str]
    total_sites_submitted: int
    validated_sites: List[ResearchSite]
    overall_confidence: float

@router.post("/sites/discover", response_model=ResearchSubmissionResponse)
async def discover_archaeological_sites(submission: ResearchSubmission):
    """
    Submit and validate potential archaeological sites
    
    Args:
        submission (ResearchSubmission): Research site discovery submission
    
    Returns:
        ResearchSubmissionResponse: Validation results and processed sites
    """
    # Generate a unique submission ID
    submission_id = str(uuid.uuid4())
    
    # Process sites concurrently
    site_processing_tasks = []
    for site_request in submission.sites:
        task = asyncio.create_task(
            process_research_location(
                site_id=str(uuid.uuid4()),
                latitude=site_request.latitude,
                longitude=site_request.longitude,
                data_sources=site_request.data_sources
            )
        )
        site_processing_tasks.append(task)
    
    # Wait for all site processing to complete
    processed_sites: List[ResearchDataPoint] = await asyncio.gather(*site_processing_tasks)
    
    # Convert processed sites to response model
    validated_sites = []
    for data_point in processed_sites:
        validated_sites.append(
            ResearchSite(
                site_id=data_point.site_id,
                latitude=data_point.latitude,
                longitude=data_point.longitude,
                confidence_score=data_point.confidence_score,
                data_sources=list(data_point.data_sources.keys()),
                validation_status=data_point.validation_status,
                description=data_point.metadata.get('description'),
                metadata=data_point.metadata
            )
        )
    
    # Calculate overall submission confidence
    overall_confidence = (
        sum(site.confidence_score for site in validated_sites) / 
        len(validated_sites) if validated_sites else 0.0
    )
    
    return ResearchSubmissionResponse(
        submission_id=submission_id,
        researcher_id=submission.researcher_id,
        total_sites_submitted=len(submission.sites),
        validated_sites=validated_sites,
        overall_confidence=overall_confidence
    )

@router.get("/sites", response_model=List[ResearchSite])
async def list_research_sites(
    min_confidence: Optional[float] = 0.7,
    data_source: Optional[DataSourceType] = None,
    max_sites: Optional[int] = 10
):
    """
    List archaeological research sites with optional filtering
    
    Args:
        min_confidence (float, optional): Minimum confidence threshold
        data_source (DataSourceType, optional): Filter by data source type
        max_sites (int, optional): Maximum number of sites to return
    
    Returns:
        List of research sites meeting the criteria
    """
    # Simulated research sites with more complex generation
    all_sites = []
    for _ in range(20):  # Generate more sites to allow for filtering
        site_data_point = await process_research_location(
            site_id=str(uuid.uuid4()),
            latitude=np.random.uniform(-10, -2),  # Amazon region approximation
            longitude=np.random.uniform(-70, -60)
        )
        
        site = ResearchSite(
            site_id=site_data_point.site_id,
            latitude=site_data_point.latitude,
            longitude=site_data_point.longitude,
            confidence_score=site_data_point.confidence_score,
            data_sources=list(site_data_point.data_sources.keys()),
            validation_status=site_data_point.validation_status,
            description=site_data_point.metadata.get('description'),
            metadata=site_data_point.metadata
        )
        
        all_sites.append(site)
    
    # Apply filters
    filtered_sites = [
        site for site in all_sites 
        if site.confidence_score >= min_confidence and 
        (data_source is None or data_source in site.data_sources)
    ]
    
    # Sort by confidence score and limit results
    filtered_sites.sort(key=lambda x: x.confidence_score, reverse=True)
    return filtered_sites[:max_sites] 