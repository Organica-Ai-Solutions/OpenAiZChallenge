#!/bin/bash

# Kafka broker configuration
KAFKA_BROKER="localhost:9092"

# Topics to create
TOPICS=(
  "nis.analysis.events"
  "nis.batch.events"
  "nis.statistics.events"
)

# Function to create a topic with retry
create_topic() {
  local topic=$1
  echo "Attempting to create topic: $topic"
  
  # Try to delete the topic first (in case it exists with incorrect configuration)
  docker exec nis-kafka kafka-topics --bootstrap-server $KAFKA_BROKER --delete --topic $topic || true
  
  # Create the topic with specific configurations
  docker exec nis-kafka kafka-topics --create \
    --bootstrap-server $KAFKA_BROKER \
    --topic $topic \
    --partitions 3 \
    --replication-factor 1 \
    --config retention.ms=86400000 \
    --config cleanup.policy=compact
}

# Create each topic
for topic in "${TOPICS[@]}"; do
  create_topic $topic
done

# List topics to verify
docker exec nis-kafka kafka-topics --list --bootstrap-server $KAFKA_BROKER

echo "Kafka topics setup complete." 