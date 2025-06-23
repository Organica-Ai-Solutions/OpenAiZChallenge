# 🏛️ NIS Protocol - Quick Start Guide for Judges

## 🚀 One-Command Launch

**For the judges: Run the entire Archaeological Discovery Platform with a single command!**

### Prerequisites (Must Have)
- ✅ **Docker Desktop** (with Docker Compose)
- ✅ **Git** (for cloning the repository)
- ✅ **8GB+ RAM** (recommended for smooth operation)
- ✅ **10GB+ free disk space**

---

## 🎯 **INSTANT LAUNCH COMMANDS**

### **Linux/Mac:**
```bash
./start.sh
```

### **Windows:**
```cmd
start.bat
```

**That's it!** The system will automatically:
1. ✅ Build all Docker containers
2. ✅ Start all services
3. ✅ Verify health checks
4. ✅ Display access URLs

---

## 🌍 **Access Points (After Launch)**

| **Service** | **URL** | **Description** |
|-------------|---------|-----------------|
| **🎨 Frontend** | http://localhost:3000 | Main Archaeological Discovery Interface |
| **🔧 Main API** | http://localhost:8000 | Primary Backend API |
| **📋 API Docs** | http://localhost:8000/docs | Interactive API Documentation |
| **📜 IKRP Service** | http://localhost:8001 | Indigenous Knowledge Research Protocol |
| **🛡️ Fallback API** | http://localhost:8003 | Reliable Backup Backend |

---

## 📊 **System Architecture Overview**

```
🏛️ NIS Protocol Archaeological Discovery Platform
├── 🎨 Frontend (Next.js 15.3.3 + React 18.3.1)
├── 🔧 Main Backend (FastAPI + Python 3.12)
├── 📜 IKRP Service (Indigenous Knowledge Research)
├── 🛡️ Fallback Backend (Reliable LIDAR Processing)
└── 🏗️ Infrastructure (Redis + Kafka + Zookeeper)
```

---

## 🔧 **Management Commands**

### **View Live Logs:**
```bash
docker-compose logs -f
```

### **Check Service Status:**
```bash
docker-compose ps
```

### **Stop All Services:**
```bash
docker-compose down
# OR
./stop.sh
```

### **Reset System:**
```bash
./reset_nis_system.sh
```

---

## 🎯 **Key Features to Test**

### **1. AI-Powered Chat Interface**
- Navigate to: http://localhost:3000/chat
- Test the animated AI assistant with archaeological queries

### **2. Interactive Map Analysis**
- Navigate to: http://localhost:3000/map
- Upload satellite imagery for archaeological analysis

### **3. Satellite Image Processing**
- Navigate to: http://localhost:3000/satellite
- Test GPT-4 Vision integration for site detection

### **4. LIDAR Data Processing**
- Navigate to: http://localhost:3000/analysis
- Upload LIDAR data for terrain analysis

### **5. Archaeological Discovery Dashboard**
- Navigate to: http://localhost:3000/archaeological-discovery
- View AI-generated archaeological insights

---

## 🛠️ **Troubleshooting**

### **If Docker fails to start:**
```bash
# Check Docker daemon
docker info

# Restart Docker Desktop
# Then re-run: ./start.sh
```

### **If ports are in use:**
```bash
# The startup script automatically handles port conflicts
# But you can manually check:
netstat -ano | grep :3000
netstat -ano | grep :8000
```

### **If containers fail to build:**
```bash
# Clean Docker environment
docker system prune -a
docker volume prune

# Then re-run: ./start.sh
```

---

## 📈 **Performance Expectations**

| **Metric** | **Expected** |
|------------|--------------|
| **Startup Time** | 2-5 minutes (first build) |
| **Memory Usage** | 4-6 GB RAM |
| **Disk Usage** | 5-8 GB |
| **Response Time** | < 2 seconds |

---

## 🎨 **Demo Scenarios**

### **Scenario 1: Archaeological Site Discovery**
1. Go to http://localhost:3000/satellite
2. Upload a satellite image
3. Watch GPT-4 Vision analyze for archaeological features
4. View results in the discovery dashboard

### **Scenario 2: IKRP Cultural Analysis**
1. Go to http://localhost:3000/chat
2. Ask: "What indigenous communities lived in the Amazon basin?"
3. See the IKRP service provide culturally-sensitive responses

### **Scenario 3: LIDAR Terrain Analysis**
1. Go to http://localhost:3000/analysis
2. Upload LIDAR data
3. View 3D terrain reconstruction and anomaly detection

---

## 🏆 **Competition Highlights**

### **Technical Innovation:**
- ✅ Multi-Agent AI Architecture
- ✅ Real-time Docker Orchestration
- ✅ GPT-4 Vision Integration
- ✅ Indigenous Knowledge Protocol (IKRP)
- ✅ Advanced LIDAR Processing

### **User Experience:**
- ✅ Animated Glass-morphism UI
- ✅ Real-time Chat Interface
- ✅ Interactive Map Visualization
- ✅ Responsive Design (Mobile/Desktop)

### **Cultural Sensitivity:**
- ✅ IKRP Ethical Framework
- ✅ Indigenous Knowledge Respect
- ✅ Cultural Context Integration
- ✅ Community Consent Protocols

---

## 📞 **Support Information**

**Developed by:** Organica AI Solutions  
**Website:** https://organicaai.com  
**Architecture:** Multi-Agent AI System  
**Technologies:** Python 3.12, Next.js 15.3.3, FastAPI, Docker, GPT-4  

---

## 🎉 **Success Indicators**

✅ All containers running (7 services)  
✅ Frontend accessible at :3000  
✅ Backend APIs responding  
✅ No error messages in logs  
✅ Health checks passing  

**The system is ready when you see:**
```
🎉 NIS Protocol Archaeological Discovery Platform is LIVE!
```

---

**🏛️ Ready to discover archaeological wonders with AI? Start exploring!** 