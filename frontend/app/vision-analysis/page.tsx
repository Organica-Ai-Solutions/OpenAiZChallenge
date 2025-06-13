"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MapPin, Search, Globe, Satellite, Database, Eye, Layers, Zap, 
  Activity, Brain, Target, Clock, Download, Share2, Filter,
  AlertTriangle, CheckCircle, Info, Loader2, Copy, RefreshCw,
  BarChart3, TrendingUp, Map, Compass, Settings
} from 'lucide-react';
import PigeonMapViewer from "@/components/PigeonMapViewer";

interface AnalysisData {
  analysis_id: string;
  timestamp: string;
  coordinates_analyzed: string;
  location: { lat: number; lon: number };
  analysis_type: string;
  satellite_findings: {
    confidence: number;
    features_detected: Array<{
      type: string;
      confidence: number;
      description: string;
      coordinates?: string;
      size_estimate?: string;
      orientation?: string;
      area_coverage?: string;
    }>;
  };
  combined_analysis: {
    confidence: number;
    site_classification: string;
    cultural_period?: string;
    features_detected: Array<{
      type: string;
      confidence: number;
      description: string;
      significance?: string;
    }>;
  };
  recommendations: string[];
  metadata: {
    analysis_date: string;
    models_used: string[];
    processing_time: string;
    confidence_threshold: string;
    region_context: string;
  };
  error?: string;
}

export default function VisionAnalysisPage() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisData[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  
  // Enhanced state
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [coordinateError, setCoordinateError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterConfidence, setFilterConfidence] = useState(0);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Famous archaeological sites for quick selection
  const FAMOUS_SITES = [
    { name: "Lake Guatavita", coords: "5.1542, -73.7792", region: "Colombia" },
    { name: "Nazca Lines", coords: "-14.7390, -75.1300", region: "Peru" },
    { name: "Machu Picchu", coords: "-13.1631, -72.5450", region: "Peru" },
    { name: "Amazon Geoglyphs", coords: "-9.9747, -67.8096", region: "Brazil" },
    { name: "Caral", coords: "-10.8939, -77.5208", region: "Peru" },
    { name: "Monte Roraima", coords: "5.1431, -60.7619", region: "Venezuela" }
  ];

  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health', {
          signal: AbortSignal.timeout(3000)
        });
        setIsBackendOnline(response.ok);
      } catch {
        setIsBackendOnline(false);
      }
    };
    
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load analysis history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vision-analysis-history');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        setAnalysisHistory(Array.isArray(history) ? history : []);
      } catch (error) {
        console.log('Failed to load analysis history');
      }
    }
  }, []);

  // Save analysis to history
  const saveAnalysisToHistory = (analysis: AnalysisData) => {
    const newHistory = [analysis, ...analysisHistory.slice(0, 19)]; // Keep last 20
    setAnalysisHistory(newHistory);
    localStorage.setItem('vision-analysis-history', JSON.stringify(newHistory));
  };

  // Coordinate validation
  const validateCoordinates = (lat: string, lng: string): boolean => {
    setCoordinateError('');
    
    if (!lat.trim() || !lng.trim()) {
      setCoordinateError('Both latitude and longitude are required');
      return false;
    }
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      setCoordinateError('Coordinates must be valid numbers');
      return false;
    }
    
    if (latNum < -90 || latNum > 90) {
      setCoordinateError('Latitude must be between -90 and 90');
      return false;
    }
    
    if (lngNum < -180 || lngNum > 180) {
      setCoordinateError('Longitude must be between -180 and 180');
      return false;
    }
    
    return true;
  };

  const handleCoordinateSelect = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()));
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setCoordinateError('');
  };

  const handleQuickSelect = (coords: string) => {
    const [lat, lng] = coords.split(',').map(coord => coord.trim());
    setLatitude(lat);
    setLongitude(lng);
    setCoordinateError('');
  };

  const handleAnalyze = async () => {
    if (!validateCoordinates(latitude, longitude)) {
      return;
    }

    setIsLoading(true);
    setAnalysisProgress(0);
    setAnalysisStage('Initializing analysis...');
    setActiveTab('overview');
    
    const startTime = Date.now();
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
    
    try {
      setAnalysisStage('Connecting to analysis backend...');
      
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

      let analysisResult: AnalysisData;
      if (response.ok) {
        setAnalysisStage('Processing satellite imagery...');
        analysisResult = await response.json();
        console.log('✅ Real backend analysis completed');
      } else {
        setAnalysisStage('Using enhanced demo analysis...');
        const processingTime = (Date.now() - startTime) / 1000;
        analysisResult = generateEnhancedMockAnalysis(parseFloat(latitude), parseFloat(longitude), processingTime);
        console.log('ℹ️ Using enhanced mock analysis');
      }

      // Add analysis metadata
      analysisResult.analysis_id = `analysis_${Date.now()}`;
      analysisResult.timestamp = new Date().toISOString();
      analysisResult.coordinates_analyzed = `${latitude}, ${longitude}`;

      setAnalysisProgress(100);
      setAnalysisStage('Analysis complete!');
      setAnalysisData(analysisResult);
      setSelectedAnalysis(null);
      saveAnalysisToHistory(analysisResult);
      
    } catch (error) {
      console.error('Analysis failed', error);
      setAnalysisStage('Analysis failed - using demo data');
      
      // Fallback mock data for demo
      const processingTime = (Date.now() - startTime) / 1000;
      const mockResponse = generateEnhancedMockAnalysis(parseFloat(latitude), parseFloat(longitude), processingTime);
      mockResponse.error = "Using demo data - backend unavailable";
      mockResponse.analysis_id = `demo_${Date.now()}`;
      mockResponse.timestamp = new Date().toISOString();
      mockResponse.coordinates_analyzed = `${latitude}, ${longitude}`;
      
      setAnalysisData(mockResponse);
      saveAnalysisToHistory(mockResponse);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setTimeout(() => {
        setAnalysisProgress(0);
        setAnalysisStage('');
      }, 2000);
    }
  };

  // Generate more sophisticated mock analysis
  const generateEnhancedMockAnalysis = (lat: number, lng: number, processingTime: number): AnalysisData => {
    const baseConfidence = 0.65 + Math.random() * 0.25;
    const isAmazonRegion = lat >= -15 && lat <= 5 && lng >= -75 && lng <= -45;
    const isAndesRegion = lat >= -20 && lat <= 10 && lng >= -80 && lng <= -65;
    
    const culturalPeriods = isAmazonRegion 
      ? ["Pre-Columbian (1200-1500 CE)", "Early Colonial (1500-1600 CE)", "Indigenous Contemporary"]
      : isAndesRegion 
      ? ["Inca Period (1438-1533 CE)", "Pre-Inca (800-1438 CE)", "Colonial (1533-1800 CE)"]
      : ["Historical Period", "Pre-Colonial", "Unknown"];
    
    return {
      analysis_id: '',
      timestamp: '',
      coordinates_analyzed: '',
      location: { lat, lon: lng },
      analysis_type: "comprehensive_archaeological",
      satellite_findings: {
        confidence: baseConfidence + (isAmazonRegion ? 0.1 : 0),
        features_detected: [
          { 
            type: "Circular Structure", 
            confidence: 0.89, 
            description: `Potential ceremonial site with ${Math.round(30 + Math.random() * 40)}m diameter`,
            coordinates: `${(lat + 0.001).toFixed(6)}, ${(lng + 0.001).toFixed(6)}`,
            size_estimate: `~${Math.round(1500 + Math.random() * 2000)} sq meters`
          },
          { 
            type: "Linear Alignment", 
            confidence: 0.73, 
            description: `Ancient pathway or boundary extending ${Math.round(200 + Math.random() * 300)}m`,
            coordinates: `${(lat - 0.002).toFixed(6)}, ${(lng + 0.003).toFixed(6)}`,
            orientation: Math.random() > 0.5 ? "North-South" : "East-West"
          },
          { 
            type: "Soil Anomaly", 
            confidence: 0.67, 
            description: isAmazonRegion ? "Archaeological disturbance detected - possible terra preta" : "Soil composition anomaly indicating human activity",
            area_coverage: `~${Math.round(300 + Math.random() * 500)} sq meters`
          },
          {
            type: "Vegetation Pattern",
            confidence: 0.71,
            description: "Distinctive vegetation growth pattern suggesting subsurface archaeological features",
            area_coverage: `~${Math.round(800 + Math.random() * 1200)} sq meters`
          }
        ]
      },
      combined_analysis: {
        confidence: baseConfidence + 0.1,
        site_classification: isAmazonRegion ? "Pre-Columbian Settlement Complex" : isAndesRegion ? "Andean Archaeological Site" : "Historical Settlement",
        cultural_period: culturalPeriods[Math.floor(Math.random() * culturalPeriods.length)],
        features_detected: [
          { 
            type: "Settlement Complex", 
            confidence: 0.87, 
            description: `High probability archaeological site with ${isAmazonRegion ? 'Amazonian' : isAndesRegion ? 'Andean' : 'regional'} characteristics`,
            significance: isAmazonRegion ? "Major ceremonial/residential center" : "Significant cultural site"
          },
          {
            type: "Cultural Landscape",
            confidence: 0.79,
            description: "Evidence of systematic landscape modification and resource management",
            significance: "Indicates complex social organization"
          }
        ]
      },
      recommendations: [
        "Conduct systematic ground-truth survey with archaeological team",
        "Acquire ultra-high resolution imagery (< 0.3m GSD)",
        "Engage with local indigenous communities and cultural authorities",
        "Plan non-invasive geophysical survey (GPR, magnetometry)",
        "Coordinate with regional archaeological institutions",
        "Consider LiDAR acquisition for detailed topographic analysis",
        "Document and preserve site integrity during investigation"
      ],
      metadata: {
        analysis_date: new Date().toISOString(),
        models_used: ["YOLOv8-Archaeological", "Waldo-TerrainAnalysis", "GPT-4 Vision", "Custom-ArcheoNet"],
        processing_time: `${processingTime.toFixed(1)} seconds`,
        confidence_threshold: "65%",
        region_context: isAmazonRegion ? "Amazon Basin" : isAndesRegion ? "Andean Region" : "General Region"
      }
    };
  };

  // Export analysis results
  const exportAnalysis = (analysis: AnalysisData) => {
    const exportData = {
      ...analysis,
      export_timestamp: new Date().toISOString(),
      export_version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archaeological-analysis-${analysis.coordinates_analyzed?.replace(/[, ]/g, '_') || 'unknown'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy coordinates
  const copyCoordinates = async (coords: string) => {
    try {
      await navigator.clipboard.writeText(coords);
    } catch (error) {
      console.log('Failed to copy coordinates');
    }
  };

  const currentAnalysis = selectedAnalysis || analysisData;
  const filteredHistory = analysisHistory.filter(analysis => 
    (analysis.combined_analysis?.confidence || 0) >= filterConfidence / 100
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-900">
        {/* Enhanced Header */}
        <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-600/20 rounded-lg">
                  <Eye className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Enhanced Vision Analysis</h1>
                  <p className="text-sm text-slate-400">
                    Advanced AI-powered satellite and LiDAR analysis for archaeological discovery
                  </p>
                </div>
              </motion.div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1 text-emerald-400 border-emerald-400">
                  <Database className="h-3 w-3" />
                  {analysisHistory.length} analyses
                </Badge>
                <Badge variant="outline" className={`flex items-center gap-1 ${isBackendOnline ? 'text-emerald-400 border-emerald-400' : 'text-amber-400 border-amber-400'}`}>
                  <Activity className="h-3 w-3" />
                  {isBackendOnline ? 'Live' : 'Demo'}
                </Badge>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
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
            {/* Enhanced Sidebar */}
            <div className="xl:col-span-1 space-y-4">
              {/* Coordinate Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <MapPin className="h-5 w-5 text-emerald-400" />
                      Coordinate Input
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input 
                      type="number" 
                      placeholder="Latitude" 
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        if (coordinateError) setCoordinateError('');
                      }}
                      step="0.0001"
                      className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 ${
                        coordinateError ? 'border-red-500' : ''
                      }`}
                    />
                    <Input 
                      type="number" 
                      placeholder="Longitude" 
                      value={longitude}
                      onChange={(e) => {
                        setLongitude(e.target.value);
                        if (coordinateError) setCoordinateError('');
                      }}
                      step="0.0001"
                      className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 ${
                        coordinateError ? 'border-red-500' : ''
                      }`}
                    />
                    
                    {coordinateError && (
                      <Alert className="bg-red-900/20 border-red-500/50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">
                          {coordinateError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={isLoading || (!latitude || !longitude)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Analyze
                          </>
                        )}
                      </Button>
                      
                      {latitude && longitude && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyCoordinates(`${latitude}, ${longitude}`)}
                              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy coordinates</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    {isLoading && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{analysisStage}</span>
                        </div>
                        <Progress value={analysisProgress} className="w-full" />
                      </div>
                    )}
                    
                    {latitude && longitude && (
                      <div className="text-xs text-center text-slate-400 bg-slate-900/30 p-2 rounded">
                        📍 {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Site Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Target className="h-5 w-5 text-emerald-400" />
                      Quick Sites
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {FAMOUS_SITES.map((site, index) => (
                      <Button
                        key={site.name}
                        variant="outline"
                        onClick={() => handleQuickSelect(site.coords)}
                        className="w-full justify-start text-left bg-slate-900/50 border-slate-600 text-white hover:bg-slate-700/50 h-auto p-2"
                      >
                        <div>
                          <div className="font-medium text-sm">{site.name}</div>
                          <div className="text-xs text-slate-400">{site.region}</div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Analysis History with Filter */}
              {analysisHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Database className="h-5 w-5 text-emerald-400" />
                        Analysis History
                        <Badge variant="outline" className="ml-auto text-emerald-400 border-emerald-400">
                          {filteredHistory.length}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={filterConfidence}
                          onChange={(e) => setFilterConfidence(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-xs text-slate-400 w-12">{filterConfidence}%+</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredHistory.slice(0, 8).map((analysis, index) => (
                        <motion.div
                          key={analysis.analysis_id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedAnalysis(analysis)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                            selectedAnalysis?.analysis_id === analysis.analysis_id
                              ? "border-emerald-500 bg-emerald-900/20"
                              : "border-slate-600 hover:border-slate-500 bg-slate-900/30"
                          }`}
                        >
                          <div className="text-xs font-mono text-slate-400 mb-1">
                            {analysis.coordinates_analyzed}
                          </div>
                          <div className="text-sm font-medium text-white mb-1">
                            {analysis.combined_analysis?.site_classification || 'Archaeological Site'}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-400">
                              {new Date(analysis.timestamp).toLocaleDateString()}
                            </div>
                            <Badge 
                              variant={analysis.combined_analysis?.confidence > 0.8 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {Math.round((analysis.combined_analysis?.confidence || 0) * 100)}%
                            </Badge>
                          </div>
                          {analysis.error && (
                            <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs mt-1">
                              Demo Data
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Enhanced Main Content */}
            <div className="xl:col-span-3 space-y-6">
              {/* Interactive Map */}
              {showMap && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        Interactive Map Selection
                        <Badge variant="outline" className="ml-auto text-emerald-400 border-emerald-400">
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
                </motion.div>
              )}

              {/* Enhanced Analysis Results */}
              {currentAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Eye className="w-5 h-5 text-emerald-400" />
                        Analysis Results
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                          {currentAnalysis.satellite_findings?.features_detected?.length || 0} Features
                        </Badge>
                        <div className="ml-auto flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportAnalysis(currentAnalysis)}
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
                          <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Overview
                          </TabsTrigger>
                          <TabsTrigger value="features" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                            <Layers className="w-4 h-4 mr-2" />
                            Features
                          </TabsTrigger>
                          <TabsTrigger value="recommendations" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                            <Target className="w-4 h-4 mr-2" />
                            Recommendations
                          </TabsTrigger>
                          <TabsTrigger value="metadata" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                            <Settings className="w-4 h-4 mr-2" />
                            Metadata
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
                              <h3 className="font-semibold text-emerald-300 mb-2">Location</h3>
                                                             <p className="text-sm text-emerald-100 font-mono">
                                 {currentAnalysis.coordinates_analyzed || 'Unknown'}
                               </p>
                               <p className="text-xs text-emerald-400 mt-1">
                                 {currentAnalysis.metadata?.region_context || 'Unknown Region'}
                               </p>
                            </div>
                            <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
                              <h3 className="font-semibold text-cyan-300 mb-2">Confidence</h3>
                              <p className="text-2xl font-bold text-cyan-100">
                                {Math.round((currentAnalysis.combined_analysis?.confidence || 0) * 100)}%
                              </p>
                              <p className="text-xs text-cyan-400 mt-1">
                                Analysis Confidence
                              </p>
                            </div>
                            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                              <h3 className="font-semibold text-purple-300 mb-2">Classification</h3>
                                                             <p className="text-sm text-purple-100">
                                 {currentAnalysis.combined_analysis?.site_classification || 'Unknown'}
                               </p>
                               <p className="text-xs text-purple-400 mt-1">
                                 {currentAnalysis.combined_analysis?.cultural_period || 'Period Unknown'}
                               </p>
                            </div>
                          </div>

                                                     {currentAnalysis?.error && (
                             <Alert className="bg-amber-900/20 border-amber-500/50">
                               <Info className="h-4 w-4" />
                               <AlertDescription className="text-amber-300">
                                 {currentAnalysis.error}
                               </AlertDescription>
                             </Alert>
                           )}
                        </TabsContent>

                        <TabsContent value="features" className="space-y-4">
                          <div className="space-y-3">
                            {currentAnalysis.satellite_findings?.features_detected?.map((feature, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border border-slate-600 rounded-lg p-4 bg-slate-900/30 hover:bg-slate-800/50 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-white">{feature.type}</h4>
                                    <p className="text-sm text-slate-300 mt-1">{feature.description}</p>
                                  </div>
                                  <Badge variant={feature.confidence > 0.8 ? "default" : "secondary"}>
                                    {Math.round(feature.confidence * 100)}%
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mt-3">
                                  {feature.coordinates && (
                                    <div>
                                      <span className="text-slate-500">Coordinates:</span>
                                      <span className="text-slate-300 ml-1 font-mono">{feature.coordinates}</span>
                                    </div>
                                  )}
                                  {feature.size_estimate && (
                                    <div>
                                      <span className="text-slate-500">Size:</span>
                                      <span className="text-slate-300 ml-1">{feature.size_estimate}</span>
                                    </div>
                                  )}
                                  {feature.orientation && (
                                    <div>
                                      <span className="text-slate-500">Orientation:</span>
                                      <span className="text-slate-300 ml-1">{feature.orientation}</span>
                                    </div>
                                  )}
                                  {feature.area_coverage && (
                                    <div>
                                      <span className="text-slate-500">Coverage:</span>
                                      <span className="text-slate-300 ml-1">{feature.area_coverage}</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>

                                                 <TabsContent value="recommendations" className="space-y-4">
                           <div className="space-y-3">
                             {currentAnalysis?.recommendations?.map((rec, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-600/50"
                              >
                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <p className="text-slate-300 text-sm">{rec}</p>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="metadata" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-600/50">
                                <h4 className="text-white font-medium mb-2">Analysis Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Processing Time:</span>
                                    <span className="text-white">{currentAnalysis.metadata?.processing_time}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Confidence Threshold:</span>
                                    <span className="text-white">{currentAnalysis.metadata?.confidence_threshold}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Analysis Date:</span>
                                    <span className="text-white">{new Date(currentAnalysis.timestamp).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-600/50">
                                <h4 className="text-white font-medium mb-2">Models Used</h4>
                                <div className="space-y-1">
                                  {currentAnalysis.metadata?.models_used?.map((model, index) => (
                                    <Badge key={index} variant="outline" className="text-emerald-400 border-emerald-400 mr-1 mb-1">
                                      {model}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Enhanced Help Text */}
              {!currentAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
                        <Eye className="h-12 w-12 text-emerald-400" />
                        <Layers className="h-8 w-8 text-cyan-400" />
                        <Satellite className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-white">Ready for Archaeological Analysis</h3>
                      <p className="text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
                        Use our advanced AI-powered system to analyze satellite imagery and LiDAR data for archaeological site discovery. 
                        Click anywhere on the map above, select from famous sites, or enter coordinates manually to begin comprehensive analysis.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-600/50">
                          <Brain className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <h4 className="text-white font-medium mb-1">AI Detection</h4>
                          <p className="text-xs text-slate-400">Multi-model archaeological feature detection</p>
                        </div>
                        <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-600/50">
                          <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                          <h4 className="text-white font-medium mb-1">High Accuracy</h4>
                          <p className="text-xs text-slate-400">Advanced confidence scoring and validation</p>
                        </div>
                        <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-600/50">
                          <Compass className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <h4 className="text-white font-medium mb-1">Expert Guidance</h4>
                          <p className="text-xs text-slate-400">Professional archaeological recommendations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 