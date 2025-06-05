"use client";

import React from 'react';
import { 
  MapPin, 
  Target, 
  Calendar, 
  Users, 
  Zap, 
  Eye, 
  Search, 
  BookOpen, 
  Compass,
  TrendingUp,
  Shield,
  Star,
  Clock,
  Globe,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export interface ArchaeologicalAnalysis {
  coordinates: string;
  confidence: number;
  patternType: string;
  features: Array<{
    name: string;
    confidence: number;
    description: string;
    cultural_significance: string;
  }>;
  historical_context: {
    period: string;
    culture: string;
    evidence: string[];
    significance: string;
  };
  indigenous_perspective: {
    traditional_knowledge: string[];
    oral_histories: string[];
    cultural_importance: string;
  };
  recommendations: Array<{
    type: 'immediate' | 'research' | 'community' | 'preservation';
    priority: 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
  }>;
  research_methods: string[];
  related_sites: Array<{
    coordinates: string;
    confidence: number;
    similarity: string;
  }>;
}

export interface VisionAnalysis {
  coordinates: string;
  analysis_id: string;
  processing_time: number;
  features: Array<{
    name: string;
    confidence: number;
    description: string;
    coordinates?: string;
  }>;
  model_performance: {
    accuracy: number;
    processing_speed: number;
  };
  geographic_context: string;
  cultural_context: string;
  next_steps: string[];
}

export function generateEnhancedArchaeologicalResponse(analysis: ArchaeologicalAnalysis): string {
  const confidenceEmoji = analysis.confidence >= 0.9 ? '🎯' : analysis.confidence >= 0.7 ? '🔍' : '🤔';
  const priorityIcon = analysis.recommendations.some(r => r.priority === 'high') ? '🚨' : '📋';

  return `## ${confidenceEmoji} Archaeological Discovery Analysis

### 📍 **Location Analysis**
**Coordinates**: ${analysis.coordinates}  
**Overall Confidence**: **${Math.round(analysis.confidence * 100)}%** ${getConfidenceBar(analysis.confidence)}  
**Site Classification**: **${analysis.patternType}**

---

### 🏛️ **Detected Archaeological Features**

${analysis.features.map((feature, index) => `
**${index + 1}. ${feature.name}** ${getConfidenceEmoji(feature.confidence)}
- **Confidence**: ${Math.round(feature.confidence * 100)}%
- **Description**: ${feature.description}
- **Cultural Significance**: ${feature.cultural_significance}
`).join('\n')}

---

### 📚 **Historical Context** ${getTimePeriodEmoji(analysis.historical_context.period)}
**Period**: ${analysis.historical_context.period}  
**Culture**: ${analysis.historical_context.culture}

**Archaeological Evidence**:
${analysis.historical_context.evidence.map(evidence => `• ${evidence}`).join('\n')}

**Historical Significance**: ${analysis.historical_context.significance}

---

### 🌿 **Indigenous Knowledge & Perspectives**

**Traditional Knowledge**:
${analysis.indigenous_perspective.traditional_knowledge.map(knowledge => `• ${knowledge}`).join('\n')}

**Oral Historical Accounts**:
${analysis.indigenous_perspective.oral_histories.map(history => `• ${history}`).join('\n')}

**Cultural Importance**: ${analysis.indigenous_perspective.cultural_importance}

---

### ${priorityIcon} **Research Recommendations**

${analysis.recommendations.map((rec, index) => `
**${index + 1}. ${rec.action}** ${getPriorityEmoji(rec.priority)}
- **Type**: ${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)} Research
- **Priority**: ${rec.priority.toUpperCase()}
- **Rationale**: ${rec.rationale}
`).join('\n')}

---

### 🔗 **Related Archaeological Sites**

${analysis.related_sites.map((site, index) => `
**${index + 1}.** ${site.coordinates} - **${Math.round(site.confidence * 100)}%** confidence
*Similarity*: ${site.similarity}
`).join('\n')}

---

### 🛠️ **Suggested Research Methods**
${analysis.research_methods.map(method => `• **${method}**`).join('\n')}

---

*Ready for next analysis? Try:*
- /vision ${analysis.coordinates} - Detailed satellite analysis
- /research ${analysis.patternType.toLowerCase()} - Historical research
- /discover nearby ${analysis.coordinates} - Find similar sites`;
}

export function generateEnhancedVisionResponse(analysis: VisionAnalysis): string {
  const performanceEmoji = analysis.model_performance.accuracy >= 0.8 ? '🎯' : '🔍';
  
  return `## 👁️ AI Vision Analysis Complete

### 📍 **Analysis Overview**
**Location**: ${analysis.coordinates}  
**Analysis ID**: ${analysis.analysis_id}  
**Processing Time**: ⏱️ **${analysis.processing_time.toFixed(1)}s**

---

### 🔍 **Features Detected** (${analysis.features.length} total)

${analysis.features.map((feature, index) => `
**${index + 1}. ${feature.name}** ${getConfidenceEmoji(feature.confidence)}
- **Confidence**: ${Math.round(feature.confidence * 100)}%
- **Description**: ${feature.description}
${feature.coordinates ? `- **Location**: ${feature.coordinates}` : ''}
`).join('\n')}

---

### 🤖 **AI Model Performance** ${performanceEmoji}
- **Accuracy**: **${Math.round(analysis.model_performance.accuracy * 100)}%** ${getConfidenceBar(analysis.model_performance.accuracy)}
- **Processing Speed**: **${Math.round(analysis.model_performance.processing_speed * 100)}%** efficiency

---

### 📊 **Analysis Pipeline** ✅
• **Coordinate Validation**: Complete ✓
• **Satellite Data Acquisition**: Complete ✓  
• **GPT-4o Vision Processing**: Complete ✓
• **Archaeological Context Analysis**: Complete ✓
• **Feature Classification**: Complete ✓
• **Cultural Significance Assessment**: Complete ✓

---

### 🌍 **Contextual Analysis**

**Geographic Context**: ${analysis.geographic_context}

**Cultural Context**: ${analysis.cultural_context}

---

### 🎯 **Recommended Next Steps**

${analysis.next_steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

---

*Continue your research:*
- /analyze ${analysis.coordinates} - Full archaeological analysis
- /research vision-detected-features - Research similar patterns
- /discover pattern-match ${analysis.coordinates} - Find matching sites`;
}

export function generateContextualResponse(input: string, context?: any): string {
  const coordinates = extractCoordinates(input);
  
  if (coordinates) {
    return generateCoordinateResponse(coordinates, context);
  }
  
  if (input.toLowerCase().includes('help')) {
    return generateEnhancedHelpResponse();
  }
  
  if (input.toLowerCase().includes('research')) {
    return generateResearchGuidance();
  }
  
  return generateDefaultResponse(input);
}

// Real data integration functions
export async function fetchRealArchaeologicalAnalysis(coordinates: string): Promise<ArchaeologicalAnalysis | null> {
  try {
    const response = await fetch(`http://localhost:8000/analysis/archaeological`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates })
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend unavailable, using contextual response');
  }
  return null;
}

export async function fetchRealVisionAnalysis(coordinates: string): Promise<VisionAnalysis | null> {
  try {
    const response = await fetch(`http://localhost:8000/analysis/vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates })
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend unavailable, using contextual response');
  }
  return null;
}

export async function generateRealTimeResponse(input: string): Promise<string> {
  const coordinates = extractCoordinates(input);
  
  if (coordinates) {
    if (input.toLowerCase().includes('/analyze')) {
      const realData = await fetchRealArchaeologicalAnalysis(coordinates);
      if (realData) {
        return generateEnhancedArchaeologicalResponse(realData);
      }
    } else if (input.toLowerCase().includes('/vision')) {
      const realData = await fetchRealVisionAnalysis(coordinates);
      if (realData) {
        return generateEnhancedVisionResponse(realData);
      }
    }
    
    // If no real data available, provide analysis guidance
    return generateCoordinateResponse(coordinates);
  }
  
  return generateContextualResponse(input);
}

function generateCoordinateResponse(coordinates: string, context?: any): string {
  const [lat, lng] = coordinates.split(',').map(c => parseFloat(c.trim()));
  const region = getRegionName(lat, lng);
  const climate = getClimateZone(lat, lng);
  
  return `## 🗺️ Coordinate Analysis Initiated

### 📍 **Location Details**
**Coordinates**: ${coordinates}  
**Region**: ${region}  
**Climate Zone**: ${climate}  
**Grid Reference**: ${generateGridReference(lat, lng)}

---

### 🔍 **Analysis Options Available**

**🛰️ Satellite Analysis**
/vision ${coordinates} - AI-powered satellite imagery analysis

**🏛️ Archaeological Analysis**  
/analyze ${coordinates} - Comprehensive archaeological assessment

**📚 Historical Research**
/research coordinates ${coordinates} - Historical document analysis

**🌿 Indigenous Knowledge**
/indigenous ${coordinates} - Traditional knowledge integration

---

### 🎯 **Quick Actions**
- **Analyze Now**: Click to run full archaeological analysis
- **Vision Scan**: Satellite imagery processing
- **Research History**: Access historical documents
- **Community Connect**: Link to indigenous knowledge

*Select an analysis type or use a command to continue...*`;
}

function generateEnhancedHelpResponse(): string {
  return `## 🤖 NIS Archaeological Assistant - Enhanced Guide

### 🎯 **Core Commands**

**📍 Analysis Commands**
- /analyze [coordinates] - Complete archaeological analysis
- /vision [coordinates] - AI satellite imagery analysis  
- /discover [region/type] - Site discovery and pattern matching
- /research [topic] - Historical and academic research

**🗺️ Navigation Commands**
- /map [coordinates] - Interactive map visualization
- /nearby [coordinates] - Find related archaeological sites
- /route [start] [end] - Plan archaeological survey routes

**📚 Research Commands**
- /historical [period/culture] - Historical document analysis
- /indigenous [region] - Traditional knowledge integration
- /codex [manuscript] - Ancient text analysis
- /cross-reference [site1] [site2] - Comparative analysis

---

### 🌟 **Enhanced Features**

**🎨 Visual Analysis**
- Automatic image recognition and analysis
- Confidence visualization with detailed breakdowns
- Interactive maps with archaeological overlays

**📊 Smart Processing**
- Batch analysis for multiple coordinates
- Real-time typing indicators
- File upload and vision analysis

**💾 Session Management**
- Chat history persistence
- Export/import analysis results
- Session search and organization

---

### 🚀 **Quick Start Examples**

**Coordinate Analysis**:
/analyze -8.1116, -79.0291

**Historical Research**:
/research pre-columbian peru coastal

**Vision Analysis**:
/vision satellite-image.jpg

**Discovery Mode**:
/discover ceremonial complexes amazon

---

*Ready to explore archaeological mysteries? Try any command above!*`;
}

function generateResearchGuidance(): string {
  return `## 📚 Archaeological Research Database

### 🔍 **Available Research Capabilities**

**📖 Historical Sources**
- Colonial period documents and maps
- Archaeological survey reports  
- Academic papers and publications
- Museum collection records

**🌿 Indigenous Knowledge**
- Oral history collections
- Traditional ecological knowledge
- Ethnographic studies
- Community consultations

**🛰️ Modern Analysis**
- Satellite imagery databases
- LiDAR terrain analysis
- Ground-penetrating radar data
- Photogrammetry reconstructions

---

### 🎯 **Research Methodologies**

**🏛️ Site Analysis**
- Stratigraphic correlation
- Artifact typological analysis
- Radiocarbon dating integration
- Cultural sequence building

**📊 Pattern Recognition**
- Settlement pattern analysis
- Trade route reconstruction
- Cultural boundary mapping
- Temporal distribution studies

**🤝 Community Integration**
- Participatory archaeology methods
- Traditional knowledge validation
- Cultural protocol observation
- Collaborative interpretation

---

### 🗺️ **Regional Specializations**

**🌎 Americas**
- Pre-Columbian civilizations
- Colonial period archaeology
- Indigenous cultural landscapes

**🌍 Global Comparative**
- Cross-cultural analysis
- Migration pattern studies
- Technological diffusion

---

### 💡 **How to Use Research Tools**

**Specific Queries**:
- /research [topic] [region] [time-period]
- /historical [culture] [artifact-type]
- /indigenous [region] [knowledge-type]

**Examples**:
- /research ceramic styles coastal peru 1000-1500ce
- /historical inca administrative centers
- /indigenous amazon traditional fishing methods

---

*What would you like to research today?*`;
}

function generateDefaultResponse(input: string): string {
  return `## 🤖 NIS Archaeological Assistant

I understand you're interested in **"${input}"**. Let me help you explore this further!

### 🎯 **Suggested Actions**

**If you have coordinates**:
- Use /analyze [lat, lng] for full archaeological analysis
- Use /vision [lat, lng] for satellite imagery analysis

**If you're researching a topic**:
- Use /research [your topic] for historical research
- Use /discover [site type or region] for site discovery

**If you need assistance**:
- Use /help for complete command guide
- Use /examples for analysis examples

---

### 💡 **Quick Tips**
- Upload images for automatic vision analysis
- Use coordinates in decimal degrees format
- Try specific commands for better results

*How can I assist with your archaeological research?*`;
}

// Helper functions
function getConfidenceBar(confidence: number): string {
  const bars = Math.round(confidence * 10);
  const filled = '█'.repeat(bars);
  const empty = '░'.repeat(10 - bars);
  return `${filled}${empty}`;
}

function getConfidenceEmoji(confidence: number): string {
  if (confidence >= 0.9) return '🎯';
  if (confidence >= 0.7) return '🔍';
  if (confidence >= 0.5) return '🤔';
  return '❓';
}

function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case 'high': return '🚨';
    case 'medium': return '⚠️';
    case 'low': return '📝';
    default: return '📋';
  }
}

function getTimePeriodEmoji(period: string): string {
  if (period.includes('pre-') || period.includes('Pre-')) return '🏺';
  if (period.includes('colonial') || period.includes('Colonial')) return '⛵';
  if (period.includes('modern') || period.includes('Modern')) return '🏗️';
  return '📅';
}

function extractCoordinates(text: string): string | null {
  const coordRegex = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
  const match = text.match(coordRegex);
  return match ? match[0] : null;
}

function getRegionName(lat: number, lng: number): string {
  // Simplified region detection - in reality this would use a proper geocoding service
  if (lat >= -20 && lat <= 15 && lng >= -85 && lng <= -30) {
    return "South American Coast";
  }
  if (lat >= -15 && lat <= 5 && lng >= -80 && lng <= -50) {
    return "Amazon Basin";
  }
  return "Global Coordinates";
}

function getClimateZone(lat: number, lng: number): string {
  const absLat = Math.abs(lat);
  if (absLat <= 23.5) return "Tropical";
  if (absLat <= 35) return "Subtropical";
  if (absLat <= 60) return "Temperate";
  return "Polar";
}

function generateGridReference(lat: number, lng: number): string {
  const latGrid = Math.floor((lat + 90) / 10);
  const lngGrid = Math.floor((lng + 180) / 10);
  return `G${latGrid}-${lngGrid}`;
}

 