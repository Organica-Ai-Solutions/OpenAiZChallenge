#!/bin/bash

# 🗺️ Map Analysis Endpoints Test Script
# Tests all NIS Protocol endpoints for map integration

BASE_URL="http://localhost:8000"
echo "🚀 Testing Map Analysis Endpoints - NIS Protocol Integration"
echo "============================================================"

# Test 1: Health Check
echo "🔍 Testing Backend Health..."
curl -s -w "Status: %{http_code}\n" "$BASE_URL/health" || echo "❌ Health check failed"
echo ""

# Test 2: Area Analysis with Polygon Data
echo "🔬 Testing Area Analysis Endpoint..."
curl -X POST "$BASE_URL/analyze/area" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "area_id": "test_polygon_001",
    "area_type": "polygon",
    "coordinates": {
      "path": [
        {"lat": -15.7942, "lng": -47.8822},
        {"lat": -15.7952, "lng": -47.8822},
        {"lat": -15.7952, "lng": -47.8812},
        {"lat": -15.7942, "lng": -47.8812}
      ]
    },
    "sites_count": 3,
    "sites_data": [
      {
        "id": "test_site_1",
        "name": "Test Archaeological Site",
        "type": "settlement",
        "period": "Classic",
        "coordinates": "-15.7947,-47.8817",
        "confidence": 0.85,
        "cultural_significance": "High"
      }
    ],
    "analysis_timestamp": "2024-12-26T15:30:00Z",
    "nis_protocol_active": true
  }' || echo "❌ Area analysis failed"
echo ""

# Test 3: Agent Analysis
echo "🤖 Testing Agent Analysis Endpoint..."
curl -X POST "$BASE_URL/agents/analyze/area" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "area_type": "polygon",
    "analysis_type": "comprehensive_area",
    "include_correlations": true,
    "include_patterns": true,
    "sites_count": 2
  }' || echo "❌ Agent analysis failed"
echo ""

# Test 4: Cultural Analysis
echo "🏛️ Testing Cultural Analysis Endpoint..."
curl -X POST "$BASE_URL/cultural/analyze" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "area_type": "polygon",
    "focus": "cultural_patterns",
    "sites_data": [
      {
        "type": "ceremonial",
        "period": "Classic",
        "cultural_significance": "Very High"
      }
    ]
  }' || echo "❌ Cultural analysis failed"
echo ""

# Test 5: Trade Route Analysis
echo "🚛 Testing Trade Route Analysis Endpoint..."
curl -X POST "$BASE_URL/trade/analyze" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "area_type": "polygon",
    "focus": "trade_networks",
    "sites_data": [
      {
        "type": "trade",
        "period": "Post-Classic"
      }
    ]
  }' || echo "❌ Trade analysis failed"
echo ""

# Test 6: Site Discovery
echo "🎯 Testing Site Discovery Endpoint..."
curl -X POST "$BASE_URL/discover/site" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "coordinates": {
      "lat": -15.7945,
      "lng": -47.8818
    },
    "discovery_type": "manual_selection",
    "analysis_depth": "comprehensive",
    "include_lidar": true,
    "include_satellite": true,
    "nis_protocol_active": true
  }' || echo "❌ Site discovery failed"
echo ""

# Test 7: Data Storage
echo "💾 Testing Data Storage Endpoint..."
curl -X POST "$BASE_URL/research/analysis/store" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "analysis_id": "test_storage_001",
    "area_data": {
      "id": "test_area",
      "type": "polygon"
    },
    "results": {
      "confidence": 0.85,
      "nis_protocol_complete": true
    },
    "timestamp": "2024-12-26T15:30:00Z",
    "researcher_id": "test_user"
  }' || echo "❌ Data storage failed"
echo ""

# Test 8: Memory Agent Storage
echo "🧠 Testing Memory Agent Storage..."
curl -X POST "$BASE_URL/agents/memory/store" \
  -H "Content-Type: application/json" \
  -w "Status: %{http_code}\n" \
  -d '{
    "type": "area_analysis",
    "data": {
      "analysis_id": "test_memory_001"
    },
    "metadata": {
      "source": "map_interface",
      "nis_protocol_version": "2.0"
    }
  }' || echo "❌ Memory storage failed"
echo ""

echo "============================================================"
echo "🎯 Map Analysis Endpoints Test Complete"
echo ""
echo "Expected responses:"
echo "  • 200: Success"
echo "  • 404: Endpoint not implemented (acceptable)"
echo "  • 422: Validation error (acceptable for test data)"
echo "  • 500: Server error (needs investigation)"
echo ""
echo "✅ All endpoints tested for NIS Protocol map integration" 