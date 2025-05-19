"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface LocationSelectorProps {
  onSelect: (coordinates: string) => void
  onClose: () => void
}

export function LocationSelector({ onSelect, onClose }: LocationSelectorProps) {
  const [coordinates, setCoordinates] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSelect = () => {
    // Basic coordinate validation
    const coordRegex = /^-?\d+(\.\d+)?[\s,]+-?\d+(\.\d+)?$/
    if (!coordRegex.test(coordinates)) {
      setError("Invalid coordinates. Use format: 'lat, lon' (e.g., -3.4567, -62.789)")
      return
    }

    const [lat, lon] = coordinates.split(/[\s,]+/).map(coord => parseFloat(coord.trim()))
    
    if (isNaN(lat) || isNaN(lon)) {
      setError("Invalid coordinate values")
      return
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError("Coordinates out of valid range")
      return
    }

    onSelect(coordinates)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Enter Coordinates</h2>
        <div className="space-y-4">
          <Input 
            placeholder="Enter latitude, longitude (e.g., -3.4567, -62.789)" 
            value={coordinates}
            onChange={(e) => {
              setCoordinates(e.target.value)
              setError(null)
            }}
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              onClick={handleSelect}
              disabled={!coordinates}
            >
              Select Location
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 