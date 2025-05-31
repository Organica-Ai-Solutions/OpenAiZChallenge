from fastapi import APIRouter, HTTPException, Body, BackgroundTasks, Request
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import logging
import asyncio
from datetime import datetime, timedelta

from src.data_processing.pipeline import process_research_location, AnalysisPipeline
from src.core.enums import DataSourceType

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
    estimated_completion_time: Optional[str] = None
    results: Optional[Dict] = None
    error_message: Optional[str] = None

@app.post("/analyze", response_model=BatchStatusResponse)
async def batch_analyze(
    request_data: BatchCoordinatesRequest,
    background_tasks: BackgroundTasks,
    http_request: Request
) -> Dict:
    """
    Submit a batch of coordinates for analysis.
    The analysis will be performed asynchronously.
    """
    try:
        if not request_data.batch_id:
            request_data.batch_id = f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        redis_client = http_request.app.state.redis
        kafka_client = http_request.app.state.kafka_client

        if not redis_client:
            logger.error("Redis client not available in app.state for batch_analyze")
            raise HTTPException(status_code=500, detail="System not configured for batch processing (Redis missing).")
        if not kafka_client:
            logger.error("Kafka client not available in app.state for batch_analyze")
            raise HTTPException(status_code=500, detail="System not configured for batch processing (Kafka missing).")

        initial_status = {
            "batch_id": request_data.batch_id,
            "total_coordinates": len(request_data.coordinates_list),
            "completed_coordinates": 0,
            "failed_coordinates": 0,
            "status": "pending",
            "start_time": datetime.now().isoformat(),
            "estimated_completion_time": None,
            "results": {},
            "error_message": None
        }
        
        redis_client.cache_set(
            f"batch_status:{request_data.batch_id}",
            initial_status,
            ttl=86400
        )
        
        background_tasks.add_task(
            process_batch,
            request_data.batch_id,
            request_data.coordinates_list,
            request_data.data_sources or {
                "satellite": True,
                "lidar": True,
                "historical_texts": True,
                "indigenous_maps": True,
            },
            redis_client,
            kafka_client
        )
        
        return initial_status
        
    except Exception as e:
        logger.error(f"Error submitting batch analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str, http_request: Request) -> Dict:
    """Get the status of a batch analysis job."""
    try:
        redis_client = http_request.app.state.redis
        if not redis_client:
            logger.error("Redis client not available in app.state for get_batch_status")
            raise HTTPException(status_code=500, detail="System not configured to fetch batch status (Redis missing).")

        status = redis_client.cache_get(f"batch_status:{batch_id}")
        
        if not status:
            raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
            
        return status
        
    except Exception as e:
        logger.error(f"Error getting batch status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

async def process_batch(
    batch_id: str,
    coordinates_list: List[Dict[str, float]],
    data_sources: Dict[str, bool],
    redis_client: Any,
    kafka_client: Any
) -> None:
    """Process a batch of coordinates asynchronously."""
    try:
        status = redis_client.cache_get(f"batch_status:{batch_id}")
        if not status:
            logger.error(f"Initial status for batch {batch_id} not found in cache.")
            return
        status["status"] = "running"
        redis_client.cache_set(f"batch_status:{batch_id}", status)
        
        chunk_size = 10
        
        active_data_sources_enum = []
        if data_sources.get("satellite"):
            active_data_sources_enum.append(DataSourceType.SATELLITE)
        if data_sources.get("lidar"):
            active_data_sources_enum.append(DataSourceType.LIDAR)
        if data_sources.get("historical_texts"):
            active_data_sources_enum.append(DataSourceType.HISTORICAL_TEXT)
        if data_sources.get("indigenous_maps"):
            active_data_sources_enum.append(DataSourceType.INDIGENOUS_MAP)

        for i in range(0, len(coordinates_list), chunk_size):
            chunk = coordinates_list[i:i + chunk_size]
            
            tasks = []
            for idx, coords in enumerate(chunk):
                site_id = f"{batch_id}_coord_{i+idx}"
                area_def = {
                    "north": coords["lat"] + 0.005,
                    "south": coords["lat"] - 0.005,
                    "east": coords["lon"] + 0.005,
                    "west": coords["lon"] - 0.005,
                }
                task = asyncio.create_task(
                    process_research_location(
                        site_id=site_id,
                        area_definition=area_def,
                        data_sources=active_data_sources_enum
                    )
                )
                tasks.append(task)
            
            chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            status = redis_client.cache_get(f"batch_status:{batch_id}")
            if not status:
                logger.error(f"Status for batch {batch_id} disappeared during processing chunk {i//chunk_size}.")
                return
            for coords, result in zip(chunk, chunk_results):
                key = f"{coords['lat']},{coords['lon']}"
                if isinstance(result, Exception):
                    status["failed_coordinates"] += 1
                    status["results"][key] = {"error": str(result)}
                else:
                    if isinstance(result, list): 
                        status["results"][key] = {
                            "status": "processed_tiled", 
                            "tile_count": len(result),
                            "first_tile_confidence": result[0].confidence_score if result and len(result) > 0 and hasattr(result[0], 'confidence_score') else None
                        }
                    else: 
                        status["results"][key] = {
                            "status": "processed_single", 
                            "confidence": result.confidence_score if result and hasattr(result, 'confidence_score') else None
                        }
                    status["completed_coordinates"] += 1
                    
            completed = status["completed_coordinates"] + status["failed_coordinates"]
            if completed > 0 and status.get("total_coordinates", 0) > 0:
                start_time_iso = status.get("start_time")
                if start_time_iso:
                    try:
                        start_time = datetime.fromisoformat(start_time_iso)
                        elapsed = (datetime.now() - start_time).total_seconds()
                        if elapsed > 0:
                            rate = completed / elapsed
                            if rate > 0:
                                remaining_items = status["total_coordinates"] - completed
                                if remaining_items > 0:
                                    remaining_time_secs = remaining_items / rate
                                    estimated_completion_dt = datetime.now() + timedelta(seconds=remaining_time_secs)
                                    status["estimated_completion_time"] = estimated_completion_dt.isoformat()
                                else:
                                    status["estimated_completion_time"] = datetime.now().isoformat()
                    except ValueError:
                        logger.warning(f"Could not parse start_time_iso: {start_time_iso} for batch {batch_id}")
            
            redis_client.cache_set(f"batch_status:{batch_id}", status)
            
            kafka_client.produce(
                topic="nis.batch.events",
                key=batch_id,
                message={
                    "type": "batch_progress",
                    "batch_id": batch_id,
                    "completed": completed,
                    "total": status["total_coordinates"],
                    "timestamp": datetime.now().isoformat()
                }
            )
        
        final_status = redis_client.cache_get(f"batch_status:{batch_id}")
        if not final_status:
            logger.error(f"Final status for batch {batch_id} not found after processing all chunks.")
            return
        final_status["status"] = "completed"
        redis_client.cache_set(f"batch_status:{batch_id}", final_status)
        
        kafka_client.produce(
            topic="nis.batch.events",
            key=batch_id,
            message={
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
        logger.error(f"Error processing batch {batch_id}: {str(e)}", exc_info=True)
        try:
            error_status = redis_client.cache_get(f"batch_status:{batch_id}")
            if error_status:
                error_status["status"] = "failed"
                error_status["error_message"] = str(e)
                redis_client.cache_set(f"batch_status:{batch_id}", error_status)
        except Exception as e_status_update:
            logger.error(f"Critical error updating batch {batch_id} status to failed: {str(e_status_update)}", exc_info=True) 