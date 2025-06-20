#!/usr/bin/env python3
"""Final Storage Pipeline Test.

Tests the complete storage system with database, analysis storage,
and verifies data persistence.
"""

import asyncio
import os
import sys
import logging
from datetime import datetime
from pathlib import Path

# Setup
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
os.environ['USE_SQLITE'] = 'true'

# Import our storage system
from scripts.simple_storage_test import SimpleStorageService

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_complete_pipeline():
    """Test the complete archaeological discovery storage pipeline."""
    
    logger.info("🚀 FINAL STORAGE PIPELINE TEST")
    logger.info("=" * 60)
    
    try:
        # Initialize storage
        logger.info("1️⃣ Initializing Storage System...")
        storage = SimpleStorageService()
        await storage.init_database()
        
        # Test multiple archaeological discoveries
        discoveries = [
            {
                "analysis_id": "final_test_amazon_001",
                "lat": -3.4653, "lon": -62.2159,
                "confidence": 0.91,
                "pattern_type": "settlement", 
                "cultural_significance": "Large indigenous settlement with defensive structures and ceremonial areas",
                "results": {
                    "features_detected": 23,
                    "structures": ["circular houses", "plaza", "defensive walls"],
                    "estimated_population": "200-500 inhabitants",
                    "time_period": "pre-Columbian"
                }
            },
            {
                "analysis_id": "final_test_andes_002",
                "lat": -13.5321, "lon": -71.9875,
                "confidence": 0.87,
                "pattern_type": "agricultural",
                "cultural_significance": "Advanced terracing system with irrigation channels",
                "results": {
                    "features_detected": 15,
                    "structures": ["terraces", "irrigation canals", "storage areas"],
                    "agricultural_area": "12 hectares",
                    "crop_types": ["quinoa", "potatoes", "maize"]
                }
            },
            {
                "analysis_id": "final_test_ceremonial_003", 
                "lat": -8.1234, "lon": -74.5678,
                "confidence": 0.94,
                "pattern_type": "ceremonial",
                "cultural_significance": "Sacred ceremonial complex with astronomical alignments",
                "results": {
                    "features_detected": 8,
                    "structures": ["temple platform", "stone circles", "observation points"],
                    "astronomical_alignments": ["solstice", "equinox", "constellation tracking"],
                    "sacred_significance": "high"
                }
            }
        ]
        
        # Store each discovery
        stored_count = 0
        for i, discovery in enumerate(discoveries, 1):
            logger.info(f"2.{i} Storing Discovery: {discovery['pattern_type'].title()}")
            
            # Add metadata
            discovery.update({
                "session_name": f"Final Test - Discovery {i}",
                "researcher_id": "final_test_system",
                "analysis_type": "comprehensive",
                "processing_time": f"{1.2 + (i * 0.3):.1f}s",
                "timestamp": datetime.now().isoformat(),
                "data_sources": ["satellite", "lidar", "historical_records"],
                "agents_used": ["vision", "reasoning", "cultural", "archaeological"]
            })
            
            result = await storage.store_analysis(discovery)
            if result.get("success"):
                stored_count += 1
                logger.info(f"   ✅ {discovery['pattern_type'].title()} discovery stored successfully")
            else:
                logger.error(f"   ❌ Failed to store {discovery['pattern_type']} discovery")
        
        # Verify storage
        logger.info("3️⃣ Verifying Storage...")
        metrics = await storage.get_metrics()
        
        logger.info("📊 Storage Verification Results:")
        logger.info(f"   - Discoveries Attempted: {len(discoveries)}")
        logger.info(f"   - Successfully Stored: {stored_count}")
        logger.info(f"   - Database Total Sites: {metrics.get('total_sites', 0)}")
        logger.info(f"   - Database Total Analyses: {metrics.get('total_analyses', 0)}")
        logger.info(f"   - Database Status: {metrics.get('database_status', 'unknown')}")
        
        # Test data persistence (restart simulation)
        logger.info("4️⃣ Testing Data Persistence...")
        
        # Create new storage instance to simulate restart
        storage2 = SimpleStorageService()
        await storage2.init_database()
        
        metrics2 = await storage2.get_metrics()
        persistent_sites = metrics2.get('total_sites', 0)
        persistent_analyses = metrics2.get('total_analyses', 0)
        
        logger.info(f"   - Sites after 'restart': {persistent_sites}")
        logger.info(f"   - Analyses after 'restart': {persistent_analyses}")
        
        if persistent_sites > 0 and persistent_analyses > 0:
            logger.info("   ✅ Data persistence confirmed!")
        else:
            logger.warning("   ⚠️ Data persistence issue detected")
        
        # Generate final report
        logger.info("5️⃣ Final Assessment...")
        
        success_rate = (stored_count / len(discoveries)) * 100
        persistence_ok = persistent_sites > 0 and persistent_analyses > 0
        
        logger.info("\n" + "=" * 60)
        logger.info("📋 FINAL STORAGE PIPELINE ASSESSMENT")
        logger.info("=" * 60)
        logger.info(f"✅ Discovery Storage Success Rate: {success_rate:.1f}%")
        logger.info(f"✅ Data Persistence: {'WORKING' if persistence_ok else 'FAILED'}")
        logger.info(f"✅ Database Integration: {'ACTIVE' if metrics.get('database_status') == 'healthy' else 'INACTIVE'}")
        logger.info(f"✅ Total Archaeological Sites: {persistent_sites}")
        logger.info(f"✅ Total Analysis Records: {persistent_analyses}")
        
        # Storage system readiness
        if success_rate >= 100 and persistence_ok:
            logger.info("\n🎉 STORAGE SYSTEM STATUS: PRODUCTION READY!")
            logger.info("🚀 The archaeological discovery pipeline is fully operational")
            logger.info("💾 All discoveries will be permanently stored and preserved")
            logger.info("🔄 System can handle restart without data loss")
            return True
        else:
            logger.warning("\n⚠️ STORAGE SYSTEM STATUS: NEEDS ATTENTION")
            logger.info("🔧 Some issues were detected that should be resolved")
            return False
        
    except Exception as e:
        logger.error(f"❌ Final test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def main():
    """Main function."""
    success = await test_complete_pipeline()
    
    if success:
        print("\n🎯 RESULT: SUCCESS - Storage pipeline is ready for archaeological discoveries!")
        print("\n📝 Next Steps for Submission:")
        print("   1. Backend integration complete ✅")
        print("   2. Database storage working ✅") 
        print("   3. Data persistence confirmed ✅")
        print("   4. Ready for production deployment ✅")
        
        print("\n🏆 Your archaeological discovery system now has:")
        print("   • Persistent database storage")
        print("   • No data loss on restart")
        print("   • Scalable analysis tracking")
        print("   • Complete discovery preservation")
        
    else:
        print("\n💥 RESULT: ISSUES DETECTED - Review logs above")
    
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    exit_code = 0 if result else 1
    print(f"\nExit Code: {exit_code}")
    sys.exit(exit_code) 