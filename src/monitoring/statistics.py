from typing import Dict, List, Optional, Union
import logging
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from pathlib import Path
import json
import asyncio
from collections import defaultdict

from ..infrastructure import get_redis_client, get_kafka_client

logger = logging.getLogger(__name__)

class StatisticsCollector:
    def __init__(self):
        # Initialize infrastructure clients
        self.redis = get_redis_client()
        self.kafka = get_kafka_client()
        
        # Initialize statistics storage
        self.stats_dir = Path("outputs/statistics")
        self.stats_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure metrics collection
        self.metrics = {
            "processing_time": defaultdict(list),
            "success_rate": defaultdict(list),
            "data_source_usage": defaultdict(int),
            "error_counts": defaultdict(int),
            "batch_statistics": defaultdict(dict)
        }
        
        # Start background tasks
        asyncio.create_task(self._consume_events())
        asyncio.create_task(self._periodic_snapshot())
    
    async def _consume_events(self) -> None:
        """Consume events from Kafka and update statistics."""
        try:
            # Subscribe to relevant topics
            topics = ["nis.analysis.events", "nis.batch.events"]
            
            for topic in topics:
                await self.kafka.consume(
                    topic=topic,
                    callback=self._process_event,
                    group_id="nis-statistics-collector"
                )
                
        except Exception as e:
            logger.error(f"Error consuming events: {str(e)}")
    
    async def _process_event(self, key: str, value: Dict) -> None:
        """Process a single event and update statistics."""
        try:
            event_type = value.get("type")
            timestamp = datetime.fromisoformat(value.get("timestamp"))
            
            if event_type == "analysis_complete":
                # Update processing time
                coordinates = value.get("coordinates", [])
                self.metrics["processing_time"]["single"].append({
                    "timestamp": timestamp,
                    "coordinates": coordinates,
                    "duration": value.get("duration")
                })
                
                # Update data source usage
                data_sources = value.get("data_sources", {})
                for source, used in data_sources.items():
                    if used:
                        self.metrics["data_source_usage"][source] += 1
                
                # Update success rate
                status = value.get("status")
                self.metrics["success_rate"]["single"].append({
                    "timestamp": timestamp,
                    "success": status == "success"
                })
                
                if status != "success":
                    error = value.get("error", "unknown")
                    self.metrics["error_counts"][error] += 1
                    
            elif event_type == "batch_progress":
                batch_id = value.get("batch_id")
                if batch_id:
                    self.metrics["batch_statistics"][batch_id].update({
                        "last_update": timestamp,
                        "completed": value.get("completed", 0),
                        "total": value.get("total", 0)
                    })
                    
            elif event_type == "batch_complete":
                batch_id = value.get("batch_id")
                if batch_id:
                    summary = value.get("summary", {})
                    self.metrics["batch_statistics"][batch_id].update({
                        "completion_time": timestamp,
                        "total_coordinates": summary.get("total", 0),
                        "successful_coordinates": summary.get("completed", 0),
                        "failed_coordinates": summary.get("failed", 0)
                    })
            
        except Exception as e:
            logger.error(f"Error processing event: {str(e)}")
    
    async def _periodic_snapshot(self) -> None:
        """Periodically save statistics snapshots."""
        while True:
            try:
                # Generate snapshot
                snapshot = self._generate_snapshot()
                
                # Save to file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                snapshot_file = self.stats_dir / f"stats_snapshot_{timestamp}.json"
                
                with open(snapshot_file, "w") as f:
                    json.dump(snapshot, f, indent=2, default=str)
                
                # Update Redis with latest statistics
                await self.redis.set(
                    "latest_statistics",
                    snapshot,
                    expire=3600  # 1 hour expiration
                )
                
                # Publish statistics update event
                await self.kafka.produce(
                    topic="nis.statistics.events",
                    key="snapshot",
                    value={
                        "type": "statistics_update",
                        "timestamp": datetime.now().isoformat(),
                        "snapshot": snapshot
                    }
                )
                
                # Sleep for 5 minutes
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in periodic snapshot: {str(e)}")
                await asyncio.sleep(60)  # Sleep for 1 minute on error
    
    def _generate_snapshot(self) -> Dict:
        """Generate a statistics snapshot."""
        now = datetime.now()
        hour_ago = now - timedelta(hours=1)
        day_ago = now - timedelta(days=1)
        
        # Calculate hourly and daily statistics
        hourly_stats = self._calculate_time_window_stats(hour_ago)
        daily_stats = self._calculate_time_window_stats(day_ago)
        
        # Calculate batch statistics
        batch_stats = self._calculate_batch_stats()
        
        return {
            "timestamp": now.isoformat(),
            "hourly_statistics": hourly_stats,
            "daily_statistics": daily_stats,
            "batch_statistics": batch_stats,
            "total_statistics": {
                "total_analyses": sum(
                    len(times) for times in self.metrics["processing_time"].values()
                ),
                "total_batches": len(self.metrics["batch_statistics"]),
                "data_source_usage": dict(self.metrics["data_source_usage"]),
                "error_distribution": dict(self.metrics["error_counts"])
            }
        }
    
    def _calculate_time_window_stats(self, start_time: datetime) -> Dict:
        """Calculate statistics for a specific time window."""
        # Filter metrics for time window
        processing_times = [
            pt for pt in self.metrics["processing_time"]["single"]
            if pt["timestamp"] >= start_time
        ]
        
        success_rates = [
            sr for sr in self.metrics["success_rate"]["single"]
            if sr["timestamp"] >= start_time
        ]
        
        return {
            "total_analyses": len(processing_times),
            "average_processing_time": np.mean([pt["duration"] for pt in processing_times]) if processing_times else 0,
            "success_rate": np.mean([1 if sr["success"] else 0 for sr in success_rates]) if success_rates else 0,
            "data_source_distribution": self._calculate_data_source_distribution(start_time)
        }
    
    def _calculate_data_source_distribution(self, start_time: datetime) -> Dict:
        """Calculate data source usage distribution for a time window."""
        total = sum(self.metrics["data_source_usage"].values())
        if total == 0:
            return {}
            
        return {
            source: count / total
            for source, count in self.metrics["data_source_usage"].items()
        }
    
    def _calculate_batch_stats(self) -> Dict:
        """Calculate batch processing statistics."""
        completed_batches = [
            stats for stats in self.metrics["batch_statistics"].values()
            if "completion_time" in stats
        ]
        
        if not completed_batches:
            return {}
        
        return {
            "total_batches": len(self.metrics["batch_statistics"]),
            "completed_batches": len(completed_batches),
            "average_completion_rate": np.mean([
                stats["successful_coordinates"] / stats["total_coordinates"]
                for stats in completed_batches
            ]),
            "average_coordinates_per_batch": np.mean([
                stats["total_coordinates"]
                for stats in completed_batches
            ])
        }
    
    async def get_latest_statistics(self) -> Dict:
        """Get the latest statistics snapshot."""
        try:
            stats = await self.redis.get("latest_statistics")
            return stats if stats else self._generate_snapshot()
        except Exception as e:
            logger.error(f"Error getting latest statistics: {str(e)}")
            return self._generate_snapshot() 