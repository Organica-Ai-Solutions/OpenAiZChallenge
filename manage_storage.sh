#!/bin/bash

# Archaeological Storage Management Script
# Manage persistent storage for the NIS Protocol system

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

STORAGE_DIR="storage"
SITES_FILE="$STORAGE_DIR/archaeological_sites.json"
ANALYSES_FILE="$STORAGE_DIR/analysis_sessions.json"
PATTERNS_FILE="$STORAGE_DIR/learning_patterns.json"

# Storage management banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║  💾 ARCHAEOLOGICAL STORAGE MANAGEMENT  💾                        ║
║                                                                   ║
║   🏛️ NIS Protocol Storage System                                 ║
║   📊 Manage Persistent Archaeological Discoveries                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to get storage statistics
get_storage_stats() {
    local sites_count=0
    local analyses_count=0
    local patterns_count=0
    
    if [ -f "$SITES_FILE" ]; then
        sites_count=$(python3 -c "import json; print(len(json.load(open('$SITES_FILE', 'r'))))" 2>/dev/null || echo "0")
    fi
    
    if [ -f "$ANALYSES_FILE" ]; then
        analyses_count=$(python3 -c "import json; print(len(json.load(open('$ANALYSES_FILE', 'r'))))" 2>/dev/null || echo "0")
    fi
    
    if [ -f "$PATTERNS_FILE" ]; then
        patterns_count=$(python3 -c "import json; print(len(json.load(open('$PATTERNS_FILE', 'r'))))" 2>/dev/null || echo "0")
    fi
    
    echo -e "${GREEN}📊 Storage Statistics:${NC}"
    echo -e "   📍 Archaeological Sites: ${YELLOW}${sites_count}${NC}"
    echo -e "   📋 Analysis Sessions: ${YELLOW}${analyses_count}${NC}"
    echo -e "   🧠 Learning Patterns: ${YELLOW}${patterns_count}${NC}"
    
    if [ -d "$STORAGE_DIR" ]; then
        local storage_size=$(du -sh "$STORAGE_DIR" 2>/dev/null | cut -f1)
        echo -e "   💾 Storage Size: ${YELLOW}${storage_size}${NC}"
    fi
}

# Function to backup storage
backup_storage() {
    if [ ! -d "$STORAGE_DIR" ]; then
        echo -e "${RED}❌ No storage directory found${NC}"
        return 1
    fi
    
    local backup_name="storage_backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}📦 Creating backup: ${backup_name}${NC}"
    
    if cp -r "$STORAGE_DIR" "$backup_name"; then
        echo -e "${GREEN}✅ Backup created successfully: ${backup_name}${NC}"
        echo -e "${BLUE}💡 To restore: rm -rf storage && mv ${backup_name} storage${NC}"
    else
        echo -e "${RED}❌ Backup failed${NC}"
        return 1
    fi
}

# Function to clear storage
clear_storage() {
    echo -e "${YELLOW}⚠️  This will permanently delete all archaeological discoveries!${NC}"
    echo -e "${RED}⚠️  This action cannot be undone!${NC}"
    echo ""
    read -p "Are you sure you want to clear all storage? (type 'DELETE' to confirm): " confirm
    
    if [ "$confirm" = "DELETE" ]; then
        echo -e "${YELLOW}🗑️  Clearing storage...${NC}"
        rm -rf "$STORAGE_DIR"/* 2>/dev/null || true
        echo -e "${GREEN}✅ Storage cleared${NC}"
    else
        echo -e "${BLUE}💡 Storage clearing cancelled${NC}"
    fi
}

# Function to export storage
export_storage() {
    if [ ! -d "$STORAGE_DIR" ]; then
        echo -e "${RED}❌ No storage directory found${NC}"
        return 1
    fi
    
    local export_name="archaeological_export_$(date +%Y%m%d_%H%M%S).tar.gz"
    echo -e "${BLUE}📤 Exporting storage to: ${export_name}${NC}"
    
    if tar -czf "$export_name" -C . "$STORAGE_DIR"; then
        echo -e "${GREEN}✅ Export created successfully: ${export_name}${NC}"
        echo -e "${BLUE}💡 To import: tar -xzf ${export_name}${NC}"
    else
        echo -e "${RED}❌ Export failed${NC}"
        return 1
    fi
}

# Function to show recent discoveries
show_recent() {
    if [ ! -f "$SITES_FILE" ]; then
        echo -e "${YELLOW}⚠️  No archaeological sites found${NC}"
        return
    fi
    
    echo -e "${GREEN}🏛️ Recent Archaeological Discoveries:${NC}"
    python3 -c "
import json
import sys
from datetime import datetime

try:
    with open('$SITES_FILE', 'r') as f:
        sites = json.load(f)
    
    # Sort by discovery date (newest first)
    sites.sort(key=lambda x: x.get('discovery_date', ''), reverse=True)
    
    # Show top 10
    for i, site in enumerate(sites[:10]):
        print(f\"   {i+1:2d}. {site.get('pattern_type', 'Unknown')} - Confidence: {site.get('confidence', 0)*100:.1f}%\")
        print(f\"       Location: {site.get('latitude', 0):.4f}, {site.get('longitude', 0):.4f}\")
        print(f\"       Date: {site.get('discovery_date', 'Unknown')[:10]}\")
        print()
        
except Exception as e:
    print(f'Error reading sites: {e}')
"
}

# Main menu
show_menu() {
    echo -e "${BLUE}🔧 Storage Management Options:${NC}"
    echo "   1. Show storage statistics"
    echo "   2. Show recent discoveries"
    echo "   3. Backup storage"
    echo "   4. Export storage"
    echo "   5. Clear storage (DANGEROUS)"
    echo "   6. Exit"
    echo ""
}

# Main execution
main() {
    # Ensure storage directory exists
    mkdir -p "$STORAGE_DIR"
    
    while true; do
        echo ""
        show_menu
        read -p "Select an option (1-6): " choice
        echo ""
        
        case $choice in
            1)
                get_storage_stats
                ;;
            2)
                show_recent
                ;;
            3)
                backup_storage
                ;;
            4)
                export_storage
                ;;
            5)
                clear_storage
                ;;
            6)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please select 1-6.${NC}"
                ;;
        esac
    done
}

# Run main function
main 