# Google Maps API Setup for NIS Protocol

## API Key Configuration

**Development API Key**: `AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y`

### Environment Setup

Add the following to your `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=sk.eyJ1IjoicGVudGl1czAwIiwiYSI6ImNtYXRrbnJqZzExN2cyaXB6Zm9qMzc4bjIifQ.EkaFn8jN6NohoeAAVHL1Sg
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y
```

## Enhanced Map Layer Features

### 🛰️ **Satellite Layer**
- **High-resolution imagery** from multiple providers
- **Archaeological overlays** with site-specific analysis
- **HD mode** for enhanced detail visualization
- **Real-time tile loading** with fallback to demo data

### 🏔️ **Terrain Layer**  
- **Digital elevation models** with topographic features
- **Contour lines** around archaeological sites
- **Elevation analysis** for settlement suitability
- **3D visualization** support

### 📡 **LIDAR Layer**
- **Point cloud visualization** with elevation-based coloring
- **Archaeological feature detection** with confidence scoring
- **Interactive points** with detailed information windows
- **Density analysis** for archaeological potential

### 🗺️ **Historical Layer**
- **Cultural territory overlays** for different periods
- **Inca Empire**, **Colonial**, and **Pre-Columbian** regions
- **Interactive polygons** with historical context
- **Period-specific information** and cultural details

### 🏗️ **Infrastructure Layer**
- **Modern development tracking** near archaeological sites
- **Threat assessment** for archaeological preservation
- **Highway and urban development** impact analysis
- **Conservation priority mapping**

## Layer Controls

### **Interactive Features**
- ✅ **Toggle layers** on/off with real-time rendering
- ✅ **Opacity controls** with live preview
- ✅ **Refresh functionality** for updated data
- ✅ **Layer-specific controls** (HD, 3D, Contours, etc.)
- ✅ **Statistics display** for each active layer

### **Quick Presets**
- 🏔️ **Topographic**: Satellite + Terrain layers
- 🔍 **Archaeological**: Satellite + LIDAR layers  
- 📜 **Historical**: Satellite + Historical layers
- ⚠️ **Conservation**: Satellite + Infrastructure layers

### **Advanced Features**
- 📊 **Real-time statistics** for each layer
- 🎯 **Feature counting** and density analysis
- 🔄 **Auto-refresh** when map bounds change
- 📍 **Click interactions** with detailed info windows
- 🎨 **Color-coded overlays** based on archaeological relevance

## API Integration

### **Backend Endpoints**
- `/satellite/imagery` - High-resolution satellite data
- `/lidar/data` - LIDAR point cloud information
- `/terrain/elevation` - Digital elevation models
- `/historical/maps` - Georeferenced historical documents
- `/infrastructure/modern` - Current development data

### **Demo Mode**
When backend is offline, all layers work with comprehensive demo data:
- **90+ LIDAR points** around archaeological sites
- **3 historical territories** with cultural context
- **12+ infrastructure features** showing development threats
- **Elevation contours** and topographic analysis

## Usage Instructions

1. **Navigate to Map Page**: `/map`
2. **Open Layers Tab**: Click on the 4-tab sidebar
3. **Toggle Layers**: Use switches to enable/disable layers
4. **Adjust Opacity**: Use sliders for transparency control
5. **Use Presets**: Quick buttons for common layer combinations
6. **Interactive Elements**: Click on map features for details
7. **Refresh Data**: Use refresh buttons for updated information

## Performance Notes

- **Optimized rendering** with overlay management
- **Efficient memory usage** with layer cleanup
- **Progressive loading** for large datasets
- **Responsive controls** for mobile devices
- **Error handling** with graceful fallbacks

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