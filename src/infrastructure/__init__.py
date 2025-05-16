"""Infrastructure package for the NIS Protocol.

This package provides integration with infrastructure services like Redis and Kafka.
"""

# Import client classes for easy access
from .redis_client import RedisClient, get_redis_client
from .kafka_client import KafkaClient, get_kafka_client 