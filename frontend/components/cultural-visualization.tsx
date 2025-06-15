"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Globe, Clock, Users, Mountain, TreePine, Waves, MapPin, Calendar } from 'lucide-react'

interface CulturalData {
  region: string
  primaryCultures: string[]
  timeframes: Array<{
    period: string
    startYear: number
    endYear: number
    description: string
    significance: number
  }>
  landscapes: Array<{
    type: string
    description: string
    culturalUse: string
  }>
  traditions: Array<{
    name: string
    description: string
    continuity: 'active' | 'historical' | 'reconstructed'
  }>
  coordinates?: string
}

interface CulturalVisualizationProps {
  analysisData?: {
    coordinates?: string
    culturalReferences?: string[]
    confidence?: number
  }
  kanSettings?: {
    enabled: boolean
    culturalContext: boolean
    indigenousKnowledge: boolean
  }
  className?: string
}

export const CulturalVisualization: React.FC<CulturalVisualizationProps> = ({
  analysisData = {},
  kanSettings = { enabled: true, culturalContext: true, indigenousKnowledge: true },
  className = ""
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all')
  const [selectedLandscape, setSelectedLandscape] = useState<string>('overview')

  // Generate cultural data based on coordinates
  const generateCulturalData = (): CulturalData => {
    if (!analysisData.coordinates) {
      return {
        region: 'General Amazonian Region',
        primaryCultures: ['Indigenous Peoples'],
        timeframes: [],
        landscapes: [],
        traditions: [],
      }
    }

    const [lat, lon] = analysisData.coordinates.split(',').map(s => parseFloat(s.trim()))
    
    if (lat < -10 && lon > -55) {
      // Upper Xingu
      return {
        region: 'Upper Xingu Cultural Complex',
        primaryCultures: ['Kamayurá', 'Yawalapiti', 'Kuikuro', 'Kalapalo'],
        timeframes: [
          {
            period: 'Pre-Ceramic Period',
            startYear: -3000,
            endYear: -1000,
            description: 'Early hunter-gatherer occupations with incipient horticulture',
            significance: 0.6
          },
          {
            period: 'Ceramic Period',
            startYear: -1000,
            endYear: 1500,
            description: 'Development of complex village societies and ceramic traditions',
            significance: 0.8
          },
          {
            period: 'Historic Period',
            startYear: 1500,
            endYear: 1950,
            description: 'Contact period and cultural adaptations',
            significance: 0.7
          },
          {
            period: 'Contemporary Period',
            startYear: 1950,
            endYear: 2024,
            description: 'Modern indigenous movements and cultural revitalization',
            significance: 0.9
          }
        ],
        landscapes: [
          {
            type: 'Seasonally Flooded Plains',
            description: 'Extensive wetlands supporting diverse aquatic resources',
            culturalUse: 'Fishing, transportation, and seasonal camps'
          },
          {
            type: 'Forest Gardens',
            description: 'Managed forest areas with enhanced biodiversity',
            culturalUse: 'Agroforestry, medicine, and material culture'
          },
          {
            type: 'Sacred Groves',
            description: 'Protected forest areas with spiritual significance',
            culturalUse: 'Ceremonial activities and ancestral connections'
          }
        ],
        traditions: [
          {
            name: 'Kagutu Pottery Tradition',
            description: 'Elaborate ceramic vessels for food preparation and storage',
            continuity: 'active'
          },
          {
            name: 'Kwarup Ceremony',
            description: 'Inter-tribal mortuary ceremonies strengthening alliances',
            continuity: 'active'
          },
          {
            name: 'Fish Weir Construction',
            description: 'Collaborative construction of seasonal fishing structures',
            continuity: 'active'
          },
          {
            name: 'Terra Preta Management',
            description: 'Traditional soil enhancement techniques',
            continuity: 'reconstructed'
          }
        ],
        coordinates: analysisData.coordinates
      }
    } else if (lat < -15 && lon < -70) {
      // Andean region
      return {
        region: 'Andean Highland Cultural Zone',
        primaryCultures: ['Inca', 'Quechua', 'Aymara', 'Wari'],
        timeframes: [
          {
            period: 'Early Horizon',
            startYear: -900,
            endYear: -200,
            description: 'Chavín influence and early highland civilizations',
            significance: 0.7
          },
          {
            period: 'Intermediate Period',
            startYear: -200,
            endYear: 600,
            description: 'Regional development and Nazca-Moche cultures',
            significance: 0.8
          },
          {
            period: 'Wari Empire',
            startYear: 600,
            endYear: 1000,
            description: 'First Andean empire with administrative centers',
            significance: 0.85
          },
          {
            period: 'Inca Empire',
            startYear: 1200,
            endYear: 1532,
            description: 'Tawantinsuyu - largest pre-Columbian empire',
            significance: 0.95
          },
          {
            period: 'Colonial Period',
            startYear: 1532,
            endYear: 1825,
            description: 'Spanish colonial rule and cultural synthesis',
            significance: 0.8
          },
          {
            period: 'Modern Era',
            startYear: 1825,
            endYear: 2024,
            description: 'Indigenous rights movements and cultural preservation',
            significance: 0.85
          }
        ],
        landscapes: [
          {
            type: 'Agricultural Terraces',
            description: 'Extensive terraced fields on steep mountain slopes',
            culturalUse: 'Potato, quinoa, and maize cultivation'
          },
          {
            type: 'High Altitude Pastures',
            description: 'Puna grasslands for llama and alpaca herding',
            culturalUse: 'Pastoralism and fiber production'
          },
          {
            type: 'Sacred Mountains',
            description: 'Apu mountain spirits central to cosmology',
            culturalUse: 'Ritual offerings and pilgrimage routes'
          }
        ],
        traditions: [
          {
            name: 'Ayllu Social Organization',
            description: 'Kinship-based community structure with reciprocal obligations',
            continuity: 'active'
          },
          {
            name: 'Quipu Record Keeping',
            description: 'Knotted cord system for numerical and narrative records',
            continuity: 'reconstructed'
          },
          {
            name: 'Astronomical Observations',
            description: 'Agricultural calendar based on stellar observations',
            continuity: 'active'
          },
          {
            name: 'Khipu Weaving',
            description: 'Traditional textile production with symbolic patterns',
            continuity: 'active'
          }
        ],
        coordinates: analysisData.coordinates
      }
    } else {
      // Lower Amazon
      return {
        region: 'Lower Amazon Cultural Area',
        primaryCultures: ['Marajoara', 'Tapajós', 'Santarém', 'Caboclo'],
        timeframes: [
          {
            period: 'Formative Period',
            startYear: -2000,
            endYear: 400,
            description: 'Early ceramic traditions and mound construction',
            significance: 0.7
          },
          {
            period: 'Marajoara Culture',
            startYear: 400,
            endYear: 1300,
            description: 'Complex chiefdoms with elaborate burial mounds',
            significance: 0.9
          },
          {
            period: 'Tapajós Culture',
            startYear: 1000,
            endYear: 1600,
            description: 'Urban settlements and long-distance trade',
            significance: 0.85
          },
          {
            period: 'Colonial Contact',
            startYear: 1500,
            endYear: 1750,
            description: 'European contact and population collapse',
            significance: 0.6
          },
          {
            period: 'Caboclo Formation',
            startYear: 1750,
            endYear: 2024,
            description: 'Mixed indigenous-European riverine culture',
            significance: 0.8
          }
        ],
        landscapes: [
          {
            type: 'Várzea Floodplains',
            description: 'Fertile seasonal floodplains along major rivers',
            culturalUse: 'Intensive agriculture and fishing'
          },
          {
            type: 'Terra Firme Forest',
            description: 'Well-drained upland forests with diverse resources',
            culturalUse: 'Hunting, gathering, and forest management'
          },
          {
            type: 'River Channels',
            description: 'Major waterways serving as transportation corridors',
            culturalUse: 'Trade, communication, and seasonal camps'
          }
        ],
        traditions: [
          {
            name: 'Marajoara Ceramics',
            description: 'Sophisticated polychrome pottery with complex iconography',
            continuity: 'historical'
          },
          {
            name: 'Riverine Navigation',
            description: 'Seasonal navigation adapted to flood cycles',
            continuity: 'active'
          },
          {
            name: 'Forest Islands Management',
            description: 'Anthropogenic forest patches in savanna areas',
            continuity: 'reconstructed'
          },
          {
            name: 'Fish Poisoning Techniques',
            description: 'Communal fishing using plant-based fish poisons',
            continuity: 'active'
          }
        ],
        coordinates: analysisData.coordinates
      }
    }
  }

  const culturalData = generateCulturalData()

  const getLandscapeIcon = (type: string) => {
    if (type.includes('Forest') || type.includes('Garden')) return <TreePine className="w-4 h-4 text-green-400" />
    if (type.includes('Mountain') || type.includes('Terrace')) return <Mountain className="w-4 h-4 text-gray-400" />
    if (type.includes('River') || type.includes('Flood') || type.includes('Wetland')) return <Waves className="w-4 h-4 text-blue-400" />
    return <Globe className="w-4 h-4 text-emerald-400" />
  }

  const getContinuityColor = (continuity: string) => {
    switch (continuity) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'historical': return 'text-amber-400 bg-amber-500/20'
      case 'reconstructed': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  if (!kanSettings.enabled || !kanSettings.culturalContext) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Cultural Context Disabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-emerald-500/5 border-emerald-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-emerald-300">
          <Globe className="w-5 h-5" />
          Cultural Context Visualization
          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
            <Users className="w-3 h-3 mr-1" />
            {culturalData.primaryCultures.length} cultures
          </Badge>
        </CardTitle>
        <div className="text-sm text-slate-400">
          {culturalData.region} • Enhanced with indigenous knowledge
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Region Overview */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h4 className="font-medium text-emerald-300">Regional Context</h4>
          </div>
          <p className="text-slate-300 text-sm mb-3">{culturalData.region}</p>
          <div className="flex flex-wrap gap-2">
            {culturalData.primaryCultures.map(culture => (
              <Badge key={culture} className="bg-emerald-500/20 text-emerald-300 text-xs">
                {culture}
              </Badge>
            ))}
          </div>
        </div>

        {/* Temporal Framework */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Temporal Framework
          </h4>
          <div className="space-y-3">
            {culturalData.timeframes.map((timeframe, index) => (
              <div key={index} className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white text-sm">{timeframe.period}</h5>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {timeframe.startYear > 0 ? timeframe.startYear : Math.abs(timeframe.startYear)} 
                      {timeframe.startYear > 0 ? ' CE' : ' BCE'} - 
                      {timeframe.endYear > 0 ? timeframe.endYear : Math.abs(timeframe.endYear)}
                      {timeframe.endYear > 0 ? ' CE' : ' BCE'}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-300 text-xs mb-2">{timeframe.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Cultural Significance:</span>
                  <Progress value={timeframe.significance * 100} className="h-1 flex-1" />
                  <span className="text-emerald-400">{Math.round(timeframe.significance * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landscape Context */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Mountain className="w-4 h-4 text-gray-400" />
            Cultural Landscapes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {culturalData.landscapes.map((landscape, index) => (
              <div key={index} className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  {getLandscapeIcon(landscape.type)}
                  <h5 className="font-medium text-white text-sm">{landscape.type}</h5>
                </div>
                <p className="text-slate-300 text-xs mb-2">{landscape.description}</p>
                <div className="text-xs">
                  <span className="text-slate-400">Cultural Use:</span>
                  <span className="text-emerald-300 ml-1">{landscape.culturalUse}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traditional Practices */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Traditional Practices
          </h4>
          <div className="space-y-3">
            {culturalData.traditions.map((tradition, index) => (
              <div key={index} className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white text-sm">{tradition.name}</h5>
                  <Badge className={getContinuityColor(tradition.continuity)}>
                    {tradition.continuity}
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs">{tradition.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates Display */}
        {culturalData.coordinates && (
          <div className="p-3 bg-slate-800/20 rounded border border-slate-600/20 text-center">
            <div className="text-xs text-slate-400">Analysis Coordinates</div>
            <div className="font-mono text-emerald-300">{culturalData.coordinates}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CulturalVisualization 