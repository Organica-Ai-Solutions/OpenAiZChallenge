"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, Search, Globe, Satellite, Database, Eye, Layers, Zap, 
  Brain, Activity, Settings, Download, Upload, RefreshCw, 
  Filter, BarChart3, Target, Clock, Wifi, WifiOff, 
  CheckCircle, AlertTriangle, Star, History, Camera,
  Play, Pause, RotateCcw, Maximize2, Save, Share2
} from 'lucide-react';
import PigeonMapViewer from "@/components/PigeonMapViewer";

export default function EnhancedVisionAnalysisPage() {
  // Core analysis states
  const [latitude, setLatitude] = useState('5.1542');
  const [longitude, setLongitude] = useState('-73.7792');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  
  // UI and display states
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState('analyze');
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  
  // Enhanced analysis states
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [analysisSettings, setAnalysisSettings] = useState({
    confidence_threshold: 65,
    enable_thermal: false,
    enable_multispectral: true,
    enable_lidar_fusion: true,
    analysis_depth: 'standard' as 'fast' | 'standard' | 'comprehensive',
    models_enabled: ['gpt4_vision', 'yolo8', 'waldo', 'archaeological_net']
  });
  
  // Performance and metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalAnalyses: 0,
    avgProcessingTime: 0,
    successRate: 0,
    highConfidenceFindings: 0
  });
  
  // Filter and search states
  const [filterSettings, setFilterSettings] = useState({
    confidence_min: 50,
    date_range: 'all',
    analysis_type: 'all',
    status: 'all'
  });

  // Load analysis history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vision-analysis-history');
    if (saved) {
      try {
        setAnalysisHistory(JSON.parse(saved));
      } catch (error) {
        console.log('Failed to load analysis history');
      }
    }
  }, []);

  // Save analysis to history
  const saveAnalysisToHistory = (analysis: any) => {
    const newHistory = [analysis, ...analysisHistory.slice(0, 9)]; // Keep last 10
    setAnalysisHistory(newHistory);
    localStorage.setItem('vision-analysis-history', JSON.stringify(newHistory));
  };

  const handleCoordinateSelect = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()));
    setLatitude(lat.toString());
    setLongitude(lng.toString());
  };

  const handleAnalyze = async () => {
    if (!latitude || !longitude) {
      alert('Please enter both latitude and longitude or select a location on the map');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Call the real NIS backend for OpenAI challenge
      const response = await fetch('http://localhost:8000/agents/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: `${latitude}, ${longitude}`
        }),
      });

      let analysisResult;
      if (response.ok) {
        analysisResult = await response.json();
        console.log('✅ Real backend analysis completed');
      } else {
        // Enhanced fallback mock data
        const processingTime = (Date.now() - startTime) / 1000;
        analysisResult = generateEnhancedMockAnalysis(parseFloat(latitude), parseFloat(longitude), processingTime);
        console.log('ℹ️ Using enhanced mock analysis');
      }

      // Add analysis metadata
      analysisResult.analysis_id = `analysis_${Date.now()}`;
      analysisResult.timestamp = new Date().toISOString();
      analysisResult.coordinates_analyzed = `${latitude}, ${longitude}`;

      setAnalysisData(analysisResult);
      saveAnalysisToHistory(analysisResult);
      
    } catch (error) {
      console.error('Analysis failed', error);
      
      // Fallback mock data for demo
      const processingTime = (Date.now() - startTime) / 1000;
      const mockResponse = {
        ...generateEnhancedMockAnalysis(parseFloat(latitude), parseFloat(longitude), processingTime),
        error: "Using demo data - backend unavailable",
        analysis_id: `demo_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      setAnalysisData(mockResponse);
      saveAnalysisToHistory(mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate more sophisticated mock analysis
  const generateEnhancedMockAnalysis = (lat: number, lng: number, processingTime: number) => {
    const baseConfidence = 0.65 + Math.random() * 0.25;
    const isAmazonRegion = lat >= -15 && lat <= 5 && lng >= -75 && lng <= -45;
    
    return {
      location: { lat, lon: lng },
      analysis_type: "comprehensive_archaeological",
      satellite_findings: {
        confidence: baseConfidence + (isAmazonRegion ? 0.1 : 0),
        features_detected: [
          { 
            type: "Circular Structure", 
            confidence: 0.89, 
            description: "Potential ceremonial site with 45m diameter",
            coordinates: `${lat + 0.001}, ${lng + 0.001}`,
            size_estimate: "~2000 sq meters"
          },
          { 
            type: "Linear Alignment", 
            confidence: 0.73, 
            description: "Ancient pathway or boundary extending 300m",
            coordinates: `${lat - 0.002}, ${lng + 0.003}`,
            orientation: "North-South"
          },
          { 
            type: "Soil Anomaly", 
            confidence: 0.67, 
            description: "Archaeological disturbance detected - possible terra preta",
            area_coverage: "~500 sq meters"
          }
        ]
      },
      combined_analysis: {
        confidence: baseConfidence + 0.1,
        site_classification: isAmazonRegion ? "Pre-Columbian Settlement" : "Historical Site",
        cultural_period: isAmazonRegion ? "1200-1500 CE" : "Unknown",
        features_detected: [
          { 
            type: "Potential Settlement Complex", 
            confidence: 0.87, 
            description: `High probability archaeological site with ${isAmazonRegion ? 'Amazonian' : 'regional'} characteristics`,
            significance: isAmazonRegion ? "Major ceremonial/residential center" : "Local settlement"
          }
        ]
      },
      recommendations: [
        "Conduct systematic ground-truth survey",
        "Acquire ultra-high resolution imagery (< 0.3m)",
        "Engage with local indigenous communities",
        "Plan non-invasive geophysical survey"
      ],
      metadata: {
        analysis_date: new Date().toISOString(),
        models_used: ["YOLOv8-Archaeological", "Waldo-TerrainAnalysis", "GPT-4 Vision"],
        processing_time: `${processingTime.toFixed(1)} seconds`,
        confidence_threshold: "65%",
        region_context: isAmazonRegion ? "Amazon Basin" : "Non-Amazon Region"
      }
    };
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Enhanced Vision Agent Analysis
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI-powered satellite imagery analysis with multi-model detection
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isBackendOnline ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Demo Mode
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Database className="h-3 w-3 mr-1" />
                    {analysisHistory.length} Analyses
                  </Badge>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Coordinate Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Coordinate Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input 
                  type="number" 
                  placeholder="Latitude" 
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  step="0.0001"
                />
                <Input 
                  type="number" 
                  placeholder="Longitude" 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  step="0.0001"
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isLoading || (!latitude || !longitude)}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Location
                    </>
                  )}
                </Button>
                
                {latitude && longitude && (
                  <div className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded">
                    📍 {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Recent Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {analysisHistory.slice(0, 5).map((analysis, index) => (
                    <div
                      key={analysis.analysis_id || index}
                      onClick={() => setSelectedAnalysis(analysis)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                        selectedAnalysis?.analysis_id === analysis.analysis_id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xs font-mono text-muted-foreground">
                        {analysis.coordinates_analyzed}
                      </div>
                      <div className="text-sm font-medium">
                        {analysis.combined_analysis?.site_classification || 'Archaeological Site'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </div>
                      <Badge 
                        variant={analysis.combined_analysis?.confidence > 0.8 ? "default" : "secondary"}
                        className="text-xs mt-1"
                      >
                        {Math.round((analysis.combined_analysis?.confidence || 0) * 100)}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Interactive Map */}
            {showMap && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Interactive Map Selection
                    <Badge variant="outline" className="ml-auto">
                      <Satellite className="w-3 h-3 mr-1" />
                      Click to Analyze
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] w-full">
                    <PigeonMapViewer
                      sites={[]}
                      onCoordinateSelect={handleCoordinateSelect}
                      initialCoordinates={[
                        latitude ? parseFloat(latitude) : -3.4653,
                        longitude ? parseFloat(longitude) : -62.2159
                      ]}
                      className="h-full w-full rounded-b-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {(analysisData || selectedAnalysis) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Simplified results display */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900">Location</h3>
                        <p className="text-sm text-blue-700 font-mono">
                          {(selectedAnalysis || analysisData).coordinates_analyzed}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-900">Confidence</h3>
                        <p className="text-lg font-bold text-green-700">
                          {Math.round(((selectedAnalysis || analysisData).combined_analysis?.confidence || 0) * 100)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-900">Classification</h3>
                        <p className="text-sm text-purple-700">
                          {(selectedAnalysis || analysisData).combined_analysis?.site_classification || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h3 className="font-semibold mb-2">Detected Features</h3>
                      <div className="space-y-2">
                        {((selectedAnalysis || analysisData).satellite_findings?.features_detected || []).map((feature: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{feature.type}</h4>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </div>
                              <Badge variant={feature.confidence > 0.8 ? "default" : "secondary"}>
                                {Math.round(feature.confidence * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {((selectedAnalysis || analysisData).recommendations || []).map((rec: string, index: number) => (
                          <li key={index} className="text-muted-foreground">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            {!analysisData && !selectedAnalysis && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                    <Eye className="h-8 w-8" />
                    <Layers className="h-6 w-6" />
                    <Satellite className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready for Archaeological Analysis</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Click anywhere on the map above or enter coordinates manually to begin AI-powered 
                    archaeological site analysis using satellite imagery and LiDAR data.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
} 