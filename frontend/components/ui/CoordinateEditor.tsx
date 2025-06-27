"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Target } from "lucide-react"

interface CoordinateEditorProps {
  coordinates: string
  onCoordinatesChange: (coords: string) => void
  onLoadCoordinates: () => void
  isLoading?: boolean
}

export function CoordinateEditor({ 
  coordinates, 
  onCoordinatesChange, 
  onLoadCoordinates,
  isLoading = false 
}: CoordinateEditorProps) {
  const [tempCoords, setTempCoords] = useState(coordinates)
  const [isValid, setIsValid] = useState(true)

  const validateCoordinates = (coords: string) => {
    const parts = coords.split(',').map(s => s.trim())
    if (parts.length !== 2) return false
    
    const [lat, lng] = parts.map(s => parseFloat(s))
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180
  }

  const handleCoordChange = (value: string) => {
    setTempCoords(value)
    setIsValid(validateCoordinates(value))
  }

  const handleLoadClick = () => {
    if (isValid && tempCoords !== coordinates) {
      onCoordinatesChange(tempCoords)
      onLoadCoordinates()
    }
  }

  const hasChanges = tempCoords !== coordinates && isValid

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-400" />
          Coordinate Editor
          <Badge variant="outline" className={isValid ? "text-emerald-400 border-emerald-400" : "text-red-400 border-red-400"}>
            {isValid ? 'Valid' : 'Invalid'}
          </Badge>
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Modified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="coordinates" className="text-slate-300">
            Coordinates (Latitude, Longitude)
          </Label>
          <Input
            id="coordinates"
            value={tempCoords}
            onChange={(e) => handleCoordChange(e.target.value)}
            placeholder="5.1542, -73.7792"
            className={`bg-slate-900/50 border-slate-600 text-white ${
              !isValid ? 'border-red-500 focus:border-red-500' : 
              hasChanges ? 'border-yellow-500 focus:border-yellow-500' : ''
            }`}
          />
          {!isValid && (
            <p className="text-red-400 text-sm">
              Invalid coordinates. Use format: latitude, longitude
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleLoadClick}
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Target className="w-4 h-4" />
            {isLoading ? 'Loading...' : 'Load Coordinates'}
          </Button>
          
          {hasChanges && (
            <Button
              variant="outline"
              onClick={() => {
                setTempCoords(coordinates)
                setIsValid(true)
              }}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span>Current: {coordinates}</span>
          </div>
          <div>
            Examples: 5.1542, -73.7792 (Colombia) | -3.4653, -62.2159 (Amazon)
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 