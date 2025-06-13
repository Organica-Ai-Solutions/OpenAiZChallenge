# 🗺️ Maps Setup Guide

## Google Maps Integration (Optional)

The NIS Protocol frontend can use real satellite imagery from Google Maps for enhanced archaeological analysis. This is optional - the system works perfectly with demo imagery if no API key is configured.

### Setup Steps:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Configure the API Key:**
   - Create a `.env.local` file in the frontend directory
   - Add your API key:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
     ```

3. **Restart the Development Server:**
   ```bash
   npm run dev
   ```

### Without API Key:

If no API key is configured, the system automatically uses:
- ✅ High-quality demo satellite imagery
- ✅ Simulated archaeological features
- ✅ All analysis capabilities work normally
- ✅ No functionality is lost

### With API Key:

When properly configured, you get:
- 🛰️ Real satellite imagery from Google Maps
- 📍 Actual terrain and features
- 🔍 Higher resolution imagery
- 📊 Real-world coordinate accuracy

## Current Status:

The system is designed to work seamlessly with or without the Google Maps API key. All archaeological analysis features are fully functional in both modes. 