"use client"

import React, { useState, useEffect } from 'react'
import SiteAnalysisView from '../../components/SiteAnalysisView'
import { Button } from "@/components/ui/button"
import { 
  RefreshCw, 
  Download, 
  Share2, 
  Zap,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"

export default function AnalysisPage() {
  const [siteAnalysis, setSiteAnalysis] = useState({
    coordinates: "-12.2551, -53.2134",
    timestamp: "2025-05-17T11:32:33.045Z",
    confidence: 85,
    siteType: "Settlement",
    features: [
      {
        type: "Geometric Pattern",
        description: "Rectangular earthworks approximately 200m x 150m",
        confidence: 87,
        dimensions: {
          length: 200,
          width: 150
        }
      },
      {
        type: "Linear Feature",
        description: "Possible ancient road or causeway extending 1.2km",
        confidence: 72,
        dimensions: {
          length: 1200,
          width: 10
        }
      },
      {
        type: "Vegetation Anomaly",
        description: "Distinct vegetation pattern suggesting buried structures",
        confidence: 81
      }
    ],
    analysis: "The identified features are consistent with pre-colonial settlements dating to approximately 800-1200 CE. The rectangular pattern suggests a planned community with possible ceremonial or defensive purposes. The linear feature may represent a transportation route connecting to nearby water sources or other settlements.",
    aiInsights: {
      culturalSignificance: "High potential for understanding pre-Columbian social organization and urban planning",
      researchPriority: "Critical - Unique architectural layout and strategic location",
      preservationStatus: "Moderate risk from environmental changes and potential agricultural expansion"
    },
    similarSites: [
      {
        name: "Kuhikugu",
        similarity: 87,
        distance: "124km",
        type: "Settlement"
      },
      {
        name: "Geoglyphs of Acre",
        similarity: 72,
        distance: "287km",
        type: "Ceremonial Site"
      }
    ],
    dataSources: {
      satellite: "Landsat-8 Scene ID: LC08_L1TP_231062",
      lidar: "Amazon LIDAR Project Tile: ALP-2023-BR-42",
      historical: "Carvajal's Chronicle (1542)"
    },
    recommendations: [
      "Verify findings with additional data sources",
      "Compare with nearby known archaeological sites",
      "Consult with local indigenous knowledge holders",
      "Request high-resolution imagery for detailed analysis"
    ],
    environmentalContext: {
      vegetation: "Dense Tropical Rainforest",
      waterProximity: "Riverside Settlement",
      elevation: 250,
      terrainComplexity: "Medium"
    }
  })

  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false)

  const generateMockAnalysis = () => {
    const newAnalysis = {
      ...siteAnalysis,
      coordinates: `${-12.2551 + (Math.random() * 0.1 - 0.05)}, ${-53.2134 + (Math.random() * 0.1 - 0.05)}`,
      timestamp: new Date().toISOString(),
      confidence: Math.min(100, Math.max(50, siteAnalysis.confidence + (Math.random() * 10 - 5))),
      features: siteAnalysis.features.map(feature => ({
        ...feature,
        confidence: Math.min(100, Math.max(50, feature.confidence + (Math.random() * 10 - 5)))
      }))
    }
    setSiteAnalysis(newAnalysis)
  }

  const exportAnalysis = () => {
    const analysisJson = JSON.stringify(siteAnalysis, null, 2)
    const blob = new Blob([analysisJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `site_analysis_${siteAnalysis.coordinates.replace(/,/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareAnalysis = () => {
    if (navigator.share) {
      navigator.share({
        title: `Archaeological Site Analysis - ${siteAnalysis.coordinates}`,
        text: `Discovered archaeological site at ${siteAnalysis.coordinates} with ${siteAnalysis.confidence}% confidence`,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-emerald-800 flex items-center">
          Archaeological Site Discovery
          <Dialog open={isAIInsightsOpen} onOpenChange={setIsAIInsightsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-4 hover:bg-emerald-50"
              >
                <Sparkles className="h-6 w-6 text-emerald-600 hover:animate-pulse" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Sparkles className="mr-2 h-6 w-6 text-emerald-600" />
                  AI-Powered Insights
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" /> Cultural Significance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {siteAnalysis.aiInsights.culturalSignificance}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Zap className="mr-2 h-5 w-5" /> Research Priority
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {siteAnalysis.aiInsights.researchPriority}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <Zap className="mr-2 h-5 w-5" /> Preservation Status
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {siteAnalysis.aiInsights.preservationStatus}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={generateMockAnalysis}
            className="group"
          >
            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
            Generate Variant
          </Button>
          <Button 
            variant="outline" 
            onClick={exportAnalysis}
            className="group"
          >
            <Download className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Export
          </Button>
          <Button 
            variant="default" 
            onClick={shareAnalysis}
            className="group"
          >
            <Share2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Share
          </Button>
        </div>
      </div>
      
      <SiteAnalysisView {...siteAnalysis} />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center">
          <Zap className="mr-2 h-4 w-4 text-yellow-500" />
          NIS Protocol V0 Agent for Archaeological Discovery
          <Zap className="ml-2 h-4 w-4 text-yellow-500" />
        </p>
      </div>
    </div>
  )
} 