"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  Brain, 
  Eye, 
  FileText, 
  Code, 
  Search, 
  Database, 
  GitBranch, 
  Layers,
  PlayCircle,
  StopCircle,
  Timer,
  Workflow,
  Network,
  Globe,
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Copy,
  Download,
  Share,
  Bookmark,
  RefreshCw,
  Terminal,
  Settings,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ========== PARALLEL TOOL EXECUTION ==========
interface ToolCall {
  id: string;
  name: string;
  parameters: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  startTime: number;
  endTime?: number;
  icon: React.ReactNode;
}

interface ParallelToolExecutorProps {
  onToolCall: (toolName: string, params: any) => Promise<any>;
  maxParallel?: number;
}

export function ParallelToolExecutor({ onToolCall, maxParallel = 5 }: ParallelToolExecutorProps) {
  const [activeCalls, setActiveCalls] = useState<ToolCall[]>([]);
  const [completedCalls, setCompletedCalls] = useState<ToolCall[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const executeToolsInParallel = useCallback(async (tools: Array<{ name: string; params: any }>) => {
    const toolCalls: ToolCall[] = tools.map((tool, index) => ({
      id: `tool_${Date.now()}_${index}`,
      name: tool.name,
      parameters: tool.params,
      status: 'pending',
      startTime: Date.now(),
      icon: getToolIcon(tool.name)
    }));

    setActiveCalls(toolCalls);

    // Execute tools in parallel batches
    const batches = [];
    for (let i = 0; i < toolCalls.length; i += maxParallel) {
      batches.push(toolCalls.slice(i, i + maxParallel));
    }

    for (const batch of batches) {
      const promises = batch.map(async (toolCall) => {
        setActiveCalls(prev => 
          prev.map(call => 
            call.id === toolCall.id 
              ? { ...call, status: 'running' } 
              : call
          )
        );

        try {
          const result = await onToolCall(toolCall.name, toolCall.parameters);
          const updatedCall = {
            ...toolCall,
            status: 'completed' as const,
            result,
            endTime: Date.now()
          };

          setActiveCalls(prev => prev.filter(call => call.id !== toolCall.id));
          setCompletedCalls(prev => [...prev, updatedCall]);
          
          return updatedCall;
        } catch (error) {
          const errorCall = {
            ...toolCall,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
            endTime: Date.now()
          };

          setActiveCalls(prev => prev.filter(call => call.id !== toolCall.id));
          setCompletedCalls(prev => [...prev, errorCall]);
          
          return errorCall;
        }
      });

      await Promise.all(promises);
    }
  }, [onToolCall, maxParallel]);

  const getToolIcon = (toolName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      codebase_search: <Search className="w-4 h-4" />,
      read_file: <FileText className="w-4 h-4" />,
      grep_search: <Terminal className="w-4 h-4" />,
      list_dir: <Database className="w-4 h-4" />,
      run_terminal_cmd: <Terminal className="w-4 h-4" />,
      web_search: <Globe className="w-4 h-4" />,
      edit_file: <Code className="w-4 h-4" />,
      analyze_coordinates: <Eye className="w-4 h-4" />,
      vision_analysis: <Brain className="w-4 h-4" />
    };
    return iconMap[toolName] || <Cpu className="w-4 h-4" />;
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">🔧 Parallel Tool Execution</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Tool Calls */}
      <AnimatePresence>
        {activeCalls.map((call) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2"
          >
            <div className="text-blue-400">{call.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{call.name}</div>
              <div className="text-xs text-slate-400">
                {call.status === 'running' ? 'Executing...' : 'Queued'}
              </div>
            </div>
            <div className="text-xs text-blue-400">
              {formatDuration(call.startTime)}
            </div>
            {call.status === 'running' && (
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => executeToolsInParallel([
            { name: 'codebase_search', params: { query: 'archaeological analysis' } },
            { name: 'list_dir', params: { path: 'components' } },
            { name: 'grep_search', params: { query: 'function.*analyze' } }
          ])}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm text-emerald-300 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Multi-Search
        </button>
        <button
          onClick={() => executeToolsInParallel([
            { name: 'analyze_coordinates', params: { lat: -3.4653, lon: -62.2159 } },
            { name: 'vision_analysis', params: { coordinates: '-3.4653, -62.2159' } }
          ])}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-sm text-blue-300 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Dual Analysis
        </button>
      </div>
    </div>
  );
}

// ========== INTELLIGENT CONTEXT AWARENESS ==========
interface ContextAwarenessProps {
  messages: Array<{ content: string; role: string; timestamp: Date }>;
  currentInput: string;
  onSuggestion: (suggestion: string) => void;
}

export function IntelligentContextAwareness({ messages, currentInput, onSuggestion }: ContextAwarenessProps) {
  const [contextInsights, setContextInsights] = useState<string[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [conversationAnalysis, setConversationAnalysis] = useState<{
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: 'low' | 'medium' | 'high';
    focus: string;
  } | null>(null);

  useEffect(() => {
    analyzeConversationContext();
  }, [messages, currentInput]);

  const analyzeConversationContext = useCallback(() => {
    if (messages.length === 0) return;

    // Analyze recent conversation
    const recentMessages = messages.slice(-5);
    const allText = recentMessages.map(m => m.content).join(' ').toLowerCase();

    // Extract topics
    const topics = [];
    if (allText.includes('coordin') || allText.includes('lat') || allText.includes('lon')) topics.push('Coordinates');
    if (allText.includes('archaeolog') || allText.includes('site') || allText.includes('ancient')) topics.push('Archaeology');
    if (allText.includes('vision') || allText.includes('analysis') || allText.includes('ai')) topics.push('AI Analysis');
    if (allText.includes('map') || allText.includes('satellite') || allText.includes('imagery')) topics.push('Mapping');

    // Generate contextual insights
    const insights = [];
    if (topics.includes('Coordinates') && !topics.includes('AI Analysis')) {
      insights.push('💡 You could enhance this with AI vision analysis');
    }
    if (topics.includes('Archaeology') && messages.length > 3) {
      insights.push('🔍 Consider batch processing multiple sites for efficiency');
    }
    if (allText.includes('error') || allText.includes('fail')) {
      insights.push('🛠️ I can help debug and find alternative approaches');
    }

    // Generate smart suggestions based on context
    const suggestions = [];
    if (currentInput.includes('analyze') && !currentInput.includes('coordinates')) {
      suggestions.push('/analyze -3.4653, -62.2159');
    }
    if (currentInput.includes('vision') && topics.includes('Coordinates')) {
      const coords = extractCoordinatesFromContext(allText);
      if (coords) suggestions.push(`/vision ${coords}`);
    }
    if (topics.includes('Archaeology') && !allText.includes('discover')) {
      suggestions.push('/discover ceremonial complexes in Amazon');
    }

    setContextInsights(insights);
    setSmartSuggestions(suggestions);
    setConversationAnalysis({
      topics,
      sentiment: allText.includes('great') || allText.includes('perfect') ? 'positive' : 'neutral',
      complexity: topics.length > 2 ? 'high' : 'medium',
      focus: topics[0] || 'General'
    });
  }, [messages, currentInput]);

  const extractCoordinatesFromContext = (text: string) => {
    const coordMatch = text.match(/-?\d+\.?\d*,\s*-?\d+\.?\d*/);
    return coordMatch ? coordMatch[0] : null;
  };

  if (!conversationAnalysis) return null;

  return (
    <div className="bg-slate-800/20 backdrop-blur-xl rounded-xl border border-slate-700/30 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">🧠 Context Intelligence</h3>
      </div>

      {/* Conversation Analysis */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/40 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-1">Focus Area</div>
          <div className="text-emerald-400 font-semibold">{conversationAnalysis.focus}</div>
        </div>
        <div className="bg-slate-800/40 rounded-lg p-3">
          <div className="text-sm font-medium text-slate-300 mb-1">Complexity</div>
          <div className={cn(
            "font-semibold capitalize",
            conversationAnalysis.complexity === 'high' ? 'text-red-400' : 
            conversationAnalysis.complexity === 'medium' ? 'text-yellow-400' : 'text-green-400'
          )}>
            {conversationAnalysis.complexity}
          </div>
        </div>
      </div>

      {/* Active Topics */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-300 mb-2">Active Topics</div>
        <div className="flex flex-wrap gap-2">
          {conversationAnalysis.topics.map((topic, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div>
          <div className="text-sm font-medium text-slate-300 mb-2">Smart Suggestions</div>
          {smartSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestion(suggestion)}
              className="flex items-center gap-2 w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg mb-2 text-sm text-emerald-300 transition-colors text-left"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="font-mono">{suggestion}</span>
              <ArrowRight className="w-3 h-3 ml-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== ADVANCED CODE HIGHLIGHTING ==========
interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  onCopy?: () => void;
  onDownload?: () => void;
  showLineNumbers?: boolean;
}

export function AdvancedCodeBlock({ 
  code, 
  language, 
  filename, 
  onCopy, 
  onDownload, 
  showLineNumbers = true 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }, [code, onCopy]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.();
  }, [code, filename, language, onDownload]);

  const lines = code.split('\n');

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-300">
            {filename || `${language} code`}
          </span>
          <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-slate-300">
            {showLineNumbers ? (
              <div className="flex">
                <div className="select-none text-slate-500 text-right pr-4 border-r border-slate-700/50 mr-4">
                  {lines.map((_, index) => (
                    <div key={index} className="leading-6">
                      {index + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {lines.map((line, index) => (
                    <div key={index} className="leading-6">
                      {line || ' '}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

// ========== TASK PROGRESS TRACKING ==========
interface TaskStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

interface TaskProgressTrackerProps {
  title: string;
  steps: TaskStep[];
  onStepClick?: (stepId: string) => void;
}

export function TaskProgressTracker({ title, steps, onStepClick }: TaskProgressTrackerProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 my-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">📋 {title}</h3>
        </div>
        <div className="text-sm text-slate-400">
          {completedSteps}/{totalSteps} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              step.status === 'completed' && "bg-emerald-500/10 border border-emerald-500/20",
              step.status === 'running' && "bg-blue-500/10 border border-blue-500/20",
              step.status === 'error' && "bg-red-500/10 border border-red-500/20",
              step.status === 'pending' && "bg-slate-700/20 border border-slate-700/30"
            )}
            onClick={() => onStepClick?.(step.id)}
          >
            <div className="mt-1">
              {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {step.status === 'running' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
              {step.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {step.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{step.title}</div>
              <div className="text-sm text-slate-400">{step.description}</div>
              {step.error && (
                <div className="text-sm text-red-400 mt-1">Error: {step.error}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// All components are already exported above with 'export function' 