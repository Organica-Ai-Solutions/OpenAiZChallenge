import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-900">NIS</span>
            Protocol
          </a>
          <nav className="hidden space-x-6 md:flex">
            <a href="/" className="hover:text-emerald-200">
              Home
            </a>
            <a href="/agent" className="hover:text-emerald-200">
              Agent
            </a>
            <a href="/chat" className="hover:text-emerald-200">
              Chat
            </a>
            <a href="/documentation" className="border-b-2 border-emerald-200 pb-1 text-emerald-200">
              Documentation
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NIS Protocol Documentation</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive guide to the Neural-Inspired System Protocol and its application to archaeological discovery
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Documentation</h2>
              <nav className="space-y-1">
                <a
                  href="#overview"
                  className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Protocol Overview
                </a>
                <a
                  href="#challenge"
                  className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                >
                  <Compass className="mr-2 h-4 w-4" />
                  OpenAI to Z Challenge
                </a>
                <a
                  href="#architecture"
                  className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Architecture
                </a>
                <a
                  href="#implementation"
                  className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Implementation Guide
                </a>
                <a
                  href="#resources"
                  className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Resources
                </a>
                <a
                  href="#timeline"
                  className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Project Timeline
                </a>
              </nav>

              <div className="mt-6 space-y-4">
                <Button className="w-full" asChild>
                  <a href="https://github.com/Organica-Ai-Solutions/NIS_Protocol" target="_blank" rel="noreferrer">
                    <Code className="mr-2 h-4 w-4" />
                    GitHub Repository
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="#" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Whitepaper
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Protocol Overview */}
            <section id="overview" className="mb-12 scroll-mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Brain className="mr-2 h-6 w-6 text-emerald-600" />
                    NIS Protocol Overview
                  </CardTitle>
                  <CardDescription>
                    A neural-inspired system for agent communication and cognitive processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The NIS Protocol (Neural-Inspired System Protocol) is a comprehensive framework designed for
                    advanced AI agent communication and cognitive processing. It implements a universal meta-protocol
                    for AI agent communication, with layered cognitive processing similar to human neural systems.
                  </p>

                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="mb-2 text-lg font-medium">Key Features</h3>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>
                        <span className="font-medium">Meta Protocol Architecture:</span> Universal translation layer
                        between different AI protocols
                      </li>
                      <li>
                        <span className="font-medium">Neural Architecture:</span> Layered cognitive processing (Sensory
                        → Perception → Memory → Emotional → Executive → Motor)
                      </li>
                      <li>
                        <span className="font-medium">Memory System:</span> Working memory with Miller's Law
                        implementation (7±2 items)
                      </li>
                      <li>
                        <span className="font-medium">Protocol Support:</span> Universal Meta Protocol Layer, A2A, ACP,
                        and MCP protocols
                      </li>
                      <li>
                        <span className="font-medium">Cognitive Processing:</span> Pattern recognition with transformer
                        models
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-4 text-lg font-medium">Protocol Capabilities</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-medium">Protocol Translation</h4>
                        <ul className="ml-5 list-disc text-sm text-muted-foreground">
                          <li>Seamless translation between different AI protocols</li>
                          <li>Preservation of semantic meaning and context</li>
                          <li>Emotional state mapping across protocols</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 font-medium">Cognitive Enhancement</h4>
                        <ul className="ml-5 list-disc text-sm text-muted-foreground">
                          <li>Addition of emotional intelligence to existing protocols</li>
                          <li>Memory integration for context preservation</li>
                          <li>Learning capabilities for protocol optimization</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* OpenAI to Z Challenge */}
            <section id="challenge" className="mb-12 scroll-mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Compass className="mr-2 h-6 w-6 text-emerald-600" />
                    OpenAI to Z Challenge Application
                  </CardTitle>
                  <CardDescription>
                    How to apply the NIS Protocol to discover archaeological sites in the Amazon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    The OpenAI to Z Challenge tasks participants with discovering previously unknown archaeological
                    sites in the Amazon biome using OpenAI models. The NIS Protocol is perfectly suited for this
                    challenge, providing a comprehensive framework for analyzing multiple data sources and identifying
                    potential sites.
                  </p>

                  <Tabs defaultValue="criteria">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="criteria">Judging Criteria</TabsTrigger>
                      <TabsTrigger value="tools">Tools Needed</TabsTrigger>
                      <TabsTrigger value="format">Submission Format</TabsTrigger>
                      <TabsTrigger value="budget">Budget</TabsTrigger>
                      <TabsTrigger value="tips">Pro Tips</TabsTrigger>
                    </TabsList>

                    <TabsContent value="criteria" className="mt-4 space-y-4">
                      <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium">Evidence Depth (20 points)</h4>
                          <p className="text-sm text-muted-foreground">
                            Combine NASA MODIS or Sentinel-2 satellite data, Open LIDAR tiles from Earth Archive,
                            historical maps, indigenous map oral transcriptions, and colonial text digitization. NIS can
                            weave this into an integrated view per tile.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Map className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium">Clarity of Spatial Overlays (20 points)</h4>
                          <p className="text-sm text-muted-foreground">
                            Use NIS Vision + Reasoning to annotate LIDAR and satellite maps with detected patterns.
                            Export as GeoTIFF or QGIS layers, with bounding boxes. Label findings with probable cultural
                            link and score confidence.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Repeat className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium">Reproducibility (20 points)</h4>
                          <p className="text-sm text-muted-foreground">
                            Every decision backed by GPT-4.1 CoT reasoning logs, coordinates and source URLs, and
                            prompts stored in JSON/Markdown + visual overlays.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium">Novelty (20 points)</h4>
                          <p className="text-sm text-muted-foreground">
                            Use NIS to analyze less-explored regions of northern Brazil. Cross-reference "legendary"
                            zones with evidence. Possibly apply agent debate to refine hypothesis.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium">Presentation Craft (20 points)</h4>
                          <p className="text-sm text-muted-foreground">
                            Generate step-by-step drone-style flyovers, infographic visuals of your NIS Agent
                            architecture, and live GPT analysis in action for demo.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tools" className="mt-4">
                      <div className="rounded-lg border">
                        <div className="border-b bg-muted px-4 py-2">
                          <h4 className="font-medium">Tools You'll Need</h4>
                        </div>
                        <div className="p-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="pb-2 text-left font-medium">Resource</th>
                                <th className="pb-2 text-left font-medium">What It Is</th>
                                <th className="pb-2 text-left font-medium">Cost</th>
                                <th className="pb-2 text-left font-medium">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr>
                                <td className="py-2">🛰️ Sentinel-2 Imagery</td>
                                <td className="py-2 text-sm">10–20m resolution satellite imagery</td>
                                <td className="py-2 text-sm">Free</td>
                                <td className="py-2 text-sm">Great for vegetation, land-use changes</td>
                              </tr>
                              <tr>
                                <td className="py-2">🛰️ Landsat 8/9 Imagery</td>
                                <td className="py-2 text-sm">USGS multispectral imagery</td>
                                <td className="py-2 text-sm">Free</td>
                                <td className="py-2 text-sm">~30m resolution, good for large-area patterns</td>
                              </tr>
                              <tr>
                                <td className="py-2">📡 LIDAR from Earth Archive</td>
                                <td className="py-2 text-sm">High-res elevation models</td>
                                <td className="py-2 text-sm">Free</td>
                                <td className="py-2 text-sm">Download specific Amazon tiles</td>
                              </tr>
                              <tr>
                                <td className="py-2">📚 Colonial Archives</td>
                                <td className="py-2 text-sm">Open Access via Archive.org</td>
                                <td className="py-2 text-sm">Free</td>
                                <td className="py-2 text-sm">Can be scraped and parsed with GPT</td>
                              </tr>
                              <tr>
                                <td className="py-2">🧠 GPT-4.1 or OpenAI Models</td>
                                <td className="py-2 text-sm">For reasoning & processing</td>
                                <td className="py-2 text-sm">~$20–$100/month</td>
                                <td className="py-2 text-sm">Costs scale with calls</td>
                              </tr>
                              <tr>
                                <td className="py-2">🧪 QGIS + Plugins</td>
                                <td className="py-2 text-sm">GIS software for spatial overlays</td>
                                <td className="py-2 text-sm">Free</td>
                                <td className="py-2 text-sm">Industry-standard open tool</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="format" className="mt-4">
                      <div className="rounded-lg border p-4">
                        <h4 className="mb-4 font-medium">Suggested Submission Format</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Kaggle Writeup:</span>
                          </p>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Include narrative + architecture diagram of NIS Protocol</li>
                            <li>2+ links to LIDAR/Sentinel + colonial archives</li>
                            <li>Visual overlays (satellite/LIDAR + detected patterns)</li>
                            <li>Prompts + source logs</li>
                            <li>Geo-coordinates + confidence</li>
                            <li>Optional: export pipeline to GitHub</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="budget" className="mt-4">
                      <div className="rounded-lg border">
                        <div className="border-b bg-muted px-4 py-2">
                          <h4 className="font-medium">Estimated Budget</h4>
                        </div>
                        <div className="p-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="pb-2 text-left font-medium">Item</th>
                                <th className="pb-2 text-left font-medium">Est. Monthly Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr>
                                <td className="py-2">Satellite Imagery (Sentinel/Landsat/MODIS)</td>
                                <td className="py-2">$0</td>
                              </tr>
                              <tr>
                                <td className="py-2">LIDAR Data</td>
                                <td className="py-2">$0</td>
                              </tr>
                              <tr>
                                <td className="py-2">GPT-4.1 API Usage (50K–100K tokens/day)</td>
                                <td className="py-2">$50–$100</td>
                              </tr>
                              <tr>
                                <td className="py-2">Compute (Colab Pro or local GPU)</td>
                                <td className="py-2">$0–$50</td>
                              </tr>
                              <tr>
                                <td className="py-2">EO Browser / Sentinel Hub API (for automation)</td>
                                <td className="py-2">$0–$20</td>
                              </tr>
                              <tr>
                                <td className="py-2">Misc. Storage / Processing</td>
                                <td className="py-2">$0–$10</td>
                              </tr>
                              <tr className="font-medium">
                                <td className="py-2">Total</td>
                                <td className="py-2">$50–$180/month</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tips" className="mt-4">
                      <div className="rounded-lg border p-4">
                        <h4 className="mb-4 flex items-center font-medium">
                          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                          Pro Tips to Reduce Costs
                        </h4>
                        <ul className="ml-6 list-disc space-y-2 text-sm">
                          <li>Use local LLMs (e.g., BitNet or DeepSeek models) for early filtering / classification</li>
                          <li>Use GPT-4.1 only for final reasoning / text extraction / historical validation</li>
                          <li>Compress or crop satellite & LIDAR tiles before processing</li>
                          <li>Automate via Kaggle kernels or Colab (GPU access) instead of running servers</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="rounded-lg bg-emerald-50 p-4">
                    <h3 className="mb-2 text-lg font-medium text-emerald-800">Why This Is Your Opportunity</h3>
                    <ul className="ml-6 list-disc space-y-1 text-emerald-800">
                      <li>
                        <span className="font-medium">Global Spotlight:</span> Kaggle + OpenAI + livestream final =
                        instant visibility
                      </li>
                      <li>
                        <span className="font-medium">Field Deployment Funding:</span> Partner with archaeologists
                        on-site
                      </li>
                      <li>
                        <span className="font-medium">$250,000 + Credits:</span> Capital boost to scale and deploy
                        agents
                      </li>
                      <li>
                        <span className="font-medium">Validation:</span> Prove neural-inspired systems work in
                        real-world use cases
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Architecture */}
            <section id="architecture" className="mb-12 scroll-mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Layers className="mr-2 h-6 w-6 text-emerald-600" />
                    NIS Protocol Architecture
                  </CardTitle>
                  <CardDescription>Detailed overview of the layered neural-inspired architecture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    The NIS Protocol follows a layered architecture inspired by neural processing, with each layer
                    handling specific aspects of data processing and decision making.
                  </p>

                  <div className="rounded-lg bg-muted p-6">
                    <div className="mx-auto max-w-2xl">
                      <div className="space-y-4">
                        <div className="rounded-lg bg-emerald-100 p-4 text-center">
                          <h4 className="font-medium text-emerald-800">Input Layer</h4>
                          <p className="text-sm text-emerald-700">Satellite Imagery, LIDAR, Historical Texts</p>
                        </div>
                        <div className="flex justify-center">
                          <ChevronRight className="rotate-90 text-emerald-500" />
                        </div>
                        <div className="rounded-lg bg-emerald-200 p-4 text-center">
                          <h4 className="font-medium text-emerald-800">Sensory Layer</h4>
                          <p className="text-sm text-emerald-700">
                            Input processing, tokenization, and initial formatting
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <ChevronRight className="rotate-90 text-emerald-500" />
                        </div>
                        <div className="rounded-lg bg-emerald-300 p-4 text-center">
                          <h4 className="font-medium text-emerald-800">Perception Layer</h4>
                          <p className="text-sm text-emerald-700">Pattern recognition, feature extraction</p>
                        </div>
                        <div className="flex justify-center">
                          <ChevronRight className="rotate-90 text-emerald-500" />
                        </div>
                        <div className="rounded-lg bg-emerald-400 p-4 text-center">
                          <h4 className="font-medium text-emerald-800">Memory Layer</h4>
                          <p className="text-sm text-emerald-700">Working memory, long-term storage, semantic search</p>
                        </div>
                        <div className="flex justify-center">
                          <ChevronRight className="rotate-90 text-emerald-500" />
                        </div>
                        <div className="rounded-lg bg-emerald-500 p-4 text-center">
                          <h4 className="font-medium text-white">Executive Layer</h4>
                          <p className="text-sm text-emerald-50">Decision making, action planning, goal management</p>
                        </div>
                        <div className="flex justify-center">
                          <ChevronRight className="rotate-90 text-emerald-500" />
                        </div>
                        <div className="rounded-lg bg-emerald-600 p-4 text-center">
                          <h4 className="font-medium text-white">Motor Layer</h4>
                          <p className="text-sm text-emerald-50">
                            Action execution, output generation, protocol handling
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <ChevronRight className="rotate-90 text-emerald-500" />
                        </div>
                        <div className="rounded-lg bg-emerald-700 p-4 text-center">
                          <h4 className="font-medium text-white">Output Layer</h4>
                          <p className="text-sm text-emerald-50">Annotated Maps, Coordinates, Analysis Reports</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Meta Protocol Coordinator</h4>
                      <p className="text-sm text-muted-foreground">
                        The Meta Protocol Coordinator is responsible for routing messages between different protocols,
                        ensuring seamless communication between agents using different standards. It maintains context
                        and emotional state across protocol boundaries.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Protocol Adapters</h4>
                      <p className="text-sm text-muted-foreground">
                        Protocol adapters translate between different AI protocols, including MCP, ACP, and A2A. Each
                        adapter handles the specific requirements and formats of its protocol, while preserving semantic
                        meaning and context.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Memory System</h4>
                      <p className="text-sm text-muted-foreground">
                        The Memory System implements working memory with Miller's Law (7±2 items), long-term storage,
                        memory consolidation, and semantic search capabilities. It provides context for decision making
                        and learning.
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Cognitive Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Cognitive Processing includes pattern recognition with transformer models, emotional processing
                        with sentiment analysis, and executive control for decision making. It enables the system to
                        understand and respond to complex inputs.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-4 font-medium">Agent Types for Archaeological Discovery</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Compass className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-medium">VisionAgent</h5>
                          <p className="text-sm text-muted-foreground">
                            Processes satellite imagery and LIDAR data to identify patterns consistent with
                            archaeological sites.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Database className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-medium">MemoryAgent</h5>
                          <p className="text-sm text-muted-foreground">
                            Stores and retrieves information about known archaeological sites, historical accounts, and
                            previous analyses.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-medium">ReasoningAgent</h5>
                          <p className="text-sm text-muted-foreground">
                            Analyzes patterns identified by the VisionAgent, compares them with known sites, and
                            generates hypotheses about potential archaeological sites.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-medium">ActionAgent</h5>
                          <p className="text-sm text-muted-foreground">
                            Generates reports, annotated maps, and recommendations for further investigation based on
                            the ReasoningAgent's conclusions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Implementation Guide */}
            <section id="implementation" className="mb-12 scroll-mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Code className="mr-2 h-6 w-6 text-emerald-600" />
                    Implementation Guide
                  </CardTitle>
                  <CardDescription>
                    Step-by-step instructions for implementing the NIS Protocol for archaeological discovery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    This guide provides a structured approach to implementing the NIS Protocol for the OpenAI to Z
                    Challenge, focusing on archaeological discovery in the Amazon.
                  </p>

                  <div className="rounded-lg border">
                    <div className="border-b bg-muted px-4 py-2">
                      <h4 className="font-medium">Repository Structure</h4>
                    </div>
                    <div className="p-4">
                      <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                        <code>
                          {`openai-to-z-nis/
├── data/
│   ├── lidar/
│   ├── satellite/
│   ├── colonial_texts/
│   └── overlays/
├── notebooks/
│   ├── NIS_pipeline.ipynb
│   └── site_analysis_1.ipynb
├── src/
│   ├── agents/
│   │   ├── vision_agent.py
│   │   ├── memory_agent.py
│   │   ├── reasoning_agent.py
│   │   └── action_agent.py
│   ├── prompts/
│   └── utils/
├── outputs/
│   ├── findings/
│   └── logs/
├── NIS_Architecture.png
├── NIS_Writeup.md
└── README.md`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">Implementation Steps</h3>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" />
                        Step 1: Initialize the Meta Protocol
                      </h4>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
                        <code>
                          {`from src.meta import MetaProtocolCoordinator
from src.adapters import MCPAdapter, ACPAdapter, A2AAdapter

# Create coordinator
coordinator = MetaProtocolCoordinator()

# Register protocols
coordinator.register_protocol("mcp", MCPAdapter())
coordinator.register_protocol("acp", ACPAdapter())
coordinator.register_protocol("a2a", A2AAdapter())`}
                        </code>
                      </pre>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" />
                        Step 2: Set Up Agent Pipeline
                      </h4>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
                        <code>
                          {`from src.agents import VisionAgent, MemoryAgent, ReasoningAgent, ActionAgent

# Initialize agents
vision_agent = VisionAgent()
memory_agent = MemoryAgent()
reasoning_agent = ReasoningAgent()
action_agent = ActionAgent()

# Configure pipeline
pipeline = AgentPipeline([
    vision_agent,
    memory_agent,
    reasoning_agent,
    action_agent
])`}
                        </code>
                      </pre>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" />
                        Step 3: Process Data Sources
                      </h4>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
                        <code>
                          {`# Load satellite imagery
satellite_data = load_satellite_data("data/satellite/sentinel2_xingu.tif")

# Load LIDAR data
lidar_data = load_lidar_data("data/lidar/earth_archive_tile_42.tif")

# Load historical texts
historical_texts = load_historical_texts("data/colonial_texts/")

# Process with vision agent
vision_results = vision_agent.process(satellite_data, lidar_data)

# Store in memory
memory_agent.store(vision_results)
memory_agent.store(historical_texts)`}
                        </code>
                      </pre>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" />
                        Step 4: Analyze and Generate Results
                      </h4>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
                        <code>
                          {`# Generate hypotheses
hypotheses = reasoning_agent.analyze(
    vision_results=vision_agent.get_results(),
    memory_context=memory_agent.get_context(),
    confidence_threshold=0.7
)

# Generate actions and outputs
results = action_agent.generate_outputs(
    hypotheses=hypotheses,
    output_formats=["geojson", "report", "annotated_map"]
)

# Save results
save_results(results, "outputs/findings/xingu_analysis/")`}
                        </code>
                      </pre>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 flex items-center font-medium">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" />
                        Step 5: Monitor Protocol Performance
                      </h4>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
                        <code>
                          {`# Get protocol metrics
mcp_metrics = coordinator.get_protocol_metrics("mcp")
print(f"MCP Success Rate: {mcp_metrics.successful_translations / mcp_metrics.total_messages}")

# Get agent metrics
vision_metrics = vision_agent.get_metrics()
print(f"Vision Agent Accuracy: {vision_metrics.accuracy}")

# Generate performance report
performance_report = generate_performance_report(
    protocol_metrics=coordinator.get_all_metrics(),
    agent_metrics=[
        vision_agent.get_metrics(),
        memory_agent.get_metrics(),
        reasoning_agent.get_metrics(),
        action_agent.get_metrics()
    ]
)

save_performance_report(performance_report, "outputs/logs/performance_report.json")`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 font-medium">Example Agent Prompt Templates</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium">SatellitePatternDetect.gpt</h5>
                        <pre className="mt-1 overflow-x-auto rounded-md bg-card p-2 text-xs">
                          <code>
                            {`You are analyzing satellite imagery for archaeological patterns.
Focus on:
1. Geometric shapes that are unlikely to be natural
2. Vegetation anomalies that might indicate buried structures
3. Linear features that could be ancient roads or canals

For each pattern detected, provide:
- Coordinates
- Pattern type
- Confidence score (0-100)
- Brief description`}
                          </code>
                        </pre>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium">HistoricalReferenceMatch.gpt</h5>
                        <pre className="mt-1 overflow-x-auto rounded-md bg-card p-2 text-xs">
                          <code>
                            {`You are analyzing historical texts for references to settlements in the Amazon.
For each reference, extract:
1. Location descriptions
2. Cultural attributes
3. Estimated time period
4. Source credibility assessment

Compare these references with detected patterns at coordinates: [COORDINATES]`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Resources */}
            <section id="resources" className="mb-12 scroll-mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Database className="mr-2 h-6 w-6 text-emerald-600" />
                    Resources
                  </CardTitle>
                  <CardDescription>
                    Data sources, tools, and references for implementing the NIS Protocol
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Data Sources</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a
                            href="https://www.eartharchive.org"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            Earth Archive LIDAR Data
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">High-resolution elevation models of the Amazon</p>
                        </li>
                        <li>
                          <a
                            href="https://scihub.copernicus.eu/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            Copernicus Open Access Hub
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Sentinel-2 satellite imagery</p>
                        </li>
                        <li>
                          <a
                            href="https://earthexplorer.usgs.gov/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            USGS Earth Explorer
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Landsat satellite imagery</p>
                        </li>
                        <li>
                          <a
                            href="https://archive.org/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            Internet Archive
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Historical texts and colonial records</p>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-2 font-medium">Tools</h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a
                            href="https://colab.research.google.com/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            Google Colab
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Cloud-based Python notebook environment</p>
                        </li>
                        <li>
                          <a
                            href="https://qgis.org/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            QGIS
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Open-source GIS software for spatial analysis</p>
                        </li>
                        <li>
                          <a
                            href="https://platform.openai.com/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            OpenAI API
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Access to GPT-4.1 and other OpenAI models</p>
                        </li>
                        <li>
                          <a
                            href="https://www.kaggle.com/"
                            target="_blank"
                            className="flex items-center text-blue-600 hover:underline"
                            rel="noreferrer"
                          >
                            Kaggle
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <p className="text-muted-foreground">Platform for the OpenAI to Z Challenge</p>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 font-medium">References</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="flex items-center text-blue-600 hover:underline">
                          NIS Protocol Whitepaper
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                        <p className="text-muted-foreground">
                          Comprehensive documentation of the NIS Protocol architecture and implementation
                        </p>
                      </li>
                      <li>
                        <a
                          href="https://kaggle.com/competitions/openai-to-z-challenge"
                          target="_blank"
                          className="flex items-center text-blue-600 hover:underline"
                          rel="noreferrer"
                        >
                          OpenAI to Z Challenge
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                        <p className="text-muted-foreground">
                          Official competition page with rules, timeline, and submission guidelines
                        </p>
                      </li>
                      <li>
                        <a
                          href="https://github.com/Organica-Ai-Solutions/NIS_Protocol"
                          target="_blank"
                          className="flex items-center text-blue-600 hover:underline"
                          rel="noreferrer"
                        >
                          NIS Protocol GitHub Repository
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                        <p className="text-muted-foreground">Source code and implementation examples</p>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Timeline */}
            <section id="timeline" className="mb-12 scroll-mt-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Calendar className="mr-2 h-6 w-6 text-emerald-600" />
                    Project Timeline
                  </CardTitle>
                  <CardDescription>Execution plan for the OpenAI to Z Challenge using the NIS Protocol</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p>
                    This timeline provides a structured approach to implementing the NIS Protocol for the OpenAI to Z
                    Challenge, with specific objectives and tasks for each sprint.
                  </p>

                  <div className="space-y-8">
                    <div className="relative">
                      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                        1
                      </div>
                      <div className="ml-12 rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">Sprint 1: Project Setup & Area Selection</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            May 15–19
                          </div>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-sm font-medium">Objectives:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Define team (even if it's just you + agents for now)</li>
                            <li>Select first region of interest (e.g., Xingu or Tapajós)</li>
                            <li>Set up GitHub + Colab pipeline</li>
                            <li>Download sample satellite + LIDAR tile</li>
                            <li>Deploy initial NIS Agent architecture sketch</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">Tasks:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Create GitHub repo (openai-to-z-nis)</li>
                            <li>Setup file structure in Colab + local dev</li>
                            <li>Pick 1–2 tiles from Earth Archive (LIDAR)</li>
                            <li>Pull Sentinel-2 tile from EO Browser</li>
                            <li>Generate first version of NIS Blueprint image</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                        2
                      </div>
                      <div className="ml-12 rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">Sprint 2: Agent Pipeline MVP</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            May 20–26
                          </div>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-sm font-medium">Objectives:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Set up first working agent pipeline</li>
                            <li>Detect anomalies in satellite + LIDAR</li>
                            <li>Cross-reference with colonial text + story maps</li>
                            <li>Output bounding boxes and annotated maps</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">Tasks:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Build VisionAgent (Yolo8/Waldo) for LIDAR</li>
                            <li>Add MemoryAgent to store tile history + metadata</li>
                            <li>Create prompt templates for ReasoningAgent</li>
                            <li>Add GPT-4.1 call to interpret patterns + link to texts</li>
                            <li>Output first finding with geo-coordinates, annotated map, and source references</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                        3
                      </div>
                      <div className="ml-12 rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">Sprint 3: Multi-Tile Search + Reproducibility</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            May 27 – June 10
                          </div>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-sm font-medium">Objectives:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Expand to 5+ tiles</li>
                            <li>Fully modularize the NIS agent layers</li>
                            <li>Log prompts, sources, and responses</li>
                            <li>Validate results with at least two methods per site</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">Tasks:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Create reproducible agent logs (JSON + Markdown)</li>
                            <li>Add multi-agent CoT reasoning (BitNet + GPT cross-check)</li>
                            <li>Build overlay viewer (QGIS or simple HTML map)</li>
                            <li>Draft write-up sections as you go (report generator)</li>
                            <li>Add citations + overlays (EarthArchive ID, DOI, etc.)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                        4
                      </div>
                      <div className="ml-12 rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-medium">Sprint 4: Final Presentation & Writeup</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            June 11–29
                          </div>
                        </div>
                        <div className="mb-4">
                          <h5 className="text-sm font-medium">Objectives:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Polish visuals, maps, and reasoning trees</li>
                            <li>Finalize write-up with all links and overlays</li>
                            <li>Create a walkthrough video or visual demo</li>
                            <li>Submit to Kaggle + promote via Organica AI</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">Tasks:</h5>
                          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
                            <li>Finalize submission writeup (Markdown or Notebook)</li>
                            <li>Create architecture + site discovery diagrams</li>
                            <li>Create 60–120 second video summary (optional)</li>
                            <li>Submit before June 29 at 11:59PM UTC</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-lg bg-emerald-50 p-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                        <Rocket className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-emerald-800">Ready to Get Started?</h3>
                        <p className="text-emerald-700">
                          Begin your journey to discover archaeological sites in the Amazon using the NIS Protocol.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                      <Button className="flex-1" asChild>
                        <a href="/agent">
                          Launch Discovery Agent
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <a
                          href="https://github.com/Organica-Ai-Solutions/NIS_Protocol"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Code className="mr-2 h-4 w-4" />
                          Clone Repository
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <a href="/chat">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Chat with NIS
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Organica-Ai-Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
