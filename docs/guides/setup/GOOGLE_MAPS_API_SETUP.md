# 🗺️ Google Maps API Setup Guide

## Quick Fix for Map Errors

The satellite page map errors are caused by missing Google Maps API key. Here's how to fix it:

### Step 1: Get Google Maps API Key (FREE)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Configure the API Key

Create or edit `frontend/.env.local`:

```bash
# Add this line to frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Frontend

```bash
cd frontend
npm run dev
```

### Step 4: Verify

- Go to the Satellite page
- The map should now load properly
- No more API key errors in console

## Alternative: Disable Maps Temporarily

If you don't want to set up Google Maps right now, the satellite page will show a helpful error message with coordinates display instead of crashing.

## Security Note

- The API key will be visible in the browser (this is normal for Maps JavaScript API)
- Restrict the API key to your domain in Google Cloud Console for production use

## Troubleshooting

**Still seeing errors?**
- Make sure the API key is in `frontend/.env.local` (not the root `.env`)
- Restart the frontend development server
- Check that Maps JavaScript API is enabled in Google Cloud Console

**Rate limiting?**
- Google Maps has generous free tier (28,000 map loads per month)
- Monitor usage in Google Cloud Console 