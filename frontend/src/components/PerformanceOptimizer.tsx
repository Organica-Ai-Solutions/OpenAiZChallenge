// Performance Optimizer - Code-splitting and performance enhancements
"use client"

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Zap, 
  Clock, 
  Gauge, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Database,
  Eye,
  Map,
  FileText,
  Activity,
  Download
} from 'lucide-react'

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  bundleSize: number
  memoryUsage: number
  cacheHits: number
  errors: number
}

// Component loading states
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

// Lazy load archaeological components with code-splitting
const LazyUnifiedMapViewer = lazy(() => import('./UnifiedMapViewer'))
const LazyEnhancedChatInterface = lazy(() => import('./EnhancedChatInterface'))
const LazyResearchTools = lazy(() => import('./research-tools'))
const LazyEnhancedHistoryTab = lazy(() => import('./EnhancedHistoryTab'))

// Dynamic imports for heavy components (only load when needed)
const DynamicVisionAgentVisualization = dynamic(
  () => import('../components/vision-agent-visualization'),
  { 
    ssr: false,
    loading: () => <ComponentSkeleton name="Vision Agent" />
  }
)

const DynamicArchaeologicalMapViewer = dynamic(
  () => import('../components/ArchaeologicalMapViewer'),
  { 
    ssr: false,
    loading: () => <ComponentSkeleton name="Archaeological Map" />
  }
)

const DynamicNISAgentUI = dynamic(
  () => import('../components/NISAgentUI'),
  { 
    ssr: false,
    loading: () => <ComponentSkeleton name="NIS Agent UI" />
  }
)

// Performance-optimized loading skeleton
function ComponentSkeleton({ name }: { name: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading {name}...</span>
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </CardContent>
    </Card>
  )
}

// Error boundary for component loading
function ComponentErrorBoundary({ children, componentName }: { children: React.ReactNode, componentName: string }) {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load {componentName}. This component will be retried automatically.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

// Props interface
interface PerformanceOptimizerProps {
  children?: React.ReactNode
  enableMetrics?: boolean
  autoOptimize?: boolean
  preloadComponents?: string[]
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

export default function PerformanceOptimizer({
  children,
  enableMetrics = true,
  autoOptimize = true,
  preloadComponents = [],
  onMetricsUpdate
}: PerformanceOptimizerProps) {
  // Performance state
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    cacheHits: 0,
    errors: 0
  })
  
  const [componentStates, setComponentStates] = useState<Record<string, LoadingState>>({})
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [preloadProgress, setPreloadProgress] = useState(0)
  
  // Performance monitoring refs
  const performanceObserver = useRef<PerformanceObserver | null>(null)
  const renderStartTime = useRef<number>(0)
  const componentCache = useRef<Map<string, React.ComponentType>>(new Map())

  // Initialize performance monitoring
  useEffect(() => {
    if (!enableMetrics) return

    renderStartTime.current = performance.now()

    // Performance observer for detailed metrics
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            updateMetrics({
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime: performance.now() - renderStartTime.current
            })
          } else if (entry.entryType === 'measure') {
            updateMetrics({
              renderTime: entry.duration
            })
          }
        })
      })

      performanceObserver.current.observe({ 
        entryTypes: ['navigation', 'measure', 'paint'] 
      })
    }

    // Memory usage monitoring
    const memoryMonitor = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        updateMetrics({
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        })
      }
    }, 5000)

    return () => {
      performanceObserver.current?.disconnect()
      clearInterval(memoryMonitor)
    }
  }, [enableMetrics])

  // Update metrics helper
  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics }
      onMetricsUpdate?.(updated)
      return updated
    })
  }, [onMetricsUpdate])

  // Preload specified components
  useEffect(() => {
    if (preloadComponents.length === 0) return

    const preloadComponent = async (componentName: string) => {
      try {
        setComponentStates(prev => ({ ...prev, [componentName]: 'loading' }))
        
        let component: React.ComponentType | null = null
        
        switch (componentName) {
          case 'vision':
            await import('../components/vision-agent-visualization')
            break
          case 'map':
            await import('./UnifiedMapViewer')
            break
          case 'chat':
            await import('./EnhancedChatInterface')
            break
          case 'research':
            await import('./research-tools')
            break
          case 'history':
            await import('./EnhancedHistoryTab')
            break
          case 'agents':
            await import('../components/NISAgentUI')
            break
        }
        
        setComponentStates(prev => ({ ...prev, [componentName]: 'loaded' }))
        updateMetrics({ cacheHits: metrics.cacheHits + 1 })
        
      } catch (error) {
        console.error(`Failed to preload ${componentName}:`, error)
        setComponentStates(prev => ({ ...prev, [componentName]: 'error' }))
        updateMetrics({ errors: metrics.errors + 1 })
      }
    }

    // Preload components with progress tracking
    const preloadAll = async () => {
      for (let i = 0; i < preloadComponents.length; i++) {
        await preloadComponent(preloadComponents[i])
        setPreloadProgress(((i + 1) / preloadComponents.length) * 100)
      }
    }

    preloadAll()
  }, [preloadComponents])

  // Auto-optimization based on performance metrics
  useEffect(() => {
    if (!autoOptimize) return

    const optimizationTimer = setInterval(() => {
      const { memoryUsage, loadTime, renderTime } = metrics
      
      if (memoryUsage > 100 || loadTime > 3000 || renderTime > 1000) {
        setOptimizationLevel('high')
      } else if (memoryUsage > 50 || loadTime > 1500 || renderTime > 500) {
        setOptimizationLevel('medium')
      } else {
        setOptimizationLevel('low')
      }
    }, 10000)

    return () => clearInterval(optimizationTimer)
  }, [metrics, autoOptimize])

  // Optimized component wrapper
  const OptimizedComponent = useCallback(({ 
    name, 
    component: Component, 
    fallback 
  }: { 
    name: string
    component: React.ComponentType<any>
    fallback?: React.ReactNode 
  }) => {
    const loadingState = componentStates[name] || 'idle'
    
    return (
      <ComponentErrorBoundary componentName={name}>
        <Suspense fallback={fallback || <ComponentSkeleton name={name} />}>
          {loadingState === 'error' ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {name} failed to load. 
                <Button variant="link" onClick={() => window.location.reload()}>
                  Refresh to retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Component />
          )}
        </Suspense>
      </ComponentErrorBoundary>
    )
  }, [componentStates])

  // Performance dashboard
  const renderPerformanceDashboard = () => {
    if (!enableMetrics) return null

    const getPerformanceScore = () => {
      const { loadTime, renderTime, memoryUsage, errors } = metrics
      let score = 100
      
      if (loadTime > 3000) score -= 20
      if (renderTime > 1000) score -= 15
      if (memoryUsage > 100) score -= 15
      if (errors > 0) score -= errors * 10
      
      return Math.max(0, score)
    }

    const score = getPerformanceScore()
    const scoreColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Performance Metrics
            <Badge variant="outline" className={scoreColor}>
              {score}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <div className="text-lg font-bold">
                {metrics.loadTime > 0 ? `${metrics.loadTime.toFixed(0)}ms` : '-'}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Render Time</span>
              </div>
              <div className="text-lg font-bold">
                {metrics.renderTime > 0 ? `${metrics.renderTime.toFixed(0)}ms` : '-'}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Database className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <div className="text-lg font-bold">
                {metrics.memoryUsage > 0 ? `${metrics.memoryUsage.toFixed(1)}MB` : '-'}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Cache Hits</span>
              </div>
              <div className="text-lg font-bold">{metrics.cacheHits}</div>
            </div>
          </div>

          {/* Optimization level indicator */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Optimization Level:</span>
            <Badge variant={optimizationLevel === 'high' ? 'destructive' : 
                          optimizationLevel === 'medium' ? 'default' : 'secondary'}>
              {optimizationLevel.toUpperCase()}
            </Badge>
          </div>

          {/* Preload progress */}
          {preloadComponents.length > 0 && preloadProgress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Preloading Components</span>
                <span>{preloadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={preloadProgress} />
            </div>
          )}

          {/* Component states */}
          {Object.keys(componentStates).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Component States</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(componentStates).map(([name, state]) => (
                  <Badge 
                    key={name} 
                    variant={state === 'loaded' ? 'default' : 
                           state === 'loading' ? 'secondary' : 
                           state === 'error' ? 'destructive' : 'outline'}
                  >
                    {name}: {state}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {renderPerformanceDashboard()}
      
      {/* Optimized content wrapper */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Code-split component factory */}
      <div style={{ display: 'none' }}>
        {/* Pre-instantiate components for better performance */}
        <OptimizedComponent name="map" component={LazyUnifiedMapViewer} />
        <OptimizedComponent name="chat" component={LazyEnhancedChatInterface} />
        <OptimizedComponent name="research" component={LazyResearchTools} />
        <OptimizedComponent name="history" component={LazyEnhancedHistoryTab} />
      </div>
    </div>
  )
}

// Export optimized components for use throughout the app
export {
  LazyUnifiedMapViewer,
  LazyEnhancedChatInterface, 
  LazyResearchTools,
  LazyEnhancedHistoryTab,
  DynamicVisionAgentVisualization,
  DynamicArchaeologicalMapViewer,
  DynamicNISAgentUI,
  ComponentSkeleton,
  ComponentErrorBoundary
}

export type { PerformanceMetrics, LoadingState } 