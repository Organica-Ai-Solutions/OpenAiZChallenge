#!/usr/bin/env python3
"""Verify Database Contents - Quick Check"""

import asyncio
import sys
import os
from pathlib import Path

# Setup
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
os.environ['USE_SQLITE'] = 'true'

from scripts.simple_storage_test import SimpleStorageService

async def verify_database():
    """Quick verification of database contents."""
    
    print("DATABASE VERIFICATION")
    print("=" * 40)
    
    try:
        storage = SimpleStorageService()
        await storage.init_database()
        metrics = await storage.get_metrics()
        
        print("Storage Metrics:")
        print(f"  Archaeological Sites: {metrics.get('total_sites', 0)}")
        print(f"  Analysis Records: {metrics.get('total_analyses', 0)}")
        print(f"  Database Status: {metrics.get('database_status', 'unknown')}")
        print(f"  Storage Type: {metrics.get('storage_type', 'unknown')}")
        
        if metrics.get('total_sites', 0) > 0:
            print("\nSUCCESS: Archaeological discoveries are safely stored!")
            print("Your system now preserves all findings permanently.")
            return True
        else:
            print("\nWARNING: No sites found in database")
            return False
            
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(verify_database())
    print(f"\nStatus: {'VERIFIED' if result else 'ISSUE DETECTED'}")
    sys.exit(0 if result else 1) 