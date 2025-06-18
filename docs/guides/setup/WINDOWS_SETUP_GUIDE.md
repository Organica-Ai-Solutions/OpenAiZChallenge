# 🏛️ NIS Protocol - Windows Setup Guide

## Advanced Archaeological Discovery Platform

This guide will help you set up and run the NIS Protocol on Windows using our enhanced batch files.

---

## 📋 Prerequisites

Before running NIS Protocol, ensure you have the following installed:

### Required Software
1. **Python 3.8 or later**
   - Download from: https://www.python.org/downloads/
   - ✅ Make sure to check "Add Python to PATH" during installation

2. **Node.js 18 or later**
   - Download from: https://nodejs.org/
   - ✅ npm is included with Node.js

3. **Git** (for version control)
   - Download from: https://git-scm.com/downloads

### Optional (Recommended)
4. **Docker Desktop** (for containerized deployment)
   - Download from: https://www.docker.com/products/docker-desktop/
   - ✅ Includes Docker Compose

---

## 🚀 Quick Start

### Option 1: Quick Launch (Recommended for First Time)
```cmd
run_all.bat
```
This script will:
- ✅ Check system requirements
- 📦 Create virtual environment
- 📚 Install all dependencies
- 🚀 Start both backend and frontend servers

### Option 2: Full System Start
```cmd
start.bat
```
Choose from multiple startup modes:
1. **Docker Mode** (Recommended) - Full containerized environment
2. **Local Development Mode** - Run services directly
3. **Frontend Only Mode** - Development mode

---

## 📁 Available Scripts

### `start.bat` - Main Startup Script
**Enhanced startup with multiple modes**

**Features:**
- 🔍 System compatibility check
- 🐳 Docker and local development support
- 🎯 Multiple startup modes
- 📊 Service health monitoring
- 🎨 Colorized output with status indicators

**Usage:**
```cmd
start.bat
```

**Modes Available:**
1. **Docker Mode** - Uses docker-compose for full deployment
2. **Local Development Mode** - Runs services directly on your machine
3. **Frontend Only Mode** - For UI development

---

### `stop.bat` - Shutdown Script
**Comprehensive service shutdown**

**Features:**
- 🛑 Multiple shutdown options
- 🔧 Process detection and termination
- 🐳 Docker container management
- 📊 Service status reporting

**Usage:**
```cmd
stop.bat
```

**Options Available:**
1. **Full Shutdown** - Stop Docker services and local processes
2. **Docker Only** - Stop only Docker services
3. **Local Processes Only** - Stop only Node.js and Python processes
4. **Force Shutdown** - Aggressive shutdown of all NIS-related processes

---

### `run_all.bat` - Quick Start Script
**Rapid deployment for development**

**Features:**
- ⚡ Fast setup and launch
- 📦 Automatic dependency installation
- 🔧 Virtual environment management
- 🎯 Direct service startup

**Usage:**
```cmd
run_all.bat
```

**What it does:**
1. Checks Python and Node.js installation
2. Creates Python virtual environment
3. Installs all dependencies
4. Starts backend server (port 8000)
5. Starts frontend server (port 3000)

---

### `run_tests.bat` - Test Suite Runner
**Comprehensive testing framework**

**Features:**
- 🧪 Multiple test suites
- 📊 Detailed logging
- 🎯 Targeted testing options
- 📝 Custom test execution

**Usage:**
```cmd
run_tests.bat
```

**Test Suites Available:**
1. **Quick Tests** - Basic functionality and health checks
2. **Full Test Suite** - Complete system testing
3. **Backend Tests** - API and data processing tests
4. **Frontend Tests** - UI and component tests
5. **Integration Tests** - End-to-end testing
6. **Performance Tests** - Load and performance testing
7. **Agent Tests** - AI agent functionality testing
8. **Data Tests** - Data access and processing tests
9. **Custom Test** - Run specific test file

---

## 🌐 Application URLs

Once started, access the application at:

### Main Application
- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8000

### Available Pages
- **Main Dashboard:** http://localhost:3000
- **Agent Interface:** http://localhost:3000/agent
- **Interactive Map:** http://localhost:3000/map
- **Analytics Dashboard:** http://localhost:3000/analytics
- **AI Chat System:** http://localhost:3000/chat
- **Vision Analysis:** http://localhost:3000/vision-analysis
- **Satellite Imagery:** http://localhost:3000/satellite
- **Documentation:** http://localhost:3000/documentation

---

## 🔧 Troubleshooting

### Common Issues

#### ❌ "Python not found"
**Solution:**
1. Install Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart command prompt
4. Verify: `python --version`

#### ❌ "Node.js not found"
**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart command prompt
3. Verify: `node --version` and `npm --version`

#### ❌ "Docker daemon not running"
**Solution:**
1. Open Docker Desktop
2. Wait for Docker to fully start
3. Verify: `docker --version`
4. Alternative: Use Local Development Mode

#### ❌ "Port already in use"
**Solution:**
1. Run `stop.bat` to stop existing services
2. Check for other applications using ports 3000 or 8000
3. Restart the application

#### ❌ "Permission denied" errors
**Solution:**
1. Run Command Prompt as Administrator
2. Ensure antivirus isn't blocking the scripts
3. Check Windows Defender settings

### Log Files
All scripts create detailed logs in the `logs/` directory:
- `nis_startup_bat_[timestamp].log` - Startup logs
- `nis_stop_bat_[timestamp].log` - Shutdown logs
- `nis_test_[timestamp].log` - Test execution logs

---

## 🎯 Development Workflow

### First Time Setup
1. Clone the repository
2. Run `run_all.bat` for quick setup
3. Wait for services to start
4. Open http://localhost:3000

### Daily Development
1. Run `start.bat` and choose Local Development Mode
2. Develop and test your changes
3. Run `run_tests.bat` to validate
4. Use `stop.bat` when finished

### Testing
1. Run `run_tests.bat`
2. Choose appropriate test suite
3. Review test logs in `logs/` directory
4. Fix any failing tests

### Production Deployment
1. Run `start.bat` and choose Docker Mode
2. Verify all services are healthy
3. Run full test suite
4. Monitor application logs

---

## 📊 System Requirements

### Minimum Requirements
- **OS:** Windows 10 or later
- **RAM:** 4GB (8GB recommended)
- **Disk:** 10GB free space
- **CPU:** Dual-core processor

### Recommended Requirements
- **OS:** Windows 11
- **RAM:** 16GB or more
- **Disk:** 20GB free space (SSD recommended)
- **CPU:** Quad-core processor
- **Docker:** For containerized deployment

---

## 🛠️ Advanced Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Docker Configuration
For Docker deployment, ensure `docker-compose.yml` is properly configured:
- Backend service on port 8000
- Frontend service on port 3000
- Proper volume mounts for data persistence

### Development Configuration
For local development:
- Backend runs directly with `python backend_main.py`
- Frontend runs with `npm run dev`
- Hot reloading enabled for development

---

## 📚 Additional Resources

- **Main Documentation:** `README.md`
- **Startup Guide:** `STARTUP_GUIDE.md`
- **API Documentation:** `API_DOCS.md`
- **Architecture Overview:** `NIS_Architecture.txt`
- **Dataflow Guide:** `NIS_DATAFLOW.md`

---

## 🆘 Getting Help

### Quick Commands
```cmd
# Check system status
start.bat -> choose option 1 (Docker Mode)

# Quick start for development
run_all.bat

# Run basic tests
run_tests.bat -> choose option 1 (Quick Tests)

# Clean shutdown
stop.bat -> choose option 1 (Full Shutdown)
```

### Support
1. Check the troubleshooting section above
2. Review log files in the `logs/` directory
3. Consult the main documentation files
4. Ensure all prerequisites are properly installed

---

## ✅ Verification Checklist

Before reporting issues, verify:
- [ ] Python 3.8+ installed and in PATH
- [ ] Node.js 18+ installed and in PATH
- [ ] npm working correctly
- [ ] Docker Desktop running (for Docker mode)
- [ ] Ports 3000 and 8000 are available
- [ ] No antivirus blocking the scripts
- [ ] Command Prompt has sufficient permissions
- [ ] .env file configured with required keys

---

**🏛️ NIS Protocol - Advanced Archaeological Discovery Platform**
*Powered by Multi-Agent Intelligence and Real-Time Analysis* 