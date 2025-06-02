"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Zap,
  MapPin,
  Eye,
  Activity,
  Clock,
  Wifi,
  WifiOff
} from "lucide-react"
import { NotificationData, AnalysisUpdate, useWebSocket } from "../../lib/websocket"
import { cn } from "../../lib/utils"

interface NotificationSystemProps {
  className?: string
  maxNotifications?: number
}

export function NotificationSystem({ className, maxNotifications = 50 }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [currentAnalyses, setCurrentAnalyses] = useState<Map<string, AnalysisUpdate>>(new Map())
  
  const webSocket = useWebSocket()

  useEffect(() => {
    // WebSocket connection status
    const unsubscribeConnected = webSocket.subscribe('connected', () => {
      setIsConnected(true)
      // Remove any previous connection lost notifications
      setNotifications(prev => prev.filter(n => !n.id.startsWith('connection_')))
      
      addNotification({
        id: `connection_restored_${Date.now()}`,
        type: 'system',
        title: 'Connection Restored',
        message: 'Real-time updates are now active',
        severity: 'success',
        timestamp: new Date()
      })
    })

    const unsubscribeDisconnected = webSocket.subscribe('disconnected', () => {
      setIsConnected(false)
      // Only add notification if we don't already have a recent connection lost notification
      const hasRecentConnectionLost = notifications.some(n => 
        n.id.startsWith('connection_lost') && 
        (Date.now() - n.timestamp.getTime()) < 10000 // Within last 10 seconds
      )
      
      if (!hasRecentConnectionLost) {
        addNotification({
          id: `connection_lost_${Date.now()}`,
          type: 'system',
          title: 'Connection Lost',
          message: 'Attempting to reconnect...',
          severity: 'warning',
          timestamp: new Date()
        })
      }
    })

    // Notification handling
    const unsubscribeNotification = webSocket.subscribe('notification', (notification: NotificationData) => {
      addNotification(notification)
    })

    // Analysis updates
    const unsubscribeAnalysis = webSocket.subscribe('analysis_update', (update: AnalysisUpdate) => {
      setCurrentAnalyses(prev => new Map(prev.set(update.analysisId, update)))
      
      // Create notification for analysis milestones
      if (update.status === 'completed') {
        addNotification({
          id: `analysis_complete_${update.analysisId}`,
          type: 'analysis_complete',
          title: 'Analysis Complete',
          message: `Discovery analysis finished for ${update.coordinates}`,
          coordinates: update.coordinates,
          severity: 'success',
          timestamp: new Date(),
          metadata: { analysisId: update.analysisId, results: update.results }
        })
        
        // Remove from active analyses
        setCurrentAnalyses(prev => {
          const newMap = new Map(prev)
          newMap.delete(update.analysisId)
          return newMap
        })
      } else if (update.status === 'failed') {
        addNotification({
          id: `analysis_failed_${update.analysisId}`,
          type: 'error',
          title: 'Analysis Failed',
          message: update.error || `Analysis failed for ${update.coordinates}`,
          coordinates: update.coordinates,
          severity: 'error',
          timestamp: new Date(),
          metadata: { analysisId: update.analysisId }
        })
        
        setCurrentAnalyses(prev => {
          const newMap = new Map(prev)
          newMap.delete(update.analysisId)
          return newMap
        })
      }
    })

    // Discovery notifications
    const unsubscribeDiscovery = webSocket.subscribe('discovery', (discovery: any) => {
      addNotification({
        id: `discovery_${discovery.id}`,
        type: 'discovery',
        title: 'New Discovery!',
        message: `Potential ${discovery.type} found at ${discovery.coordinates}`,
        coordinates: discovery.coordinates,
        severity: 'success',
        timestamp: new Date(discovery.timestamp),
        metadata: { discovery }
      })
    })

    // Initial connection status
    setIsConnected(webSocket.isConnected())

    return () => {
      unsubscribeConnected()
      unsubscribeDisconnected()
      unsubscribeNotification()
      unsubscribeAnalysis()
      unsubscribeDiscovery()
    }
  }, [webSocket])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => {
      // Remove existing connection notifications before adding new ones
      const filteredNotifications = notification.id.startsWith('connection_') 
        ? prev.filter(n => !n.id.startsWith('connection_'))
        : prev
        
      const newNotifications = [notification, ...filteredNotifications]
      
      // Limit notifications
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(0, maxNotifications)
      }
      
      return newNotifications
    })
    
    if (!isOpen) {
      setUnreadCount(prev => prev + 1)
    }
    
    // Auto-remove connection notifications after a delay
    if (notification.id.startsWith('connection_')) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 5000) // Remove after 5 seconds
    }
  }, [isOpen, maxNotifications])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev)
    if (!isOpen) {
      markAllAsRead()
    }
  }, [isOpen, markAllAsRead])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis_start': return <Zap className="h-4 w-4" />
      case 'analysis_complete': return <CheckCircle className="h-4 w-4" />
      case 'discovery': return <MapPin className="h-4 w-4" />
      case 'system': return <Activity className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'error': return 'border-red-200 bg-red-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50", className)}>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePanel}
          className="relative bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
        
        {/* Connection Status Indicator */}
        <div className="absolute -bottom-1 -right-1">
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-600" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-600" />
          )}
        </div>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 max-h-[80vh] shadow-2xl border-2">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <h3 className="font-semibold">Live Updates</h3>
                <Badge variant="outline" className="text-xs">
                  {isConnected ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-96">
            <div className="p-2 space-y-2">
              {/* Active Analyses */}
              {Array.from(currentAnalyses.values()).map((analysis) => (
                <Card key={analysis.analysisId} className="p-3 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Analyzing {analysis.coordinates}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {analysis.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">{analysis.currentStep}</div>
                    <Progress value={analysis.progress} className="h-2" />
                    <div className="text-xs text-right text-gray-500">{analysis.progress}%</div>
                  </div>
                </Card>
              ))}

              {/* Notifications */}
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs">Live updates will appear here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id} className={cn("p-3 transition-all hover:shadow-md", getSeverityColor(notification.severity))}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-0.5">
                          {getSeverityIcon(notification.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getTypeIcon(notification.type)}
                            <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                          </div>
                          <p className="text-xs text-gray-600 break-words">{notification.message}</p>
                          {notification.coordinates && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500 font-mono">{notification.coordinates}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
} 