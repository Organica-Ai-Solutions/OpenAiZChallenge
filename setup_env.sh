#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🌿 Setting up NIS Protocol environment for real data usage..."

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${RED}Warning: .env file already exists. Please backup and remove it before running this script.${NC}"
    exit 1
fi

# Create .env file
cat > .env << EOL
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost/nis_db

# Earth Archive API (LIDAR)
EARTH_ARCHIVE_API_KEY=your_earth_archive_key
EARTH_ARCHIVE_ENDPOINT=https://api.eartharchive.org/v1

# Sentinel Hub (Satellite)
SENTINEL_HUB_API_KEY=your_sentinel_key
SENTINEL_HUB_INSTANCE_ID=your_instance_id

# Indigenous Knowledge Platform
IKRP_API_KEY=your_ikrp_key
IKRP_ENDPOINT=http://localhost:8001

# Historical Data Service
HISTORICAL_API_KEY=your_historical_key
HISTORICAL_ENDPOINT=http://localhost:8002

# Redis Cache
REDIS_URL=redis://localhost:6379

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_PREFIX=nis_protocol

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs

# Feature Flags
USE_REAL_DATA=true
DISABLE_MOCK_RESPONSES=true
ENABLE_GPT_VISION=true
ENABLE_WEB_SEARCH=true
EOL

# Create required directories
mkdir -p data/{lidar,satellite,colonial_texts,indigenous_maps,historical_cache,indigenous_cache,oral_histories,overlays}
mkdir -p outputs/{findings,logs,memory}

echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo -e "${GREEN}Please edit .env with your actual API keys and configurations.${NC}"

# Check data directories
echo "Checking data directories..."
for dir in lidar satellite colonial_texts indigenous_maps historical_cache indigenous_cache oral_histories overlays; do
    if [ -z "$(ls -A data/$dir)" ]; then
        echo -e "${RED}Warning: data/$dir is empty. Please add real data files.${NC}"
    else
        echo -e "${GREEN}✅ data/$dir contains files${NC}"
    fi
done

# Database setup
echo "Setting up database..."
if command -v psql &> /dev/null; then
    psql -c "CREATE DATABASE nis_db;" || echo -e "${RED}Failed to create database. Please create it manually.${NC}"
else
    echo -e "${RED}PostgreSQL not found. Please install PostgreSQL and create the database manually.${NC}"
fi

# Run migrations
if [ -f "alembic.ini" ]; then
    alembic upgrade head || echo -e "${RED}Failed to run migrations. Please run them manually.${NC}"
else
    echo -e "${RED}alembic.ini not found. Please configure database migrations.${NC}"
fi

echo -e "\n${GREEN}Setup complete! Next steps:${NC}"
echo "1. Edit .env with your actual API keys"
echo "2. Add real data files to the data directories"
echo "3. Configure your database connection"
echo "4. Run 'python run_api.py' to start the server" 