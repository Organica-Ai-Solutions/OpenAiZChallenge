'use client';

import React, { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  status: 'idle' | 'active' | 'complete' | 'error';
  progress: number;
  message: string;
  color: string;
  effectType: 'pulse' | 'lightning' | 'ring' | 'shimmer';
}

interface AgentStatusProps {
  isAnalyzing: boolean;
  analysisStage: string;
  onAgentUpdate?: (agent: Agent) => void;
}

export default function AgentStatus({ isAnalyzing, analysisStage, onAgentUpdate }: AgentStatusProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'vision',
      name: 'Vision Agent',
      icon: '👁️',
      status: 'idle',
      progress: 0,
      message: 'Awaiting divine sight...',
      color: 'purple',
      effectType: 'pulse'
    },
    {
      id: 'lidar',
      name: 'LiDAR Agent',
      icon: '🏔️',
      status: 'idle',
      progress: 0,
      message: 'Mountain data sleeping...',
      color: 'blue',
      effectType: 'lightning'
    },
    {
      id: 'satellite',
      name: 'Satellite Agent',
      icon: '🛰️',
      status: 'idle',
      progress: 0,
      message: 'Celestial watchers ready...',
      color: 'green',
      effectType: 'ring'
    },
    {
      id: 'historical',
      name: 'Historical Agent',
      icon: '📚',
      status: 'idle',
      progress: 0,
      message: 'Ancient wisdom dormant...',
      color: 'yellow',
      effectType: 'shimmer'
    }
  ]);

  // 🎭 Update agents when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      const messages = {
        vision: ['Scanning terrain...', 'Analyzing patterns...', 'Divine sight activated!'],
        lidar: ['Processing elevation...', 'Mapping terrain...', 'Mountain secrets revealed!'],
        satellite: ['Fetching imagery...', 'Spectral analysis...', 'Celestial data acquired!'],
        historical: ['Searching archives...', 'Consulting elders...', 'Ancient wisdom unlocked!']
      };

      // Simulate agent progression
      const updateAgent = (agentId: string, stage: number) => {
        setAgents(prev => prev.map(agent => {
          if (agent.id === agentId) {
            const newAgent = {
              ...agent,
              status: stage < 3 ? 'active' as const : 'complete' as const,
              progress: Math.min((stage + 1) * 33, 100),
              message: messages[agentId as keyof typeof messages][Math.min(stage, 2)]
            };
            onAgentUpdate?.(newAgent);
            return newAgent;
          }
          return agent;
        }));
      };

      // Stagger agent activation
      const agentIds = ['vision', 'lidar', 'satellite', 'historical'];
      agentIds.forEach((agentId, index) => {
        setTimeout(() => {
          updateAgent(agentId, 0);
          setTimeout(() => updateAgent(agentId, 1), 1000);
          setTimeout(() => updateAgent(agentId, 2), 2000);
          setTimeout(() => updateAgent(agentId, 3), 3000);
        }, index * 500);
      });
    } else {
      // Reset agents
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle',
        progress: 0,
        message: `${agent.name} ready...`
      })));
    }
  }, [isAnalyzing, onAgentUpdate]);

  // 🎨 Get effect classes based on agent type
  const getEffectClasses = (agent: Agent) => {
    const baseClasses = "w-12 h-12 rounded-full flex items-center justify-center text-2xl relative transition-all duration-300";
    
    switch (agent.effectType) {
      case 'pulse':
        return `${baseClasses} ${agent.status === 'active' ? 'animate-pulse bg-purple-600/30 shadow-lg shadow-purple-500/50' : 'bg-purple-900/20'}`;
      case 'lightning':
        return `${baseClasses} ${agent.status === 'active' ? 'bg-blue-600/30 shadow-lg shadow-blue-500/50' : 'bg-blue-900/20'}`;
      case 'ring':
        return `${baseClasses} ${agent.status === 'active' ? 'bg-green-600/30 shadow-lg shadow-green-500/50' : 'bg-green-900/20'}`;
      case 'shimmer':
        return `${baseClasses} ${agent.status === 'active' ? 'bg-yellow-600/30 shadow-lg shadow-yellow-500/50' : 'bg-yellow-900/20'}`;
      default:
        return baseClasses;
    }
  };

  // 🌟 Get status indicator
  const getStatusIndicator = (agent: Agent) => {
    switch (agent.status) {
      case 'active':
        return <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${agent.color}-400 rounded-full animate-ping`}></div>;
      case 'complete':
        return <div className={`absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full`}>✓</div>;
      case 'error':
        return <div className={`absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full`}>✗</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          Divine Agent Orchestra
        </h3>
        <div className="text-sm text-slate-400">
          {isAnalyzing ? '⚡ Active' : '😴 Dormant'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="text-center space-y-3">
            {/* Agent Icon with Effects */}
            <div className="relative mx-auto">
              <div className={getEffectClasses(agent)}>
                {agent.icon}
                {getStatusIndicator(agent)}
                
                {/* Special effects overlay */}
                {agent.status === 'active' && (
                  <>
                    {agent.effectType === 'pulse' && (
                      <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping"></div>
                    )}
                    {agent.effectType === 'lightning' && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-spin"></div>
                    )}
                    {agent.effectType === 'ring' && (
                      <div className="absolute -inset-2 rounded-full border border-green-400 animate-pulse"></div>
                    )}
                    {agent.effectType === 'shimmer' && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-pulse"></div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Agent Info */}
            <div>
              <div className={`text-sm font-medium text-${agent.color}-300`}>
                {agent.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {agent.message}
              </div>
              
              {/* Progress Bar */}
              {agent.status === 'active' && (
                <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
                  <div 
                    className={`h-1 bg-${agent.color}-400 rounded-full transition-all duration-300`}
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Divine Blessing Status */}
      {isAnalyzing && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-center gap-3">
            <div className="text-2xl animate-bounce">👼</div>
            <div className="text-center">
              <div className="text-sm font-medium text-blue-300">Angels Orchestrating...</div>
              <div className="text-xs text-blue-400">Writing divine discoveries to databases</div>
            </div>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {agents.every(agent => agent.status === 'complete') && (
        <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
          <div className="text-center text-green-300 font-medium">
            🏆 All Agents Report Success! Zeus Approves! 🏆
          </div>
        </div>
      )}
    </div>
  );
} 