"""Kafka integration for the NIS Protocol.

This module provides Kafka event streaming for the NIS Protocol.
"""

import os
import json
import logging
import threading
import time
from typing import Dict, List, Optional, Union, Any, Callable
from confluent_kafka import Producer, Consumer, KafkaError, KafkaException

# Setup logging
logger = logging.getLogger(__name__)

class KafkaClient:
    """Kafka client for the NIS Protocol."""
    
    def __init__(self, 
                bootstrap_servers: str = "127.0.0.1:9092",
                client_id: str = "nis-protocol"):
        """Initialize the Kafka client.
        
        Args:
            bootstrap_servers: Kafka bootstrap servers
            client_id: Client ID for Kafka
        """
        self.bootstrap_servers = bootstrap_servers
        self.client_id = client_id
        
        # Producer config
        self.producer_config = {
            'bootstrap.servers': bootstrap_servers,
            'client.id': client_id,
            'acks': 'all'
        }
        
        # Default consumer config
        self.consumer_config = {
            'bootstrap.servers': bootstrap_servers,
            'group.id': 'nis-consumer-group',
            'auto.offset.reset': 'earliest'
        }
        
        # Initialize producer
        try:
            self.producer = Producer(self.producer_config)
            logger.info(f"Kafka producer initialized for {bootstrap_servers}")
        except KafkaException as e:
            logger.error(f"Failed to initialize Kafka producer: {str(e)}")
            raise
            
        # Consumer threads
        self.consumer_threads = {}
    
    def produce(self, topic: str, message: Any, key: Optional[str] = None) -> None:
        """Produce a message to a Kafka topic.
        
        Args:
            topic: Topic name
            message: Message to produce (will be JSON serialized)
            key: Optional message key
        """
        try:
            # JSON serialize the message if it's not a string
            if not isinstance(message, str):
                message = json.dumps(message)
            
            # Convert to bytes
            message_bytes = message.encode('utf-8')
            key_bytes = key.encode('utf-8') if key else None
            
            # Produce the message
            self.producer.produce(topic, value=message_bytes, key=key_bytes, callback=self._delivery_callback)
            self.producer.poll(0)  # Trigger any callbacks
            
            logger.debug(f"Produced message to {topic}")
        except Exception as e:
            logger.error(f"Error producing to topic {topic}: {str(e)}")
            raise
    
    def flush(self, timeout: float = 10.0) -> None:
        """Flush the producer.
        
        Args:
            timeout: Flush timeout in seconds
        """
        self.producer.flush(timeout)
    
    def consume(self, 
               topic: str, 
               callback: Callable[[str, Any], None],
               group_id: Optional[str] = None,
               auto_offset_reset: str = 'earliest',
               enable_auto_commit: bool = True) -> None:
        """Start consuming messages from a Kafka topic.
        
        Args:
            topic: Topic name
            callback: Callback function for received messages (fn(key, value))
            group_id: Consumer group ID
            auto_offset_reset: Auto offset reset (earliest or latest)
            enable_auto_commit: Enable auto commit
        """
        if topic in self.consumer_threads and self.consumer_threads[topic].is_alive():
            logger.warning(f"Consumer for topic {topic} is already running")
            return
            
        # Create consumer config
        consumer_config = self.consumer_config.copy()
        if group_id:
            consumer_config['group.id'] = group_id
        consumer_config['auto.offset.reset'] = auto_offset_reset
        consumer_config['enable.auto.commit'] = enable_auto_commit
        
        # Start consumer in a separate thread
        consumer_thread = threading.Thread(
            target=self._consume_loop,
            args=(topic, consumer_config, callback),
            daemon=True
        )
        self.consumer_threads[topic] = consumer_thread
        consumer_thread.start()
        
        logger.info(f"Started consumer for topic {topic}")
    
    def _consume_loop(self, 
                     topic: str, 
                     config: Dict[str, Any], 
                     callback: Callable[[str, Any], None]) -> None:
        """Consumer loop running in a separate thread.
        
        Args:
            topic: Topic name
            config: Consumer config
            callback: Callback function
        """
        # Add a small startup delay
        time.sleep(5) # Wait 5 seconds before starting to consume
        logger.info(f"Consumer for topic {topic} starting poll loop after delay.")

        consumer = Consumer(config)
        consumer.subscribe([topic])
        
        try:
            while True:
                msg = consumer.poll(1.0)
                
                if msg is None:
                    continue
                    
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition, continue
                        continue
                    else:
                        # Error
                        logger.error(f"Consumer error: {msg.error()}")
                        break
                
                # Process message
                key = msg.key().decode('utf-8') if msg.key() else None
                value = msg.value().decode('utf-8')
                
                try:
                    # Try to parse as JSON
                    value = json.loads(value)
                except json.JSONDecodeError:
                    # Not valid JSON, use raw value
                    pass
                
                # Call the callback
                try:
                    callback(key, value)
                except Exception as e:
                    logger.error(f"Error in consumer callback: {str(e)}")
        except Exception as e:
            logger.error(f"Error in consumer loop: {str(e)}")
        finally:
            consumer.close()
            logger.info(f"Consumer closed for topic {topic}")
    
    def _delivery_callback(self, err, msg) -> None:
        """Delivery callback for produced messages.
        
        Args:
            err: Error or None
            msg: Message object
        """
        if err:
            logger.error(f"Message delivery failed: {err}")
        else:
            topic = msg.topic()
            key = msg.key().decode('utf-8') if msg.key() else None
            logger.debug(f"Message delivered to {topic} [{msg.partition()}] at offset {msg.offset()}")
    
    def close(self) -> None:
        """Close the Kafka client."""
        try:
            # Flush and close the producer
            self.producer.flush()
            # Wait for consumer threads to finish
            for topic, thread in self.consumer_threads.items():
                thread.join(timeout=5.0)
                if thread.is_alive():
                    logger.warning(f"Consumer thread for topic {topic} is still running")
            
            logger.info("Kafka client closed")
        except Exception as e:
            logger.error(f"Error closing Kafka client: {str(e)}")


# Singleton instance for application-wide use
_kafka_client = None

def get_kafka_client() -> KafkaClient:
    """Get the singleton Kafka client instance.
    
    Returns:
        KafkaClient instance
    """
    global _kafka_client
    if _kafka_client is None:
        bootstrap_servers = os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "127.0.0.1:9092")
        client_id = os.environ.get("KAFKA_CLIENT_ID", "nis-protocol")
        
        _kafka_client = KafkaClient(bootstrap_servers=bootstrap_servers, client_id=client_id)
    
    return _kafka_client 