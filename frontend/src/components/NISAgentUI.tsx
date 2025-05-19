"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader,
  MapPin,
  AlertCircle,
  Download,
  Save,
  Share2,
  Layers,
  History,
  Database,
  FileText,
  Compass,
  MessageSquare,
  Eye,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ChatInterface from "./ChatInterface"
import DynamicMapViewer from "./DynamicMapViewer"
import SimpleMapFallback from "./SimpleMapFallback"
import { VisionAgentVisualization } from "./vision-agent-visualization"

// Mock data for demonstration
const BIOME_REGIONS = [
  {
    id: "br",
    name: "Brazil",
    bounds: [
      [-73.9872, -33.7683],
      [-34.7299, 5.2717],
    ],
  },
  {
    id: "pe",
    name: "Peru",
    bounds: [
      [-81.3584, -18.3499],
      [-68.6519, -0.0392],
    ],
  },
  {
    id: "co",
    name: "Colombia",
    bounds: [
      [-79.0479, -4.2316],
      [-66.8511, 12.4373],
    ],
  },
  {
    id: "ve",
    name: "Venezuela",
    bounds: [
      [-73.3049, 0.6475],
      [-59.8038, 12.2019],
    ],
  },
  {
    id: "bo",
    name: "Bolivia",
    bounds: [
      [-69.6408, -22.8982],
      [-57.4539, -9.6689],
    ],
  },
]

const KNOWN_SITES = [
  {
    name: "Kuhikugu",
    coordinates: "-12.2551, -53.2134",
    description: "Patchwork of 20 settlements at the headwaters of the Xingu River",
  },
  {
    name: "Geoglyphs of Acre",
    coordinates: "-9.8282, -67.9452",
    description: "Geometric earthworks discovered in the western Amazon",
  },
]

const DATA_SOURCES = [
  { id: "satellite", name: "Satellite Imagery", description: "High-resolution satellite images" },
  { id: "lidar", name: "LIDAR Data", description: "Light Detection and Ranging scans" },
  { id: "historical", name: "Historical Texts", description: "Colonial diaries and historical accounts" },
  { id: "indigenous", name: "Indigenous Maps", description: "Oral maps from indigenous communities" },
]

export default function NISAgentUI() {
  const [coordinates, setCoordinates] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([])
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("input")
  const [useSimpleMap, setUseSimpleMap] = useState<boolean>(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Handle coordinate selection from map or chat
  const handleCoordinateSelect = useCallback((coords: string) => {
    setCoordinates(coords)
    setActiveTab("input")
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordinates(e.target.value)
    // Clear previous results and errors when input changes
    if (results) setResults(null)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!coordinates.trim() || !coordinates.includes(",")) {
      setError("Please enter valid coordinates in format: latitude, longitude")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Mock data sources selection for the API request
      const dataSources = selectedDataSources.length > 0 ? selectedDataSources : DATA_SOURCES.map((ds) => ds.id)

      // In a real implementation, this would call your backend API
      // For now, we'll simulate a response after a short delay
      setTimeout(() => {
        // Mock response data
        const mockResults = {
          coordinates: coordinates,
          timestamp: new Date().toISOString(),
          confidence: 85,
          siteType: "Settlement",
          features: [
            {
              type: "Geometric Pattern",
              description: "Rectangular earthworks approximately 200m x 150m",
              confidence: 87,
            },
            {
              type: "Linear Feature",
              description: "Possible ancient road or causeway extending 1.2km",
              confidence: 72,
            },
            {
              type: "Vegetation Anomaly",
              description: "Distinct vegetation pattern suggesting buried structures",
              confidence: 81,
            },
          ],
          analysis:
            "The identified features are consistent with pre-colonial settlements dating to approximately 800-1200 CE. The rectangular pattern suggests a planned community with possible ceremonial or defensive purposes. The linear feature may represent a transportation route connecting to nearby water sources or other settlements.",
          similarSites: [
            {
              name: "Kuhikugu",
              similarity: 87,
              distance: "124km",
            },
            {
              name: "Geoglyphs of Acre",
              similarity: 72,
              distance: "287km",
            },
          ],
          dataSources: {
            satellite: "Landsat-8 Scene ID: LC08_L1TP_231062",
            lidar: "Amazon LIDAR Project Tile: ALP-2023-BR-42",
            historical: "Carvajal's Chronicle (1542)",
          },
          recommendations: [
            "Verify findings with additional data sources",
            "Compare with nearby known archaeological sites",
            "Consult with local indigenous knowledge holders",
            "Request high-resolution imagery for detailed analysis",
          ],
        }

        setResults(mockResults)
        setActiveTab("results")
        setLoading(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setResults(null)
      setLoading(false)
    }
  }

  const saveAnalysis = () => {
    if (results) {
      const analysis = {
        id: Date.now().toString(),
        coordinates,
        timestamp: new Date().toISOString(),
        results: { ...results },
      }
      setSavedAnalyses([...savedAnalyses, analysis])
    }
  }

  const exportResults = () => {
    if (!results) return

    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `nis-analysis-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Handle map loading error
  const handleMapError = () => {
    setUseSimpleMap(true)
  }

  return (
    <div className="flex justify-center w-full p-4">
      <Card className="w-full max-w-[800px] shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Compass className="h-6 w-6" />
              NIS Protocol V0 Agent
            </CardTitle>
            <Badge variant="outline" className="text-white border-white">
              OpenAI to Z Challenge
            </Badge>
          </div>
          <CardDescription className="text-gray-100">
            Discover archaeological sites in the Amazon using AI-powered analysis
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mx-4 mt-4">
            <TabsTrigger value="input" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Coordinates</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1" disabled={!results}>
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1" disabled={savedAnalyses.length === 0}>
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex gap-1 items-center">
              <Eye className="h-4 w-4" />
              Vision Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Label htmlFor="coordinates">Coordinates</Label>
                    <Input
                      id="coordinates"
                      placeholder="e.g., -3.4653, -62.2159"
                      value={coordinates}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter latitude and longitude separated by a comma
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger id="region" className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Amazon</SelectItem>
                        {BIOME_REGIONS.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="data-sources">Data Sources</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <span className="sr-only">Info</span>
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Select data sources to include in your analysis. If none are selected, all available sources
                            will be used.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DATA_SOURCES.map((source) => (
                      <div key={source.id} className="flex items-center space-x-2">
                        <Switch
                          id={`source-${source.id}`}
                          checked={selectedDataSources.includes(source.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDataSources([...selectedDataSources, source.id])
                            } else {
                              setSelectedDataSources(selectedDataSources.filter((id) => id !== source.id))
                            }
                          }}
                        />
                        <Label htmlFor={`source-${source.id}`} className="text-sm cursor-pointer">
                          {source.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="advanced-options">Advanced Options</Label>
                    <Switch
                      id="advanced-options"
                      checked={showAdvancedOptions}
                      onCheckedChange={setShowAdvancedOptions}
                    />
                  </div>

                  {showAdvancedOptions && (
                    <div className="mt-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="confidence-threshold">Confidence Threshold: {confidenceThreshold}%</Label>
                        <Slider
                          id="confidence-threshold"
                          min={0}
                          max={100}
                          step={5}
                          value={[confidenceThreshold]}
                          onValueChange={(value) => setConfidenceThreshold(value[0])}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="compare-known" defaultChecked />
                        <Label htmlFor="compare-known" className="text-sm">
                          Compare with known archaeological sites
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="pattern-recognition" defaultChecked />
                        <Label htmlFor="pattern-recognition" className="text-sm">
                          Enable pattern recognition
                        </Label>
                      </div>

                      <Select defaultValue="pre-colonial">
                        <SelectTrigger>
                          <SelectValue placeholder="Temporal range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-colonial">Pre-Colonial (Before 1500)</SelectItem>
                          <SelectItem value="colonial">Colonial (1500-1800)</SelectItem>
                          <SelectItem value="modern">Modern (1800-Present)</SelectItem>
                          <SelectItem value="all">All Time Periods</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing Analysis...
                  </>
                ) : (
                  "Run Agent"
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Reference Sites:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KNOWN_SITES.map((site, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3"
                    onClick={() => setCoordinates(site.coordinates)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{site.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{site.coordinates}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="p-4">
            {useSimpleMap ? (
              <SimpleMapFallback onCoordinateSelect={handleCoordinateSelect} />
            ) : (
              <DynamicMapViewer initialCoordinates={coordinates} onCoordinateSelect={handleCoordinateSelect} />
            )}

            {/* Add a button to switch to simple map if needed */}
            {!useSimpleMap && (
              <div className="mt-2 text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setUseSimpleMap(true)}
                >
                  Having trouble with the map? Try simple mode
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="p-4">
            <ChatInterface onCoordinateSelect={handleCoordinateSelect} />
          </TabsContent>

          <TabsContent value="results" className="p-4">
            {results && (
              <div className="animate-in fade-in duration-300 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Analysis Results</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={saveAnalysis}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Analysis</DialogTitle>
                          <DialogDescription>Generate a shareable link to this analysis</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <Input value={`https://nis-protocol.example/share/${Date.now().toString(36)}`} readOnly />
                          <Button size="sm">Copy</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Site Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[400px]">
                        <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                          {JSON.stringify(results, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Confidence Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center">
                          <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-24 h-24" viewBox="0 0 100 100">
                              <circle
                                className="text-muted stroke-current"
                                strokeWidth="10"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                              />
                              <circle
                                className="text-emerald-500 stroke-current"
                                strokeWidth="10"
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeDasharray={`${2.5 * Math.PI * 40 * 0.85} ${2.5 * Math.PI * 40 * 0.15}`}
                                strokeDashoffset={2.5 * Math.PI * 40 * 0.25}
                              />
                            </svg>
                            <span className="absolute text-2xl font-bold">85%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Site Classification</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">Settlement</Badge>
                          <p className="text-sm">
                            Likely pre-colonial settlement with evidence of earthworks and agricultural modifications.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Similar Sites</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                            >
                              1
                            </Badge>
                            Kuhikugu (87% match)
                          </li>
                          <li className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                            >
                              2
                            </Badge>
                            Geoglyphs of Acre (72% match)
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Evidence Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Badge variant="secondary">Satellite Imagery</Badge>
                        <p className="text-sm">Landsat-8 Scene ID: LC08_L1TP_231062</p>
                      </div>
                      <div className="space-y-1">
                        <Badge variant="secondary">LIDAR Data</Badge>
                        <p className="text-sm">Amazon LIDAR Project Tile: ALP-2023-BR-42</p>
                      </div>
                      <div className="space-y-1">
                        <Badge variant="secondary">Historical Text</Badge>
                        <p className="text-sm">Carvajal's Chronicle (1542)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Verify findings with additional data sources</li>
                      <li>Compare with nearby known archaeological sites</li>
                      <li>Consult with local indigenous knowledge holders</li>
                      <li>Request high-resolution imagery for detailed analysis</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-4">
            <h3 className="text-lg font-medium mb-4">Saved Analyses</h3>
            {savedAnalyses.length > 0 ? (
              <div className="space-y-4">
                {savedAnalyses.map((analysis, index) => (
                  <Card key={analysis.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium">Analysis #{index + 1}</CardTitle>
                        <Badge variant="outline" className="font-mono text-xs">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </Badge>
                      </div>
                      <CardDescription className="font-mono">{analysis.coordinates}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">
                            {analysis.results.siteType || "Settlement"}
                          </Badge>
                          <span className="text-muted-foreground">
                            Confidence: {analysis.results.confidence || "85%"}
                          </span>
                        </div>
                        <p className="line-clamp-2">
                          {analysis.results.summary ||
                            "Potential pre-colonial settlement with evidence of earthworks and agricultural modifications."}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setResults(analysis.results)
                          setCoordinates(analysis.coordinates)
                          setActiveTab("results")
                        }}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No saved analyses</h3>
                <p className="text-sm text-muted-foreground">Run an analysis and save the results to see them here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="vision" className="space-y-4">
            <VisionAgentVisualization 
              coordinates={coordinates} 
              imageSrc={results?.imageSrc || "/placeholder.svg?height=400&width=600"} 
            />
          </TabsContent>
        </Tabs>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground border-t p-4">
          <div>NIS Protocol V0 Agent for Archaeological Discovery</div>
          <div className="flex items-center gap-2">
            <span>Powered by OpenAI o3/o4 mini and GPT-4.1 models</span>
            <Separator orientation="vertical" className="h-4" />
            <a href="/documentation" className="hover:underline">
              Documentation
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="/" className="hover:underline">
              About
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
