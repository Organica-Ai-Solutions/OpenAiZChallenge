"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, Network, Zap, Clock, Target, CheckCircle, 
  AlertTriangle, Activity, Users, Layers, ArrowRight,
  Sparkles, Cpu, Globe, Search, Eye, MapPin
} from 'lucide-react'

interface AgentTask {
  id: string
  agentId: string
  agentName: string
  taskType: 'analysis' | 'cultural' | 'temporal' | 'spatial' | 'synthesis'
  description: string
  status: 'pending' | 'active' | 'complete' | 'error' | 'waiting'
  progress: number
  dependencies: string[]
  results?: any
  startTime?: Date
  completionTime?: Date
  priority: 'high' | 'medium' | 'low'
}

interface CoordinationWorkflow {
  id: string
  name: string
  description: string
  tasks: AgentTask[]
  status: 'idle' | 'running' | 'complete' | 'error'
  progress: number
  startTime?: Date
  estimatedCompletion?: Date
  results?: any
}

interface MultiAgentCoordinatorProps {
  analysisContext?: {
    coordinates?: string
    analysisType?: string
    complexity?: 'simple' | 'complex' | 'comprehensive'
  }
  kanSettings?: {
    enabled: boolean
    coordinationMode: boolean
    parallelProcessing: boolean
  }
  onWorkflowComplete?: (results: any) => void
  className?: string
}

export const MultiAgentCoordinator: React.FC<MultiAgentCoordinatorProps> = ({
  analysisContext = {},
  kanSettings = { enabled: true, coordinationMode: true, parallelProcessing: true },
  onWorkflowComplete,
  className = ""
}) => {
  const [activeWorkflow, setActiveWorkflow] = useState<CoordinationWorkflow | null>(null)
  const [workflowHistory, setWorkflowHistory] = useState<CoordinationWorkflow[]>([])
  const [agentPool, setAgentPool] = useState<any[]>([])
  const [coordinationMetrics, setCoordinationMetrics] = useState<any>({})
  const [isCoordinating, setIsCoordinating] = useState(false)

  useEffect(() => {
    if (kanSettings.enabled && kanSettings.coordinationMode) {
      initializeAgentPool()
      updateCoordinationMetrics()
    }
  }, [kanSettings])

  const initializeAgentPool = () => {
    const agents = [
      {
        id: 'kan-reasoning',
        name: 'KAN Reasoning Agent',
        type: 'reasoning',
        capabilities: ['pattern_analysis', 'logical_inference', 'hypothesis_generation'],
        status: 'available',
        load: 0.2,
        performance: 0.989
      },
      {
        id: 'cultural-context',
        name: 'Cultural Context Agent',
        type: 'cultural',
        capabilities: ['cultural_analysis', 'indigenous_knowledge', 'heritage_assessment'],
        status: 'available',
        load: 0.15,
        performance: 0.967
      },
      {
        id: 'temporal-analysis',
        name: 'Temporal Analysis Agent',
        type: 'temporal',
        capabilities: ['chronological_analysis', 'dating_correlation', 'period_identification'],
        status: 'available',
        load: 0.3,
        performance: 0.943
      },
      {
        id: 'spatial-analysis',
        name: 'Spatial Analysis Agent',
        type: 'spatial',
        capabilities: ['geospatial_analysis', 'landscape_archaeology', 'site_correlation'],
        status: 'available',
        load: 0.25,
        performance: 0.956
      },
      {
        id: 'synthesis-agent',
        name: 'Synthesis Agent',
        type: 'synthesis',
        capabilities: ['data_integration', 'report_generation', 'conclusion_synthesis'],
        status: 'available',
        load: 0.1,
        performance: 0.978
      }
    ]
    
    setAgentPool(agents)
  }

  const createComprehensiveWorkflow = (coordinates: string): CoordinationWorkflow => {
    const workflowId = `workflow-${Date.now()}`
    
    const tasks: AgentTask[] = [
      {
        id: `${workflowId}-task-1`,
        agentId: 'spatial-analysis',
        agentName: 'Spatial Analysis Agent',
        taskType: 'spatial',
        description: 'Initial geospatial analysis and landscape assessment',
        status: 'pending',
        progress: 0,
        dependencies: [],
        priority: 'high'
      },
      {
        id: `${workflowId}-task-2`,
        agentId: 'kan-reasoning',
        agentName: 'KAN Reasoning Agent',
        taskType: 'analysis',
        description: 'Pattern recognition and archaeological feature detection',
        status: 'pending',
        progress: 0,
        dependencies: [`${workflowId}-task-1`],
        priority: 'high'
      },
      {
        id: `${workflowId}-task-3`,
        agentId: 'cultural-context',
        agentName: 'Cultural Context Agent',
        taskType: 'cultural',
        description: 'Cultural context analysis and indigenous knowledge integration',
        status: 'pending',
        progress: 0,
        dependencies: [`${workflowId}-task-1`],
        priority: 'medium'
      },
      {
        id: `${workflowId}-task-4`,
        agentId: 'temporal-analysis',
        agentName: 'Temporal Analysis Agent',
        taskType: 'temporal',
        description: 'Chronological analysis and temporal correlation',
        status: 'pending',
        progress: 0,
        dependencies: [`${workflowId}-task-2`],
        priority: 'medium'
      },
      {
        id: `${workflowId}-task-5`,
        agentId: 'synthesis-agent',
        agentName: 'Synthesis Agent',
        taskType: 'synthesis',
        description: 'Comprehensive result synthesis and report generation',
        status: 'pending',
        progress: 0,
        dependencies: [`${workflowId}-task-2`, `${workflowId}-task-3`, `${workflowId}-task-4`],
        priority: 'high'
      }
    ]

    return {
      id: workflowId,
      name: 'Comprehensive Archaeological Analysis',
      description: `Multi-agent coordinated analysis for coordinates: ${coordinates}`,
      tasks,
      status: 'idle',
      progress: 0,
      estimatedCompletion: new Date(Date.now() + 180000) // 3 minutes
    }
  }

  const executeWorkflow = async (workflow: CoordinationWorkflow) => {
    setIsCoordinating(true)
    setActiveWorkflow({ ...workflow, status: 'running', startTime: new Date() })
    
    // Simulate coordinated execution
    const updatedWorkflow = { ...workflow }
    updatedWorkflow.status = 'running'
    updatedWorkflow.startTime = new Date()
    
    // Execute tasks based on dependencies
    for (let i = 0; i < updatedWorkflow.tasks.length; i++) {
      const task = updatedWorkflow.tasks[i]
      
      // Check if dependencies are complete
      const dependenciesComplete = task.dependencies.every(depId => 
        updatedWorkflow.tasks.find(t => t.id === depId)?.status === 'complete'
      )
      
      if (dependenciesComplete || task.dependencies.length === 0) {
        // Execute task
        task.status = 'active'
        task.startTime = new Date()
        setActiveWorkflow({ ...updatedWorkflow })
        
        // Simulate task execution
        await simulateTaskExecution(task)
        
        task.status = 'complete'
        task.completionTime = new Date()
        task.progress = 100
        task.results = generateTaskResults(task)
        
        // Update workflow progress
        const completedTasks = updatedWorkflow.tasks.filter(t => t.status === 'complete').length
        updatedWorkflow.progress = (completedTasks / updatedWorkflow.tasks.length) * 100
        
        setActiveWorkflow({ ...updatedWorkflow })
      }
    }
    
    // Complete workflow
    updatedWorkflow.status = 'complete'
    updatedWorkflow.results = synthesizeWorkflowResults(updatedWorkflow)
    
    setActiveWorkflow(updatedWorkflow)
    setWorkflowHistory(prev => [...prev, updatedWorkflow])
    setIsCoordinating(false)
    
    onWorkflowComplete?.(updatedWorkflow.results)
  }

  const simulateTaskExecution = async (task: AgentTask) => {
    const executionTime = task.priority === 'high' ? 2000 : task.priority === 'medium' ? 3000 : 4000
    
    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, executionTime / 5))
      task.progress = progress
      setActiveWorkflow(prev => prev ? { ...prev } : null)
    }
  }

  const generateTaskResults = (task: AgentTask) => {
    switch (task.taskType) {
      case 'spatial':
        return {
          landscapeFeatures: ['river_proximity', 'elevated_terrain', 'forest_edge'],
          siteAccessibility: 0.85,
          environmentalFactors: ['seasonal_flooding', 'soil_composition'],
          confidence: 0.92
        }
      case 'analysis':
        return {
          archaeologicalFeatures: ['circular_structures', 'linear_earthworks', 'midden_deposits'],
          patternConfidence: 0.89,
          featureTypes: ['settlement', 'ceremonial'],
          interpretability: 0.94
        }
      case 'cultural':
        return {
          culturalAffiliation: 'Upper Xingu Complex',
          traditionalKnowledge: ['seasonal_occupation', 'fishing_camps', 'ceremonial_use'],
          communityRelevance: 0.91,
          culturalSensitivity: 'high'
        }
      case 'temporal':
        return {
          estimatedPeriods: ['1000-1500 CE', '1500-1750 CE'],
          chronologicalConfidence: 0.87,
          culturalContinuity: 'moderate',
          datingRecommendations: ['radiocarbon', 'ceramic_seriation']
        }
      case 'synthesis':
        return {
          overallAssessment: 'High-potential archaeological site with cultural significance',
          confidence: 0.91,
          recommendations: ['community_consultation', 'systematic_survey', 'cultural_protocols'],
          researchPriority: 'high'
        }
      default:
        return {}
    }
  }

  const synthesizeWorkflowResults = (workflow: CoordinationWorkflow) => {
    const allResults = workflow.tasks.map(task => task.results).filter(Boolean)
    
    return {
      workflowId: workflow.id,
      analysisType: 'comprehensive_multi_agent',
      overallConfidence: 0.91,
      keyFindings: [
        'Multi-agent analysis confirms high archaeological potential',
        'Cultural context indicates significant indigenous heritage value',
        'Temporal analysis suggests multi-period occupation',
        'Spatial analysis reveals optimal site characteristics'
      ],
      agentConsensus: 0.93,
      recommendedActions: [
        'Initiate community consultation process',
        'Conduct systematic archaeological survey',
        'Implement cultural protection protocols',
        'Establish research collaboration framework'
      ],
      processingMetrics: {
        totalAgents: workflow.tasks.length,
        executionTime: workflow.startTime ? Date.now() - workflow.startTime.getTime() : 0,
        coordinationEfficiency: 0.96,
        parallelProcessing: kanSettings.parallelProcessing
      }
    }
  }

  const updateCoordinationMetrics = () => {
    setCoordinationMetrics({
      activeAgents: agentPool.filter(a => a.status === 'busy').length,
      totalAgents: agentPool.length,
      averageLoad: agentPool.reduce((sum, a) => sum + a.load, 0) / agentPool.length,
      averagePerformance: agentPool.reduce((sum, a) => sum + a.performance, 0) / agentPool.length,
      coordinationEfficiency: 0.96,
      workflowsCompleted: workflowHistory.length
    })
  }

  const startComprehensiveAnalysis = () => {
    if (!analysisContext.coordinates) return
    
    const workflow = createComprehensiveWorkflow(analysisContext.coordinates)
    executeWorkflow(workflow)
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'active': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'waiting': return <Clock className="w-4 h-4 text-orange-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return <Cpu className="w-4 h-4 text-slate-400" />
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'spatial': return <Globe className="w-4 h-4 text-emerald-400" />
      case 'analysis': return <Search className="w-4 h-4 text-violet-400" />
      case 'cultural': return <Users className="w-4 h-4 text-purple-400" />
      case 'temporal': return <Clock className="w-4 h-4 text-blue-400" />
      case 'synthesis': return <Layers className="w-4 h-4 text-orange-400" />
      default: return <Brain className="w-4 h-4 text-slate-400" />
    }
  }

  if (!kanSettings.enabled || !kanSettings.coordinationMode) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Network className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Multi-Agent Coordination Disabled</p>
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
          Multi-Agent Coordination System
          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
            <Brain className="w-3 h-3 mr-1" />
            {agentPool.length} agents
          </Badge>
        </CardTitle>
        <div className="text-sm text-slate-400">
          Orchestrating {agentPool.length} specialized KAN agents for comprehensive analysis
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="coordination" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coordination">Coordination</TabsTrigger>
            <TabsTrigger value="agents">Agent Pool</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="coordination" className="space-y-4">
            {/* Coordination Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Workflow Control</h4>
                <p className="text-xs text-slate-400">
                  {analysisContext.coordinates ? `Ready for: ${analysisContext.coordinates}` : 'No coordinates provided'}
                </p>
              </div>
              <Button 
                onClick={startComprehensiveAnalysis}
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
                    Start Analysis
                  </>
                )}
              </Button>
            </div>

            {/* Active Workflow */}
            {activeWorkflow && (
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{activeWorkflow.name}</CardTitle>
                    <Badge className={
                      activeWorkflow.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                      activeWorkflow.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {activeWorkflow.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Progress: {Math.round(activeWorkflow.progress)}%</span>
                    <Progress value={activeWorkflow.progress} className="h-1 flex-1" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeWorkflow.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex items-center gap-3">
                        {getTaskStatusIcon(task.status)}
                        {getTaskTypeIcon(task.taskType)}
                        <div>
                          <h5 className="text-white text-sm font-medium">{task.agentName}</h5>
                          <p className="text-xs text-slate-400">{task.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">{task.progress}%</div>
                        <Progress value={task.progress} className="h-1 w-16" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Coordination Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Active Agents</span>
                </div>
                <div className="text-lg font-bold text-blue-400">
                  {coordinationMetrics.activeAgents || 0}/{coordinationMetrics.totalAgents || 0}
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Efficiency</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  {Math.round((coordinationMetrics.coordinationEfficiency || 0) * 100)}%
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-400">Avg Performance</span>
                </div>
                <div className="text-lg font-bold text-orange-400">
                  {Math.round((coordinationMetrics.averagePerformance || 0) * 100)}%
                </div>
              </div>
              
              <div className="p-3 bg-slate-800/30 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  <span className="text-xs text-slate-400">Completed</span>
                </div>
                <div className="text-lg font-bold text-violet-400">
                  {coordinationMetrics.workflowsCompleted || 0}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="space-y-3">
            {agentPool.map(agent => (
              <Card key={agent.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-violet-400" />
                      <h5 className="font-medium text-white text-sm">{agent.name}</h5>
                    </div>
                    <Badge className={
                      agent.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'busy' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }>
                      {agent.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Load:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={agent.load * 100} className="h-1 flex-1" />
                        <span className="text-blue-400">{Math.round(agent.load * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Performance:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={agent.performance * 100} className="h-1 flex-1" />
                        <span className="text-green-400">{Math.round(agent.performance * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-slate-400 text-xs">Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.capabilities.map((cap: string) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-3">
            {workflowHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No completed workflows yet</p>
              </div>
            ) : (
              workflowHistory.map(workflow => (
                <Card key={workflow.id} className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white text-sm">{workflow.name}</h5>
                      <Badge className="bg-green-500/20 text-green-400">COMPLETE</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{workflow.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {workflow.tasks.length} tasks • {Math.round(workflow.progress)}% complete
                      </span>
                      <span className="text-green-400">
                        {workflow.startTime ? new Date(workflow.startTime).toLocaleTimeString() : 'Unknown'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default MultiAgentCoordinator 