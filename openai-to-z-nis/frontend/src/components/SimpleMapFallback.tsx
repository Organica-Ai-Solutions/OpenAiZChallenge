"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layers, MapPin } from "lucide-react"

interface SimpleMapFallbackProps {
  onCoordinateSelect?: (coords: string) => void
}

export default function SimpleMapFallback({ onCoordinateSelect }: SimpleMapFallbackProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const handleLocationSelect = (location: string, coords: string) => {
    setSelectedLocation(location)
    if (onCoordinateSelect) {
      onCoordinateSelect(coords)
    }
  }

  return (
    <div className="h-[400px] flex items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50 border border-muted rounded-lg">
      <div className="text-center p-4">
        <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Interactive Map</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          Select a location from the options below to analyze coordinates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            className="flex items-center justify-start gap-2"
            onClick={() => handleLocationSelect("Central Amazon", "-3.4653, -62.2159")}
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Central Amazon</div>
              <div className="text-xs text-muted-foreground font-mono">-3.4653, -62.2159</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-2"
            onClick={() => handleLocationSelect("Xingu River", "-12.2551, -53.2134")}
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Xingu River</div>
              <div className="text-xs text-muted-foreground font-mono">-12.2551, -53.2134</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-2"
            onClick={() => handleLocationSelect("Geoglyphs of Acre", "-9.8282, -67.9452")}
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Geoglyphs of Acre</div>
              <div className="text-xs text-muted-foreground font-mono">-9.8282, -67.9452</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-start gap-2"
            onClick={() => handleLocationSelect("Llanos de Moxos", "-14.0000, -65.5000")}
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Llanos de Moxos</div>
              <div className="text-xs text-muted-foreground font-mono">-14.0000, -65.5000</div>
            </div>
          </Button>
        </div>

        {selectedLocation && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg inline-block">
            <p className="text-sm font-medium text-emerald-800">Selected: {selectedLocation}</p>
            <p className="text-xs text-emerald-600">Click "Analyze This Location" to proceed</p>
          </div>
        )}
      </div>
    </div>
  )
}
