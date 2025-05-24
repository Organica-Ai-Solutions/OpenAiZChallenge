# NIS Protocol API Documentation

## Overview
This API provides endpoints for archaeological site analysis using the NIS Protocol. **All endpoints require real data/models and will return errors if the backend is not fully provisioned.**

---

## Endpoints

### 1. `/analyze` (POST)
- **Description:** Analyze a single location for archaeological significance.
- **Input:**
  - `{ "lat": float, "lon": float, "dataSources": { ... } }` **or** `{ "coordinates": "lat,lon", "dataSources": { ... } }`
  - `dataSources` (optional): `{ "satellite": bool, "lidar": bool, "historicalTexts": bool, "indigenousMaps": bool }`
- **Output:**
  - `location`: `{ "lat": float, "lon": float }`
  - `confidence`: float
  - `description`: string
  - `sources`: list of strings
  - `historical_context`: string (optional)
  - `indigenous_perspective`: string (optional)
  - `pattern_type`: string (optional)
  - `finding_id`: string (optional)
  - `recommendations`: list (optional)
- **Example Request:**
```json
{
  "lat": -3.4653,
  "lon": -62.2159,
  "dataSources": {"satellite": true, "lidar": true}
}
```
- **Example Response:**
```json
{
  "location": {"lat": -3.4653, "lon": -62.2159},
  "confidence": 0.92,
  "description": "High likelihood of archaeological features detected.",
  "sources": ["Sentinel-2 Tile ..."],
  "historical_context": "...",
  "indigenous_perspective": "...",
  "pattern_type": "circular geometric structures",
  "finding_id": "site_...",
  "recommendations": [
    {"action": "ground_survey", "description": "Conduct ground survey.", "priority": "high"}
  ]
}
```

---

### 2. `/batch/analyze` (POST)
- **Description:** Submit a batch of coordinates for asynchronous analysis.
- **Input:**
```json
{
  "coordinates_list": [
    {"lat": -3.4653, "lon": -62.2159},
    {"lat": -8.5, "lon": -68.3}
  ],
  "data_sources": {"satellite": true, "lidar": true}
}
```
- **Output:**
  - `batch_id`: string
  - `total_coordinates`: int
  - `completed_coordinates`: int
  - `failed_coordinates`: int
  - `status`: string
  - `results`: dict (keyed by "lat,lon")

---

### 3. `/statistics/statistics` (GET)
- **Returns:** System statistics.

### 4. `/research/sites` (GET)
- **Returns:** List of research sites (with filters).

### 5. `/research/sites/discover` (POST)
- **Accepts:** New site submissions.

### 6. `/agents/agents` (GET)
- **Returns:** List of available agents.

### 7. `/agents/process` (POST)
- **Description:** Directly invoke an agent.

### 8. `/system/health` (GET)
- **Returns:** Health check status.

### 9. `/system/diagnostics` (GET)
- **Returns:** System diagnostics.

---

## Notes
- **No mock data:** All endpoints require real data/models. If unavailable, endpoints will return errors.
- **Flexible input:** `/analyze` accepts both `{ "lat": ..., "lon": ... }` and `{ "coordinates": "lat,lon" }`.
- **Batch processing:** `/batch/analyze` is asynchronous; check status with `/batch/status/{batch_id}`.

---

For further details, see the codebase or contact the backend team. 