"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scroll, 
  Book, 
  Crown, 
  Users, 
  Calendar,
  MapPin,
  Search,
  Star,
  Globe,
  Compass,
  Eye,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface LegendarySite {
  id: string;
  name: string;
  legend_type: 'lost_city' | 'treasure' | 'sacred_site' | 'civilization';
  coordinates: string;
  confidence_level: number;
  historical_sources: {
    indigenous_oral_traditions: string[];
    spanish_chronicles: string[];
    modern_research: string[];
    archaeological_evidence: string[];
  };
  cultural_context: {
    associated_peoples: string[];
    time_period: string;
    cultural_significance: string;
    ceremonial_importance: string;
  };
  search_methodology: {
    recommended_techniques: string[];
    priority_areas: string[];
    seasonal_considerations: string;
    access_challenges: string[];
  };
  related_discoveries: string[];
  modern_expeditions: string[];
}

const LEGENDARY_SITES: LegendarySite[] = [
  {
    id: 'el_dorado',
    name: 'El Dorado - The Golden One',
    legend_type: 'sacred_site',
    coordinates: '4.9725, -73.7736',
    confidence_level: 95,
    historical_sources: {
      indigenous_oral_traditions: [
        'Muisca ceremonies at Lake Guatavita',
        'Chibcha gold offering rituals to Bachué goddess',
        'Sacred geography of the Cundinamarca altiplano'
      ],
      spanish_chronicles: [
        'Juan Rodríguez Freyle - El Carnero (1636): Detailed account of Muisca gold ceremonies',
        'Gonzalo Fernández de Oviedo (1535): First European description of El Dorado ritual',
        'Sebastián de Belalcázar expeditions (1536-1539): Search for the golden city'
      ],
      modern_research: [
        'Banco de la República underwater excavations (1965-1970)',
        'ICANH systematic archaeological surveys (2010-2020)',
        'Muisca Goldwork Museum research and documentation'
      ],
      archaeological_evidence: [
        'Golden raft (Muisca Raft) discovered in Pasca cave',
        'Thousands of gold offerings recovered from Lake Guatavita',
        'Ceremonial sites around the sacred lake complex'
      ]
    },
    cultural_context: {
      associated_peoples: ['Muisca', 'Chibcha', 'Guane'],
      time_period: '600-1600 CE',
      cultural_significance: 'Central ceremony for new cacique (chief) investiture involving gold dust covering and lake offerings',
      ceremonial_importance: 'Most sacred site in Muisca cosmology, representing connection between earthly and divine realms'
    },
    search_methodology: {
      recommended_techniques: ['Underwater archaeology', 'LIDAR mapping', 'Ground-penetrating radar', 'Magnetometry'],
      priority_areas: ['Lake Guatavita basin', 'Surrounding ceremonial terraces', 'Ancient pathways to the lake'],
      seasonal_considerations: 'Dry season (December-March) optimal for underwater work and site access',
      access_challenges: ['Protected archaeological zone', 'Tourism management', 'Weather conditions']
    },
    related_discoveries: [
      'Muisca Raft (Balsa Muisca) - Metropolitan Museum',
      'Gold Museum collection in Bogotá',
      'Ceremonial sites at Zipaquirá and Nemocón'
    ],
    modern_expeditions: [
      'Alexander von Humboldt scientific expedition (1801)',
      'Banco de la República diving operations (1965-1970)',
      'National Geographic documentation (1990s-2000s)'
    ]
  },
  {
    id: 'paititi',
    name: 'Paititi - The Lost City of Gold',
    legend_type: 'lost_city',
    coordinates: '-12.8628, -69.3558',
    confidence_level: 76,
    historical_sources: {
      indigenous_oral_traditions: [
        'Inca legends of the eastern refuge city',
        'Machiguenga stories of the golden city in the jungle',
        'Matsigenka oral histories of ancestral settlements'
      ],
      spanish_chronicles: [
        'Garcilaso de la Vega - Royal Commentaries: Inca retreat to eastern territories',
        'Jesuit mission reports (1650s): References to large indigenous settlements',
        'Viceroy Toledo documents: Expeditions to find Inca treasure'
      ],
      modern_research: [
        'Thierry Jamin expeditions (2009-2015): Satellite analysis and ground surveys',
        'NASA satellite imagery analysis revealing geometric patterns',
        'University of São Paulo archaeological surveys'
      ],
      archaeological_evidence: [
        'Geometric earthworks visible in satellite imagery',
        'Stone platforms and terracing systems',
        'Petroglyphs and rock art sites'
      ]
    },
    cultural_context: {
      associated_peoples: ['Inca', 'Machiguenga', 'Matsigenka', 'Asháninka'],
      time_period: '1200-1572 CE',
      cultural_significance: 'Legendary refuge of the last Inca rulers and repository of imperial treasures',
      ceremonial_importance: 'Sacred center for Inca resistance and cultural preservation'
    },
    search_methodology: {
      recommended_techniques: ['Satellite multispectral analysis', 'LIDAR penetration', 'Ground surveys', 'Ethnographic research'],
      priority_areas: ['Madre de Dios river basin', 'Manu National Park region', 'Kosñipata Valley'],
      seasonal_considerations: 'Dry season (May-September) for jungle access, wet season limits transportation',
      access_challenges: ['Dense jungle canopy', 'Remote location', 'Indigenous territory permissions', 'Extreme weather']
    },
    related_discoveries: [
      'Choquequirao archaeological complex',
      'Espíritu Pampa (Vilcabamba la Grande)',
      'Machu Picchu and Sacred Valley connections'
    ],
    modern_expeditions: [
      'Hiram Bingham expeditions (1911-1915)',
      'Gene Savoy explorations (1960s-1970s)',
      'Thierry Jamin Inkari Institute expeditions (2000s-2010s)'
    ]
  },
  {
    id: 'manoa',
    name: 'Manoa del Dorado - City of Gold',
    legend_type: 'lost_city',
    coordinates: '6.7753, -61.1094',
    confidence_level: 68,
    historical_sources: {
      indigenous_oral_traditions: [
        'Warao legends of the golden city on the great lake',
        'Kariña stories of wealthy settlements in the interior',
        'Pemón oral histories of ancient cities'
      ],
      spanish_chronicles: [
        'Antonio de Berrío reports (1584): Expeditions to find Manoa',
        'Walter Raleigh - Discovery of Guiana (1595): Detailed account of the golden city',
        'Domingo de Vera expeditions (1590s): Search for El Dorado in Guiana'
      ],
      modern_research: [
        'Venezuelan Institute of Archaeology surveys',
        'Orinoco Basin archaeological projects',
        'Remote sensing studies of seasonal lake formations'
      ],
      archaeological_evidence: [
        'Seasonal lake formations matching historical descriptions',
        'Ancient river channels and elevated mounds',
        'Petroglyphs and rock art sites'
      ]
    },
    cultural_context: {
      associated_peoples: ['Warao', 'Kariña', 'Pemón', 'Makuxi'],
      time_period: '800-1600 CE',
      cultural_significance: 'Mythical center of wealth and power in the Orinoco basin',
      ceremonial_importance: 'Sacred geography associated with seasonal flooding cycles'
    },
    search_methodology: {
      recommended_techniques: ['Seasonal satellite monitoring', 'Aerial photography', 'Ground surveys', 'Hydrological analysis'],
      priority_areas: ['Orinoco Delta', 'Rupununi savanna', 'Seasonal lake regions'],
      seasonal_considerations: 'Wet season (May-November) creates temporary lakes, dry season reveals archaeological features',
      access_challenges: ['Seasonal flooding', 'Remote location', 'Political boundaries', 'Limited infrastructure']
    },
    related_discoveries: [
      'Monte Roraima archaeological sites',
      'Orinoco petroglyphs',
      'Warao traditional settlements'
    ],
    modern_expeditions: [
      'Walter Raleigh expeditions (1595, 1617)',
      'Alexander von Humboldt Orinoco exploration (1800)',
      'Modern Venezuelan archaeological surveys (1980s-2000s)'
    ]
  }
];

interface HistoricalContextIntegrationProps {
  onSiteSelect: (site: LegendarySite) => void;
  onAnalyzeLegendarySite: (coordinates: string, context: string) => void;
  className?: string;
}

export function HistoricalContextIntegration({
  onSiteSelect,
  onAnalyzeLegendarySite,
  className
}: HistoricalContextIntegrationProps) {
  const [selectedSite, setSelectedSite] = useState<LegendarySite | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'context' | 'methodology'>('sources');

  const handleSiteAnalysis = (site: LegendarySite) => {
    const context = `Legendary Site Analysis: ${site.name} - ${site.cultural_context.cultural_significance}`;
    onAnalyzeLegendarySite(site.coordinates, context);
    onSiteSelect(site);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400 bg-green-500/20';
    if (confidence >= 75) return 'text-yellow-400 bg-yellow-500/20';
    if (confidence >= 60) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getLegendTypeIcon = (type: string) => {
    switch (type) {
      case 'lost_city': return <Crown className="w-4 h-4" />;
      case 'treasure': return <Star className="w-4 h-4" />;
      case 'sacred_site': return <Compass className="w-4 h-4" />;
      case 'civilization': return <Users className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("bg-slate-800/50 rounded-lg border border-slate-700/50 p-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Scroll className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Historical Context Integration</h3>
        <span className="text-xs text-slate-400">Legendary Site Analysis</span>
      </div>

      {/* Legendary Sites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {LEGENDARY_SITES.map((site) => (
          <motion.div
            key={site.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-all",
              selectedSite?.id === site.id
                ? "border-amber-500/50 bg-amber-500/10"
                : "border-slate-600/30 hover:border-slate-500/50 bg-slate-700/30"
            )}
            onClick={() => setSelectedSite(site)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Site Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{site.name}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  {getLegendTypeIcon(site.legend_type)}
                  <span className="capitalize">{site.legend_type.replace('_', ' ')}</span>
                </div>
              </div>
              
              <span className={cn("text-xs px-2 py-1 rounded-full", getConfidenceColor(site.confidence_level))}>
                {site.confidence_level}% CONFIDENCE
              </span>
            </div>

            {/* Cultural Context */}
            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-1">Associated Peoples:</div>
              <div className="flex flex-wrap gap-1">
                {site.cultural_context.associated_peoples.slice(0, 3).map((people, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-amber-600/20 text-amber-300 px-2 py-1 rounded"
                  >
                    {people}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Period */}
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-300">
              <Calendar className="w-3 h-3 text-purple-400" />
              <span>{site.cultural_context.time_period}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSiteAnalysis(site);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-3 py-2 rounded text-sm transition-colors"
              >
                <Search className="w-3 h-3" />
                Analyze
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                  setSelectedSite(site);
                }}
                className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-2 rounded text-sm transition-colors"
              >
                <Book className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Historical Commands */}
      <div className="border-t border-slate-600/30 pt-4">
        <h4 className="text-sm font-medium text-white mb-3">Quick Historical Analysis</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => onAnalyzeLegendarySite('4.9725, -73.7736', 'El Dorado - Muisca sacred ceremonies')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Crown className="w-3 h-3 text-yellow-400" />
            El Dorado
          </button>
          
          <button
            onClick={() => onAnalyzeLegendarySite('-12.8628, -69.3558', 'Paititi - Lost Inca city')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Crown className="w-3 h-3 text-emerald-400" />
            Paititi
          </button>
          
          <button
            onClick={() => onAnalyzeLegendarySite('6.7753, -61.1094', 'Manoa - Orinoco golden city')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Star className="w-3 h-3 text-blue-400" />
            Manoa
          </button>
          
          <button
            onClick={() => {
              const randomSite = LEGENDARY_SITES[Math.floor(Math.random() * LEGENDARY_SITES.length)];
              handleSiteAnalysis(randomSite);
            }}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Zap className="w-3 h-3 text-purple-400" />
            Random
          </button>
        </div>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {showDetails && selectedSite && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-lg border border-slate-700/50 p-6 max-w-4xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedSite.name}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-4 mb-4 border-b border-slate-600/30">
                {[
                  { id: 'sources', label: 'Historical Sources', icon: <Scroll className="w-4 h-4" /> },
                  { id: 'context', label: 'Cultural Context', icon: <Users className="w-4 h-4" /> },
                  { id: 'methodology', label: 'Search Methods', icon: <Search className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2",
                      activeTab === tab.id
                        ? "text-amber-400 border-amber-400"
                        : "text-slate-400 border-transparent hover:text-white"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4 text-sm">
                {activeTab === 'sources' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Indigenous Oral Traditions</h4>
                      <ul className="space-y-1">
                        {selectedSite.historical_sources.indigenous_oral_traditions.map((tradition, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <Users className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                            {tradition}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Spanish Chronicles</h4>
                      <ul className="space-y-1">
                        {selectedSite.historical_sources.spanish_chronicles.map((chronicle, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <Scroll className="w-3 h-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                            {chronicle}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Modern Research</h4>
                      <ul className="space-y-1">
                        {selectedSite.historical_sources.modern_research.map((research, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <Book className="w-3 h-3 mt-0.5 text-blue-400 flex-shrink-0" />
                            {research}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'context' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Cultural Significance</h4>
                      <p className="text-slate-300">{selectedSite.cultural_context.cultural_significance}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Ceremonial Importance</h4>
                      <p className="text-slate-300">{selectedSite.cultural_context.ceremonial_importance}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Associated Peoples</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSite.cultural_context.associated_peoples.map((people, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-600/20 text-amber-300 px-3 py-1 rounded"
                          >
                            {people}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'methodology' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Recommended Techniques</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSite.search_methodology.recommended_techniques.map((technique, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded"
                          >
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Priority Areas</h4>
                      <ul className="space-y-1">
                        {selectedSite.search_methodology.priority_areas.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <MapPin className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-amber-400 mb-2">Seasonal Considerations</h4>
                      <p className="text-slate-300">{selectedSite.search_methodology.seasonal_considerations}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Button */}
              <div className="pt-4 border-t border-slate-600/30 mt-6">
                <button
                  onClick={() => {
                    handleSiteAnalysis(selectedSite);
                    setShowDetails(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Start Historical Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 