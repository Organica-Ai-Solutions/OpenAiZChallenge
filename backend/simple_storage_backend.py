#!/usr/bin/env python3
"""Comprehensive Storage Backend for NIS Protocol Analysis Results - ALL ANALYSIS TYPES."""

import json
import os
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComprehensiveStorageHandler(BaseHTTPRequestHandler):
    """Comprehensive HTTP handler for all analysis storage operations."""
    
    def __init__(self, *args, **kwargs):
        self.storage_file = "data/comprehensive_analysis_storage.json"
        self.sites_file = "storage/archaeological_sites.json"
        self.ensure_storage_dirs()
        super().__init__(*args, **kwargs)
    
    def ensure_storage_dirs(self):
        """Ensure storage directories exist."""
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        os.makedirs(os.path.dirname(self.sites_file), exist_ok=True)
    
    def load_data(self):
        """Load existing comprehensive analysis data."""
        try:
            if os.path.exists(self.storage_file):
                with open(self.storage_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load analysis data: {e}")
        return {
            "analyses": [],
            "metadata": {
                "total_stored": 0,
                "high_confidence_count": 0,
                "divine_analyses": 0,
                "vision_analyses": 0,
                "simple_analyses": 0,
                "last_updated": datetime.now().isoformat()
            }
        }
    
    def load_sites_data(self):
        """Load archaeological sites data."""
        try:
            if os.path.exists(self.sites_file):
                with open(self.sites_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load sites data: {e}")
        return {"sites": []}
    
    def save_data(self, data):
        """Save comprehensive analysis data to file."""
        try:
            with open(self.storage_file, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Failed to save analysis data: {e}")
            return False
    
    def save_sites_data(self, sites_data):
        """Save archaeological sites data."""
        try:
            with open(self.sites_file, 'w') as f:
                json.dump(sites_data, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Failed to save sites data: {e}")
            return False
    
    def should_store_analysis(self, analysis_data):
        """Determine if analysis should be stored based on confidence and type."""
        confidence = analysis_data.get("confidence", 0.0)
        analysis_type = analysis_data.get("analysis_type", "unknown")
        
        # Store divine analyses regardless of confidence (they're already blessed)
        if "divine" in analysis_type.lower():
            return True, "Divine analysis - Zeus blessed"
        
        # Store high confidence analyses (>= 0.7)
        if confidence >= 0.7:
            return True, f"High confidence: {confidence:.2f}"
        
        # Store vision analyses with features detected
        if analysis_type == "vision" and analysis_data.get("results", {}).get("features_detected", 0) > 0:
            return True, f"Vision analysis with {analysis_data['results']['features_detected']} features"
        
        # Store if marked as significant
        if analysis_data.get("results", {}).get("significant", False):
            return True, "Marked as archaeologically significant"
        
        return False, f"Low confidence: {confidence:.2f}"
    
    def extract_coordinates(self, analysis_data):
        """Extract coordinates from various formats in analysis data."""
        coords = analysis_data.get("coordinates", {})
        
        # Try different coordinate formats
        if isinstance(coords, dict):
            if "lat" in coords and "lon" in coords:
                return coords["lat"], coords["lon"]
            elif "latitude" in coords and "longitude" in coords:
                return coords["latitude"], coords["longitude"]
        
        # Try from results
        results = analysis_data.get("results", {})
        if "coordinates" in results:
            coords = results["coordinates"]
            if isinstance(coords, dict):
                if "lat" in coords and "lon" in coords:
                    return coords["lat"], coords["lon"]
        
        # Try from site data
        if "site_data" in analysis_data:
            site = analysis_data["site_data"]
            if "coordinates" in site:
                coord_str = site["coordinates"]
                if isinstance(coord_str, str) and "," in coord_str:
                    parts = coord_str.split(",")
                    if len(parts) >= 2:
                        try:
                            return float(parts[0].strip()), float(parts[1].strip())
                        except ValueError:
                            pass
        
        return None, None
    
    def update_site_with_analysis(self, analysis_record):
        """Update archaeological sites with stored analysis results."""
        lat, lon = self.extract_coordinates(analysis_record)
        if lat is None or lon is None:
            return False
        
        sites_data = self.load_sites_data()
        
        # Find or create site
        site_id = f"{lat:.4f}_{lon:.4f}"
        existing_site = None
        
        for site in sites_data["sites"]:
            if site.get("id") == site_id:
                existing_site = site
                break
        
        if existing_site is None:
            # Create new site
            existing_site = {
                "id": site_id,
                "name": f"Archaeological Site {lat:.4f}, {lon:.4f}",
                "coordinates": f"{lat}, {lon}",
                "confidence": analysis_record["confidence"],
                "analysis_history": [],
                "features_detected": 0,
                "cultural_significance": "Unknown",
                "last_updated": datetime.now().isoformat()
            }
            sites_data["sites"].append(existing_site)
        
        # Update site with analysis results
        existing_site["analysis_history"].append({
            "analysis_id": analysis_record["analysis_id"],
            "type": analysis_record["analysis_type"],
            "confidence": analysis_record["confidence"],
            "timestamp": analysis_record["timestamp"],
            "storage_reason": analysis_record.get("storage_reason", "High confidence")
        })
        
        # Update site confidence (take highest)
        if analysis_record["confidence"] > existing_site["confidence"]:
            existing_site["confidence"] = analysis_record["confidence"]
        
        # Update features if available
        results = analysis_record.get("results", {})
        if "features_detected" in results:
            existing_site["features_detected"] = max(
                existing_site["features_detected"],
                results["features_detected"]
            )
        
        # Update cultural significance for divine analyses
        if "divine" in analysis_record["analysis_type"].lower():
            existing_site["cultural_significance"] = "Divine Discovery"
            existing_site["divine_blessed"] = True
        elif analysis_record["confidence"] >= 0.8:
            existing_site["cultural_significance"] = "High"
        elif analysis_record["confidence"] >= 0.6:
            existing_site["cultural_significance"] = "Medium"
        
        existing_site["last_updated"] = datetime.now().isoformat()
        
        # Save updated sites
        return self.save_sites_data(sites_data)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with comprehensive CORS headers."""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        
        response_text = json.dumps(data, indent=2)
        self.wfile.write(response_text.encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests."""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        if path == "/health":
            self.send_json_response({
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "service": "Comprehensive Storage Backend",
                "version": "2.0.0"
            })
        
        elif path == "/storage/stats":
            data = self.load_data()
            metadata = data.get("metadata", {})
            self.send_json_response({
                "total_analyses": len(data.get("analyses", [])),
                "high_confidence_count": metadata.get("high_confidence_count", 0),
                "divine_analyses": metadata.get("divine_analyses", 0),
                "vision_analyses": metadata.get("vision_analyses", 0),
                "simple_analyses": metadata.get("simple_analyses", 0),
                "storage_file": self.storage_file,
                "sites_file": self.sites_file,
                "last_updated": metadata.get("last_updated")
            })
        
        elif path == "/storage/list":
            data = self.load_data()
            
            # Filter by type if requested
            analysis_type = query_params.get("type", [None])[0]
            analyses = data.get("analyses", [])
            
            if analysis_type:
                analyses = [a for a in analyses if analysis_type.lower() in a.get("analysis_type", "").lower()]
            
            self.send_json_response({
                "analyses": analyses,
                "metadata": data.get("metadata", {}),
                "filtered_by": analysis_type
            })
        
        elif path == "/storage/sites":
            sites_data = self.load_sites_data()
            self.send_json_response(sites_data)
        
        elif path == "/storage/high-confidence":
            data = self.load_data()
            high_confidence = [a for a in data.get("analyses", []) if a.get("confidence", 0) >= 0.7]
            self.send_json_response({
                "high_confidence_analyses": high_confidence,
                "count": len(high_confidence)
            })
        
        else:
            self.send_json_response({"error": "Endpoint not found"}, 404)
    
    def do_POST(self):
        """Handle POST requests."""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
            else:
                request_data = {}
            
            if path == "/storage/save":
                # Comprehensive analysis storage
                data = self.load_data()
                
                # Check if analysis should be stored
                should_store, reason = self.should_store_analysis(request_data)
                
                if should_store:
                    # Create comprehensive analysis record
                    analysis_record = {
                        "analysis_id": request_data.get("analysis_id", f"analysis_{int(time.time())}"),
                        "coordinates": request_data.get("coordinates", {}),
                        "analysis_type": request_data.get("analysis_type", "unknown"),
                        "confidence": request_data.get("confidence", 0.0),
                        "results": request_data.get("results", {}),
                        "timestamp": datetime.now().isoformat(),
                        "stored_by": "comprehensive_storage_backend",
                        "storage_reason": reason,
                        "site_data": request_data.get("site_data", {}),
                        "agent_data": request_data.get("agent_data", {}),
                        "processing_metadata": request_data.get("processing_metadata", {})
                    }
                    
                    # Add to analyses
                    data["analyses"].append(analysis_record)
                    
                    # Update metadata
                    metadata = data.get("metadata", {})
                    metadata["total_stored"] = len(data["analyses"])
                    metadata["last_updated"] = datetime.now().isoformat()
                    
                    # Count by type
                    if analysis_record["confidence"] >= 0.7:
                        metadata["high_confidence_count"] = metadata.get("high_confidence_count", 0) + 1
                    
                    if "divine" in analysis_record["analysis_type"].lower():
                        metadata["divine_analyses"] = metadata.get("divine_analyses", 0) + 1
                    elif "vision" in analysis_record["analysis_type"].lower():
                        metadata["vision_analyses"] = metadata.get("vision_analyses", 0) + 1
                    else:
                        metadata["simple_analyses"] = metadata.get("simple_analyses", 0) + 1
                    
                    data["metadata"] = metadata
                    
                    # Keep only last 500 analyses
                    if len(data["analyses"]) > 500:
                        data["analyses"] = data["analyses"][-500:]
                    
                    # Save analysis data
                    if self.save_data(data):
                        # Update archaeological sites
                        site_updated = self.update_site_with_analysis(analysis_record)
                        
                        logger.info(f"✅ Stored {analysis_record['analysis_type']} analysis: {analysis_record['analysis_id']} - {reason}")
                        self.send_json_response({
                            "success": True,
                            "analysis_id": analysis_record["analysis_id"],
                            "message": f"Analysis stored successfully - {reason}",
                            "timestamp": analysis_record["timestamp"],
                            "site_updated": site_updated,
                            "storage_reason": reason
                        })
                    else:
                        self.send_json_response({
                            "success": False,
                            "error": "Failed to save analysis data"
                        }, 500)
                else:
                    # Analysis not stored - return info
                    logger.info(f"📊 Analysis not stored: {reason}")
                    self.send_json_response({
                        "success": False,
                        "stored": False,
                        "reason": reason,
                        "message": "Analysis did not meet storage criteria",
                        "criteria": "Confidence >= 0.7 OR Divine analysis OR Vision with features OR Marked significant"
                    })
            
            else:
                self.send_json_response({"error": "Endpoint not found"}, 404)
                
        except Exception as e:
            logger.error(f"POST request failed: {e}")
            self.send_json_response({
                "success": False,
                "error": str(e)
            }, 500)

def start_comprehensive_storage_server(port=8004):
    """Start the comprehensive storage server."""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ComprehensiveStorageHandler)
    
    logger.info(f"🚀 Comprehensive Storage Backend starting on port {port}")
    logger.info(f"📁 Analysis storage: data/comprehensive_analysis_storage.json")
    logger.info(f"🏛️ Sites storage: storage/archaeological_sites.json")
    logger.info(f"🔗 Endpoints:")
    logger.info(f"   POST /storage/save - Save analysis (auto-filters by confidence)")
    logger.info(f"   GET  /storage/stats - Get comprehensive statistics")
    logger.info(f"   GET  /storage/list - List all analyses")
    logger.info(f"   GET  /storage/sites - Get archaeological sites")
    logger.info(f"   GET  /storage/high-confidence - Get high-confidence analyses")
    logger.info(f"   GET  /health - Health check")
    logger.info(f"💾 Storage Criteria:")
    logger.info(f"   • Divine analyses (always stored)")
    logger.info(f"   • Confidence >= 0.7")
    logger.info(f"   • Vision analyses with features detected")
    logger.info(f"   • Marked as archaeologically significant")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 Comprehensive Storage Backend stopped")
        httpd.server_close()

if __name__ == "__main__":
    start_comprehensive_storage_server() 