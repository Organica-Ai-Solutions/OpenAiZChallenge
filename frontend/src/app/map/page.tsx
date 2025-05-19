"use client"

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Import interfaces
import { SiteData } from '../../types';

// Mock site data
const MOCK_SITES: SiteData[] = [
  {
    id: "site-001",
    name: "Kuhikugu",
    type: "Settlement",
    coordinates: "-12.2551, -53.2134",
    confidence: 95,
    description: "Ancient settlements at the headwaters of the Xingu River"
  },
  {
    id: "site-002",
    name: "Geoglyphs of Acre",
    type: "Geoglyph",
    coordinates: "-9.8282, -67.9452",
    confidence: 90,
    description: "Geometric earthworks discovered in western Amazon"
  },
  {
    id: "site-003",
    name: "Central Amazon Site",
    type: "Settlement",
    coordinates: "-3.4653, -62.2159",
    confidence: 75,
    description: "River bluff settlements with evidence of terra preta soils"
  }
];

// Dynamic import for the map component
const DynamicMapViewer = dynamic(
  () => import('../../components/DynamicMapViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p>Loading map explorer...</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null);
  const [coordinates, setCoordinates] = useState<string>("");

  // Handle site selection
  const handleSiteSelect = (site: SiteData) => {
    setSelectedSite(site);
    setCoordinates(site.coordinates);
  };

  // Handle coordinate selection
  const handleCoordinateSelect = (coords: string) => {
    setCoordinates(coords);
    // If coordinates don't match any site, clear selection
    if (selectedSite && selectedSite.coordinates !== coords) {
      setSelectedSite(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-4">
        <h1 className="text-xl font-bold">Archaeological Site Explorer</h1>
        {coordinates && (
          <p className="text-sm font-mono mt-2">
            Selected coordinates: {coordinates}
          </p>
        )}
      </div>
      
      <div className="h-[calc(100vh-120px)] p-4">
        <DynamicMapViewer
          sites={MOCK_SITES}
          selectedSite={selectedSite}
          onSiteSelect={handleSiteSelect}
          initialCoordinates={coordinates}
          onCoordinateSelect={handleCoordinateSelect}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
} 