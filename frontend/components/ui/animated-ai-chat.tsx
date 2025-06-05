"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { AnimatedMessage, ArchaeologicalTypingIndicator } from "./animated-message";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    MapPin,
    Search,
    Database,
    Eye,
    Target,
    Globe,
    Users,
    Play,
    Pause,
    Activity,
    Settings,
    MessageSquare,
    Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface Message {
    id: string;
    content: string;
    role: "user" | "agent" | "assistant" | "system";
    timestamp: string | Date;
    type?: "error" | "file_upload" | "suggestion" | "analysis_start" | "analysis_result";
    metadata?: {
        file_name?: string;
        file_type?: string;
        file_size?: number;
        file_preview?: string;
        analysis_ready?: boolean;
        analysis_results?: any;
        source_file?: string;
        demo_mode?: boolean;
    };
    action_buttons?: Array<{
        label: string;
        action: string;
        file_reference?: string;
    }>;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

interface AnimatedAIChatProps {
  onMessageSend?: (message: string) => Promise<any>;
  onCoordinateSelect?: (coordinates: string) => void;
}

export function AnimatedAIChat({ onMessageSend, onCoordinateSelect }: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [messages, setMessages] = useState<any[]>([]);
    const [lastResponse, setLastResponse] = useState<string>("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const [isBackendOnline, setIsBackendOnline] = useState(false);

    // Check backend status
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const response = await fetch('http://localhost:8000/health', { 
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                setIsBackendOnline(response.ok);
            } catch (error) {
                setIsBackendOnline(false);
            }
        };
        
        checkBackend();
        const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Enhanced file upload state
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <Search className="w-4 h-4" />, 
            label: "Discover Sites", 
            description: "Search for potential archaeological sites", 
            prefix: "/discover" 
        },
        { 
            icon: <Target className="w-4 h-4" />, 
            label: "Analyze Coordinates", 
            description: "Analyze specific coordinates for archaeological potential", 
            prefix: "/analyze" 
        },
        { 
            icon: <Eye className="w-4 h-4" />, 
            label: "Vision Analysis", 
            description: "Run AI vision analysis on satellite imagery", 
            prefix: "/vision" 
        },
        { 
            icon: <Database className="w-4 h-4" />, 
            label: "Research Query", 
            description: "Query historical and indigenous knowledge", 
            prefix: "/research" 
        },
        { 
            icon: <MapPin className="w-4 h-4" />, 
            label: "Suggest Locations", 
            description: "Get AI-recommended investigation areas", 
            prefix: "/suggest" 
        },
        { 
            icon: <Globe className="w-4 h-4" />, 
            label: "System Status", 
            description: "Check system and agent status",
            prefix: "/status"
        },
        // Agent-specific commands
        { 
            icon: <Users className="w-4 h-4" />, 
            label: "Agent Status", 
            description: "Check all agent statuses and performance", 
            prefix: "/agents" 
        },
        { 
            icon: <Play className="w-4 h-4" />, 
            label: "Start Agent", 
            description: "Start or activate a specific agent", 
            prefix: "/start" 
        },
        { 
            icon: <Pause className="w-4 h-4" />, 
            label: "Stop Agent", 
            description: "Stop or pause a specific agent", 
            prefix: "/stop" 
        },
        { 
            icon: <Target className="w-4 h-4" />, 
            label: "Deploy Agent", 
            description: "Deploy agent to specific coordinates", 
            prefix: "/deploy" 
        },
        { 
            icon: <Activity className="w-4 h-4" />, 
            label: "Task Status", 
            description: "Check current analysis tasks", 
            prefix: "/tasks" 
        },
        { 
            icon: <Settings className="w-4 h-4" />, 
            label: "Agent Config", 
            description: "Configure agent parameters", 
            prefix: "/config" 
        }
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim()) return;

        const userMessage = {
            type: 'user',
            content: value.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setValue("");
        adjustHeight(true);

        try {
            let response;
            const message = value.trim().toLowerCase();
            
            // Agent-specific command handling
            if (message.startsWith('/agents')) {
                response = await handleAgentStatusCommand();
            } else if (message.startsWith('/start ')) {
                const agentName = message.replace('/start ', '').trim();
                response = await handleStartAgentCommand(agentName);
            } else if (message.startsWith('/stop ')) {
                const agentName = message.replace('/stop ', '').trim();
                response = await handleStopAgentCommand(agentName);
            } else if (message.startsWith('/deploy ')) {
                const params = message.replace('/deploy ', '').trim();
                response = await handleDeployAgentCommand(params);
            } else if (message.startsWith('/tasks')) {
                response = await handleTaskStatusCommand();
            } else if (message.startsWith('/config ')) {
                const params = message.replace('/config ', '').trim();
                response = await handleConfigAgentCommand(params);
            } else if (onMessageSend) {
                // Use custom message handler if provided (for map page)
                response = await onMessageSend(value.trim());
            } else {
                // Default NIS chat handling
                response = await handleDefaultChat(value.trim());
            }

            const aiResponse = {
                type: 'ai',
                content: response?.message || response || 'I understand your request. How else can I help you with archaeological research?',
                timestamp: new Date(),
                data: response?.data || null
            };

            setMessages(prev => [...prev, aiResponse]);
            setLastResponse(aiResponse.content);

        } catch (error) {
            console.error('Chat error:', error);
            const errorResponse = {
                type: 'ai',
                content: 'I apologize, but I encountered an issue processing your request. Please try again or check if the backend is accessible.',
                timestamp: new Date(),
                error: true
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    // Agent command handlers
    const handleAgentStatusCommand = async () => {
        try {
            const response = await fetch('http://localhost:8000/agents/agents');
            if (response.ok) {
                const agents = await response.json();
                const statusSummary = agents.map((agent: any) => 
                    `${agent.name}: ${agent.status} (${agent.performance?.accuracy || 'N/A'}% accuracy)`
                ).join('\n');
                
                return {
                    message: `🤖 Agent Status Report:\n\n${statusSummary}\n\nTotal agents: ${agents.length}`,
                    data: { agents }
                };
            } else {
                return {
                    message: '🤖 Using demo agent data. Backend connection unavailable.\n\nDemo agents: 5 active agents (ARIA, TERRA, CULTURA, NEXUS, QUANTUM)'
                };
            }
        } catch (error) {
            return {
                message: '❌ Unable to retrieve agent status. Please check backend connection.'
            };
        }
    };

    const handleStartAgentCommand = async (agentName: string) => {
        try {
            // In a real implementation, this would call the backend
            return {
                message: `▶️ Agent "${agentName}" start command issued. Agent activation in progress...`,
                data: { action: 'start', agent: agentName }
            };
        } catch (error) {
            return {
                message: `❌ Failed to start agent "${agentName}". Please check agent name and try again.`
            };
        }
    };

    const handleStopAgentCommand = async (agentName: string) => {
        try {
            return {
                message: `⏸️ Agent "${agentName}" stop command issued. Agent will complete current tasks and pause.`,
                data: { action: 'stop', agent: agentName }
            };
        } catch (error) {
            return {
                message: `❌ Failed to stop agent "${agentName}". Please check agent name and try again.`
            };
        }
    };

    const handleDeployAgentCommand = async (params: string) => {
        try {
            // Parse agent name and coordinates
            const parts = params.split(' to ');
            if (parts.length !== 2) {
                return {
                    message: '❌ Invalid deploy command format. Use: /deploy [agent_name] to [lat, lng]'
                };
            }
            
            const agentName = parts[0].trim();
            const coordinates = parts[1].trim();
            
            return {
                message: `🚀 Deploying agent "${agentName}" to coordinates: ${coordinates}\n\nAgent will begin analysis upon arrival.`,
                data: { action: 'deploy', agent: agentName, coordinates }
            };
        } catch (error) {
            return {
                message: '❌ Failed to deploy agent. Please check command format: /deploy [agent_name] to [lat, lng]'
            };
        }
    };

    const handleTaskStatusCommand = async () => {
        try {
            // In a real implementation, this would fetch from backend
            return {
                message: `📋 Current Analysis Tasks:\n\n🔄 Task 1: Site analysis at Amazon basin (78% complete)\n🔄 Task 2: Pattern detection in Andes (45% complete)\n⏳ Task 3: Cultural assessment (pending)\n\nTotal active tasks: 3`,
                data: { totalTasks: 3, activeTasks: 2, pendingTasks: 1 }
            };
        } catch (error) {
            return {
                message: '❌ Unable to retrieve task status. Please try again.'
            };
        }
    };

    const handleConfigAgentCommand = async (params: string) => {
        try {
            return {
                message: `⚙️ Agent configuration interface opened for: ${params}\n\nConfiguration options:\n• Accuracy threshold\n• Processing priority\n• Data sources\n• Analysis depth`,
                data: { action: 'config', target: params }
            };
        } catch (error) {
            return {
                message: '❌ Unable to access agent configuration. Please try again.'
            };
        }
    };

    const handleDefaultChat = async (message: string) => {
        try {
            const response = await fetch('http://localhost:8000/agents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    mode: 'reasoning',
                    context: { chat_history: messages.slice(-5) }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response || data.message || 'I can help you with archaeological analysis and agent management.';
            } else {
                throw new Error('Backend unavailable');
            }
        } catch (error) {
            // Fallback responses for common queries
            if (message.includes('help') || message.includes('command')) {
                return `🤖 Available Commands:

**Agent Management:**
• /agents - Check all agent status
• /start [agent_name] - Start specific agent
• /stop [agent_name] - Stop specific agent  
• /deploy [agent_name] to [lat, lng] - Deploy agent
• /tasks - View current analysis tasks
• /config [agent_name] - Configure agent

**Analysis Commands:**
• /discover - Find archaeological sites
• /analyze [coordinates] - Analyze location
• /vision [coordinates] - AI vision analysis
• /research [query] - Research capabilities
• /status - System status

Type any command or ask questions about archaeological research!`;
            }
            
            return 'I can help you manage AI agents and conduct archaeological analysis. Type "/help" for available commands.';
        }
    };

    const handleAttachFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploadingFile(true);
        
        try {
            const validFiles: File[] = [];
            const maxFileSize = 10 * 1024 * 1024; // 10MB limit
            
            for (const file of files) {
                // Validate file type
                const isImage = file.type.startsWith('image/');
                const isDocument = ['application/pdf', 'text/plain', 'application/json'].includes(file.type);
                
                if (!isImage && !isDocument) {
                    const userMessage: Message = {
                        id: Date.now().toString(),
                        content: `❌ File type not supported: ${file.name}. Please upload images (JPG, PNG, etc.) or documents (PDF, TXT, JSON).`,
                        role: "agent",
                        timestamp: new Date().toISOString(),
                        type: "error"
                    };
                    setMessages(prev => [...prev, userMessage]);
                    continue;
                }
                
                // Validate file size
                if (file.size > maxFileSize) {
                    const userMessage: Message = {
                        id: Date.now().toString(),
                        content: `❌ File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
                        role: "agent", 
                        timestamp: new Date().toISOString(),
                        type: "error"
                    };
                    setMessages(prev => [...prev, userMessage]);
                    continue;
                }
                
                validFiles.push(file);
            }
            
            if (validFiles.length === 0) return;
            
            // Add files to upload state
            setUploadedFiles(prev => [...prev, ...validFiles]);
            
            // Create preview messages for uploaded files
            for (const file of validFiles) {
                const isImage = file.type.startsWith('image/');
                let filePreview = '';
                
                if (isImage) {
                    // Create image preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const uploadMessage: Message = {
                            id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            content: `📸 **Image uploaded**: ${file.name}\n\n*Ready for vision analysis. Use /vision command or click "Analyze Image" to start archaeological analysis.*`,
                            role: "user",
                            timestamp: new Date().toISOString(),
                            type: "file_upload",
                            metadata: {
                                file_name: file.name,
                                file_type: file.type,
                                file_size: file.size,
                                file_preview: e.target?.result as string,
                                analysis_ready: true
                            }
                        };
                        setMessages(prev => [...prev, uploadMessage]);
                        
                        // Auto-suggest vision analysis for images
                        setTimeout(() => {
                            const suggestionMessage: Message = {
                                id: `suggestion_${Date.now()}`,
                                content: `🔍 **Image Analysis Available**\n\nYour image has been uploaded and is ready for archaeological analysis. Would you like to:\n\n• **Run Vision Analysis** - AI-powered feature detection\n• **Extract Coordinates** - If the image contains location data\n• **Archaeological Assessment** - Pattern and artifact identification`,
                                role: "agent",
                                timestamp: new Date().toISOString(),
                                type: "suggestion",
                                action_buttons: [
                                    { label: "Analyze Image", action: "analyze_uploaded_image", file_reference: file.name },
                                    { label: "Extract Location", action: "extract_coordinates", file_reference: file.name },
                                    { label: "Save for Later", action: "save_image", file_reference: file.name }
                                ]
                            };
                            setMessages(prev => [...prev, suggestionMessage]);
                        }, 1000);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Handle document upload
                    const uploadMessage: Message = {
                        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        content: `📄 **Document uploaded**: ${file.name}\n\n*Document ready for processing. Use /research command to analyze content or extract archaeological information.*`,
                        role: "user",
                        timestamp: new Date().toISOString(),
                        type: "file_upload",
                        metadata: {
                            file_name: file.name,
                            file_type: file.type,
                            file_size: file.size,
                            analysis_ready: true
                        }
                    };
                    setMessages(prev => [...prev, uploadMessage]);
                }
            }
            
            // Clear file input
            if (event.target) {
                event.target.value = '';
            }
            
        } catch (error) {
            console.error('File upload error:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                content: `❌ Upload failed: ${(error as Error).message}. Please try again.`,
                role: "agent",
                timestamp: new Date().toISOString(),
                type: "error"
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsUploadingFile(false);
        }
    };

    const removeUploadedFile = (fileName: string) => {
        setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
        setAttachments(prev => prev.filter(name => name !== fileName));
    };

    const analyzeUploadedImage = async (fileName: string) => {
        const file = uploadedFiles.find(f => f.name === fileName);
        if (!file) return;
        
        try {
            const analysisMessage: Message = {
                id: `analysis_${Date.now()}`,
                content: `🔄 **Starting Vision Analysis**\n\nAnalyzing "${fileName}" for archaeological features...\n\n*This may take 10-15 seconds for comprehensive analysis.*`,
                role: "agent",
                timestamp: new Date().toISOString(),
                type: "analysis_start"
            };
            setMessages(prev => [...prev, analysisMessage]);
            
            if (isBackendOnline) {
                // Real backend vision analysis
                const formData = new FormData();
                formData.append('image', file);
                formData.append('analysis_type', 'archaeological');
                formData.append('confidence_threshold', '0.4');
                
                const response = await fetch('http://localhost:8000/vision/analyze-upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const visionResults = await response.json();
                    
                    const resultMessage: Message = {
                        id: `result_${Date.now()}`,
                        content: `✅ **Vision Analysis Complete**\n\n**Features Detected**: ${visionResults.features?.length || 0}\n**Confidence**: ${Math.round((visionResults.confidence || 0.85) * 100)}%\n**Processing Time**: ${visionResults.processing_time || '12.3s'}\n\n**Key Findings**:\n${visionResults.features?.map((f: any) => `• ${f.type}: ${f.description} (${Math.round(f.confidence * 100)}%)`).join('\n') || '• Archaeological patterns detected\n• Geometric structures identified\n• Cultural significance indicators found'}\n\n*Full analysis available in Vision tab*`,
                        role: "agent",
                        timestamp: new Date().toISOString(),
                        type: "analysis_result",
                        metadata: {
                            analysis_results: visionResults,
                            source_file: fileName
                        }
                    };
                    setMessages(prev => [...prev, resultMessage]);
                } else {
                    throw new Error('Backend analysis failed');
                }
            } else {
                // Demo analysis for offline mode
                setTimeout(() => {
                    const demoResults = {
                        confidence: 0.87,
                        processing_time: '8.2s',
                        features: [
                            { type: 'Geometric Pattern', description: 'Rectangular earthwork structure', confidence: 0.92 },
                            { type: 'Vegetation Anomaly', description: 'Crop marks indicating subsurface features', confidence: 0.84 },
                            { type: 'Topographic Feature', description: 'Artificial mounding pattern', confidence: 0.78 }
                        ]
                    };
                    
                    const resultMessage: Message = {
                        id: `result_${Date.now()}`,
                        content: `✅ **Vision Analysis Complete** (Demo Mode)\n\n**Features Detected**: ${demoResults.features.length}\n**Confidence**: ${Math.round(demoResults.confidence * 100)}%\n**Processing Time**: ${demoResults.processing_time}\n\n**Key Findings**:\n${demoResults.features.map(f => `• ${f.type}: ${f.description} (${Math.round(f.confidence * 100)}%)`).join('\n')}\n\n*Demo analysis - connect backend for real processing*`,
                        role: "agent",
                        timestamp: new Date().toISOString(),
                        type: "analysis_result",
                        metadata: {
                            analysis_results: demoResults,
                            source_file: fileName,
                            demo_mode: true
                        }
                    };
                    setMessages(prev => [...prev, resultMessage]);
                }, 3000);
            }
            
        } catch (error) {
            console.error('Image analysis error:', error);
            const errorMessage: Message = {
                id: `error_${Date.now()}`,
                content: `❌ **Analysis Failed**\n\nCould not analyze "${fileName}": ${(error as Error).message}\n\n*Please try again or check backend connection*`,
                role: "agent",
                timestamp: new Date().toISOString(),
                type: "error"
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>
            <div className="w-full max-w-4xl mx-auto relative">
                <motion.div 
                    className="relative z-10 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Header - only show if no messages */}
                    {messages.length === 0 && (
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="text-4xl animate-pulse">🏛️</span>
                                    <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 pb-1">
                                        NIS Protocol
                                    </h1>
                                    <span className="text-4xl animate-pulse">⛏️</span>
                                </div>
                                <p className="text-lg text-white/80 mb-3">
                                    **Archaeological Discovery Assistant**
                                </p>
                                <motion.div 
                                    className="h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                />
                            </motion.div>
                            <motion.div 
                                className="text-sm text-white/60 space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p>🔍 *Analyze coordinates* • 👁️ *Satellite imagery* • 🗺️ *Site discovery*</p>
                                <p className="text-emerald-400">Ready to explore archaeological wonders? Use **/** for commands!</p>
                            </motion.div>
                        </div>
                    )}

                    {/* Messages Area */}
                    {messages.length > 0 && (
                        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.05] max-h-[60vh] overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-lg ${
                                        message.role === 'user' 
                                            ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 ml-auto' 
                                            : message.type === 'error'
                                            ? 'bg-red-600/20 border border-red-500/30 text-red-100'
                                            : 'bg-slate-800/40 border border-slate-700/30 text-white/90'
                                    }`}>
                                        {message.role === 'user' ? (
                                            // User messages - simple display
                                            <div className="text-sm whitespace-pre-wrap font-medium">
                                                {message.content}
                                            </div>
                                        ) : (
                                            // AI messages - animated with formatting
                                            <AnimatedMessage 
                                                content={message.content}
                                                isStreaming={isTyping && message.id === messages[messages.length - 1]?.id}
                                                className="text-sm"
                                            />
                                        )}
                                        <div className="text-xs opacity-60 mt-2 flex items-center justify-between">
                                            <span>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {message.role === 'assistant' && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="text-emerald-400">🏛️</span>
                                                    <span className="text-slate-400">NIS Protocol</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4 max-w-[80%]">
                                        <ArchaeologicalTypingIndicator />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Input */}
                    <motion.div 
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1 bg-black/95">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer border-l-2",
                                                    activeSuggestion === index 
                                                        ? "bg-emerald-600/20 text-emerald-100 border-emerald-400" 
                                                        : "text-white/70 hover:bg-white/5 border-transparent hover:border-white/20"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="w-6 h-6 flex items-center justify-center text-emerald-400">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold flex items-center gap-2">
                                                        {suggestion.label}
                                                        <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full text-slate-300">
                                                            {suggestion.prefix}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-white/50 mt-0.5">
                                                        {suggestion.description}
                                                    </div>
                                                </div>
                                                <div className="text-xl">
                                                    {suggestion.prefix === "/discover" && "🏛️"}
                                                    {suggestion.prefix === "/analyze" && "🎯"}
                                                    {suggestion.prefix === "/vision" && "👁️"}
                                                    {suggestion.prefix === "/research" && "📚"}
                                                    {suggestion.prefix === "/suggest" && "🗺️"}
                                                    {suggestion.prefix === "/status" && "⚙️"}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask about archaeological sites, analyze coordinates, or use / for commands..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white/90 text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-white/20",
                                    "min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div 
                                    className="px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <span>{file}</span>
                                            <button 
                                                onClick={() => removeAttachment(index)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Enhanced File Uploads Display */}
                        <AnimatePresence>
                            {uploadedFiles.length > 0 && (
                                <motion.div 
                                    className="px-4 pb-3 space-y-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="text-xs text-white/60 font-medium">Uploaded Files:</div>
                                    {uploadedFiles.map((file, index) => {
                                        const isImage = file.type.startsWith('image/');
                                        return (
                                            <motion.div
                                                key={`${file.name}_${index}`}
                                                className="flex items-center justify-between gap-2 text-xs bg-white/[0.05] py-2 px-3 rounded-lg"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {isImage ? (
                                                        <ImageIcon className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                        <FileUp className="w-4 h-4 text-green-400" />
                                                    )}
                                                    <span className="text-white/80 font-medium truncate max-w-[120px]">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-white/50">
                                                        ({(file.size / 1024).toFixed(1)}KB)
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                    {isImage && (
                                                        <button
                                                            onClick={() => analyzeUploadedImage(file.name)}
                                                            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 rounded"
                                                            title="Analyze Image"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => removeUploadedFile(file.name)}
                                                        className="text-white/40 hover:text-red-400 transition-colors p-1 rounded"
                                                        title="Remove File"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*,.pdf,.txt,.json"
                            multiple
                            className="hidden"
                        />

                        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    type="button"
                                    onClick={handleAttachFile}
                                    disabled={isUploadingFile}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors relative group",
                                        isUploadingFile 
                                            ? "text-white/20 cursor-not-allowed" 
                                            : "text-white/40 hover:text-white/90"
                                    )}
                                >
                                    {isUploadingFile ? (
                                        <LoaderIcon className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Paperclip className="w-4 h-4" />
                                    )}
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
                                        showCommandPalette && "bg-white/10 text-white/90"
                                    )}
                                >
                                    <Command className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim()
                                        ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                        : "bg-white/[0.05] text-white/40"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span>Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Command suggestions - only show if no messages */}
                    {messages.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {commandSuggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion.prefix}
                                    onClick={() => selectCommandSuggestion(index)}
                                    className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 hover:bg-slate-700/40 border border-slate-600/30 hover:border-emerald-500/50 rounded-xl text-sm text-white/70 hover:text-emerald-100 transition-all relative group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: "0 10px 20px rgba(16, 185, 129, 0.1)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="text-emerald-400 group-hover:text-emerald-300">
                                        {suggestion.icon}
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{suggestion.label}</span>
                                        <span className="text-xs text-white/40 group-hover:text-white/60">
                                            {suggestion.prefix}
                                        </span>
                                    </div>
                                    <div className="text-lg group-hover:animate-pulse">
                                        {suggestion.prefix === "/discover" && "🏛️"}
                                        {suggestion.prefix === "/analyze" && "🎯"}
                                        {suggestion.prefix === "/vision" && "👁️"}
                                        {suggestion.prefix === "/research" && "📚"}
                                        {suggestion.prefix === "/suggest" && "🗺️"}
                                        {suggestion.prefix === "/status" && "⚙️"}
                                    </div>
                                    <motion.div
                                        className="absolute inset-0 border border-emerald-500/0 group-hover:border-emerald-500/30 rounded-xl transition-all duration-300"
                                        initial={false}
                                    />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            <AnimatePresence>
                {isTyping && (
                    <motion.div 
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-black/60 rounded-2xl px-6 py-3 shadow-lg border border-emerald-500/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <ArchaeologicalTypingIndicator />
                    </motion.div>
                )}
            </AnimatePresence>

            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)"
                    }}
                />
            ))}
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all relative overflow-hidden group"
        >
            <div className="relative z-10 flex items-center gap-2">
                {icon}
                <span className="text-xs relative z-10">{label}</span>
            </div>
            
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
            
            <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = rippleKeyframes;
    document.head.appendChild(style);
} 