import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Map,
  MessageSquare,
  BarChart3,
  Eye,
  Users,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  Zap,
  Activity,
  Globe,
  FileText,
  Layers,
  Command,
  Menu,
  X
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  description: string
  badge?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: <Home className="w-4 h-4" />,
    description: 'NIS Protocol Overview'
  },
  {
    name: 'Analysis',
    href: '/analysis',
    icon: <Brain className="w-4 h-4" />,
    description: 'Archaeological Analysis Hub',
    badge: 'AI',
    children: [
      {
        name: 'Site Discovery',
        href: '/analysis/discovery',
        icon: <Search className="w-4 h-4" />,
        description: 'Discover new archaeological sites'
      },
      {
        name: 'Cultural Analysis',
        href: '/analysis/cultural',
        icon: <Globe className="w-4 h-4" />,
        description: 'Cultural context and interpretation'
      },
      {
        name: 'Temporal Analysis',
        href: '/analysis/temporal',
        icon: <Activity className="w-4 h-4" />,
        description: 'Time-based archaeological patterns'
      }
    ]
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'AI-Powered Archaeological Chat',
    badge: 'Live'
  },
  {
    name: 'Vision',
    href: '/vision',
    icon: <Eye className="w-4 h-4" />,
    description: 'Satellite & Image Analysis',
    children: [
      {
        name: 'Satellite Analysis',
        href: '/satellite',
        icon: <Layers className="w-4 h-4" />,
        description: 'Satellite imagery analysis'
      },
      {
        name: 'Vision Analysis',
        href: '/vision-analysis',
        icon: <Eye className="w-4 h-4" />,
        description: 'Advanced computer vision'
      }
    ]
  },
  {
    name: 'Agents',
    href: '/agents',
    icon: <Users className="w-4 h-4" />,
    description: 'Multi-Agent Coordination',
    badge: '6 Active'
  },
  {
    name: 'Map',
    href: '/map',
    icon: <Map className="w-4 h-4" />,
    description: 'Interactive Archaeological Map'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Performance & Insights'
  },
  {
    name: 'Documentation',
    href: '/documentation',
    icon: <FileText className="w-4 h-4" />,
    description: 'NIS Protocol Documentation'
  }
]

interface EnhancedNavigationProps {
  className?: string
}

export function EnhancedNavigation({ className }: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [notifications, setNotifications] = useState(3)
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', href: '/' }]
    
    let currentPath = ''
    segments.forEach(segment => {
      currentPath += `/${segment}`
      const item = findNavigationItem(currentPath)
      if (item) {
        breadcrumbs.push({ name: item.name, href: currentPath })
      } else {
        breadcrumbs.push({ 
          name: segment.charAt(0).toUpperCase() + segment.slice(1), 
          href: currentPath 
        })
      }
    })
    
    return breadcrumbs
  }

  const findNavigationItem = (href: string): NavigationItem | null => {
    for (const item of navigationItems) {
      if (item.href === href) return item
      if (item.children) {
        const child = item.children.find(child => child.href === href)
        if (child) return child
      }
    }
    return null
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 text-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Breadcrumbs */}
      <div className="hidden lg:flex items-center space-x-2 px-6 py-3 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        {getBreadcrumbs().map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-500" />}
            <Link
              href={crumb.href}
              className={`text-sm hover:text-white transition-colors ${
                index === getBreadcrumbs().length - 1
                  ? 'text-white font-medium'
                  : 'text-slate-400'
              }`}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isOpen || isLargeScreen) && (
          <motion.nav
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 ${className}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">NIS Protocol</h1>
                    <p className="text-xs text-slate-400">Neural Intelligence System</p>
                  </div>
                </div>
                <div className="relative">
                  <Bell className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <div
                    className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive(item.href)
                        ? 'bg-violet-500/20 border border-violet-500/30 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                    }`}
                    onClick={() => {
                      if (item.children) {
                        toggleExpanded(item.name)
                      }
                    }}
                  >
                    <Link href={item.href} className="flex items-center space-x-3 flex-1">
                      <div className={`p-1.5 rounded-md ${
                        isActive(item.href)
                          ? 'bg-violet-500/30'
                          : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs bg-violet-500/20 text-violet-300 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 group-hover:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                    {item.children && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedItems.includes(item.name) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.children && expandedItems.includes(item.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-2 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                              isActive(child.href)
                                ? 'bg-violet-500/10 text-violet-300'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                            }`}
                          >
                            {child.icon}
                            <div>
                              <span className="text-sm font-medium">{child.name}</span>
                              <p className="text-xs text-slate-500">{child.description}</p>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>NIS v2.0.0</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 