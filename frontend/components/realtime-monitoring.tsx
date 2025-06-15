"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Brain, Clock, Zap, CheckCircle, AlertTriangle, Cpu } from 'lucide-react'

interface AgentStatus {
  id: string
  name: string
  status: 'active' | 'idle' | 'processing' | 'error'
  interpretability: number
  responseTime: number
  accuracy: number
  requests: number
  lastActive: Date
}

interface PerformanceMetrics {
  overallHealth: number
  activeAgents: number
  avgResponseTime: number
  totalRequests: number
  errorRate: number
  interpretabilityScore: number
}

interface RealtimeMonitoringProps {
  kanSettings?: {
    enabled: boolean
  }
  className?: string
}

export const RealtimeMonitoring: React.FC<RealtimeMonitoringProps> = ({
  kanSettings = { enabled: true },
  className = ""
}) => {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (kanSettings.enabled) {
      initializeMonitoring()
      const interval = setInterval(updateMetrics, 2000)
      return () => clearInterval(interval)
    }
  }, [kanSettings.enabled])

  const initializeMonitoring = () => {
    setIsLive(true)
    
    // Initialize agent statuses
    const initialAgents: AgentStatus[] = [
      {
        id: 'kan-reasoning',
        name: 'KAN Reasoning Agent',
        status: 'active',
        interpretability: 0.905,
        responseTime: 26,
        accuracy: 0.989,
        requests: 847,
        lastActive: new Date()
      },
      {
        id: 'cultural-context',
        name: 'Cultural Context Agent',
        status: 'active',
        interpretability: 0.952,
        responseTime: 18,
        accuracy: 0.967,
        requests: 523,
        lastActive: new Date(Date.now() - 1000)
      },
      {
        id: 'temporal-analysis',
        name: 'Temporal Analysis Agent',
        status: 'processing',
        interpretability: 0.887,
        responseTime: 34,
        accuracy: 0.943,
        requests: 312,
        lastActive: new Date(Date.now() - 500)
      },
      {
        id: 'indigenous-knowledge',
        name: 'Indigenous Knowledge Agent',
        status: 'idle',
        interpretability: 0.973,
        responseTime: 22,
        accuracy: 0.981,
        requests: 198,
        lastActive: new Date(Date.now() - 30000)
      }
    ]
    
    setAgents(initialAgents)
    updatePerformanceMetrics(initialAgents)
  }

  const updateMetrics = () => {
    if (!isLive) return
    
    setAgents(prevAgents => {
      const updatedAgents = prevAgents.map(agent => {
        // Simulate live updates
        const shouldUpdate = Math.random() > 0.7
        
        if (shouldUpdate) {
          const statusOptions: AgentStatus['status'][] = ['active', 'idle', 'processing']
          const randomStatus = agent.status === 'error' ? 'active' : 
            (Math.random() > 0.9 ? statusOptions[Math.floor(Math.random() * statusOptions.length)] : agent.status)
          
          return {
            ...agent,
            status: randomStatus,
            interpretability: Math.max(0.8, Math.min(1.0, agent.interpretability + (Math.random() - 0.5) * 0.02)),
            responseTime: Math.max(10, Math.min(100, agent.responseTime + (Math.random() - 0.5) * 5)),
            accuracy: Math.max(0.9, Math.min(1.0, agent.accuracy + (Math.random() - 0.5) * 0.01)),
            requests: agent.requests + (randomStatus === 'active' ? Math.floor(Math.random() * 3) : 0),
            lastActive: randomStatus === 'active' ? new Date() : agent.lastActive
          }
        }
        
        return agent
      })
      
      updatePerformanceMetrics(updatedAgents)
      return updatedAgents
    })
  }

  const updatePerformanceMetrics = (currentAgents: AgentStatus[]) => {
    const activeAgents = currentAgents.filter(a => a.status === 'active').length
    const avgResponseTime = currentAgents.reduce((sum, a) => sum + a.responseTime, 0) / currentAgents.length
    const totalRequests = currentAgents.reduce((sum, a) => sum + a.requests, 0)
    const avgAccuracy = currentAgents.reduce((sum, a) => sum + a.accuracy, 0) / currentAgents.length
    const avgInterpretability = currentAgents.reduce((sum, a) => sum + a.interpretability, 0) / currentAgents.length
    const errorRate = currentAgents.filter(a => a.status === 'error').length / currentAgents.length
    
    setMetrics({
      overallHealth: avgAccuracy * 100,
      activeAgents,
      avgResponseTime: Math.round(avgResponseTime),
      totalRequests,
      errorRate: errorRate * 100,
      interpretabilityScore: avgInterpretability * 100
    })
  }

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
      case 'idle': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return <Cpu className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'processing': return 'text-blue-400 bg-blue-500/20'
      case 'idle': return 'text-yellow-400 bg-yellow-500/20'
      case 'error': return 'text-red-400 bg-red-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
    return `${Math.floor(diffSecs / 3600)}h ago`
  }

  if (!kanSettings.enabled) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Real-time Monitoring Disabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-blue-500/5 border-blue-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-300">
          <Activity className="w-5 h-5" />
          KAN Real-time Monitoring
          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Performance Overview */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">System Health</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {Math.round(metrics.overallHealth)}%
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Active Agents</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {metrics.activeAgents}/{agents.length}
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Avg Response</span>
              </div>
              <div className="text-lg font-bold text-orange-400">
                {metrics.avgResponseTime}ms
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-slate-400">Interpretability</span>
              </div>
              <div className="text-lg font-bold text-violet-400">
                {Math.round(metrics.interpretabilityScore)}%
              </div>
            </div>
          </div>
        )}

        {/* Agent Status List */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-400" />
            Agent Status
          </h4>
          <div className="space-y-3">
            {agents.map(agent => (
              <Card key={agent.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(agent.status)}
                      <div>
                        <h5 className="font-medium text-white text-sm">{agent.name}</h5>
                        <p className="text-xs text-slate-400">
                          {agent.requests} requests • Last active {formatLastActive(agent.lastActive)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400">Interpretability</span>
                        <span className="text-violet-400">{Math.round(agent.interpretability * 100)}%</span>
                      </div>
                      <Progress value={agent.interpretability * 100} className="h-1" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400">Accuracy</span>
                        <span className="text-green-400">{Math.round(agent.accuracy * 100)}%</span>
                      </div>
                      <Progress value={agent.accuracy * 100} className="h-1" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400">Response Time</span>
                        <span className="text-orange-400">{agent.responseTime}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - agent.responseTime)} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        {metrics && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
            <h4 className="font-medium text-blue-300 mb-3">System Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Total Requests:</span>
                <span className="text-blue-300 ml-2 font-mono">{metrics.totalRequests.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Error Rate:</span>
                <span className="text-red-400 ml-2">{metrics.errorRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RealtimeMonitoring 