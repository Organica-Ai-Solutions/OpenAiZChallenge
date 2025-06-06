#!/usr/bin/env python3
"""
Test script for the /analyze endpoint
"""

import requests
import json
from typing import Dict, Any

def test_analyze_endpoint():
    """Test the /analyze endpoint with correct data format"""
    print("🔍 Testing /analyze endpoint with proper data format")
    print("=" * 50)
    
    # Test coordinates for Lake Guatavita (El Dorado)
    test_coordinates = [
        {"lat": 5.1542, "lon": -73.7792, "name": "Lake Guatavita (El Dorado)"},
        {"lat": -14.739, "lon": -75.13, "name": "Nazca Lines"},
        {"lat": -3.4653, "lon": -62.2159, "name": "Amazon Settlement"},
    ]
    
    for coord in test_coordinates:
        print(f"\n🗺️ Testing {coord['name']} ({coord['lat']}, {coord['lon']})")
        print("-" * 40)
        
        try:
            response = requests.post(
                'http://localhost:8000/analyze',
                json={"lat": coord["lat"], "lon": coord["lon"]},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SUCCESS - Analysis completed")
                print(f"   📍 Location: {data.get('location', {})}")
                print(f"   📊 Confidence: {data.get('confidence', 0)*100:.1f}%")
                print(f"   🏛️ Pattern Type: {data.get('pattern_type', 'Unknown')}")
                print(f"   📋 Description: {data.get('description', '')[:100]}...")
                
                if 'recommendations' in data:
                    print(f"   💡 Recommendations: {len(data['recommendations'])} items")
                    for i, rec in enumerate(data['recommendations'][:2]):
                        print(f"      {i+1}. {rec.get('action', 'N/A')} ({rec.get('priority', 'Unknown')})")
                
            else:
                print(f"❌ FAILED - Status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                
        except Exception as e:
            print(f"❌ ERROR - {e}")
    
    print("\n" + "=" * 50)
    print("✅ /analyze endpoint testing complete!")

def test_analyze_with_invalid_data():
    """Test with invalid data to verify error handling"""
    print("\n🔍 Testing error handling with invalid data")
    print("=" * 50)
    
    invalid_tests = [
        ({}, "Empty object"),
        ({"lat": 5.1542}, "Missing lon"),
        ({"lon": -73.7792}, "Missing lat"),
        ({"lat": "invalid", "lon": -73.7792}, "Invalid lat type"),
        ({"lat": 5.1542, "lon": "invalid"}, "Invalid lon type"),
        ({"lat": 200, "lon": -73.7792}, "Invalid lat range"),
        ({"lat": 5.1542, "lon": 200}, "Invalid lon range"),
    ]
    
    for test_data, description in invalid_tests:
        try:
            response = requests.post(
                'http://localhost:8000/analyze',
                json=test_data,
                timeout=5
            )
            
            if response.status_code == 422:
                print(f"✅ {description} - Correctly rejected (422)")
            else:
                print(f"⚠️ {description} - Unexpected status {response.status_code}")
                
        except Exception as e:
            print(f"❌ {description} - Error: {e}")

def main():
    """Run all analyze endpoint tests"""
    print("🧪 COMPREHENSIVE /analyze ENDPOINT TESTING")
    print("=" * 60)
    
    # Test valid requests
    test_analyze_endpoint()
    
    # Test error handling
    test_analyze_with_invalid_data()
    
    print("\n🎯 ENDPOINT SPECIFICATION")
    print("=" * 60)
    print("URL: POST http://localhost:8000/analyze")
    print("Required fields:")
    print("  • lat (number): Latitude coordinate (-90 to 90)")
    print("  • lon (number): Longitude coordinate (-180 to 180)")
    print("\nExample request:")
    print('  {"lat": 5.1542, "lon": -73.7792}')
    print("\nResponse includes:")
    print("  • location: Input coordinates")
    print("  • confidence: Analysis confidence (0-1)")
    print("  • description: Detailed analysis")
    print("  • pattern_type: Type of archaeological feature")
    print("  • historical_context: Historical information")
    print("  • indigenous_perspective: Cultural context")
    print("  • recommendations: Actionable suggestions")
    print("  • finding_id: Unique identifier")

if __name__ == "__main__":
    main() 