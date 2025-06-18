#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:8000"

echo "Testing NIS Protocol API Endpoints..."
echo "======================================"

# Test system health
echo -e "\n${GREEN}Testing /system/health${NC}"
curl -s "${BASE_URL}/system/health"

# Test system diagnostics
echo -e "\n\n${GREEN}Testing /system/diagnostics${NC}"
curl -s "${BASE_URL}/system/diagnostics"

# Test analyze endpoint
echo -e "\n\n${GREEN}Testing /analyze${NC}"
curl -s -X POST "${BASE_URL}/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -3.4653,
    "lon": -62.2159,
    "dataSources": {
      "satellite": true,
      "lidar": true
    }
  }'

# Test batch analyze endpoint
echo -e "\n\n${GREEN}Testing /batch/analyze${NC}"
curl -s -X POST "${BASE_URL}/batch/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates_list": [
      {"lat": -3.4653, "lon": -62.2159},
      {"lat": -8.5, "lon": -68.3}
    ],
    "data_sources": {
      "satellite": true,
      "lidar": true
    }
  }'

# Test statistics endpoint
echo -e "\n\n${GREEN}Testing /statistics/statistics${NC}"
curl -s "${BASE_URL}/statistics/statistics"

# Test research sites endpoint
echo -e "\n\n${GREEN}Testing /research/sites${NC}"
curl -s "${BASE_URL}/research/sites?min_confidence=0.5&max_sites=3"

# Test research sites discover endpoint
echo -e "\n\n${GREEN}Testing /research/sites/discover${NC}"
curl -s -X POST "${BASE_URL}/research/sites/discover" \
  -H "Content-Type: application/json" \
  -d '{
    "researcher_id": "test_researcher",
    "sites": [
      {
        "latitude": -3.4653,
        "longitude": -62.2159,
        "confidence": 0.85,
        "description": "Test site"
      }
    ]
  }'

# Test agents list endpoint
echo -e "\n\n${GREEN}Testing /agents/agents${NC}"
curl -s "${BASE_URL}/agents/agents"

# Test agent process endpoint
echo -e "\n\n${GREEN}Testing /agents/process${NC}"
curl -s -X POST "${BASE_URL}/agents/process" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "vision",
    "data": {
      "coordinates": "-3.4653,-62.2159",
      "data_source": "satellite"
    }
  }'

echo -e "\n\n${GREEN}Testing complete!${NC}\n" 