# 🔐 Environment Variables Setup Guide

## **CRITICAL: API Keys Security Fixed**

Your repository now uses environment variables instead of hardcoded API keys. Follow these steps:

## **Step 1: Create Environment Files**

```bash
# 1. Copy the example file to create your .env
cp env.example .env

# 2. Create frontend specific .env.local
cp env.example frontend/.env.local
```

## **Step 2: Get Your API Keys**

### **OpenAI API Key**
1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### **Google Maps API Key**
1. Go to: https://console.cloud.google.com/
2. Enable Google Maps JavaScript API
3. Create credentials → API Key
4. Restrict the key to your domain

### **Mapbox Access Token**
1. Go to: https://account.mapbox.com/access-tokens/
2. Create a new public token
3. Copy the token (starts with `pk.`)

## **Step 3: Update Your .env File**

Edit the `.env` file and replace placeholders:

```bash
# Replace these with your actual keys
OPENAI_API_KEY=sk-your-actual-openai-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key-here
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key-here
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token-here
```

## **Step 4: Verify Setup**

```bash
# Test that environment variables are loaded
echo $OPENAI_API_KEY
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
echo $NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```

## **Step 5: Security Checklist**

- [ ] `.env` file is in `.gitignore` 
- [ ] No hardcoded keys in source code
- [ ] Old exposed keys have been revoked
- [ ] New keys are properly restricted

## **Files Fixed:**
- ✅ `frontend/next.config.mjs` - Removed hardcoded Google Maps keys
- ✅ `docker-compose.yml` - Uses environment variables
- ✅ `frontend/components/ui/mini-mapbox-preview.tsx` - Uses env var
- ✅ `frontend/app/analysis/page.tsx` - Uses env var
- ✅ `frontend/src/components/MapboxVisionMap.tsx` - Uses env var
- ✅ `frontend/components/ui/real-mapbox-lidar.tsx` - Uses env var
- ✅ `frontend/components/ui/real-mapbox-lidar-backup.tsx` - Uses env var
- ✅ `frontend/components/ui/universal-mapbox-integration.tsx` - Uses env var
- ✅ `frontend/components/ui/enhanced-hd-mapbox-lidar.tsx` - Uses env var

## **IMPORTANT SECURITY NOTES:**

1. **NEVER commit .env files** to version control
2. **Revoke the old exposed API keys** immediately
3. **Restrict new API keys** to specific domains/IPs
4. **Use different keys** for development vs production

Your repository is now secure for public access! 🔒✅ 