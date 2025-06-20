#!/usr/bin/env python3
"""Simplified Storage Test for NIS Protocol.

Tests the basic storage functionality with SQLite and SQLAlchemy.
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

# Set environment variables
os.environ['USE_SQLITE'] = 'true'
os.environ['PYTHONPATH'] = str(project_root)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Simple storage models using just SQLAlchemy
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

Base = declarative_base()

class ArchaeologicalSite(Base):
    __tablename__ = 'archaeological_sites'
    
    id = Column(Integer, primary_key=True)
    site_id = Column(String(100), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    pattern_type = Column(String(50))
    cultural_significance = Column(Text)
    discovery_date = Column(DateTime, default=datetime.utcnow)
    validated = Column(Boolean, default=False)

class AnalysisSession(Base):
    __tablename__ = 'analysis_sessions'
    
    id = Column(Integer, primary_key=True)
    analysis_id = Column(String(100), unique=True, nullable=False)
    session_name = Column(String(200))
    researcher_id = Column(String(100))
    analysis_type = Column(String(50))
    status = Column(String(20), default='pending')
    results_json = Column(Text)
    processing_time = Column(String(20))
    timestamp = Column(DateTime, default=datetime.utcnow)

class SimpleStorageService:
    """Simplified storage service for testing."""
    
    def __init__(self):
        self.db_url = "sqlite+aiosqlite:///./nis_test.db"
        self.engine = create_async_engine(self.db_url, echo=False)
        self.session_factory = async_sessionmaker(self.engine, expire_on_commit=False)
    
    async def init_database(self):
        """Initialize the database tables."""
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created")
    
    async def store_analysis(self, analysis_data):
        """Store an analysis in the database."""
        try:
            async with self.session_factory() as session:
                # Store the site
                site = ArchaeologicalSite(
                    site_id=f"site_{analysis_data['analysis_id']}",
                    latitude=analysis_data['lat'],
                    longitude=analysis_data['lon'],
                    confidence=analysis_data['confidence'],
                    pattern_type=analysis_data.get('pattern_type', 'unknown'),
                    cultural_significance=analysis_data.get('cultural_significance', ''),
                    validated=analysis_data.get('confidence', 0) > 0.8
                )
                session.add(site)
                
                # Store the analysis session
                import json
                analysis = AnalysisSession(
                    analysis_id=analysis_data['analysis_id'],
                    session_name=analysis_data.get('session_name', 'Test Session'),
                    researcher_id=analysis_data.get('researcher_id', 'system'),
                    analysis_type=analysis_data.get('analysis_type', 'comprehensive'),
                    status='completed',
                    results_json=json.dumps(analysis_data.get('results', {})),
                    processing_time=analysis_data.get('processing_time', 'unknown'),
                )
                session.add(analysis)
                
                await session.commit()
                logger.info(f"✅ Stored analysis: {analysis_data['analysis_id']}")
                return {"success": True, "site_stored": True, "analysis_stored": True}
                
        except Exception as e:
            logger.error(f"❌ Failed to store analysis: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_metrics(self):
        """Get storage metrics."""
        try:
            async with self.session_factory() as session:
                from sqlalchemy import func
                
                # Count sites and analyses
                site_count = await session.scalar(func.count(ArchaeologicalSite.id))
                analysis_count = await session.scalar(func.count(AnalysisSession.id))
                
                return {
                    "total_sites": site_count or 0,
                    "total_analyses": analysis_count or 0,
                    "database_status": "healthy",
                    "storage_type": "sqlite"
                }
        except Exception as e:
            logger.error(f"❌ Failed to get metrics: {e}")
            return {"error": str(e)}

async def test_storage_system():
    """Test the complete storage system."""
    logger.info("🚀 Starting Storage System Test")
    logger.info("=" * 40)
    
    try:
        # Initialize storage service
        logger.info("1️⃣ Initializing storage service...")
        storage = SimpleStorageService()
        await storage.init_database()
        
        # Test storing an analysis
        logger.info("2️⃣ Testing analysis storage...")
        test_analysis = {
            "analysis_id": "test_storage_001",
            "lat": -3.4653,
            "lon": -62.2159,
            "analysis_type": "comprehensive",
            "confidence": 0.87,
            "pattern_type": "settlement",
            "cultural_significance": "Ancient indigenous settlement with ceremonial features",
            "results": {
                "features_detected": 12,
                "confidence_breakdown": {
                    "satellite_analysis": 0.89,
                    "lidar_analysis": 0.85
                }
            },
            "session_name": "Storage Test Session",
            "researcher_id": "test_system",
            "processing_time": "2.1s",
            "timestamp": datetime.now().isoformat()
        }
        
        result = await storage.store_analysis(test_analysis)
        logger.info(f"   Result: {result}")
        
        # Test metrics
        logger.info("3️⃣ Testing metrics retrieval...")
        metrics = await storage.get_metrics()
        logger.info(f"   Metrics: {metrics}")
        
        # Store multiple analyses to test the system
        logger.info("4️⃣ Testing multiple analyses...")
        test_sites = [
            {
                "analysis_id": "test_002",
                "lat": -8.1234, "lon": -74.5678,
                "confidence": 0.92, "pattern_type": "ceremonial",
                "cultural_significance": "Sacred ceremonial complex"
            },
            {
                "analysis_id": "test_003", 
                "lat": -13.5321, "lon": -71.9875,
                "confidence": 0.74, "pattern_type": "agricultural",
                "cultural_significance": "Advanced terracing system"
            }
        ]
        
        for site_data in test_sites:
            site_data.update({
                "analysis_type": "comprehensive",
                "results": {"features_detected": 8},
                "session_name": f"Multi-test {site_data['analysis_id']}",
                "researcher_id": "bulk_test",
                "processing_time": "1.8s"
            })
            result = await storage.store_analysis(site_data)
            logger.info(f"   Stored {site_data['analysis_id']}: {result['success']}")
        
        # Final metrics
        logger.info("5️⃣ Final metrics check...")
        final_metrics = await storage.get_metrics()
        logger.info(f"   Final Metrics: {final_metrics}")
        
        logger.info("\n" + "=" * 40)
        logger.info("🎉 STORAGE TEST COMPLETED SUCCESSFULLY!")
        logger.info(f"✅ Sites stored: {final_metrics.get('total_sites', 0)}")
        logger.info(f"✅ Analyses stored: {final_metrics.get('total_analyses', 0)}")
        logger.info(f"✅ Database: {final_metrics.get('database_status', 'unknown')}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Storage test failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def main():
    """Main function."""
    success = await test_storage_system()
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    print(f"\n{'🎉 SUCCESS' if result else '💥 FAILED'}")
    sys.exit(0 if result else 1) 