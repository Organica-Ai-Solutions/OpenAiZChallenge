// Trigger Enhanced Analysis for Current Site
const triggerEnhancedAnalysis = async () => {
  console.log('🚀 TRIGGERING ENHANCED NIS PROTOCOL ANALYSIS...')
  
  // Monte Alegre Rock Art Site coordinates from the map
  const coordinates = {
    lat: -1.8,
    lng: -56.9
  }
  
  const siteData = {
    id: 'monte_alegre_rock_art',
    name: 'Monte Alegre Rock Art Site',
    coordinates: '-1.8, -56.9',
    confidence: 0.86,
    type: 'ceremonial',
    period: 'Pre-Columbian',
    cultural_significance: 'settlement areas with rich archaeological deposits',
    data_sources: ['satellite', 'lidar', 'historical']
  }
  
  console.log('🧠 Starting KAN-Enhanced Vision Analysis...')
  
  try {
    // 1. KAN Archaeological Site Analysis
    const kanResponse = await fetch('http://localhost:8000/analyze/archaeological-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        data_sources: ["satellite", "lidar", "elevation", "historical"],
        use_kan: true,
        archaeological_templates: true,
        amazon_basin_optimized: true
      })
    })
    
    if (kanResponse.ok) {
      const kanResults = await kanResponse.json()
      console.log('✅ KAN Vision Analysis completed:', kanResults)
    }
    
    // 2. Enhanced Multi-Agent Analysis
    console.log('🤖 Starting Multi-Agent Analysis...')
    const agentResponse = await fetch('http://localhost:8000/agents/archaeological/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: coordinates,
        analysis_type: 'comprehensive',
        enhanced_processing: true,
        hd_lidar: true,
        kan_integration: true
      })
    })
    
    if (agentResponse.ok) {
      const agentResults = await agentResponse.json()
      console.log('✅ Multi-Agent Analysis completed:', agentResults)
    }
    
    // 3. Enhanced Cultural Reasoning
    console.log('🏛️ Starting Enhanced Cultural Reasoning...')
    const culturalResponse = await fetch('http://localhost:8000/analyze/enhanced-cultural-reasoning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: coordinates.lat,
        lon: coordinates.lng,
        historical_context: siteData.cultural_significance,
        indigenous_knowledge: {
          site_type: siteData.type,
          period: siteData.period,
          cultural_data: siteData.data_sources
        },
        site_metadata: {
          confidence: siteData.confidence,
          discovery_date: '2024-11-10'
        }
      })
    })
    
    if (culturalResponse.ok) {
      const culturalResults = await culturalResponse.json()
      console.log('✅ Enhanced Cultural Reasoning completed:', culturalResults)
    }
    
    console.log('🎉 ALL ENHANCED ANALYSES COMPLETED!')
    console.log('💎 Cards should now be populated with revolutionary NIS Protocol data!')
    
  } catch (error) {
    console.error('❌ Analysis error:', error)
  }
}

// Execute the analysis
triggerEnhancedAnalysis() 