# 🏛️ NIS Protocol - Archaeological Discovery Platform

**AI-Powered Indigenous Knowledge Research & Archaeological Site Detection**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.12-green.svg)](https://fastapi.tiangolo.com/)
[![GPT-4](https://img.shields.io/badge/GPT--4-Vision-orange.svg)](https://openai.com/)

---

## 🚀 **Quick Start for Judges**

### **One-Command Launch:**

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Prerequisites Check:**
```bash
./check_prerequisites.sh
```

---

## 🌟 **What is NIS Protocol?**

The **NIS Protocol** (Neural Intelligence System) is an advanced AI-powered platform for archaeological discovery and indigenous knowledge research. It combines:

- 🛰️ **Satellite Image Analysis** with GPT-4 Vision
- 🤖 **Multi-Agent AI Architecture** for intelligent processing
- 📜 **IKRP (Indigenous Knowledge Research Protocol)** for cultural sensitivity
- 🔍 **LIDAR Data Processing** for terrain analysis
- 🗺️ **Interactive Map Visualization** with real-time discovery
- 💬 **Animated AI Chat Interface** with archaeological expertise

---

## 🏗️ **System Architecture**

```
🏛️ NIS Protocol Archaeological Discovery Platform
├── 🎨 Frontend (Next.js 15.3.3 + React 18.3.1 + TypeScript)
│   ├── Animated AI Chat with Glass-morphism UI
│   ├── Interactive Map with Satellite Overlay
│   ├── Real-time Archaeological Analysis Dashboard
│   └── Mobile-Responsive Design
├── 🔧 Main Backend (FastAPI + Python 3.12)
│   ├── Multi-Agent AI Coordination
│   ├── GPT-4 Vision Integration
│   ├── Satellite Image Processing
│   └── RESTful API with Auto-Documentation
├── 📜 IKRP Service (Indigenous Knowledge Research Protocol)
│   ├── Cultural Context Engine
│   ├── Ethical Framework Implementation
│   └── Community Consent Management
├── 🛡️ Fallback Backend (Reliable LIDAR Processing)
│   ├── LIDAR Data Analysis
│   ├── Terrain Reconstruction
│   └── Archaeological Site Scoring
└── 🏗️ Infrastructure (Docker Orchestration)
    ├── Redis (Caching & Session Management)
    ├── Kafka (Message Queue & Event Streaming)
    └── Zookeeper (Distributed Coordination)
```

---

## 🌍 **Access Points**

| **Service** | **URL** | **Description** |
|-------------|---------|-----------------|
| **🎨 Frontend** | http://localhost:3000 | Main Archaeological Discovery Interface |
| **🔧 Main API** | http://localhost:8000 | Primary Backend API |
| **📋 API Docs** | http://localhost:8000/docs | Interactive API Documentation |
| **📜 IKRP Service** | http://localhost:8001 | Indigenous Knowledge Research Protocol |
| **🛡️ Fallback API** | http://localhost:8003 | Reliable Backup Backend |

---

## 🎯 **Key Features Demo**

### **1. AI-Powered Archaeological Chat**
- **URL**: http://localhost:3000/chat
- **Features**: Animated glass-morphism UI, real-time AI responses
- **Test Query**: *"Analyze this satellite image for potential archaeological sites"*

### **2. Interactive Satellite Analysis**
- **URL**: http://localhost:3000/satellite
- **Features**: GPT-4 Vision integration, drag-and-drop image upload
- **Test**: Upload satellite imagery to detect archaeological features

### **3. LIDAR Terrain Processing**
- **URL**: http://localhost:3000/analysis
- **Features**: 3D terrain reconstruction, anomaly detection
- **Test**: Upload LIDAR data for archaeological site scoring

### **4. Cultural Context Integration (IKRP)**
- **URL**: http://localhost:3000/chat
- **Features**: Indigenous knowledge integration, cultural sensitivity
- **Test Query**: *"What indigenous communities historically lived in this region?"*

### **5. Real-time Discovery Dashboard**
- **URL**: http://localhost:3000/archaeological-discovery
- **Features**: Live archaeological insights, discovery timeline
- **Test**: View AI-generated archaeological analysis results

---

## 🔧 **Management Commands**

### **System Control:**
```bash
# Start the complete system
./start.sh

# Stop all services
./stop.sh

# Reset system (clean restart)
./reset_nis_system.sh

# Check prerequisites
./check_prerequisites.sh
```

### **Docker Management:**
```bash
# View live logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop specific service
docker-compose stop frontend

# Rebuild and restart
docker-compose up --build -d
```

---

## 📊 **Technical Specifications**

### **Frontend Technologies:**
- **Framework**: Next.js 15.3.3 with App Router
- **UI Library**: React 18.3.1 + TypeScript 5.8.3
- **Styling**: Tailwind CSS + Radix UI + Framer Motion
- **Features**: Server-side rendering, optimized caching, responsive design

### **Backend Technologies:**
- **API Framework**: FastAPI with Python 3.12
- **AI Integration**: OpenAI GPT-4 Vision API
- **Data Processing**: NumPy, Pandas, Pillow for image processing
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for session management and caching

### **Infrastructure:**
- **Containerization**: Docker + Docker Compose
- **Message Queue**: Apache Kafka with Zookeeper
- **Monitoring**: Built-in health checks and logging
- **Security**: Environment-based configuration, CORS protection

---

## 🏆 **Competition Highlights**

### **Innovation Points:**
- ✅ **Multi-Agent AI Architecture** with specialized agents
- ✅ **Real-time GPT-4 Vision Integration** for satellite analysis
- ✅ **Indigenous Knowledge Research Protocol (IKRP)** for cultural sensitivity
- ✅ **Advanced LIDAR Processing** with 3D terrain reconstruction
- ✅ **Animated Glass-morphism UI** with modern design principles
- ✅ **Complete Docker Orchestration** for seamless deployment

### **Technical Excellence:**
- ✅ **Microservices Architecture** with independent scaling
- ✅ **Event-driven Communication** via Kafka messaging
- ✅ **Comprehensive Error Handling** with fallback mechanisms
- ✅ **Auto-generated API Documentation** with FastAPI
- ✅ **Mobile-responsive Design** for cross-platform access
- ✅ **Production-ready Deployment** with health monitoring

### **Cultural Sensitivity:**
- ✅ **IKRP Ethical Framework** for indigenous knowledge respect
- ✅ **Community Consent Protocols** for archaeological research
- ✅ **Cultural Context Integration** in AI responses
- ✅ **Respectful Discovery Practices** following archaeological ethics

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

**1. Docker fails to start:**
```bash
# Check Docker daemon
docker info

# Restart Docker Desktop, then:
./start.sh
```

**2. Port conflicts:**
```bash
# The startup script handles this automatically
# Manual check:
netstat -ano | grep :3000
```

**3. Services not responding:**
```bash
# Check service health
docker-compose ps
docker-compose logs frontend
docker-compose logs backend
```

**4. Memory issues:**
```bash
# Ensure 8GB+ RAM available
# Check Docker resource limits in Docker Desktop
```

---

## 📈 **Performance Metrics**

| **Metric** | **Expected Performance** |
|------------|--------------------------|
| **Startup Time** | 2-5 minutes (first build) |
| **Memory Usage** | 4-6 GB RAM |
| **Disk Usage** | 5-8 GB |
| **API Response Time** | < 2 seconds |
| **Image Processing** | 5-15 seconds per image |
| **LIDAR Analysis** | 10-30 seconds per dataset |

---

## 🎨 **Demo Scenarios for Judges**

### **Scenario 1: Archaeological Site Discovery**
1. Navigate to http://localhost:3000/satellite
2. Upload a satellite image (sample images in `/data/satellite/`)
3. Watch GPT-4 Vision analyze for archaeological features
4. View confidence scores and site classifications
5. Check discovery dashboard for results

### **Scenario 2: Cultural Context Analysis**
1. Go to http://localhost:3000/chat
2. Ask: *"What indigenous communities lived in the Amazon basin around 1500 CE?"*
3. Observe IKRP service providing culturally-sensitive responses
4. Note the ethical framework and community consent considerations

### **Scenario 3: LIDAR Terrain Analysis**
1. Navigate to http://localhost:3000/analysis
2. Upload LIDAR data (sample files in `/data/lidar/`)
3. View 3D terrain reconstruction
4. Analyze anomaly detection results for potential archaeological sites

---

## 📞 **Project Information**

**Developed by:** Organica AI Solutions  
**Website:** https://organicaai.com  
**Competition:** OpenAI Challenge 2024  
**Architecture:** Multi-Agent AI System  
**Technologies:** Python 3.12, Next.js 15.3.3, FastAPI, Docker, GPT-4  

---

## 📋 **System Requirements**

### **Minimum Requirements:**
- **RAM**: 4GB (8GB+ recommended)
- **Storage**: 10GB free space
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Docker**: Docker Desktop with Docker Compose
- **Internet**: Required for AI API calls and Docker images

### **Recommended Requirements:**
- **RAM**: 16GB
- **Storage**: 20GB+ SSD
- **CPU**: 4+ cores
- **Network**: Stable broadband connection

---

## 🎉 **Success Indicators**

When the system is running correctly, you should see:

✅ **All 7 containers running** (`docker-compose ps`)  
✅ **Frontend accessible** at http://localhost:3000  
✅ **Backend APIs responding** (health checks passing)  
✅ **No error messages** in logs  
✅ **Services communicating** (Kafka, Redis operational)  

**Success message:**
```
🎉 NIS Protocol Archaeological Discovery Platform is LIVE!
```

---

**🏛️ Discover the past with AI • Respect indigenous knowledge • Build the future**
