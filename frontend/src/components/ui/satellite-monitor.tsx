"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import { Progress } from "../../../components/ui/progress"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Slider } from "../../../components/ui/slider"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"
import {
  Satellite,
  AlertTriangle,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Activity,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Layers,
  Image,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe
} from "lucide-react"
import {
  satelliteService,
  SatelliteImagery,
  ChangeDetection,
  WeatherData,
  SoilData,
  SatelliteAlert
} from "../../lib/satellite"
import { alertEngine } from "../../lib/alert-engine"

interface MonitorState {
  activeImagery: SatelliteImagery[]
  changeDetections: ChangeDetection[]
  weatherData: WeatherData[]
  soilData: SoilData | null
  alerts: SatelliteAlert[]
  isLoading: boolean
  lastUpdate: Date | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function SatelliteMonitor() {
  const [state, setState] = useState<MonitorState>({
    activeImagery: [],
    changeDetections: [],
    weatherData: [],
    soilData: null,
    alerts: [],
    isLoading: false,
    lastUpdate: null
  })

  const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: -3.4653, lng: -62.2159 })
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all')
  const [changeDetectionEnabled, setChangeDetectionEnabled] = useState(true)
  const [weatherUpdateInterval, setWeatherUpdateInterval] = useState(30) // minutes

  const loadSatelliteData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const [imagery, changes, weather, soil] = await Promise.all([
        satelliteService.getLatestImagery(selectedCoordinates, 2000),
        satelliteService.detectChanges(selectedCoordinates, {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }),
        satelliteService.getWeatherData(selectedCoordinates, 30),
        satelliteService.getSoilData(selectedCoordinates)
      ])

      setState(prev => ({
        ...prev,
        activeImagery: imagery,
        changeDetections: changes,
        weatherData: weather,
        soilData: soil,
        isLoading: false,
        lastUpdate: new Date()
      }))

      // Feed data to alert engine for pattern detection
      alertEngine.updateData({
        imagery,
        changes,
        weather,
        soil: soil ? [soil] : []
      })
    } catch (error) {
      console.error('Failed to load satellite data:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [selectedCoordinates])

  useEffect(() => {
    loadSatelliteData()
  }, [loadSatelliteData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(loadSatelliteData, weatherUpdateInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, weatherUpdateInterval, loadSatelliteData])

  // Real-time alert subscription
  useEffect(() => {
    const unsubscribeAlerts = satelliteService.subscribeToAlerts((alert) => {
      setState(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts.slice(0, 49)] // Keep last 50 alerts
      }))
    })

    const unsubscribeChanges = satelliteService.subscribeToChangeDetection((change) => {
      if (changeDetectionEnabled) {
        setState(prev => ({
          ...prev,
          changeDetections: [change, ...prev.changeDetections.slice(0, 19)] // Keep last 20 changes
        }))
      }
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeChanges()
    }
  }, [changeDetectionEnabled])

  const filteredAlerts = state.alerts.filter(alert => 
    alertSeverityFilter === 'all' || alert.severity === alertSeverityFilter
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'vegetation': return <Droplets className="h-4 w-4 text-green-600" />
      case 'construction': return <Activity className="h-4 w-4 text-orange-600" />
      case 'erosion': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'archaeological': return <MapPin className="h-4 w-4 text-purple-600" />
      default: return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  const weatherTrend = state.weatherData.slice(0, 7).reverse().map(w => ({
    date: w.timestamp.toLocaleDateString(),
    temperature: w.temperature,
    humidity: w.humidity,
    precipitation: w.precipitation
  }))

  const soilComposition = state.soilData ? [
    { name: 'Sand', value: state.soilData.composition.sand },
    { name: 'Silt', value: state.soilData.composition.silt },
    { name: 'Clay', value: state.soilData.composition.clay },
    { name: 'Organic', value: state.soilData.composition.organicMatter }
  ] : []

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Satellite className="h-5 w-5" />
                <span>Satellite Monitoring System</span>
              </CardTitle>
              <CardDescription>
                Real-time satellite feeds, change detection, and environmental analysis
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto Update</Label>
              </div>
              <Button size="sm" onClick={loadSatelliteData} disabled={state.isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Coordinates</Label>
              <div className="text-sm font-mono">
                {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Update Interval</Label>
              <Select value={weatherUpdateInterval.toString()} onValueChange={(value) => setWeatherUpdateInterval(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Filter</Label>
              <Select value={alertSeverityFilter} onValueChange={setAlertSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Last Update</Label>
              <div className="text-sm text-gray-500">
                {state.lastUpdate ? state.lastUpdate.toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Images</p>
                <p className="text-2xl font-bold">{state.activeImagery.length}</p>
              </div>
              <Image className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <Satellite className="h-3 w-3" />
              <span>Latest: {state.activeImagery[0]?.timestamp.toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Changes Detected</p>
                <p className="text-2xl font-bold">{state.changeDetections.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>High confidence: {state.changeDetections.filter(c => c.confidence > 80).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{filteredAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <Zap className="h-3 w-3" />
              <span>Critical: {filteredAlerts.filter(a => a.severity === 'critical').length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Temp</p>
                <p className="text-2xl font-bold">
                  {state.weatherData[0]?.temperature.toFixed(1) || '--'}°C
                </p>
              </div>
              <Thermometer className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
              <Cloud className="h-3 w-3" />
              <span>Humidity: {state.weatherData[0]?.humidity.toFixed(0) || '--'}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="imagery" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="imagery">Satellite Imagery</TabsTrigger>
          <TabsTrigger value="changes">Change Detection</TabsTrigger>
          <TabsTrigger value="weather">Weather Analysis</TabsTrigger>
          <TabsTrigger value="soil">Soil Composition</TabsTrigger>
          <TabsTrigger value="alerts">Alert Center</TabsTrigger>
        </TabsList>

        <TabsContent value="imagery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="h-5 w-5" />
                <span>Recent Satellite Imagery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.activeImagery.map((image) => (
                  <Card key={image.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{image.source}</Badge>
                          <span className="text-xs text-gray-500">
                            {image.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div>Resolution: {image.resolution.toFixed(1)}m</div>
                          <div>Cloud Cover: {image.cloudCover.toFixed(0)}%</div>
                        </div>
                        <Button size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Change Detection Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.changeDetections.map((change) => (
                  <Card key={change.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getChangeTypeIcon(change.changeType)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium capitalize">{change.changeType} Change</h4>
                            <Badge className={`${change.confidence > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {change.confidence.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {change.area.lat.toFixed(4)}, {change.area.lng.toFixed(4)} • {change.area.radius}m radius
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Score: {change.changeScore.toFixed(1)}</span>
                            <span>Area: {(change.features.area_changed / 1000).toFixed(1)}k m²</span>
                            <span>Detected: {change.detectedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Weather Trends (7 days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature (°C)" />
                    <Line type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {state.weatherData[0] && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-sm text-gray-500">Temperature</div>
                        <div className="font-medium">{state.weatherData[0].temperature.toFixed(1)}°C</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm text-gray-500">Humidity</div>
                        <div className="font-medium">{state.weatherData[0].humidity.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Wind Speed</div>
                        <div className="font-medium">{state.weatherData[0].windSpeed.toFixed(1)} m/s</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Cloud Cover</div>
                        <div className="font-medium">{state.weatherData[0].cloudCover.toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="soil" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Soil Composition</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={soilComposition}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {soilComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Soil Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {state.soilData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">pH Level</div>
                        <div className="font-medium">{state.soilData.nutrients.ph.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Moisture</div>
                        <div className="font-medium">{state.soilData.moisture.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Temperature</div>
                        <div className="font-medium">{state.soilData.temperature.toFixed(1)}°C</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Drainage</div>
                        <div className="font-medium capitalize">{state.soilData.drainage}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Nutrients (mg/kg)</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-gray-500">Nitrogen</div>
                          <div className="font-medium">{state.soilData.nutrients.nitrogen.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Phosphorus</div>
                          <div className="font-medium">{state.soilData.nutrients.phosphorus.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Potassium</div>
                          <div className="font-medium">{state.soilData.nutrients.potassium.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No alerts for selected criteria</p>
                    </div>
                  ) : (
                    filteredAlerts.map((alert) => (
                      <Card key={alert.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <h4 className="font-medium">{alert.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{alert.coordinates.lat.toFixed(4)}, {alert.coordinates.lng.toFixed(4)}</span>
                              <span>Confidence: {alert.confidence.toFixed(1)}%</span>
                              <span>{alert.timestamp.toLocaleString()}</span>
                            </div>
                          </div>
                          {alert.actionRequired && (
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 