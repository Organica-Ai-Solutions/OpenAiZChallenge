"""Redis integration for the NIS Protocol.

This module provides Redis caching and pub/sub functionality for the NIS Protocol.
"""

import os
import json
import logging
from typing import Dict, List, Optional, Union, Any
import redis

# Setup logging
logger = logging.getLogger(__name__)

class RedisClient:
    """Redis client for the NIS Protocol."""
    
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        """Initialize the Redis client.
        
        Args:
            host: Redis host
            port: Redis port
            db: Redis database
        """
        self.host = host
        self.port = port
        self.db = db
        
        # Redis connection
        self.redis = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        try:
            self.redis.ping()
            logger.info(f"Connected to Redis at {host}:{port}")
        except redis.ConnectionError as e:
            logger.warning(f"Failed to connect to Redis: {str(e)}")
            raise
    
    def cache_set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set a value in the cache.
        
        Args:
            key: Cache key
            value: Value to store (will be JSON serialized)
            ttl: Time to live in seconds (optional)
            
        Returns:
            Success status
        """
        try:
            if not isinstance(value, str):
                value = json.dumps(value)
            result = self.redis.set(key, value, ex=ttl)
            return result
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {str(e)}")
            return False
    
    def cache_get(self, key: str) -> Optional[Any]:
        """Get a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            value = self.redis.get(key)
            if value is None:
                return None
                
            try:
                # Try to parse as JSON
                return json.loads(value)
            except json.JSONDecodeError:
                # Return as string if not valid JSON
                return value
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {str(e)}")
            return None
    
    def cache_delete(self, key: str) -> bool:
        """Delete a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            Success status
        """
        try:
            result = self.redis.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {str(e)}")
            return False
    
    def publish(self, channel: str, message: Any) -> int:
        """Publish a message to a channel.
        
        Args:
            channel: Channel name
            message: Message to publish (will be JSON serialized)
            
        Returns:
            Number of clients that received the message
        """
        try:
            if not isinstance(message, str):
                message = json.dumps(message)
            return self.redis.publish(channel, message)
        except Exception as e:
            logger.error(f"Error publishing to channel {channel}: {str(e)}")
            return 0
    
    def subscribe(self, channel: str) -> redis.client.PubSub:
        """Subscribe to a channel.
        
        Args:
            channel: Channel name
            
        Returns:
            PubSub object for receiving messages
        """
        try:
            pubsub = self.redis.pubsub()
            pubsub.subscribe(channel)
            return pubsub
        except Exception as e:
            logger.error(f"Error subscribing to channel {channel}: {str(e)}")
            raise
    
    def close(self) -> None:
        """Close the Redis connection."""
        try:
            self.redis.close()
            logger.info("Redis connection closed")
        except Exception as e:
            logger.error(f"Error closing Redis connection: {str(e)}")


# Singleton instance for application-wide use
_redis_client = None

def get_redis_client() -> RedisClient:
    """Get the singleton Redis client instance.
    
    Returns:
        RedisClient instance
    """
    global _redis_client
    if _redis_client is None:
        host = os.environ.get("REDIS_HOST", "localhost")
        port = int(os.environ.get("REDIS_PORT", 6379))
        db = int(os.environ.get("REDIS_DB", 0))
        
        _redis_client = RedisClient(host=host, port=port, db=db)
    
    return _redis_client 