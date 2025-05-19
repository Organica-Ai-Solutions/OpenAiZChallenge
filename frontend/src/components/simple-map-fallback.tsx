"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layers, MapPin, X } from "lucide-react"
import type { SiteData } from "@/types/site-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SimpleMapFallbackProps {
  onCoordinateSelect?: (coords: string) => void
  sites?: SiteData[]
  onSiteSelect?: (site: SiteData) => void
  selectedSite?: SiteData | null
  onClose?: () => void
}

export function SimpleMapFallback({
  onCoordinateSelect,
  sites = [],
  onSiteSelect,
  selectedSite,
  onClose,
}: SimpleMapFallbackProps) {
  const [activeTab, setActiveTab] = useState("vision")

  const handleCoordinateSelect = (coords: string) => {
    if (onCoordinateSelect) {
      onCoordinateSelect(coords)
    }
  }

  const handleSiteSelect = (site: SiteData) => {
    if (onSiteSelect) {
      onSiteSelect(site)
    }
  }

  // Predefined locations
  const predefinedLocations = [
    { name: "Central Amazon", coords: "-3.4653, -62.2159" },
    { name: "Xingu River", coords: "-12.2551, -53.2134" },
    { name: "Geoglyphs of Acre", coords: "-9.8282, -67.9452" },
    { name: "Llanos de Moxos", coords: "-14.0000, -65.5000" },
    { name: "Mythical El Dorado Region", coords: "-4.1265, -69.9387" },
  ]

  return (
    <Card className="bg-[#0B1120] border-gray-800 text-white">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <CardHeader>
        <CardTitle className="text-white">Interactive Map</CardTitle>
        <CardDescription className="text-gray-400">
          Select a location from the options below to analyze coordinates
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 rounded-lg p-1">
            <TabsTrigger 
              value="vision" 
              className="data-[state=active]:bg-gray-800 text-xs py-2"
            >
              Vision Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="satellite" 
              className="data-[state=active]:bg-gray-800 text-xs py-2"
            >
              Satellite/Terrain
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {activeTab === "vision" ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Select from common coordinates or enter your own:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {predefinedLocations.map((location) => (
                    <Button
                      key={location.name}
                      variant="outline"
                      className="flex items-center gap-3 p-4 bg-gray-900 border-gray-800 hover:bg-gray-800"
                      onClick={() => handleCoordinateSelect(location.coords)}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{location.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{location.coords}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter coordinates (lat, lng)"
                    className="flex-1 px-3 py-2 text-sm bg-gray-900 border-gray-800 rounded-md text-white placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCoordinateSelect(e.currentTarget.value)
                      }
                    }}
                  />
                  <Button variant="outline" size="icon" className="border-gray-800 bg-gray-900 hover:bg-gray-800">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  View satellite imagery and terrain data:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="bg-gray-900 border-gray-800 hover:bg-gray-800">
                    <Layers className="mr-2 h-4 w-4" />
                    Satellite View
                  </Button>
                  <Button variant="outline" className="bg-gray-900 border-gray-800 hover:bg-gray-800">
                    <Layers className="mr-2 h-4 w-4" />
                    Terrain View
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Having trouble with the map? Try simple mode or check your connection.
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default SimpleMapFallback 