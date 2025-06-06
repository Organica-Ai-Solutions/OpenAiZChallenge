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

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC-eqKjOMYNw-FMabknw6Bnxf1fjo-EW2Y'}&libraries=places,geometry,drawing`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Maps API loaded globally');
      window.dispatchEvent(new CustomEvent('google-maps-loaded'));
    };

    script.onerror = (error) => {
      console.error('❌ Google Maps API failed to load globally:', error);
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
    google?: any;
  }
} 