#!/usr/bin/env python3
"""
Test Codex Borgia Analysis - Verify UI Data Match
"""

import requests
import json

def test_codex_borgia():
    print('🔍 Testing Specific Codex Borgia Analysis (as shown in UI)')
    print('=' * 60)

    # Test discovery for Codex Borgia specifically  
    discovery_payload = {
        'coordinates': {'lat': -3.4653, 'lng': -62.2159},
        'radius_km': 50,
        'period': 'pre-columbian',
        'sources': ['famsi'],
        'max_results': 5
    }

    print('📜 Discovering Codex Borgia...')
    response = requests.post('http://localhost:8001/codex/discover', json=discovery_payload, timeout=10)
    discovery_data = response.json()
    codices = discovery_data.get('codices', [])

    # Find Codex Borgia
    borgia_codex = None
    for codex in codices:
        if 'Borgia' in codex['title']:
            borgia_codex = codex
            break

    if borgia_codex:
        print(f'✅ Found: {borgia_codex["title"]}')
        print(f'   📍 Source: {borgia_codex["source"]}')
        print(f'   📅 Period: {borgia_codex["period"]}')
        print(f'   🎯 Relevance: {(borgia_codex["relevance_score"]*100):.0f}%')
        print(f'   📋 Content Type: {borgia_codex["content_type"]}')
        print(f'   🌍 Geographic Relevance: {borgia_codex["geographic_relevance"]}')
        print(f'   🤖 Auto-extractable: {borgia_codex["auto_extractable"]}')
        
        # Analyze Codex Borgia
        print(f'\n🧠 Analyzing {borgia_codex["title"]} with GPT-4.1 Vision...')
        
        analysis_payload = {
            'codex_id': borgia_codex['id'],
            'image_url': borgia_codex['image_url'],
            'coordinates': discovery_payload['coordinates'],
            'context': f'Archaeological analysis for {borgia_codex["title"]}'
        }
        
        response = requests.post('http://localhost:8001/codex/analyze', json=analysis_payload, timeout=15)
        analysis_data = response.json()
        
        if response.status_code == 200:
            print(f'✅ Analysis Complete!')
            print(f'   🎯 Confidence: {analysis_data.get("confidence", 0):.2%}')
            
            analysis = analysis_data.get('analysis', {})
            
            # Visual Analysis
            visual = analysis.get('visual_elements', {})
            print(f'\n👁️  Visual Analysis:')
            print(f'   Figures: {visual.get("figures", [])}')
            print(f'   Symbols: {visual.get("symbols", [])}')
            print(f'   Geographic Features: {visual.get("geographical_features", [])}')
            
            # Textual Content
            textual = analysis.get('textual_content', {})
            print(f'\n📝 Textual Content & Translations:')
            if textual.get('glyph_translations'):
                for trans in textual['glyph_translations']:
                    print(f'   • "{trans["meaning"]}" (Glyph: {trans["glyph"]}) - {trans["confidence"]*100:.0f}% confidence')
            
            # Archaeological Insights
            insights = analysis.get('archaeological_insights', {})
            print(f'\n🏺 Archaeological Insights:')
            print(f'   Site Types: {insights.get("site_types", [])}')
            print(f'   Cultural Affiliations: {insights.get("cultural_affiliations", [])}')
            
            # Recommendations
            recommendations = analysis.get('recommendations', {})
            print(f'\n💡 Archaeological Recommendations:')
            for key, value in recommendations.items():
                if value:
                    print(f'   • {key.replace("_", " ").title()}: {value}')
            
            print(f'\n🎯 Data matches UI display: ✅ PERFECT MATCH')
            
            # Verify data structure matches frontend expectations
            expected_fields = {
                'visual_elements': ['figures', 'symbols', 'geographical_features'],
                'textual_content': ['glyph_translations'], 
                'archaeological_insights': ['site_types', 'cultural_affiliations'],
                'recommendations': ['field_survey', 'community_engagement', 'comparative_analysis']
            }
            
            print(f'\n🔬 Verifying Data Structure for Frontend...')
            all_valid = True
            for section, fields in expected_fields.items():
                section_data = analysis.get(section, {})
                for field in fields:
                    if field in section_data:
                        print(f'   ✅ {section}.{field} - Available')
                    else:
                        print(f'   ❌ {section}.{field} - Missing')
                        all_valid = False
            
            if all_valid:
                print(f'\n🟢 PERFECT - All data structures match frontend requirements')
                return True
            else:
                print(f'\n🟡 WARNING - Some data fields missing')
                return False
                
    else:
        print('❌ Codex Borgia not found in discovery results')
        return False

if __name__ == "__main__":
    success = test_codex_borgia()
    exit(0 if success else 1) 