#!/usr/bin/env python3
"""
Comprehensive NIS Protocol Codex Data Retrieval & Analysis Pipeline Test
Tests the complete end-to-end workflow for codex discovery and analysis
"""

import requests
import json
import time

def test_nis_protocol_pipeline():
    """Test the complete NIS Protocol pipeline"""
    print('🔍 Testing NIS Protocol Codex Data Retrieval & Analysis Pipeline')
    print('=' * 70)
    
    # Test 1: Check codex sources
    print('\n📚 Step 1: Testing Codex Sources Retrieval...')
    try:
        response = requests.get('http://localhost:8001/codex/sources', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Found {len(data["sources"])} digital archives:')
            for source in data['sources']:
                print(f'   • {source["name"]} - {source["total_codices"]} codices ({source["status"]})')
        else:
            print(f'❌ Failed: {response.status_code}')
            return False
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

    # Test 2: Test codex discovery
    print('\n🔍 Step 2: Testing Codex Discovery Pipeline...')
    discovery_payload = {
        'coordinates': {'lat': -3.4653, 'lng': -62.2159},
        'radius_km': 50,
        'period': 'all',
        'sources': ['famsi', 'world_digital_library', 'inah'],
        'max_results': 10
    }

    try:
        response = requests.post('http://localhost:8001/codex/discover', json=discovery_payload, timeout=10)
        if response.status_code == 200:
            discovery_data = response.json()
            print(f'✅ Discovery successful:')
            print(f'   📜 Total codices found: {discovery_data.get("total_codices_found", 0)}')
            print(f'   🤖 Auto-analyzed: {discovery_data.get("auto_analyzed", 0)}')
            print(f'   ⏱️  Processing time: {discovery_data.get("search_metadata", {}).get("processing_time", "unknown")}')
            
            codices = discovery_data.get('codices', [])
            if codices:
                print(f'\n   📋 Retrieved Codices:')
                for i, codex in enumerate(codices[:3]):  # Show first 3
                    print(f'   {i+1}. {codex["title"]} ({codex["source"]}) - {(codex["relevance_score"]*100):.0f}% relevance')
            
            # Test 3: Test codex analysis on best match
            if codices:
                print('\n🧠 Step 3: Testing GPT-4.1 Vision Analysis Pipeline...')
                best_codex = codices[0]
                
                analysis_payload = {
                    'codex_id': best_codex['id'],
                    'image_url': best_codex['image_url'],
                    'coordinates': discovery_payload['coordinates'],
                    'context': f'Archaeological analysis for {best_codex["title"]}'
                }
                
                try:
                    response = requests.post('http://localhost:8001/codex/analyze', json=analysis_payload, timeout=15)
                    if response.status_code == 200:
                        analysis_data = response.json()
                        print(f'✅ Analysis successful:')
                        print(f'   🎯 Confidence: {analysis_data.get("confidence", 0):.1%}')
                        print(f'   ⏱️  Processing time: {analysis_data.get("processing_time", 0):.2f}s')
                        
                        analysis = analysis_data.get('analysis', {})
                        
                        # Check visual analysis
                        visual = analysis.get('visual_elements', {})
                        if visual:
                            print(f'   👁️  Visual elements detected:')
                            if visual.get('figures'):
                                print(f'      • Figures: {len(visual["figures"])} types')
                            if visual.get('symbols'):
                                print(f'      • Symbols: {len(visual["symbols"])} types')
                            if visual.get('geographical_features'):
                                print(f'      • Geographic features: {len(visual["geographical_features"])} types')
                        
                        # Check textual analysis
                        textual = analysis.get('textual_content', {})
                        if textual and textual.get('glyph_translations'):
                            print(f'   📝 Glyph translations: {len(textual["glyph_translations"])} found')
                            for trans in textual['glyph_translations'][:2]:  # Show first 2
                                print(f'      • "{trans["meaning"]}" ({trans["confidence"]*100:.0f}% confidence)')
                        
                        # Check archaeological insights
                        insights = analysis.get('archaeological_insights', {})
                        if insights:
                            print(f'   🏺 Archaeological insights:')
                            if insights.get('site_types'):
                                print(f'      • Site types: {len(insights["site_types"])} identified')
                            if insights.get('cultural_affiliations'):
                                print(f'      • Cultural affiliations: {len(insights["cultural_affiliations"])} identified')
                        
                        # Check recommendations
                        recommendations = analysis.get('recommendations', {})
                        if recommendations:
                            rec_count = len([k for k in recommendations.keys() if recommendations[k]])
                            print(f'   💡 Recommendations: {rec_count} actionable insights')
                        
                        print(f'\n✅ Complete NIS Protocol pipeline working perfectly!')
                        
                        # Test data integrity
                        print('\n🔬 Step 4: Testing Data Integrity...')
                        integrity_score = 0
                        
                        # Check data completeness
                        if visual and any(visual.values()):
                            integrity_score += 25
                            print('   ✅ Visual analysis data complete')
                        
                        if textual and textual.get('glyph_translations'):
                            integrity_score += 25
                            print('   ✅ Textual analysis data complete')
                        
                        if insights and any(insights.values()):
                            integrity_score += 25
                            print('   ✅ Archaeological insights complete')
                        
                        if recommendations and any(recommendations.values()):
                            integrity_score += 25
                            print('   ✅ Recommendations complete')
                        
                        print(f'\n📊 Data Integrity Score: {integrity_score}/100')
                        
                        if integrity_score >= 75:
                            print('🟢 EXCELLENT - All data components working perfectly')
                            return True
                        elif integrity_score >= 50:
                            print('🟡 GOOD - Most data components working')
                            return True
                        else:
                            print('🔴 POOR - Some data components missing')
                            return False
                        
                    else:
                        print(f'❌ Analysis failed: {response.status_code}')
                        return False
                except Exception as e:
                    print(f'❌ Analysis error: {e}')
                    return False
            else:
                print('❌ No codices found for analysis')
                return False
        else:
            print(f'❌ Discovery failed: {response.status_code}')
            return False
    except Exception as e:
        print(f'❌ Discovery error: {e}')
        return False

    print('\n' + '=' * 70)
    print('🎯 NIS Protocol Pipeline Test Complete')

if __name__ == "__main__":
    success = test_nis_protocol_pipeline()
    exit(0 if success else 1) 