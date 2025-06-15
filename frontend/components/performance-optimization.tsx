"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Database, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  RefreshCw,
  Play,
  Pause,
  Square,
  Monitor,
  Server,
  Cloud,
  Wifi,
  Battery,
  Thermometer
} from 'lucide-react'

interface PerformanceMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
    frequency: number
  }
  memory: {
    used: number
    total: number
    available: number
    cached: number
  }
  storage: {
    used: number
    total: number
    readSpeed: number
    writeSpeed: number
  }
  network: {
    upload: number
    download: number
    latency: number
    packets: number
  }
  gpu: {
    usage: number
    memory: number
    temperature: number
    power: number
  }
}

interface OptimizationTask {
  id: string
  name: string
  type: 'cache' | 'database' | 'memory' | 'network' | 'processing'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: number
  description: string
}

interface SystemAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
  timestamp: Date
  resolved: boolean
  severity: number
}

export default function PerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: { usage: 45, cores: 8, temperature: 62, frequency: 3.2 },
    memory: { used: 12.5, total: 32, available: 19.5, cached: 4.2 },
    storage: { used: 750, total: 1000, readSpeed: 2400, writeSpeed: 1800 },
    network: { upload: 125, download: 850, latency: 12, packets: 15420 },
    gpu: { usage: 78, memory: 6.2, temperature: 71, power: 220 }
  })

  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([
    {
      id: 'opt_001',
      name: 'KAN Model Cache Optimization',
      type: 'cache',
      status: 'running',
      progress: 67,
      impact: 'high',
      estimatedTime: 45,
      description: 'Optimizing KAN model cache for faster inference'
    },
    {
      id: 'opt_002',
      name: 'Database Query Optimization',
      type: 'database',
      status: 'completed',
      progress: 100,
      impact: 'medium',
      estimatedTime: 0,
      description: 'Optimized archaeological data queries'
    },
    {
      id: 'opt_003',
      name: 'Memory Pool Defragmentation',
      type: 'memory',
      status: 'pending',
      progress: 0,
      impact: 'medium',
      estimatedTime: 120,
      description: 'Defragmenting memory pools for better allocation'
    },
    {
      id: 'opt_004',
      name: '3D Rendering Pipeline',
      type: 'processing',
      status: 'running',
      progress: 23,
      impact: 'critical',
      estimatedTime: 180,
      description: 'Optimizing 3D visualization rendering pipeline'
    }
  ])

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert_001',
      type: 'warning',
      message: 'GPU temperature approaching thermal limit (71°C)',
      timestamp: new Date(Date.now() - 300000),
      resolved: false,
      severity: 7
    },
    {
      id: 'alert_002',
      type: 'info',
      message: 'Cache optimization completed successfully',
      timestamp: new Date(Date.now() - 600000),
      resolved: true,
      severity: 3
    },
    {
      id: 'alert_003',
      type: 'success',
      message: 'System performance improved by 23%',
      timestamp: new Date(Date.now() - 900000),
      resolved: true,
      severity: 2
    }
  ])

  const [isMonitoring, setIsMonitoring] = useState(true)
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('overview')

  // Simulate real-time metrics updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: {
          ...prev.cpu,
          usage: Math.max(20, Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10)),
          temperature: Math.max(45, Math.min(85, prev.cpu.temperature + (Math.random() - 0.5) * 3))
        },
        memory: {
          ...prev.memory,
          used: Math.max(8, Math.min(28, prev.memory.used + (Math.random() - 0.5) * 2))
        },
        storage: {
          ...prev.storage,
          readSpeed: Math.max(1000, Math.min(3000, prev.storage.readSpeed + (Math.random() - 0.5) * 200)),
          writeSpeed: Math.max(800, Math.min(2500, prev.storage.writeSpeed + (Math.random() - 0.5) * 150))
        },
        network: {
          ...prev.network,
          upload: Math.max(50, Math.min(200, prev.network.upload + (Math.random() - 0.5) * 20)),
          download: Math.max(400, Math.min(1200, prev.network.download + (Math.random() - 0.5) * 100)),
          latency: Math.max(5, Math.min(50, prev.network.latency + (Math.random() - 0.5) * 5))
        },
        gpu: {
          ...prev.gpu,
          usage: Math.max(30, Math.min(95, prev.gpu.usage + (Math.random() - 0.5) * 15)),
          temperature: Math.max(55, Math.min(85, prev.gpu.temperature + (Math.random() - 0.5) * 4))
        }
      }))

      // Update optimization tasks
      setOptimizationTasks(prev => prev.map(task => {
        if (task.status === 'running') {
          const newProgress = Math.min(100, task.progress + Math.random() * 5)
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'running',
            estimatedTime: newProgress >= 100 ? 0 : Math.max(0, task.estimatedTime - 5)
          }
        }
        return task
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-400'
      case 'running': return 'text-blue-400 border-blue-400'
      case 'failed': return 'text-red-400 border-red-400'
      default: return 'text-yellow-400 border-yellow-400'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      default: return 'text-green-400'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />
      default: return <AlertTriangle className="h-4 w-4 text-blue-400" />
    }
  }

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} GB`
  }

  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(0)} MB/s`
  }

  const getPerformanceScore = () => {
    const cpuScore = (100 - metrics.cpu.usage) * 0.25
    const memoryScore = ((metrics.memory.total - metrics.memory.used) / metrics.memory.total) * 100 * 0.25
    const storageScore = Math.min(100, (metrics.storage.readSpeed / 3000) * 100) * 0.25
    const networkScore = Math.min(100, (metrics.network.download / 1000) * 100) * 0.25
    const gpuScore = (100 - metrics.gpu.usage) * 0.25
    
    return Math.round(cpuScore + memoryScore + storageScore + networkScore + gpuScore)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Zap className="mr-2 h-6 w-6 text-emerald-400" />
            ⚡ Performance Optimization Dashboard
          </CardTitle>
          <CardDescription className="text-emerald-200">
            Real-time system monitoring, performance optimization, and resource management for the Thenis Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-emerald-400">{getPerformanceScore()}</div>
              <div className="text-xs text-slate-400">Performance Score</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-cyan-400">{metrics.cpu.usage.toFixed(0)}%</div>
              <div className="text-xs text-slate-400">CPU Usage</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-blue-400">{((metrics.memory.used / metrics.memory.total) * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-400">Memory Usage</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-purple-400">{metrics.gpu.usage.toFixed(0)}%</div>
              <div className="text-xs text-slate-400">GPU Usage</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="text-2xl font-bold text-orange-400">{optimizationTasks.filter(t => t.status === 'running').length}</div>
              <div className="text-xs text-slate-400">Active Tasks</div>
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
          <Button
            variant={autoOptimize ? "default" : "outline"}
            onClick={() => setAutoOptimize(!autoOptimize)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Auto Optimize: {autoOptimize ? 'On' : 'Off'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isMonitoring ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </Badge>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Overview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Monitor className="mr-2 h-5 w-5 text-cyan-400" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-300">CPU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics.cpu.usage} className="w-24 h-2" />
                      <span className="text-slate-300 text-sm w-12">{metrics.cpu.usage.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-green-400" />
                      <span className="text-slate-300">Memory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(metrics.memory.used / metrics.memory.total) * 100} className="w-24 h-2" />
                      <span className="text-slate-300 text-sm w-12">{((metrics.memory.used / metrics.memory.total) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-purple-400" />
                      <span className="text-slate-300">Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(metrics.storage.used / metrics.storage.total) * 100} className="w-24 h-2" />
                      <span className="text-slate-300 text-sm w-12">{((metrics.storage.used / metrics.storage.total) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-orange-400" />
                      <span className="text-slate-300">GPU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics.gpu.usage} className="w-24 h-2" />
                      <span className="text-slate-300 text-sm w-12">{metrics.gpu.usage.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="mr-2 h-5 w-5 text-emerald-400" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Overall Performance</div>
                      <div className="text-slate-400 text-sm">Last 24 hours</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-lg">+23%</div>
                      <div className="text-slate-400 text-sm">Improvement</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Response Time</div>
                      <div className="text-slate-400 text-sm">Average latency</div>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold text-lg">-15%</div>
                      <div className="text-slate-400 text-sm">Reduction</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Resource Efficiency</div>
                      <div className="text-slate-400 text-sm">CPU/Memory optimization</div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold text-lg">+31%</div>
                      <div className="text-slate-400 text-sm">Efficiency</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-400" />
                System Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.resolved ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-700/50 border-slate-600'
                  }`}>
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className={`font-medium ${alert.resolved ? 'text-slate-400' : 'text-white'}`}>
                          {alert.message}
                        </div>
                        <div className="text-slate-500 text-sm">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${
                        alert.resolved ? 'text-green-400 border-green-400' : 'text-yellow-400 border-yellow-400'
                      }`}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cpu" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Cpu className="mr-2 h-5 w-5 text-blue-400" />
                  CPU Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{metrics.cpu.usage.toFixed(1)}%</div>
                    <div className="text-xs text-slate-400">Usage</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">{metrics.cpu.cores}</div>
                    <div className="text-xs text-slate-400">Cores</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{metrics.cpu.temperature}°C</div>
                    <div className="text-xs text-slate-400">Temperature</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{metrics.cpu.frequency} GHz</div>
                    <div className="text-xs text-slate-400">Frequency</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Thermometer className="mr-2 h-5 w-5 text-red-400" />
                  Thermal Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">CPU Temperature</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(metrics.cpu.temperature / 100) * 100} className="w-24 h-2" />
                      <span className="text-slate-300 text-sm">{metrics.cpu.temperature}°C</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">GPU Temperature</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(metrics.gpu.temperature / 100) * 100} className="w-24 h-2" />
                      <span className="text-slate-300 text-sm">{metrics.gpu.temperature}°C</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Thermal Throttling</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Inactive
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Settings className="mr-2 h-5 w-5 text-yellow-400" />
                Active Optimization Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{task.name}</h4>
                        <p className="text-slate-400 text-sm">{task.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getImpactColor(task.impact)}>
                          {task.impact.charAt(0).toUpperCase() + task.impact.slice(1)} Impact
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-300">{task.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                      
                      {task.estimatedTime > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Estimated Time Remaining</span>
                          <span className="text-slate-300">{Math.ceil(task.estimatedTime / 60)} min</span>
                        </div>
                      )}
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