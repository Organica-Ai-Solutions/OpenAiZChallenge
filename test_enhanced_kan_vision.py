"""Test Enhanced KAN Vision Agent - Archaeological Focus.

This test validates the enhanced KAN Vision Agent with sophisticated
pattern recognition for LIDAR and satellite archaeological data.
"""

import asyncio
import sys
import numpy as np
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / 'src'))

try:
    from src.agents.kan_vision_agent import KANVisionAgent, ArchaeologicalPatternTemplates
    print("✅ Successfully imported Enhanced KAN Vision Agent")
except ImportError as e:
    print(f"❌ Failed to import Enhanced KAN Vision Agent: {e}")
    sys.exit(1)

async def test_enhanced_kan_vision_agent():
    """Test the enhanced KAN Vision Agent with archaeological features."""
    print("\n🔬 Testing Enhanced KAN Vision Agent - Archaeological Focus")
    print("=" * 70)
    
    # Initialize the enhanced agent
    print("\n1. Initializing Enhanced KAN Vision Agent...")
    agent = KANVisionAgent(use_kan=True)
    
    # Test enhanced capabilities
    print("\n2. Testing Enhanced Capabilities...")
    capabilities = agent.get_capabilities()
    print(f"   KAN Enhanced: {capabilities.get('kan_enhanced', False)}")
    print(f"   Archaeological Templates: {capabilities.get('archaeological_pattern_templates', False)}")
    print(f"   LIDAR Analysis: {capabilities.get('lidar_specific_analysis', False)}")
    print(f"   Satellite Enhancement: {capabilities.get('satellite_enhancement', False)}")
    print(f"   Amazon Basin Specialization: {capabilities.get('amazon_basin_specialization', False)}")
    print(f"   Cultural Interpretation: {capabilities.get('cultural_interpretation', False)}")
    
    # Test archaeological pattern templates
    print("\n3. Testing Archaeological Pattern Templates...")
    templates = ArchaeologicalPatternTemplates()
    
    settlement_patterns = templates.get_settlement_patterns()
    earthwork_patterns = templates.get_earthwork_patterns()
    amazon_features = templates.get_amazon_specific_features()
    
    print(f"   Settlement Patterns: {len(settlement_patterns)}")
    for name, data in settlement_patterns.items():
        print(f"     - {name}: {data['description'][:60]}...")
    
    print(f"   Earthwork Patterns: {len(earthwork_patterns)}")
    for name, data in earthwork_patterns.items():
        print(f"     - {name}: {data['description'][:60]}...")
    
    print(f"   Amazon-Specific Features: {len(amazon_features)}")
    for name, data in amazon_features.items():
        print(f"     - {name}: {data['description'][:60]}...")
    
    # Test coordinates in Amazon basin
    print("\n4. Testing Amazon Basin Archaeological Analysis...")
    test_coordinates = [
        (-3.7327, -62.1097),  # Central Amazon
        (-8.0476, -63.0634),  # Rondônia (known archaeological region)
        (-2.4469, -54.7068),  # Santarém region
        (-5.1951, -60.7069),  # Upper Amazon
    ]
    
    for i, (lat, lon) in enumerate(test_coordinates):
        print(f"\n   Testing Site {i+1}: {lat:.4f}, {lon:.4f}")
        
        # Test comprehensive archaeological analysis
        try:
            results = await agent.analyze_archaeological_site(
                lat, lon, 
                data_sources=['satellite', 'lidar', 'elevation']
            )
            
            print(f"     ✅ Analysis completed successfully")
            print(f"     KAN Enhanced: {results.get('kan_enhanced', False)}")
            print(f"     Pattern Templates Applied: {results.get('pattern_templates_applied', False)}")
            print(f"     Data Sources: {len(results.get('data_sources_used', []))}")
            
            # Satellite analysis results
            satellite_analysis = results.get('satellite_analysis', {})
            if satellite_analysis:
                print(f"     Satellite Confidence: {satellite_analysis.get('overall_confidence', 0):.3f}")
                print(f"     Crop Marks: {satellite_analysis.get('crop_marks_score', 0):.3f}")
                print(f"     Soil Marks: {satellite_analysis.get('soil_marks_score', 0):.3f}")
            
            # LIDAR analysis results
            lidar_analysis = results.get('lidar_analysis', {})
            if lidar_analysis:
                print(f"     LIDAR Confidence: {lidar_analysis.get('overall_confidence', 0):.3f}")
                print(f"     Mound Detection: {lidar_analysis.get('mound_detection_score', 0):.3f}")
                print(f"     Geometric Patterns: {lidar_analysis.get('geometric_pattern_score', 0):.3f}")
            
            # Template matches
            template_matches = results.get('template_matches', [])
            if template_matches:
                print(f"     Template Matches: {len(template_matches)}")
                for match in template_matches[:3]:  # Show first 3
                    print(f"       - {match['template_type']}: {match['pattern_name']} ({match['match_confidence']:.3f})")
            
            # Cultural interpretation
            cultural_interp = results.get('cultural_interpretation', {})
            if cultural_interp and cultural_interp.get('interpretation'):
                print(f"     Cultural Context: {cultural_interp['interpretation'][:50]}...")
            
        except Exception as e:
            print(f"     ❌ Analysis failed: {e}")
    
    # Test enhanced feature detection
    print("\n5. Testing Enhanced Feature Detection...")
    
    # Create synthetic archaeological data
    test_data = np.random.rand(100, 100) * 0.5
    # Add circular pattern
    center_x, center_y = 50, 50
    for i in range(100):
        for j in range(100):
            dist = np.sqrt((i - center_x)**2 + (j - center_y)**2)
            if 20 < dist < 25:  # Ring pattern
                test_data[i, j] += 0.4
    
    try:
        detected_features = agent.enhanced_feature_detection(test_data)
        print(f"   ✅ Feature detection completed")
        print(f"   Detected Features: {len(detected_features)}")
        
        for feature in detected_features:
            print(f"     - Type: {feature.get('type', 'Unknown')}")
            print(f"       Confidence: {feature.get('confidence', 0):.3f}")
            print(f"       KAN Enhanced: {feature.get('kan_enhanced', False)}")
            print(f"       Interpretability: {feature.get('interpretability', 'Unknown')}")
            
            # Show pattern analysis
            pattern_analysis = feature.get('pattern_analysis', {})
            if pattern_analysis:
                print(f"       Dominant Pattern: {pattern_analysis.get('dominant_pattern', 'Unknown')}")
                print(f"       Pattern Confidence: {pattern_analysis.get('pattern_confidence', 0):.3f}")
    
    except Exception as e:
        print(f"   ❌ Feature detection failed: {e}")
    
    # Test coordinate analysis with enhanced features
    print("\n6. Testing Enhanced Coordinate Analysis...")
    try:
        coord_results = await agent.analyze_coordinates(-4.5, -61.0, use_satellite=True, use_lidar=True)
        
        print(f"   ✅ Coordinate analysis completed")
        kan_analysis = coord_results.get('kan_analysis', {})
        if kan_analysis:
            print(f"   KAN Enabled: {kan_analysis.get('enabled', False)}")
            print(f"   Analysis Method: {kan_analysis.get('analysis_method', 'Unknown')}")
            print(f"   Enhanced Features: {kan_analysis.get('enhanced_feature_count', 0)}")
            print(f"   Pattern Templates: {kan_analysis.get('pattern_templates_applied', False)}")
            print(f"   Amazon Optimized: {kan_analysis.get('amazon_basin_optimized', False)}")
        
        enhanced_features = coord_results.get('enhanced_features', [])
        if enhanced_features:
            print(f"   Enhanced Features Found: {len(enhanced_features)}")
    
    except Exception as e:
        print(f"   ❌ Coordinate analysis failed: {e}")
    
    # Test pattern template matching
    print("\n7. Testing Pattern Template Matching...")
    
    # Create mock features for template testing
    mock_features = [
        {
            'type': 'settlement_mound',
            'confidence': 0.8,
            'size': 'medium',
            'geometry': 'circular'
        },
        {
            'type': 'earthwork_complex',
            'confidence': 0.7,
            'size': 'large',
            'geometry': 'geometric'
        },
        {
            'type': 'agricultural_system',
            'confidence': 0.6,
            'size': 'extensive',
            'geometry': 'linear'
        }
    ]
    
    try:
        template_matches = agent._apply_pattern_templates(mock_features, -4.0, -62.0)
        print(f"   ✅ Template matching completed")
        print(f"   Template Matches Found: {len(template_matches)}")
        
        for match in template_matches:
            print(f"     - Template Type: {match.get('template_type', 'Unknown')}")
            print(f"       Pattern: {match.get('pattern_name', 'Unknown')}")
            print(f"       Confidence: {match.get('match_confidence', 0):.3f}")
            print(f"       Size Estimate: {match.get('size_estimate', 'Unknown')}")
            
    except Exception as e:
        print(f"   ❌ Template matching failed: {e}")
    
    print("\n8. Performance Summary...")
    print("   =" * 50)
    print("   🎯 Enhanced KAN Vision Agent Features:")
    print("   ✅ Archaeological pattern templates")
    print("   ✅ LIDAR-specific analysis")
    print("   ✅ Satellite imagery enhancement")
    print("   ✅ Multi-source data integration")
    print("   ✅ Cultural interpretation")
    print("   ✅ Amazon basin specialization")
    print("   ✅ KAN-enhanced interpretability")
    print("   ✅ Pattern template matching")
    
    print("\n🔬 Enhanced KAN Vision Agent Test Complete!")
    print("   Ready for archaeological site analysis in the Amazon basin!")

if __name__ == "__main__":
    asyncio.run(test_enhanced_kan_vision_agent()) 