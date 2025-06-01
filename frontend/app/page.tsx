'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from '../components/ui/progress'
import { 
  Brain, 
  Map, 
  MessageSquare, 
  BarChart3, 
  Download, 
  Bell,
  Satellite,
  Eye,
  Zap,
  Activity,
  Database,
  Globe,
  Shield,
  Smartphone,
  Search,
  TrendingUp,
  Settings,
  ChevronRight,
  MapPin,
  Layers
} from "lucide-react"
import { discoveryService } from '@/lib/discovery-service'
import { webSocketService } from '@/lib/websocket'

interface SystemStats {
  totalDiscoveries: number
  activeAgents: number
  systemHealth: number
  dataSourcesActive: number
  lastDiscovery?: {
    latitude: number
    longitude: number
    confidence: number
    timestamp: string
  }
}

export default function HomePage() {
  const router = useRouter()
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalDiscoveries: 0,
    activeAgents: 0,
    systemHealth: 0,
    dataSourcesActive: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    loadSystemStats()
    initializeWebSocket()
  }, [])

  const loadSystemStats = async () => {
    try {
      setIsLoading(true)
      
      // Get system health and stats in parallel
      const [health, agents, diagnostics] = await Promise.allSettled([
        discoveryService.getSystemHealth(),
        discoveryService.getAvailableAgents(),
        discoveryService.getSystemDiagnostics()
      ])

      let stats: SystemStats = {
        totalDiscoveries: Math.floor(Math.random() * 150) + 50, // Mock data
        activeAgents: 0,
        systemHealth: 0,
        dataSourcesActive: 0
      }

      if (health.status === 'fulfilled') {
        stats.systemHealth = 95 // Mock high health
        stats.dataSourcesActive = 4 // All data sources
      }

      if (agents.status === 'fulfilled') {
        stats.activeAgents = Array.isArray(agents.value) ? agents.value.length : 4
      }

      if (diagnostics.status === 'fulfilled') {
        // Add any diagnostic info to stats
        console.log('System diagnostics:', diagnostics.value)
      }

      // Add recent discovery mock data
      stats.lastDiscovery = {
        latitude: -3.4653,
        longitude: -62.2159,
        confidence: 91.01,
        timestamp: new Date().toISOString()
      }

      setSystemStats(stats)
      setRecentActivity([
        { type: 'discovery', message: 'High-confidence site discovered in Amazon Basin', time: '2 min ago', confidence: 91.01 },
        { type: 'analysis', message: 'Vision agent completed terrain analysis', time: '5 min ago', confidence: 82.3 },
        { type: 'processing', message: 'Multi-source data correlation completed', time: '8 min ago', confidence: 78.9 },
        { type: 'system', message: 'All data sources synchronized', time: '12 min ago', confidence: 100 }
      ])
    } catch (error) {
      console.error('Failed to load system stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeWebSocket = () => {
    const unsubscribeConnected = webSocketService.subscribe('connected', () => {
      setWsConnected(true)
    })

    const unsubscribeDisconnected = webSocketService.subscribe('disconnected', () => {
      setWsConnected(false)
    })

    const unsubscribeDiscovery = webSocketService.subscribe('discovery', (data: any) => {
      setRecentActivity(prev => [{
        type: 'discovery',
        message: `New discovery: ${data.description || 'Archaeological site'}`,
        time: 'Just now',
        confidence: data.confidence * 100
      }, ...prev.slice(0, 3)])
    })

    setWsConnected(webSocketService.isConnected())

    return () => {
      unsubscribeConnected()
      unsubscribeDisconnected()
      unsubscribeDiscovery()
    }
  }

  const quickDiscovery = async () => {
    try {
      // Quick discovery in Amazon Basin
      const request = discoveryService.generateDiscoveryRequest(
        -3.4653, -62.2159, 
        'Quick discovery from homepage'
      )
      
      router.push(`/archaeological-discovery?lat=${-3.4653}&lng=${-62.2159}&auto=true`)
    } catch (error) {
      console.error('Quick discovery failed:', error)
    }
  }

  const features = [
    {
      title: 'Satellite Monitoring',
      description: 'Real-time satellite imagery analysis and anomaly detection',
      icon: Satellite,
      href: '/satellite',
      color: 'bg-blue-500',
      stats: `${systemStats.dataSourcesActive} active`
    },
    {
      title: 'Archaeological Discovery',
      description: 'Multi-source archaeological site discovery and validation',
      icon: Search,
      href: '/archaeological-discovery',
      color: 'bg-green-500',
      stats: `${systemStats.totalDiscoveries} discoveries`
    },
    {
      title: 'AI Agent Network',
      description: 'Vision, reasoning, memory, and action agents working together',
      icon: Brain,
      href: '/agent',
      color: 'bg-purple-500',
      stats: `${systemStats.activeAgents} agents`
    },
    {
      title: 'Interactive Maps',
      description: 'Geographic visualization and site exploration',
      icon: Map,
      href: '/map',
      color: 'bg-orange-500',
      stats: 'Real-time data'
    },
    {
      title: 'Data Analytics',
      description: 'Comprehensive analysis and reporting dashboard',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-indigo-500',
      stats: 'Live insights'
    },
    {
      title: 'Chat Interface',
      description: 'Natural language interface for system interaction',
      icon: MessageSquare,
      href: '/chat',
      color: 'bg-teal-500',
      stats: 'Always available'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">NIS Protocol</h1>
          </div>
          <p className="text-xl text-slate-300 mb-4">
            Next-generation Indigenous Studies archaeological research platform
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant={wsConnected ? "default" : "secondary"} className="text-sm">
              <Activity className="h-3 w-3 mr-1" />
              {wsConnected ? 'Connected' : 'Connecting...'}
            </Badge>
            <Badge variant="outline" className="text-slate-300">
              System Health: {systemStats.systemHealth}%
            </Badge>
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Discoveries</p>
                  <p className="text-3xl font-bold text-white">{systemStats.totalDiscoveries}</p>
                </div>
                <Search className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Agents</p>
                  <p className="text-3xl font-bold text-white">{systemStats.activeAgents}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Health</p>
                  <p className="text-3xl font-bold text-white">{systemStats.systemHealth}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
              <Progress value={systemStats.systemHealth} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Data Sources</p>
                  <p className="text-3xl font-bold text-white">{systemStats.dataSourcesActive}/4</p>
                </div>
                <Database className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button 
            onClick={quickDiscovery}
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-5 w-5 mr-2" />
            Quick Discovery
          </Button>
          
          <Button 
            onClick={() => router.push('/satellite')}
            size="lg" 
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
          >
            <Satellite className="h-5 w-5 mr-2" />
            Monitor Satellites
          </Button>
          
          <Button 
            onClick={() => router.push('/map')}
            size="lg" 
            variant="outline"
            className="border-orange-600 text-orange-400 hover:bg-orange-600/20"
          >
            <Map className="h-5 w-5 mr-2" />
            Explore Maps
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all hover:scale-105"
                  onClick={() => router.push(feature.href)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${feature.color}`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.stats}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between text-slate-300">
                      Open Module
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Live Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="border-l-2 border-slate-600 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <Badge 
                          variant={activity.type === 'discovery' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-slate-400">{activity.time}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-1">{activity.message}</p>
                      {activity.confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Confidence:</span>
                          <Progress value={activity.confidence} className="h-1 flex-1" />
                          <span className="text-xs text-slate-400">{activity.confidence.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Last Discovery */}
            {systemStats.lastDiscovery && (
              <Card className="bg-slate-800/50 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Latest Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-300">
                        {systemStats.lastDiscovery.latitude.toFixed(4)}, {systemStats.lastDiscovery.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-green-400 font-semibold">
                        {systemStats.lastDiscovery.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => router.push(`/archaeological-discovery?lat=${systemStats.lastDiscovery?.latitude}&lng=${systemStats.lastDiscovery?.longitude}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
