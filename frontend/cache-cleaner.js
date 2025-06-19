/**
 * Cache Cleaner Utility
 * 
 * This script helps clear various browser caches that might cause issues with the application.
 * It can be imported and used in any component that needs cache clearing functionality.
 */

/**
 * Clear all browser caches
 * @returns {Promise<void>}
 */
export async function clearAllCaches() {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Clearing browser caches...');
  
  try {
    // Clear application cache
    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`Clearing cache: ${cacheName}`);
          return window.caches.delete(cacheName);
        })
      );
    }
    
    // Force reload CSS resources
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const newHref = href.includes('?') 
          ? `${href}&_cache=${Date.now()}`
          : `${href}?_cache=${Date.now()}`;
        link.setAttribute('href', newHref);
      }
    });
    
    // Clear localStorage items related to caching
    const localStorageKeysToRemove = [
      'mapbox-cache',
      'style-cache',
      'css-cache',
      'next-cache'
    ];
    
    localStorageKeysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Removing localStorage cache: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage items
    sessionStorage.clear();
    
    console.log('✅ Cache clearing complete');
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

/**
 * Clear Mapbox specific caches
 * @returns {Promise<void>}
 */
export async function clearMapboxCache() {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Clearing Mapbox caches...');
  
  try {
    // Clear application cache for mapbox resources
    if ('caches' in window) {
      const cacheNames = await window.caches.keys();
      const mapboxCaches = cacheNames.filter(name => 
        name.includes('mapbox') || name.includes('map') || name.includes('tiles')
      );
      
      await Promise.all(
        mapboxCaches.map(cacheName => {
          console.log(`Clearing Mapbox cache: ${cacheName}`);
          return window.caches.delete(cacheName);
        })
      );
    }
    
    // Clear localStorage items related to Mapbox
    const mapboxKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('mapbox') || key.includes('map') || key.includes('tiles'))) {
        mapboxKeys.push(key);
      }
    }
    
    mapboxKeys.forEach(key => {
      console.log(`Removing Mapbox localStorage cache: ${key}`);
      localStorage.removeItem(key);
    });
    
    console.log('✅ Mapbox cache clearing complete');
  } catch (error) {
    console.error('❌ Error clearing Mapbox caches:', error);
  }
}

// Export default for convenience
export default {
  clearAllCaches,
  clearMapboxCache
}; 