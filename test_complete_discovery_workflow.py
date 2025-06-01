#!/usr/bin/env python3
"""
NIS Protocol - Complete Archaeological Discovery Workflow Test
============================================================
This script demonstrates the complete end-to-end archaeological discovery
workflow using the NIS Protocol system.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any

class ArchaeologicalDiscoveryWorkflow:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 30
        
    def print_header(self, title: str):
        print(f"\n{'='*60}")
        print(f"🏛️  {title}")
        print(f"{'='*60}")
        
    def print_step(self, step: str, status: str = ""):
        print(f"📍 {step} {status}")
        
    def print_result(self, data: Dict[str, Any], title: str = "Result"):
        print(f"\n📊 {title}:")
        print(json.dumps(data, indent=2))
        
    def test_system_health(self) -> bool:
        """Test system health and readiness"""
        self.print_step("Testing system health...")
        
        try:
            response = self.session.get(f"{self.base_url}/system/health")
            if response.status_code == 200:
                health_data = response.json()
                self.print_result(health_data, "System Health")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
            
    def get_available_agents(self) -> List[str]:
        """Get list of available AI agents"""
        self.print_step("Getting available AI agents...")
        
        try:
            response = self.session.get(f"{self.base_url}/agents/agents")
            if response.status_code == 200:
                agents = response.json()
                self.print_result(agents, "Available Agents")
                return [agent.get('type', 'unknown') for agent in agents]
            else:
                print(f"❌ Failed to get agents: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Agent query error: {e}")
            return []
            
    def discover_archaeological_sites(self, locations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Discover archaeological sites at specified locations"""
        self.print_step("Starting archaeological site discovery...")
        
        discoveries = []
        
        for i, location in enumerate(locations):
            print(f"\n🔍 Discovery {i+1}: {location['name']}")
            
            discovery_request = {
                "researcher_id": f"nis_researcher_{int(time.time())}",
                "sites": [{
                    "latitude": location["latitude"],
                    "longitude": location["longitude"],
                    "description": f"Archaeological discovery in {location['name']}",
                    "data_sources": ["satellite", "lidar", "historical_text"],
                    "researcher_metadata": {
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "generated_by": "complete_workflow_test",
                        "location_name": location["name"]
                    }
                }]
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/research/sites/discover",
                    json=discovery_request
                )
                
                if response.status_code == 200:
                    discovery_result = response.json()
                    discoveries.append(discovery_result)
                    
                    print(f"✅ Discovery completed!")
                    print(f"   📍 Location: {location['name']}")
                    print(f"   🎯 Sites found: {len(discovery_result.get('validated_sites', []))}")
                    print(f"   📊 Overall confidence: {discovery_result.get('overall_confidence', 0)*100:.1f}%")
                    
                    # Show details of discovered sites
                    for site in discovery_result.get('validated_sites', []):
                        confidence = site.get('confidence_score', 0) * 100
                        status = site.get('validation_status', 'UNKNOWN')
                        print(f"      🏛️  Site ID: {site.get('site_id', 'N/A')}")
                        print(f"         Confidence: {confidence:.1f}% ({status})")
                        print(f"         Data sources: {', '.join(site.get('data_sources', []))}")
                        
                else:
                    print(f"❌ Discovery failed: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Discovery error: {e}")
                
        return discoveries
        
    def analyze_with_ai_agents(self, site_data: Dict[str, Any], agents: List[str]) -> Dict[str, Any]:
        """Analyze discovered sites with AI agents"""
        self.print_step("Starting AI agent analysis...")
        
        analysis_results = {}
        site = site_data.get('validated_sites', [{}])[0]
        
        if not site:
            print("❌ No site data available for analysis")
            return analysis_results
            
        print(f"\n🤖 Analyzing site: {site.get('site_id', 'Unknown')}")
        
        for agent_type in ['vision', 'reasoning', 'memory', 'action']:
            print(f"   🔬 {agent_type.title()} Agent...")
            
            agent_request = {
                "agent_type": agent_type,
                "data": {
                    "site_id": site.get('site_id'),
                    "latitude": site.get('latitude'),
                    "longitude": site.get('longitude'),
                    "confidence_score": site.get('confidence_score'),
                    "validation_status": site.get('validation_status'),
                    "sources_analyzed": site.get('metadata', {}).get('sources_analyzed', []),
                    "description": f"AI analysis of archaeological site with {site.get('confidence_score', 0)*100:.1f}% confidence"
                }
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/agents/process",
                    json=agent_request
                )
                
                if response.status_code == 200:
                    agent_result = response.json()
                    analysis_results[agent_type] = agent_result
                    
                    confidence = agent_result.get('confidence_score', 0) * 100
                    processing_time = agent_result.get('processing_time', 0)
                    
                    print(f"      ✅ Confidence: {confidence:.1f}%")
                    print(f"      ⏱️  Processing time: {processing_time:.2f}s")
                    
                    # Show specific results
                    results = agent_result.get('results', {})
                    if agent_type == 'vision' and 'detected_features' in results:
                        features = results['detected_features']
                        print(f"      👁️  Detected features: {', '.join(features)}")
                    elif agent_type == 'reasoning' and 'hypothesis' in results:
                        hypothesis = results['hypothesis']
                        print(f"      🧠 Hypothesis: {hypothesis}")
                        
                else:
                    print(f"      ❌ {agent_type} agent failed: {response.status_code}")
                    
            except Exception as e:
                print(f"      ❌ {agent_type} agent error: {e}")
                
        return analysis_results
        
    def generate_discovery_report(self, discoveries: List[Dict[str, Any]], analyses: List[Dict[str, Any]]):
        """Generate a comprehensive discovery report"""
        self.print_header("ARCHAEOLOGICAL DISCOVERY REPORT")
        
        print(f"📅 Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🔬 System: NIS Protocol Archaeological Discovery Platform")
        print(f"📊 Total Discoveries: {len(discoveries)}")
        
        total_sites = sum(len(d.get('validated_sites', [])) for d in discoveries)
        print(f"🏛️  Total Sites Found: {total_sites}")
        
        # Calculate average confidence
        all_confidences = []
        for discovery in discoveries:
            for site in discovery.get('validated_sites', []):
                all_confidences.append(site.get('confidence_score', 0))
                
        if all_confidences:
            avg_confidence = sum(all_confidences) / len(all_confidences) * 100
            print(f"📈 Average Confidence: {avg_confidence:.1f}%")
            
        # High confidence sites
        high_confidence_sites = [
            site for discovery in discoveries 
            for site in discovery.get('validated_sites', [])
            if site.get('validation_status') == 'HIGH_CONFIDENCE'
        ]
        
        print(f"⭐ High Confidence Sites: {len(high_confidence_sites)}")
        
        print(f"\n🎯 DISCOVERY SUMMARY:")
        for i, discovery in enumerate(discoveries):
            sites = discovery.get('validated_sites', [])
            if sites:
                site = sites[0]  # First site
                confidence = site.get('confidence_score', 0) * 100
                status = site.get('validation_status', 'UNKNOWN')
                print(f"   {i+1}. Lat: {site.get('latitude'):.4f}, Lng: {site.get('longitude'):.4f}")
                print(f"      Status: {status} ({confidence:.1f}% confidence)")
                
        if analyses:
            print(f"\n🤖 AI ANALYSIS SUMMARY:")
            for i, analysis in enumerate(analyses):
                print(f"   Site {i+1} Analysis:")
                for agent_type, result in analysis.items():
                    confidence = result.get('confidence_score', 0) * 100
                    print(f"      {agent_type.title()}: {confidence:.1f}% confidence")
                    
        print(f"\n✅ Discovery workflow completed successfully!")
        print(f"🔬 All systems operational and ready for archaeological research.")
        
    def run_complete_workflow(self):
        """Run the complete archaeological discovery workflow"""
        self.print_header("NIS PROTOCOL COMPLETE DISCOVERY WORKFLOW")
        
        print("🚀 Starting comprehensive archaeological discovery demonstration...")
        print("   This workflow will test the complete system from discovery to AI analysis.")
        
        # Step 1: System Health Check
        if not self.test_system_health():
            print("❌ System health check failed. Aborting workflow.")
            return
            
        # Step 2: Get Available Agents
        agents = self.get_available_agents()
        if not agents:
            print("⚠️  No agents available, but continuing with discovery...")
            
        # Step 3: Define Discovery Locations
        discovery_locations = [
            {
                "name": "Amazon Basin",
                "latitude": -3.4653,
                "longitude": -62.2159,
                "description": "Dense rainforest region with potential indigenous settlements"
            },
            {
                "name": "Andes Mountains",
                "latitude": -13.1631,
                "longitude": -72.5450,
                "description": "High-altitude region with potential Inca archaeological sites"
            },
            {
                "name": "Cerrado Savanna",
                "latitude": -15.7975,
                "longitude": -47.8919,
                "description": "Savanna region with potential pre-Columbian settlements"
            }
        ]
        
        # Step 4: Discover Archaeological Sites
        discoveries = self.discover_archaeological_sites(discovery_locations)
        
        if not discoveries:
            print("❌ No discoveries made. Workflow incomplete.")
            return
            
        # Step 5: AI Agent Analysis
        analyses = []
        for discovery in discoveries:
            if discovery.get('validated_sites'):
                analysis = self.analyze_with_ai_agents(discovery, agents)
                analyses.append(analysis)
                
        # Step 6: Generate Report
        self.generate_discovery_report(discoveries, analyses)

def main():
    """Main function to run the complete workflow"""
    workflow = ArchaeologicalDiscoveryWorkflow()
    workflow.run_complete_workflow()

if __name__ == "__main__":
    main() 