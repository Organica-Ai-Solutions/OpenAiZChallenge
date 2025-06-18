import requests
import json
from datetime import datetime
import random

# Brazilian archaeological discoveries
BRAZIL_DISCOVERIES = [
    {
        "name": "Bolivia Border Market Plaza",
        "lat": -15.2,
        "lon": -59.8,
        "confidence": 0.95,
        "type": "market",
        "cultural_significance": "Pre-Columbian trade center",
        "data_sources": ["satellite", "historical", "lidar"]
    },
    {
        "name": "Upper Amazon Residential Platform",
        "lat": -8.5,
        "lon": -63.2,
        "confidence": 0.924,
        "type": "settlement",
        "cultural_significance": "Ancient Amazonian settlement",
        "data_sources": ["satellite", "lidar"]
    },
    {
        "name": "Mato Grosso Astronomical Site",
        "lat": -12.8,
        "lon": -56.1,
        "confidence": 0.913,
        "type": "ceremonial",
        "cultural_significance": "Astronomical observatory",
        "data_sources": ["satellite", "lidar", "historical"]
    },
    {
        "name": "Rondônia Agricultural Terracing",
        "lat": -11.2,
        "lon": -62.8,
        "confidence": 0.887,
        "type": "agricultural",
        "cultural_significance": "Ancient farming system",
        "data_sources": ["satellite", "lidar"]
    },
    {
        "name": "Acre Defensive Earthworks",
        "lat": -9.8,
        "lon": -64.5,
        "confidence": 0.856,
        "type": "defensive",
        "cultural_significance": "Pre-Columbian fortification",
        "data_sources": ["satellite", "lidar", "historical"]
    }
]

def add_discoveries():
    """Add Brazilian archaeological discoveries to the system."""
    url = "http://localhost:8000/research/sites/discover"
    
    # Prepare the request
    request_data = {
        "researcher_id": "brazil_archaeology_team",
        "sites": [
            {
                "site_id": f"brazil_{i}",
                "name": site["name"],
                "coordinates": f"{site['lat']},{site['lon']}",
                "confidence": site["confidence"],
                "discovery_date": datetime.now().isoformat(),
                "cultural_significance": site["cultural_significance"],
                "data_sources": site["data_sources"],
                "type": site["type"]
            }
            for i, site in enumerate(BRAZIL_DISCOVERIES)
        ]
    }
    
    try:
        # Send the request
        response = requests.post(url, json=request_data)
        response.raise_for_status()
        
        # Print results
        result = response.json()
        print("\n✅ Successfully added Brazilian discoveries:")
        print(f"Total sites submitted: {result['total_sites_submitted']}")
        print(f"Overall confidence: {result['overall_confidence']:.2%}")
        print("\nValidated sites:")
        for site in result['validated_sites']:
            print(f"- {site['name']} ({site['confidence']:.2%} confidence)")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error adding discoveries: {e}")

if __name__ == "__main__":
    print("🌎 Adding Brazilian archaeological discoveries...")
    add_discoveries() 