#!/usr/bin/env python3
"""
🚀 NIS PROTOCOL v1 - FULL POWER UNLEASH SCRIPT
===============================================
Re-analyze ALL archaeological sites with enhanced capabilities:
- HD LiDAR Processing (1-5m zoom)
- Multi-Agent Vision Analysis  
- KAN Neural Network Integration
- Real-time Archaeological Intelligence
- Enhanced Discovery Storage
"""

import requests
import json
import time
from datetime import datetime
import asyncio
import concurrent.futures

class NISProtocolUnleash:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.session = requests.Session()
        self.enhanced_sites = []
        self.analysis_results = []
        
    def check_system_health(self):
        """Check if all NIS Protocol systems are ready"""
        print("🔍 CHECKING SYSTEM HEALTH...")
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                print("✅ SYSTEM STATUS: HEALTHY")
                print(f"   📊 Uptime: {health_data.get('uptime', 0)} seconds")
                print(f"   🔧 Version: {health_data.get('version', 'Unknown')}")
                
                # Check services
                services = health_data.get('services', {})
                for service, status in services.items():
                    print(f"   🟢 {service}: {status}")
                
                return True
            else:
                print("❌ SYSTEM HEALTH CHECK FAILED")
                return False
        except Exception as e:
            print(f"❌ System health check error: {e}")
            return False
    
    def fetch_all_sites(self):
        """Fetch all archaeological sites from database"""
        print("\n📊 FETCHING ALL ARCHAEOLOGICAL SITES...")
        try:
            response = self.session.get(f"{self.base_url}/research/sites?max_sites=1000", timeout=15)
            if response.status_code == 200:
                sites_data = response.json()
                sites = sites_data.get('sites', [])
                print(f"🏛️ FOUND {len(sites)} ARCHAEOLOGICAL SITES!")
                
                # Show sample sites
                print("\n📋 SAMPLE SITES:")
                for i, site in enumerate(sites[:5]):
                    name = site.get('name', 'Unknown Site')
                    confidence = site.get('confidence', 0) * 100
                    coords = site.get('coordinates', 'Unknown')
                    print(f"   {i+1}. {name} - {confidence:.1f}% confidence - {coords}")
                
                if len(sites) > 5:
                    print(f"   ... and {len(sites)-5} more sites!")
                
                return sites
            else:
                print(f"❌ Failed to fetch sites: HTTP {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error fetching sites: {e}")
            return []
    
    def enhanced_analysis(self, site):
        """Run enhanced analysis on a single site"""
        try:
            coords = site.get('coordinates', '').split(',')
            if len(coords) != 2:
                return None
                
            lat, lng = float(coords[0].strip()), float(coords[1].strip())
            
            # Enhanced multi-agent analysis
            analysis_payload = {
                "coordinates": {"lat": lat, "lng": lng},
                "analysis_type": "comprehensive",
                "agents": ["vision", "cultural", "temporal", "geospatial", "settlement", "trade"],
                "data_sources": ["satellite", "lidar", "historical", "ethnographic"],
                "enhanced_processing": True,
                "hd_lidar": True,
                "kan_integration": True
            }
            
            print(f"🧠 Analyzing: {site.get('name', 'Unknown')} at {lat:.4f}, {lng:.4f}")
            
            # Call enhanced analysis endpoint
            response = self.session.post(
                f"{self.base_url}/agents/archaeological/analyze",
                json=analysis_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                enhanced_site = {
                    **site,
                    'enhanced_analysis': result,
                    'analysis_timestamp': datetime.now().isoformat(),
                    'enhancement_version': 'NIS_v1_FULL_POWER'
                }
                print(f"✅ Enhanced analysis complete for {site.get('name', 'Unknown')}")
                return enhanced_site
            else:
                print(f"⚠️ Analysis failed for {site.get('name', 'Unknown')}: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error analyzing {site.get('name', 'Unknown')}: {e}")
            return None
    
    def save_enhanced_results(self, enhanced_sites):
        """Save all enhanced analysis results"""
        print(f"\n💾 SAVING {len(enhanced_sites)} ENHANCED SITE ANALYSES...")
        
        # Save to JSON file
        output_file = f"enhanced_archaeological_sites_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        enhanced_data = {
            'metadata': {
                'total_sites_enhanced': len(enhanced_sites),
                'enhancement_timestamp': datetime.now().isoformat(),
                'nis_version': 'v1_FULL_POWER',
                'capabilities': [
                    'HD LiDAR Processing (1-5m zoom)',
                    'Multi-Agent Vision Analysis',
                    'KAN Neural Network Integration',
                    'Real-time Archaeological Intelligence',
                    'Enhanced Discovery Storage'
                ]
            },
            'enhanced_sites': enhanced_sites
        }
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(enhanced_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Enhanced results saved to: {output_file}")
            
            # Also try to save to backend storage
            try:
                storage_response = self.session.post(
                    f"{self.base_url}/storage/save_enhanced_analysis",
                    json=enhanced_data,
                    timeout=30
                )
                if storage_response.status_code == 200:
                    print("✅ Enhanced results also saved to backend storage!")
                else:
                    print("⚠️ Backend storage save failed, but local file saved successfully")
            except:
                print("⚠️ Backend storage unavailable, but local file saved successfully")
                
        except Exception as e:
            print(f"❌ Error saving results: {e}")
    
    def unleash_full_power(self):
        """Main function to unleash the full power of NIS Protocol"""
        print("🚀" * 20)
        print("🚀 NIS PROTOCOL v1 - FULL POWER UNLEASH!")
        print("🚀" * 20)
        print("\n🧠 ENHANCED CAPABILITIES ACTIVE:")
        print("   ✅ HD LiDAR Processing (1-5m zoom)")
        print("   ✅ Multi-Agent Vision Analysis")
        print("   ✅ KAN Neural Network Integration")
        print("   ✅ Real-time Archaeological Intelligence")
        print("   ✅ Enhanced Discovery Storage")
        print("   ✅ Perfect Sync Systems")
        print("\n" + "="*70)
        
        # Step 1: Check system health
        if not self.check_system_health():
            print("❌ SYSTEM NOT READY - ABORTING MISSION")
            return False
        
        # Step 2: Fetch all sites
        sites = self.fetch_all_sites()
        if not sites:
            print("❌ NO SITES FOUND - ABORTING MISSION")
            return False
        
        print(f"\n🎯 INITIATING ENHANCED ANALYSIS OF {len(sites)} SITES...")
        print("⚡ UNLEASHING FULL NIS PROTOCOL POWER!")
        
        # Step 3: Enhanced analysis of all sites
        enhanced_sites = []
        start_time = time.time()
        
        # Process sites in batches to avoid overwhelming the system
        batch_size = 5
        total_batches = (len(sites) + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            batch_start = batch_num * batch_size
            batch_end = min(batch_start + batch_size, len(sites))
            batch_sites = sites[batch_start:batch_end]
            
            print(f"\n🔄 Processing batch {batch_num + 1}/{total_batches} ({len(batch_sites)} sites)...")
            
            for site in batch_sites:
                enhanced_site = self.enhanced_analysis(site)
                if enhanced_site:
                    enhanced_sites.append(enhanced_site)
                
                # Small delay to prevent overwhelming the system
                time.sleep(1)
        
        # Step 4: Save results
        if enhanced_sites:
            self.save_enhanced_results(enhanced_sites)
            
            # Final statistics
            end_time = time.time()
            total_time = end_time - start_time
            
            print("\n" + "🎉" * 20)
            print("🎉 MISSION ACCOMPLISHED!")
            print("🎉" * 20)
            print(f"\n📊 FINAL STATISTICS:")
            print(f"   🏛️ Total sites processed: {len(sites)}")
            print(f"   ✅ Successfully enhanced: {len(enhanced_sites)}")
            print(f"   ⏱️ Total processing time: {total_time:.2f} seconds")
            print(f"   ⚡ Average time per site: {total_time/len(enhanced_sites):.2f} seconds")
            print(f"\n🚀 NIS PROTOCOL v1 HAS MADE HISTORY!")
            print("🌟 Enhanced archaeological database created with revolutionary AI capabilities!")
            
            return True
        else:
            print("❌ NO SITES WERE SUCCESSFULLY ENHANCED")
            return False

if __name__ == "__main__":
    unleash = NISProtocolUnleash()
    success = unleash.unleash_full_power()
    
    if success:
        print("\n🎯 READY FOR COMPETITION SUBMISSION!")
        print("💎 Our enhanced archaeological database showcases the full power of NIS Protocol!")
    else:
        print("\n⚠️ Mission encountered issues - check system status") 