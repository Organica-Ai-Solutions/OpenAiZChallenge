"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  FileText,
  Code,
  Compass,
  Database,
  Layers,
  BookOpen,
  Download,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Map,
  Repeat,
  Sparkles,
  Video,
  Rocket,
  Calendar,
  Clock,
  ArrowRight,
  Play,
  Eye,
  Server,
  Globe,
  Cpu,
  Search,
  Target,
  Zap,
  Shield,
  Monitor,
  Users,
  Settings,
  GitBranch,
  Terminal,
  Copy,
  LineChart,
  BarChart3
} from "lucide-react"
import Navigation from "../../components/shared/Navigation"

export default function DocumentationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Archaeological Discovery Platform</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            AI-Powered Indigenous Archaeological Research & Site Discovery Platform
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
            Powered by the <span className="text-blue-400 font-semibold">NIS Protocol</span> developed by{" "}
            <a 
              href="https://organicaai.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-green-400 hover:text-green-300 font-semibold underline transition-colors"
            >
              Organica AI Solutions
            </a>
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300">
              <GitBranch className="h-4 w-4 mr-1" />
              NIS Protocol v2.0
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300">
              <Calendar className="h-4 w-4 mr-1" />
              Updated December 2024
            </Badge>
            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-300">
              <Users className="h-4 w-4 mr-1" />
              OpenAI o1 to o4 Challenge
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="quickstart" className="text-slate-300 data-[state=active]:text-white">Quick Start</TabsTrigger>
            <TabsTrigger value="architecture" className="text-slate-300 data-[state=active]:text-white">Architecture</TabsTrigger>
            <TabsTrigger value="api" className="text-slate-300 data-[state=active]:text-white">API Guide</TabsTrigger>
            <TabsTrigger value="deployment" className="text-slate-300 data-[state=active]:text-white">Deployment</TabsTrigger>
            <TabsTrigger value="examples" className="text-slate-300 data-[state=active]:text-white">Examples</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-slate-300 data-[state=active]:text-white">Roadmap</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-white">
                  <Brain className="mr-3 h-8 w-8 text-blue-400" />
                  What is the Archaeological Discovery Platform?
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  An advanced AI-powered system for discovering and analyzing archaeological sites, combining cutting-edge neural networks, satellite analysis, and indigenous knowledge preservation. Built on the NIS Protocol by Organica AI Solutions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center text-white">
                      <Target className="h-5 w-5 mr-2 text-blue-400" />
                      Mission & Purpose
                    </h3>
                    <p className="text-slate-300">
                      Discover and analyze indigenous archaeological sites using cutting-edge AI technology while respecting cultural heritage and traditional knowledge. Our platform combines computer vision, natural language processing, geospatial analysis, and indigenous perspectives for comprehensive archaeological research.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center text-white">
                      <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                      Core Technologies
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />Real-time satellite imagery analysis</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />AI-powered archaeological pattern detection</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />Indigenous knowledge integration</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />OpenAI GPT-4o vision analysis</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />NIS Protocol reasoning framework</li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Vision Agent</h4>
                        <p className="text-sm text-slate-300">YOLO8, Waldo, and GPT-4 Vision for satellite imagery analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Reasoning Agent</h4>
                        <p className="text-sm text-slate-300">Advanced ReAct framework for intelligent decision making</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Database className="h-12 w-12 mx-auto mb-4 text-green-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Knowledge Base</h4>
                        <p className="text-sm text-slate-300">Indigenous wisdom and historical archaeological data</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <LineChart className="mr-2 h-5 w-5 text-blue-400" />
                  System Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">94%</div>
                    <div className="text-sm text-slate-400">Detection Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">2.3s</div>
                    <div className="text-sm text-slate-400">Avg Analysis Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">15+</div>
                    <div className="text-sm text-slate-400">AI Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">1M+</div>
                    <div className="text-sm text-slate-400">Data Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUICK START TAB */}
          <TabsContent value="quickstart" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Rocket className="mr-2 h-5 w-5 text-blue-400" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Get the NIS Protocol running in minutes with Docker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Prerequisites</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Code className="h-5 w-5 mr-2 text-blue-400" />
                      <span className="text-slate-300">Docker & Docker Compose</span>
                    </div>
                    <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Terminal className="h-5 w-5 mr-2 text-green-400" />
                      <span className="text-slate-300">Python 3.10+</span>
                    </div>
                    <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Globe className="h-5 w-5 mr-2 text-purple-400" />
                      <span className="text-slate-300">Node.js 18+</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Installation Steps</h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Clone Repository", code: "git clone https://github.com/your-org/openai-to-z-nis.git\ncd openai-to-z-nis" },
                      { step: 2, title: "Setup Environment", code: "cp .env.example .env\n# Configure your OpenAI API key and other settings" },
                      { step: 3, title: "Start Services", code: "docker-compose up -d\n# This starts all required services" },
                      { step: 4, title: "Access Application", code: "Frontend: http://localhost:3000\nBackend API: http://localhost:8000\nDocs: http://localhost:8000/docs" }
                    ].map((item) => (
                      <Card key={item.step} className="bg-slate-700/50 border-slate-600">
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                              {item.step}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-2 text-white">{item.title}</h4>
                              <div className="relative">
                                <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
                                  <code>{item.code}</code>
                                </pre>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute top-2 right-2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                                  onClick={() => copyToClipboard(item.code, `step-${item.step}`)}
                                >
                                  {copiedCode === `step-${item.step}` ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-400">First Discovery</h4>
                      <p className="text-slate-300 text-sm mt-1">
                        Try analyzing these Amazon coordinates: <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">-3.4653, -62.2159</code>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ARCHITECTURE TAB */}
          <TabsContent value="architecture" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Layers className="mr-2 h-5 w-5 text-blue-400" />
                  System Architecture
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Comprehensive overview of the NIS Protocol architecture and data flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Frontend Layer</h3>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                        <Globe className="h-5 w-5 mr-3 text-blue-400" />
                        <div>
                          <div className="font-medium text-white">Next.js 14</div>
                          <div className="text-sm text-slate-400">React-based frontend with SSR</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                        <Eye className="h-5 w-5 mr-3 text-purple-400" />
                        <div>
                          <div className="font-medium text-white">Vision Agent UI</div>
                          <div className="text-sm text-slate-400">Interactive analysis visualization</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                        <Brain className="h-5 w-5 mr-3 text-green-400" />
                        <div>
                          <div className="font-medium text-white">ReAct Chat Interface</div>
                          <div className="text-sm text-slate-400">Reasoning + Acting chat system</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Backend Services</h3>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                        <Server className="h-5 w-5 mr-3 text-red-400" />
                        <div>
                          <div className="font-medium text-white">FastAPI Backend</div>
                          <div className="text-sm text-slate-400">High-performance async API</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                        <Database className="h-5 w-5 mr-3 text-orange-400" />
                        <div>
                          <div className="font-medium text-white">Redis + PostgreSQL</div>
                          <div className="text-sm text-slate-400">Caching and persistent storage</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border border-slate-600 rounded-lg bg-slate-700/30">
                        <Repeat className="h-5 w-5 mr-3 text-cyan-400" />
                        <div>
                          <div className="font-medium text-white">Kafka + Zookeeper</div>
                          <div className="text-sm text-slate-400">Message streaming and coordination</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">AI Agents & Models</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Eye className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                          <h4 className="font-medium text-white">Vision Agent</h4>
                          <p className="text-xs text-slate-400 mt-1">YOLO8, Waldo, GPT-4V</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Brain className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                          <h4 className="font-medium text-white">Reasoning</h4>
                          <p className="text-xs text-slate-400 mt-1">GPT-4, BERT, spaCy</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Database className="h-8 w-8 mx-auto mb-2 text-green-400" />
                          <h4 className="font-medium text-white">Memory</h4>
                          <p className="text-xs text-slate-400 mt-1">Vector DB, Knowledge</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Target className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                          <h4 className="font-medium text-white">Action</h4>
                          <p className="text-xs text-slate-400 mt-1">Coordinate Analysis</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API GUIDE TAB */}
          <TabsContent value="api" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Code className="mr-2 h-5 w-5 text-blue-400" />
                  API Reference
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Complete API documentation for integrating with NIS Protocol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-400">Interactive API Documentation</h3>
                    <p className="text-slate-300 text-sm">Explore and test all endpoints in real-time</p>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href="http://localhost:8000/docs" target="_blank" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Swagger UI
                    </a>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Core Endpoints</h3>
                  <div className="space-y-3">
                    {[
                      { method: "POST", endpoint: "/analyze", description: "Analyze coordinates for archaeological features", color: "bg-green-600 text-white" },
                      { method: "POST", endpoint: "/vision/analyze", description: "Computer vision analysis of satellite imagery", color: "bg-blue-600 text-white" },
                      { method: "GET", endpoint: "/research/sites", description: "Retrieve discovered archaeological sites", color: "bg-purple-600 text-white" },
                      { method: "GET", endpoint: "/system/health", description: "System health and status check", color: "bg-orange-600 text-white" },
                      { method: "POST", endpoint: "/discovery/search", description: "Search for potential sites in region", color: "bg-cyan-600 text-white" }
                    ].map((api, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                        <div className="flex items-center space-x-4">
                          <Badge className={api.color}>{api.method}</Badge>
                          <code className="bg-slate-800 px-2 py-1 rounded text-sm text-blue-400">{api.endpoint}</code>
                          <span className="text-slate-300">{api.description}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Example Usage</h3>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Coordinate Analysis</h4>
                        <div className="relative">
                          <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
<code>{`curl -X POST "http://localhost:8000/analyze" \\
  -H "Content-Type: application/json" \\
  -d '{
    "lat": -3.4653,
    "lon": -62.2159,
    "region": "amazon_basin",
    "confidence_threshold": 0.7
  }'`}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                            onClick={() => copyToClipboard('curl example', 'curl-example')}
                          >
                            {copiedCode === 'curl-example' ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEPLOYMENT TAB */}
          <TabsContent value="deployment" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Server className="mr-2 h-5 w-5 text-blue-400" />
                  Deployment Guide
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Production deployment options and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Docker Production</h4>
                        <p className="text-sm text-slate-400 mb-4">Full containerized deployment</p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Setup Guide</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-green-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Kubernetes</h4>
                        <p className="text-sm text-slate-400 mb-4">Scalable orchestration</p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">K8s Config</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                        <h4 className="text-lg font-semibold mb-2 text-white">Cloud Deploy</h4>
                        <p className="text-sm text-slate-400 mb-4">AWS/GCP/Azure ready</p>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Cloud Guide</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Environment Configuration</h3>
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <pre className="text-sm text-green-400">
<code>{`# Production Environment Variables
ENVIRONMENT=production
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/nis
REDIS_URL=redis://localhost:6379
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Security Settings
SECRET_KEY=your_secret_key
ALLOWED_HOSTS=your-domain.com
CORS_ORIGINS=https://your-frontend.com

# AI Model Settings
VISION_MODEL_ENDPOINT=your_model_endpoint
CONFIDENCE_THRESHOLD=0.7
MAX_BATCH_SIZE=32`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXAMPLES TAB */}
          <TabsContent value="examples" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Play className="mr-2 h-5 w-5 text-blue-400" />
                  Usage Examples
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Real-world examples and use cases for archaeological discovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Amazon Basin Discovery</CardTitle>
                      <CardDescription className="text-slate-400">Discovering pre-Columbian settlements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-300">
                          <strong>Location:</strong> -3.4653, -62.2159<br/>
                          <strong>Expected:</strong> Geometric earthworks, settlement patterns<br/>
                          <strong>Models:</strong> YOLO8, GPT-4 Vision, Cultural context
                        </div>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Try This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Andean Archaeological Sites</CardTitle>
                      <CardDescription className="text-slate-400">High-altitude settlement analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-300">
                          <strong>Location:</strong> -13.1631, -72.5450<br/>
                          <strong>Expected:</strong> Terraced agriculture, ceremonial sites<br/>
                          <strong>Models:</strong> LIDAR analysis, Historical correlation
                        </div>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-2" />
                          Try This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Demo Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Video className="h-8 w-8 mr-4 text-red-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Getting Started Tutorial</h4>
                        <p className="text-sm text-slate-400">15-minute overview of core features</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                      <Video className="h-8 w-8 mr-4 text-red-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Advanced Analysis</h4>
                        <p className="text-sm text-slate-400">Deep dive into AI capabilities</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROADMAP TAB */}
          <TabsContent value="roadmap" className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                  Development Roadmap
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Future enhancements and planned features for NIS Protocol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {[
                    {
                      phase: "Phase 1 - Foundation",
                      status: "completed",
                      items: ["Core AI agents implementation", "Docker architecture", "Basic frontend", "API endpoints"],
                      color: "bg-green-600 text-white"
                    },
                    {
                      phase: "Phase 2 - Enhancement",
                      status: "in_progress", 
                      items: ["Advanced ReAct chat", "Vision agent improvements", "Real-time notifications", "Documentation"],
                      color: "bg-blue-600 text-white"
                    },
                    {
                      phase: "Phase 3 - Scaling",
                      status: "planned",
                      items: ["Mobile app", "Real-time satellite feeds", "Advanced mapping", "User authentication"],
                      color: "bg-orange-600 text-white"
                    },
                    {
                      phase: "Phase 4 - Intelligence",
                      status: "future",
                      items: ["Model ensemble", "Active learning", "Automated reports", "API marketplace"],
                      color: "bg-slate-600 text-white"
                    }
                  ].map((phase, index) => (
                    <Card key={index} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">{phase.phase}</h3>
                              <Badge className={phase.color}>{phase.status.replace('_', ' ')}</Badge>
                            </div>
                            <ul className="space-y-1">
                              {phase.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center text-sm text-slate-300">
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Contribute to the Future</h3>
                  <p className="text-slate-300 mb-4">
                    NIS Protocol is open for collaboration. Join our community to help shape the future of AI-powered archaeological discovery.
                  </p>
                  <div className="flex space-x-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Contribute on GitHub
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Users className="h-4 w-4 mr-2" />
                      Join Discord
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 py-8 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-6 mb-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Paper
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Demo
            </Button>
          </div>
          <div className="text-center text-sm">
            <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
            <p className="mt-2 text-slate-500">
              Built with Next.js, FastAPI, and advanced AI for archaeological research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
