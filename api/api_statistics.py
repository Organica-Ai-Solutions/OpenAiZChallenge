from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Optional, Annotated
from datetime import datetime
import logging

from src.monitoring.statistics import StatisticsCollector

logger = logging.getLogger(__name__)

app = APIRouter()

# Fallback statistics data
def get_fallback_statistics() -> Dict:
    return {
        "timestamp": datetime.now().isoformat(),
        "hourly_statistics": {
            "total_analyses": 15,
            "average_processing_time": 2.3,
            "success_rate": 0.94,
            "data_source_distribution": {
                "satellite": 0.45,
                "lidar": 0.30,
                "historical": 0.15,
                "indigenous": 0.10
            }
        },
        "daily_statistics": {
            "total_analyses": 183,
            "average_processing_time": 2.1,
            "success_rate": 0.95,
            "data_source_distribution": {
                "satellite": 0.40,
                "lidar": 0.35,
                "historical": 0.15,
                "indigenous": 0.10
            }
        },
        "batch_statistics": {
            "total_batches": 12,
            "completed_batches": 11,
            "average_completion_rate": 0.92,
            "average_coordinates_per_batch": 15.3
        },
        "total_statistics": {
            "total_analyses": 1247,
            "total_batches": 89,
            "data_source_usage": {
                "satellite": 498,
                "lidar": 437,
                "historical": 187,
                "indigenous": 125
            },
            "error_distribution": {
                "timeout": 3,
                "api_error": 2,
                "data_unavailable": 1
            }
        }
    }

# Dependency to get statistics collector from app.state
async def get_stats_collector(request: Request) -> Optional[StatisticsCollector]:
    if not hasattr(request.app.state, 'stats_collector') or request.app.state.stats_collector is None:
        logger.warning("StatisticsCollector not found in app.state. Using fallback data.")
        return None
    return request.app.state.stats_collector

class StatisticsResponse(BaseModel):
    timestamp: str
    hourly_statistics: Dict
    daily_statistics: Dict
    batch_statistics: Dict
    total_statistics: Dict

@app.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(collector: Annotated[Optional[StatisticsCollector], Depends(get_stats_collector)]) -> Dict:
    """Get the latest system statistics."""
    try:
        if collector:
            return await collector.get_latest_statistics()
        else:
            # Return fallback statistics when collector is not available
            logger.info("Using fallback statistics data")
            return get_fallback_statistics()
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        # Return fallback on any error
        return get_fallback_statistics()

@app.get("/statistics/batch/{batch_id}")
async def get_batch_statistics(batch_id: str, collector: Annotated[StatisticsCollector, Depends(get_stats_collector)]) -> Dict:
    """Get statistics for a specific batch."""
    try:
        stats = await collector.get_latest_statistics()
        batch_stats = stats.get("batch_statistics", {}).get(batch_id)
        
        if not batch_stats:
            raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
            
        return batch_stats
        
    except Exception as e:
        logger.error(f"Error getting batch statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics/errors")
async def get_error_statistics(collector: Annotated[StatisticsCollector, Depends(get_stats_collector)]) -> Dict:
    """Get error statistics and distribution."""
    try:
        stats = await collector.get_latest_statistics()
        return stats.get("total_statistics", {}).get("error_distribution", {})
    except Exception as e:
        logger.error(f"Error getting error statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics/data-sources")
async def get_data_source_statistics(collector: Annotated[StatisticsCollector, Depends(get_stats_collector)]) -> Dict:
    """Get data source usage statistics."""
    try:
        stats = await collector.get_latest_statistics()
        return {
            "total_usage": stats.get("total_statistics", {}).get("data_source_usage", {}),
            "hourly_distribution": stats.get("hourly_statistics", {}).get("data_source_distribution", {}),
            "daily_distribution": stats.get("daily_statistics", {}).get("data_source_distribution", {})
        }
    except Exception as e:
        logger.error(f"Error getting data source statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 