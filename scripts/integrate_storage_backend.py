#!/usr/bin/env python3
"""Integration Script: Replace Backend Memory Storage with Database Storage.

This script modifies backend_main.py to use our persistent database storage
instead of in-memory dictionaries.
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def create_storage_integration_code():
    """Generate the code to integrate storage with backend_main.py"""
    
    integration_code = '''
# =============================================================================
# DATABASE STORAGE INTEGRATION - Added by integrate_storage_backend.py
# =============================================================================

import asyncio
from pathlib import Path
import json
from typing import Dict, List, Any, Optional

# Import our simplified storage system
sys.path.insert(0, str(Path(__file__).parent))

try:
    from scripts.simple_storage_test import SimpleStorageService
    STORAGE_AVAILABLE = True
    print("✅ Storage system imported successfully")
except Exception as e:
    print(f"⚠️ Storage system not available: {e}")
    STORAGE_AVAILABLE = False

# Global storage service instance
_storage_service = None

async def get_storage_service():
    """Get or create the storage service."""
    global _storage_service
    if _storage_service is None and STORAGE_AVAILABLE:
        _storage_service = SimpleStorageService()
        await _storage_service.init_database()
        print("✅ Database storage service initialized")
    return _storage_service

async def store_site_to_database(site_id: str, site_data: Dict[str, Any]) -> bool:
    """Store a site to the database."""
    try:
        storage = await get_storage_service()
        if not storage:
            return False
            
        # Convert site data to analysis format
        analysis_data = {
            "analysis_id": f"backend_site_{site_id}",
            "lat": site_data.get("lat", 0.0),
            "lon": site_data.get("lon", 0.0),
            "confidence": site_data.get("confidence", 0.0),
            "pattern_type": site_data.get("type", "unknown"),
            "cultural_significance": site_data.get("description", ""),
            "results": site_data,
            "session_name": "Backend Integration",
            "researcher_id": "backend_system",
            "processing_time": "0s"
        }
        
        result = await storage.store_analysis(analysis_data)
        return result.get("success", False)
        
    except Exception as e:
        print(f"❌ Failed to store site to database: {e}")
        return False

async def load_sites_from_database() -> Dict[str, Any]:
    """Load sites from database into KNOWN_SITES format."""
    try:
        storage = await get_storage_service()
        if not storage:
            return {}
            
        metrics = await storage.get_metrics()
        print(f"📊 Database contains {metrics.get('total_sites', 0)} sites")
        
        # For now, return empty dict as we'd need more complex querying
        # In production, this would load all sites from the database
        return {}
        
    except Exception as e:
        print(f"❌ Failed to load sites from database: {e}")
        return {}

async def store_analysis_to_database(analysis_data: Dict[str, Any]) -> bool:
    """Store analysis data to database."""
    try:
        storage = await get_storage_service()
        if not storage:
            return False
            
        result = await storage.store_analysis(analysis_data)
        success = result.get("success", False)
        
        if success:
            print(f"✅ Analysis {analysis_data.get('analysis_id', 'unknown')} stored to database")
        else:
            print(f"❌ Failed to store analysis: {result.get('error', 'unknown error')}")
            
        return success
        
    except Exception as e:
        print(f"❌ Failed to store analysis to database: {e}")
        return False

async def get_database_metrics() -> Dict[str, Any]:
    """Get database storage metrics."""
    try:
        storage = await get_storage_service()
        if not storage:
            return {"error": "Storage not available"}
            
        return await storage.get_metrics()
        
    except Exception as e:
        print(f"❌ Failed to get database metrics: {e}")
        return {"error": str(e)}

# =============================================================================
# END DATABASE STORAGE INTEGRATION
# =============================================================================
'''
    return integration_code

def create_updated_store_function():
    """Create the updated store_comprehensive_analysis function."""
    
    updated_function = '''
async def store_comprehensive_analysis(analysis_result):
    """Store comprehensive analysis results - UPDATED with database storage."""
    try:
        # Store in database first
        database_success = await store_analysis_to_database(analysis_result)
        
        # Keep memory storage as backup/cache
        if "global" not in analysis_history_store:
            analysis_history_store["global"] = []
        
        analysis_history_store["global"].append({
            "analysis_id": analysis_result.get("analysis_id", f"analysis_{len(analysis_history_store['global'])}"),
            "timestamp": analysis_result.get("timestamp", ""),
            "location": f"{analysis_result.get('lat', 0)}, {analysis_result.get('lon', 0)}",
            "confidence": analysis_result.get("confidence", 0.0),
            "pattern_type": analysis_result.get("pattern_type", "unknown"),
            "database_stored": database_success,
            "results": analysis_result
        })
        
        # Keep only recent 50 in memory
        if len(analysis_history_store["global"]) > 50:
            analysis_history_store["global"] = analysis_history_store["global"][-50:]
        
        # If high confidence, store as site
        if analysis_result.get("confidence", 0) > 0.7:
            site_key = f"{analysis_result.get('lat', 0):.4f}_{analysis_result.get('lon', 0):.4f}"
            
            # Store in database
            site_data = {
                "lat": analysis_result.get("lat", 0),
                "lon": analysis_result.get("lon", 0),
                "confidence": analysis_result.get("confidence", 0),
                "type": analysis_result.get("pattern_type", "unknown"),
                "description": analysis_result.get("cultural_significance", ""),
                "discovered_by": "NIS Protocol",
                "analysis_id": analysis_result.get("analysis_id", ""),
                "timestamp": analysis_result.get("timestamp", "")
            }
            
            database_site_success = await store_site_to_database(site_key, site_data)
            
            # Store in memory as backup
            KNOWN_SITES[site_key] = site_data
            KNOWN_SITES[site_key]["database_stored"] = database_site_success
            
            print(f"🏛️ High-confidence site stored: {site_key} (DB: {'✅' if database_site_success else '❌'})")
        
        return {
            "status": "success",
            "database_stored": database_success,
            "total_analyses": len(analysis_history_store.get("global", [])),
            "total_sites": len(KNOWN_SITES)
        }
        
    except Exception as e:
        print(f"❌ Error in store_comprehensive_analysis: {e}")
        return {"status": "error", "error": str(e)}
'''
    return updated_function

def backup_original_file():
    """Create a backup of the original backend_main.py"""
    original_file = project_root / "backend_main.py"
    backup_file = project_root / "backend_main_backup.py"
    
    if original_file.exists() and not backup_file.exists():
        import shutil
        shutil.copy2(original_file, backup_file)
        print(f"✅ Created backup: {backup_file}")
        return True
    else:
        print(f"⚠️ Backup already exists or original file not found")
        return False

def integrate_storage():
    """Integrate storage system with backend_main.py"""
    
    print("🔧 Starting Backend Storage Integration")
    print("=" * 50)
    
    # Step 1: Backup original file
    print("1️⃣ Creating backup...")
    backup_success = backup_original_file()
    
    # Step 2: Read the current backend file
    backend_file = project_root / "backend_main.py"
    
    if not backend_file.exists():
        print(f"❌ Backend file not found: {backend_file}")
        return False
        
    print("2️⃣ Reading backend file...")
    with open(backend_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Step 3: Check if already integrated
    if "DATABASE STORAGE INTEGRATION" in content:
        print("⚠️ Storage integration already present")
        return True
    
    # Step 4: Add integration code after imports
    print("3️⃣ Adding storage integration...")
    
    # Find the right place to insert (after the last import)
    lines = content.split('\n')
    insert_pos = 0
    
    for i, line in enumerate(lines):
        if line.startswith('import ') or line.startswith('from '):
            insert_pos = i + 1
        elif line.strip() == '' and i > 0:
            continue
        elif line.startswith('#') and 'import' not in line:
            continue
        elif insert_pos > 0 and line.strip() != '':
            break
    
    # Insert integration code
    integration_lines = create_storage_integration_code().split('\n')
    lines[insert_pos:insert_pos] = integration_lines
    
    # Step 5: Replace the store_comprehensive_analysis function
    print("4️⃣ Updating store function...")
    
    # Find and replace the function
    new_content = '\n'.join(lines)
    
    # Look for the existing function
    func_start = new_content.find('async def store_comprehensive_analysis(analysis_result):')
    if func_start != -1:
        # Find the end of the function (next async def or end of file)
        func_end = new_content.find('\nasync def ', func_start + 1)
        if func_end == -1:
            func_end = len(new_content)
        
        # Replace the function
        updated_function = create_updated_store_function()
        new_content = (new_content[:func_start] + 
                      updated_function + 
                      new_content[func_end:])
        
        print("✅ Updated store_comprehensive_analysis function")
    else:
        print("⚠️ store_comprehensive_analysis function not found")
    
    # Step 6: Write the updated file
    print("5️⃣ Writing updated backend...")
    
    with open(backend_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Backend integration completed!")
    
    # Step 7: Create a test endpoint
    print("6️⃣ Adding database status endpoint...")
    
    status_endpoint = '''

# Database status endpoint - Added by integration
@app.get("/api/storage/status")
async def get_storage_status():
    """Get database storage status."""
    try:
        metrics = await get_database_metrics()
        return {
            "status": "success",
            "storage_available": STORAGE_AVAILABLE,
            "database_metrics": metrics,
            "memory_backup": {
                "total_sites": len(KNOWN_SITES),
                "total_analyses": len(analysis_history_store.get("global", []))
            }
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
'''
    
    # Append the endpoint
    with open(backend_file, 'a', encoding='utf-8') as f:
        f.write(status_endpoint)
    
    print("✅ Added storage status endpoint: /api/storage/status")
    print("\n🎉 Integration completed successfully!")
    print("\nNext steps:")
    print("1. Start the backend: python backend_main.py")
    print("2. Test storage status: curl http://localhost:8000/api/storage/status")
    print("3. Perform an analysis to test storage")
    
    return True

def main():
    """Main function."""
    try:
        success = integrate_storage()
        if success:
            print("\n🎉 SUCCESS: Backend storage integration completed!")
            return True
        else:
            print("\n💥 FAILED: Integration encountered errors")
            return False
    except Exception as e:
        print(f"\n❌ Integration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = main()
    sys.exit(0 if result else 1) 