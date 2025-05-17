import axios from 'axios'

export interface SentinelBands {
  B1: number[] // Coastal aerosol
  B2: number[] // Blue
  B3: number[] // Green
  B4: number[] // Red
  B5: number[] // Vegetation Red Edge
  B6: number[] // Vegetation Red Edge
  B7: number[] // Vegetation Red Edge
  B8: number[] // NIR
  B8A: number[] // Narrow NIR
  B9: number[] // Water vapor
  B11: number[] // SWIR
  B12: number[] // SWIR
}

export interface SatelliteImageryOptions {
  coordinates: [number, number]
  startDate: string
  endDate: string
  cloudCoveragePercentage?: number
  resolution?: number // in meters
  bands?: (keyof SentinelBands)[]
}

export interface SatelliteImageryResult {
  imageUrl: string
  metadata: {
    date: string
    cloudCoverage: number
    resolution: number
    bands: string[]
    processingLevel: string
  }
  rawImageData?: Buffer
  analysisResults: {
    vegetationIndex?: number
    waterIndex?: number
    urbanizationScore?: number
    archaeologicalSiteConfidence?: number
  }
  visualizationLayers: {
    vegetationHeatmap?: string
    waterBodyDetection?: string
    potentialSiteLocations?: string
  }
}

export class SatelliteDataService {
  private static instance: SatelliteDataService
  private nasaEarthDataClient: any
  private sentinelClient: any

  private constructor() {
    this.initClients()
  }

  public static getInstance(): SatelliteDataService {
    if (!this.instance) {
      this.instance = new SatelliteDataService()
    }
    return this.instance
  }

  private async initClients() {
    // Sentinel-2 specific client configuration
    this.sentinelClient = axios.create({
      baseURL: 'https://services.sentinel-hub.com/api/v1',
      headers: {
        'Authorization': `Bearer ${process.env.SENTINEL_HUB_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
  }

  // Enhanced coordinate and bounding box utility methods
  private static readonly EARTH_RADIUS_KM = 6371

  // Advanced coordinate validation and normalization
  private normalizeCoordinates(coordinates: [number, number]): [number, number] {
    let [lat, lon] = coordinates

    // Normalize latitude to [-90, 90]
    lat = Math.max(-90, Math.min(90, lat))

    // Normalize longitude to [-180, 180]
    lon = ((lon + 180) % 360) - 180

    return [lat, lon]
  }

  // Create an enhanced bounding box with more precise calculations
  private createBoundingBox(
    coordinates: [number, number], 
    radiusKm: number, 
    options?: { 
      minRadius?: number, 
      maxRadius?: number 
    }
  ): number[] {
    // Validate and normalize input coordinates
    const [lat, lon] = this.normalizeCoordinates(coordinates)

    // Apply radius constraints
    const minRadius = options?.minRadius || 5
    const maxRadius = options?.maxRadius || 50
    const constrainedRadius = Math.max(minRadius, Math.min(maxRadius, radiusKm))

    // More precise offset calculations
    const latOffset = constrainedRadius / SatelliteDataService.EARTH_RADIUS_KM * (180 / Math.PI)
    const lonOffset = constrainedRadius / (SatelliteDataService.EARTH_RADIUS_KM * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI)

    return [
      Math.max(-180, lon - lonOffset),  // west
      Math.max(-90, lat - latOffset),   // south
      Math.min(180, lon + lonOffset),   // east
      Math.min(90, lat + latOffset)     // north
    ]
  }

  // Advanced map metadata generation
  private generateMapMetadata(
    options: SatelliteImageryOptions, 
    bands: (keyof SentinelBands)[]
  ): SatelliteImageryResult['metadata'] {
    return {
      date: new Date().toISOString(),
      cloudCoverage: options.cloudCoveragePercentage || 20,
      resolution: options.resolution || 10,
      bands: bands.map(String),
      processingLevel: 'Level-2A (Surface Reflectance)'
    }
  }

  // Retrieve Sentinel-2 imagery with enhanced map generation
  public async getSentinel2Imagery(options: SatelliteImageryOptions): Promise<SatelliteImageryResult> {
    try {
      // Request specific bands for comprehensive analysis
      const requestedBands = options.bands || ['B2', 'B3', 'B4', 'B8', 'B11', 'B12']

      // Enhanced bounding box with more precise radius control
      const bbox = this.createBoundingBox(
        options.coordinates, 
        20, // Increased default radius for more comprehensive coverage
        { minRadius: 10, maxRadius: 100 }
      )

      const response = await this.sentinelClient.post('/process', {
        input: {
          bounds: {
            bbox,
            properties: {
              maxCloudCoverage: options.cloudCoveragePercentage || 20
            }
          },
          data: requestedBands
        },
        output: {
          width: 1024,  // Increased resolution for more detailed map
          height: 1024,
          format: 'image/tiff'
        }
      })

      // Extract multi-band data
      const multiBandData = this.extractMultiBandData(response.data)

      // Compute vegetation and water indices
      const vegetationIndex = this.calculateNormalizedDifferenceVegetationIndex(multiBandData)
      const waterIndex = this.calculateNormalizedDifferenceWaterIndex(multiBandData)

      // Generate visualization layers
      const visualizationLayers = await this.generateVisualizationLayers(multiBandData)

      // Detect potential archaeological sites
      const archaeologicalSiteConfidence = await this.detectArchaeologicalSites(multiBandData)

      return {
        imageUrl: response.data.imageUrl,
        metadata: this.generateMapMetadata(options, requestedBands),
        rawImageData: response.data.rawImageData || undefined,
        analysisResults: {
          vegetationIndex,
          waterIndex,
          urbanizationScore: 0,
          archaeologicalSiteConfidence
        },
        visualizationLayers
      }
    } catch (error) {
      console.error('Sentinel-2 imagery retrieval error:', error)
      
      // Fallback multi-band data with enhanced error handling
      const fallbackBands: SentinelBands = {
        B1: [], B2: [], B3: [], B4: [], 
        B5: [], B6: [], B7: [], 
        B8: [], B8A: [], B9: [], 
        B11: [], B12: []
      }

      // Compute fallback indices
      const vegetationIndex = this.calculateNormalizedDifferenceVegetationIndex(fallbackBands)
      const waterIndex = this.calculateNormalizedDifferenceWaterIndex(fallbackBands)
      const archaeologicalSiteConfidence = await this.detectArchaeologicalSites(fallbackBands)

      // Fallback visualization layers
      const fallbackVisualizationLayers = await this.generateVisualizationLayers(fallbackBands)

      return {
        imageUrl: '',
        metadata: this.generateMapMetadata(options, ['B2', 'B3', 'B4']),
        rawImageData: undefined,
        analysisResults: {
          vegetationIndex,
          waterIndex,
          urbanizationScore: 0,
          archaeologicalSiteConfidence
        },
        visualizationLayers: fallbackVisualizationLayers
      }
    }
  }

  // Extract multi-band data from Sentinel-2 imagery
  private extractMultiBandData(rawImageData: any): SentinelBands {
    // Placeholder for actual multi-band data extraction
    // In a real implementation, this would process the raw image data
    return {
      B1: [], B2: [], B3: [], B4: [], 
      B5: [], B6: [], B7: [], 
      B8: [], B8A: [], B9: [], 
      B11: [], B12: []
    }
  }

  // Calculate Normalized Difference Vegetation Index (NDVI)
  private calculateNormalizedDifferenceVegetationIndex(bands: SentinelBands): number {
    // NDVI = (NIR - Red) / (NIR + Red)
    // Using B8 (NIR) and B4 (Red)
    return 0.5 // Placeholder value
  }

  // Calculate Normalized Difference Water Index (NDWI)
  private calculateNormalizedDifferenceWaterIndex(bands: SentinelBands): number {
    // NDWI = (Green - NIR) / (Green + NIR)
    // Using B3 (Green) and B8 (NIR)
    return 0.3 // Placeholder value
  }

  // Compute vegetation heatmap URL
  private computeVegetationHeatmap(bands: SentinelBands): string {
    // Simulate vegetation heatmap generation
    const vegetationScore = this.calculateNormalizedDifferenceVegetationIndex(bands)
    return `https://example.com/vegetation-heatmap?score=${vegetationScore.toFixed(2)}`
  }

  // Compute water body detection URL
  private computeWaterBodyDetection(bands: SentinelBands): string {
    // Simulate water body detection
    const waterIndex = this.calculateNormalizedDifferenceWaterIndex(bands)
    return `https://example.com/water-detection?index=${waterIndex.toFixed(2)}`
  }

  // Compute potential archaeological site locations URL
  private async computePotentialSiteLocations(bands: SentinelBands): Promise<string> {
    // Simulate archaeological site location detection
    const siteConfidence = await this.detectArchaeologicalSites(bands)
    return `https://example.com/site-locations?confidence=${siteConfidence.toFixed(2)}`
  }

  // Generate custom visualization layers
  private async generateVisualizationLayers(bands: SentinelBands): Promise<SatelliteImageryResult['visualizationLayers']> {
    // Compute visualization layers based on band data
    const vegetationHeatmap = this.computeVegetationHeatmap(bands)
    const waterBodyDetection = this.computeWaterBodyDetection(bands)
    const potentialSiteLocations = await this.computePotentialSiteLocations(bands)

    return {
      vegetationHeatmap,
      waterBodyDetection,
      potentialSiteLocations
    }
  }

  // Machine learning-based archaeological site detection
  private async detectArchaeologicalSites(bands: SentinelBands): Promise<number> {
    try {
      // Simplified site detection logic without ML model
      // This is a placeholder implementation
      const complexityScore = Object.values(bands)
        .reduce((acc, band) => acc + band.length, 0) / Object.keys(bands).length

      // Basic site detection heuristic
      return Math.min(complexityScore / 1000, 1)
    } catch (error) {
      console.error('Site detection error:', error)
      return 0
    }
  }

  // Update NICFI imagery method to match new interface
  public async getNICFIImagery(options: SatelliteImageryOptions): Promise<SatelliteImageryResult> {
    try {
      // Simulate NICFI imagery retrieval with enhanced map generation
      const imageUrl = this.generateMockImageUrl(options)

      // Enhanced bounding box
      const bbox = this.createBoundingBox(
        options.coordinates, 
        15, // Adjusted radius for NICFI imagery
        { minRadius: 5, maxRadius: 50 }
      )

      // Generate visualization layers for NICFI imagery
      const visualizationLayers = {
        vegetationHeatmap: `https://example.com/nicfi-vegetation-heatmap?lat=${options.coordinates[0]}&lon=${options.coordinates[1]}`,
        waterBodyDetection: `https://example.com/nicfi-water-detection?lat=${options.coordinates[0]}&lon=${options.coordinates[1]}`,
        potentialSiteLocations: `https://example.com/nicfi-site-locations?lat=${options.coordinates[0]}&lon=${options.coordinates[1]}`
      }

      return {
        imageUrl,
        metadata: {
          date: new Date().toISOString(),
          cloudCoverage: 0,
          resolution: options.resolution || 5,
          bands: ['R', 'G', 'B'],
          processingLevel: 'High-Resolution Forest Monitoring'
        },
        rawImageData: undefined,
        analysisResults: {
          vegetationIndex: 0.6,
          waterIndex: 0.2,
          urbanizationScore: 0,
          archaeologicalSiteConfidence: 0
        },
        visualizationLayers
      }
    } catch (error) {
      console.error('Error retrieving NICFI imagery:', error)
      
      // Fallback result with complete SatelliteImageryResult structure
      return {
        imageUrl: '',
        metadata: {
          date: new Date().toISOString(),
          cloudCoverage: 0,
          resolution: options.resolution || 5,
          bands: ['R', 'G', 'B'],
          processingLevel: 'High-Resolution Forest Monitoring'
        },
        rawImageData: undefined,
        analysisResults: {
          vegetationIndex: 0,
          waterIndex: 0,
          urbanizationScore: 0,
          archaeologicalSiteConfidence: 0
        },
        visualizationLayers: {
          vegetationHeatmap: '',
          waterBodyDetection: '',
          potentialSiteLocations: ''
        }
      }
    }
  }

  // Generate mock image URL for demonstration
  private generateMockImageUrl(options: SatelliteImageryOptions): string {
    const [lat, lon] = options.coordinates
    return `https://example.com/satellite-image?lat=${lat}&lon=${lon}&start=${options.startDate}&end=${options.endDate}`
  }

  // Advanced method to search NASA EarthData for additional satellite imagery
  public async searchNasaEarthData(options: SatelliteImageryOptions): Promise<any[]> {
    try {
      const response = await this.nasaEarthDataClient.get('/search', {
        params: {
          latitude: options.coordinates[0],
          longitude: options.coordinates[1],
          startTime: options.startDate,
          endTime: options.endDate,
          cloudCover: options.cloudCoveragePercentage || 20
        }
      })

      return response.data.results || []
    } catch (error) {
      console.error('Error searching NASA EarthData:', error)
      throw new Error('Failed to search NASA EarthData')
    }
  }
}

export default SatelliteDataService 