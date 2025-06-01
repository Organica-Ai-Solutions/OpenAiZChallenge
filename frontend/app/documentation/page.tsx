"use client"

import { useState } from "react"
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

export default function DocumentationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-900">NIS</span>
            Protocol
          </a>
          <nav className="hidden space-x-6 md:flex">
            <a href="/" className="hover:text-emerald-200">Home</a>
            <a href="/agent" className="hover:text-emerald-200">Agent</a>
            <a href="/map" className="hover:text-emerald-200">Map</a>
            <a href="/chat" className="hover:text-emerald-200">Chat</a>
            <a href="/documentation" className="border-b-2 border-emerald-200 pb-1 text-emerald-200">Documentation</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">NIS Protocol Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive documentation for the Neural-Inspired System Protocol - your gateway to AI-powered archaeological discovery
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge variant="outline" className="px-3 py-1">
              <GitBranch className="h-4 w-4 mr-1" />
              Version 2.0
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="h-4 w-4 mr-1" />
              Updated Dec 2024
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              OpenAI Challenge
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="api">API Guide</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Brain className="mr-3 h-8 w-8 text-emerald-600" />
                  What is NIS Protocol?
                </CardTitle>
                <CardDescription className="text-lg">
                  A revolutionary AI-powered archaeological discovery platform combining multiple neural networks, satellite analysis, and indigenous knowledge systems.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Core Mission
                    </h3>
                    <p className="text-gray-700">
                      Discover and analyze archaeological sites using cutting-edge AI technology while respecting indigenous knowledge and cultural heritage. Our system combines computer vision, natural language processing, and geospatial analysis.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                      Key Capabilities
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />Real-time satellite analysis</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />AI-powered pattern detection</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />Cultural context integration</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />ReAct reasoning framework</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                        <h4 className="text-lg font-semibold mb-2">Vision Agent</h4>
                        <p className="text-sm text-gray-600">YOLO8, Waldo, and GPT-4 Vision for satellite imagery analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                        <h4 className="text-lg font-semibold mb-2">Reasoning Agent</h4>
                        <p className="text-sm text-gray-600">Advanced ReAct framework for intelligent decision making</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Database className="h-12 w-12 mx-auto mb-4 text-green-600" />
                        <h4 className="text-lg font-semibold mb-2">Knowledge Base</h4>
                        <p className="text-sm text-gray-600">Indigenous wisdom and historical archaeological data</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5 text-emerald-600" />
                  System Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-gray-600">Detection Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">2.3s</div>
                    <div className="text-sm text-gray-600">Avg Analysis Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">15+</div>
                    <div className="text-sm text-gray-600">AI Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">1M+</div>
                    <div className="text-sm text-gray-600">Data Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUICK START TAB */}
          <TabsContent value="quickstart" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="mr-2 h-5 w-5 text-emerald-600" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get the NIS Protocol running in minutes with Docker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Prerequisites</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 border rounded-lg">
                      <Code className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Docker & Docker Compose</span>
                    </div>
                    <div className="flex items-center p-3 border rounded-lg">
                      <Terminal className="h-5 w-5 mr-2 text-green-600" />
                      <span>Python 3.10+</span>
                    </div>
                    <div className="flex items-center p-3 border rounded-lg">
                      <Globe className="h-5 w-5 mr-2 text-purple-600" />
                      <span>Node.js 18+</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Installation Steps</h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "Clone Repository", code: "git clone https://github.com/your-org/openai-to-z-nis.git\ncd openai-to-z-nis" },
                      { step: 2, title: "Setup Environment", code: "cp .env.example .env\n# Configure your OpenAI API key and other settings" },
                      { step: 3, title: "Start Services", code: "docker-compose up -d\n# This starts all required services" },
                      { step: 4, title: "Access Application", code: "Frontend: http://localhost:3000\nBackend API: http://localhost:8000\nDocs: http://localhost:8000/docs" }
                    ].map((item) => (
                      <Card key={item.step}>
                        <CardContent className="pt-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold">
                              {item.step}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-2">{item.title}</h4>
                              <div className="relative">
                                <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
                                  <code>{item.code}</code>
                                </pre>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute top-2 right-2 h-6 w-6 p-0"
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">First Discovery</h4>
                      <p className="text-blue-800 text-sm mt-1">
                        Try analyzing these Amazon coordinates: <code className="bg-blue-100 px-2 py-1 rounded">-3.4653, -62.2159</code>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ARCHITECTURE TAB */}
          <TabsContent value="architecture" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-emerald-600" />
                  System Architecture
                </CardTitle>
                <CardDescription>
                  Comprehensive overview of the NIS Protocol architecture and data flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Frontend Layer</h3>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 border rounded-lg">
                        <Globe className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <div className="font-medium">Next.js 14</div>
                          <div className="text-sm text-gray-600">React-based frontend with SSR</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border rounded-lg">
                        <Eye className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <div className="font-medium">Vision Agent UI</div>
                          <div className="text-sm text-gray-600">Interactive analysis visualization</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border rounded-lg">
                        <Brain className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <div className="font-medium">ReAct Chat Interface</div>
                          <div className="text-sm text-gray-600">Reasoning + Acting chat system</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Backend Services</h3>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 border rounded-lg">
                        <Server className="h-5 w-5 mr-3 text-red-600" />
                        <div>
                          <div className="font-medium">FastAPI Backend</div>
                          <div className="text-sm text-gray-600">High-performance async API</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border rounded-lg">
                        <Database className="h-5 w-5 mr-3 text-orange-600" />
                        <div>
                          <div className="font-medium">Redis + PostgreSQL</div>
                          <div className="text-sm text-gray-600">Caching and persistent storage</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 border rounded-lg">
                        <Repeat className="h-5 w-5 mr-3 text-cyan-600" />
                        <div>
                          <div className="font-medium">Kafka + Zookeeper</div>
                          <div className="text-sm text-gray-600">Message streaming and coordination</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Agents & Models</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-medium">Vision Agent</h4>
                          <p className="text-xs text-gray-600 mt-1">YOLO8, Waldo, GPT-4V</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <h4 className="font-medium">Reasoning</h4>
                          <p className="text-xs text-gray-600 mt-1">GPT-4, BERT, spaCy</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <h4 className="font-medium">Memory</h4>
                          <p className="text-xs text-gray-600 mt-1">Vector DB, Knowledge</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                          <h4 className="font-medium">Action</h4>
                          <p className="text-xs text-gray-600 mt-1">Coordinate Analysis</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5 text-emerald-600" />
                  API Reference
                </CardTitle>
                <CardDescription>
                  Complete API documentation for integrating with NIS Protocol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-900">Interactive API Documentation</h3>
                    <p className="text-blue-700 text-sm">Explore and test all endpoints in real-time</p>
                  </div>
                  <Button asChild>
                    <a href="http://localhost:8000/docs" target="_blank" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Swagger UI
                    </a>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Core Endpoints</h3>
                  <div className="space-y-3">
                    {[
                      { method: "POST", endpoint: "/analyze", description: "Analyze coordinates for archaeological features", color: "bg-green-100 text-green-800" },
                      { method: "POST", endpoint: "/vision/analyze", description: "Computer vision analysis of satellite imagery", color: "bg-blue-100 text-blue-800" },
                      { method: "GET", endpoint: "/research/sites", description: "Retrieve discovered archaeological sites", color: "bg-purple-100 text-purple-800" },
                      { method: "GET", endpoint: "/system/health", description: "System health and status check", color: "bg-orange-100 text-orange-800" },
                      { method: "POST", endpoint: "/discovery/search", description: "Search for potential sites in region", color: "bg-cyan-100 text-cyan-800" }
                    ].map((api, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge className={api.color}>{api.method}</Badge>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{api.endpoint}</code>
                          <span className="text-gray-600">{api.description}</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Example Usage</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Coordinate Analysis</h4>
                        <div className="relative">
                          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
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
                            className="absolute top-2 right-2 h-6 w-6 p-0"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5 text-emerald-600" />
                  Deployment Guide
                </CardTitle>
                <CardDescription>
                  Production deployment options and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Globe className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                        <h4 className="text-lg font-semibold mb-2">Docker Production</h4>
                        <p className="text-sm text-gray-600 mb-4">Full containerized deployment</p>
                        <Button size="sm" variant="outline">Setup Guide</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                        <h4 className="text-lg font-semibold mb-2">Kubernetes</h4>
                        <p className="text-sm text-gray-600 mb-4">Scalable orchestration</p>
                        <Button size="sm" variant="outline">K8s Config</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                        <h4 className="text-lg font-semibold mb-2">Cloud Deploy</h4>
                        <p className="text-sm text-gray-600 mb-4">AWS/GCP/Azure ready</p>
                        <Button size="sm" variant="outline">Cloud Guide</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Environment Configuration</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="mr-2 h-5 w-5 text-emerald-600" />
                  Usage Examples
                </CardTitle>
                <CardDescription>
                  Real-world examples and use cases for archaeological discovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Amazon Basin Discovery</CardTitle>
                      <CardDescription>Discovering pre-Columbian settlements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <strong>Location:</strong> -3.4653, -62.2159<br/>
                          <strong>Expected:</strong> Geometric earthworks, settlement patterns<br/>
                          <strong>Models:</strong> YOLO8, GPT-4 Vision, Cultural context
                        </div>
                        <Button size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Try This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Andean Archaeological Sites</CardTitle>
                      <CardDescription>High-altitude settlement analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <strong>Location:</strong> -13.1631, -72.5450<br/>
                          <strong>Expected:</strong> Terraced agriculture, ceremonial sites<br/>
                          <strong>Models:</strong> LIDAR analysis, Historical correlation
                        </div>
                        <Button size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Try This Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Demo Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-4 border rounded-lg">
                      <Video className="h-8 w-8 mr-4 text-red-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">Getting Started Tutorial</h4>
                        <p className="text-sm text-gray-600">15-minute overview of core features</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center p-4 border rounded-lg">
                      <Video className="h-8 w-8 mr-4 text-red-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">Advanced Analysis</h4>
                        <p className="text-sm text-gray-600">Deep dive into AI capabilities</p>
                      </div>
                      <Button size="sm" variant="outline">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
                  Development Roadmap
                </CardTitle>
                <CardDescription>
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
                      color: "bg-green-100 text-green-800"
                    },
                    {
                      phase: "Phase 2 - Enhancement",
                      status: "in_progress", 
                      items: ["Advanced ReAct chat", "Vision agent improvements", "Real-time notifications", "Documentation"],
                      color: "bg-blue-100 text-blue-800"
                    },
                    {
                      phase: "Phase 3 - Scaling",
                      status: "planned",
                      items: ["Mobile app", "Real-time satellite feeds", "Advanced mapping", "User authentication"],
                      color: "bg-orange-100 text-orange-800"
                    },
                    {
                      phase: "Phase 4 - Intelligence",
                      status: "future",
                      items: ["Model ensemble", "Active learning", "Automated reports", "API marketplace"],
                      color: "bg-gray-100 text-gray-800"
                    }
                  ].map((phase, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold">{phase.phase}</h3>
                              <Badge className={phase.color}>{phase.status.replace('_', ' ')}</Badge>
                            </div>
                            <ul className="space-y-1">
                              {phase.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
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

                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Contribute to the Future</h3>
                  <p className="text-gray-700 mb-4">
                    NIS Protocol is open for collaboration. Join our community to help shape the future of AI-powered archaeological discovery.
                  </p>
                  <div className="flex space-x-4">
                    <Button>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Contribute on GitHub
                    </Button>
                    <Button variant="outline">
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

      <footer className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-6 mb-4">
            <Button variant="ghost" size="sm">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Paper
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Demo
            </Button>
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} Organica-Ai-Solutions. NIS Protocol - Advancing archaeological discovery through AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
