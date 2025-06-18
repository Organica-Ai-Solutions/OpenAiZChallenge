# Simple batch endpoints for testing
from datetime import datetime
import uuid

class SimpleBatchCoordinatesRequest(BaseModel):
    coordinates_list: List[Dict[str, float]]
    batch_id: Optional[str] = None

class SimpleBatchStatusResponse(BaseModel):
    batch_id: str
    total_coordinates: int
    completed_coordinates: int
    failed_coordinates: int
    status: str
    start_time: str
    estimated_completion_time: Optional[str] = None
    results: Optional[Dict] = None
    error_message: Optional[str] = None

# Simple in-memory storage for batch status (in production, use Redis)
batch_storage = {}

@app.post("/batch/analyze", response_model=SimpleBatchStatusResponse)
async def simple_batch_analyze(request: SimpleBatchCoordinatesRequest):
    """Simple batch analyze endpoint for testing without heavy dependencies."""
    if not request.batch_id:
        request.batch_id = f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
    
    # Store initial status
    initial_status = {
        "batch_id": request.batch_id,
        "total_coordinates": len(request.coordinates_list),
        "completed_coordinates": 0,
        "failed_coordinates": 0,
        "status": "pending",
        "start_time": datetime.now().isoformat(),
        "estimated_completion_time": None,
        "results": {},
        "error_message": None
    }
    
    batch_storage[request.batch_id] = initial_status
    
    # Simulate processing by immediately marking as completed
    # In a real implementation, this would be done asynchronously
    results = {}
    for i, coords in enumerate(request.coordinates_list):
        key = f"{coords['lat']},{coords['lon']}"
        results[key] = {
            "status": "processed",
            "confidence": 0.06,
            "finding_id": str(uuid.uuid4())[:8],
            "description": "Mock analysis result"
        }
    
    # Update status to completed
    batch_storage[request.batch_id].update({
        "status": "completed",
        "completed_coordinates": len(request.coordinates_list),
        "results": results
    })
    
    return batch_storage[request.batch_id]

@app.get("/batch/status/{batch_id}", response_model=SimpleBatchStatusResponse)
async def simple_get_batch_status(batch_id: str):
    """Get the status of a batch analysis job."""
    if batch_id not in batch_storage:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
    
    return batch_storage[batch_id] 