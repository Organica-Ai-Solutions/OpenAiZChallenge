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
import { AmazonArchaeologicalSites, ArchaeologicalSite } from '@/types/archaeological-site'

export default function AnalysisPage() {
  const [siteAnalysis, setSiteAnalysis] = useState<ArchaeologicalSite>(AmazonArchaeologicalSites[0])

  const generateMockAnalysis = () => {
    // Randomly select another site from the available sites
    const randomSite = AmazonArchaeologicalSites[
      Math.floor(Math.random() * AmazonArchaeologicalSites.length)
    ]
    setSiteAnalysis(randomSite)
  }

  const exportAnalysis = () => {
    const analysisJson = JSON.stringify(siteAnalysis, null, 2)
    const blob = new Blob([analysisJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `site_analysis_${siteAnalysis.name.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareAnalysis = () => {
    if (navigator.share) {
      navigator.share({
        title: `Archaeological Site Analysis - ${siteAnalysis.name}`,
        text: `Discovered archaeological site ${siteAnalysis.name} at ${siteAnalysis.coordinates.join(', ')} with ${siteAnalysis.confidenceScore}% confidence`,
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
          <Dialog>
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
                      {siteAnalysis.aiInsights?.culturalSignificance || 'No specific insights available'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Zap className="mr-2 h-5 w-5" /> Research Priority
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {siteAnalysis.researchPriority} Priority Site
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <Zap className="mr-2 h-5 w-5" /> Preservation Status
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {siteAnalysis.aiInsights?.preservationStatus || 'Status not assessed'}
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