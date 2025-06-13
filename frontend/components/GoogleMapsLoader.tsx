'use client';

import { useEffect } from 'react';

export default function GoogleMapsLoader() {
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      console.log('✅ Google Maps already loaded');
      window.dispatchEvent(new CustomEvent('google-maps-loaded'));
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log('🗺️ Google Maps script already exists, waiting...');
      return;
    }

    // Only load if we have a valid API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    console.log('🔑 Google Maps API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });
    
    if (!apiKey) {
      console.log('⚠️ No Google Maps API key found, using awesome fallback map');
      // Force fallback map immediately
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('google-maps-error', { 
          detail: 'Using fallback archaeological grid - works great!' 
        }));
      }, 100);
      return;
    }

    // Create global callback function for Google Maps
    (window as any).initGoogleMapsCallback = () => {
      console.log('✅ Google Maps API loaded globally');
      window.dispatchEvent(new CustomEvent('google-maps-loaded'));
    };

    // Load Google Maps script with proper async loading pattern
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,drawing&loading=async&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    
    console.log('🗺️ Loading Google Maps with URL:', script.src);

    script.onerror = (error) => {
      console.error('❌ Google Maps API failed to load globally:', error);
      alert('🚨 Google Maps Load Error - Check Console for Details');
      window.dispatchEvent(new CustomEvent('google-maps-error', { detail: error }));
    };

    document.head.appendChild(script);
    console.log('🗺️ Google Maps script added to page');
  }, []);

  return null; // This component doesn't render anything
}

// Global type declaration
declare global {
  interface Window {
    initGoogleMapsCallback?: () => void;
  }
} 