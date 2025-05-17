from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime
import logging

from src.monitoring.statistics import StatisticsCollector

logger = logging.getLogger(__name__)

app = APIRouter()
stats_collector = StatisticsCollector()

class StatisticsResponse(BaseModel):
    timestamp: str
    hourly_statistics: Dict
    daily_statistics: Dict
    batch_statistics: Dict
    total_statistics: Dict

@app.get("/statistics", response_model=StatisticsResponse)
async def get_statistics() -> Dict:
    """Get the latest system statistics."""
    try:
        return await stats_collector.get_latest_statistics()
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics/batch/{batch_id}")
async def get_batch_statistics(batch_id: str) -> Dict:
    """Get statistics for a specific batch."""
    try:
        stats = await stats_collector.get_latest_statistics()
        batch_stats = stats.get("batch_statistics", {}).get(batch_id)
        
        if not batch_stats:
            raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
            
        return batch_stats
        
    except Exception as e:
        logger.error(f"Error getting batch statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics/errors")
async def get_error_statistics() -> Dict:
    """Get error statistics and distribution."""
    try:
        stats = await stats_collector.get_latest_statistics()
        return stats.get("total_statistics", {}).get("error_distribution", {})
    except Exception as e:
        logger.error(f"Error getting error statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics/data-sources")
async def get_data_source_statistics() -> Dict:
    """Get data source usage statistics."""
    try:
        stats = await stats_collector.get_latest_statistics()
        return {
            "total_usage": stats.get("total_statistics", {}).get("data_source_usage", {}),
            "hourly_distribution": stats.get("hourly_statistics", {}).get("data_source_distribution", {}),
            "daily_distribution": stats.get("daily_statistics", {}).get("data_source_distribution", {})
        }
    except Exception as e:
        logger.error(f"Error getting data source statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 