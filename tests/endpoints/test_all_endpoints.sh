#!/bin/bash

echo "🏛️ NIS PROTOCOL ENDPOINT TESTING SUITE"
echo "========================================"

# Backend base URL
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

echo ""
echo "🔍 TESTING BACKEND ENDPOINTS..."
echo "--------------------------------"

# Test basic health endpoints
echo "1. Testing root endpoint..."
curl -s "$BACKEND_URL/" | jq '.' || echo "❌ Root endpoint failed"

echo ""
echo "2. Testing health check..."
curl -s "$BACKEND_URL/health" | jq '.' || echo "❌ Health check failed"

echo ""
echo "3. Testing API status..."
curl -s "$BACKEND_URL/api/status" | jq '.' || echo "❌ API status failed"

echo ""
echo "4. Testing archaeological sites..."
curl -s "$BACKEND_URL/api/sites" | jq '.sites | length' || echo "❌ Sites endpoint failed"

echo ""
echo "5. Testing specific site..."
curl -s "$BACKEND_URL/api/sites/site_001" | jq '.name' || echo "❌ Specific site failed"

echo ""
echo "6. Testing satellite data..."
curl -s "$BACKEND_URL/api/satellite/data" | jq '.' || echo "❌ Satellite data failed"

echo ""
echo "7. Testing agents endpoint..."
curl -s "$BACKEND_URL/api/agents" | jq '.' || echo "❌ Agents endpoint failed"

echo ""
echo "8. Testing discoveries..."
curl -s "$BACKEND_URL/api/discoveries" | jq '.' || echo "❌ Discoveries failed"

echo ""
echo "9. Testing codex sources..."
curl -s "$BACKEND_URL/api/codex/sources" | jq '.' || echo "❌ Codex sources failed"

echo ""
echo "10. Testing chat endpoint..."
curl -s -X POST "$BACKEND_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What archaeological sites are available?"}' | jq '.' || echo "❌ Chat failed"

echo ""
echo "11. Testing satellite imagery request..."
curl -s -X POST "$BACKEND_URL/api/satellite/imagery" \
  -H "Content-Type: application/json" \
  -d '{"lat": -13.1631, "lng": -72.5450, "zoom": 15}' | jq '.' || echo "❌ Satellite imagery failed"

echo ""
echo "12. Testing satellite analysis..."
curl -s -X POST "$BACKEND_URL/api/satellite/analysis" \
  -H "Content-Type: application/json" \
  -d '{"lat": -13.1631, "lng": -72.5450, "zoom": 15}' | jq '.' || echo "❌ Satellite analysis failed"

echo ""
echo "13. Testing codex discovery..."
curl -s -X POST "$BACKEND_URL/api/codex/discover" \
  -H "Content-Type: application/json" \
  -d '{"coordinates": {"lat": -13.1631, "lng": -72.5450}, "radius_km": 50}' | jq '.' || echo "❌ Codex discovery failed"

echo ""
echo "🌐 TESTING FRONTEND API ENDPOINTS..."
echo "------------------------------------"

echo ""
echo "14. Testing frontend vision analysis endpoint..."
# Create a small test image file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > test_image.png

curl -s -X POST "$FRONTEND_URL/api/vision/analyze" \
  -F "image=@test_image.png" \
  -F "analysis_type=archaeological" | jq '.' || echo "❌ Frontend vision analysis failed"

# Clean up
rm -f test_image.png

echo ""
echo "✅ ENDPOINT TESTING COMPLETE!"
echo "==============================" 