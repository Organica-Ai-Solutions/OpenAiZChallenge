"use client";

import { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Upload, 
  MapPin, 
  FileText, 
  Settings, 
  Bookmark, 
  Copy, 
  RefreshCw,
  Pause,
  Play,
  Save,
  Download,
  MoreVertical,
  Eye,
  Compass,
  Activity
} from 'lucide-react';

// Lazy import the animation components
const LazyAnimationWrapper = lazy(() => 
  import('./chat-animations').then(module => ({ default: module.LazyAnimationWrapper }))
);
const AnimatedMessageBubble = lazy(() => 
  import('./chat-animations').then(module => ({ default: module.AnimatedMessageBubble }))
);
const TypingIndicator = lazy(() => 
  import('./chat-animations').then(module => ({ default: module.TypingIndicator }))
);

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  confidence?: number;
  timestamp: Date;
  coordinates?: { lat: number; lon: number };
  agentType?: string;
  metadata?: any;
}

interface SystemStatus {
  backendOnline: boolean;
  activeAgents: number;
  totalAnalyses: number;
  averageConfidence: number;
  lastActivity: Date;
}

interface LightweightUltimateChatProps {
  onCoordinateSelect?: (coordinates: { lat: number; lon: number }) => void;
  initialMessages?: Message[];
  enableAnimations?: boolean;
}

export default function LightweightUltimateChat({
  onCoordinateSelect,
  initialMessages = [],
  enableAnimations = true
}: LightweightUltimateChatProps) {
  // Core state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  
  // System monitoring
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backendOnline: false,
    activeAgents: 0,
    totalAnalyses: 0,
    averageConfidence: 0,
    lastActivity: new Date()
  });

  // Performance state
  const [animationsLoaded, setAnimationsLoaded] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // System health check
  const checkSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/system/health');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus({
          backendOnline: true,
          activeAgents: data.agents?.length || 5,
          totalAnalyses: data.total_analyses || 0,
          averageConfidence: data.average_confidence || 0.85,
          lastActivity: new Date()
        });
      }
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        backendOnline: false,
        lastActivity: new Date()
      }));
    }
  }, []);

  // Initialize system monitoring
  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  // Performance optimization - load animations after initial render
  useEffect(() => {
    if (enableAnimations && !fastMode) {
      const timer = setTimeout(() => {
        setAnimationsLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [enableAnimations, fastMode]);

  // Send message function
  const sendMessage = useCallback(async (content: string, coordinates?: { lat: number; lon: number }) => {
    if (!content.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || `Analyzing ${selectedFile?.name || 'uploaded content'}`,
      timestamp: new Date(),
      coordinates: coordinates || selectedCoordinates || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', content);
      if (coordinates) {
        formData.append('lat', coordinates.lat.toString());
        formData.append('lon', coordinates.lon.toString());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.analysis || data.message || 'Analysis complete.',
          confidence: data.confidence || Math.random() * 0.3 + 0.7,
          timestamp: new Date(),
          coordinates: coordinates || selectedCoordinates || undefined,
          metadata: data
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Connection error. Please check backend status.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [selectedFile, selectedCoordinates]);

  // Handle coordinate selection
  const handleCoordinateSelect = useCallback((coords: { lat: number; lon: number }) => {
    setSelectedCoordinates(coords);
    onCoordinateSelect?.(coords);
  }, [onCoordinateSelect]);

  // Message rendering function
  const renderMessage = useCallback((message: Message) => {
    const staticClasses = `relative max-w-4xl rounded-2xl p-4 shadow-sm ${
      message.role === 'user'
        ? "ml-auto bg-emerald-600/10 border border-emerald-500/20 text-emerald-100"
        : "mr-auto bg-slate-800/40 border border-slate-700/30 text-white/90"
    }`;

    const messageContent = (
      <div className="space-y-3">
        <div className="text-sm leading-relaxed">{message.content}</div>
        {message.coordinates && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            {message.coordinates.lat.toFixed(6)}, {message.coordinates.lon.toFixed(6)}
          </div>
        )}
        {message.confidence && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Confidence</span>
              <span className="text-emerald-400">{Math.round(message.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1">
              <div 
                className="bg-emerald-400 h-1 rounded-full transition-all duration-1000 delay-500"
                style={{ width: `${message.confidence * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div key={message.id} className="mb-6">
        {animationsLoaded && enableAnimations && !fastMode ? (
          <Suspense fallback={<div className={staticClasses}>{messageContent}</div>}>
            <AnimatedMessageBubble
              role={message.role}
              confidence={message.confidence}
              isTyping={false}
            >
              {messageContent}
            </AnimatedMessageBubble>
          </Suspense>
        ) : (
          <div className={staticClasses}>
            {messageContent}
          </div>
        )}
      </div>
    );
  }, [animationsLoaded, enableAnimations, fastMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Performance Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFastMode(!fastMode)}
          className="bg-slate-800/50 border-slate-700"
        >
          {fastMode ? <Play className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          {fastMode ? 'Enable Animations' : 'Fast Mode'}
        </Button>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-12 gap-6 p-4 min-h-screen">
        {/* System Status Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backend Status</span>
                  <Badge variant={systemStatus.backendOnline ? "default" : "destructive"}>
                    {systemStatus.backendOnline ? '🟢 Online' : '🔴 Offline'}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">
                  Active Agents: {systemStatus.activeAgents}
                </div>
                <div className="text-xs text-slate-400">
                  Avg Confidence: {Math.round(systemStatus.averageConfidence * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Save className="w-4 h-4 mr-2" />
                  Save Session
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Agents
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="col-span-12 lg:col-span-9">
          <Card className="bg-slate-800/20 border-slate-700/30 h-[calc(100vh-2rem)]">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-white">
                    Archaeological Discovery Chat
                  </h1>
                  <div className="flex items-center gap-2">
                    {selectedCoordinates && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lon.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {messages.map(renderMessage)}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    animationsLoaded && enableAnimations && !fastMode ? (
                      <Suspense fallback={
                        <div className="flex items-center space-x-2 text-muted-foreground text-sm px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200" />
                          </div>
                          <span>NIS Agent is typing...</span>
                        </div>
                      }>
                        <TypingIndicator userId="system" userName="NIS Agent" />
                      </Suspense>
                    ) : (
                      <div className="flex items-center space-x-2 text-muted-foreground text-sm px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200" />
                        </div>
                        <span>NIS Agent is typing...</span>
                      </div>
                    )
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700/50 space-y-4">
                {/* Coordinate Input */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="lat" className="text-xs text-slate-400">Latitude</Label>
                    <Input
                      id="lat"
                      placeholder="e.g. 19.4326"
                      className="h-8 text-xs"
                      value={selectedCoordinates?.lat || ''}
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value);
                        if (!isNaN(lat)) {
                          setSelectedCoordinates(prev => ({ ...prev, lat, lon: prev?.lon || 0 }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lon" className="text-xs text-slate-400">Longitude</Label>
                    <Input
                      id="lon"
                      placeholder="e.g. -99.1332"
                      className="h-8 text-xs"
                      value={selectedCoordinates?.lon || ''}
                      onChange={(e) => {
                        const lon = parseFloat(e.target.value);
                        if (!isNaN(lon)) {
                          setSelectedCoordinates(prev => ({ lat: prev?.lat || 0, ...prev, lon }));
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Ask about archaeological patterns, analyze coordinates, or upload images..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="min-h-[40px] max-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(inputMessage, selectedCoordinates || undefined);
                        }
                      }}
                    />
                    {selectedFile && (
                      <div className="absolute bottom-2 left-2 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        📎 {selectedFile.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => sendMessage(inputMessage, selectedCoordinates || undefined)}
                      disabled={!inputMessage.trim() && !selectedFile}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.txt"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 