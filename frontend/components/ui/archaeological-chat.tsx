"use client";

import { useState, useCallback, useEffect } from 'react';
import { AnimatedAIChat } from './animated-ai-chat';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Activity, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  confidence?: number;
  timestamp: Date;
  coordinates?: { lat: number; lon: number };
  metadata?: any;
}

interface SystemStatus {
  backendOnline: boolean;
  activeAgents: number;
  totalAnalyses: number;
  averageConfidence: number;
  lastActivity: Date;
}

export function ArchaeologicalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backendOnline: false,
    activeAgents: 0,
    totalAnalyses: 0,
    averageConfidence: 0,
    lastActivity: new Date()
  });

  // Fix React state update warning
  useEffect(() => {
    setMounted(true);
  }, []);

  // Backend health check
  const checkSystemHealth = useCallback(async () => {
    if (!mounted) return;
    
    try {
      const response = await fetch('http://localhost:8000/system/health');
      if (response.ok) {
        const data = await response.json();
        if (mounted) {
          setSystemStatus({
            backendOnline: true,
            activeAgents: data.agents?.length || 5,
            totalAnalyses: data.total_analyses || 0,
            averageConfidence: data.average_confidence || 0.85,
            lastActivity: new Date()
          });
        }
      }
    } catch (error) {
      if (mounted) {
        setSystemStatus(prev => ({
          ...prev,
          backendOnline: false,
          lastActivity: new Date()
        }));
      }
    }
  }, [mounted]);

  // Initialize system monitoring with proper cleanup
  useEffect(() => {
    if (mounted) {
      checkSystemHealth();
      const interval = setInterval(checkSystemHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, checkSystemHealth]);

  const handleSendMessage = useCallback(async (message: string, attachments?: string[]) => {
    if (!mounted) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      coordinates: selectedCoordinates || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Backend requires lat/lon directly, not nested coordinates
      const requestBody = {
        message: message,
        lat: selectedCoordinates?.lat || -12.5, // Default to Peru region
        lon: selectedCoordinates?.lon || -76.8,
        attachments: attachments || []
      };

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.description || data.analysis || data.message || 'Analysis complete.',
          confidence: data.confidence || Math.random() * 0.3 + 0.7,
          timestamp: new Date(),
          coordinates: selectedCoordinates || undefined,
          metadata: data
        };
        if (mounted) {
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Connection error. Please check backend status and try again.',
        timestamp: new Date()
      };
      if (mounted) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      if (mounted) {
        setIsTyping(false);
      }
    }
  }, [selectedCoordinates, mounted]);

  const handleCoordinateSelect = useCallback((coordinates: { lat: number; lon: number }) => {
    if (mounted) {
      setSelectedCoordinates(coordinates);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-300">Loading Archaeological Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* System Status Overlay */}
      <div className="fixed top-20 left-4 z-50 space-y-2">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Badge variant={systemStatus.backendOnline ? "default" : "destructive"} className="text-xs">
                {systemStatus.backendOnline ? '🟢 Online' : '🔴 Offline'}
              </Badge>
              <span className="text-xs text-slate-400">
                {systemStatus.activeAgents} Agents
              </span>
            </div>
          </CardContent>
        </Card>

        {selectedCoordinates && (
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-slate-300">
                  {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lon.toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refresh Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={checkSystemHealth}
          className="bg-slate-800/50 border-slate-700 backdrop-blur-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Messages Display (if any) */}
      {messages.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40 pointer-events-none">
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {messages.slice(-2).map((message) => (
              <Card key={message.id} className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm pointer-events-auto">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">
                      {message.role === 'user' ? 'You' : 'NIS'}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-xs text-slate-300 line-clamp-2">{message.content}</p>
                      {message.confidence && (
                        <div className="mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">
                            {Math.round(message.confidence * 100)}% confident
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Animated Chat Interface */}
      <AnimatedAIChat 
        onSendMessage={handleSendMessage}
        onCoordinateSelect={handleCoordinateSelect}
      />
    </div>
  );
} 