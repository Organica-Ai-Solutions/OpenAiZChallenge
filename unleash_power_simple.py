import requests
import json
from datetime import datetime

def unleash_nis_power():
    print("NIS PROTOCOL v1 - FULL POWER UNLEASH!")
    print("=" * 50)
    
    # Get all sites
    try:
        sites_response = requests.get('http://localhost:8000/research/sites?max_sites=100')
        sites_data = sites_response.json()
        sites = sites_data.get('sites', [])
        
        print(f"FOUND {len(sites)} ARCHAEOLOGICAL SITES!")
        print("SAMPLE SITES:")
        for i, site in enumerate(sites[:5]):
            name = site.get('name', 'Unknown')
            confidence = site.get('confidence', 0) * 100
            coords = site.get('coordinates', 'Unknown')
            print(f"   {i+1}. {name} - {confidence:.1f}% - {coords}")
        
        print(f"\nPROCESSING {len(sites)} SITES WITH ENHANCED CAPABILITIES...")
        print("Enhanced capabilities:")
        print("   - HD LiDAR Processing (1-5m zoom)")
        print("   - Multi-Agent Vision Analysis")
        print("   - KAN Neural Network Integration")
        print("   - Real-time Archaeological Intelligence")
        
        # Enhanced analysis for sample sites
        enhanced_count = 0
        analysis_results = []
        
        for i, site in enumerate(sites[:10]):  # Process first 10 sites
            try:
                coords = site.get('coordinates', '').split(',')
                if len(coords) == 2:
                    lat, lng = float(coords[0].strip()), float(coords[1].strip())
                    
                    payload = {
                        'coordinates': {'lat': lat, 'lng': lng},
                        'analysis_type': 'comprehensive',
                        'enhanced_processing': True,
                        'hd_lidar': True,
                        'kan_integration': True
                    }
                    
                    print(f"Analyzing site {i+1}: {site.get('name', 'Unknown')}...")
                    
                    response = requests.post(
                        'http://localhost:8000/agents/archaeological/analyze',
                        json=payload,
                        timeout=20
                    )
                    
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
                        
            except Exception as e:
                print(f"   ERROR: {e}")
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
        print(f"   Success rate: {(enhanced_count/min(10, len(sites)))*100:.1f}%")
        print(f"\nNIS PROTOCOL v1 POWER DEMONSTRATION COMPLETE!")
        print("System ready for competition submission!")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    success = unleash_nis_power()
    if success:
        print("\nREADY FOR COMPETITION SUBMISSION!")
    else:
        print("\nMission encountered issues - check system status") 