#!/bin/bash

echo "🔧 Fixing Next.js Vendor Chunk Error..."

# Step 1: Stop all processes
echo "1. Stopping all processes..."
pkill -f "next" || true
docker compose down --volumes --remove-orphans 2>/dev/null || true

# Step 2: Clean Docker completely
echo "2. Cleaning Docker system..."
docker system prune -af
docker builder prune -af
docker volume prune -f

# Step 3: Clean frontend completely
echo "3. Cleaning frontend cache..."
cd frontend
rm -rf .next
rm -rf node_modules
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf package-lock.json
rm -rf pnpm-lock.yaml

# Step 4: Install fresh dependencies
echo "4. Installing fresh dependencies..."
npm install --no-cache

# Step 5: Try building locally first
echo "5. Testing local build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    
    # Step 6: Build Docker containers
    echo "6. Building Docker containers..."
    cd ..
    docker compose build --no-cache
    
    # Step 7: Start services
    echo "7. Starting services..."
    docker compose up -d
    
    echo "✅ Fix complete! Services starting..."
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:8000"
    
    # Monitor startup
    echo "Monitoring startup for 30 seconds..."
    timeout 30 docker compose logs -f
    
else
    echo "❌ Local build failed. Starting dev mode directly..."
    cd ..
    
    # Try with dev containers
    docker compose build --no-cache
    docker compose up -d
    
    echo "🔧 Started in development mode"
    echo "Check logs: docker compose logs -f"
fi

echo "🎉 Fix script complete!" 