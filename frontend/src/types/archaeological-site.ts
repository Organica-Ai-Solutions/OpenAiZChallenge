// Comprehensive Archaeological Site Type
export interface ArchaeologicalSite {
    // Basic Identification
    name: string
    coordinates: [number, number]
    region: string
    
    // Temporal Context
    estimatedPeriod: {
      start: number
      end: number
    }
    
    // Site Characteristics
    type: 'Settlement' | 'Ceremonial' | 'Agricultural' | 'Geoglyph' | 'Transportation' | 'Other'
    
    // Confidence and Research Metrics
    confidenceScore: number
    researchPriority: 'Low' | 'Medium' | 'High' | 'Critical'
    
    // Geographical Context
    environmentalContext: {
      vegetation: string
      elevation: number
      waterProximity: string
      terrainComplexity: string
    }
    
    // Detailed Features
    features: {
      type: string
      description: string
      dimensions?: {
        length?: number
        width?: number
        height?: number
      }
      confidence: number
    }[]
    
    // Research and Discovery
    dataSources: {
      satellite?: string
      lidar?: string
      historical?: string
    }
    
    // Academic References
    references: {
      author: string
      year: number
      title: string
      journal?: string
      doi?: string
    }[]
    
    // AI-Powered Insights
    aiInsights?: {
      culturalSignificance: string
      preservationStatus: string
      potentialResearchQuestions: string[]
    }
    
    // Recommendations
    recommendations: string[]
  }
  
  // Sample Archaeological Sites from Research Sources
  export const AmazonArchaeologicalSites: ArchaeologicalSite[] = [
    {
      name: "Kuhikugu Settlement",
      coordinates: [-12.2551, -53.2134],
      region: "Upper Xingu River Basin",
      estimatedPeriod: { start: 800, end: 1200 },
      type: "Settlement",
      confidenceScore: 95,
      researchPriority: "High",
      environmentalContext: {
        vegetation: "Dense Tropical Rainforest",
        elevation: 250,
        waterProximity: "Riverside Settlement",
        terrainComplexity: "Medium"
      },
      features: [
        {
          type: "Geometric Pattern",
          description: "Rectangular earthworks with complex spatial organization",
          dimensions: {
            length: 200,
            width: 150
          },
          confidence: 87
        }
      ],
      dataSources: {
        satellite: "Landsat-8 Scene ID: LC08_L1TP_231062",
        lidar: "Amazon LIDAR Project Tile: ALP-2023-BR-42"
      },
      references: [
        {
          author: "Denise Maria Cavalcante Gomes",
          year: 2025,
          title: "Urban Archaeology in the Lower Amazon",
          journal: "Journal of Field Archaeology"
        }
      ],
      aiInsights: {
        culturalSignificance: "Exceptional example of pre-Columbian urban planning",
        preservationStatus: "Moderate risk from environmental changes",
        potentialResearchQuestions: [
          "How did social organization influence settlement design?",
          "What were the economic activities of this community?"
        ]
      },
      recommendations: [
        "Conduct high-resolution LIDAR mapping",
        "Engage local indigenous communities for contextual knowledge",
        "Perform non-invasive archaeological surveys"
      ]
    },
    // More sites can be added here following the same structure
  ]
  
  // Utility function to find sites by region or type
  export function findArchaeologicalSites(
    criteria: Partial<{
      region: string, 
      type: ArchaeologicalSite['type'], 
      minConfidence: number
    }>
  ): ArchaeologicalSite[] {
    return AmazonArchaeologicalSites.filter(site => 
      (!criteria.region || site.region === criteria.region) &&
      (!criteria.type || site.type === criteria.type) &&
      (!criteria.minConfidence || site.confidenceScore >= criteria.minConfidence)
    )
  } 