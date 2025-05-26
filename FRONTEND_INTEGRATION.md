# Frontend Integration Guide for NIS Protocol

## API Endpoint Map

### Core Analysis Endpoints

#### 1. Site Analysis
- **Endpoint**: `/analyze`
- **Method**: POST
- **Purpose**: Analyze a single location for archaeological significance
- **Request Body**:
```json
{
  "lat": number,
  "lon": number,
  "dataSources": {
    "satellite": boolean,
    "lidar": boolean,
    "historicalTexts": boolean,
    "indigenousMaps": boolean
  }
}
```
- **Response**:
```json
{
  "location": {
    "lat": number,
    "lon": number
  },
  "confidence": number,
  "description": string,
  "sources": string[],
  "historical_context": string,
  "indigenous_perspective": string,
  "pattern_type": string,
  "finding_id": string,
  "recommendations": [
    {
      "action": string,
      "description": string,
      "priority": string
    }
  ]
}
```

#### 2. Batch Analysis
- **Endpoint**: `/batch/analyze`
- **Method**: POST
- **Purpose**: Submit multiple coordinates for analysis
- **Request Body**:
```json
{
  "coordinates_list": [
    {
      "lat": number,
      "lon": number
    }
  ],
  "data_sources": {
    "satellite": boolean,
    "lidar": boolean
  }
}
```
- **Response**:
```json
{
  "batch_id": string,
  "total_coordinates": number,
  "completed_coordinates": number,
  "failed_coordinates": number,
  "status": string,
  "results": {
    "lat,lon": {
      // Same structure as /analyze response
    }
  }
}
```

### Research & Discovery Endpoints

#### 1. Research Sites
- **Endpoint**: `/research/sites`
- **Method**: GET
- **Query Parameters**:
  - `min_confidence`: number (0-1)
  - `max_sites`: number
  - `pattern_type`: string (optional)
  - `date_range`: string (optional)
- **Response**: Array of site objects

#### 2. Submit New Sites
- **Endpoint**: `/research/sites/discover`
- **Method**: POST
- **Request Body**:
```json
{
  "researcher_id": string,
  "sites": [
    {
      "latitude": number,
      "longitude": number,
      "confidence": number,
      "description": string
    }
  ]
}
```

### System & Monitoring Endpoints

#### 1. System Health
- **Endpoint**: `/system/health`
- **Method**: GET
- **Purpose**: Quick health check
- **Response**: Status object

#### 2. System Diagnostics
- **Endpoint**: `/system/diagnostics`
- **Method**: GET
- **Purpose**: Detailed system status
- **Response**: Comprehensive diagnostics object

#### 3. Statistics
- **Endpoint**: `/statistics/statistics`
- **Method**: GET
- **Purpose**: System-wide statistics
- **Response**: Statistics object

### Agent Management Endpoints

#### 1. List Agents
- **Endpoint**: `/agents/agents`
- **Method**: GET
- **Purpose**: List available AI agents
- **Response**: Array of agent objects

#### 2. Direct Agent Processing
- **Endpoint**: `/agents/process`
- **Method**: POST
- **Purpose**: Direct invocation of specific agents
- **Request Body**:
```json
{
  "agent_type": string,
  "data": {
    "coordinates": string,
    "data_source": string
  }
}
```

## Frontend Implementation Guidelines

### 1. Authentication
- All endpoints require JWT authentication
- Token should be included in Authorization header
- Format: `Authorization: Bearer <token>`

### 2. Error Handling
- All endpoints may return:
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error
- Implement proper error handling for each case

### 3. Real-time Updates
- Use WebSocket connection for:
  - Batch analysis progress
  - Agent processing status
  - System health updates

### 4. Data Source Requirements
- Ensure all required data sources are available
- Handle gracefully when sources are unavailable
- Show appropriate UI feedback

### 5. Rate Limiting
- Implement request throttling
- Handle 429 Too Many Requests responses
- Add exponential backoff for retries

## Frontend Components Needed

1. **Map Interface**
   - Interactive map for site selection
   - Layer controls for different data sources
   - Site markers with confidence indicators

2. **Analysis Panel**
   - Coordinate input form
   - Data source selection
   - Analysis progress indicator
   - Results display

3. **Batch Processing**
   - Bulk coordinate upload
   - Progress tracking
   - Results export

4. **Research Dashboard**
   - Site listing with filters
   - Site submission form
   - Statistics visualization

5. **System Monitor**
   - Health status display
   - Agent status indicators
   - System statistics charts

## Best Practices

1. **State Management**
   - Use proper state management (Redux/Context)
   - Implement proper caching
   - Handle offline capabilities

2. **Performance**
   - Implement pagination for large datasets
   - Use proper loading states
   - Optimize map rendering

3. **User Experience**
   - Clear feedback for all actions
   - Proper form validation
   - Intuitive error messages

4. **Security**
   - Secure storage of credentials
   - Proper session handling
   - Input sanitization

## Getting Started

1. Set up environment:
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

2. Configure API client:
```typescript
// api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

3. Implement authentication:
```typescript
// utils/auth.ts
export const getAuthToken = () => {
  // Implement token retrieval
};

export const setAuthToken = (token: string) => {
  // Implement token storage
};
```

4. Set up API interceptors:
```typescript
// api/interceptors.ts
axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Testing

1. Unit Tests:
```bash
npm run test:unit
```

2. Integration Tests:
```bash
npm run test:integration
```

3. E2E Tests:
```bash
npm run test:e2e
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Configure environment variables for production

3. Deploy to your hosting platform

## Support

For API issues or questions:
- Check system health: `/system/health`
- Check diagnostics: `/system/diagnostics`
- Contact backend team with relevant error logs 