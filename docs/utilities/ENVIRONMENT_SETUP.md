# 🔧 ENVIRONMENT SETUP GUIDE
## **Required Configuration for OpenAI to Z Challenge**

---

## **🎯 ESSENTIAL ENVIRONMENT VARIABLES**

### **Required: OpenAI API Key**
```bash
# Get your API key from: https://platform.openai.com/api-keys
export OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Windows:**
```cmd
set OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Note:** This is the ONLY required configuration to run the archaeological discovery system.

---

## **⚡ QUICK START SETUP**

### **Option 1: Create .env File (Recommended)**
```bash
# Create .env file in root directory
echo "OPENAI_API_KEY=sk-your-openai-api-key-here" > .env
```

### **Option 2: Export Variables**
```bash
# Linux/Mac
export OPENAI_API_KEY="sk-your-openai-api-key-here"
export ENVIRONMENT="development"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-openai-api-key-here"
$env:ENVIRONMENT="development"
```

---

## **🔧 OPTIONAL CONFIGURATIONS**

### **Enhanced Features (Not Required for Competition)**
```bash
# Enhanced satellite data access
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# Enhanced mapping visuals  
MAPBOX_ACCESS_TOKEN="pk.your-mapbox-token-here"
```

### **System Configuration**
```bash
# API endpoints (defaults work fine)
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3001"
IKRP_URL="http://localhost:8001"

# Database (SQLite default)
DATABASE_URL="sqlite:///./nis_test.db"

# Environment mode
ENVIRONMENT="development"
```

---

## **🏆 COMPETITION COMPLIANCE**

### **Public Data Sources**
All data sources used are publicly accessible and free:

- ✅ **LIDAR Data**: OpenTopography (CC-BY-SA 4.0)
- ✅ **Satellite**: Sentinel-2 ESA (CC-BY-SA 3.0 IGO)
- ✅ **Historical**: Library of Congress (Public Domain)
- ✅ **Indigenous**: Educational use permitted

### **OpenAI Models**
- ✅ **GPT-4.1**: Required by competition rules
- ✅ **GPT-4 Vision**: Satellite imagery analysis
- ✅ **Real-time Integration**: Live coordinate analysis

---

## **🚀 VERIFICATION CHECKLIST**

### **Test Your Setup:**
```bash
# 1. Clone repository
git clone https://github.com/[username]/OpenAiZChallenge
cd OpenAiZChallenge

# 2. Set environment variable
export OPENAI_API_KEY="your-key-here"

# 3. Start system
docker-compose up -d

# 4. Test endpoints
curl http://localhost:8000/system/health
curl http://localhost:3001  # Should load frontend
```

### **Success Indicators:**
- ✅ Backend responds at localhost:8000
- ✅ Frontend loads at localhost:3001  
- ✅ System health check passes
- ✅ Vision agent can analyze coordinates
- ✅ 148 archaeological discoveries accessible

---

## **🔒 SECURITY BEST PRACTICES**

### **What NOT to Commit:**
- ❌ Actual API keys in code
- ❌ .env files with real credentials
- ❌ Personal access tokens
- ❌ Database credentials

### **Safe Practices:**
- ✅ Use environment variables only
- ✅ Provide .env.example templates
- ✅ Document required variables
- ✅ Use placeholder values in examples

---

## **🆘 TROUBLESHOOTING**

### **Common Issues:**

**"OpenAI API Error"**
```bash
# Check if key is set
echo $OPENAI_API_KEY
# Should show your key starting with "sk-"
```

**"Docker containers not starting"**
```bash
# Check Docker is running
docker --version
docker-compose --version

# Rebuild if needed
docker-compose down
docker-compose up --build -d
```

**"Frontend not loading"**
```bash
# Check ports are available
netstat -an | grep :3001
netstat -an | grep :8000

# Restart services
docker-compose restart
```

---

## **📋 FINAL PRE-SUBMISSION CHECK**

### **Required for Competition:**
- [ ] OpenAI API key configured
- [ ] System starts with docker-compose
- [ ] Frontend accessible at localhost:3001
- [ ] Backend healthy at localhost:8000
- [ ] Vision analysis works for test coordinates
- [ ] No secrets committed to repository

### **Test Coordinates:**
- **Primary Site**: -3.4653, -62.2159 (87% confidence)
- **Secondary**: -10.0, -75.0 (Archaeological evidence)
- **Validation**: 5.1542, -73.7792 (LIDAR confirmed)

---

**Your NIS Protocol system is ready for competition judging!** 🏆

*All 148 archaeological discoveries await exploration by the judges.* 