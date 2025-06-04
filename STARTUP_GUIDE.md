# NIS Protocol Startup Guide

## 🎉 System Status: FULLY OPERATIONAL ✅

Both startup scripts have been fixed and are working perfectly with **COMPLETE INFRASTRUCTURE**!

### 🆕 **Latest Update: Kafka Integration Complete**
- ✅ Zookeeper service running on port 2181
- ✅ Kafka service running on port 9092  
- ✅ All required Kafka topics created:
  - `nis.analysis.events`
  - `nis.batch.events` 
  - `nis.statistics.events`

## 🚀 Quick Start Options

### Option 1: Docker Compose Mode (Recommended for Production)
```bash
./start.sh
```
**Features:**
- ✅ Full containerized environment
- ✅ Complete infrastructure (Redis, Kafka, Zookeeper)
- ✅ Automatic dependency management
- ✅ Production-ready configuration
- ✅ Comprehensive system checks
- ✅ Automatic conflict resolution

**Services Running:**
- 🔗 **Zookeeper**: Coordination service (port 2181)
- 📨 **Kafka**: Event streaming (port 9092)
- 💾 **Redis**: Caching and session management (port 6379)
- 🖥️ **Backend**: FastAPI server (port 8000)
- 🌐 **Frontend**: Next.js application (port 3000)

**Access Points:**
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8000/docs

### Option 2: Development Mode (Recommended for Development)
```bash
./reset_nis_system.sh
```
**Features:**
- ✅ Fast startup and restart
- ✅ Live reload for development
- ✅ Automatic dependency fixing
- ✅ Better debugging capabilities
- ✅ Corrupted cache cleanup

**Access Points:**
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8000/docs

## 🔧 System Health Check
```bash
./test_system_quick.sh
```
This script provides a comprehensive health check of all services including Kafka.

## 📨 Kafka Topics Setup
```bash
./setup_kafka_topics.sh
```
Creates all required Kafka topics for event streaming and processing.

## 🛠️ What We Fixed

### start.sh Improvements:
1. **Docker Daemon Check** - Verifies Docker is running before attempting operations
2. **Conflict Resolution** - Automatically stops conflicting development processes and Homebrew services
3. **Container Cleanup** - Removes standalone containers that might conflict
4. **Better Error Handling** - Provides clear instructions when issues occur
5. **Dockerfile Validation** - Checks for correct Dockerfile.dev path
6. **Complete Infrastructure** - Added Kafka and Zookeeper services

### docker-compose.yml Complete Infrastructure:
1. **Zookeeper Service** - Kafka coordination with proper configuration
2. **Kafka Service** - Event streaming with auto-topic creation enabled
3. **Redis Service** - Caching and session management
4. **Backend Service** - With Kafka environment variables configured
5. **Frontend Service** - Connected to complete backend infrastructure
6. **Persistent Volumes** - Data persistence for all services

### reset_nis_system.sh Improvements:
1. **Node.js Corruption Fix** - Automatically fixes corrupted pnpm/npm cache
2. **Dependency Reinstallation** - Force reinstalls frontend dependencies
3. **Backend Stability** - Uses simple_backend.py without reload issues
4. **Better Health Checks** - Multiple retry attempts with timeouts
5. **Docker Availability Check** - Gracefully handles Docker unavailability
6. **Port Configuration** - Uses correct port 3000 to match docker-compose
7. **Kafka Container Cleanup** - Properly handles Kafka and Zookeeper containers

### test_system_quick.sh Features:
1. **Comprehensive Checks** - Tests Docker, Redis, Zookeeper, Kafka, backend, and frontend
2. **Process Detection** - Finds both development and production processes
3. **Clear Status Display** - Color-coded output with helpful suggestions
4. **Timeout Handling** - Prevents hanging on unresponsive services
5. **Infrastructure Validation** - Verifies complete stack is operational

## 🐳 Docker Requirements

**Before running start.sh:**
1. Ensure Docker Desktop is installed and running
2. Wait for Docker to fully start (green status in Docker Desktop)
3. Verify with: `docker info`
4. **Stop any conflicting Homebrew services:** `brew services stop kafka && brew services stop zookeeper`

## 🔄 Switching Between Modes

### From Docker Compose to Development:
```bash
docker-compose down  # Stop Docker services
./reset_nis_system.sh  # Start development mode
```

### From Development to Docker Compose:
```bash
./start.sh  # Automatically stops development processes and starts Docker
```

## 🚨 Troubleshooting

### If Docker Daemon Not Running:
```bash
# Start Docker Desktop application
# Wait for it to fully load
# Then run: ./start.sh
```

### If Ports Are Busy:
```bash
# The scripts now automatically handle this!
# If you had Homebrew Kafka/Zookeeper running:
brew services stop kafka
brew services stop zookeeper
./start.sh  # Will now work without conflicts
```

### If Frontend Dependencies Are Corrupted:
```bash
# The reset script now handles this automatically!
# But if needed manually:
cd frontend
rm -rf node_modules/.pnpm .next
npm install --force
```

### If Kafka Topics Are Missing:
```bash
# Run the topic setup script:
./setup_kafka_topics.sh
```

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Zookeeper     │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Port 2181)   │
│   Port: 3000    │    │   Port: 8000    │    └─────────────────┘
└─────────────────┘    └─────────────────┘              │
                                │                       │
                     ┌─────────────────┐    ┌─────────────────┐
                     │     Redis       │    │     Kafka       │
                     │   (Cache)       │    │ (Event Stream)  │
                     │   Port: 6379    │    │   Port: 9092    │
                     └─────────────────┘    └─────────────────┘
```

## 🎯 Success Indicators

When everything is working correctly, you should see:
- ✅ Docker daemon is running
- ✅ Redis container is running  
- ✅ Zookeeper container is running
- ✅ Kafka container is running
- ✅ Backend is responding on port 8000
- ✅ Frontend is responding on port 3000
- ✅ All Kafka topics created successfully

## 🏛️ About NIS Protocol

This Archaeological Discovery Platform is powered by the NIS Protocol, developed by Organica AI Solutions. It combines AI-powered analysis with respect for indigenous cultural heritage and traditional knowledge.

**Features:**
- 🛰️ Satellite imagery analysis with LIDAR integration
- 🤖 OpenAI GPT-4o powered archaeological discovery
- 📊 Real-time event streaming via Kafka
- 💾 Distributed caching and session management
- 🌍 Respectful cultural heritage research methodology

**Visit:** https://organicaai.com

---

*Last Updated: June 4, 2025*
*Status: All systems operational with complete Kafka infrastructure* ✅ 