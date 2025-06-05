"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Crown, 
  Mountain, 
  Trees, 
  Waves, 
  Calendar,
  Scroll,
  Target,
  Eye,
  Star,
  Compass,
  Book,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ElDoradoLocation {
  id: string;
  name: string;
  coordinates: string;
  lat: number;
  lng: number;
  region: string;
  country: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  historical_context: string;
  evidence_type: string[];
  discovery_potential: number;
  terrain_type: 'mountain' | 'jungle' | 'lake' | 'river' | 'plateau';
  indigenous_peoples: string[];
  spanish_chronicles: string[];
  modern_research: string[];
  satellite_anomalies: string[];
  lidar_coverage: boolean;
  accessibility: 'easy' | 'moderate' | 'difficult' | 'extreme';
  estimated_timeframe: string;
}

const EL_DORADO_LOCATIONS: ElDoradoLocation[] = [
  {
    id: 'guatavita_sacred',
    name: 'Lake Guatavita Sacred Complex',
    coordinates: '4.9725, -73.7736',
    lat: 4.9725,
    lng: -73.7736,
    region: 'Cundinamarca Altiplano',
    country: 'Colombia',
    priority: 'high',
    confidence: 95,
    historical_context: 'Original El Dorado ceremony site. Muisca peoples performed gold offerings to Bachué goddess. Spanish chroniclers documented elaborate rituals with golden rafts.',
    evidence_type: ['ceremonial_artifacts', 'gold_offerings', 'spanish_chronicles', 'archaeological_excavations'],
    discovery_potential: 88,
    terrain_type: 'lake',
    indigenous_peoples: ['Muisca', 'Chibcha'],
    spanish_chronicles: ['Juan Rodríguez Freyle (1636)', 'Gonzalo Fernández de Oviedo (1535)'],
    modern_research: ['Banco de la República excavations (1965-1970)', 'ICANH surveys (2010-2020)'],
    satellite_anomalies: ['Circular lake formations', 'Terraced hillsides', 'Ancient pathways'],
    lidar_coverage: true,
    accessibility: 'easy',
    estimated_timeframe: '600-1600 CE'
  },
  {
    id: 'magdalena_mysterious',
    name: 'Upper Magdalena Valley Complex',
    coordinates: '2.5449, -75.8814',
    lat: 2.5449,
    lng: -75.8814,
    region: 'Huila Department',
    country: 'Colombia',
    priority: 'high',
    confidence: 82,
    historical_context: 'Archaeological evidence suggests major pre-Columbian settlement with sophisticated metalworking. Tomb robbers found extensive gold artifacts in the 1940s.',
    evidence_type: ['gold_artifacts', 'megalithic_statues', 'underground_chambers', 'hydraulic_systems'],
    discovery_potential: 91,
    terrain_type: 'mountain',
    indigenous_peoples: ['Tierradentro', 'San Agustín culture'],
    spanish_chronicles: ['Sebastián de Belalcázar expeditions (1536)'],
    modern_research: ['San Agustín Archaeological Park', 'ICANH systematic surveys'],
    satellite_anomalies: ['Geometric earthworks', 'Stone circle formations', 'Water channel systems'],
    lidar_coverage: true,
    accessibility: 'moderate',
    estimated_timeframe: '100-1400 CE'
  },
  {
    id: 'amazon_paititi',
    name: 'Paititi-El Dorado Connection Zone',
    coordinates: '-12.8628, -69.3558',
    lat: -12.8628,
    lng: -69.3558,
    region: 'Madre de Dios',
    country: 'Peru',
    priority: 'high',
    confidence: 76,
    historical_context: 'Inca legends speak of Paititi, the lost golden city. Modern satellite analysis reveals geometric patterns consistent with pre-Columbian urban planning.',
    evidence_type: ['geometric_earthworks', 'inca_legends', 'satellite_anomalies', 'petroglyphs'],
    discovery_potential: 94,
    terrain_type: 'jungle',
    indigenous_peoples: ['Machiguenga', 'Matsigenka', 'Inca'],
    spanish_chronicles: ['Garcilaso de la Vega accounts', 'Jesuit mission reports (1650s)'],
    modern_research: ['Thierry Jamin expeditions (2009-2015)', 'NASA satellite analysis'],
    satellite_anomalies: ['Rectangular clearings', 'Radial pathway systems', 'Elevated platforms'],
    lidar_coverage: false,
    accessibility: 'extreme',
    estimated_timeframe: '1200-1532 CE'
  },
  {
    id: 'orinoco_manoa',
    name: 'Manoa del Dorado - Orinoco Basin',
    coordinates: '6.7753, -61.1094',
    lat: 6.7753,
    lng: -61.1094,
    region: 'Orinoco Delta',
    country: 'Venezuela',
    priority: 'medium',
    confidence: 68,
    historical_context: 'Sir Walter Raleigh\'s target location. Indigenous oral traditions describe a golden city called Manoa on a great lake. Seasonal flooding creates temporary lake systems.',
    evidence_type: ['oral_traditions', 'colonial_maps', 'seasonal_lakes', 'petroglyphs'],
    discovery_potential: 79,
    terrain_type: 'river',
    indigenous_peoples: ['Warao', 'Kariña', 'Pemón'],
    spanish_chronicles: ['Antonio de Berrío reports (1584)', 'Walter Raleigh accounts (1595)'],
    modern_research: ['Venezuelan Institute of Archaeology', 'Orinoco Basin surveys'],
    satellite_anomalies: ['Seasonal lake formations', 'Ancient river channels', 'Elevated mounds'],
    lidar_coverage: false,
    accessibility: 'difficult',
    estimated_timeframe: '800-1600 CE'
  },
  {
    id: 'pantanal_golden',
    name: 'Pantanal Golden Settlements',
    coordinates: '-16.4090, -56.0835',
    lat: -16.4090,
    lng: -56.0835,
    region: 'Mato Grosso Pantanal',
    country: 'Brazil',
    priority: 'medium',
    confidence: 71,
    historical_context: 'Recent discoveries of extensive pre-Columbian earthworks in the Pantanal wetlands. Evidence suggests sophisticated hydraulic civilizations with gold working capabilities.',
    evidence_type: ['earthwork_complexes', 'hydraulic_systems', 'gold_working_sites', 'ceramic_traditions'],
    discovery_potential: 85,
    terrain_type: 'plateau',
    indigenous_peoples: ['Bororo', 'Xavante', 'Guató'],
    spanish_chronicles: ['Cabeza de Vaca expeditions (1541)'],
    modern_research: ['University of São Paulo surveys', 'LIDAR mapping projects (2018-2023)'],
    satellite_anomalies: ['Geometric earthworks', 'Raised field systems', 'Ceremonial complexes'],
    lidar_coverage: true,
    accessibility: 'moderate',
    estimated_timeframe: '1000-1500 CE'
  },
  {
    id: 'guiana_highlands',
    name: 'Guiana Highlands Mystery Zone',
    coordinates: '5.2867, -60.9733',
    lat: 5.2867,
    lng: -60.9733,
    region: 'Guiana Highlands',
    country: 'Guyana',
    priority: 'low',
    confidence: 54,
    historical_context: 'Remote tepuis (table mountains) with limited archaeological investigation. Indigenous legends speak of cities in the clouds with golden treasures.',
    evidence_type: ['indigenous_legends', 'tepui_formations', 'isolated_ecosystems', 'petroglyphs'],
    discovery_potential: 67,
    terrain_type: 'mountain',
    indigenous_peoples: ['Pemón', 'Makuxi', 'Wapishana'],
    spanish_chronicles: ['Early Jesuit reports'],
    modern_research: ['Royal Geographical Society expeditions', 'Biodiversity surveys'],
    satellite_anomalies: ['Isolated plateau settlements', 'Ancient terracing', 'Stone formations'],
    lidar_coverage: false,
    accessibility: 'extreme',
    estimated_timeframe: '500-1400 CE'
  }
];

interface ElDoradoSearchSystemProps {
  onLocationSelect: (location: ElDoradoLocation) => void;
  onAnalyzeCoordinates: (coordinates: string, context: string) => void;
  className?: string;
}

export function ElDoradoSearchSystem({
  onLocationSelect,
  onAnalyzeCoordinates,
  className
}: ElDoradoSearchSystemProps) {
  const [selectedLocation, setSelectedLocation] = useState<ElDoradoLocation | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showDetails, setShowDetails] = useState(false);

  const filteredLocations = EL_DORADO_LOCATIONS.filter(loc => 
    filterPriority === 'all' || loc.priority === filterPriority
  );

  const getTerrainIcon = (terrain: string) => {
    switch (terrain) {
      case 'mountain': return <Mountain className="w-4 h-4" />;
      case 'jungle': return <Trees className="w-4 h-4" />;
      case 'lake': return <Waves className="w-4 h-4" />;
      case 'river': return <Waves className="w-4 h-4" />;
      case 'plateau': return <Mountain className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleLocationAnalysis = (location: ElDoradoLocation) => {
    const context = `El Dorado Search: ${location.name} - ${location.historical_context}`;
    onAnalyzeCoordinates(location.coordinates, context);
    onLocationSelect(location);
  };

  return (
    <div className={cn("bg-slate-800/50 rounded-lg border border-slate-700/50 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">El Dorado Search System</h3>
        </div>
        
        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-600/30 pt-4">
        <h4 className="text-sm font-medium text-white mb-3">Quick Search Commands</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => onAnalyzeCoordinates('4.9725, -73.7736', 'Lake Guatavita - Original El Dorado site')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Crown className="w-3 h-3 text-yellow-400" />
            Guatavita
          </button>
          
          <button
            onClick={() => onAnalyzeCoordinates('-12.8628, -69.3558', 'Amazon Paititi connection zone')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Trees className="w-3 h-3 text-green-400" />
            Paititi
          </button>
          
          <button
            onClick={() => onAnalyzeCoordinates('6.7753, -61.1094', 'Orinoco Manoa del Dorado')}
            className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 px-3 py-2 rounded text-sm transition-colors"
          >
            <Waves className="w-3 h-3 text-blue-400" />
            Manoa
          </button>
          
          <button
            onClick={() => {
              const randomLocation = EL_DORADO_LOCATIONS[Math.floor(Math.random() * EL_DORADO_LOCATIONS.length)];
              handleLocationAnalysis(randomLocation);
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