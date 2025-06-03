# Google Maps Setup Guide

## Quick Setup for Enhanced Map Visualization

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Maps JavaScript API**:
   - Go to APIs & Services > Library
   - Search for "Maps JavaScript API"
   - Click "Enable"

4. Create API Key:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Configure Your Project

Add your API key to `frontend/.env`:

```bash
# Add this line to frontend/.env
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y
```

### 3. Restart Frontend

```bash
docker restart nis-frontend
```

## Features Unlocked

✅ **Interactive satellite imagery**  
✅ **Click-to-analyze anywhere on map**  
✅ **Multiple map types** (Satellite, Terrain, Hybrid)  
✅ **Archaeological site markers** with info windows  
✅ **Professional map interface** for research  

## Without API Key

- Map defaults to **Grid View** (ASCII-style visualization)
- All functionality still works with coordinate selection
- No costs or external dependencies

## Cost Information

- Google Maps: **Free tier** includes 28,000 map loads per month
- Most archaeological research usage stays within free limits
- See [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing)

## Alternative: Mapbox

The system also supports Mapbox (token already configured):
- Similar features to Google Maps
- Different pricing structure
- Can be used as alternative mapping provider

---

**Current Status**: Map works in fallback mode without API key, enhanced features available with Google Maps integration. 