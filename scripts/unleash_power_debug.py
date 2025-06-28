import requests
import json
from datetime import datetime
import traceback

def unleash_nis_power():
    print("NIS PROTOCOL v1 - FULL POWER UNLEASH!")
    print("=" * 50)
    
    # Test backend health first
    try:
        health_response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"Backend health check: {health_response.status_code}")
        if health_response.status_code != 200:
            print("Backend is not healthy!")
            return False
    except Exception as e:
        print(f"Backend connection failed: {e}")
        return False
    
    # Get all sites
    try:
        print("Fetching archaeological sites...")
        sites_response = requests.get('http://localhost:8000/research/sites?max_sites=100', timeout=10)
        print(f"Sites response status: {sites_response.status_code}")
        
        if sites_response.status_code != 200:
            print(f"Sites request failed with status {sites_response.status_code}")
            print(f"Response: {sites_response.text}")
            return False
            
        sites_data = sites_response.json()
        sites = sites_data.get('sites', [])
        
        print(f"FOUND {len(sites)} ARCHAEOLOGICAL SITES!")
        
        if len(sites) == 0:
            print("No sites found in database!")
            return False
            
        print("SAMPLE SITES:")
        for i, site in enumerate(sites[:5]):
            name = site.get('name', 'Unknown')
            confidence = site.get('confidence', 0) * 100
            coords = site.get('coordinates', 'Unknown')
            print(f"   {i+1}. {name} - {confidence:.1f}% - {coords}")
        
        print(f"\nPROCESSING {min(5, len(sites))} SITES WITH ENHANCED CAPABILITIES...")
        print("Enhanced capabilities:")
        print("   - HD LiDAR Processing (1-5m zoom)")
        print("   - Multi-Agent Vision Analysis")
        print("   - KAN Neural Network Integration")
        print("   - Real-time Archaeological Intelligence")
        
        # Enhanced analysis for sample sites
        enhanced_count = 0
        analysis_results = []
        
        for i, site in enumerate(sites[:5]):  # Process first 5 sites only
            try:
                coords = site.get('coordinates', '').split(',')
                if len(coords) != 2:
                    print(f"   Site {i+1}: Invalid coordinates format")
                    continue
                    
                lat, lng = float(coords[0].strip()), float(coords[1].strip())
                
                payload = {
                    'coordinates': {'lat': lat, 'lng': lng},
                    'analysis_type': 'comprehensive'
                }
                
                print(f"Analyzing site {i+1}: {site.get('name', 'Unknown')} at {lat:.4f}, {lng:.4f}...")
                
                response = requests.post(
                    'http://localhost:8000/agents/archaeological/analyze',
                    json=payload,
                    timeout=30
                )
                
                print(f"   Analysis response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    enhanced_count += 1
                    
                    # Store enhanced result
                    enhanced_site = {
                        **site,
                        'enhanced_analysis': result,
                        'analysis_timestamp': datetime.now().isoformat(),
                        'enhancement_version': 'NIS_v1_FULL_POWER'
                    }
                    analysis_results.append(enhanced_site)
                    
                    print(f"   SUCCESS: Enhanced analysis complete!")
                    
                    # Show some key results
                    if 'detected_features' in result:
                        features = result['detected_features']
                        print(f"   Found {len(features)} archaeological features")
                    
                    if 'statistics' in result:
                        stats = result['statistics']
                        avg_conf = stats.get('average_confidence', 0) * 100
                        print(f"   Average confidence: {avg_conf:.1f}%")
                        
                else:
                    print(f"   WARNING: Analysis returned status {response.status_code}")
                    print(f"   Response: {response.text[:200]}")
                    
            except Exception as e:
                print(f"   ERROR analyzing site {i+1}: {e}")
                traceback.print_exc()
                continue
        
        # Save enhanced results
        if analysis_results:
            output_file = f"enhanced_sites_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            enhanced_data = {
                'metadata': {
                    'total_sites_in_database': len(sites),
                    'sites_enhanced': len(analysis_results),
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
                'enhanced_sites': analysis_results
            }
            
            with open(output_file, 'w') as f:
                json.dump(enhanced_data, f, indent=2)
            
            print(f"\nEnhanced results saved to: {output_file}")
        
        print(f"\nMISSION RESULTS:")
        print(f"   Total sites in database: {len(sites)}")
        print(f"   Successfully enhanced: {enhanced_count}")
        if len(sites) > 0:
            success_rate = (enhanced_count / min(5, len(sites))) * 100
            print(f"   Success rate: {success_rate:.1f}%")
        print(f"\nNIS PROTOCOL v1 POWER DEMONSTRATION COMPLETE!")
        print("System ready for competition submission!")
        
        return enhanced_count > 0
        
    except Exception as e:
        print(f"ERROR: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = unleash_nis_power()
    if success:
        print("\nREADY FOR COMPETITION SUBMISSION!")
        print("Enhanced archaeological database created successfully!")
    else:
        print("\nMission encountered issues - check system status") 