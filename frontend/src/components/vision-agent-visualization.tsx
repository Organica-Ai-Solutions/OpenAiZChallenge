"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  Layers,
  FileImage,
  Maximize,
  Grid,
  SquareStack,
  Download,
  PlusSquare,
  MoreHorizontal,
  AlertCircle,
  Satellite,
  Database,
  Brain,
  Zap,
  Filter,
  Code,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface VisionAgentVisualizationProps {
  coordinates?: string
  imageSrc?: string
}

export function VisionAgentVisualization({ coordinates, imageSrc }: VisionAgentVisualizationProps) {
  const [visualizationMode, setVisualizationMode] = useState("detection")
  const [confidenceThreshold, setConfidenceThreshold] = useState(40)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisComplete, setShowAnalysisComplete] = useState(false)

  // Sample detection data - in a real app, this would come from the backend
  const detections = [
    {
      id: "1",
      label: "Geometric Pattern",
      confidence: 0.87,
      bounds: { x: 20, y: 15, width: 150, height: 120 },
      description: "Rectangular earthwork pattern consistent with human settlement",
    },
    {
      id: "2",
      label: "Linear Feature",
      confidence: 0.72,
      bounds: { x: 180, y: 90, width: 200, height: 30 },
      description: "Possible ancient road or causeway",
    },
    {
      id: "3",
      label: "Vegetation Anomaly",
      confidence: 0.63,
      bounds: { x: 320, y: 150, width: 100, height: 100 },
      description: "Distinct vegetation pattern suggesting buried structures",
    },
    {
      id: "4",
      label: "Circular Formation",
      confidence: 0.91,
      bounds: { x: 50, y: 200, width: 100, height: 100 },
      description: "Circular earthwork consistent with ceremonial space",
    },
  ]

  // Filter detections based on confidence threshold
  const filteredDetections = detections.filter((detection) => detection.confidence * 100 >= confidenceThreshold)

  // Function to start analysis process
  const handleRunAnalysis = () => {
    setIsAnalyzing(true)
    setShowAnalysisComplete(false)

    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowAnalysisComplete(true)
    }, 3000)
  }

  // Generate appropriate color for confidence level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500"
    if (confidence >= 0.5) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Vision Agent Analysis
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {coordinates || "-3.4567, -62.7890"}
          </Badge>
        </div>
        <CardDescription>
          Visualization of computer vision analysis using YOLO8, Waldo, and GPT-4 Vision models
        </CardDescription>
      </CardHeader>

      <Tabs value={visualizationMode} onValueChange={setVisualizationMode} className="w-full">
        <div className="px-6 pt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="detection" className="flex gap-1 items-center text-xs">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Detection</span>
            </TabsTrigger>
            <TabsTrigger value="layers" className="flex gap-1 items-center text-xs">
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Layers</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex gap-1 items-center text-xs">
              <SquareStack className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex gap-1 items-center text-xs">
              <Database className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="detection" className="mt-0">
            <div className="space-y-4">
              <div className="relative bg-muted aspect-video rounded-lg overflow-hidden border">
                {/* Placeholder for satellite image */}
                <div className="absolute inset-0">
                  <img
                    src={imageSrc || "/placeholder.svg?height=400&width=600"}
                    alt="Satellite imagery"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay detection boxes if needed */}
                  {showBoundingBoxes &&
                    filteredDetections.map((detection) => (
                      <div
                        key={detection.id}
                        className="absolute border-2 border-primary"
                        style={{
                          left: `${detection.bounds.x}px`,
                          top: `${detection.bounds.y}px`,
                          width: `${detection.bounds.width}px`,
                          height: `${detection.bounds.height}px`,
                          boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                        }}
                      >
                        {showLabels && (
                          <div className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs py-1 px-2 rounded">
                            {detection.label} ({Math.round(detection.confidence * 100)}%)
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Loading overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative w-16 h-16 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                          <Eye className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium">Analyzing Imagery</p>
                          <p className="text-xs text-muted-foreground">Using YOLO8 + Waldo + GPT-4 Vision</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success overlay */}
                  {showAnalysisComplete && (
                    <div className="absolute bottom-4 right-4 bg-green-500/90 text-white py-2 px-4 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in duration-500">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Analysis Complete</span>
                    </div>
                  )}
                </div>

                {/* Control buttons in top-right */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                    <Maximize className="h-4 w-4" />
                    <span className="sr-only">Fullscreen</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download Image</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <PlusSquare className="mr-2 h-4 w-4" />
                          <span>Add Annotation</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Grid className="mr-2 h-4 w-4" />
                          <span>Show Grid</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-bounding-boxes"
                      checked={showBoundingBoxes}
                      onCheckedChange={setShowBoundingBoxes}
                    />
                    <Label htmlFor="show-bounding-boxes">Show Bounding Boxes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                    <Label htmlFor="show-labels">Show Labels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                    <Label htmlFor="show-heatmap">Show Heatmap</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="confidence-threshold">Confidence Threshold: {confidenceThreshold}%</Label>
                  </div>
                  <Slider
                    id="confidence-threshold"
                    min={0}
                    max={100}
                    step={5}
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Show All</span>
                    <span>High Confidence Only</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button className="w-full" onClick={handleRunAnalysis} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Run Vision Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Detection Results</h3>
                {filteredDetections.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDetections.map((detection) => (
                      <div key={detection.id} className="flex items-start gap-3 bg-card p-3 rounded-lg border">
                        <div
                          className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${getConfidenceColor(
                            detection.confidence,
                          )}`}
                        ></div>
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium">{detection.label}</div>
                            <Badge variant="outline">{Math.round(detection.confidence * 100)}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{detection.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No detections above the confidence threshold</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try lowering the threshold or analyzing a different area
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="mt-0">
            <div className="space-y-4">
              <div className="relative bg-muted aspect-video rounded-lg overflow-hidden border">
                {/* Placeholder for layered view */}
                <img
                  src={imageSrc || "/placeholder.svg?height=400&width=600"}
                  alt="Satellite imagery"
                  className="w-full h-full object-cover"
                />

                {/* Layer controls */}
                <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border">
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium">Image Layers</h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Satellite className="h-3 w-3" />
                          <span>Satellite</span>
                        </div>
                        <Switch id="satellite-layer" defaultChecked size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          <span>LIDAR</span>
                        </div>
                        <Switch id="lidar-layer" defaultChecked size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <FileImage className="h-3 w-3" />
                          <span>Annotations</span>
                        </div>
                        <Switch id="annotations-layer" defaultChecked size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          <span>Heatmap</span>
                        </div>
                        <Switch id="heatmap-layer" size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Processing Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                          >
                            1
                          </Badge>
                          <span className="text-sm">Initial Image Processing</span>
                        </div>
                        <Badge>Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                          >
                            2
                          </Badge>
                          <span className="text-sm">YOLO8 Pattern Detection</span>
                        </div>
                        <Badge>Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                          >
                            3
                          </Badge>
                          <span className="text-sm">Waldo Fine-Grained Detection</span>
                        </div>
                        <Badge>Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                          >
                            4
                          </Badge>
                          <span className="text-sm">GPT-4 Vision Analysis</span>
                        </div>
                        <Badge>Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                          >
                            5
                          </Badge>
                          <span className="text-sm">Confidence Scoring</span>
                        </div>
                        <Badge>Complete</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Layer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium text-sm">Satellite Imagery</div>
                        <p className="text-xs text-muted-foreground">Sentinel-2, captured 2023-06-15</p>
                      </div>
                      <div>
                        <div className="font-medium text-sm">LIDAR Data</div>
                        <p className="text-xs text-muted-foreground">Earth Archive, 1m resolution, 2022 survey</p>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Processing Parameters</div>
                        <p className="text-xs text-muted-foreground">
                          NDVI threshold: 0.4, DEM resolution: 1m, Feature min size: 10m²
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">Original Image</div>
                <div className="relative bg-muted aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={imageSrc || "/placeholder.svg?height=300&width=500"}
                    alt="Original satellite image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-background/80 text-xs py-1 px-2 rounded">
                    Satellite Imagery
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm">Processed Image</div>
                <div className="relative bg-muted aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={imageSrc || "/placeholder.svg?height=300&width=500"}
                    alt="Processed image with detections"
                    className="w-full h-full object-cover"
                  />
                  {showBoundingBoxes &&
                    filteredDetections.map((detection) => (
                      <div
                        key={detection.id}
                        className="absolute border-2 border-primary"
                        style={{
                          left: `${detection.bounds.x / 1.5}px`,
                          top: `${detection.bounds.y / 1.5}px`,
                          width: `${detection.bounds.width / 1.5}px`,
                          height: `${detection.bounds.height / 1.5}px`,
                        }}
                      ></div>
                    ))}
                  <div className="absolute bottom-2 left-2 bg-background/80 text-xs py-1 px-2 rounded">
                    With Detections
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Model Comparison</CardTitle>
                <CardDescription>Detection performance across different vision models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">YOLO8</Badge>
                        <span className="text-sm">Object Detection</span>
                      </div>
                      <span className="text-sm font-medium">73% Overall Accuracy</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: "73%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Excellent at detecting geometric patterns and large-scale features.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Waldo</Badge>
                        <span className="text-sm">Fine-Grained Detection</span>
                      </div>
                      <span className="text-sm font-medium">82% Overall Accuracy</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Specialized in detecting subtle patterns and small features in complex terrain.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GPT-4 Vision</Badge>
                        <span className="text-sm">Contextual Analysis</span>
                      </div>
                      <span className="text-sm font-medium">91% Overall Accuracy</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "91%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Excels at contextual understanding and relating features to archaeological knowledge.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">Ensemble</Badge>
                        <span className="text-sm">Combined Models</span>
                      </div>
                      <span className="text-sm font-medium">94% Overall Accuracy</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "94%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Integration of all three models yields the highest accuracy and confidence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vision Agent Parameters</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                          YOLO8 Configuration
                        </h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Model Variant</span>
                            <span className="font-mono">yolov8x.pt</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence Threshold</span>
                            <span className="font-mono">0.25</span>
                          </div>
                          <div className="flex justify-between">
                            <span>IOU Threshold</span>
                            <span className="font-mono">0.45</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Custom Classes</span>
                            <span className="font-mono">8</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                          Waldo Configuration
                        </h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Model Type</span>
                            <span className="font-mono">ResNet50+FPN</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fine-tuning Epochs</span>
                            <span className="font-mono">20</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Min Feature Size</span>
                            <span className="font-mono">10m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reference Database</span>
                            <span className="font-mono">AmazSites-v2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">GPT-4 Vision Prompt</h4>
                      <div className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre-wrap">
                        {`You are analyzing satellite imagery and LIDAR data for archaeological sites in the Amazon.

Focus on:
1. Geometric shapes that are unlikely to be natural
2. Vegetation anomalies indicating buried structures
3. Linear features that could be ancient roads or canals

For each detected feature, provide:
- Feature type (settlement, ceremonial, agricultural)
- Confidence score (0-100)
- Brief description of archaeological significance
- Estimated time period based on pattern characteristics`}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                          Data Preprocessing Steps
                        </h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Atmospheric correction</li>
                          <li>Radiometric normalization</li>
                          <li>Terrain correction</li>
                          <li>Vegetation index calculation (NDVI)</li>
                          <li>Water index calculation (NDWI)</li>
                          <li>Image enhancement (contrast stretching)</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Post-processing</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Non-maximum suppression</li>
                          <li>Feature merging</li>
                          <li>False positive filtering</li>
                          <li>Contextual enhancement</li>
                          <li>Pattern correlation</li>
                          <li>Confidence scoring</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Model Execution Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 max-h-40 overflow-y-auto">
                  <div className="font-mono text-xs whitespace-pre">
                    {`[2023-09-15 14:23:12] INFO: Starting vision analysis for coordinates: -3.4567, -62.7890
[2023-09-15 14:23:13] INFO: Loading satellite imagery from Sentinel-2
[2023-09-15 14:23:15] INFO: Loading LIDAR data from Earth Archive
[2023-09-15 14:23:18] INFO: Preprocessing images (atm correction, normalization)
[2023-09-15 14:23:22] INFO: Calculating vegetation indices (NDVI, NDWI)
[2023-09-15 14:23:25] INFO: Initializing YOLO8 model with custom weights
[2023-09-15 14:23:27] INFO: YOLO8 detection running...
[2023-09-15 14:23:32] INFO: YOLO8 detected 6 potential features
[2023-09-15 14:23:33] INFO: Initializing Waldo fine-grained detection
[2023-09-15 14:23:38] INFO: Waldo detection running...
[2023-09-15 14:23:45] INFO: Waldo refined 4 features with higher confidence
[2023-09-15 14:23:46] INFO: Preparing GPT-4 Vision input
[2023-09-15 14:23:48] INFO: Sending to GPT-4 Vision API
[2023-09-15 14:23:57] INFO: Received response from GPT-4 Vision
[2023-09-15 14:23:58] INFO: Running ensemble confidence scoring
[2023-09-15 14:24:02] INFO: Post-processing and feature verification
[2023-09-15 14:24:05] INFO: Analysis complete: 4 archaeological features detected
[2023-09-15 14:24:06] INFO: Confidence scores: [0.91, 0.87, 0.72, 0.63]
[2023-09-15 14:24:07] INFO: Generating analysis report
[2023-09-15 14:24:08] INFO: Vision analysis complete`}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-between gap-4 border-t pt-6">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Models:</span> YOLO8 + Waldo + GPT-4 Vision
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Analysis</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
