"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { MapPin, Satellite, Database, Globe, Navigation, AlertCircle, Settings } from "lucide-react"
import type { SiteData } from "@/types/site-data"

interface PigeonMapViewerProps {
  sites: SiteData[]
  onSiteSelect?: (site: SiteData) => void
  selectedSite?: SiteData | null
  className?: string
  initialCoordinates?: [number, number]
  initialZoom?: number
  onCoordinateSelect?: (coords: string) => void
}

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
const GOOGLE_MAPS_LOADED = typeof window !== 'undefined' && window.google && window.google.maps

export function PigeonMapViewer({
  sites,
  onSiteSelect,
  selectedSite,
  className,
  initialCoordinates = [-3.4653, -62.2159],
  initialZoom = 5,
  onCoordinateSelect,
}: PigeonMapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const [center, setCenter] = useState<[number, number]>(initialCoordinates)
  const [zoom, setZoom] = useState(initialZoom)
  const [backendSites, setBackendSites] = useState<any[]>([])
  const [backendStatus, setBackendStatus] = useState<"online" | "offline" | "checking">("checking")
  const [activeView, setActiveView] = useState<"google" | "satellite" | "terrain" | "simple">("google")
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Predefined archaeological locations
  const predefinedLocations = [
    { name: "Central Amazon", coords: "-3.4653, -62.2159", type: "demo" as const, description: "Primary rainforest research area" },
    { name: "Xingu River (Kuhikugu)", coords: "-12.2551, -53.2134", type: "demo" as const, description: "Ancient settlements complex" },
    { name: "Geoglyphs of Acre", coords: "-9.8282, -67.9452", type: "demo" as const, description: "Geometric earthworks in western Amazon" },
    { name: "Llanos de Moxos", coords: "-14.0000, -65.5000", type: "demo" as const, description: "Pre-Columbian hydraulic culture" },
    { name: "Nazca Lines", coords: "-14.7390, -75.1300", type: "demo" as const, description: "Famous geoglyphs in southern Peru" },
    { name: "Caral Ancient City", coords: "-10.8933, -77.5200", type: "demo" as const, description: "Oldest city in the Americas" },
  ]

  // Combine backend sites with predefined locations
  const allLocations = [
    ...backendSites.map(site => ({
      name: site.name || `Site ${site.site_id || site.id}`,
      coords: site.coordinates || `${site.latitude || site.lat}, ${site.longitude || site.lon}`,
      type: "backend" as const,
      confidence: site.confidence,
      description: site.description || site.cultural_significance
    })),
    ...predefinedLocations
  ]

  const handleLocationSelect = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()))
    setCenter([lat, lng])
    setZoom(8)
    if (onCoordinateSelect) {
      onCoordinateSelect(coords)
    }
  }

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        console.log('✅ Google Maps already loaded')
        setGoogleMapsLoaded(true)
        setMapError(null)
        return
      }

      if (!GOOGLE_MAPS_API_KEY) {
        setMapError("Google Maps API key not configured - using fallback view")
        setActiveView("simple")
        return
      }

      try {
        // Set up global error handlers BEFORE loading any scripts
        window.gm_authFailure = () => {
          console.error('❌ Google Maps Authentication Error - API key issue')
          setMapError("Google Maps API key authentication failed")
          setActiveView("simple")
        }

        // Enhanced error detection for various Google Maps errors
        const originalConsoleError = console.error
        const checkForGoogleMapsErrors = (...args) => {
          const message = args.join(' ').toLowerCase()
          if (message.includes('billingnotenabledmaperror') || 
              message.includes('billing not enabled') ||
              message.includes('billing') ||
              message.includes('quota') ||
              message.includes('api key') ||
              message.includes('apinotactivatedmaperror') ||
              message.includes('requestdeniedmaperror')) {
            console.log('🗺️ Google Maps API issue detected - switching to fallback view')
            setMapError("Google Maps API issue - using fallback view")
            setActiveView("simple")
          }
          // Call original console.error
          originalConsoleError.apply(console, args)
        }

        // Set up enhanced console error detection
        console.error = checkForGoogleMapsErrors

        // Also listen for global error events
        const handleGlobalError = (event) => {
          const message = event.message?.toLowerCase() || ''
          if (message.includes('google') && (message.includes('billing') || message.includes('quota'))) {
            setMapError("Google Maps billing issue detected")
            setActiveView("simple")
          }
        }
        window.addEventListener('error', handleGlobalError)

        // Check if script already exists
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
        if (existingScript) {
          // Wait for existing script to load
          return new Promise((resolve) => {
            const checkLoaded = () => {
              if (window.google && window.google.maps) {
                setGoogleMapsLoaded(true)
                setMapError(null)
                console.error = originalConsoleError // Restore original console.error
                window.removeEventListener('error', handleGlobalError)
                resolve()
              } else {
                setTimeout(checkLoaded, 100)
              }
            }
            checkLoaded()
          })
        }

        // Create a promise to handle the callback
        await new Promise((resolve, reject) => {
          // Set up global callback before loading script
          window.initGoogleMaps = () => {
            console.log('✅ Google Maps API loaded successfully via callback')
            setGoogleMapsLoaded(true)
            setMapError(null)
            console.error = originalConsoleError // Restore original console.error
            window.removeEventListener('error', handleGlobalError)
            resolve()
          }

          // Create and load the script
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&loading=async&callback=initGoogleMaps`
          script.async = true
          script.defer = true
          
          script.onerror = () => {
            console.error('❌ Failed to load Google Maps API - possible billing or API key issue')
            setMapError("Failed to load Google Maps - check API key and billing")
            setActiveView("simple")
            console.error = originalConsoleError // Restore original console.error
            window.removeEventListener('error', handleGlobalError)
            reject(new Error('Script loading failed'))
          }
          
          document.head.appendChild(script)
          
          // Add timeout for script loading
          setTimeout(() => {
            if (!window.google || !window.google.maps) {
              console.error('❌ Google Maps API loading timeout')
              setMapError("Google Maps loading timeout - using fallback view")
              setActiveView("simple")
              console.error = originalConsoleError // Restore original console.error
              window.removeEventListener('error', handleGlobalError)
              reject(new Error('Script loading timeout'))
            }
          }, 10000) // 10 second timeout
        })

      } catch (error) {
        console.error('❌ Google Maps initialization failed:', error)
        setMapError("Google Maps initialization failed")
        setActiveView("simple")
      }
    }

    if (activeView === "google") {
      loadGoogleMaps()
    }
  }, [activeView])

  // Initialize Google Map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || activeView !== "google" || googleMapRef.current) {
      return
    }

    try {
      console.log('🗺️ Initializing Google Map...')

      // Enhanced map configuration with Map ID for AdvancedMarkers
      const mapConfig = {
        center: { lat: center[0], lng: center[1] },
        zoom: zoom + 5,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        mapId: 'archaeological-sites-map', // Required for AdvancedMarkers
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID,
            google.maps.MapTypeId.TERRAIN
          ]
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        scaleControl: true,
        rotateControl: true,
        restriction: {
          latLngBounds: {
            north: 15,
            south: -25,
            west: -85,
            east: -30
          },
          strictBounds: false
        }
      }

      const map = new google.maps.Map(mapRef.current, mapConfig)
      googleMapRef.current = map
      console.log('✅ Google Map initialized successfully')

      // Add click listener for coordinate selection
      map.addListener('click', (event) => {
        if (event.latLng) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          handleLocationSelect(coords)
        }
      })

      // Add markers after map is ready
      setTimeout(() => {
        console.log(`📌 Adding ${allLocations.length} markers to map`)
        allLocations.forEach((location, index) => {
          const [lat, lng] = location.coords.split(',').map(coord => parseFloat(coord.trim()))
          if (!isNaN(lat) && !isNaN(lng)) {
            addMarkerToMap(map, location, lat, lng, index)
          }
        })
      }, 1000)

    } catch (error) {
      console.error('❌ Google Maps initialization error:', error)
      setMapError(`Failed to initialize Google Map: ${error.message}`)
      setActiveView("simple")
    }
  }, [googleMapsLoaded, activeView, allLocations, center, zoom])

  // Separate function to add markers
  const addMarkerToMap = (map, location, lat, lng, index) => {
    try {
      // Create marker - prefer AdvancedMarkerElement if available and mapId is set
      let marker
      const position = { lat, lng }
      
      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement && map.getMapId()) {
        // Create custom pin element for AdvancedMarkerElement
        const pinElement = document.createElement('div')
        pinElement.innerHTML = location.type === "backend" 
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
               <circle cx="12" cy="10" r="4" fill="#059669"/>
               <circle cx="12" cy="10" r="2" fill="white"/>
             </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
               <circle cx="12" cy="10" r="3" fill="#3b82f6"/>
             </svg>`
        
        pinElement.style.cursor = 'pointer'
        pinElement.style.transform = 'translate(-50%, -100%)'

        marker = new google.maps.marker.AdvancedMarkerElement({
          position,
          map,
          title: location.name,
          content: pinElement
        })

        // Use gmp-click for AdvancedMarkerElement
        marker.addListener('gmp-click', () => {
          handleMarkerClick(map, marker, location)
        })

        // Add hover effects
        pinElement.addEventListener('mouseover', () => {
          pinElement.style.transform = 'translate(-50%, -100%) scale(1.1)'
          pinElement.style.transition = 'transform 0.2s ease'
        })
        pinElement.addEventListener('mouseout', () => {
          pinElement.style.transform = 'translate(-50%, -100%) scale(1)'
        })

      } else {
        // Fallback to regular Marker
        const markerIcon = {
          url: location.type === "backend" 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="4" fill="#059669"/>
                <circle cx="12" cy="10" r="2" fill="white"/>
              </svg>`)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3" fill="#3b82f6"/>
              </svg>`),
          scaledSize: new google.maps.Size(location.type === "backend" ? 32 : 28, location.type === "backend" ? 32 : 28),
          anchor: new google.maps.Point(16, 32)
        }

        marker = new google.maps.Marker({
          position,
          map,
          title: location.name,
          icon: markerIcon,
          animation: google.maps.Animation.DROP,
          zIndex: location.type === "backend" ? 1000 : 100
        })

        // Use click for regular Marker
        marker.addListener('click', () => {
          handleMarkerClick(map, marker, location)
        })

        // Add hover effect for regular Marker
        marker.addListener('mouseover', () => {
          marker.setAnimation(google.maps.Animation.BOUNCE)
          setTimeout(() => marker.setAnimation(null), 1000)
        })
      }

    } catch (error) {
      console.warn(`Failed to add marker for ${location.name}:`, error)
    }
  }

  // Handle marker click events
  const handleMarkerClick = (map, marker, location) => {
    // Close any existing info window
    if (window.currentInfoWindow) {
      window.currentInfoWindow.close()
    }

    // Create enhanced info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${location.name}</h3>
          <div style="margin: 4px 0; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 4px 6px; border-radius: 4px;">
            📍 ${location.coords}
          </div>
          ${location.confidence ? `
            <div style="margin: 6px 0; font-size: 13px; color: #374151;">
              <strong>Confidence:</strong> <span style="color: ${location.confidence > 0.8 ? '#059669' : location.confidence > 0.6 ? '#d97706' : '#dc2626'}">${Math.round(location.confidence * 100)}%</span>
            </div>
          ` : ''}
          ${location.description ? `
            <p style="margin: 6px 0 8px 0; font-size: 13px; color: #374151; line-height: 1.4;">${location.description}</p>
          ` : ''}
          <div style="margin-top: 10px; text-align: center;">
            <span style="background: ${location.type === 'backend' ? '#059669' : '#3b82f6'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">
              ${location.type === 'backend' ? '🎯 REAL ARCHAEOLOGICAL SITE' : '📍 REFERENCE LOCATION'}
            </span>
          </div>
          <div style="margin-top: 8px; text-align: center;">
            <button onclick="window.analyzeLocation && window.analyzeLocation('${location.coords}')" 
                    style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">
              🔍 Analyze This Location
            </button>
          </div>
        </div>
      `
    })

    infoWindow.open(map, marker)
    window.currentInfoWindow = infoWindow
    handleLocationSelect(location.coords)

    // Make analyze function globally available
    window.analyzeLocation = (coords) => {
      handleLocationSelect(coords)
      if (onCoordinateSelect) {
        onCoordinateSelect(coords)
      }
    }
  }

  // Update map center when coordinates change
  useEffect(() => {
    if (googleMapRef.current && activeView === "google") {
      googleMapRef.current.setCenter({ lat: center[0], lng: center[1] })
      googleMapRef.current.setZoom(zoom + 5)
    }
  }, [center, zoom, activeView])

  // Fetch real archaeological sites from backend
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const healthResponse = await fetch("http://localhost:8000/system/health")
        if (healthResponse.ok) {
          setBackendStatus("online")
          
          try {
            const sitesResponse = await fetch("http://localhost:8000/research/sites")
            if (sitesResponse.ok) {
              const sitesData = await sitesResponse.json()
              setBackendSites(sitesData)
              console.log("Loaded real archaeological sites:", sitesData)
            }
          } catch (error) {
            console.log("Research sites endpoint not available")
          }
        } else {
          setBackendStatus("offline")
        }
      } catch (error) {
        setBackendStatus("offline")
        console.log("Backend is offline, using predefined locations")
      }
    }

    fetchBackendData()
  }, [])

  // Generate ASCII-style map (fallback)
  const generateMapGrid = () => {
    const gridSize = 15
    const grid = []
    
    for (let i = 0; i < gridSize; i++) {
      const row = []
      for (let j = 0; j < gridSize; j++) {
        const isWater = (i + j) % 7 === 0
        const isMountain = (i * j) % 11 === 0
        const isForest = (i + j) % 5 === 0 && !isWater && !isMountain
        
        let cell = '.'
        if (isWater) cell = '~'
        else if (isMountain) cell = '^'
        else if (isForest) cell = '♦'
        
        row.push(cell)
      }
      grid.push(row)
    }
    
    allLocations.forEach((location, index) => {
      if (index < 6) {
        const row = Math.floor((index * 3 + 2) % gridSize)
        const col = Math.floor((index * 4 + 3) % gridSize)
        if (grid[row] && grid[row][col]) {
          grid[row][col] = location.type === "backend" ? '●' : '○'
        }
      }
    })
    
    return grid
  }

  const mapGrid = generateMapGrid()

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Backend Status & Map Controls */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            backendStatus === "online" ? "bg-green-500" : 
            backendStatus === "offline" ? "bg-red-500" : "bg-yellow-500 animate-pulse"
          }`} />
          <span className="text-sm font-medium">
            Backend: {backendStatus === "online" ? "Connected" : backendStatus === "offline" ? "Offline" : "Checking..."}
          </span>
          {mapError && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{mapError}</span>
            </div>
          )}
          {GOOGLE_MAPS_API_KEY && (
            <div className="flex items-center gap-1 text-green-600">
              <Globe className="w-3 h-3" />
              <span className="text-xs">Google Maps Ready</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>{backendSites.length} real sites</span>
          </div>
          <div className="flex items-center gap-1">
            <Satellite className="w-3 h-3" />
            <span>{predefinedLocations.length} reference sites</span>
          </div>
          {activeView === "google" && googleMapsLoaded && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Satellite Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Map View Selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setActiveView("google")}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md border transition-colors ${
            activeView === "google" 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-muted border-border hover:bg-muted/80"
          }`}
          disabled={!GOOGLE_MAPS_API_KEY}
        >
          <Globe className="w-4 h-4" />
          Google Maps
          {!GOOGLE_MAPS_API_KEY && <span className="text-xs ml-1">(API key needed)</span>}
        </button>
        <button
          onClick={() => setActiveView("simple")}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md border transition-colors ${
            activeView === "simple" 
              ? "bg-primary text-primary-foreground border-primary" 
              : "bg-muted border-border hover:bg-muted/80"
          }`}
        >
          <Navigation className="w-4 h-4" />
          Grid View
        </button>
        <div className="text-xs text-muted-foreground flex items-center ml-auto">
          <Settings className="w-3 h-3 mr-1" />
          {activeView === "google" ? "Satellite imagery with interactive features" : "Simple coordinate visualization"}
        </div>
      </div>

      {/* Map Display */}
      <div className="w-full h-[500px] rounded-lg overflow-hidden border bg-gray-100">
        {activeView === "google" ? (
          <div className="h-full w-full relative">
            {!googleMapsLoaded && GOOGLE_MAPS_API_KEY && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center">
                  <Globe className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Loading Google Maps...</p>
                  <p className="text-xs text-muted-foreground mt-1">Initializing satellite imagery</p>
                </div>
              </div>
            )}
            {!GOOGLE_MAPS_API_KEY && (
              <div className="absolute inset-0 flex items-center justify-center bg-orange-50 z-10">
                <div className="text-center p-4">
                  <Globe className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                  <p className="text-sm font-medium text-orange-900">Google Maps API Key Required</p>
                  <p className="text-xs text-orange-700 mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to environment</p>
                  <button
                    onClick={() => setActiveView("simple")}
                    className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                  >
                    Use Grid View
                  </button>
                </div>
              </div>
            )}
            <div ref={mapRef} className="h-full w-full" style={{ minHeight: '500px' }} />
            {googleMapsLoaded && googleMapRef.current && (
              <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                🗺️ Google Maps Active • Click anywhere to analyze
              </div>
            )}
          </div>
        ) : (
          // Fallback Grid View
          <div className="p-4 h-full flex flex-col bg-slate-50">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">Archaeological Site Map</h3>
              <p className="text-sm text-muted-foreground">
                Center: {center[0].toFixed(4)}, {center[1].toFixed(4)} | Zoom: {zoom}x
              </p>
              {mapError && (
                <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded">
                  {mapError}
                </p>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="font-mono text-sm leading-tight bg-white p-6 rounded-lg border shadow-sm">
                {mapGrid.map((row, i) => (
                  <div key={i} className="flex">
                    {row.map((cell, j) => (
                      <span 
                        key={`${i}-${j}`} 
                        className={`w-5 h-5 flex items-center justify-center ${
                          cell === '●' ? 'text-green-600 font-bold text-lg' :
                          cell === '○' ? 'text-blue-600 font-bold text-lg' :
                          cell === '~' ? 'text-blue-400' :
                          cell === '^' ? 'text-gray-600' :
                          cell === '♦' ? 'text-green-500' :
                          'text-muted-foreground'
                        }`}
                      >
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center text-xs text-muted-foreground bg-white/80 p-2 rounded">
              <strong>Legend:</strong> ● Real Sites | ○ Demo Sites | ~ Water | ^ Mountains | ♦ Forest | . Land
            </div>
          </div>
        )}
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allLocations.map((location, index) => {
          // Create a more unique key based on location content
          const locationKey = location.type === "backend" 
            ? `backend_${location.name.replace(/\s+/g, '_').toLowerCase()}_${location.coords}` 
            : `predefined_${location.name.replace(/\s+/g, '_').toLowerCase()}_${index}`;
          
          return (
            <button
              key={locationKey}
              onClick={() => handleLocationSelect(location.coords)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group text-left ${
                location.type === "backend" 
                  ? "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900" 
                  : "bg-muted/50 border-border hover:bg-muted"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                location.type === "backend"
                  ? "bg-green-500/20 group-hover:bg-green-500/30"
                  : "bg-blue-500/20 group-hover:bg-blue-500/30"
              }`}>
                {location.type === "backend" ? (
                  <Database className="w-4 h-4 text-green-600" />
                ) : (
                  <MapPin className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">
                  {location.name}
                  {location.type === "backend" && (
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded dark:bg-green-800 dark:text-green-200">
                      REAL
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">{location.coords}</div>
                {location.type === "backend" && location.confidence && (
                  <div className="text-xs text-muted-foreground">
                    Confidence: {Math.round(location.confidence * 100)}%
                  </div>
                )}
                {location.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {location.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Enhanced Analysis Section */}
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {activeView === "google" 
            ? "🗺️ Click anywhere on the map or select a location below for archaeological analysis"
            : "📍 Click any location to analyze coordinates"
          } • 
          {backendStatus === "online" ? " Backend connected for real analysis" : " Demo mode active"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {activeView === "google" 
            ? "Satellite imagery provides context for archaeological site discovery and analysis"
            : "Add Google Maps API key for enhanced satellite visualization"
          }
        </p>
      </div>
    </div>
  )
}

export default PigeonMapViewer
