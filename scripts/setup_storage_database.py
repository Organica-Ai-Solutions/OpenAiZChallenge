#!/usr/bin/env python3
"""Database Setup Script for NIS Protocol Storage System.

This script sets up the database and tests the complete storage pipeline.
"""

import asyncio
import os
import sys
import logging
from datetime import datetime
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set environment variables for development
os.environ['USE_SQLITE'] = 'true'  # Use SQLite for easy setup
os.environ['PYTHONPATH'] = str(project_root)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('storage_setup.log')
    ]
)
logger = logging.getLogger(__name__)

async def setup_database():
    """Set up the database with all required tables."""
    logger.info("🏗️ Setting up NIS Protocol database...")
    
    try:
        from src.infrastructure.database import DatabaseManager
        
        # Initialize database manager
        logger.info("📊 Initializing database manager...")
        
        # Use SQLite for simple testing (can switch to PostgreSQL later)
        if not os.path.exists('nis_protocol.db'):
            logger.info("📁 Creating SQLite database file...")
            
        # Create database manager - will handle config loading
        db_manager = DatabaseManager()
        
        # Create all tables
        logger.info("🔨 Creating database tables...")
        await db_manager.create_tables()
        
        logger.info("✅ Database setup completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def test_basic_storage():
    """Test basic storage functionality."""
    logger.info("🧪 Testing basic storage...")
    
    try:
        from src.services.storage_service import get_storage_service
        
        # Get storage service
        storage_service = get_storage_service()
        
        # Test basic functionality
        logger.info("📊 Getting storage metrics...")
        metrics = await storage_service.get_storage_metrics()
        logger.info(f"✅ Metrics retrieved: {metrics}")
        
        logger.info("✅ Basic storage test completed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Basic storage test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def test_analysis_storage():
    """Test storing a sample analysis."""
    logger.info("💾 Testing analysis storage...")
    
    try:
        from src.services.storage_service import get_storage_service
        
        storage_service = get_storage_service()
        
        # Create test analysis
        test_analysis = {
            "analysis_id": "test_001",
            "lat": -3.4653,
            "lon": -62.2159,
            "analysis_type": "comprehensive",
            "confidence": 0.85,
            "pattern_type": "settlement",
            "cultural_significance": "Test indigenous settlement",
            "results": {
                "features_detected": 10,
                "confidence_breakdown": {
                    "satellite_analysis": 0.87,
                    "lidar_analysis": 0.83
                }
            },
            "agents_used": ["vision", "reasoning"],
            "data_sources": ["satellite", "lidar"],
            "researcher_id": "test_system",
            "session_name": "Test Session",
            "backend_status": "success",
            "processing_time": "2.5s",
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("💾 Storing test analysis...")
        result = await storage_service.store_comprehensive_analysis(test_analysis)
        
        logger.info(f"📊 Storage result: {result}")
        logger.info("✅ Analysis storage test completed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Analysis storage test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def main():
    """Main function to run all tests."""
    logger.info("🚀 Starting NIS Protocol Storage Setup")
    logger.info("=" * 50)
    
    tests = [
        ("Database Setup", setup_database),
        ("Basic Storage Test", test_basic_storage),
        ("Analysis Storage Test", test_analysis_storage)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running: {test_name}")
        if await test_func():
            logger.info(f"✅ {test_name}: PASSED")
            passed += 1
        else:
            logger.error(f"❌ {test_name}: FAILED")
    
    logger.info(f"\n📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        logger.info("🎉 All tests passed! Storage system is ready!")
        return True
    else:
        logger.error("💥 Some tests failed. Check logs for details.")
        return False

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1) 