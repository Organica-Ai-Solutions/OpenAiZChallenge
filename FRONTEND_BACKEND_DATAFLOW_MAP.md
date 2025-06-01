# NIS Protocol Frontend-Backend Data Flow Architecture

## 🌐 **Complete Backend Endpoints Map for Frontend Integration**

This document outlines the comprehensive data flow architecture designed to take full advantage of the powerful NIS Protocol backend system.

---

## 📋 **COMPLETE BACKEND ENDPOINTS**

### **🏥 System Health & Monitoring**

| Endpoint | Method | Purpose | Frontend Usage | Cache TTL |
|----------|--------|---------|----------------|-----------|
| `/system/health` | GET | System health check | Real-time status indicators | 30s |
| `/system/diagnostics` | GET | Detailed system diagnostics | Admin dashboard, troubleshooting | 60s |
| `/statistics/statistics` | GET | System-wide statistics | Dashboard metrics, reports | 2m |

**Response Examples:**
```json
// /system/health
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "api": "operational",
    "redis": "operational", 
    "kafka": "operational",
    "langgraph": "operational",
    "agents": "operational"
  },
  "uptime": 86400,
  "version": "1.0.0"
}

// /statistics/statistics
{
  "total_analyses": 1247,
  "sites_discovered": 89,
  "average_confidence": 0.76,
  "processing_time_avg": 12.3,
  "agent_utilization": {
    "vision_agent": 0.85,
    "reasoning_agent": 0.92,
    "memory_agent": 0.78,
    "action_agent": 0.88
  }
}
```

### **🤖 Agent Management**

| Endpoint | Method | Purpose | Frontend Usage | Cache TTL |
|----------|--------|---------|----------------|-----------|
| `/agents/status` | GET | Agent status overview | Agent health indicators | 30s |
| `/agents/agents` | GET | Detailed agent information | Agent configuration panels | 60s |
| `/agents/process` | POST | Direct agent processing | Custom agent invocations | - |

**Response Examples:**
```json
// /agents/status
{
  "vision_agent": "online",
  "memory_agent": "online", 
  "reasoning_agent": "online",
  "action_agent": "online",
  "model_services": {
    "yolo8": "online",
    "waldo": "online", 
    "gpt4_vision": "online"
  },
  "processing_queue": 3,
  "langgraph_status": "operational"
}

// /agents/agents
{
  "agents": [
    {
      "name": "VisionAgent",
      "status": "operational",
      "capabilities": ["satellite_analysis", "lidar_processing", "gpt4_vision"],
      "last_activity": "2024-01-01T12:00:00Z",
      "success_rate": 98.2,
      "queue_size": 1
    }
  ]
}
```

### **🔍 Core Analysis**

| Endpoint | Method | Purpose | Frontend Usage | Cache TTL |
|----------|--------|---------|----------------|-----------|
| `/analyze` | POST | Single coordinate analysis | Main analysis interface | - |
| `/batch/analyze` | POST | Batch coordinate analysis | Bulk processing | - |
| `/batch/status/{batch_id}` | GET | Batch analysis status | Progress tracking | - |

**Request/Response Examples:**
```json
// POST /analyze
{
  "coordinates": { "lat": -3.4653, "lon": -62.2159 },
  "region": "amazon_basin",
  "data_sources": ["satellite", "lidar", "historical"],
  "confidence_threshold": 0.7,
  "advanced_options": {
    "use_satellite": true,
    "use_lidar": true,
    "use_historical": true,
    "use_indigenous": true,
    "enable_consciousness_node": true
  }
}

// Response
{
  "location": { "lat": -3.4653, "lon": -62.2159 },
  "confidence": 0.87,
  "pattern_type": "geometric_earthwork",
  "sources": ["sentinel2", "lidar_analysis", "colonial_maps"],
  "historical_context": "Potential pre-Columbian settlement...",
  "indigenous_perspective": "Area mentioned in oral histories...",
  "consciousness_analysis": { /* AI insights */ },
  "finding_id": "nis_20240101_001",
  "recommendations": [
    {
      "action": "field_survey",
      "description": "Ground-truthing recommended",
      "priority": "high"
    }
  ],
  "backend_status": "full_analysis_complete",
  "metadata": {
    "processing_time": 45.2,
    "models_used": ["yolo8", "waldo", "gpt4_vision"],
    "data_sources_accessed": ["satellite", "lidar", "historical"]
  }
}
```

### **👁️ Vision Analysis**

| Endpoint | Method | Purpose | Frontend Usage | Cache TTL |
|----------|--------|---------|----------------|-----------|
| `/vision/analyze` | POST | Vision-specific analysis | Vision Agent tab | - |
| `/vision/detections` | GET | Get detection results | Detection display | 5m |
| `/vision/real-time-updates` | GET | Real-time detection updates | Live updates | - |

**Examples:**
```json
// POST /vision/analyze
{
  "coordinates": "-3.4653,-62.2159",
  "models": ["yolo8", "waldo", "gpt4_vision"],
  "confidence_threshold": 0.4,
  "enable_layers": true,
  "processing_options": {
    "atmospheric_correction": true,
    "vegetation_indices": true,
    "terrain_correction": true,
    "enhancement": true
  }
}

// Response
{
  "detection_results": [
    {
      "id": "det_001",
      "label": "Geometric Pattern",
      "confidence": 0.87,
      "bounds": { "x": 20, "y": 15, "width": 150, "height": 120 },
      "model_source": "YOLO8",
      "feature_type": "settlement",
      "archaeological_significance": "High"
    }
  ],
  "processing_pipeline": [
    { "step": "Initial Image Processing", "status": "Complete", "timing": "2.1s" },
    { "step": "YOLO8 Pattern Detection", "status": "Complete", "timing": "1.8s" }
  ],
  "model_performance": {
    "yolo8": { "accuracy": 73, "processing_time": "1.8s", "features_detected": 6 },
    "ensemble": { "accuracy": 94, "processing_time": "0.8s", "final_features": 4 }
  },
  "execution_log": ["[12:34:56] INFO: Analysis started...", "..."],
  "metadata": { "processing_mode": "full_analysis" }
}
```

### **🏛️ Research & Discovery**

| Endpoint | Method | Purpose | Frontend Usage | Cache TTL |
|----------|--------|---------|----------------|-----------|
| `/research/sites` | GET | Get research sites | Map display, site lists | 5m |
| `/research/sites/discover` | POST | Submit new site discoveries | Site submission forms | - |
| `/research/sites/{site_id}` | GET | Get specific site details | Site detail views | 10m |

**Examples:**
```json
// GET /research/sites?min_confidence=0.7&max_sites=50
[
  {
    "id": "site_001",
    "name": "Amazon Geometric Complex A",
    "type": "settlement",
    "coordinates": "-3.4653,-62.2159",
    "confidence": 0.87,
    "description": "Large geometric earthwork complex...",
    "pattern_type": "geometric_earthwork",
    "historical_context": "Pre-Columbian settlement...",
    "indigenous_perspective": "Sacred ceremonial ground...",
    "sources": ["satellite", "lidar", "oral_histories"]
  }
]

// POST /research/sites/discover
{
  "researcher_id": "frontend_user",
  "sites": [
    {
      "latitude": -3.4653,
      "longitude": -62.2159,
      "confidence": 0.85,
      "description": "Potential archaeological site",
      "pattern_type": "geometric_earthwork"
    }
  ]
}
```

---

## 🏗️ **FRONTEND DATA FLOW ARCHITECTURE**

### **🎯 Core Design Principles**

1. **📡 Real-time Streaming**: WebSocket connections for live updates
2. **🗄️ Intelligent Caching**: Multi-layer caching with appropriate TTLs
3. **🔄 Background Sync**: Automatic data synchronization
4. **⚡ Optimistic Updates**: Immediate UI feedback with backend confirmation
5. **🛡️ Graceful Degradation**: Works offline with cached data
6. **🔁 Retry Logic**: Exponential backoff for failed requests
7. **📊 Event-Driven**: Reactive updates via EventEmitter pattern

### **🏛️ Architecture Layers**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ NISAgentUI  │ │ VisionAgent │ │ MapViewer   │  etc...   │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ useNISData() hooks
┌─────────────────────▼───────────────────────────────────────┐
│                 REACT CONTEXT LAYER                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            NISDataProvider                          │   │
│  │  • Real-time state management                       │   │
│  │  • Event-driven updates                             │   │
│  │  • Component state synchronization                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Service method calls
┌─────────────────────▼───────────────────────────────────────┐
│                 DATA SERVICE LAYER                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               NISDataService                        │   │
│  │  • WebSocket real-time streaming                    │   │
│  │  • Intelligent caching system                       │   │
│  │  • Request optimization & retry logic               │   │
│  │  • Background synchronization                       │   │
│  │  • Event emission for reactive updates              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                    BACKEND API                              │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │  FastAPI  │ │ LangGraph │ │   Redis   │ │   Kafka   │  │
│  │ Endpoints │ │  Agents   │ │   Cache   │ │  Stream   │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **🔄 Data Flow Patterns**

#### **1. Real-time Updates Flow**
```
Backend Event → WebSocket → NISDataService → Context → Components
```

#### **2. User Action Flow**
```
Component → Context → NISDataService → API → Backend → Response → Cache → Context → Component
```

#### **3. Background Sync Flow**
```
Timer → NISDataService → Multiple API calls → Batch update → Context → Components
```

---

## 🎯 **HOW WE TAKE FULL ADVANTAGE OF THE BACKEND**

### **🚀 Real-time Capabilities**

**WebSocket Integration:**
```javascript
// Auto-connects and maintains connection
const wsUrl = 'ws://localhost:8000/ws/real-time'
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data)
  switch (data.type) {
    case 'analysis_complete':
      // Immediately update UI with new analysis
      this.emit('analysisComplete', data.payload)
      break
    case 'system_health':
      // Update system status indicators
      this.emit('systemHealthUpdate', data.payload)
      break
  }
}
```

**Benefits:**
- ✅ Instant updates when analyses complete
- ✅ Real-time system health monitoring
- ✅ Live batch processing progress
- ✅ New site discovery notifications

### **🗄️ Intelligent Caching System**

**Multi-level Caching:**
```javascript
// Strategic cache TTL based on data volatility
const cache = {
  '/system/health': 30000,        // 30s - Changes frequently
  '/research/sites': 300000,      // 5m - Relatively stable
  '/vision/detections': 300000,   // 5m - Expensive to regenerate
  '/agents/status': 30000         // 30s - Dynamic status
}
```

**Benefits:**
- ✅ Reduces backend load
- ✅ Faster UI responses
- ✅ Works offline with cached data
- ✅ Intelligent cache invalidation

### **⚡ Optimized Request Management**

**Retry Logic with Exponential Backoff:**
```javascript
async fetchWithRetry(endpoint, options, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await this.fetchWithTimeout(endpoint, options)
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
}
```

**Benefits:**
- ✅ Resilient to network issues
- ✅ Automatic recovery from failures
- ✅ Prevents request storms
- ✅ User-friendly error handling

### **🔄 Background Synchronization**

**Automatic Data Sync:**
```javascript
setInterval(async () => {
  if (this.isOnline) {
    await Promise.all([
      this.syncAgentStatus(),
      this.syncActiveAnalyses(),
      this.syncBatchJobs()
    ])
  }
}, 10000) // Every 10 seconds
```

**Benefits:**
- ✅ Always up-to-date data
- ✅ Proactive sync before user needs
- ✅ Reduces perceived latency
- ✅ Maintains data consistency

### **📊 Event-Driven Reactive UI**

**Component Subscription System:**
```javascript
// Components can subscribe to specific data updates
const removeListener = nisDataService.onAnalysisComplete((result) => {
  // Automatically update UI when analysis completes
  setActiveAnalyses(prev => new Map(prev).set(result.finding_id, result))
})
```

**Benefits:**
- ✅ Automatic UI updates
- ✅ Decoupled component architecture
- ✅ No manual polling required
- ✅ Efficient re-rendering

---

## 🔧 **IMPLEMENTATION INTEGRATION**

### **1. Add to Main App Layout**

```typescript
// app/layout.tsx
import { NISDataProvider } from '@/lib/context/nis-data-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NISDataProvider>
          {children}
        </NISDataProvider>
      </body>
    </html>
  )
}
```

### **2. Component Integration Examples**

```typescript
// Using in NISAgentUI
import { useNISAnalysis, useNISConnection } from '@/lib/context/nis-data-context'

export default function NISAgentUI() {
  const { isOnline } = useNISConnection()
  const { analyzeCoordinates, activeAnalyses } = useNISAnalysis()
  
  const handleSubmit = async (coordinates) => {
    try {
      const result = await analyzeCoordinates({
        coordinates: { lat, lon },
        region: selectedRegion,
        data_sources: selectedDataSources
      })
      // UI automatically updates via context
    } catch (error) {
      // Handle error
    }
  }
}
```

### **3. Real-time Status Components**

```typescript
// Connection Status Indicator
import { useNISConnection } from '@/lib/context/nis-data-context'

export function ConnectionStatus() {
  const { isOnline, connectionStatus } = useNISConnection()
  
  return (
    <Badge variant={isOnline ? "success" : "secondary"}>
      {isOnline ? "Backend Connected" : "Offline Mode"}
    </Badge>
  )
}
```

---

## 📈 **PERFORMANCE OPTIMIZATIONS**

### **Parallel Data Loading**
```javascript
// Load multiple data sources simultaneously
const [health, agents, sites, stats] = await Promise.allSettled([
  nisDataService.getSystemHealth(),
  nisDataService.getAgentStatus(), 
  nisDataService.getResearchSites(),
  nisDataService.getStatistics()
])
```

### **Request Deduplication**
```javascript
// Prevent duplicate requests for same data
const pendingRequests = new Map()

async fetch(endpoint) {
  if (pendingRequests.has(endpoint)) {
    return pendingRequests.get(endpoint)
  }
  
  const request = this.fetchWithRetry(endpoint)
  pendingRequests.set(endpoint, request)
  
  try {
    const result = await request
    return result
  } finally {
    pendingRequests.delete(endpoint)
  }
}
```

### **Selective Re-rendering**
```javascript
// Only update components that need specific data
export const useNISSystemHealth = () => {
  const { systemHealth, agentStatus } = useNISData()
  return { systemHealth, agentStatus } // Only these fields
}
```

---

## 🎉 **BENEFITS OF THIS ARCHITECTURE**

✅ **Maximum Backend Utilization**: Every backend capability is accessible and optimized  
✅ **Real-time Experience**: Users see updates instantly via WebSocket streams  
✅ **Intelligent Caching**: Reduces backend load while maintaining performance  
✅ **Resilient Operation**: Works offline and handles network issues gracefully  
✅ **Scalable Architecture**: Easy to add new endpoints and capabilities  
✅ **Developer Experience**: Simple hooks for components to access any backend feature  
✅ **Performance Optimized**: Background sync, request deduplication, parallel loading  
✅ **Event-Driven**: Reactive UI that automatically updates when data changes  

This architecture ensures that your powerful NIS Protocol backend is fully utilized, providing users with a responsive, real-time, and feature-rich experience while maintaining excellent performance and reliability. 