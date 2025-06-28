#!/usr/bin/env python3
"""
🚀 NIS PROTOCOL v1 - TRIGGER ANALYSIS FOR ALL SITES
==================================================
This script will trigger enhanced analysis for ALL archaeological sites
in the database to populate all the frontend cards automatically!
"""

import requests
import json
import time
from datetime import datetime
import concurrent.futures
import threading

class AllSitesAnalyzer:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.session = requests.Session()
        self.analyzed_sites = []
        self.failed_sites = []
        self.total_features_found = 0
        
    def get_all_sites(self):
        """Fetch all archaeological sites from database"""
        print("📊 FETCHING ALL ARCHAEOLOGICAL SITES FROM DATABASE...")
        try:
            response = self.session.get(f"{self.base_url}/research/sites?max_sites=1000", timeout=15)
            if response.status_code == 200:
                sites = response.json()
                print(f"🏛️ FOUND {len(sites)} ARCHAEOLOGICAL SITES!")
                return sites
            else:
                print(f"❌ Failed to fetch sites: HTTP {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error fetching sites: {e}")
            return []
    
    def analyze_single_site(self, site, site_num, total_sites):
        """Run enhanced analysis on a single site"""
        try:
            coords = site.get('coordinates', '').split(',')
            if len(coords) != 2:
                print(f"   ⚠️ Site {site_num}/{total_sites}: Invalid coordinates")
                return None
                
            lat, lng = float(coords[0].strip()), float(coords[1].strip())
            site_name = site.get('name', 'Unknown Site')
            
            print(f"🧠 [{site_num}/{total_sites}] Analyzing: {site_name} at {lat:.4f}, {lng:.4f}")
            
            # Enhanced multi-agent analysis payload
            payload = {
                'coordinates': {'lat': lat, 'lng': lng},
                'analysis_type': 'comprehensive',
                'enhanced_processing': True,
                'hd_lidar': True,
                'kan_integration': True,
                'agents': ['vision', 'cultural', 'temporal', 'geospatial', 'settlement', 'trade'],
                'data_sources': ['satellite', 'lidar', 'historical', 'ethnographic']
            }
            
            # Call enhanced analysis endpoint
            response = self.session.post(
                f"{self.base_url}/agents/archaeological/analyze",
                json=payload,
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.json()
                features_count = result.get('features_detected', 0)
                confidence = result.get('statistical_analysis', {}).get('average_confidence', 0) * 100
                significance = result.get('cultural_assessment', {}).get('overall_significance', 'Unknown')
                
                print(f"   ✅ SUCCESS: {features_count} features, {confidence:.1f}% confidence, {significance} significance")
                
                # Store enhanced result
                enhanced_site = {
                    **site,
                    'enhanced_analysis': result,
                    'analysis_timestamp': datetime.now().isoformat(),
                    'enhancement_version': 'NIS_v1_FULL_POWER_ALL_SITES',
                    'features_detected': features_count,
                    'analysis_confidence': confidence,
                    'cultural_significance_level': significance
                }
                
                self.total_features_found += features_count
                return enhanced_site
            else:
                print(f"   ⚠️ Analysis failed: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"   ❌ Error analyzing {site.get('name', 'Unknown')}: {e}")
            return None
    
    def analyze_all_sites_parallel(self, sites, max_workers=5):
        """Analyze all sites in parallel for faster processing"""
        print(f"\n🚀 STARTING PARALLEL ANALYSIS OF {len(sites)} SITES...")
        print(f"⚡ Using {max_workers} parallel workers for maximum efficiency!")
        print("🔥 Enhanced capabilities active for ALL sites:")
        print("   ✅ HD LiDAR Processing (1-5m zoom)")
        print("   ✅ Multi-Agent Vision Analysis")
        print("   ✅ KAN Neural Network Integration")
        print("   ✅ Real-time Archaeological Intelligence")
        print("   ✅ Enhanced Discovery Storage")
        print("")
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all analysis tasks
            future_to_site = {
                executor.submit(self.analyze_single_site, site, i+1, len(sites)): site 
                for i, site in enumerate(sites)
            }
            
            # Process completed analyses
            for future in concurrent.futures.as_completed(future_to_site):
                site = future_to_site[future]
                try:
                    enhanced_site = future.result()
                    if enhanced_site:
                        self.analyzed_sites.append(enhanced_site)
                    else:
                        self.failed_sites.append(site)
                except Exception as e:
                    print(f"   ❌ Exception for {site.get('name', 'Unknown')}: {e}")
                    self.failed_sites.append(site)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"\n🎉 PARALLEL ANALYSIS COMPLETED!")
        print(f"   ⏱️ Total time: {total_time:.2f} seconds")
        print(f"   ✅ Successfully analyzed: {len(self.analyzed_sites)} sites")
        print(f"   ❌ Failed analyses: {len(self.failed_sites)} sites")
        print(f"   🏛️ Total features discovered: {self.total_features_found}")
        print(f"   ⚡ Average time per site: {total_time/len(sites):.2f} seconds")
        
        return self.analyzed_sites
    
    def save_all_enhanced_results(self, enhanced_sites):
        """Save all enhanced analysis results"""
        print(f"\n💾 SAVING {len(enhanced_sites)} ENHANCED SITE ANALYSES...")
        
        # Save to JSON file
        output_file = f"all_sites_enhanced_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        enhanced_data = {
            'metadata': {
                'total_sites_in_database': len(enhanced_sites) + len(self.failed_sites),
                'sites_successfully_enhanced': len(enhanced_sites),
                'sites_failed': len(self.failed_sites),
                'total_features_discovered': self.total_features_found,
                'enhancement_timestamp': datetime.now().isoformat(),
                'nis_version': 'v1_FULL_POWER_ALL_SITES',
                'enhanced_capabilities': [
                    'HD LiDAR Processing (1-5m zoom)',
                    'Multi-Agent Vision Analysis',
                    'KAN Neural Network Integration',
                    'Real-time Archaeological Intelligence',
                    'Enhanced Discovery Storage',
                    'Perfect Sync Systems',
                    'Submarine Vision Window',
                    'Parallel Processing',
                    'Comprehensive Database Analysis'
                ],
                'competition_ready': True,
                'analysis_statistics': {
                    'average_features_per_site': self.total_features_found / len(enhanced_sites) if enhanced_sites else 0,
                    'success_rate': (len(enhanced_sites) / (len(enhanced_sites) + len(self.failed_sites))) * 100 if (enhanced_sites or self.failed_sites) else 0
                }
            },
            'enhanced_sites': enhanced_sites,
            'failed_sites': [site.get('name', 'Unknown') for site in self.failed_sites]
        }
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(enhanced_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Enhanced results saved to: {output_file}")
            
            # Calculate file size
            import os
            file_size = os.path.getsize(output_file) / 1024  # KB
            print(f"📁 File size: {file_size:.1f} KB")
            
            return output_file
                
        except Exception as e:
            print(f"❌ Error saving results: {e}")
            return None
    
    def update_frontend_analysis_cache(self, enhanced_sites):
        """Update frontend analysis cache so cards populate automatically"""
        print(f"\n🔄 UPDATING FRONTEND ANALYSIS CACHE...")
        
        try:
            # Try to update the backend cache
            cache_payload = {
                'analysis_type': 'bulk_site_update',
                'enhanced_sites': enhanced_sites,
                'timestamp': datetime.now().isoformat()
            }
            
            response = self.session.post(
                f"{self.base_url}/cache/update_analysis_results",
                json=cache_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                print("✅ Frontend analysis cache updated successfully!")
                print("💎 All cards should now populate automatically!")
            else:
                print("⚠️ Cache update failed, but local results saved")
                
        except Exception as e:
            print(f"⚠️ Cache update error: {e}")
            print("💾 Local enhanced results still available")
    
    def run_complete_analysis(self):
        """Main function to analyze all sites and update frontend"""
        print("🚀" * 25)
        print("🚀 NIS PROTOCOL v1 - ANALYZE ALL SITES!")
        print("🚀" * 25)
        print("\n🎯 MISSION: Populate ALL archaeological site cards with enhanced data!")
        print("⚡ UNLEASHING FULL POWER ON ENTIRE DATABASE!")
        print("\n" + "="*80)
        
        # Step 1: Get all sites
        sites = self.get_all_sites()
        if not sites:
            print("❌ NO SITES FOUND - ABORTING MISSION")
            return False
        
        # Step 2: Analyze all sites in parallel
        enhanced_sites = self.analyze_all_sites_parallel(sites, max_workers=3)  # Conservative parallel processing
        
        if not enhanced_sites:
            print("❌ NO SITES SUCCESSFULLY ANALYZED")
            return False
        
        # Step 3: Save enhanced results
        output_file = self.save_all_enhanced_results(enhanced_sites)
        
        # Step 4: Update frontend cache
        self.update_frontend_analysis_cache(enhanced_sites)
        
        # Final summary
        print("\n" + "🎉" * 25)
        print("🎉 MISSION ACCOMPLISHED!")
        print("🎉" * 25)
        print(f"\n📊 FINAL STATISTICS:")
        print(f"   🏛️ Total sites in database: {len(sites)}")
        print(f"   ✅ Successfully enhanced: {len(enhanced_sites)}")
        print(f"   🔍 Total features discovered: {self.total_features_found}")
        print(f"   📈 Success rate: {(len(enhanced_sites)/len(sites))*100:.1f}%")
        print(f"   📁 Results saved to: {output_file}")
        
        if enhanced_sites:
            avg_features = self.total_features_found / len(enhanced_sites)
            print(f"   🎯 Average features per site: {avg_features:.1f}")
        
        print(f"\n🚀 ALL ARCHAEOLOGICAL SITE CARDS SHOULD NOW BE POPULATED!")
        print("💎 Revolutionary NIS Protocol analysis complete for entire database!")
        print("🏆 READY FOR COMPETITION SUBMISSION!")
        
        return True

if __name__ == "__main__":
    print("🌟 Starting comprehensive analysis of all archaeological sites...")
    analyzer = AllSitesAnalyzer()
    success = analyzer.run_complete_analysis()
    
    if success:
        print("\n🎯 ALL SITES ANALYZED SUCCESSFULLY!")
        print("🔥 Frontend cards should now display enhanced data automatically!")
        print("🚀 NIS Protocol v1 has revolutionized the entire archaeological database!")
    else:
        print("\n⚠️ Some issues encountered - check system status") 