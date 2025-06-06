"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  BookOpen, 
  FileText, 
  Image, 
  Map, 
  Database, 
  Brain, 
  Microscope,
  Download,
  Upload,
  RefreshCw,
  Star,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Globe,
  Layers,
  Target,
  Zap,
  Archive,
  Filter,
  SortAsc,
  Calendar,
  MapPin,
  Eye,
  Bookmark
} from "lucide-react"

interface ResearchQuery {
  id: string
  query: string
  type: 'archaeological' | 'historical' | 'cultural' | 'geographic' | 'multi-modal'
  timestamp: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  results?: any
  sources?: string[]
  confidence?: number
}

interface ResearchDocument {
  id: string
  title: string
  type: 'paper' | 'report' | 'historical_text' | 'oral_history' | 'satellite_data'
  authors: string[]
  date: string
  abstract: string
  relevance_score: number
  keywords: string[]
  url?: string
  citations: number
}

interface ArchaeologicalFeature {
  id: string
  name: string
  type: string
  coordinates: string
  period: string
  culture: string
  description: string
  evidence_level: number
  related_sites: string[]
}

export function ResearchTools({ 
  onResearchComplete,
  onCoordinateSelect,
  backendOnline = false 
}: {
  onResearchComplete?: (results: any) => void
  onCoordinateSelect?: (coords: string) => void
  backendOnline?: boolean
}) {
  const [activeResearch, setActiveResearch] = useState<ResearchQuery | null>(null)
  const [researchHistory, setResearchHistory] = useState<ResearchQuery[]>([])
  const [researchQuery, setResearchQuery] = useState("")
  const [researchType, setResearchType] = useState<ResearchQuery['type']>('archaeological')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [features, setFeatures] = useState<ArchaeologicalFeature[]>([])
  const [filters, setFilters] = useState({
    timeRange: 'all',
    evidenceLevel: 'all',
    culture: 'all',
    documentType: 'all'
  })

  // Simulated archaeological knowledge base
  const knowledgeBase = {
    sites: [
      { name: "Kuhikugu", coords: "-12.2551, -53.2134", culture: "Kuikuro", period: "1200-1600 CE" },
      { name: "Nazca Lines", coords: "-14.7390, -75.1300", culture: "Nazca", period: "500 BCE - 500 CE" },
      { name: "Caral", coords: "-10.8933, -77.5200", culture: "Norte Chico", period: "3500-1800 BCE" },
      { name: "Monte Alegre", coords: "-2.0067, -54.0715", culture: "Paleo-Indian", period: "11,200-10,000 BCE" },
      { name: "Marajoara", coords: "-0.7893, -49.5094", culture: "Marajoara", period: "400-1300 CE" }
    ],
    cultures: [
      { name: "Inca", region: "Andes", period: "1438-1533 CE", characteristics: "Administrative, architectural" },
      { name: "Chavín", region: "Peru", period: "900-200 BCE", characteristics: "Religious, artistic" },
      { name: "Moche", region: "Peru", period: "100-700 CE", characteristics: "Ceramic, metallurgy" },
      { name: "Tiwanaku", region: "Bolivia", period: "300-1000 CE", characteristics: "Monumental, agricultural" },
      { name: "Amazonian", region: "Amazon Basin", period: "Various", characteristics: "Terra preta, earthworks" }
    ],
    keywords: [
      "terra preta", "earthworks", "geoglyphs", "ceramic traditions", "agricultural terraces",
      "settlement patterns", "trade networks", "ceremonial centers", "burial practices",
      "rock art", "shell middens", "defensive structures", "hydraulic systems"
    ]
  }

  // Advanced research function with multiple search strategies
  const conductResearch = useCallback(async () => {
    if (!researchQuery.trim()) return

    setLoading(true)
    const query: ResearchQuery = {
      id: `research_${Date.now()}`,
      query: researchQuery,
      type: researchType,
      timestamp: new Date().toISOString(),
      status: 'processing'
    }

    setActiveResearch(query)
    setResearchHistory(prev => [query, ...prev.slice(0, 19)])

    try {
      let results = {}
      
      if (backendOnline) {
        // Use backend research API
        const response = await fetch('http://localhost:8000/research/deep-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: researchQuery,
            research_type: researchType,
            include_sources: true,
            include_citations: true,
            max_results: 50
          })
        })

        if (response.ok) {
          results = await response.json()
        } else {
          throw new Error('Backend research failed')
        }
      } else {
        // Enhanced local research simulation
        results = await simulateAdvancedResearch(researchQuery, researchType)
      }

      const completedQuery = {
        ...query,
        status: 'completed' as const,
        results,
        confidence: 0.85 + Math.random() * 0.15,
        sources: generateSources(researchType)
      }

      setActiveResearch(completedQuery)
      setResearchHistory(prev => [completedQuery, ...prev.slice(1)])
      
      if (onResearchComplete) {
        onResearchComplete(results)
      }

    } catch (error) {
      console.error('Research failed:', error)
      const errorQuery = {
        ...query,
        status: 'error' as const,
        results: { error: 'Research failed', fallback_mode: true }
      }
      setActiveResearch(errorQuery)
    } finally {
      setLoading(false)
    }
  }, [researchQuery, researchType, backendOnline, onResearchComplete])

  // Simulate advanced research with realistic archaeological data
  const simulateAdvancedResearch = async (query: string, type: string) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    const queryLower = query.toLowerCase()
    
    // Knowledge base matching
    const relatedSites = knowledgeBase.sites.filter(site => 
      site.name.toLowerCase().includes(queryLower) ||
      site.culture.toLowerCase().includes(queryLower) ||
      site.period.toLowerCase().includes(queryLower)
    )

    const relatedCultures = knowledgeBase.cultures.filter(culture =>
      culture.name.toLowerCase().includes(queryLower) ||
      culture.region.toLowerCase().includes(queryLower) ||
      culture.characteristics.toLowerCase().includes(queryLower)
    )

    const relatedKeywords = knowledgeBase.keywords.filter(keyword =>
      keyword.includes(queryLower) || queryLower.includes(keyword)
    )

    // Generate comprehensive research results
    return {
      summary: `Comprehensive research analysis for "${query}" reveals significant archaeological insights across ${relatedSites.length} known sites and ${relatedCultures.length} cultural contexts.`,
      
      archaeological_sites: relatedSites.map(site => ({
        ...site,
        relevance: 0.7 + Math.random() * 0.3,
        research_priority: Math.random() > 0.5 ? 'high' : 'medium',
        data_sources: ['satellite', 'lidar', 'excavation', 'historical'].filter(() => Math.random() > 0.3)
      })),

      cultural_contexts: relatedCultures.map(culture => ({
        ...culture,
        relevance: 0.6 + Math.random() * 0.4,
        research_gaps: generateResearchGaps(),
        related_technologies: generateTechnologies()
      })),

      key_findings: [
        `Archaeological evidence suggests ${query} represents a significant pattern in pre-Columbian settlement strategies.`,
        `Material culture analysis indicates sophisticated technological adaptations to environmental conditions.`,
        `Settlement pattern analysis reveals complex social organization and regional interaction networks.`,
        `Temporal analysis suggests continuous occupation spanning multiple cultural phases.`
      ],

      research_opportunities: [
        {
          title: "LIDAR Survey Initiative",
          description: "Comprehensive LIDAR mapping to identify additional settlement features",
          priority: "high",
          estimated_duration: "6-12 months",
          required_resources: ["LIDAR equipment", "GIS specialists", "local permits"]
        },
        {
          title: "Community Archaeology Program", 
          description: "Collaborative research with indigenous knowledge holders",
          priority: "high",
          estimated_duration: "ongoing",
          required_resources: ["community liaisons", "cultural protocols", "shared benefits"]
        },
        {
          title: "Ceramic Analysis Study",
          description: "Detailed analysis of ceramic traditions and technological change",
          priority: "medium",
          estimated_duration: "3-6 months",
          required_resources: ["lab access", "ceramic specialists", "comparative collections"]
        }
      ],

      methodology_recommendations: [
        "Multi-proxy environmental reconstruction",
        "Integrated geophysical survey approach", 
        "Community-based participatory research",
        "Digital heritage documentation",
        "Interdisciplinary collaboration framework"
      ],

      related_keywords: relatedKeywords,
      confidence_score: 0.85 + Math.random() * 0.15,
      processing_time: `${2 + Math.random() * 3}s`,
      data_quality: "high"
    }
  }

  const generateSources = (type: string) => {
    const sources: Record<string, string[]> = {
      archaeological: [
        "Journal of Archaeological Science",
        "American Antiquity", 
        "Latin American Antiquity",
        "Archaeological Prospection",
        "Journal of Field Archaeology"
      ],
      historical: [
        "Colonial Latin American Review",
        "The Americas",
        "Journal of Latin American Studies", 
        "Ethnohistory",
        "Hispanic American Historical Review"
      ],
      cultural: [
        "Current Anthropology",
        "Journal of Anthropological Archaeology",
        "Cultural Anthropology",
        "American Ethnologist",
        "Anthropological Quarterly"
      ]
    }
    return sources[type] || sources.archaeological
  }

  const generateResearchGaps = () => [
    "Settlement chronology refinement needed",
    "Subsistence strategy documentation incomplete", 
    "Social organization models require validation",
    "Environmental impact assessment pending"
  ]

  const generateTechnologies = () => [
    "Ceramic production techniques",
    "Agricultural innovation systems",
    "Architectural engineering methods",
    "Resource management strategies"
  ]

  // Load mock documents and features
  useEffect(() => {
    const mockDocuments: ResearchDocument[] = [
      {
        id: "doc_001",
        title: "LIDAR Reveals Ancient Amazonian Settlement Networks",
        type: "paper",
        authors: ["Smith, J.", "Silva, M.", "Jones, R."],
        date: "2024-03-15",
        abstract: "Recent LIDAR surveys across the Amazon Basin have revealed extensive networks of ancient settlements...",
        relevance_score: 0.94,
        keywords: ["LIDAR", "Amazon", "settlements", "networks"],
        citations: 23,
        url: "https://example.com/paper1"
      },
      {
        id: "doc_002", 
        title: "Indigenous Oral Histories and Archaeological Evidence",
        type: "report",
        authors: ["Traditional Knowledge Holders", "Research Team"],
        date: "2024-02-10",
        abstract: "Integration of indigenous oral histories with archaeological evidence provides new insights...",
        relevance_score: 0.87,
        keywords: ["oral history", "indigenous", "archaeology", "integration"],
        citations: 15
      },
      {
        id: "doc_003",
        title: "Geoglyph Formation Techniques in Pre-Columbian Peru",
        type: "paper", 
        authors: ["Rodriguez, A.", "Chen, L."],
        date: "2024-01-22",
        abstract: "Analysis of geoglyph construction techniques reveals sophisticated engineering knowledge...",
        relevance_score: 0.82,
        keywords: ["geoglyphs", "Peru", "engineering", "construction"],
        citations: 31
      }
    ]

    const mockFeatures: ArchaeologicalFeature[] = [
      {
        id: "feat_001",
        name: "Circular Plaza Complex",
        type: "ceremonial_center",
        coordinates: "-12.2551, -53.2134",
        period: "1200-1600 CE",
        culture: "Kuikuro",
        description: "Large circular plaza with associated residential areas and defensive earthworks",
        evidence_level: 0.92,
        related_sites: ["feat_002", "feat_003"]
      },
      {
        id: "feat_002",
        name: "Agricultural Terrace System", 
        type: "agricultural_infrastructure",
        coordinates: "-13.1631, -72.545",
        period: "1000-1400 CE",
        culture: "Inca",
        description: "Extensive terracing system with sophisticated irrigation channels",
        evidence_level: 0.89,
        related_sites: ["feat_001"]
      }
    ]

    setDocuments(mockDocuments)
    setFeatures(mockFeatures)
  }, [])

  return (
    <div className="space-y-6">
      {/* Research Query Interface */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Microscope className="h-5 w-5 text-emerald-400" />
            <span>Archaeological Research Assistant</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Advanced research tools for archaeological investigation and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className="text-slate-300">Research Query</Label>
              <Input
                placeholder="e.g., terra preta sites in Amazon Basin..."
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && conductResearch()}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Research Type</Label>
              <Select value={researchType} onValueChange={(value: any) => setResearchType(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="archaeological">Archaeological</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="geographic">Geographic</SelectItem>
                  <SelectItem value="multi-modal">Multi-Modal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={conductResearch}
                disabled={loading || !researchQuery.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Research
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Backend Status */}
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-300">
                {backendOnline ? 'Advanced Research API Active' : 'Local Research Mode'}
              </span>
            </div>
            <Badge variant="outline" className={`text-xs ${backendOnline ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-500 text-slate-400'}`}>
              {backendOnline ? 'Enhanced' : 'Demo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Research Results Tabs */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="results" className="text-slate-300">Results</TabsTrigger>
          <TabsTrigger value="documents" className="text-slate-300">Documents</TabsTrigger>
          <TabsTrigger value="features" className="text-slate-300">Features</TabsTrigger>
          <TabsTrigger value="analysis" className="text-slate-300">Analysis</TabsTrigger>
          <TabsTrigger value="history" className="text-slate-300">History</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {activeResearch?.status === 'processing' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Processing Research Query</h3>
                    <p className="text-slate-400 text-sm">Analyzing: {activeResearch.query}</p>
                    <Progress value={65} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeResearch?.status === 'completed' && activeResearch.results && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-emerald-400" />
                    <span>Research Summary</span>
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                      {Math.round((activeResearch.confidence || 0.85) * 100)}% Confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{activeResearch.results.summary}</p>
                  
                  {activeResearch.results.key_findings && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-2">Key Findings</h4>
                      <ul className="space-y-2">
                        {activeResearch.results.key_findings.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-slate-300 text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Archaeological Sites */}
              {activeResearch.results.archaeological_sites && activeResearch.results.archaeological_sites.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span>Related Archaeological Sites</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeResearch.results.archaeological_sites.map((site: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{site.name}</h4>
                            <Badge variant="outline" className={`text-xs ${
                              site.research_priority === 'high' ? 'border-red-500/50 text-red-400' : 'border-yellow-500/50 text-yellow-400'
                            }`}>
                              {site.research_priority} priority
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{site.culture} • {site.period}</p>
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onCoordinateSelect?.(site.coords)}
                              className="text-xs border-slate-600 text-slate-300"
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              View on Map
                            </Button>
                            <span className="text-xs text-slate-500">
                              {Math.round(site.relevance * 100)}% relevant
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Research Opportunities */}
              {activeResearch.results.research_opportunities && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      <span>Research Opportunities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeResearch.results.research_opportunities.map((opportunity: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{opportunity.title}</h4>
                            <Badge variant="outline" className={`text-xs ${
                              opportunity.priority === 'high' ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400'
                            }`}>
                              {opportunity.priority}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{opportunity.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Duration: {opportunity.estimated_duration}</span>
                            <span>{opportunity.required_resources?.length || 0} resources needed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!activeResearch && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No Active Research</h3>
                <p className="text-slate-400">Enter a research query above to begin archaeological investigation</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Research Documents</h3>
            <div className="flex items-center space-x-2">
              <Select value={filters.documentType} onValueChange={(value) => setFilters(prev => ({...prev, documentType: value}))}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="paper">Papers</SelectItem>
                  <SelectItem value="report">Reports</SelectItem>
                  <SelectItem value="historical_text">Historical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{doc.title}</h4>
                      <p className="text-slate-400 text-sm mb-2">{doc.authors.join(', ')} • {doc.date}</p>
                      <p className="text-slate-300 text-sm">{doc.abstract}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 mb-2">
                        {Math.round(doc.relevance_score * 100)}% relevant
                      </Badge>
                      {doc.url && (
                        <Button size="sm" variant="outline" className="block text-xs border-slate-600">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {doc.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{doc.citations} citations</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Archaeological Features</h3>
            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
              <Filter className="h-3 w-3 mr-1" />
              Filter Features
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Card key={feature.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{feature.name}</h4>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                      {feature.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-3">{feature.description}</p>
                  
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Culture:</span>
                      <span className="text-slate-300">{feature.culture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Period:</span>
                      <span className="text-slate-300">{feature.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evidence Level:</span>
                      <span className="text-emerald-400">{Math.round(feature.evidence_level * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCoordinateSelect?.(feature.coordinates)}
                      className="flex-1 text-xs border-slate-600 text-slate-300"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View Location
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-slate-600 text-slate-300">
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cross-Reference Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
                Advanced analysis tools for comparing archaeological data across multiple sources and contexts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col border-slate-600 text-slate-300">
                  <Globe className="h-6 w-6 mb-2 text-blue-400" />
                  <span className="text-xs">Spatial Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-slate-600 text-slate-300">
                  <Clock className="h-6 w-6 mb-2 text-purple-400" />
                  <span className="text-xs">Temporal Patterns</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-slate-600 text-slate-300">
                  <Users className="h-6 w-6 mb-2 text-emerald-400" />
                  <span className="text-xs">Cultural Networks</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Research History</h3>
            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
              <Download className="h-3 w-3 mr-1" />
              Export All
            </Button>
          </div>

          <div className="space-y-3">
            {researchHistory.map((query) => (
              <Card key={query.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{query.query}</h4>
                      <p className="text-slate-400 text-sm">
                        {query.type} • {new Date(query.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${
                        query.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' :
                        query.status === 'processing' ? 'border-blue-500/50 text-blue-400' :
                        'border-red-500/50 text-red-400'
                      }`}>
                        {query.status}
                      </Badge>
                      {query.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveResearch(query)}
                          className="text-xs border-slate-600 text-slate-300"
                        >
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {researchHistory.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Archive className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No Research History</h3>
                  <p className="text-slate-400">Your research queries will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
