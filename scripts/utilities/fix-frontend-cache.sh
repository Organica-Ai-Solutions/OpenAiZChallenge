#!/bin/bash

# Frontend Cache Fix Script for NIS Protocol
# This script completely cleans and fixes frontend cache issues

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Fixing Frontend Cache Issues...${NC}"

# Navigate to project root
cd "$(dirname "$0")/../.."

# Stop any running frontend processes
echo -e "${YELLOW}📛 Stopping frontend processes...${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Navigate to frontend directory
cd frontend

echo -e "${YELLOW}🗑️  Removing all cache directories...${NC}"

# Remove Next.js cache completely
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next 2>/dev/null || {
        # If direct removal fails, try alternative methods
        find .next -type f -delete 2>/dev/null || true
        find .next -type d -empty -delete 2>/dev/null || true
        rm -rf .next 2>/dev/null || true
    }
fi

# Remove node_modules cache
if [ -d "node_modules/.cache" ]; then
    echo "Removing node_modules cache..."
    rm -rf node_modules/.cache 2>/dev/null || true
fi

# Remove pnpm cache
if [ -d "node_modules/.pnpm" ]; then
    echo "Removing pnpm cache..."
    rm -rf node_modules/.pnpm 2>/dev/null || true
fi

# Remove lock files
echo -e "${YELLOW}🔓 Removing lock files...${NC}"
rm -f package-lock.json 2>/dev/null || true
rm -f pnpm-lock.yaml 2>/dev/null || true
rm -f yarn.lock 2>/dev/null || true

# Clear npm cache
echo -e "${YELLOW}🧼 Clearing npm cache...${NC}"
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null || true
fi

# Clear pnpm cache
if command -v pnpm &> /dev/null; then
    pnpm store prune 2>/dev/null || true
fi

# Reinstall dependencies
echo -e "${BLUE}📦 Reinstalling dependencies...${NC}"

# Function to get npm command (Windows compatibility)
get_npm_cmd() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "npm.cmd"
    else
        echo "npm"
    fi
}

NPM_CMD=$(get_npm_cmd)

# Install with clean slate
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install --force --no-cache
elif command -v $NPM_CMD &> /dev/null; then
    echo "Using npm..."
    $NPM_CMD install --force --no-cache
else
    echo -e "${RED}❌ No package manager found${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p .next/cache
mkdir -p .next/server
mkdir -p .next/static
chmod -R 755 .next 2>/dev/null || true

# Clear browser caches (if running in development)
echo -e "${BLUE}🌐 Preparing browser cache cleanup...${NC}"

# Create a simple cache clearing component if it doesn't exist
if [ ! -f "components/CacheCleaner.tsx" ]; then
    cat > components/CacheCleaner.tsx << 'EOF'
'use client';

import { useEffect } from 'react';

export default function CacheCleaner() {
  useEffect(() => {
    // Clear all possible browser caches
    if (typeof window !== 'undefined') {
      // Clear localStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log('Storage clear failed:', e);
      }

      // Clear service worker caches
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }

      // Clear cache storage
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }

      console.log('✅ Browser caches cleared');
    }
  }, []);

  return null;
}
EOF
fi

echo -e "${GREEN}✅ Frontend cache cleanup complete!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   1. Start the frontend: ${YELLOW}npm run dev${NC}"
echo -e "   2. If issues persist, restart your browser"
echo -e "   3. Clear browser cache manually (Ctrl+Shift+R)"

echo -e "${GREEN}🚀 Ready to start frontend development server${NC}" 