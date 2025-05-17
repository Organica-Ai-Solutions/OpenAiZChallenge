"use client"
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Compass, 
  Satellite, 
  Layers, 
  BookOpen, 
  MapPin, 
  AlertCircle, 
  Loader2, 
  Info,
  MapIcon,
  Download
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

import { ResearchAPI, ArchaeologicalSite } from "@/lib/api/research-api"

// Mock data sources
const DATA_SOURCES = [
  { 
    id: "satellite",
    icon: <Satellite className="h-5 w-5 text-emerald-600" />, 
    label: "Satellite Imagery", 
    description: "High-resolution surface analysis" 
  },
  { 
    id: "lidar",
    icon: <Layers className="h-5 w-5 text-emerald-600" />, 
    label: "LIDAR Data", 
    description: "Terrain and vegetation penetration" 
  },
  { 
    id: "historical",
    icon: <BookOpen className="h-5 w-5 text-emerald-600" />, 
    label: "Historical Texts", 
    description: "Archival and colonial records" 
  },
  { 
    id: "indigenous",
    icon: <MapIcon className="h-5 w-5 text-emerald-600" />, 
    label: "Indigenous Maps", 
    description: "Traditional knowledge sources" 
  }
]

export default function ArchaeologicalDiscoveryPage() {
  // State for form inputs
  const [coordinates, setCoordinates] = useState("")
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ArchaeologicalSite[] | null>(null)

  // Coordinate validation regex
  const coordinateRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/

  // Handle form submission
  const handleDiscoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResults(null)

    // Validate coordinates
    if (!coordinateRegex.test(coordinates)) {
      setError("Please enter valid coordinates in the format: latitude,longitude")
      return
    }

    // Validate data sources
    if (selectedSources.length === 0) {
      setError("Please select at least one data source")
      return
    }

    // Discover sites
    setIsLoading(true)
    try {
      const discoveredSites = await ResearchAPI.discoverSites({
        coordinates,
        dataSources: selectedSources,
        confidenceThreshold
      })

      setResults(discoveredSites)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle geolocation
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates(`${latitude.toFixed(6)},${longitude.toFixed(6)}`)
        },
        (error) => {
          setError("Unable to retrieve location. Please enter coordinates manually.")
        }
      )
    } else {
      setError("Geolocation is not supported by your browser.")
    }
  }

  // Toggle data source selection
  const toggleDataSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  // Export results to JSON
  const handleExportResults = () => {
    if (!results) return

    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `archaeological-sites-${new Date().toISOString().slice(0, 10)}.json`
    
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-900 mb-4">
            Archaeological Site Discovery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore potential archaeological sites using multi-source data analysis and advanced AI processing
          </p>
        </div>

        <form onSubmit={handleDiscoverySubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Discovery Parameters</CardTitle>
              <CardDescription>
                Enter research coordinates and select data sources to discover potential archaeological sites
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Coordinate Input */}
              <div className="space-y-2">
                <Label htmlFor="coordinates">Research Coordinates</Label>
                <div className="flex gap-2">
                  <Input 
                    id="coordinates" 
                    placeholder="Enter latitude,longitude (e.g., -3.4567, -62.7890)" 
                    className="font-mono"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    title="Use my location"
                    onClick={handleUseMyLocation}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter decimal coordinates separated by a comma
                </p>
              </div>

              {/* Data Source Selection */}
              <div className="space-y-3">
                <Label>Data Sources</Label>
                <div className="grid grid-cols-2 gap-4">
                  {DATA_SOURCES.map((source) => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={source.id} 
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => toggleDataSource(source.id)}
                      />
                      <div>
                        <Label 
                          htmlFor={source.id} 
                          className="flex items-center gap-2"
                        >
                          {source.icon}
                          {source.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{source.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-3">
                <Label>Confidence Threshold: {confidenceThreshold}%</Label>
                <Slider 
                  value={[confidenceThreshold]} 
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                  max={100} 
                  step={5} 
                  className="py-4" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Confidence</span>
                  <span>High Confidence</span>
                </div>
              </div>

              {/* Error Handling */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Discovering Sites...
                  </>
                ) : (
                  <>
                    <Compass className="mr-2 h-4 w-4" />
                    Discover Archaeological Sites
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Results Display */}
        {results && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discovery Results</CardTitle>
                <CardDescription>
                  {results.length} potential archaeological sites found
                </CardDescription>
              </div>
              {results.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportResults}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((site) => (
                    <div 
                      key={site.id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{site.name}</h3>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold
                          ${site.confidence >= 80 ? 'bg-green-100 text-green-800' : 
                            site.confidence >= 50 ? 'bg-amber-100 text-amber-800' : 
                            'bg-red-100 text-red-800'}
                        `}>
                          {site.confidence}% Confidence
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2">{site.description}</p>
                      <div className="mt-2 text-sm flex justify-between">
                        <div>
                          <strong>Coordinates:</strong> {site.coordinates}
                          <span className="ml-4 text-muted-foreground">{site.type}</span>
                        </div>
                        <div className="flex gap-2">
                          {site.dataSources.map((source) => (
                            <span 
                              key={source} 
                              className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Info className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                  <p>No sites found matching the current confidence threshold</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 