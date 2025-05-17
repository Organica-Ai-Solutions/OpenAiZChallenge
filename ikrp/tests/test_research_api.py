import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.enums import DataSourceType, ValidationStatus

client = TestClient(app)

def test_discover_archaeological_sites():
    """
    Test the archaeological site discovery endpoint
    """
    test_submission = {
        "researcher_id": "test_researcher_001",
        "sites": [
            {
                "latitude": -3.4653,
                "longitude": -62.2159,
                "data_sources": ["satellite", "indigenous_map"],
                "description": "Test archaeological site"
            },
            {
                "latitude": -5.8952,
                "longitude": -61.3326,
                "data_sources": ["lidar", "historical_text"],
                "description": "Another test site"
            }
        ]
    }
    
    response = client.post("/research/sites/discover", json=test_submission)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "submission_id" in data
    assert data["researcher_id"] == "test_researcher_001"
    assert data["total_sites_submitted"] == 2
    assert "validated_sites" in data
    assert "overall_confidence" in data
    
    for site in data["validated_sites"]:
        assert "site_id" in site
        assert "latitude" in site
        assert "longitude" in site
        assert "confidence_score" in site
        assert "validation_status" in site
        assert site["validation_status"] in [
            "LOW_CONFIDENCE", 
            "MEDIUM_CONFIDENCE", 
            "HIGH_CONFIDENCE"
        ]
        assert "data_sources" in site

def test_list_research_sites():
    """
    Test the research sites listing endpoint
    """
    response = client.get("/research/sites?min_confidence=0.7&max_sites=5")
    
    assert response.status_code == 200
    sites = response.json()
    
    assert len(sites) <= 5
    for site in sites:
        assert site["confidence_score"] >= 0.7
        assert "site_id" in site
        assert "latitude" in site
        assert "longitude" in site
        assert "validation_status" in site
        assert site["validation_status"] in [
            "LOW_CONFIDENCE", 
            "MEDIUM_CONFIDENCE", 
            "HIGH_CONFIDENCE"
        ]

def test_list_research_sites_with_data_source():
    """
    Test filtering research sites by data source
    """
    response = client.get("/research/sites?data_source=satellite&max_sites=10")
    
    assert response.status_code == 200
    sites = response.json()
    
    for site in sites:
        assert any(source.lower() == "satellite" for source in site["data_sources"])

def test_list_research_sites_with_low_confidence():
    """
    Test listing sites with lower confidence threshold
    """
    response = client.get("/research/sites?min_confidence=0.3&max_sites=15")
    
    assert response.status_code == 200
    sites = response.json()
    
    assert len(sites) > 0
    for site in sites:
        assert site["confidence_score"] >= 0.3

@pytest.mark.asyncio
async def test_research_site_discovery_async():
    """
    Test asynchronous site discovery with multiple data sources
    """
    test_submission = {
        "researcher_id": "async_test_researcher",
        "sites": [
            {
                "latitude": -4.5,
                "longitude": -63.5,
                "data_sources": ["satellite", "lidar", "historical_text", "indigenous_map"]
            }
        ]
    }
    
    response = client.post("/research/sites/discover", json=test_submission)
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["validated_sites"]) == 1
    site = data["validated_sites"][0]
    
    # Verify comprehensive site information
    assert set(site["data_sources"]) == {"satellite", "lidar", "historical_text", "indigenous_map"}
    assert site["confidence_score"] is not None
    assert site["validation_status"] in [
        "LOW_CONFIDENCE", 
        "MEDIUM_CONFIDENCE", 
        "HIGH_CONFIDENCE"
    ] 