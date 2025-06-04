# NIS Protocol Endpoint Map for Frontend Integration

## Backend Status: ✅ VERIFIED AND FUNCTIONAL

### Core Analysis Endpoints

| Endpoint | Method | Purpose | Frontend Usage | Status |
|----------|--------|---------|----------------|--------|
| `/analyze` | POST | Coordinate archaeological analysis | `/analyze` command in chat | ✅ Working |
| `/vision/analyze` | POST | AI vision analysis of satellite imagery | `/vision` command in chat | ✅ Working |
| `/agents/chat` | POST | General conversational AI | General chat messages | ✅ Working |

### Discovery & Research Endpoints

| Endpoint | Method | Purpose | Frontend Usage | Status |
|----------|--------|---------|----------------|--------|
| `/research/sites` | GET | List archaeological sites | `/discover` command & site listings | ✅ Working |
| `/research/sites/discover` | POST | Submit new research sites | Site submission forms | ✅ Available |
| `/agents/agents` | GET | List AI agents and status | `/status` command & agent displays | ✅ Working |

### System Monitoring Endpoints

| Endpoint | Method | Purpose | Frontend Usage | Status |
|----------|--------|---------|----------------|--------|
| `/system/health` | GET | Backend health check | Connection status indicator | ✅ Working |
| `/system/diagnostics` | GET | Detailed system diagnostics | Advanced status displays | ✅ Available |
| `/statistics/statistics` | GET | System statistics | Dashboard statistics | ✅ Available |

## Request/Response Formats

### 1. Coordinate Analysis (`/analyze`)

**Request:**
```json
{
  "lat": -3.4653,
  "lon": -62.2159
}
```

**Response:**
```json
{
  "location": {"lat": -3.4653, "lon": -62.2159},
  "confidence": 0.95,
  "description": "Archaeological analysis completed...",
  "pattern_type": "Trade route markers",
  "historical_context": "Archaeological analysis of valley region...",
  "indigenous_perspective": "Traditional ecological knowledge...",
  "finding_id": "nis_3465_62215_1749065842",
  "recommendations": [
    {
      "action": "Immediate Site Investigation",
      "description": "High confidence trade route markers requires field verification",
      "priority": "High"
    }
  ]
}
```

### 2. Vision Analysis (`/vision/analyze`)

**Request:**
```json
{
  "coordinates": "-3.4653, -62.2159",
  "models": ["gpt4o_vision", "archaeological_analysis"],
  "confidence_threshold": 0.4
}
```

**Response:**
```json
{
  "detection_results": [
    {
      "type": "geometric_pattern",
      "description": "Rectangular formations detected",
      "confidence": 0.87
    }
  ],
  "satellite_findings": {
    "confidence": 0.75,
    "features_detected": [...]
  },
  "metadata": {
    "models_used": ["gpt4o_vision", "archaeological_analysis"],
    "processing_time": "13.5",
    "high_confidence_features": "Multiple"
  }
}
```

### 3. Site Discovery (`/research/sites`)

**Request:** 
```
GET /research/sites?max_sites=5&min_confidence=0.7
```

**Response:**
```json
[
  {
    "site_id": "site_001",
    "name": "Nazca Lines Complex",
    "coordinates": "-14.739, -75.13",
    "confidence": 0.98,
    "discovery_date": "2023-11-15",
    "cultural_significance": "Ancient ceremonial and astronomical site...",
    "pattern_type": "Geoglyphs"
  }
]
```

### 4. Agent Status (`/agents/agents`)

**Response:**
```json
[
  {
    "id": "vision_agent",
    "name": "Archaeological Vision Agent",
    "type": "vision_analysis",
    "status": "online",
    "performance": {
      "accuracy": 96.5,
      "processing_time": "3.9s",
      "total_analyses": 1156,
      "success_rate": 96.4
    },
    "capabilities": ["satellite_image_analysis", "feature_detection", ...],
    "cultural_awareness": "High - trained on indigenous archaeological knowledge"
  }
]
```

### 5. General Chat (`/agents/chat`)

**Request:**
```json
{
  "message": "What can you tell me about archaeological sites in the Amazon?",
  "mode": "reasoning",
  "context": {"chat_history": []}
}
```

**Response:**
```json
{
  "response": "I can help you discover archaeological sites...",
  "reasoning": "User is asking about general archaeological information...",
  "action_type": "informational",
  "confidence": 0.85
}
```

## Chat Command Mapping

| Chat Command | Backend Endpoint | Function | Status |
|--------------|------------------|----------|--------|
| `/discover` | `/research/sites` | Find archaeological sites | ✅ Working |
| `/analyze [coords]` | `/analyze` | Analyze specific coordinates | ✅ Working |
| `/vision [coords]` | `/vision/analyze` | AI vision analysis | ✅ Working |
| `/research [query]` | `/agents/agents` + `/research/sites` | Research capabilities | ✅ Working |
| `/suggest [region]` | `/research/sites` | Location recommendations | ✅ Working |
| `/status` | `/system/health` + `/agents/agents` | System status | ✅ Working |
| General messages | `/agents/chat` | Conversational AI | ✅ Working |

## Integration Notes

### Frontend Fixes Applied:
1. ✅ **Fixed field mapping**: Updated `handleAnalysisCommand` to use correct backend response fields (`pattern_type`, `description`, `historical_context`, `indigenous_perspective`)
2. ✅ **Fixed agent structure**: Updated agent queries to use correct performance structure (`performance.accuracy` instead of `accuracy`)
3. ✅ **Verified all endpoints**: All critical endpoints tested and working

### Backend Integration Status:
- 🟢 **Core NIS Protocol**: Fully operational with LangGraph orchestration
- 🟢 **GPT Integration**: GPT-4 Vision and GPT-4 Turbo working
- 🟢 **Agent Network**: 5 active agents (Vision, Memory, Reasoning, Action, Integration)
- 🟢 **Data Sources**: Satellite, LIDAR, historical, ethnographic data available
- 🟢 **Real-time Processing**: Sub-second to ~13s response times depending on complexity

### UI/UX Status:
- 🎨 **AnimatedAIChat**: Fully functional with command palette and smooth animations
- ⚡ **Real-time Updates**: Immediate feedback and typing indicators
- 🔧 **Error Handling**: Comprehensive error messages and fallback behaviors
- 📱 **Responsive Design**: Works across different screen sizes

All chat commands and buttons are now properly integrated with the NIS Protocol backend and returning real archaeological analysis data. 