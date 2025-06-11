"use client"

import React, { useState, Suspense, lazy } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Globe, Activity, Brain, Eye, MessageCircle, Database, Network, RefreshCw } from 'lucide-react';

// Lazy load all chat components as microservices
const LightweightUltimateChat = lazy(() => import("@/components/ui/lightweight-ultimate-chat"));
const AnimatedAIChat = lazy(() => import("@/components/ui/animated-ai-chat").then(module => ({ default: module.AnimatedAIChat })));

// Chat microservices registry - easily extensible
const chatServices = {
  lightweight: {
    name: 'Lightweight Ultimate',
    description: 'Fast, efficient chat with core archaeological features',
    icon: <Zap className="w-4 h-4" />,
    component: LightweightUltimateChat,
    features: ['File Upload', 'Coordinates', 'Performance Optimized', 'System Health'],
    status: 'online'
  },
  animated: {
    name: 'Animated AI Chat', 
    description: 'Beautiful animations and interactive experience',
    icon: <Globe className="w-4 h-4" />,
    component: AnimatedAIChat,
    features: ['Smooth Animations', 'Typing Effects', 'Command Palette', 'Message Display'],
    status: 'online'
  }
};

function ChatServiceLoader({ service }: { service: string }) {
  return (
    <div className="flex items-center justify-center h-64 bg-slate-900/50 rounded-lg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="text-slate-300">Loading {service} Microservice...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [activeService, setActiveService] = useState('lightweight');
  const [backendOnline, setBackendOnline] = useState(false);
  const [totalAgents, setTotalAgents] = useState(0);
  const [showServicePanel, setShowServicePanel] = useState(true);

  // Backend health monitoring
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/health');
        if (response.ok) {
          const data = await response.json();
          setBackendOnline(true);
          setTotalAgents(data.agents?.length || 5);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderActiveService = () => {
    const service = chatServices[activeService as keyof typeof chatServices];
    if (!service) return null;

    const Component = service.component;
    return (
      <Suspense fallback={<ChatServiceLoader service={service.name} />}>
        <div className="h-full">
          <Component 
            enableAnimations={true}
            onCoordinateSelect={(coords: { lat: number; lon: number }) => {
              console.log('Coordinates selected:', coords);
            }}
          />
        </div>
      </Suspense>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Microservices Control Panel */}
      {showServicePanel && (
        <div className="flex-shrink-0 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Database className="w-6 h-6 text-emerald-400" />
                  {backendOnline && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-semibold">Archaeological Chat Microservices Hub</h2>
                  <p className="text-xs text-slate-400">
                    {Object.keys(chatServices).length} services • {totalAgents} agents • Backend: {backendOnline ? '🟢 Online' : '🔴 Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServicePanel(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Hide Panel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Service Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(chatServices).map(([key, service]) => (
                <Button
                  key={key}
                  variant={activeService === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveService(key)}
                  className={`flex items-center gap-2 text-xs transition-all ${
                    activeService === key 
                      ? "bg-emerald-600 text-white shadow-lg scale-105" 
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {service.icon}
                  <span>{service.name}</span>
                  <Badge 
                    variant={service.status === 'online' ? 'default' : 'destructive'}
                    className="text-xs ml-1"
                  >
                    {service.status}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Active Service Details */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {chatServices[activeService as keyof typeof chatServices]?.icon}
                  <h3 className="text-sm font-semibold text-white">
                    {chatServices[activeService as keyof typeof chatServices]?.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  {chatServices[activeService as keyof typeof chatServices]?.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {chatServices[activeService as keyof typeof chatServices]?.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Show Panel Button (when hidden) */}
      {!showServicePanel && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowServicePanel(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Network className="w-4 h-4 mr-2" />
            Show Services
          </Button>
        </div>
      )}

      {/* Active Chat Service */}
      <div className="flex-1 overflow-hidden">
        {renderActiveService()}
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 bg-slate-800/30 border-t border-slate-700/50 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Active: {chatServices[activeService as keyof typeof chatServices]?.name}</span>
            <span>Features: {chatServices[activeService as keyof typeof chatServices]?.features.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Network className="w-3 h-3" />
            <span>{backendOnline ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 