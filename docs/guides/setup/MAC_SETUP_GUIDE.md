# 🍎 Mac Setup Guide - Archaeological Discovery System

## 🚀 Quick Start for Mac Users

This guide ensures the map and all features work perfectly on macOS.

### 📋 Prerequisites

1. **Node.js & npm**: Install from [nodejs.org](https://nodejs.org/) or use Homebrew:
   ```bash
   brew install node
   ```

2. **Git**: Usually pre-installed on Mac, or install via Homebrew:
   ```bash
   brew install git
   ```

### 🗺️ Map Setup (Google Maps API)

#### Option 1: Frontend-only setup (Recommended for Mac)
1. **Create environment file in frontend directory:**
   ```bash
   cd frontend
   touch .env.local
   ```

2. **Add your Google Maps API key:**
   ```bash
   echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here" >> .env.local
   echo "NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_api_key_here" >> .env.local
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
   echo "NODE_ENV=development" >> .env.local
   ```

#### Option 2: Use cross-platform script
1. **Use the generated startup script:**
   ```bash
   chmod +x start_frontend.sh
   ./start_frontend.sh
   ```

### 🎯 Running the Application

#### Method 1: Cross-platform script (Easiest)
```bash
# Make script executable
chmod +x start_frontend.sh

# Run the application
./start_frontend.sh
```

#### Method 2: Traditional npm
```bash
# From project root
cd frontend
npm run dev
```

#### Method 3: Using package.json scripts
```bash
cd frontend
npm run dev:cross-platform
```

### 🧪 Testing Backend & Codex Reader

**Test all endpoints:**
```bash
node test_codex_endpoints.js
```

**Check environment variables:**
```bash
node check_env.js
```

### 🔧 Troubleshooting

#### Map not loading:
1. **Check API key in browser console** (F12):
   - Look for the debug panel in top-right corner
   - Check console for Google Maps errors

2. **Verify environment variables:**
   ```bash
   # From frontend directory
   npm run dev
   # Then check browser console for API key status
   ```

3. **Alternative: Hard-code for testing** (temporary):
   Edit `frontend/next.config.mjs` and add:
   ```javascript
   env: {
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'your_actual_api_key_here',
     // ... other variables
   }
   ```

#### Backend connection issues:
1. **Start backend separately:**
   ```bash
   # In another terminal
   python backend_main.py
   ```

2. **Test backend health:**
   ```bash
   curl http://localhost:8000/system/health
   ```

#### Codex reader not working:
1. **Check IKRP service:**
   ```bash
   curl http://localhost:8001/codex/sources
   ```

2. **Verify port 8001 is available:**
   ```bash
   lsof -i :8001
   ```

### 🌍 Environment Variables Reference

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_IKRP_URL=http://localhost:8001
NODE_ENV=development
```

**Root (.env) for Docker:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
# ... other backend variables
```

### 📱 Features to Test

1. **Map functionality** (`http://localhost:3000/map`):
   - ✅ Interactive Google Maps loads
   - ✅ Archaeological sites appear as markers
   - ✅ Site details show on click
   - ✅ Coordinate selection works

2. **Codex Reader** (`http://localhost:3000/codex-reader`):
   - ✅ Codex sources load
   - ✅ Search functionality works
   - ✅ Analysis features available

3. **Backend Integration**:
   - ✅ 148 archaeological sites load from backend
   - ✅ Real-time data updates
   - ✅ IKRP service responds

### 🚨 Common Issues & Solutions

**Issue**: "Google Maps not available - continuing with static interface"
**Solution**: 
1. Check API key is correctly set in `.env.local`
2. Restart development server
3. Check browser console for specific errors

**Issue**: "Backend offline"
**Solution**:
1. Start backend: `python backend_main.py`
2. Check port 8000 is not in use: `lsof -i :8000`

**Issue**: "Codex reader endpoints fail"
**Solution**:
1. Start IKRP service on port 8001
2. Test with: `curl http://localhost:8001/codex/sources`

### 🎉 Success Indicators

When everything is working, you should see:
- ✅ Google Maps loads with satellite imagery
- ✅ "NIS Protocol backend online" in console
- ✅ "Loaded 148 archaeological sites" in console
- ✅ Interactive map markers for archaeological sites
- ✅ Codex reader loads historical documents
- ✅ No errors in browser console

### 💡 Mac-Specific Tips

1. **Use Terminal.app or iTerm2** for best compatibility
2. **Homebrew** is recommended for installing dependencies
3. **System Preferences → Security** may need to allow Node.js
4. **Use `npm` rather than `yarn`** unless you specifically installed yarn

---

**Need help?** Check the browser console (F12) for specific error messages. 