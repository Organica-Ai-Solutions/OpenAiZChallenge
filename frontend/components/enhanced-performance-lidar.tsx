import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Deck, ScatterplotLayer, ColumnLayer, HexagonLayer, PointCloudLayer } from '@deck.gl/core'
import { DataFilterExtension } from '@deck.gl/extensions'

interface PerformanceLidarProps {
  coordinates: { lat: number; lng: number }
  lidarData: any[]
  onPointHover?: (info: any) => void
  maxPoints?: number
  enableGPUAggregation?: boolean
  enableBinaryData?: boolean
}

export function EnhancedPerformanceLidar({
  coordinates,
  lidarData,
  onPointHover,
  maxPoints = 1000000,
  enableGPUAggregation = true,
  enableBinaryData = true
}: PerformanceLidarProps) {
  const deckRef = useRef<any>(null)
  const [deck, setDeck] = useState<any>(null)
  const [processedData, setProcessedData] = useState<any>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pointsRendered: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  // 🚀 BINARY DATA PROCESSING FOR MAXIMUM PERFORMANCE
  const processBinaryData = useCallback((rawData: any[]) => {
    if (!enableBinaryData || !rawData.length) return rawData

    console.log('🔥 Processing binary data for GPU optimization...')
    const startTime = performance.now()

    // Pre-allocate typed arrays for GPU efficiency
    const length = Math.min(rawData.length, maxPoints)
    const positions = new Float32Array(length * 3) // x, y, z
    const colors = new Uint8Array(length * 4) // r, g, b, a
    const sizes = new Float32Array(length) // point sizes
    const intensities = new Float32Array(length) // LIDAR intensities

    // Process data into binary format
    for (let i = 0; i < length; i++) {
      const point = rawData[i]
      const idx3 = i * 3
      const idx4 = i * 4

      // Positions (Web Mercator coordinates)
      positions[idx3] = point.lng || point.coordinates?.[0] || 0
      positions[idx3 + 1] = point.lat || point.coordinates?.[1] || 0
      positions[idx3 + 2] = (point.elevation || 0) * 2 // Elevation exaggeration

      // Colors based on elevation and archaeological significance
      const normalizedElev = Math.min(1, Math.max(0, (point.elevation - 100) / 100))
      const significance = point.archaeological_significance || 0.5

      if (significance > 0.8) {
        // High archaeological significance - Gold
        colors[idx4] = 255
        colors[idx4 + 1] = 215
        colors[idx4 + 2] = 0
        colors[idx4 + 3] = 255
      } else if (significance > 0.6) {
        // Medium significance - Orange
        colors[idx4] = 255
        colors[idx4 + 1] = 165
        colors[idx4 + 2] = 0
        colors[idx4 + 3] = 200
      } else {
        // Elevation-based coloring
        colors[idx4] = Math.round(100 + normalizedElev * 155)
        colors[idx4 + 1] = Math.round(150 + normalizedElev * 105)
        colors[idx4 + 2] = Math.round(200 + normalizedElev * 55)
        colors[idx4 + 3] = Math.round(180 + normalizedElev * 75)
      }

      // Dynamic point sizes
      sizes[i] = 2 + normalizedElev * 4 + significance * 3

      // LIDAR intensities
      intensities[i] = point.intensity || 200
    }

    const processTime = performance.now() - startTime
    console.log(`✅ Binary processing complete: ${length} points in ${processTime.toFixed(2)}ms`)

    return {
      length,
      attributes: {
        getPosition: { value: positions, size: 3 },
        getFillColor: { value: colors, size: 4 },
        getRadius: { value: sizes, size: 1 },
        getIntensity: { value: intensities, size: 1 }
      },
      originalData: rawData.slice(0, length) // Keep for picking
    }
  }, [enableBinaryData, maxPoints])

  // 🎯 HIGH-PERFORMANCE LAYER CREATION
  const createOptimizedLayers = useCallback((data: any) => {
    if (!data) return []

    const layers = []

    // 1. Main Point Cloud Layer (Binary optimized)
    if (enableBinaryData && data.attributes) {
      layers.push(
        new ScatterplotLayer({
          id: 'optimized-point-cloud',
          data: { length: data.length, attributes: data.attributes },
          pickable: true,
          opacity: 0.8,
          stroked: false,
          filled: true,
          radiusMinPixels: 1,
          radiusMaxPixels: 20,
          
          // Binary data accessors
          getPosition: data.attributes.getPosition,
          getFillColor: data.attributes.getFillColor,
          getRadius: data.attributes.getRadius,
          
          // Performance optimizations
          extensions: [new DataFilterExtension({ filterSize: 1 })],
          filterRange: [0, 1],
          getFilterValue: (d: any, { index }: any) => data.attributes.getIntensity.value[index] / 255,
          
          updateTriggers: {
            getFilterValue: [data.attributes.getIntensity]
          },
          
          onHover: onPointHover
        })
      )
    } else {
      // Fallback to regular data format
      layers.push(
        new ScatterplotLayer({
          id: 'standard-point-cloud',
          data: Array.isArray(data) ? data : data.originalData,
          pickable: true,
          opacity: 0.8,
          stroked: false,
          filled: true,
          radiusScale: 2,
          radiusMinPixels: 1,
          radiusMaxPixels: 15,
          
          getPosition: (d: any) => [
            d.lng || d.coordinates?.[0] || 0,
            d.lat || d.coordinates?.[1] || 0,
            (d.elevation || 0) * 2
          ],
          getFillColor: (d: any) => {
            const significance = d.archaeological_significance || 0.5
            if (significance > 0.8) return [255, 215, 0, 255]
            if (significance > 0.6) return [255, 165, 0, 200]
            
            const normalizedElev = Math.min(1, Math.max(0, (d.elevation - 100) / 100))
            return [
              100 + normalizedElev * 155,
              150 + normalizedElev * 105,
              200 + normalizedElev * 55,
              180 + normalizedElev * 75
            ]
          },
          getRadius: (d: any) => {
            const normalizedElev = Math.min(1, Math.max(0, (d.elevation - 100) / 100))
            const significance = d.archaeological_significance || 0.5
            return 2 + normalizedElev * 4 + significance * 3
          },
          
          onHover: onPointHover
        })
      )
    }

    // 2. GPU-Accelerated Hexagon Aggregation Layer
    if (enableGPUAggregation) {
      const sourceData = Array.isArray(data) ? data : data.originalData
      
      layers.push(
        new HexagonLayer({
          id: 'gpu-hexagon-aggregation',
          data: sourceData,
          pickable: true,
          extruded: true,
          radius: 100,
          elevationScale: 4,
          elevationRange: [0, 1000],
          coverage: 0.88,
          
          // GPU aggregation enabled
          gpuAggregation: true,
          
          getPosition: (d: any) => [
            d.lng || d.coordinates?.[0] || 0,
            d.lat || d.coordinates?.[1] || 0
          ],
          getElevationWeight: (d: any) => d.archaeological_significance || 0.5,
          getColorWeight: (d: any) => (d.elevation || 100) - 100,
          
          colorRange: [
            [255, 255, 178, 100],
            [254, 204, 92, 150],
            [253, 141, 60, 200],
            [240, 59, 32, 250],
            [189, 0, 38, 255]
          ]
        })
      )
    }

    // 3. High-Significance Archaeological Sites
    const highSigPoints = (Array.isArray(data) ? data : data.originalData)
      .filter((d: any) => (d.archaeological_significance || 0) > 0.8)
      .slice(0, 500) // Limit for performance

    if (highSigPoints.length > 0) {
      layers.push(
        new ColumnLayer({
          id: 'archaeological-highlights',
          data: highSigPoints,
          pickable: true,
          extruded: true,
          diskResolution: 8,
          radius: 15,
          elevationScale: 5,
          
          getPosition: (d: any) => [
            d.lng || d.coordinates?.[0] || 0,
            d.lat || d.coordinates?.[1] || 0
          ],
          getElevation: (d: any) => (d.archaeological_significance || 0) * 50,
          getFillColor: [255, 215, 0, 200], // Gold
          getLineColor: [255, 140, 0, 255]
        })
      )
    }

    console.log(`🎯 Created ${layers.length} optimized layers`)
    return layers
  }, [enableBinaryData, enableGPUAggregation, onPointHover])

  // 🔄 PROCESS DATA AND UPDATE VISUALIZATION
  useEffect(() => {
    if (!lidarData?.length) return

    console.log(`🚀 Processing ${lidarData.length} LIDAR points for optimization...`)
    const startTime = performance.now()

    const processed = processBinaryData(lidarData)
    setProcessedData(processed)

    const processTime = performance.now() - startTime
    setPerformanceMetrics(prev => ({
      ...prev,
      pointsRendered: Array.isArray(processed) ? processed.length : processed.length,
      renderTime: processTime
    }))

  }, [lidarData, processBinaryData])

  // 🎨 INITIALIZE DECK.GL WITH PERFORMANCE OPTIMIZATIONS
  useEffect(() => {
    if (!deckRef.current || !processedData) return

    const deckInstance = new Deck({
      canvas: deckRef.current,
      initialViewState: {
        longitude: coordinates.lng,
        latitude: coordinates.lat,
        zoom: 15,
        pitch: 45,
        bearing: 0
      },
      controller: true,
      
      // Performance optimizations
      useDevicePixels: window.devicePixelRatio > 1 ? 2 : 1, // Optimize for retina displays
      
      // Memory management
      parameters: {
        clearColor: [0.1, 0.1, 0.1, 1],
        depthTest: true,
        depthFunc: 'lequal'
      },
      
      layers: createOptimizedLayers(processedData),
      
      // Performance monitoring
      onAfterRender: () => {
        const memUsage = (performance as any).memory?.usedJSHeapSize || 0
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memUsage / 1024 / 1024) // MB
        }))
      }
    })

    setDeck(deckInstance)

    return () => {
      deckInstance.finalize()
    }
  }, [processedData, coordinates, createOptimizedLayers])

  // 📊 PERFORMANCE MONITORING UI
  const PerformanceMonitor = () => (
    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300 border border-slate-600">
      <div className="text-cyan-400 font-semibold mb-2">⚡ Performance Metrics</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span>Points:</span>
          <span className="text-cyan-300">{performanceMetrics.pointsRendered.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Render Time:</span>
          <span className="text-green-300">{performanceMetrics.renderTime.toFixed(1)}ms</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Memory:</span>
          <span className="text-yellow-300">{performanceMetrics.memoryUsage}MB</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Binary Data:</span>
          <span className={enableBinaryData ? "text-green-300" : "text-red-300"}>
            {enableBinaryData ? "ON" : "OFF"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>GPU Agg:</span>
          <span className={enableGPUAggregation ? "text-green-300" : "text-red-300"}>
            {enableGPUAggregation ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={deckRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
      />
      <PerformanceMonitor />
      
      {/* Loading indicator */}
      {!processedData && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="text-center text-slate-300">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div>Processing LIDAR data...</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedPerformanceLidar 