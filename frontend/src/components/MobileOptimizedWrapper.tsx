// Mobile Optimization Wrapper - Enhances mobile experience across all components
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Menu, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Settings,
  Filter,
  Search,
  Map,
  Eye,
  FileText,
  Activity,
  Download,
  Share,
  Bookmark,
  History,
  Compass,
  Layers,
  Target,
  Globe
} from 'lucide-react'
import { 
  isMobile, 
  isTablet, 
  useBreakpoint, 
  getChatPanelWidth, 
  getSidebarWidth,
  getMapDimensions,
  archaeologicalMapConfig
} from '../lib/responsive'

// Mobile gesture detection
interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longpress'
  direction?: 'up' | 'down' | 'left' | 'right'
  deltaX?: number
  deltaY?: number
  scale?: number
  duration?: number
}

// Mobile layout modes
type MobileLayout = 'compact' | 'expanded' | 'overlay' | 'split'

// Mobile-specific props
interface MobileOptimizedWrapperProps {
  children: React.ReactNode
  title?: string
  showToolbar?: boolean
  allowGestures?: boolean
  persistLayout?: boolean
  className?: string
  // Quick actions for mobile
  quickActions?: Array<{
    id: string
    label: string
    icon: React.ComponentType<any>
    action: () => void
    badge?: string
  }>
  // Navigation items optimized for mobile
  mobileNavItems?: Array<{
    id: string
    label: string
    icon: React.ComponentType<any>
    component: React.ComponentType<any>
    badge?: string
  }>
}

export default function MobileOptimizedWrapper({
  children,
  title = "NIS Archaeological Platform",
  showToolbar = true,
  allowGestures = true,
  persistLayout = true,
  className = '',
  quickActions = [],
  mobileNavItems = []
}: MobileOptimizedWrapperProps) {
  // Mobile state management
  const [layout, setLayout] = useState<MobileLayout>('compact')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [touchState, setTouchState] = useState<any>({})
  
  // Refs for gesture detection
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<TouchEvent | null>(null)
  
  // Responsive state
  const isMobileDevice = isMobile()
  const isTabletDevice = isTablet()
  const breakpoint = useBreakpoint()

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    handleOrientationChange()
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [])

  // Detect virtual keyboard
  useEffect(() => {
    if (!isMobileDevice) return

    const initialHeight = window.innerHeight
    
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDifference = initialHeight - currentHeight
      setIsKeyboardOpen(heightDifference > 150) // Threshold for keyboard detection
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileDevice])

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!allowGestures) return
    touchStartRef.current = e
    
    setTouchState({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      startTime: Date.now(),
      touches: e.touches.length
    })
  }, [allowGestures])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!allowGestures || !touchStartRef.current) return
    
    const touchEnd = e.changedTouches[0]
    const { startX, startY, startTime } = touchState
    
    const deltaX = touchEnd.clientX - startX
    const deltaY = touchEnd.clientY - startY
    const duration = Date.now() - startTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Detect gesture type
    if (duration < 300 && distance < 10) {
      // Tap
      handleGesture({ type: 'tap', duration })
    } else if (distance > 50) {
      // Swipe
      const direction = Math.abs(deltaX) > Math.abs(deltaY) 
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up')
      
      handleGesture({ type: 'swipe', direction, deltaX, deltaY })
    }
    
    touchStartRef.current = null
  }, [touchState, allowGestures])

  // Gesture handler
  const handleGesture = useCallback((gesture: TouchGesture) => {
    console.log('📱 Mobile gesture detected:', gesture)
    
    switch (gesture.type) {
      case 'swipe':
        if (gesture.direction === 'right' && !isMenuOpen) {
          setIsMenuOpen(true)
        } else if (gesture.direction === 'left' && isMenuOpen) {
          setIsMenuOpen(false)
        } else if (gesture.direction === 'up') {
          setLayout('expanded')
        } else if (gesture.direction === 'down') {
          setLayout('compact')
        }
        break
        
      case 'tap':
        // Handle tap-specific logic
        break
    }
  }, [isMenuOpen])

  // Set up touch listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container || !allowGestures) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd, allowGestures])

  // Default quick actions for archaeological platform
  const defaultQuickActions = [
    {
      id: 'coordinates',
      label: 'Coordinates',
      icon: Target,
      action: () => setActivePanel('coordinates'),
      badge: undefined
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: Search,
      action: () => setActivePanel('discover'),
      badge: undefined
    },
    {
      id: 'map',
      label: 'Map',
      icon: Map,
      action: () => setActivePanel('map'),
      badge: undefined
    },
    {
      id: 'vision',
      label: 'Vision',
      icon: Eye,
      action: () => setActivePanel('vision'),
      badge: undefined
    }
  ]

  // Default navigation items
  const defaultNavItems = [
    { id: 'map', label: 'Map', icon: Map, component: () => <div>Map Component</div>, badge: undefined },
    { id: 'chat', label: 'Chat', icon: FileText, component: () => <div>Chat Component</div>, badge: undefined },
    { id: 'analysis', label: 'Analysis', icon: Eye, component: () => <div>Analysis Component</div>, badge: undefined },
    { id: 'monitoring', label: 'Monitor', icon: Activity, component: () => <div>Monitor Component</div>, badge: undefined },
    { id: 'export', label: 'Export', icon: Download, component: () => <div>Export Component</div>, badge: undefined }
  ]

  const currentQuickActions = quickActions.length > 0 ? quickActions : defaultQuickActions
  const currentNavItems = mobileNavItems.length > 0 ? mobileNavItems : defaultNavItems

  // Mobile toolbar
  const renderMobileToolbar = () => {
    if (!showToolbar || !isMobileDevice) return null

    return (
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="font-semibold text-lg truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {orientation}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayout(layout === 'compact' ? 'expanded' : 'compact')}
            >
              {layout === 'compact' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Quick action bar
  const renderQuickActions = () => {
    if (!isMobileDevice || currentQuickActions.length === 0) return null

    return (
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t"
        initial={{ y: 100 }}
        animate={{ y: isKeyboardOpen ? 100 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-around p-2">
          {currentQuickActions.map(action => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{action.label}</span>
                {action.badge && (
                  <Badge variant="destructive" className="text-xs h-4 min-w-4 p-0 flex items-center justify-center">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // Mobile navigation drawer
  const renderMobileNav = () => {
    if (!isMobileDevice) return null

    return (
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {currentNavItems.map(item => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setActivePanel(item.id)
                      setIsMenuOpen(false)
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>

            <Separator className="my-4" />

            {/* Mobile-specific options */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Mobile Options</h3>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => setLayout(layout === 'compact' ? 'expanded' : 'compact')}
              >
                {layout === 'compact' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                {layout === 'compact' ? 'Expand View' : 'Compact View'}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  // Content wrapper with mobile optimizations
  const renderContent = () => {
    const paddingTop = showToolbar && isMobileDevice ? 'pt-16' : ''
    const paddingBottom = isMobileDevice && currentQuickActions.length > 0 ? 'pb-20' : ''
    
    return (
      <div 
        className={`
          ${paddingTop} ${paddingBottom} ${className}
          ${layout === 'compact' && isMobileDevice ? 'px-2' : 'px-4'}
          ${isKeyboardOpen ? 'pb-0' : ''}
        `}
      >
        <motion.div
          layout
          className={`
            ${layout === 'expanded' ? 'min-h-screen' : ''}
          `}
        >
          {children}
        </motion.div>
      </div>
    )
  }

  // Mobile-specific panel overlay
  const renderMobilePanels = () => {
    if (!activePanel || !isMobileDevice) return null

    const panelComponent = currentNavItems.find(item => item.id === activePanel)?.component
    if (!panelComponent) return null

    return (
      <Drawer open={!!activePanel} onOpenChange={(open) => !open && setActivePanel(null)}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>
              {currentNavItems.find(item => item.id === activePanel)?.label}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex-1 overflow-auto">
            {React.createElement(panelComponent)}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Don't render mobile optimizations on desktop
  if (!isMobileDevice && !isTabletDevice) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {renderMobileToolbar()}
      {renderMobileNav()}
      {renderContent()}
      {renderQuickActions()}
      {renderMobilePanels()}
      
      {/* Gesture hint */}
      {allowGestures && (
        <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg p-2">
          Swipe right for menu
        </div>
      )}
    </div>
  )
}

// Export mobile utilities
export { isMobile, isTablet, useBreakpoint }
export type { MobileLayout, TouchGesture } 