// Map Enhanced Analysis Data to Frontend Cards
const mapEnhancedDataToCards = () => {
  console.log('🚀 MAPPING ENHANCED ANALYSIS DATA TO FRONTEND CARDS...')
  
  // Load our enhanced analysis data
  fetch('./all_sites_enhanced_20250625_193953.json')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Loaded enhanced data:', data.metadata)
      
      const enhancedSites = data.enhanced_sites
      const mappedAnalysis = {}
      
      enhancedSites.forEach(site => {
        const analysis = site.enhanced_analysis
        
        // Map to the card format
        mappedAnalysis[site.site_id] = {
          vision_analysis: {
            satellite_findings: {
              features_detected: analysis.features_detected || 0,
              detected_features: analysis.detected_features || [],
              confidence: analysis.statistical_analysis?.average_confidence || 0.8
            },
            multi_modal_confidence: analysis.statistical_analysis?.average_confidence || 0.8,
            enhanced_processing: true,
            lidar_findings: {
              elevation_analysis: true,
              structure_detection: analysis.detected_features?.length || 0
            }
          },
          
          memory_analysis: {
            cultural_context: analysis.cultural_assessment || {},
            historical_references: [],
            similar_sites: [],
            indigenous_knowledge: {
              cultural_periods: analysis.cultural_assessment?.cultural_periods || [],
              temporal_span: analysis.cultural_assessment?.temporal_span || "Unknown"
            }
          },
          
          reasoning_analysis: {
            archaeological_interpretation: {
              site_complexity: analysis.cultural_assessment?.site_complexity || "Medium",
              overall_significance: analysis.cultural_assessment?.overall_significance || "High",
              features_breakdown: analysis.detected_features || []
            },
            confidence_assessment: analysis.statistical_analysis?.average_confidence || 0.8,
            evidence_correlation: analysis.detected_features || []
          },
          
          action_analysis: {
            strategic_recommendations: analysis.recommendations || [
              "Conduct ground-truthing survey for high-confidence features",
              "Prioritize excavation of ceremonial and burial sites",
              "Implement preservation measures for vulnerable areas"
            ],
            priority_actions: ["Survey", "Excavate", "Preserve", "Document"],
            resource_requirements: {
              team_size: 5,
              budget: 50000,
              equipment: ["Ground-penetrating radar", "Drone mapping", "Excavation tools"]
            },
            timeline_planning: {
              phase1: "Site survey (2 weeks)",
              phase2: "Excavation (6 weeks)", 
              phase3: "Analysis (4 weeks)"
            }
          },
          
          consciousness_synthesis: {
            unified_interpretation: {
              site_significance: analysis.cultural_assessment?.overall_significance || "High",
              features_detected: analysis.features_detected || 0,
              overall_assessment: `Revolutionary NIS Protocol v1 analysis reveals ${analysis.features_detected || 0} archaeological features across ${analysis.cultural_assessment?.cultural_periods?.length || 1} cultural periods with ${((analysis.statistical_analysis?.average_confidence || 0.8) * 100).toFixed(1)}% average confidence. Site complexity rated as ${analysis.cultural_assessment?.site_complexity || "Medium"} with ${analysis.cultural_assessment?.overall_significance || "High"} cultural significance.`,
              processing_time: analysis.processing_time || "< 1 minute",
              agent_performance: analysis.agent_performance || { pattern_recognition: 0.94 }
            },
            cognitive_coherence: analysis.statistical_analysis?.average_confidence || 0.8,
            global_workspace_integration: {
              multi_modal_fusion: true,
              kan_integration: true,
              consciousness_level: "Enhanced"
            }
          },
          
          enhanced_attributes: {
            site_complexity: analysis.features_detected > 20 ? 5 : analysis.features_detected > 15 ? 4 : 3,
            cultural_importance_score: analysis.statistical_analysis?.average_confidence || 0.8,
            preservation_status: analysis.statistical_analysis?.preservation_quality > 0.8 ? "Excellent" : "Good",
            research_priority: analysis.features_detected > 20 ? 5 : 4,
            nis_protocol_version: "v1_FULL_POWER",
            enhancement_timestamp: site.analysis_timestamp
          }
        }
      })
      
      // Store in localStorage for frontend access
      localStorage.setItem('enhancedSiteAnalysis', JSON.stringify(mappedAnalysis))
      
      console.log('🎉 ENHANCED DATA MAPPED AND STORED!')
      console.log(`📊 Mapped ${Object.keys(mappedAnalysis).length} sites`)
      console.log('💎 Cards should now display rich analysis data!')
      
      // Trigger a custom event to notify the frontend
      window.dispatchEvent(new CustomEvent('enhancedDataReady', { 
        detail: { 
          sitesCount: Object.keys(mappedAnalysis).length,
          totalFeatures: enhancedSites.reduce((sum, site) => sum + (site.enhanced_analysis.features_detected || 0), 0)
        }
      }))
      
    })
    .catch(error => {
      console.error('❌ Error loading enhanced data:', error)
    })
}

// Run the mapping
mapEnhancedDataToCards() 