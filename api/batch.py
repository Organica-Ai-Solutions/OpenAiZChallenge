from fastapi import APIRouter, HTTPException, Body, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import logging
import asyncio
from datetime import datetime

from src.data_processing.pipeline import AnalysisPipeline

logger = logging.getLogger(__name__)

app = APIRouter()

class BatchCoordinatesRequest(BaseModel):
    coordinates_list: List[Dict[str, float]] = Field(
        ..., 
        description="List of coordinates to process, each with lat and lon keys"
    )
    data_sources: Optional[Dict[str, bool]] = Field(
        default_factory=lambda: {
            "satellite": True,
            "lidar": True,
            "historical_texts": True,
            "indigenous_maps": True,
        },
        description="Data sources to analyze"
    )
    batch_id: Optional[str] = Field(
        None,
        description="Optional batch identifier. If not provided, one will be generated."
    )

class BatchStatusResponse(BaseModel):
    batch_id: str
    total_coordinates: int
    completed_coordinates: int
    failed_coordinates: int
    status: str
    start_time: str
    estimated_completion_time: Optional[str]
    results: Optional[Dict]

@app.post("/batch/analyze", response_model=BatchStatusResponse)
async def batch_analyze(
    request: BatchCoordinatesRequest,
    background_tasks: BackgroundTasks
) -> Dict:
    """
    Submit a batch of coordinates for analysis.
    The analysis will be performed asynchronously.
    """
    try:
        # Generate batch ID if not provided
        if not request.batch_id:
            request.batch_id = f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize pipeline
        pipeline = AnalysisPipeline()
        
        # Store initial batch status in Redis
        initial_status = {
            "batch_id": request.batch_id,
            "total_coordinates": len(request.coordinates_list),
            "completed_coordinates": 0,
            "failed_coordinates": 0,
            "status": "pending",
            "start_time": datetime.now().isoformat(),
            "estimated_completion_time": None,
            "results": {}
        }
        
        await pipeline.redis.set(
            f"batch_status:{request.batch_id}",
            initial_status
        )
        
        # Add batch processing task to background tasks
        background_tasks.add_task(
            process_batch,
            request.batch_id,
            request.coordinates_list,
            request.data_sources or {
                "satellite": True,
                "lidar": True,
                "historical_texts": True,
                "indigenous_maps": True,
            }
        )
        
        return initial_status
        
    except Exception as e:
        logger.error(f"Error submitting batch analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/batch/status/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str) -> Dict:
    """Get the status of a batch analysis job."""
    try:
        pipeline = AnalysisPipeline()
        status = await pipeline.redis.get(f"batch_status:{batch_id}")
        
        if not status:
            raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
            
        return status
        
    except Exception as e:
        logger.error(f"Error getting batch status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_batch(
    batch_id: str,
    coordinates_list: List[Dict[str, float]],
    data_sources: Dict[str, bool]
) -> None:
    """Process a batch of coordinates asynchronously."""
    pipeline = AnalysisPipeline()
    
    try:
        # Update batch status to running
        status = await pipeline.redis.get(f"batch_status:{batch_id}")
        status["status"] = "running"
        await pipeline.redis.set(f"batch_status:{batch_id}", status)
        
        # Process coordinates in chunks to avoid memory issues
        chunk_size = 10
        for i in range(0, len(coordinates_list), chunk_size):
            chunk = coordinates_list[i:i + chunk_size]
            
            # Process chunk in parallel
            tasks = []
            for coords in chunk:
                task = asyncio.create_task(
                    pipeline.process_coordinates(
                        lat=coords["lat"],
                        lon=coords["lon"],
                        use_satellite=data_sources["satellite"],
                        use_lidar=data_sources["lidar"],
                        use_historical=data_sources["historical_texts"],
                        use_indigenous=data_sources["indigenous_maps"]
                    )
                )
                tasks.append(task)
            
            # Wait for all tasks in chunk to complete
            chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Update status and results
            status = await pipeline.redis.get(f"batch_status:{batch_id}")
            for coords, result in zip(chunk, chunk_results):
                key = f"{coords['lat']},{coords['lon']}"
                if isinstance(result, Exception):
                    status["failed_coordinates"] += 1
                    status["results"][key] = {"error": str(result)}
                else:
                    status["completed_coordinates"] += 1
                    status["results"][key] = result
                    
            # Update estimated completion time
            completed = status["completed_coordinates"] + status["failed_coordinates"]
            if completed > 0:
                start_time = datetime.fromisoformat(status["start_time"])
                elapsed = (datetime.now() - start_time).total_seconds()
                rate = completed / elapsed
                remaining = (status["total_coordinates"] - completed) / rate
                estimated_completion = datetime.now().timestamp() + remaining
                status["estimated_completion_time"] = datetime.fromtimestamp(estimated_completion).isoformat()
            
            await pipeline.redis.set(f"batch_status:{batch_id}", status)
            
            # Publish progress event to Kafka
            await pipeline.kafka.produce(
                topic="nis.batch.events",
                key=batch_id,
                value={
                    "type": "batch_progress",
                    "batch_id": batch_id,
                    "completed": completed,
                    "total": status["total_coordinates"],
                    "timestamp": datetime.now().isoformat()
                }
            )
        
        # Update final status
        final_status = await pipeline.redis.get(f"batch_status:{batch_id}")
        final_status["status"] = "completed"
        await pipeline.redis.set(f"batch_status:{batch_id}", final_status)
        
        # Publish completion event
        await pipeline.kafka.produce(
            topic="nis.batch.events",
            key=batch_id,
            value={
                "type": "batch_complete",
                "batch_id": batch_id,
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total": final_status["total_coordinates"],
                    "completed": final_status["completed_coordinates"],
                    "failed": final_status["failed_coordinates"]
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing batch {batch_id}: {str(e)}")
        # Update status to failed
        error_status = await pipeline.redis.get(f"batch_status:{batch_id}")
        error_status["status"] = "failed"
        error_status["error"] = str(e)
        await pipeline.redis.set(f"batch_status:{batch_id}", error_status) 