#!/usr/bin/env python

"""Script to run all NIS Protocol services."""

import os
import sys
import time
import logging
import subprocess
import signal
import shutil
from pathlib import Path

# Configure logging
log_dir = Path("outputs/logs")
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_dir / "run_all.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("run_all")

# List of processes to manage
processes = []

def check_requirements():
    """Check if all required tools are installed."""
    required_tools = {
        "redis-server": "Redis is required. Install it with 'brew install redis' (macOS) or 'apt-get install redis-server' (Ubuntu)",
        "kafka-server-start": "Kafka is required. Install it with 'brew install kafka' (macOS) or follow instructions at kafka.apache.org"
    }
    
    missing_tools = []
    
    for tool, message in required_tools.items():
        if shutil.which(tool) is None:
            missing_tools.append(f"{tool}: {message}")
    
    if missing_tools:
        logger.error("Missing required tools:")
        for msg in missing_tools:
            logger.error(f"  - {msg}")
        return False
    
    return True

def start_redis():
    """Start Redis server."""
    logger.info("Starting Redis server...")
    
    # Check if Redis is already running
    try:
        redis_running = subprocess.run(
            ["redis-cli", "ping"], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        if redis_running.stdout.strip() == "PONG":
            logger.info("Redis is already running")
            return None
    except Exception:
        pass
    
    # Start Redis
    try:
        redis_process = subprocess.Popen(
            ["redis-server"], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for Redis to start
        time.sleep(2)
        
        # Check if Redis started successfully
        if redis_process.poll() is not None:
            logger.error("Failed to start Redis")
            return None
        
        logger.info("Redis server started")
        return redis_process
    except Exception as e:
        logger.error(f"Error starting Redis: {str(e)}")
        return None

def start_kafka():
    """Start Kafka server."""
    logger.info("Starting Kafka server...")
    
    # Find Kafka installation
    kafka_start_script = shutil.which("kafka-server-start")
    if not kafka_start_script:
        logger.error("Kafka start script not found")
        return None
    
    # Check for Kafka config
    kafka_config = None
    possible_configs = [
        "/opt/homebrew/etc/kafka/server.properties",  # macOS Homebrew
        "/usr/local/etc/kafka/server.properties",     # macOS Homebrew (Intel)
        "/etc/kafka/server.properties",               # Linux package
        os.path.join(os.path.dirname(os.path.dirname(kafka_start_script)), "config/server.properties")  # Generic
    ]
    
    for config in possible_configs:
        if os.path.exists(config):
            kafka_config = config
            break
    
    if not kafka_config:
        logger.error("Kafka config not found")
        return None
    
    # Start ZooKeeper if needed
    zookeeper_process = None
    zookeeper_script = shutil.which("zookeeper-server-start")
    if zookeeper_script:
        zookeeper_config = None
        for base_config in possible_configs:
            zk_config = base_config.replace("server.properties", "zookeeper.properties")
            if os.path.exists(zk_config):
                zookeeper_config = zk_config
                break
        
        if zookeeper_config:
            logger.info("Starting ZooKeeper...")
            try:
                zookeeper_process = subprocess.Popen(
                    [zookeeper_script, zookeeper_config], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                # Wait for ZooKeeper to start
                time.sleep(5)
                
                if zookeeper_process.poll() is not None:
                    logger.error("Failed to start ZooKeeper")
                    return None
                
                logger.info("ZooKeeper started")
            except Exception as e:
                logger.error(f"Error starting ZooKeeper: {str(e)}")
                return None
    
    # Start Kafka
    try:
        kafka_process = subprocess.Popen(
            [kafka_start_script, kafka_config], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for Kafka to start
        time.sleep(10)
        
        if kafka_process.poll() is not None:
            logger.error("Failed to start Kafka")
            if zookeeper_process:
                zookeeper_process.terminate()
            return None
        
        logger.info("Kafka server started")
        
        if zookeeper_process:
            processes.append(zookeeper_process)
        return kafka_process
    except Exception as e:
        logger.error(f"Error starting Kafka: {str(e)}")
        if zookeeper_process:
            zookeeper_process.terminate()
        return None

def start_api():
    """Start the NIS Protocol API server."""
    logger.info("Starting NIS Protocol API server...")
    
    try:
        api_process = subprocess.Popen(
            [sys.executable, "run_api.py"], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True,
            env=dict(os.environ, 
                     REDIS_HOST="localhost",
                     REDIS_PORT="6379",
                     KAFKA_BOOTSTRAP_SERVERS="localhost:9092")
        )
        
        # Wait for API to start
        time.sleep(2)
        
        if api_process.poll() is not None:
            logger.error("Failed to start API server")
            return None
        
        logger.info("API server started")
        return api_process
    except Exception as e:
        logger.error(f"Error starting API server: {str(e)}")
        return None

def stop_all(sig=None, frame=None):
    """Stop all running processes."""
    logger.info("Stopping all services...")
    
    for process in processes:
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
    
    logger.info("All services stopped")
    sys.exit(0)

def main():
    """Main function to start all services."""
    logger.info("Starting all NIS Protocol services...")
    
    # Check requirements
    if not check_requirements():
        logger.error("Failed to meet requirements. Exiting.")
        sys.exit(1)
    
    # Create necessary directories
    os.makedirs("outputs/findings", exist_ok=True)
    os.makedirs("outputs/memory", exist_ok=True)
    
    # Register signal handlers
    signal.signal(signal.SIGINT, stop_all)
    signal.signal(signal.SIGTERM, stop_all)
    
    # Start services
    redis_process = start_redis()
    if redis_process:
        processes.append(redis_process)
    
    kafka_process = start_kafka()
    if kafka_process:
        processes.append(kafka_process)
    
    api_process = start_api()
    if api_process:
        processes.append(api_process)
    
    if not redis_process and not kafka_process:
        logger.error("Failed to start required services. Exiting.")
        stop_all()
        sys.exit(1)
    
    logger.info("All services started")
    logger.info("Press Ctrl+C to stop")
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_all()

if __name__ == "__main__":
    main() 