#!/usr/bin/env python3
"""
Quick test script for the satellite endpoint - SUBMISSION DAY!
"""
import requests
import json
import sys

def test_satellite_endpoint():
    """Test the new local satellite endpoint"""
    print("🚀 SUBMISSION DAY - Testing Satellite Endpoint!")
    print("=" * 50)
    
    # Test coordinates (Amazon region with real data)
    test_coords = [
        {"lat": -3.4653, "lng": -62.2159, "name": "Amazon Real Data"},
        {"lat": 0.0, "lng": 0.0, "name": "Fallback Test"}
    ]
    
    for coord in test_coords:
        print(f"\n🧪 Testing: {coord['name']}")
        print(f"📍 Coordinates: {coord['lat']}, {coord['lng']}")
        
        url = f"http://localhost:8000/satellite/imagery/local"
        params = {
            "lat": coord["lat"],
            "lng": coord["lng"], 
            "radius": 50
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            print(f"📡 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Got {data.get('total', 0)} images")
                print(f"🔍 Real data available: {data.get('real_data_available', False)}")
                print(f"📊 Message: {data.get('message', 'No message')}")
                
                if data.get('images'):
                    img = data['images'][0]
                    print(f"🛰️  Platform: {img.get('platform', 'Unknown')}")
                    print(f"📈 Quality Score: {img.get('quality_score', 0)}")
                    print(f"🏛️  Archaeological Potential: {img.get('archaeological_potential', 0)}")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print("❌ Backend not running on port 8000")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 SUBMISSION READY!")

if __name__ == "__main__":
    test_satellite_endpoint() 