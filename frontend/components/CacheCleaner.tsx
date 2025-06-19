'use client';

import { useEffect } from 'react';
import { clearAllCaches, clearMapboxCache } from '../cache-cleaner';

/**
 * CacheCleaner component
 * 
 * This component clears browser caches on application startup to prevent cache-related issues
 * It runs once when the application loads and clears:
 * - CSS cache
 * - Mapbox cache
 * - Application cache
 */
export default function CacheCleaner() {
  useEffect(() => {
    // Run cache clearing on component mount
    const runCacheCleaning = async () => {
      try {
        await clearAllCaches();
        await clearMapboxCache();
      } catch (error) {
        console.error('Error in cache cleaning:', error);
      }
    };
    
    runCacheCleaning();
  }, []);

  // This component doesn't render anything
  return null;
} 