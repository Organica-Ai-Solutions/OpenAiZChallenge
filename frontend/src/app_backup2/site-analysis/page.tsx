"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import DynamicPigeonMap from "@/components/dynamic-pigeon-map"
import {
  Search,
  MapPin,
  Layers,
  History,
  BookOpen,
  Mountain,
  TreePine,
  Waves,
  Building,
  CircleDot,
  Sparkles,
} from "lucide-react"
import type { SiteData } from "@/types/site-data"

// Enhanced sample site data for the map
const SAMPLE_SITES: SiteData[] = [
  {
    id: "site-001",
    name: "Xingu Settlement",
    type: "Settlement",
    coordinates: "-3.4567, -62.789",
    confidence: 85,
    description:
      "Large settlement complex with geometric earthworks and evidence of agricultural modifications. Satellite imagery reveals extensive raised field systems and interconnected canals.",
  },
  {
    id: "site-002",
    name: "Tapajós Ceremonial Center",
    type: "Ceremonial",
    coordinates: "-4.1234, -61.5432",
    confidence: 72,
    description:
      "Circular arrangement of mounds with central plaza area. Likely served as a ceremonial gathering place for regional communities.",
  },
  {
    id: "site-003",
    name: "Rio Negro Geoglyphs",
    type: "Geoglyph",
    coordinates: "-2.7654, -63.2109",
    confidence: 91,
    description:
      "Complex of geometric earthworks visible from satellite imagery. Includes perfect circles, squares, and connecting lines that suggest astronomical alignments.",
  },
  {
    id: "site-004",
    name: "Madeira River Terraces",
    type: "Agricultural",
    coordinates: "-5.3421, -60.8765",
    confidence: 78,
    description:
      "Extensive terraced agricultural systems along river bluffs. Shows sophisticated water management and soil conservation techniques.",
  },
  {
    id: "site-005",
    name: "Javari Basin Structures",
    type: "Unknown",
    coordinates: "-6.2109, -69.8765",
    confidence: 63,
    description:
      "Unusual rectangular structures detected through vegetation patterns. Purpose unknown but consistent with human modification.",
  },
  {
    id: "site-006",
    name: "Orinoco Petroglyphs",
    type: "Rock Art",
    coordinates: "-0.9876, -66.5432",
    confidence: 95,
    description:
      "Extensive rock art panels depicting anthropomorphic figures, animals, and geometric designs. Likely dates to pre-Columbian period.",
  },
  {
    id: "site-007",
    name: "Ucayali Raised Fields",
    type: "Agricultural",
    coordinates: "-7.6543, -74.3210",
    confidence: 82,
    description:
      "Grid pattern of raised agricultural fields designed to manage seasonal flooding. Shows sophisticated agricultural engineering.",
  },
  {
    id: "site-008",
    name: "Putumayo Circular Village",
    type: "Settlement",
    coordinates: "-1.2345, -72.6789",
    confidence: 76,
    description:
      "Circular village layout with central plaza and radiating pathways. Consistent with ethnographic descriptions of traditional settlements.",
  },
  {
    id: "site-009",
    name: "Marañón Hilltop Fortress",
    type: "Defensive",
    coordinates: "-5.8765, -76.5432",
    confidence: 88,
    description:
      "Fortified settlement on strategic hilltop with defensive walls and limited access points. Suggests inter-group conflict.",
  },
]

// Regions of interest
const REGIONS = [
  { id: "amazon", name: "Central Amazon", coordinates: [-3.4653, -62.2159], zoom: 6 },
  { id: "xingu", name: "Xingu River Basin", coordinates: [-12.2551, -53.2134], zoom: 7 },
  { id: "acre", name: "Geoglyphs of Acre", coordinates: [-9.8282, -67.9452], zoom: 7 },
  { id: "llanos", name: "Llanos de Moxos", coordinates: [-14.0, -65.5], zoom: 6 },
  { id: "orinoco", name: "Orinoco Basin", coordinates: [6.8349, -66.1839], zoom: 6 },
  { id: "eldorado", name: "Mythical El Dorado Region", coordinates: [-4.1265, -69.9387], zoom: 6 },
]

export default function SiteAnalysisPage() {
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null)
  const [filteredSites, setFilteredSites] = useState<SiteData[]>(SAMPLE_SITES)
  const [searchQuery, setSearchQuery] = useState("")
  const [siteType, setSiteType] = useState<string>("all")
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  const [showLegendaryOnly, setShowLegendaryOnly] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-3.4653, -62.2159])
  const [mapZoom, setMapZoom] = useState(5)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("map")
  const [isLoading, setIsLoading] = useState(false)
  const [expeditionMode, setExpeditionMode] = useState(false)
  const [expeditionProgress, setExpeditionProgress] = useState(0)
  const [expeditionClues, setExpeditionClues] = useState<string[]>([])

  // Filter sites based on search criteria
  useEffect(() => {
    setIsLoading(true)

    // Simulate loading delay
    setTimeout(() => {
      let results = [...SAMPLE_SITES]

      // Filter by search query
      if (searchQuery) {
        results = results.filter(
          (site) =>
            site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.type?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      // Filter by site type
      if (siteType !== "all") {
        results = results.filter((site) => site.type === siteType)
      }

      // Filter by confidence threshold
      results = results.filter((site) => (site.confidence || 0) >= confidenceThreshold)

      // Filter by legendary status
      if (showLegendaryOnly) {
        results = results.filter((site) => site.type === "Legendary")
      }

      setFilteredSites(results)
      setIsLoading(false)
    }, 500)
  }, [searchQuery, siteType, confidenceThreshold, showLegendaryOnly])

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev].slice(0, 5))
    }
  }

  // Handle region selection
  const handleRegionSelect = (region: (typeof REGIONS)[0]) => {
    setMapCenter([region.coordinates[0], region.coordinates[1]])
    setMapZoom(region.zoom)
  }

  // Handle expedition mode
  const startExpedition = () => {
    setExpeditionMode(true)
    setExpeditionProgress(0)
    setExpeditionClues(["Ancient legends speak of a city of gold hidden deep in the Amazon rainforest..."])

    // Simulate expedition progress
    const interval = setInterval(() => {
      setExpeditionProgress((prev) => {
        const newProgress = prev + 10

        // Add clues at certain milestones
        if (newProgress === 30) {
          setExpeditionClues((prev) => [
            ...prev,
            "Indigenous accounts mention a great lake with a golden island at its center.",
          ])
        } else if (newProgress === 60) {
          setExpeditionClues((prev) => [
            ...prev,
            "Spanish explorers reported seeing golden artifacts from a civilization deep in the jungle.",
          ])
        } else if (newProgress === 90) {
          setExpeditionClues((prev) => [
            ...prev,
            "Recent satellite imagery shows unusual geometric patterns near coordinates -4.1265, -69.9387.",
          ])
          // Move map to El Dorado region
          setMapCenter([-4.1265, -69.9387])
          setMapZoom(8)
        }

        if (newProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 3000)

    return () => clearInterval(interval)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Archaeological Discovery Platform</h1>
        <p className="text-muted-foreground">
          Explore ancient sites and uncover hidden civilizations in the Amazon basin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Discovery Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Sites</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Site name or features..."
                    className="text-sm"
                  />
                  <Button variant="secondary" size="icon" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="siteType">Site Type</Label>
                <select
                  id="siteType"
                  value={siteType}
                  onChange={(e) => setSiteType(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Settlement">Settlement</option>
                  <option value="Ceremonial">Ceremonial</option>
                  <option value="Geoglyph">Geoglyph</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Defensive">Defensive</option>
                  <option value="Rock Art">Rock Art</option>
                  <option value="Unknown">Unknown</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="confidence">Minimum Confidence</Label>
                  <span className="text-xs font-medium">{confidenceThreshold}%</span>
                </div>
                <Slider
                  id="confidence"
                  min={0}
                  max={100}
                  step={5}
                  value={[confidenceThreshold]}
                  onValueChange={(value) => setConfidenceThreshold(value[0])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="legendary" checked={showLegendaryOnly} onCheckedChange={setShowLegendaryOnly} />
                <Label htmlFor="legendary" className="text-sm flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Legendary Sites Only
                </Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Regions of Interest</Label>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map((region) => (
                    <Button
                      key={region.id}
                      variant="outline"
                      size="sm"
                      className="h-auto py-1.5 justify-start text-xs"
                      onClick={() => handleRegionSelect(region)}
                    >
                      <MapPin className="h-3 w-3 mr-1 text-emerald-600" />
                      {region.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Recent Searches</Label>
                <div className="space-y-1">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-xs h-auto py-1.5"
                        onClick={() => setSearchQuery(search)}
                      >
                        <History className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {search}
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent searches</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                El Dorado Expedition
              </CardTitle>
              <CardDescription>Search for the legendary city of gold</CardDescription>
            </CardHeader>
            <CardContent>
              {!expeditionMode ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    Join the search for the legendary city of gold hidden deep in the Amazon rainforest. Follow clues,
                    analyze satellite imagery, and discover what generations of explorers have sought.
                  </p>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={startExpedition}>
                    Start Expedition
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full bg-amber-200 rounded-full h-2.5">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${expeditionProgress}%` }}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Expedition Clues:</h4>
                    <ul className="space-y-2">
                      {expeditionClues.map((clue, index) => (
                        <li key={index} className="text-xs bg-white/50 p-2 rounded border border-amber-200">
                          {clue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {expeditionProgress >= 100 && (
                    <div className="text-xs bg-amber-100 p-2 rounded border border-amber-300">
                      <p className="font-medium text-amber-800">
                        Expedition complete! Check the highlighted area on the map for potential El Dorado locations.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>Map View</span>
              </TabsTrigger>
              <TabsTrigger value="sites" className="flex items-center gap-2">
                <CircleDot className="h-4 w-4" />
                <span>Site List</span>
              </TabsTrigger>
              <TabsTrigger value="encyclopedia" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Encyclopedia</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>Explore archaeological sites across the Amazon basin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <DynamicPigeonMap
                      sites={filteredSites}
                      selectedSite={selectedSite}
                      onSiteSelect={setSelectedSite}
                      initialCoordinates={mapCenter}
                      initialZoom={mapZoom}
                    />
                  </div>
                </CardContent>
              </Card>

              {selectedSite && (
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedSite.name}</CardTitle>
                        <CardDescription>
                          {selectedSite.type} • {selectedSite.confidence}% confidence
                        </CardDescription>
                      </div>
                      <Badge
                        variant={selectedSite.type === "Legendary" ? "default" : "outline"}
                        className={selectedSite.type === "Legendary" ? "bg-amber-500" : ""}
                      >
                        {selectedSite.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{selectedSite.description}</p>

                    {selectedSite.id === "el-dorado" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                        <h4 className="text-amber-800 font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Legendary Discovery
                        </h4>
                        <p className="text-sm text-amber-700 mt-2">
                          Congratulations! You've discovered El Dorado, the legendary city of gold that has eluded
                          explorers for centuries. This remarkable find will revolutionize our understanding of
                          pre-Columbian civilizations in the Amazon.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSite(null)}>
                      Close
                    </Button>
                    <Button size="sm">Export Report</Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Archaeological Sites</CardTitle>
                  <CardDescription>{filteredSites.length} sites match your search criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : filteredSites.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No sites match your search criteria</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSites.map((site) => (
                        <Card key={site.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-base">{site.name}</h3>
                                <p className="text-xs text-muted-foreground">{site.coordinates}</p>
                              </div>
                              <Badge
                                variant={site.type === "Legendary" ? "default" : "outline"}
                                className={site.type === "Legendary" ? "bg-amber-500" : ""}
                              >
                                {site.type}
                              </Badge>
                            </div>
                            <p className="text-sm mt-2 line-clamp-2">{site.description}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary" className="text-xs">
                                {site.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-muted p-2 flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                              onClick={() => {
                                setSelectedSite(site)
                                setActiveTab("map")
                                if (site.coordinates) {
                                  const [lat, lng] = site.coordinates.split(",").map((c) => Number.parseFloat(c.trim()))
                                  setMapCenter([lat, lng])
                                  setMapZoom(8)
                                }
                              }}
                            >
                              View on Map
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="encyclopedia" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Archaeological Encyclopedia</CardTitle>
                  <CardDescription>Learn about ancient Amazonian civilizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                        <TreePine className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">Amazon Rainforest Civilizations</h3>
                        <p className="text-sm mt-1">
                          Recent discoveries have revealed extensive pre-Columbian settlements throughout the Amazon
                          basin.
                        </p>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">The El Dorado Legend</h3>
                        <p className="text-sm mt-1">
                          The myth of a golden city that drove European exploration of South America for centuries.
                        </p>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Waves className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">River Civilizations</h3>
                        <p className="text-sm mt-1">
                          How ancient peoples used the Amazon's vast river networks for trade, transportation, and
                          agriculture.
                        </p>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-stone-500 to-stone-700 flex items-center justify-center">
                        <CircleDot className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">Geoglyphs & Earthworks</h3>
                        <p className="text-sm mt-1">
                          Massive geometric patterns carved into the landscape, visible only from above.
                        </p>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                        <Mountain className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">Terra Preta Soils</h3>
                        <p className="text-sm mt-1">
                          The anthropogenic dark earths that enabled intensive agriculture in nutrient-poor rainforest
                          soils.
                        </p>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                        <Building className="h-12 w-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">Settlement Patterns</h3>
                        <p className="text-sm mt-1">
                          How ancient Amazonian settlements were organized and what they tell us about social
                          structures.
                        </p>
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Featured Article: The Search for El Dorado</h3>
                    <div className="prose prose-sm max-w-none">
                      <p>
                        For centuries, the legend of El Dorado—the city of gold—has captivated explorers and
                        adventurers. The story began with the Muisca people of Colombia, who were said to cover their
                        king in gold dust for a ceremonial raft ritual on Lake Guatavita. Over time, this ritual
                        transformed in European imaginations into tales of an entire city made of gold.
                      </p>
                      <p>
                        Spanish conquistadors and later explorers spent decades searching the Amazon basin and beyond
                        for this mythical place. Many died in the pursuit, falling victim to disease, starvation, and
                        conflicts with indigenous peoples. The most famous expedition was led by Sir Walter Raleigh in
                        the late 16th century, who was convinced El Dorado lay somewhere in the Guiana Highlands.
                      </p>
                      <p>
                        While the city of gold as imagined by European explorers never existed, recent archaeological
                        discoveries have revealed that the Amazon basin was home to complex civilizations with advanced
                        agricultural systems, large settlements, and sophisticated earthworks. These findings suggest
                        that the legends of El Dorado may have been based on real knowledge of wealthy and advanced
                        societies deep in the rainforest.
                      </p>
                      <p>
                        Today, archaeologists use satellite imagery, LIDAR, and other remote sensing technologies to
                        identify potential archaeological sites hidden beneath the dense canopy of the Amazon
                        rainforest. These modern tools are revealing a lost world of ancient settlements, raising the
                        possibility that something resembling the legendary El Dorado—a wealthy, advanced
                        civilization—may yet be discovered.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 