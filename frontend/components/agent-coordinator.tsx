"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, Network, Zap, Clock, CheckCircle, 
  Activity, Users, ArrowRight, Sparkles, Globe, Search
} from 'lucide-react'

interface AgentTask {
  id: string
  agentName: string
  taskType: 'spatial' | 'analysis' | 'cultural' | 'temporal' | 'synthesis'
  description: string
  status: 'pending' | 'active' | 'complete'
  progress: number
  results?: any
}

interface AgentCoordinatorProps {
  analysisContext?: {
    coordinates?: string
  }
  kanSettings?: {
    enabled: boolean
    coordinationMode: boolean
  }
  onWorkflowComplete?: (results: any) => void
  className?: string
}

export const AgentCoordinator: React.FC<AgentCoordinatorProps> = ({
  analysisContext = {},
  kanSettings = { enabled: true, coordinationMode: true },
  onWorkflowComplete,
  className = ""
}) => {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [isCoordinating, setIsCoordinating] = useState(false)
  const [workflowProgress, setWorkflowProgress] = useState(0)

  const createWorkflowTasks = (): AgentTask[] => [
    {
      id: 'task-1',
      agentName: 'Spatial Analysis Agent',
      taskType: 'spatial',
      description: 'Geospatial analysis and landscape assessment',
      status: 'pending',
      progress: 0
    },
    {
      id: 'task-2',
      agentName: 'KAN Reasoning Agent',
      taskType: 'analysis',
      description: 'Pattern recognition and feature detection',
      status: 'pending',
      progress: 0
    },
    {
      id: 'task-3',
      agentName: 'Cultural Context Agent',
      taskType: 'cultural',
      description: 'Cultural context and indigenous knowledge',
      status: 'pending',
      progress: 0
    },
    {
      id: 'task-4',
      agentName: 'Temporal Analysis Agent',
      taskType: 'temporal',
      description: 'Chronological analysis and dating',
      status: 'pending',
      progress: 0
    },
    {
      id: 'task-5',
      agentName: 'Synthesis Agent',
      taskType: 'synthesis',
      description: 'Result synthesis and report generation',
      status: 'pending',
      progress: 0
    }
  ]

  const executeWorkflow = async () => {
    setIsCoordinating(true)
    const workflowTasks = createWorkflowTasks()
    setTasks(workflowTasks)
    
    // Execute tasks sequentially with coordination
    for (let i = 0; i < workflowTasks.length; i++) {
      const task = workflowTasks[i]
      
      // Start task
      task.status = 'active'
      setTasks([...workflowTasks])
      
      // Simulate task execution
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise(resolve => setTimeout(resolve, 500))
        task.progress = progress
        setTasks([...workflowTasks])
      }
      
      // Complete task
      task.status = 'complete'
      task.results = generateTaskResults(task.taskType)
      
      // Update workflow progress
      const completedTasks = workflowTasks.filter(t => t.status === 'complete').length
      setWorkflowProgress((completedTasks / workflowTasks.length) * 100)
      setTasks([...workflowTasks])
    }
    
    // Complete workflow
    const finalResults = synthesizeResults(workflowTasks)
    setIsCoordinating(false)
    onWorkflowComplete?.(finalResults)
  }

  const generateTaskResults = (taskType: string) => {
    switch (taskType) {
      case 'spatial':
        return {
          landscapeFeatures: ['river_proximity', 'elevated_terrain'],
          confidence: 0.92
        }
      case 'analysis':
        return {
          archaeologicalFeatures: ['circular_structures', 'earthworks'],
          confidence: 0.89
        }
      case 'cultural':
        return {
          culturalAffiliation: 'Upper Xingu Complex',
          confidence: 0.91
        }
      case 'temporal':
        return {
          estimatedPeriods: ['1000-1500 CE'],
          confidence: 0.87
        }
      case 'synthesis':
        return {
          overallAssessment: 'High-potential archaeological site',
          confidence: 0.91
        }
      default:
        return {}
    }
  }

  const synthesizeResults = (tasks: AgentTask[]) => {
    return {
      analysisType: 'multi_agent_coordinated',
      overallConfidence: 0.91,
      keyFindings: [
        'Multi-agent analysis confirms archaeological potential',
        'Cultural context indicates indigenous heritage value',
        'Coordinated analysis provides comprehensive assessment'
      ],
      agentConsensus: 0.93,
      coordinationEfficiency: 0.96
    }
  }

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'spatial': return <Globe className="w-4 h-4 text-emerald-400" />
      case 'analysis': return <Search className="w-4 h-4 text-violet-400" />
      case 'cultural': return <Users className="w-4 h-4 text-purple-400" />
      case 'temporal': return <Clock className="w-4 h-4 text-blue-400" />
      case 'synthesis': return <Sparkles className="w-4 h-4 text-orange-400" />
      default: return <Brain className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'active': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  if (!kanSettings.enabled || !kanSettings.coordinationMode) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Agent Coordination Disabled</p>
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
          <Network className="w-5 h-5" />
          Multi-Agent Coordination
          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
            <Brain className="w-3 h-3 mr-1" />
            5 agents
          </Badge>
        </CardTitle>
        <div className="text-sm text-slate-400">
          Coordinated analysis with specialized KAN agents
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workflow Control */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Coordinated Analysis</h4>
            <p className="text-xs text-slate-400">
              {analysisContext.coordinates ? `Target: ${analysisContext.coordinates}` : 'No coordinates provided'}
            </p>
          </div>
          <Button 
            onClick={executeWorkflow}
            disabled={!analysisContext.coordinates || isCoordinating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCoordinating ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Coordinating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Workflow
              </>
            )}
          </Button>
        </div>

        {/* Workflow Progress */}
        {tasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Overall Progress:</span>
              <Progress value={workflowProgress} className="h-2 flex-1" />
              <span className="text-blue-400 text-sm">{Math.round(workflowProgress)}%</span>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <Card key={task.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        {getTaskIcon(task.taskType)}
                        <div>
                          <h5 className="font-medium text-white text-sm">{task.agentName}</h5>
                          <p className="text-xs text-slate-400">{task.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">{task.progress}%</div>
                        <Progress value={task.progress} className="h-1 w-16" />
                      </div>
                    </div>
                    
                    {task.results && (
                      <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-300 font-medium">Results:</span>
                        </div>
                        <p className="text-slate-300">
                          Confidence: {Math.round((task.results.confidence || 0) * 100)}% • 
                          Task completed successfully
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Coordination Metrics */}
        {isCoordinating && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Active Tasks</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {tasks.filter(t => t.status === 'active').length}
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Completed</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {tasks.filter(t => t.status === 'complete').length}
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Efficiency</span>
              </div>
              <div className="text-lg font-bold text-orange-400">
                96%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AgentCoordinator 