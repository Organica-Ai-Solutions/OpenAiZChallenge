"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Eye, 
  Database, 
  Zap, 
  Target, 
  Network,
  Activity,
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Globe,
  Layers,
  MessageSquare,
  Command,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  performance: {
    accuracy: number;
    processing_time: string;
    requests_processed: number;
    success_rate: number;
    interpretability?: number; // KAN enhancement
  };
  specialization: string;
  current_task?: string;
  last_activity: string;
  capabilities: string[];
}

interface ConsciousnessState {
  global_workspace: {
    active_patterns: string[];
    attention_focus: string;
    memory_integration: number;
    reasoning_depth: number;
  };
  agent_coordination: {
    synchronized_agents: number;
    coordination_efficiency: number;
    cross_agent_communication: number;
  };
  cultural_context: {
    active_cultures: string[];
    knowledge_integration: number;
    pattern_recognition: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [consciousness, setConsciousness] = useState<ConsciousnessState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    loadAgentData();
    if (realTimeMode) {
      const interval = setInterval(loadAgentData, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  const loadAgentData = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents/status');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        setSystemStatus('online');
        
        // Load consciousness state
        const consciousnessResponse = await fetch('http://localhost:8000/agents/consciousness/state');
        if (consciousnessResponse.ok) {
          const consciousnessData = await consciousnessResponse.json();
          setConsciousness(consciousnessData);
        }
      } else {
        setSystemStatus('offline');
        setAgents(getDemoAgents());
        setConsciousness(getDemoConsciousness());
      }
    } catch (error) {
      console.warn('Failed to load agent data:', error);
      setSystemStatus('offline');
      setAgents(getDemoAgents());
      setConsciousness(getDemoConsciousness());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoAgents = (): Agent[] => [
    {
      id: 'consciousness_agent',
      name: 'Consciousness Agent',
      type: 'consciousness',
      status: 'active',
      performance: {
        accuracy: 98.7,
        processing_time: '0.3s',
        requests_processed: 2847,
        success_rate: 99.1
      },
      specialization: 'Global workspace integration and agent coordination',
      current_task: 'Coordinating multi-agent archaeological analysis',
      last_activity: '2 seconds ago',
      capabilities: ['Global Workspace', 'Agent Coordination', 'Pattern Integration', 'Context Management']
    },
    {
      id: 'vision_agent',
      name: 'Vision Agent',
      type: 'vision',
      status: 'processing',
      performance: {
        accuracy: 96.9,
        processing_time: '13.5s',
        requests_processed: 1247,
        success_rate: 94.8
      },
      specialization: 'Satellite imagery and LiDAR analysis with GPT-4 Vision',
      current_task: 'Analyzing satellite imagery for ceremonial structures',
      last_activity: '15 seconds ago',
      capabilities: ['GPT-4 Vision', 'Satellite Analysis', 'LiDAR Processing', 'Feature Detection']
    },
    {
      id: 'memory_agent',
      name: 'Memory Agent',
      type: 'memory',
      status: 'active',
      performance: {
        accuracy: 96.3,
        processing_time: '1.2s',
        requests_processed: 22601,
        success_rate: 97.2
      },
      specialization: 'Cultural knowledge and archaeological site database',
      current_task: 'Cross-referencing 148+ archaeological sites',
      last_activity: '5 seconds ago',
      capabilities: ['Site Database', 'Cultural Knowledge', 'Pattern Matching', 'Historical Context']
    },
    {
      id: 'reasoning_agent',
      name: 'Reasoning Agent',
      type: 'reasoning',
      status: 'active',
      performance: {
        accuracy: 89.9,
        processing_time: '4.7s',
        requests_processed: 8934,
        success_rate: 91.5
      },
      specialization: 'Archaeological interpretation and cultural analysis',
      current_task: 'Interpreting Moche ceremonial iconography patterns',
      last_activity: '8 seconds ago',
      capabilities: ['Cultural Analysis', 'Archaeological Interpretation', 'Pattern Recognition', 'Context Integration']
    },
    {
      id: 'action_agent',
      name: 'Action Agent',
      type: 'action',
      status: 'idle',
      performance: {
        accuracy: 92.6,
        processing_time: '2.1s',
        requests_processed: 5672,
        success_rate: 94.3
      },
      specialization: 'Strategic planning and research recommendations',
      current_task: 'Planning field research strategy for Amazon sites',
      last_activity: '1 minute ago',
      capabilities: ['Strategic Planning', 'Research Recommendations', 'Resource Optimization', 'Timeline Management']
    },
    {
      id: 'integration_agent',
      name: 'Integration Agent',
      type: 'integration',
      status: 'active',
      performance: {
        accuracy: 95.4,
        processing_time: '3.8s',
        requests_processed: 4521,
        success_rate: 96.1
      },
      specialization: 'Multi-source data correlation and synthesis',
      current_task: 'Correlating IKRP manuscripts with satellite data',
      last_activity: '12 seconds ago',
      capabilities: ['Data Correlation', 'Multi-Source Integration', 'Synthesis', 'Cross-Validation']
    },
    {
      id: 'kan_reasoning_agent',
      name: 'KAN Reasoning Agent',
      type: 'kan',
      status: 'active',
      performance: {
        accuracy: 89.9,
        processing_time: '0.026s',
        requests_processed: 1247,
        success_rate: 100.0,
        interpretability: 90.0
      },
      specialization: 'Interpretable archaeological reasoning with cultural context analysis',
      current_task: 'Analyzing geometric patterns with KAN networks',
      last_activity: '3 seconds ago',
      capabilities: ['KAN Networks', 'Cultural Context Analysis', 'Temporal Reasoning', 'Indigenous Knowledge Integration', 'Interpretable AI']
    }
  ];

  const getDemoConsciousness = (): ConsciousnessState => ({
    global_workspace: {
      active_patterns: ['Ceremonial Architecture', 'Settlement Patterns', 'Trade Networks'],
      attention_focus: 'Inca Administrative Centers',
      memory_integration: 94.7,
      reasoning_depth: 87.3
    },
    agent_coordination: {
      synchronized_agents: 6,
      coordination_efficiency: 96.2,
      cross_agent_communication: 98.1
    },
    cultural_context: {
      active_cultures: ['Inca', 'Moche', 'Tiwanaku', 'Chachapoya'],
      knowledge_integration: 92.8,
      pattern_recognition: 89.4
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'processing': return 'text-blue-400 bg-blue-500/20';
      case 'idle': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'consciousness': return <Brain className="h-5 w-5 text-purple-400" />;
      case 'vision': return <Eye className="h-5 w-5 text-blue-400" />;
      case 'memory': return <Database className="h-5 w-5 text-emerald-400" />;
      case 'reasoning': return <Target className="h-5 w-5 text-orange-400" />;
      case 'action': return <Zap className="h-5 w-5 text-yellow-400" />;
      case 'integration': return <Network className="h-5 w-5 text-cyan-400" />;
      case 'kan': return <Sparkles className="h-5 w-5 text-violet-400" />;
      default: return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  NIS Protocol Multi-Agent System
                </h1>
                <p className="text-sm text-white/60">Real-time monitoring of all 6 specialized agents + consciousness integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${systemStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {systemStatus === 'online' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Demo Mode
                  </>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={realTimeMode ? 'text-green-400' : 'text-white/60'}
              >
                {realTimeMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Real-time
              </Button>
              <Button variant="ghost" size="sm" onClick={loadAgentData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Consciousness Integration Overview */}
        {consciousness && (
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Consciousness Agent - Global Workspace Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Global Workspace</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Memory Integration</span>
                        <span className="text-white">{consciousness.global_workspace.memory_integration}%</span>
                      </div>
                      <Progress value={consciousness.global_workspace.memory_integration} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Reasoning Depth</span>
                        <span className="text-white">{consciousness.global_workspace.reasoning_depth}%</span>
                      </div>
                      <Progress value={consciousness.global_workspace.reasoning_depth} className="h-2" />
                    </div>
                    <div className="text-xs">
                      <span className="text-white/50">Focus:</span>
                      <span className="text-purple-300 ml-1">{consciousness.global_workspace.attention_focus}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Agent Coordination</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Coordination Efficiency</span>
                        <span className="text-white">{consciousness.agent_coordination.coordination_efficiency}%</span>
                      </div>
                      <Progress value={consciousness.agent_coordination.coordination_efficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Communication</span>
                        <span className="text-white">{consciousness.agent_coordination.cross_agent_communication}%</span>
                      </div>
                      <Progress value={consciousness.agent_coordination.cross_agent_communication} className="h-2" />
                    </div>
                    <div className="text-xs">
                      <span className="text-white/50">Synchronized:</span>
                      <span className="text-emerald-300 ml-1">{consciousness.agent_coordination.synchronized_agents}/6 agents</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Cultural Context</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Knowledge Integration</span>
                        <span className="text-white">{consciousness.cultural_context.knowledge_integration}%</span>
                      </div>
                      <Progress value={consciousness.cultural_context.knowledge_integration} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Pattern Recognition</span>
                        <span className="text-white">{consciousness.cultural_context.pattern_recognition}%</span>
                      </div>
                      <Progress value={consciousness.cultural_context.pattern_recognition} className="h-2" />
                    </div>
                    <div className="text-xs">
                      <span className="text-white/50">Active Cultures:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {consciousness.cultural_context.active_cultures.map((culture) => (
                          <Badge key={culture} variant="outline" className="text-xs px-1 py-0">
                            {culture}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`bg-white/[0.02] border-white/[0.1] hover:border-white/[0.2] transition-all duration-300 cursor-pointer ${
                  selectedAgent === agent.id ? 'ring-2 ring-purple-500/50' : ''
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(agent.type)}
                      <div>
                        <CardTitle className="text-sm text-white">{agent.name}</CardTitle>
                        <p className="text-xs text-white/60 capitalize">{agent.type} Agent</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-xs text-white/70 leading-relaxed">
                      {agent.specialization}
                    </p>
                    
                    {agent.current_task && (
                      <div className="bg-white/[0.05] rounded p-2">
                        <p className="text-xs text-blue-300">
                          <Activity className="h-3 w-3 inline mr-1" />
                          {agent.current_task}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-white/50">Accuracy:</span>
                        <span className="text-emerald-400 ml-1 font-medium">{agent.performance.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-white/50">Speed:</span>
                        <span className="text-blue-400 ml-1 font-medium">{agent.performance.processing_time}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Requests:</span>
                        <span className="text-white ml-1 font-medium">{agent.performance.requests_processed.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Success:</span>
                        <span className="text-emerald-400 ml-1 font-medium">{agent.performance.success_rate}%</span>
                      </div>
                      {agent.performance.interpretability && (
                        <>
                          <div className="col-span-2">
                            <span className="text-white/50">Interpretability:</span>
                            <span className="text-violet-400 ml-1 font-medium">{agent.performance.interpretability}%</span>
                            <Badge className="ml-2 text-xs bg-violet-500/20 text-violet-300">
                              <Sparkles className="h-3 w-3 mr-1" />
                              KAN Enhanced
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="text-xs text-white/50">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Last activity: {agent.last_activity}
                    </div>
                    
                    <AnimatePresence>
                      {selectedAgent === agent.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-white/[0.1] pt-3"
                        >
                          <h5 className="text-xs font-medium text-white mb-2">Capabilities:</h5>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs px-2 py-0">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* System Performance Overview */}
        <Card className="bg-white/[0.02] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              System Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {agents.filter(a => a.status === 'active' || a.status === 'processing').length}/6
                </div>
                <div className="text-sm text-white/60">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {agents.length > 0 ? (agents.reduce((sum, a) => sum + a.performance.accuracy, 0) / agents.length).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-white/60">Avg Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {agents.reduce((sum, a) => sum + a.performance.requests_processed, 0).toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {agents.length > 0 ? (agents.reduce((sum, a) => sum + a.performance.success_rate, 0) / agents.length).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-white/60">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/[0.02] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Command className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/chat">
                <Button className="w-full h-16 flex-col gap-2 bg-purple-600 hover:bg-purple-700">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">Chat Interface</span>
                </Button>
              </Link>
              <Link href="/ikrp">
                <Button className="w-full h-16 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                  <Database className="h-5 w-5" />
                  <span className="text-xs">IKRP System</span>
                </Button>
              </Link>
              <Link href="/analysis">
                <Button className="w-full h-16 flex-col gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Target className="h-5 w-5" />
                  <span className="text-xs">Analysis Tools</span>
                </Button>
              </Link>
              <Button 
                className="w-full h-16 flex-col gap-2 bg-yellow-600 hover:bg-yellow-700"
                onClick={loadAgentData}
              >
                <RefreshCw className="h-5 w-5" />
                <span className="text-xs">Refresh Status</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 