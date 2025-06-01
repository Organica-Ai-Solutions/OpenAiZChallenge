"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Progress } from "../../../components/ui/progress"
import { ScrollArea } from "../../../components/ui/scroll-area"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Wifi,
  Database,
  Satellite
} from "lucide-react"
import { satelliteHealthChecker, HealthStatus } from "../../lib/satellite-health"

export function HealthStatusMonitor() {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const runHealthCheck = async () => {
    setIsChecking(true)
    try {
      const statuses = await satelliteHealthChecker.checkSystemHealth()
      setHealthStatuses(statuses)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Run initial health check
    runHealthCheck()

    // Set up periodic health checks every 5 minutes
    const interval = setInterval(runHealthCheck, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'Satellite Service':
        return <Satellite className="h-4 w-4" />
      case 'Alert Engine':
        return <Activity className="h-4 w-4" />
      case 'WebSocket Connection':
        return <Wifi className="h-4 w-4" />
      case 'Data Generation':
        return <Database className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const overallHealth = satelliteHealthChecker.getOverallHealth()
  const healthyCount = healthStatuses.filter(s => s.status === 'healthy').length
  const totalCount = healthStatuses.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(overallHealth)}
              <span>System Health Status</span>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of satellite system components
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(overallHealth)}>
              {overallHealth.toUpperCase()}
            </Badge>
            <Button 
              size="sm" 
              onClick={runHealthCheck} 
              disabled={isChecking}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Check
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>System Health</span>
              <span>{healthyCount}/{totalCount} components healthy</span>
            </div>
            <Progress 
              value={totalCount > 0 ? (healthyCount / totalCount) * 100 : 0} 
              className="h-2"
            />
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-xs text-gray-500">
              Last checked: {lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Component Status List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {healthStatuses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No health data available</p>
                  <p className="text-xs">Click "Check" to run diagnostics</p>
                </div>
              ) : (
                healthStatuses.map((status) => (
                  <Card key={status.component} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getComponentIcon(status.component)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm">{status.component}</h4>
                            <Badge className={getStatusColor(status.status)}>
                              {status.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{status.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {status.lastCheck.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {getStatusIcon(status.status)}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
} 