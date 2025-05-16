"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Loader, MapPin, FileText, MessageSquare, BarChart, History } from "lucide-react"
import { Checkbox } from "./ui/checkbox"
import dynamic from "next/dynamic"

// Dynamically import MapView with no SSR to avoid hydration issues
const MapView = dynamic(() => import("./MapView").then(mod => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="bg-muted h-[400px] rounded-md flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
})

interface AnalysisResult {
  location: {
    lat: number
    lon: number
  }
  confidence: number
  description: string
  sources: string[]
  historical_context?: string
  indigenous_perspective?: string
  recommendations?: Array<{
    action: string
    description: string
    priority: string
    details?: Record<string, any>
  }>
}

export function NISAgentUI() {
  const [coordinates, setCoordinates] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dataSources, setDataSources] = useState({
    satellite: true,
    lidar: true,
    historicalTexts: true,
    indigenousMaps: true,
  })

  const presetLocations = [
    { name: "Kuhikugu", coords: "-3.4653, -62.2159" },
    { name: "Geoglyphs of Acre", coords: "-9.8282, -67.9452" },
  ]

  async function runAnalysis() {
    if (!coordinates.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinates,
          dataSources,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error running analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare site data for the MapView component
  const sites = result ? [{
    location: result.location,
    confidence: result.confidence,
    description: result.description
  }] : []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          NIS Protocol Explorer
        </CardTitle>
        <CardDescription>
          Discover archaeological sites in the Amazon using AI-driven analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="coordinates">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="coordinates">
              <MapPin className="h-4 w-4 mr-2" /> Coordinates
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="h-4 w-4 mr-2" /> Map
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" /> Chat
            </TabsTrigger>
            <TabsTrigger value="results">
              <BarChart className="h-4 w-4 mr-2" /> Results
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="coordinates" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter Coordinates (latitude, longitude)
                </label>
                <Input
                  placeholder="e.g., -3.4653, -62.2159"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preset Locations</label>
                <div className="flex flex-wrap gap-2">
                  {presetLocations.map((location) => (
                    <Button
                      key={location.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setCoordinates(location.coords)}
                    >
                      {location.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data Sources</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="satellite"
                      checked={dataSources.satellite}
                      onCheckedChange={(checked) =>
                        setDataSources({ ...dataSources, satellite: !!checked })
                      }
                    />
                    <label htmlFor="satellite" className="text-sm font-medium">
                      Satellite
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lidar"
                      checked={dataSources.lidar}
                      onCheckedChange={(checked) =>
                        setDataSources({ ...dataSources, lidar: !!checked })
                      }
                    />
                    <label htmlFor="lidar" className="text-sm font-medium">
                      LIDAR
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="historicalTexts"
                      checked={dataSources.historicalTexts}
                      onCheckedChange={(checked) =>
                        setDataSources({ ...dataSources, historicalTexts: !!checked })
                      }
                    />
                    <label htmlFor="historicalTexts" className="text-sm font-medium">
                      Historical Texts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="indigenousMaps"
                      checked={dataSources.indigenousMaps}
                      onCheckedChange={(checked) =>
                        setDataSources({ ...dataSources, indigenousMaps: !!checked })
                      }
                    />
                    <label htmlFor="indigenousMaps" className="text-sm font-medium">
                      Indigenous Maps
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="map">
            <MapView sites={sites} />
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="bg-muted h-[400px] rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Chat with the NIS Agent will be available soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="results">
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="text-sm">{`${result.location.lat}, ${result.location.lon}`}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Confidence</h3>
                    <p className="text-sm">{`${(result.confidence * 100).toFixed(1)}%`}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="text-sm">{result.description}</p>
                </div>
                {result.historical_context && (
                  <div>
                    <h3 className="text-sm font-medium">Historical Context</h3>
                    <p className="text-sm">{result.historical_context}</p>
                  </div>
                )}
                {result.indigenous_perspective && (
                  <div>
                    <h3 className="text-sm font-medium">Indigenous Perspective</h3>
                    <p className="text-sm">{result.indigenous_perspective}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium">Sources</h3>
                  <ul className="text-sm list-disc pl-5">
                    {result.sources.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Recommendations</h3>
                    <ul className="text-sm list-disc pl-5">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="mt-1">
                          <span className="font-medium">{rec.action}:</span> {rec.description}
                          <span className="text-xs ml-1 px-1.5 py-0.5 rounded-full bg-muted">
                            {rec.priority}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Run an analysis to see results</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="bg-muted h-[400px] rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Analysis history will be available soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Powered by OpenAI GPT-4.1 and NIS Protocol
          </div>
          <Button onClick={runAnalysis} disabled={loading || !coordinates.trim()}>
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              "Run Agent"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 