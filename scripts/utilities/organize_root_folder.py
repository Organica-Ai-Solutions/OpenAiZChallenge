#!/usr/bin/env python3
"""
Root Folder Organization Script
Moves files to appropriate directories while preserving functionality
"""

import os
import shutil
import json
from pathlib import Path

def organize_root_folder():
    """Organize root folder for clean submission"""
    
    print("🧹 Organizing root folder for submission...")
    
    # Define file movements
    moves = [
        # Backend files to backend/
        ("backend_main.py", "backend/"),
        ("simple_storage_backend.py", "backend/"),
        ("fallback_backend.py", "backend/"),
        ("fallback_backend_backup.py", "backend/"),
        ("test_backend_endpoints.py", "backend/"),
        ("test_backend_api.html", "backend/"),
        
        # Analysis and unleash scripts to scripts/
        ("unleash_power_simple.py", "scripts/"),
        ("unleash_power_final.py", "scripts/"),
        ("unleash_power_debug.py", "scripts/"),
        ("unleash_nis_power.py", "scripts/"),
        ("trigger_analysis.js", "scripts/"),
        ("trigger_all_sites_analysis.py", "scripts/"),
        ("nis_protocol_demo_package.py", "scripts/"),
        ("map_enhanced_data.js", "scripts/"),
        
        # Management scripts to scripts/
        ("manage_storage.sh", "scripts/"),
        ("reset_nis_system.sh", "scripts/"),
        ("start_fallback.sh", "scripts/"),
        ("start_fallback.bat", "scripts/"),
        ("check_prerequisites.sh", "scripts/"),
        
        # Data files to data/
        ("monte_alegre_analysis.json", "data/"),
        ("full_analysis.json", "data/"),
        ("enhanced_archaeological_sites_20250625_193050.json", "data/"),
        ("analysis_response.json", "data/"),
        ("all_sites_enhanced_20250625_193953.json", "data/"),
        ("debug_storage.json", "data/"),
        ("temp_storage_test.json", "data/"),
        ("temp_test.json", "data/"),
        
        # Documentation to docs/
        ("FINAL_SUBMISSION_CHECKLIST.md", "docs/submission/"),
        ("COMPREHENSIVE_SYSTEM_STATUS.md", "docs/"),
        ("COMPREHENSIVE_STORAGE_INTEGRATION_COMPLETE.md", "docs/"),
        ("LIDAR_RENDERING_COMPLETE_SOLUTION.md", "docs/"),
        ("LIDAR_RENDERING_SOLUTIONS.md", "docs/"),
        ("CRITICAL_FIXES_SUMMARY.md", "docs/"),
        ("SUBMISSION_READY_STATUS.md", "docs/submission/"),
        ("SUBMISSION_READY_CHECKLIST.md", "docs/submission/"),
        ("SUBMISSION_README.md", "docs/submission/"),
        ("SECURITY_FIX_COMPLETE.md", "docs/"),
        ("MAKE_REPO_PUBLIC_GUIDE.md", "docs/utilities/"),
        ("FINAL_SUBMISSION_README.md", "docs/submission/"),
        ("FINAL_LIDAR_VERIFICATION.md", "docs/"),
        ("FINAL_CLEANUP_SUMMARY.md", "docs/"),
        ("ENVIRONMENT_SETUP.md", "docs/utilities/"),
        
        # Docker files to config/
        ("Dockerfile.storage", "config/"),
        ("Dockerfile.fallback", "config/"),
        ("Dockerfile.ikrp", "config/"),
        ("Dockerfile.simple", "config/"),
        ("requirements.simple.txt", "config/"),
        
        # Database files to data/
        ("nis_test.db", "data/"),
        
        # Empty/temp files to be removed
        ("nul", None),  # Remove this empty file
    ]
    
    # Files to keep in root (essential startup/management files)
    keep_in_root = {
        "start.sh", "start.bat", "stop.sh", "stop.bat", "start_system.bat",
        "README.md", "LICENSE", "requirements.txt", "docker-compose.yml", "Dockerfile",
        ".gitignore", ".dockerignore", ".cursorignore", "env.example", 
        "setup.py", "pyproject.toml",
        "check_system_status.bat", "fix_fetch_error.bat"
    }
    
    moved_count = 0
    
    for source, destination in moves:
        source_path = Path(source)
        
        if not source_path.exists():
            continue
            
        if destination is None:
            # Remove file
            print(f"🗑️  Removing: {source}")
            source_path.unlink()
            continue
            
        dest_dir = Path(destination)
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / source_path.name
        
        print(f"📁 Moving: {source} → {destination}")
        shutil.move(str(source_path), str(dest_path))
        moved_count += 1
    
    # Clean up __pycache__ directories
    for pycache in Path(".").glob("**/__pycache__"):
        if pycache.is_dir():
            print(f"🧹 Removing: {pycache}")
            shutil.rmtree(pycache)
    
    print(f"\n✅ Organization complete!")
    print(f"📁 Moved {moved_count} files")
    print(f"🏠 Root folder now contains only essential files")
    
    # Show final root structure
    print("\n📋 Final root folder contents:")
    root_files = sorted([f.name for f in Path(".").iterdir() if f.is_file()])
    for file in root_files:
        print(f"   📄 {file}")
    
    root_dirs = sorted([d.name for d in Path(".").iterdir() if d.is_dir() and not d.name.startswith('.')])
    for dir in root_dirs:
        print(f"   📁 {dir}/")

if __name__ == "__main__":
    organize_root_folder() 