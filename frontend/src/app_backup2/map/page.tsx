"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Satellite, Database, Globe, Filter, Layers, Search, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Import enhanced map component
import PigeonMapViewer from '../../components/PigeonMapViewer';
import EnvTest from '../../../components/EnvTest';

// Import interfaces
import type { SiteData } from '../../types/site-data';

// Enhanced mock site data with more archaeological details
const ENHANCED_MOCK_SITES: SiteData[] = [
  {
    id: "site-001",
    name: "Kuhikugu",
    type: "Settlement",
    coordinates: "-12.2551, -53.2134",
    confidence: 0.95,
    description: "Ancient settlements at the headwaters of the Xingu River with evidence of complex urban planning",
    metadata: {
      archaeological_period: "Pre-Columbian (1200-1500 CE)",
      settlement_type: "Urban Complex",
      population_estimate: "2,000-5,000",
      cultural_significance: "Major ceremonial and administrative center"
    }
  },
  {
    id: "site-002", 
    name: "Geoglyphs of Acre",
    type: "Geoglyph",
    coordinates: "-9.8282, -67.9452",
    confidence: 0.90,
    description: "Geometric earthworks discovered in western Amazon showing sophisticated landscape management",
    metadata: {
      archaeological_period: "Pre-Columbian (1000-1500 CE)", 
      settlement_type: "Ceremonial Complex",
      population_estimate: "500-1,500",
      cultural_significance: "Sacred landscape and astronomical alignments"
    }
  },
  {
    id: "site-003",
    name: "Central Amazon Site",
    type: "Settlement", 
    coordinates: "-3.4653, -62.2159",
    confidence: 0.75,
    description: "River bluff settlements with evidence of terra preta soils and sustainable agriculture",
    metadata: {
      archaeological_period: "Pre-Columbian (800-1400 CE)",
      settlement_type: "Agricultural Village",
      population_estimate: "200-800", 
      cultural_significance: "Advanced soil management techniques"
    }
  },
  {
    id: "site-004",
    name: "Llanos de Moxos",
    type: "Hydraulic System",
    coordinates: "-14.0000, -65.5000", 
    confidence: 0.88,
    description: "Pre-Columbian hydraulic culture with raised fields and fish weirs",
    metadata: {
      archaeological_period: "Pre-Columbian (300-1400 CE)",
      settlement_type: "Hydraulic Complex",
      population_estimate: "10,000-20,000",
      cultural_significance: "Sophisticated water management and agriculture"
    }
  }
];

export default function MapPage() {
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null);
  const [coordinates, setCoordinates] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [backendSites, setBackendSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real archaeological sites from backend
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("http://localhost:8000/research/sites");
        if (response.ok) {
          const sites = await response.json();
          setBackendSites(sites);
          console.log("✅ Loaded real archaeological sites:", sites);
        }
      } catch (error) {
        console.log("ℹ️ Backend unavailable, using enhanced mock data");
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Combine backend and mock sites
  const allSites = [...backendSites, ...ENHANCED_MOCK_SITES];

  // Filter sites based on search and type
  const filteredSites = allSites.filter(site => {
    const matchesSearch = !searchTerm || 
      site.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || site.type?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Handle site selection
  const handleSiteSelect = (site: SiteData) => {
    setSelectedSite(site);
    setCoordinates(site.coordinates);
  };

  // Handle coordinate selection from map
  const handleCoordinateSelect = (coords: string) => {
    setCoordinates(coords);
    // If coordinates don't match any site, clear selection
    if (selectedSite && selectedSite.coordinates !== coords) {
      setSelectedSite(null);
    }
  };

  // Get unique site types for filter
  const siteTypes = ["all", ...new Set(allSites.map(site => site.type).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading Archaeological Site Explorer</h2>
          <p className="text-muted-foreground">Initializing map and site data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Archaeological Site Explorer</h1>
                <p className="text-sm text-muted-foreground">
                  Discover and analyze ancient sites across the Amazon Basin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>{backendSites.length} real sites</span>
              <Separator orientation="vertical" className="h-4" />
              <Layers className="h-4 w-4" />  
              <span>{ENHANCED_MOCK_SITES.length} reference sites</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Input
                    placeholder="Search sites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {siteTypes.map(type => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Site List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sites ({filteredSites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredSites.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => handleSiteSelect(site)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedSite?.id === site.id 
                        ? "border-emerald-500 bg-emerald-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{site.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {site.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {site.type}
                          </Badge>
                          <Badge 
                            variant={site.confidence && site.confidence > 0.8 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {Math.round((site.confidence || 0) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Site Details */}
            {selectedSite && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Site Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{selectedSite.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSite.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{selectedSite.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Confidence:</span>
                      <span>{Math.round((selectedSite.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Coordinates:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {selectedSite.coordinates}
                      </code>
                    </div>
                  </div>

                  {selectedSite.metadata && (
                    <div className="pt-2 border-t space-y-2 text-sm">
                      {selectedSite.metadata.archaeological_period && (
                        <div>
                          <span className="font-medium">Period:</span>
                          <p className="text-muted-foreground">{selectedSite.metadata.archaeological_period}</p>
                        </div>
                      )}
                      {selectedSite.metadata.settlement_type && (
                        <div>
                          <span className="font-medium">Settlement:</span>
                          <p className="text-muted-foreground">{selectedSite.metadata.settlement_type}</p>
                        </div>
                      )}
                      {selectedSite.metadata.population_estimate && (
                        <div>
                          <span className="font-medium">Population:</span>
                          <p className="text-muted-foreground">{selectedSite.metadata.population_estimate}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Area */}
          <div className="xl:col-span-3">
            <Card className="h-[700px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Interactive Archaeological Map
                  {coordinates && (
                    <Badge variant="outline" className="ml-auto">
                      📍 {coordinates}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <PigeonMapViewer
                  sites={filteredSites}
                  selectedSite={selectedSite}
                  onSiteSelect={handleSiteSelect}
                  onCoordinateSelect={handleCoordinateSelect}
                  initialCoordinates={
                    selectedSite 
                      ? selectedSite.coordinates.split(',').map(parseFloat) as [number, number]
                      : [-3.4653, -62.2159]
                  }
                  className="h-full rounded-b-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 