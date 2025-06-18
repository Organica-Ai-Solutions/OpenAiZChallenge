#!/bin/bash

echo "🔧 Fixing Next.js Frontend Build Issues..."

# Stop all containers
echo "Stopping containers..."
docker compose down --volumes --remove-orphans 2>/dev/null || docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Clean Docker cache
echo "Cleaning Docker cache..."
docker system prune -f
docker builder prune -f

# Remove Next.js build artifacts
echo "Cleaning Next.js cache..."
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
rm -rf frontend/.next/cache

# Clean frontend node_modules if needed
if [ -d "frontend/node_modules" ]; then
    echo "Cleaning node_modules..."
    rm -rf frontend/node_modules
fi

# Rebuild containers with no cache
echo "Rebuilding containers without cache..."
docker compose build --no-cache

# Start services
echo "Starting services..."
docker compose up -d

echo "✅ Frontend fix complete! Services should be starting..."
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API available at: http://localhost:8000"

# Monitor logs
echo "Monitoring startup logs for 30 seconds..."
timeout 30 docker compose logs -f || true

echo "🎉 Fix complete! Check the services at the URLs above." 