// Component Integration Hub - Enhances component utilization and synergy
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  BarChart3, 
  Download, 
  Eye, 
  FileText, 
  Globe, 
  History, 
  Map, 
  Satellite, 
  Search,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react'

// Import under-utilized components to give them better exposure
import { AnalyticsDashboard } from '../components/ui/analytics-dashboard'
import { ExportSystem } from '../components/ui/export-system'
import { SatelliteMonitor } from '../components/ui/satellite-monitor'
import { HealthStatus } from '../components/ui/health-status'
import { NotificationSystem } from '../components/ui/notification-system'
import EnhancedHistoryTab from '../components/EnhancedHistoryTab'
import UnifiedMapViewer from './UnifiedMapViewer'
import { ResearchTools } from './research-tools'

// Integration workflow states
type WorkflowStep = {
  id: string
  name: string
  component: React.ComponentType<any>
  status: 'pending' | 'active' | 'completed' | 'error'
  progress: number
  data?: any
}

type IntegrationMode = 'discovery' | 'analysis' | 'research' | 'monitoring' | 'export'

interface ComponentIntegrationHubProps {
  mode?: IntegrationMode
  onModeChange?: (mode: IntegrationMode) => void
  showWorkflow?: boolean
}

export default function ComponentIntegrationHub({
  mode = 'discovery',
  onModeChange,
  showWorkflow = true
}: ComponentIntegrationHubProps) {
  // State management
  const [activeMode, setActiveMode] = useState<IntegrationMode>(mode)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState({
    backend: false,
    satellites: 'unknown',
    agents: 0,
    lastUpdate: new Date()
  })
  const [integrationData, setIntegrationData] = useState<any>({})

  // Initialize workflow based on mode
  useEffect(() => {
    initializeWorkflow(activeMode)
  }, [activeMode])

  // Handle mode changes
  const handleModeChange = useCallback((newMode: IntegrationMode) => {
    setActiveMode(newMode)
    onModeChange?.(newMode)
    console.log('🔄 Integration mode changed to:', newMode)
  }, [onModeChange])

  // Initialize workflow steps based on integration mode
  const initializeWorkflow = (mode: IntegrationMode) => {
    const workflows: Record<IntegrationMode, WorkflowStep[]> = {
      discovery: [
        { id: 'map', name: 'Map Exploration', component: UnifiedMapViewer, status: 'active', progress: 0 },
        { id: 'research', name: 'Research Analysis', component: ResearchTools, status: 'pending', progress: 0 },
        { id: 'analytics', name: 'Discovery Analytics', component: AnalyticsDashboard, status: 'pending', progress: 0 },
        { id: 'export', name: 'Export Results', component: ExportSystem, status: 'pending', progress: 0 }
      ],
      analysis: [
        { id: 'satellite', name: 'Satellite Monitoring', component: SatelliteMonitor, status: 'active', progress: 0 },
        { id: 'map', name: 'Coordinate Analysis', component: UnifiedMapViewer, status: 'pending', progress: 0 },
        { id: 'analytics', name: 'Analysis Dashboard', component: AnalyticsDashboard, status: 'pending', progress: 0 },
        { id: 'history', name: 'Analysis History', component: EnhancedHistoryTab, status: 'pending', progress: 0 }
      ],
      research: [
        { id: 'research', name: 'Research Tools', component: ResearchTools, status: 'active', progress: 0 },
        { id: 'history', name: 'Research History', component: EnhancedHistoryTab, status: 'pending', progress: 0 },
        { id: 'analytics', name: 'Research Analytics', component: AnalyticsDashboard, status: 'pending', progress: 0 },
        { id: 'export', name: 'Export Findings', component: ExportSystem, status: 'pending', progress: 0 }
      ],
      monitoring: [
        { id: 'health', name: 'System Health', component: HealthStatus, status: 'active', progress: 0 },
        { id: 'satellite', name: 'Satellite Status', component: SatelliteMonitor, status: 'pending', progress: 0 },
        { id: 'notifications', name: 'Notifications', component: NotificationSystem, status: 'pending', progress: 0 },
        { id: 'analytics', name: 'System Analytics', component: AnalyticsDashboard, status: 'pending', progress: 0 }
      ],
      export: [
        { id: 'export', name: 'Export System', component: ExportSystem, status: 'active', progress: 0 },
        { id: 'history', name: 'Export History', component: EnhancedHistoryTab, status: 'pending', progress: 0 },
        { id: 'analytics', name: 'Export Analytics', component: AnalyticsDashboard, status: 'pending', progress: 0 }
      ]
    }

    setWorkflowSteps(workflows[mode])
    setCurrentStep(workflows[mode].find(step => step.status === 'active')?.id || null)
  }

  // Advance to next workflow step
  const advanceWorkflow = useCallback((stepId: string, data?: any) => {
    setWorkflowSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return { ...step, status: 'completed', progress: 100, data }
      }
      if (step.status === 'pending' && prev.find(s => s.id === stepId && s.status === 'completed')) {
        const nextStep = prev[prev.findIndex(s => s.id === stepId) + 1]
        if (nextStep && nextStep.id === step.id) {
          return { ...step, status: 'active', progress: 0 }
        }
      }
      return step
    }))

    // Update integration data
    setIntegrationData(prev => ({ ...prev, [stepId]: data }))
    
    // Move to next step
    const currentIndex = workflowSteps.findIndex(step => step.id === stepId)
    const nextStep = workflowSteps[currentIndex + 1]
    if (nextStep) {
      setCurrentStep(nextStep.id)
    }

    console.log('✅ Workflow step completed:', stepId)
  }, [workflowSteps])

  // Get mode configuration
  const getModeConfig = (mode: IntegrationMode) => {
    const configs = {
      discovery: {
        title: 'Archaeological Discovery',
        description: 'Comprehensive site discovery and exploration workflow',
        icon: Search,
        color: 'text-blue-500'
      },
      analysis: {
        title: 'Site Analysis',
        description: 'Deep analysis of archaeological coordinates and features',
        icon: Eye,
        color: 'text-green-500'
      },
      research: {
        title: 'Historical Research',
        description: 'Knowledge base exploration and cultural analysis',
        icon: FileText,
        color: 'text-purple-500'
      },
      monitoring: {
        title: 'System Monitoring',
        description: 'Real-time system health and satellite monitoring',
        icon: Activity,
        color: 'text-orange-500'
      },
      export: {
        title: 'Data Export',
        description: 'Export and documentation of archaeological findings',
        icon: Download,
        color: 'text-indigo-500'
      }
    }
    return configs[mode]
  }

  // Render workflow progress
  const renderWorkflowProgress = () => {
    if (!showWorkflow) return null

    const completed = workflowSteps.filter(step => step.status === 'completed').length
    const total = workflowSteps.length
    const progress = (completed / total) * 100

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{completed}/{total} steps</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            {workflowSteps.map(step => (
              <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg border">
                <div className="flex-shrink-0">
                  {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {step.status === 'active' && <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
                  {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                  {step.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{step.name}</div>
                  {step.status === 'active' && (
                    <Progress value={step.progress} className="h-1 mt-1" />
                  )}
                </div>
                {step.status === 'active' && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {step.status === 'completed' && step.data && (
                  <Badge variant="outline" className="text-xs">
                    {Array.isArray(step.data) ? `${step.data.length} items` : 'Complete'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render active component
  const renderActiveComponent = () => {
    const activeStep = workflowSteps.find(step => step.id === currentStep)
    if (!activeStep) return null

    const Component = activeStep.component
    const props = {
      onComplete: (data: any) => advanceWorkflow(activeStep.id, data),
      integrationMode: activeMode,
      workflowData: integrationData,
      ...getComponentProps(activeStep.id)
    }

    return (
      <Card className="min-h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              {activeStep.name}
            </CardTitle>
            <Badge variant="secondary">{activeMode} mode</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Component {...props} />
        </CardContent>
      </Card>
    )
  }

  // Get component-specific props
  const getComponentProps = (stepId: string) => {
    const propMap: Record<string, any> = {
      map: {
        mode: activeMode,
        showControls: true,
        showLayers: true,
        onCoordinateSelect: (coords: string) => console.log('Coordinates:', coords),
        onSiteSelect: (site: any) => console.log('Site:', site)
      },
      research: {
        showAdvancedFeatures: true,
        integrationMode: activeMode
      },
      analytics: {
        focusArea: activeMode,
        showRealTimeData: true
      },
      satellite: {
        showDetailedStatus: true,
        autoRefresh: true
      },
      history: {
        filterByMode: activeMode,
        showExportOptions: true
      },
      export: {
        availableFormats: ['pdf', 'csv', 'json', 'kml'],
        includeMetadata: true
      },
      health: {
        showDetailed: true,
        autoRefresh: true
      },
      notifications: {
        filterByImportance: 'high',
        showHistory: true
      }
    }
    return propMap[stepId] || {}
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Archaeological Analysis Integration Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMode} onValueChange={(value) => handleModeChange(value as IntegrationMode)}>
            <TabsList className="grid w-full grid-cols-5">
              {(['discovery', 'analysis', 'research', 'monitoring', 'export'] as IntegrationMode[]).map(mode => {
                const config = getModeConfig(mode)
                const Icon = config.icon
                return (
                  <TabsTrigger key={mode} value={mode} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="hidden sm:inline">{config.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Mode descriptions */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {React.createElement(getModeConfig(activeMode).icon, { 
                  className: `w-5 h-5 ${getModeConfig(activeMode).color}` 
                })}
                <h3 className="font-semibold">{getModeConfig(activeMode).title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {getModeConfig(activeMode).description}
              </p>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Workflow Progress */}
        {showWorkflow && (
          <div className="lg:col-span-1">
            {renderWorkflowProgress()}
          </div>
        )}

        {/* Active Component */}
        <div className={showWorkflow ? "lg:col-span-3" : "lg:col-span-4"}>
          {renderActiveComponent()}
        </div>
      </div>

      {/* Integration Status */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          Component Integration Hub is actively connecting under-utilized components to enhance 
          archaeological analysis workflows. Current mode: <strong>{getModeConfig(activeMode).title}</strong>
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Export types for use in other components
export type { IntegrationMode, WorkflowStep } 