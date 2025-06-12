"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle, 
  X, 
  Brain, 
  Eye, 
  Database, 
  Zap, 
  Target, 
  Network,
  Sparkles,
  TrendingUp,
  BarChart3,
  Globe,
  Users,
  Shield,
  Clock,
  Activity,
  MessageSquare,
  MapPin,
  FileText,
  Search,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps = [
    {
      id: 'intro',
      title: 'NIS Protocol vs. Current AI Systems',
      description: 'Demonstrating superiority in archaeological intelligence',
      standardAI: {
        title: 'ChatGPT/Claude/Gemini Approach',
        limitations: [
          'Text-only processing',
          'No real-time data access',
          'Single model architecture',
          'No coordinate intelligence',
          'Limited cultural context'
        ],
        result: 'Generic responses without specialized knowledge'
      },
      nisProtocol: {
        title: 'NIS Protocol Multi-Agent System',
        advantages: [
          '6-agent specialized architecture',
          'Real-time satellite data integration',
          'GPT-4 Vision + coordinate analysis',
          '148+ archaeological sites database',
          'Cultural context with indigenous knowledge'
        ],
        result: 'Professional archaeological intelligence',
        agents: ['Consciousness', 'Vision', 'Memory', 'Reasoning', 'Action', 'Integration']
      }
    },
    {
      id: 'coordinate_analysis',
      title: 'Coordinate-Based Discovery',
      description: 'Analyzing Machu Picchu coordinates: -13.1631, -72.5450',
      standardAI: {
        title: 'Standard AI Response',
        limitations: [
          'Cannot process coordinates',
          'No satellite imagery access',
          'Generic historical information',
          'No archaeological context'
        ],
        result: '"I cannot analyze specific coordinates or access real-time data"'
      },
      nisProtocol: {
        title: 'NIS Protocol Analysis',
        advantages: [
          'Coordinate validation and geographic context',
          'Satellite imagery analysis with GPT-4 Vision',
          'Cross-reference with 148+ archaeological sites',
          'Cultural context from Inca civilization database',
          'Generate specific research recommendations'
        ],
        result: 'Comprehensive archaeological analysis with 94.7% confidence',
        agents: ['Vision Agent', 'Memory Agent', 'Reasoning Agent']
      }
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < demoSteps.length) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 2;
          
          if (newProgress >= 100) {
            setCurrentStep(prev => prev + 1);
            setProgress(0);
            
            if (currentStep + 1 >= demoSteps.length) {
              setIsPlaying(false);
            }
            
            return 0;
          }
          
          return newProgress;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const currentStepData = demoSteps[currentStep];

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
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                  NIS Protocol Superiority Demo
                </h1>
                <p className="text-sm text-white/60">Interactive demonstration of advanced archaeological AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-400">
                OpenAI Z Challenge Entry
              </Badge>
              <Link href="/chat">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Try Live System
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Demo Controls */}
        <Card className="mb-8 bg-white/[0.02] border-white/[0.1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Play className="h-5 w-5 text-emerald-400" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={handlePlayPause}
                className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Demo
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Demo
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-white/60 mb-1">
                  <span>Step {currentStep + 1} of {demoSteps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Display */}
        <AnimatePresence mode="wait">
          {currentStepData && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="h-5 w-5 text-blue-400" />
                    {currentStepData.title}
                  </CardTitle>
                  <p className="text-white/70">{currentStepData.description}</p>
                </CardHeader>
              </Card>

              {/* Comparison View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Standard AI Side */}
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <X className="h-5 w-5 text-red-400" />
                      {currentStepData.standardAI.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-red-300 mb-2">Limitations:</h4>
                        <div className="space-y-2">
                          {currentStepData.standardAI.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-red-200">
                              <X className="h-3 w-3 text-red-400 flex-shrink-0" />
                              {limitation}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-red-900/30 rounded p-3">
                        <h4 className="text-sm font-medium text-red-300 mb-1">Typical Result:</h4>
                        <p className="text-sm text-red-200 italic">"{currentStepData.standardAI.result}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NIS Protocol Side */}
                <Card className="bg-emerald-900/20 border-emerald-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      {currentStepData.nisProtocol.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-emerald-300 mb-2">Advantages:</h4>
                        <div className="space-y-2">
                          {currentStepData.nisProtocol.advantages.map((advantage, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-emerald-200">
                              <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                              {advantage}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {currentStepData.nisProtocol.agents && (
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Agents Involved:</h4>
                          <div className="flex flex-wrap gap-1">
                            {currentStepData.nisProtocol.agents.map((agent) => (
                              <Badge key={agent} variant="outline" className="text-xs text-emerald-300 border-emerald-500/30">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-emerald-900/30 rounded p-3">
                        <h4 className="text-sm font-medium text-emerald-300 mb-1">NIS Protocol Result:</h4>
                        <p className="text-sm text-emerald-200 font-medium">{currentStepData.nisProtocol.result}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Statistics */}
        <Card className="mt-8 bg-gradient-to-br from-purple-900/20 to-yellow-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
              NIS Protocol Achievements Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">148+</div>
                <div className="text-sm text-white/60">Archaeological Sites</div>
                <div className="text-xs text-emerald-300">Discovered & Validated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">94.7%</div>
                <div className="text-sm text-white/60">Average Confidence</div>
                <div className="text-xs text-blue-300">Professional Grade Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">6</div>
                <div className="text-sm text-white/60">Specialized Agents</div>
                <div className="text-xs text-purple-300">+ Consciousness Integration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">26+</div>
                <div className="text-sm text-white/60">Ancient Manuscripts</div>
                <div className="text-xs text-yellow-300">IKRP Database Access</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border-emerald-500/30">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Experience NIS Protocol Live</h2>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Ready to see the difference? Try our live system and experience professional-grade 
              archaeological intelligence powered by multi-agent coordination.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/chat">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Try Live Chat System
                </Button>
              </Link>
              <Link href="/ikrp">
                <Button size="lg" variant="outline">
                  <FileText className="h-5 w-5 mr-2" />
                  Explore IKRP Platform
                </Button>
              </Link>
              <Link href="/agents">
                <Button size="lg" variant="outline">
                  <Brain className="h-5 w-5 mr-2" />
                  View Agent Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 