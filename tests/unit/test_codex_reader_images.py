#!/usr/bin/env python3

import requests
import json
import time
from datetime import datetime

def test_codex_discovery():
    """Test codex discovery with real coordinates"""
    print("🔍 Testing Codex Discovery...")
    
    url = "http://localhost:8001/codex/discover"
    payload = {
        "coordinates": {"lat": 19.4326, "lng": -99.1332},
        "radius_km": 50,
        "period": "all",
        "sources": ["famsi", "world_digital_library", "inah"]
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Discovery successful: {data['total_codices_found']} codices found")
            
            # Test image URLs
            for codex in data['codices']:
                print(f"📜 {codex['title']}")
                print(f"   Source: {codex['source']}")
                print(f"   Image URL: {codex['image_url']}")
                print(f"   Relevance: {codex['relevance_score']:.1%}")
                
                # Test if image URL is accessible
                try:
                    img_response = requests.head(codex['image_url'], timeout=5)
                    if img_response.status_code == 200:
                        print(f"   ✅ Image accessible")
                    else:
                        print(f"   ⚠️ Image status: {img_response.status_code}")
                except Exception as e:
                    print(f"   ❌ Image not accessible: {e}")
                print()
            
            return data['codices']
        else:
            print(f"❌ Discovery failed: {response.status_code}")
            print(response.text)
            return []
    except Exception as e:
        print(f"❌ Discovery error: {e}")
        return []

def test_codex_analysis(codex):
    """Test codex analysis with enhanced content"""
    print(f"🧠 Testing Analysis for: {codex['title']}")
    
    url = "http://localhost:8001/codex/analyze"
    payload = {
        "codex_id": codex['id'],
        "image_url": codex['image_url'],
        "coordinates": {"lat": 19.4326, "lng": -99.1332},
        "context": f"Analyze this {codex['content_type']} from {codex['period']} period"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analysis successful with {data['confidence']:.1%} confidence")
            
            analysis = data['analysis']
            
            # Display visual elements
            if 'visual_elements' in analysis:
                print("👁️ Visual Elements:")
                if 'figures' in analysis['visual_elements']:
                    print(f"   Figures: {len(analysis['visual_elements']['figures'])} detected")
                if 'symbols' in analysis['visual_elements']:
                    print(f"   Symbols: {len(analysis['visual_elements']['symbols'])} detected")
                if 'geographical_features' in analysis['visual_elements']:
                    print(f"   Geographic Features: {len(analysis['visual_elements']['geographical_features'])} detected")
            
            # Display textual content
            if 'textual_content' in analysis and 'glyph_translations' in analysis['textual_content']:
                print("📝 Glyph Translations:")
                for translation in analysis['textual_content']['glyph_translations'][:3]:
                    print(f"   {translation['meaning']} ({translation['confidence']:.1%})")
            
            # Display archaeological insights
            if 'archaeological_insights' in analysis:
                insights = analysis['archaeological_insights']
                if 'site_types' in insights:
                    print(f"🏛️ Site Types: {len(insights['site_types'])} identified")
                if 'cultural_affiliations' in insights:
                    print(f"🏺 Cultural Affiliations: {len(insights['cultural_affiliations'])} identified")
            
            # Display recommendations
            if 'recommendations' in analysis:
                print("💡 Recommendations:")
                for key, value in list(analysis['recommendations'].items())[:3]:
                    print(f"   {key.replace('_', ' ').title()}: {value[:100]}...")
            
            return data
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return None

def test_codex_download(codex):
    """Test codex download functionality"""
    print(f"📥 Testing Download for: {codex['title']}")
    
    url = "http://localhost:8001/codex/download"
    payload = {
        "codex_id": codex['id'],
        "download_type": "full",
        "include_metadata": True,
        "include_images": True
    }
    
    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Download successful")
            print(f"   Size: {data.get('size_mb', 'Unknown')} MB")
            print(f"   Images: {data.get('total_images', 'Unknown')} files")
            print(f"   Format: {data.get('format', 'Unknown')}")
            return data
        else:
            print(f"❌ Download failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Download error: {e}")
        return None

def test_frontend_integration():
    """Test if frontend can access the backend"""
    print("🌐 Testing Frontend Integration...")
    
    # Test backend status
    try:
        response = requests.get("http://localhost:8001/codex/sources", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend online with {len(data['sources'])} sources")
            for source in data['sources']:
                print(f"   {source['name']}: {source['total_codices']} codices ({source['status']})")
        else:
            print(f"❌ Backend status check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend connection error: {e}")

def main():
    print("🏺 Codex Reader Image & Content Test")
    print("=" * 50)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test frontend integration
    test_frontend_integration()
    print()
    
    # Test codex discovery
    codices = test_codex_discovery()
    print()
    
    if codices:
        # Test analysis on first codex
        first_codex = codices[0]
        analysis_result = test_codex_analysis(first_codex)
        print()
        
        # Test download
        download_result = test_codex_download(first_codex)
        print()
        
        # Summary
        print("📊 Test Summary:")
        print(f"   Codices discovered: {len(codices)}")
        print(f"   Analysis successful: {'✅' if analysis_result else '❌'}")
        print(f"   Download successful: {'✅' if download_result else '❌'}")
        
        # Image accessibility summary
        accessible_images = 0
        for codex in codices:
            try:
                img_response = requests.head(codex['image_url'], timeout=3)
                if img_response.status_code == 200:
                    accessible_images += 1
            except:
                pass
        
        print(f"   Images accessible: {accessible_images}/{len(codices)}")
        
        if accessible_images == len(codices):
            print("🎉 All images are accessible - frontend should display them correctly!")
        elif accessible_images > 0:
            print("⚠️ Some images may not display - check CORS or URL validity")
        else:
            print("❌ No images accessible - check image URLs and network connectivity")
    
    print()
    print("Test completed!")

if __name__ == "__main__":
    main() 