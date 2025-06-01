"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { NISDataProvider } from '@/lib/context/nis-data-context'
import nisDataService from '@/lib/api/nis-data-service'

// ====================================================================
// COMPREHENSIVE APP INTEGRATION PROVIDER
// ====================================================================

interface AppDataState {
  isInitialized: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  systemStatus: {
    backend_online: boolean
    websocket_connected: boolean
    last_sync: string | null
    error_count: number
  }
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
    timestamp: string
    dismissed?: boolean
  }>
}

interface AppDataContextType extends AppDataState {
  refreshData: () => Promise<void>
  dismissNotification: (id: string) => void
  addNotification: (type: AppDataState['notifications'][0]['type'], message: string) => void
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined)

export function useAppData() {
  const context = useContext(AppDataContext)
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider')
  }
  return context
}

interface NISDataIntegrationProviderProps {
  children: ReactNode
}

export function NISDataIntegrationProvider({ children }: NISDataIntegrationProviderProps) {
  const [appState, setAppState] = useState<AppDataState>({
    isInitialized: false,
    connectionStatus: 'connecting',
    systemStatus: {
      backend_online: false,
      websocket_connected: false,
      last_sync: null,
      error_count: 0
    },
    notifications: []
  })

  // Initialize and set up data service listeners
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Mark as initialized
        setAppState(prev => ({
          ...prev,
          isInitialized: true,
          connectionStatus: nisDataService.isBackendOnline() ? 'connected' : 'disconnected',
          systemStatus: {
            ...prev.systemStatus,
            backend_online: nisDataService.isBackendOnline(),
            last_sync: new Date().toISOString()
          }
        }))

        console.log('NIS Protocol Agent initialized successfully')

        return () => {
          // Cleanup if needed
        }
      } catch (error) {
        console.error('App initialization error:', error)
        setAppState(prev => ({
          ...prev,
          connectionStatus: 'error',
          isInitialized: true
        }))
      }
    }

    initializeApp()
  }, [])

  // App context methods
  const refreshData = async () => {
    try {
      setAppState(prev => ({ ...prev, connectionStatus: 'connecting' }))
      
      // Force refresh system health and data
      await nisDataService.getSystemHealth()
      await nisDataService.getAgentStatus()
      
      setAppState(prev => ({
        ...prev,
        connectionStatus: 'connected',
        systemStatus: {
          ...prev.systemStatus,
          last_sync: new Date().toISOString()
        }
      }))
      
      addNotification('success', 'Data refreshed successfully')
    } catch (error) {
      setAppState(prev => ({ ...prev, connectionStatus: 'error' }))
      addNotification('error', 'Failed to refresh data')
    }
  }

  const dismissNotification = (id: string) => {
    setAppState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => 
        notif.id === id ? { ...notif, dismissed: true } : notif
      )
    }))
  }

  const addNotification = (type: AppDataState['notifications'][0]['type'], message: string) => {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString()
    }
    
    setAppState(prev => ({
      ...prev,
      notifications: [...prev.notifications.slice(-4), notification] // Keep only last 5
    }))

    // Auto-dismiss non-error notifications after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        dismissNotification(notification.id)
      }, 5000)
    }
  }

  const contextValue: AppDataContextType = {
    ...appState,
    refreshData,
    dismissNotification,
    addNotification
  }

  return (
    <AppDataContext.Provider value={contextValue}>
      <NISDataProvider>
        {children}
      </NISDataProvider>
    </AppDataContext.Provider>
  )
}

// ====================================================================
// NOTIFICATION SYSTEM COMPONENT
// ====================================================================

export function NotificationSystem() {
  const { notifications, dismissNotification } = useAppData()
  
  const activeNotifications = notifications.filter(n => !n.dismissed)
  
  if (activeNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {activeNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border transition-all duration-300 ${
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="ml-2 text-lg leading-none opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ====================================================================
// STATUS BAR COMPONENT
// ====================================================================

export function StatusBar() {
  const { systemStatus, connectionStatus } = useAppData()
  
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
          'bg-red-500'
        }`}></div>
        <span>
          {connectionStatus === 'connected' ? 'Backend Online' :
           connectionStatus === 'connecting' ? 'Connecting...' :
           'Offline Mode'}
        </span>
      </div>
      
      {systemStatus.websocket_connected && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <span>Real-time</span>
        </div>
      )}
      
      {systemStatus.last_sync && (
        <span>
          Last sync: {new Date(systemStatus.last_sync).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
} 