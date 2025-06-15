"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Network, 
  Database, 
  Cloud, 
  Server, 
  Wifi, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap,
  Settings,
  RefreshCw,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Globe,
  Shield,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Link,
  Unlink,
  Upload,
  Download,
  Sync,
  GitBranch,
  Layers,
  Box,
  Cpu,
  MemoryStick
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'api' | 'database' | 'service' | 'storage' | 'analytics'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  health: number
  latency: number
  throughput: number
  lastSync: Date
  endpoint: string
  version: string
  authentication: 'oauth' | 'api-key' | 'basic' | 'none'
  dataFlow: 'bidirectional' | 'inbound' | 'outbound'
}

interface DataFlow {
  id: string
  source: string
  destination: string
  type: 'archaeological-data' | 'kan-models' | 'visualizations' | 'analytics' | 'user-data'
  volume: number
  rate: number
  status: 'active' | 'paused' | 'error'
  compression: number
  encryption: boolean
}

interface SystemMetrics {
  totalIntegrations: number
  activeConnections: number
  dataTransferred: number
  averageLatency: number
  uptime: number
  errorRate: number
}

export default function SystemIntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'int_001',
      name: 'Archaeological Database API',
      type: 'api',
      status: 'connected',
      health: 98,
      latency: 45,
      throughput: 1250,
      lastSync: new Date(Date.now() - 120000),
      endpoint: 'https://api.archaeology.thenis.com/v2',
      version: '2.1.4',
      authentication: 'oauth',
      dataFlow: 'bidirectional'
    },
    {
      id: 'int_002',
      name: 'KAN Model Repository',
      type: 'storage',
      status: 'connected',
      health: 95,
      latency: 23,
      throughput: 2100,
      lastSync: new Date(Date.now() - 300000),
      endpoint: 'https://models.thenis.com/kan',
      version: '1.8.2',
      authentication: 'api-key',
      dataFlow: 'inbound'
    },
    {
      id: 'int_003',
      name: 'Geospatial Analysis Service',
      type: 'service',
      status: 'syncing',
      health: 87,
      latency: 78,
      throughput: 890,
      lastSync: new Date(Date.now() - 60000),
      endpoint: 'https://gis.thenis.com/api/v3',
      version: '3.0.1',
      authentication: 'oauth',
      dataFlow: 'bidirectional'
    },
    {
      id: 'int_004',
      name: '3D Visualization Engine',
      type: 'service',
      status: 'connected',
      health: 92,
      latency: 34,
      throughput: 1680,
      lastSync: new Date(Date.now() - 180000),
      endpoint: 'https://3d.thenis.com/render',
      version: '2.5.0',
      authentication: 'api-key',
      dataFlow: 'outbound'
    },
    {
      id: 'int_005',
      name: 'Analytics Platform',
      type: 'analytics',
      status: 'error',
      health: 23,
      latency: 0,
      throughput: 0,
      lastSync: new Date(Date.now() - 3600000),
      endpoint: 'https://analytics.thenis.com/v1',
      version: '1.2.3',
      authentication: 'basic',
      dataFlow: 'outbound'
    }
  ])

  const [dataFlows, setDataFlows] = useState<DataFlow[]>([
    {
      id: 'flow_001',
      source: 'Archaeological Database',
      destination: 'KAN Processing Engine',
      type: 'archaeological-data',
      volume: 2.4,
      rate: 125,
      status: 'active',
      compression: 78,
      encryption: true
    },
    {
      id: 'flow_002',
      source: 'KAN Models',
      destination: '3D Visualization',
      type: 'kan-models',
      volume: 1.8,
      rate: 89,
      status: 'active',
      compression: 65,
      encryption: true
    },
    {
      id: 'flow_003',
      source: 'Geospatial Analysis',
      destination: 'Frontend Dashboard',
      type: 'visualizations',
      volume: 0.9,
      rate: 45,
      status: 'active',
      compression: 82,
      encryption: false
    },
    {
      id: 'flow_004',
      source: 'User Interface',
      destination: 'Analytics Platform',
      type: 'user-data',
      volume: 0.3,
      rate: 12,
      status: 'error',
      compression: 90,
      encryption: true
    }
  ])

  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalIntegrations: 5,
    activeConnections: 4,
    dataTransferred: 15.7,
    averageLatency: 45,
    uptime: 99.7,
    errorRate: 0.3
  })

  const [selectedTab, setSelectedTab] = useState<string>('overview')
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [showSecrets, setShowSecrets] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        health: integration.status === 'error' ? integration.health : 
                Math.max(80, Math.min(100, integration.health + (Math.random() - 0.5) * 5)),
        latency: integration.status === 'error' ? 0 :
                Math.max(10, Math.min(200, integration.latency + (Math.random() - 0.5) * 20)),
        throughput: integration.status === 'error' ? 0 :
                   Math.max(100, Math.min(3000, integration.throughput + (Math.random() - 0.5) * 200))
      })))

      setDataFlows(prev => prev.map(flow => ({
        ...flow,
        rate: flow.status === 'error' ? 0 :
              Math.max(5, Math.min(200, flow.rate + (Math.random() - 0.5) * 10)),
        volume: flow.status === 'error' ? flow.volume :
                Math.max(0.1, flow.volume + (Math.random() - 0.5) * 0.1)
      })))

      setMetrics(prev => ({
        ...prev,
        dataTransferred: prev.dataTransferred + Math.random() * 0.1,
        averageLatency: Math.max(20, Math.min(100, prev.averageLatency + (Math.random() - 0.5) * 5))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 border-green-400'
      case 'syncing': return 'text-blue-400 border-blue-400'
      case 'error': return 'text-red-400 border-red-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'syncing': return <Sync className="h-4 w-4 text-blue-400 animate-spin" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <Globe className="h-4 w-4 text-blue-400" />
      case 'database': return <Database className="h-4 w-4 text-green-400" />
      case 'service': return <Server className="h-4 w-4 text-purple-400" />
      case 'storage': return <Box className="h-4 w-4 text-orange-400" />
      case 'analytics': return <BarChart3 className="h-4 w-4 text-cyan-400" />
      default: return <Network className="h-4 w-4 text-gray-400" />
    }
  }

  const getDataFlowIcon = (dataFlow: string) => {
    switch (dataFlow) {
      case 'bidirectional': return <ArrowRight className="h-4 w-4 text-purple-400" />
      case 'inbound': return <Download className="h-4 w-4 text-green-400" />
      case 'outbound': return <Upload className="h-4 w-4 text-blue-400" />
      default: return <ArrowRight className="h-4 w-4 text-gray-400" />
    }
  }

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} GB`
  }

  const formatRate = (rate: number) => {
    return `${rate.toFixed(0)} MB/s`
  }

  const formatLatency = (latency: number) => {
    return `${latency.toFixed(0)}ms`
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-400'
    if (health >= 70) return 'text-yellow-400'
    if (health >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Network className="mr-2 h-6 w-6 text-blue-400" />
            🔗 System Integration Hub
          </CardTitle>
          <CardDescription className="text-blue-200">
            Centralized management of all system integrations, APIs, data flows, and external services for the Thenis Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-blue-400">{metrics.totalIntegrations}</div>
              <div className="text-xs text-slate-400">Total Integrations</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-green-400">{metrics.activeConnections}</div>
              <div className="text-xs text-slate-400">Active Connections</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-purple-400">{formatBytes(metrics.dataTransferred)}</div>
              <div className="text-xs text-slate-400">Data Transferred</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">{formatLatency(metrics.averageLatency)}</div>
              <div className="text-xs text-slate-400">Avg Latency</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">{metrics.uptime.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">System Uptime</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-orange-400">{metrics.errorRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex items-center gap-2"
          >
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isMonitoring ? 'Pause' : 'Start'} Monitoring
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center gap-2"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
          <Badge variant="outline" className={isMonitoring ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Badge>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="dataflows">Data Flows</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="mr-2 h-5 w-5 text-green-400" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(integration.type)}
                        <span className="text-slate-300 text-sm">{integration.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={integration.health} className="w-16 h-2" />
                        <span className={`text-sm w-12 ${getHealthColor(integration.health)}`}>
                          {integration.health.toFixed(0)}%
                        </span>
                        {getStatusIcon(integration.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Total Throughput</div>
                      <div className="text-slate-400 text-sm">Combined data rate</div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold text-lg">
                        {formatRate(integrations.reduce((sum, int) => sum + int.throughput, 0) / 1000)}
                      </div>
                      <div className="text-slate-400 text-sm">GB/s</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Average Response Time</div>
                      <div className="text-slate-400 text-sm">Across all services</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-lg">
                        {formatLatency(metrics.averageLatency)}
                      </div>
                      <div className="text-slate-400 text-sm">Latency</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Data Processed Today</div>
                      <div className="text-slate-400 text-sm">Total volume</div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold text-lg">
                        {formatBytes(metrics.dataTransferred)}
                      </div>
                      <div className="text-slate-400 text-sm">Volume</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Data Flows */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <GitBranch className="mr-2 h-5 w-5 text-purple-400" />
                Active Data Flows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataFlows.map((flow) => (
                  <div key={flow.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={flow.status === 'active' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}>
                        {flow.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 text-sm">{flow.source}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{flow.destination}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-slate-400">
                        {formatBytes(flow.volume)} | {formatRate(flow.rate / 10)}
                      </div>
                      <div className="flex items-center gap-1">
                        {flow.encryption && <Lock className="h-3 w-3 text-green-400" />}
                        <span className="text-slate-400">{flow.compression}% compressed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(integration.type)}
                      <div>
                        <h3 className="text-white font-semibold">{integration.name}</h3>
                        <p className="text-slate-400 text-sm">{integration.endpoint}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        v{integration.version}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Health:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={integration.health} className="w-16 h-2" />
                        <span className={`${getHealthColor(integration.health)}`}>
                          {integration.health.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Latency:</span>
                      <p className="text-slate-300 mt-1">{formatLatency(integration.latency)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Throughput:</span>
                      <p className="text-slate-300 mt-1">{formatRate(integration.throughput / 100)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Authentication:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Key className="h-3 w-3 text-yellow-400" />
                        <span className="text-slate-300">{integration.authentication}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Data Flow:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getDataFlowIcon(integration.dataFlow)}
                        <span className="text-slate-300">{integration.dataFlow}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-slate-400 text-sm">
                      Last sync: {integration.lastSync.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="mr-2 h-5 w-5 text-green-400" />
                Security & Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(integration.type)}
                      <div>
                        <div className="text-white font-medium">{integration.name}</div>
                        <div className="text-slate-400 text-sm">
                          {showSecrets ? integration.endpoint : integration.endpoint.replace(/\/\/.*@/, '//***@')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-yellow-400" />
                        <span className="text-slate-300 text-sm">{integration.authentication}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.authentication !== 'none' ? (
                          <Lock className="h-4 w-4 text-green-400" />
                        ) : (
                          <Unlock className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`text-sm ${integration.authentication !== 'none' ? 'text-green-400' : 'text-red-400'}`}>
                          {integration.authentication !== 'none' ? 'Secured' : 'Unsecured'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 