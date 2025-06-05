"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Mountain, 
  Trees, 
  Waves, 
  Sun,
  Crown,
  Pyramid,
  Users,
  Calendar,
  Scroll,
  Gem,
  Compass,
  Globe,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ArchaeologicalRegion {
  id: string;
  name: string;
  countries: string[];
  coordinates: string;
  lat: number;
  lng: number;
  civilization_periods: string[];
  major_cultures: string[];
  archaeological_significance: number;
  terrain_characteristics: string[];
  climate_zones: string[];
  discovery_highlights: string[];
  research_priorities: string[];
  satellite_coverage: 'excellent' | 'good' | 'limited' | 'poor';
  lidar_availability: boolean;
  accessibility: 'easy' | 'moderate' | 'difficult' | 'extreme';
  seasonal_considerations: string;
  indigenous_knowledge: string[];
  historical_chronicles: string[];
  modern_threats: string[];
  conservation_status: 'protected' | 'monitored' | 'at_risk' | 'critical';
  research_institutions: string[];
  recommended_analysis_types: string[];
}

const SOUTH_AMERICAN_REGIONS: ArchaeologicalRegion[] = [
  {
    id: 'andes_northern',
    name: 'Northern Andes Archaeological Zone',
    countries: ['Colombia', 'Ecuador', 'Northern Peru'],
    coordinates: '0.1807, -78.4678',
    lat: 0.1807,
    lng: -78.4678,
    civilization_periods: ['Pre-Ceramic (8000-3500 BCE)', 'Formative (3500-500 BCE)', 'Regional Development (500 BCE-600 CE)', 'Integration (600-1532 CE)'],
    major_cultures: ['Muisca', 'Tairona', 'Nariño', 'Quimbaya', 'Valdivia', 'Chorrera', 'Bahía', 'Manteño'],
    archaeological_significance: 94,
    terrain_characteristics: ['High altitude plateaus', 'Cloud forests', 'River valleys', 'Volcanic soils', 'Steep mountain slopes'],
    climate_zones: ['Tropical montane', 'Páramo', 'Cloud forest', 'Inter-Andean valleys'],
    discovery_highlights: [
      'Lake Guatavita gold offerings',
      'Ciudad Perdida (Teyuna) terraces',
      'Tierradentro underground tombs',
      'San Agustín megalithic sculptures'
    ],
    research_priorities: [
      'Pre-Columbian urban planning',
      'Metallurgy and goldworking techniques',
      'Agricultural terracing systems',
      'Ceremonial and burial practices'
    ],
    satellite_coverage: 'excellent',
    lidar_availability: true,
    accessibility: 'moderate',
    seasonal_considerations: 'Dry season (December-March) optimal for fieldwork. Rainy season (April-November) may limit access to remote sites.',
    indigenous_knowledge: [
      'Muisca oral traditions about El Dorado ceremonies',
      'Kogí sacred geography and astronomical alignments',
      'Inca road networks and administrative centers'
    ],
    historical_chronicles: [
      'Gonzalo Fernández de Oviedo (1535-1548)',
      'Juan Rodríguez Freyle - El Carnero (1636)',
      'Jesuit missionary accounts (1600s)'
    ],
    modern_threats: ['Urban expansion', 'Mining activities', 'Climate change', 'Looting'],
    conservation_status: 'monitored',
    research_institutions: ['ICANH Colombia', 'INPC Ecuador', 'Universidad Nacional'],
    recommended_analysis_types: ['LIDAR surveying', 'Ground-penetrating radar', 'Satellite multispectral analysis', 'Geophysical mapping']
  },
  {
    id: 'amazon_western',
    name: 'Western Amazon Cultural Complex',
    countries: ['Peru', 'Brazil', 'Bolivia', 'Ecuador'],
    coordinates: '-8.2275, -74.5975',
    lat: -8.2275,
    lng: -74.5975,
    civilization_periods: ['Archaic (8000-1000 BCE)', 'Formative (1000 BCE-200 CE)', 'Classic (200-1000 CE)', 'Post-Classic (1000-1532 CE)'],
    major_cultures: ['Chachapoya', 'Wari', 'Inca', 'Shipibo', 'Cashibo', 'Matsés', 'Awajún'],
    archaeological_significance: 91,
    terrain_characteristics: ['Dense rainforest canopy', 'River systems', 'Elevated plateaus', 'Flood plains', 'Terra preta soils'],
    climate_zones: ['Tropical rainforest', 'Montane forest', 'Riverine ecosystems'],
    discovery_highlights: [
      'Geoglyphs in Acre, Brazil',
      'Kuelap fortress complex',
      'Machu Picchu cloud forest connection',
      'Pre-Columbian earthworks'
    ],
    research_priorities: [
      'Lost cities and settlements',
      'Pre-Columbian landscape modification',
      'Indigenous agricultural systems',
      'Trade networks and cultural exchange'
    ],
    satellite_coverage: 'good',
    lidar_availability: false,
    accessibility: 'extreme',
    seasonal_considerations: 'Dry season (May-September) preferred. River levels affect transportation. Wet season (October-April) may flood sites.',
    indigenous_knowledge: [
      'Shipibo cosmological maps and patterns',
      'Awajún territorial knowledge and sacred sites',
      'Inca legends of Paititi and eastern territories'
    ],
    historical_chronicles: [
      'Garcilaso de la Vega - Royal Commentaries',
      'Jesuit missions in the Amazon (1650s-1700s)',
      'Francisco de Orellana expedition (1541-1542)'
    ],
    modern_threats: ['Deforestation', 'Illegal mining', 'Road construction', 'Climate change'],
    conservation_status: 'at_risk',
    research_institutions: ['SERNANP Peru', 'FUNAI Brazil', 'Smithsonian Institution'],
    recommended_analysis_types: ['Satellite deforestation monitoring', 'Aerial photography', 'Ground surveys', 'Ethnographic documentation']
  },
  {
    id: 'inca_heartland',
    name: 'Inca Heartland and Sacred Valley',
    countries: ['Peru', 'Bolivia'],
    coordinates: '-13.5170, -71.9785',
    lat: -13.5170,
    lng: -71.9785,
    civilization_periods: ['Killke (900-1200 CE)', 'Inca Empire (1200-1532 CE)', 'Colonial (1532-1821 CE)'],
    major_cultures: ['Inca', 'Killke', 'Wari', 'Tiwanaku', 'Chanapata'],
    archaeological_significance: 98,
    terrain_characteristics: ['High-altitude valleys', 'Terraced mountainsides', 'Sacred peaks (apus)', 'River confluences', 'Stone outcrops'],
    climate_zones: ['High altitude dry', 'Montane valleys', 'Puna grasslands'],
    discovery_highlights: [
      'Machu Picchu and Huayna Picchu',
      'Sacsayhuamán megalithic walls',
      'Ollantaytambo fortress',
      'Pisac agricultural terraces'
    ],
    research_priorities: [
      'Inca architectural techniques',
      'Astronomical alignments and calendar systems',
      'Agricultural innovation and terracing',
      'Royal estates and ceremonial centers'
    ],
    satellite_coverage: 'excellent',
    lidar_availability: true,
    accessibility: 'easy',
    seasonal_considerations: 'Dry season (May-September) ideal. Wet season (December-March) can affect mountain access.',
    indigenous_knowledge: [
      'Quechua oral histories and place names',
      'Traditional agricultural knowledge',
      'Sacred geography and ceque system'
    ],
    historical_chronicles: [
      'Pedro Cieza de León - Chronicle of Peru',
      'Bernabé Cobo - Historia del Nuevo Mundo',
      'Guaman Poma de Ayala - Nueva Corónica'
    ],
    modern_threats: ['Tourism pressure', 'Urban development', 'Earthquakes', 'Climate change'],
    conservation_status: 'protected',
    research_institutions: ['Ministerio de Cultura Peru', 'Universidad San Antonio Abad', 'National Geographic Society'],
    recommended_analysis_types: ['High-resolution photography', 'LIDAR mapping', 'Ground-penetrating radar', 'Architectural analysis']
  },
  {
    id: 'atlantic_coast',
    name: 'Atlantic Coast Archaeological Corridor',
    countries: ['Brazil', 'French Guiana', 'Suriname', 'Guyana', 'Venezuela'],
    coordinates: '4.8604, -52.3236',
    lat: 4.8604,
    lng: -52.3236,
    civilization_periods: ['Archaic (8000-1000 BCE)', 'Ceramic Age (1000 BCE-1500 CE)', 'European Contact (1500-1650 CE)'],
    major_cultures: ['Marajoara', 'Santarém', 'Konduri', 'Wayana', 'Kalina', 'Lokono'],
    archaeological_significance: 85,
    terrain_characteristics: ['River deltas', 'Coastal plains', 'Gallery forests', 'Seasonal floodplains', 'Shell middens'],
    climate_zones: ['Tropical humid', 'Coastal mangroves', 'Riverine forests'],
    discovery_highlights: [
      'Marajoara ceramic complexes',
      'Shell mound sites',
      'Rock art galleries',
      'Ancient village sites'
    ],
    research_priorities: [
      'Pre-Columbian ceramic traditions',
      'Coastal adaptation strategies',
      'Shell mound archaeology',
      'Early European contact sites'
    ],
    satellite_coverage: 'good',
    lidar_availability: false,
    accessibility: 'difficult',
    seasonal_considerations: 'Dry season (August-November) best for access. Wet season brings flooding and mosquitoes.',
    indigenous_knowledge: [
      'Wayana navigation and seasonal calendars',
      'Traditional fishing and hunting grounds',
      'Oral histories of ancestral sites'
    ],
    historical_chronicles: [
      'Walter Raleigh - Discovery of Guiana (1595)',
      'Dutch colonial records (1600s-1700s)',
      'French missionary accounts'
    ],
    modern_threats: ['Sea level rise', 'Mining pollution', 'Coastal erosion', 'Development pressure'],
    conservation_status: 'monitored',
    research_institutions: ['MPEG Brazil', 'Anton de Kom University', 'CIAG Venezuela'],
    recommended_analysis_types: ['Coastal monitoring', 'Underwater archaeology', 'Environmental DNA sampling', 'Cultural mapping']
  },
  {
    id: 'southern_cone',
    name: 'Southern Cone Archaeological Zone',
    countries: ['Chile', 'Argentina', 'Southern Brazil', 'Uruguay'],
    coordinates: '-32.9442, -60.6505',
    lat: -32.9442,
    lng: -60.6505,
    civilization_periods: ['Paleoindian (13000-8000 BCE)', 'Archaic (8000-1000 BCE)', 'Ceramic Period (1000 BCE-1500 CE)'],
    major_cultures: ['Mapuche', 'Tehuelche', 'Diaguita', 'Atacameño', 'Guaraní', 'Charrúa'],
    archaeological_significance: 79,
    terrain_characteristics: ['Pampas grasslands', 'Patagonian steppes', 'Andean foothills', 'River valleys', 'Coastal areas'],
    climate_zones: ['Temperate grasslands', 'Mediterranean', 'Cold steppes', 'Subantarctic'],
    discovery_highlights: [
      'Cueva de las Manos rock art',
      'Monte Verde early human site',
      'Pucará de Tilcara fortress',
      'Jesuit mission ruins'
    ],
    research_priorities: [
      'Early human migration routes',
      'Hunter-gatherer adaptations',
      'Rock art chronologies',
      'European contact archaeology'
    ],
    satellite_coverage: 'excellent',
    lidar_availability: true,
    accessibility: 'moderate',
    seasonal_considerations: 'Summer (December-March) best for fieldwork. Winter can be harsh in southern regions.',
    indigenous_knowledge: [
      'Mapuche sacred sites and nguillatun ceremonies',
      'Tehuelche territorial knowledge',
      'Guaraní agricultural practices'
    ],
    historical_chronicles: [
      'Antonio Pigafetta - Magellan voyage',
      'Jesuit missionary reports (1600s-1700s)',
      'Spanish colonial records'
    ],
    modern_threats: ['Agricultural expansion', 'Wind farm development', 'Tourism', 'Climate change'],
    conservation_status: 'monitored',
    research_institutions: ['CONICET Argentina', 'DIBAM Chile', 'MAE Brazil'],
    recommended_analysis_types: ['Rock art documentation', 'Paleoclimatic reconstruction', 'Settlement pattern analysis', 'Bioarchaeology']
  }
];

interface SouthAmericanRegionalAnalysisProps {
  onRegionSelect: (region: ArchaeologicalRegion) => void;
  onAnalyzeRegion: (coordinates: string, context: string) => void;
  className?: string;
}

export function SouthAmericanRegionalAnalysis({
  onRegionSelect,
  onAnalyzeRegion,
  className
}: SouthAmericanRegionalAnalysisProps) {
  const [selectedRegion, setSelectedRegion] = useState<ArchaeologicalRegion | null>(null);
  const [filterSignificance, setFilterSignificance] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showDetails, setShowDetails] = useState(false);

  const filteredRegions = SOUTH_AMERICAN_REGIONS.filter(region => {
    if (filterSignificance === 'all') return true;
    if (filterSignificance === 'high') return region.archaeological_significance >= 90;
    if (filterSignificance === 'medium') return region.archaeological_significance >= 80 && region.archaeological_significance < 90;
    if (filterSignificance === 'low') return region.archaeological_significance < 80;
    return true;
  });

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return 'text-red-400 bg-red-500/20';
    if (significance >= 85) return 'text-orange-400 bg-orange-500/20';
    if (significance >= 75) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-blue-400 bg-blue-500/20';
  };

  const getConservationColor = (status: string) => {
    switch (status) {
      case 'protected': return 'text-green-400 bg-green-500/20';
      case 'monitored': return 'text-blue-400 bg-blue-500/20';
      case 'at_risk': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleRegionAnalysis = (region: ArchaeologicalRegion) => {
    const context = `South American Regional Analysis: ${region.name} - ${region.major_cultures.join(', ')} cultures`;
    onAnalyzeRegion(region.coordinates, context);
    onRegionSelect(region);
  };

  return (
    <div className={cn("bg-slate-800/50 rounded-lg border border-slate-700/50 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">South American Regional Analysis</h3>
        </div>
        
        {/* Significance Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Significance:</span>
          <select
            value={filterSignificance}
            onChange={(e) => setFilterSignificance(e.target.value as any)}
            className="bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-sm text-white"
          >
            <option value="all">All Levels</option>
            <option value="high">High (90%+)</option>
            <option value="medium">Medium (80-89%)</option>
            <option value="low">Low (<80%)</option>
          </select>
        </div>
      </div>

      {/* Regional Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {filteredRegions.map((region) => (
          <motion.div
            key={region.id}
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-all",
              selectedRegion?.id === region.id
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-slate-600/30 hover:border-slate-500/50 bg-slate-700/30"
            )}
            onClick={() => setSelectedRegion(region)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Region Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{region.name}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>{region.countries.join(', ')}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={cn("text-xs px-2 py-1 rounded-full", getSignificanceColor(region.archaeological_significance))}>
                  {region.archaeological_significance}% SIGNIFICANCE
                </span>
                <span className={cn("text-xs px-2 py-1 rounded-full", getConservationColor(region.conservation_status))}>
                  {region.conservation_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Major Cultures */}
            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-1">Major Cultures:</div>
              <div className="flex flex-wrap gap-1">
                {region.major_cultures.slice(0, 4).map((culture, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-1 rounded"
                  >
                    {culture}
                  </span>
                ))}
                {region.major_cultures.length > 4 && (
                  <span className="text-xs text-slate-400">+{region.major_cultures.length - 4} more</span>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Compass className="w-3 h-3 text-blue-400" />
                <span>Coordinates: {region.coordinates}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="w-3 h-3 text-purple-400" />
                <span>{region.civilization_periods.length} periods documented</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Mountain className="w-3 h-3 text-green-400" />
                <span>{region.terrain_characteristics.length} terrain types</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegionAnalysis(region);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-2 rounded text-sm transition-colors"
              >
                <Zap className="w-3 h-3" />
                Analyze Region
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                  setSelectedRegion(region);
                }}
                className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-2 rounded text-sm transition-colors"
              >
                <Scroll className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Regional Commands */}
      <div className="border-t border-slate-600/30 pt-4">
        <h4 className="text-sm font-medium text-white mb-3">Quick Regional Analysis</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <button
            onClick={() => onAnalyzeRegion('0.1807, -78.4678', 'Northern Andes - Muisca and Tairona cultures')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Mountain className="w-3 h-3 text-emerald-400" />
            N. Andes
          </button>
          
          <button
            onClick={() => onAnalyzeRegion('-8.2275, -74.5975', 'Western Amazon - Pre-Columbian settlements')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Trees className="w-3 h-3 text-green-400" />
            Amazon
          </button>
          
          <button
            onClick={() => onAnalyzeRegion('-13.5170, -71.9785', 'Inca Heartland - Sacred Valley complex')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Crown className="w-3 h-3 text-yellow-400" />
            Inca Core
          </button>
          
          <button
            onClick={() => onAnalyzeRegion('4.8604, -52.3236', 'Atlantic Coast - Marajoara ceramic cultures')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Waves className="w-3 h-3 text-blue-400" />
            Atlantic
          </button>
          
          <button
            onClick={() => onAnalyzeRegion('-32.9442, -60.6505', 'Southern Cone - Early human sites')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Sun className="w-3 h-3 text-orange-400" />
            S. Cone
          </button>
          
          <button
            onClick={() => {
              const randomRegion = SOUTH_AMERICAN_REGIONS[Math.floor(Math.random() * SOUTH_AMERICAN_REGIONS.length)];
              handleRegionAnalysis(randomRegion);
            }}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Zap className="w-3 h-3 text-purple-400" />
            Random
          </button>
        </div>
      </div>
    </div>
  );
} 