"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2,
  MoreVertical,
  Settings,
  History,
  Download,
  Share2,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileChatLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  input?: React.ReactNode;
  className?: string;
}

export function MobileChatLayout({
  children,
  header,
  sidebar,
  input,
  className
}: MobileChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const layoutRef = useRef<HTMLDivElement>(null);
  const initialViewportHeight = useRef<number>(0);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect virtual keyboard on mobile
  useEffect(() => {
    if (screenSize === 'mobile') {
      initialViewportHeight.current = window.visualViewport?.height || window.innerHeight;
      
      const handleViewportChange = () => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDiff = initialViewportHeight.current - currentHeight;
        setIsKeyboardVisible(heightDiff > 150); // Threshold for keyboard detection
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
        return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
      }
    }
  }, [screenSize]);

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (screenSize === 'mobile' && isSidebarOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-sidebar]') && !target.closest('[data-sidebar-toggle]')) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, screenSize]);

  const getLayoutClasses = () => {
    const base = "flex flex-col h-full transition-all duration-300";
    
    if (isMinimized) {
      return cn(base, "h-16");
    }
    
    if (isFullscreen) {
      return cn(base, "fixed inset-0 z-50 bg-slate-900");
    }
    
    return base;
  };

  const getChatAreaClasses = () => {
    const base = "flex-1 flex flex-col min-h-0 relative";
    
    if (screenSize === 'mobile') {
      return cn(base, "pb-safe-bottom");
    }
    
    return base;
  };

  const getMessagesClasses = () => {
    const base = "flex-1 overflow-y-auto px-4 py-2";
    
    if (isKeyboardVisible) {
      return cn(base, "pb-2");
    }
    
    return cn(base, "pb-4");
  };

  const getInputClasses = () => {
    const base = "flex-shrink-0 p-4 border-t border-white/[0.1]";
    
    if (screenSize === 'mobile') {
      return cn(base, "pb-safe-bottom sticky bottom-0 bg-slate-900/95 backdrop-blur-md");
    }
    
    return base;
  };

  const ScreenSizeIndicator = () => (
    <div className="flex items-center gap-1 text-xs text-slate-500">
      {screenSize === 'mobile' && <Smartphone className="w-3 h-3" />}
      {screenSize === 'tablet' && <Tablet className="w-3 h-3" />}
      {screenSize === 'desktop' && <Monitor className="w-3 h-3" />}
      <span className="capitalize">{screenSize}</span>
    </div>
  );

  const QuickActionsMenu = () => (
    <AnimatePresence>
      {showQuickActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-0 top-full mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl py-2 min-w-48 z-50"
        >
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <History className="w-4 h-4" />
            Chat History
          </button>
          
          <div className="h-px bg-slate-700/50 my-1" />
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors">
            <Download className="w-4 h-4" />
            Export Chat
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={layoutRef}
      className={cn(getLayoutClasses(), className)}
      style={{
        height: isKeyboardVisible ? `${window.visualViewport?.height}px` : '100%'
      }}
    >
      {/* Header */}
      {!isMinimized && (
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/[0.1] bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            {screenSize === 'mobile' && (
              <button
                data-sidebar-toggle
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Header Content */}
            <div className="flex items-center gap-2">
              {header}
              {screenSize !== 'desktop' && <ScreenSizeIndicator />}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {screenSize === 'desktop' && <ScreenSizeIndicator />}
            
            {/* Minimize/Maximize Toggle */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <QuickActionsMenu />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!isMinimized && (
        <div className="flex-1 flex min-h-0 relative">
          {/* Sidebar */}
          <AnimatePresence>
            {(isSidebarOpen || (screenSize === 'desktop' && sidebar)) && (
              <motion.div
                data-sidebar
                initial={screenSize === 'mobile' ? { x: -280 } : { width: 0 }}
                animate={screenSize === 'mobile' ? { x: 0 } : { width: 280 }}
                exit={screenSize === 'mobile' ? { x: -280 } : { width: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={cn(
                  "bg-slate-800/50 border-r border-white/[0.1] overflow-hidden",
                  screenSize === 'mobile' 
                    ? "fixed inset-y-0 left-0 z-40 w-70 shadow-xl" 
                    : "relative"
                )}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.1]">
                  <h3 className="text-sm font-medium text-slate-300">Chat History</h3>
                  {screenSize === 'mobile' && (
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                  {sidebar}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Overlay */}
          {screenSize === 'mobile' && isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Chat Area */}
          <div className={getChatAreaClasses()}>
            {/* Messages */}
            <div className={getMessagesClasses()}>
              {children}
            </div>

            {/* Input Area */}
            <div className={getInputClasses()}>
              {input}
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            NIS Chat Agent
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Utility hook for mobile-specific features
export function useMobileChat() {
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && window.visualViewport) {
      const handleViewportChange = () => {
        const heightDiff = window.innerHeight - (window.visualViewport?.height || 0);
        setIsKeyboardVisible(heightDiff > 150);
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }
  }, [isMobile]);

  return {
    isMobile,
    isKeyboardVisible,
    orientation,
    safeAreaInsets: {
      top: 'env(safe-area-inset-top)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)',
      right: 'env(safe-area-inset-right)'
    }
  };
} 