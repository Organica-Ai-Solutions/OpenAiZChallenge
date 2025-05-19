"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from 'lucide-react';
import VisionAgentVisualization from "@/components/vision-agent-visualization";

export default function VisionAnalysisPage() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!latitude || !longitude) {
      alert('Please enter both latitude and longitude');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to your backend
      const mockResponse = {
        location: { lat: parseFloat(latitude), lon: parseFloat(longitude) },
        satellite_findings: {
          confidence: Math.random() * 0.8,
          features_detected: [
            { type: "Circular Structure", confidence: Math.random() * 0.9 },
            { type: "Linear Alignment", confidence: Math.random() * 0.7 }
          ]
        },
        lidar_findings: {
          confidence: Math.random() * 0.8,
          features_detected: [
            { type: "Artificial Mound", confidence: Math.random() * 0.9 },
            { type: "Terrain Modification", confidence: Math.random() * 0.6 }
          ]
        },
        combined_analysis: {
          confidence: Math.random() * 0.8,
          features_detected: [
            { type: "Potential Settlement", confidence: Math.random() * 0.9 },
            { type: "Archaeological Anomaly", confidence: Math.random() * 0.7 }
          ]
        }
      };

      setAnalysisData(mockResponse);
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Failed to perform analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <MapPin className="mr-2 text-primary" />
          Vision Agent Archaeological Analysis
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Input</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
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
            disabled={isLoading}
          >
            <Search className="mr-2" /> 
            {isLoading ? 'Analyzing...' : 'Analyze Location'}
          </Button>
        </CardContent>
      </Card>

      {analysisData && (
        <VisionAgentVisualization analysisData={analysisData} />
      )}
    </div>
  );
} 