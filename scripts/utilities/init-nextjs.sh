#!/bin/bash

# Next.js Initialization Script
# This script properly initializes Next.js with all required files

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Initializing Next.js properly...${NC}"

# Navigate to frontend directory
cd "$(dirname "$0")/../../frontend"

# Stop any running processes
echo -e "${YELLOW}📛 Stopping existing processes...${NC}"
# For Windows Git Bash, use taskkill
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    taskkill //F //IM node.exe 2>/dev/null || true
else
    pkill -f "next dev" 2>/dev/null || true
fi

# Clean up .next directory
echo -e "${YELLOW}🧹 Cleaning .next directory...${NC}"
rm -rf .next 2>/dev/null || true

# Create .next directory structure
echo -e "${BLUE}📁 Creating .next directory structure...${NC}"
mkdir -p .next/cache/webpack/{client,server}-development
mkdir -p .next/server
mkdir -p .next/static
mkdir -p .next/types

# Create required manifest files
echo -e "${BLUE}📄 Creating manifest files...${NC}"

# middleware-manifest.json
cat > .next/server/middleware-manifest.json << 'EOF'
{
  "sortedMiddleware": [],
  "middleware": {},
  "functions": {},
  "version": 2
}
EOF

# app-paths-manifest.json
cat > .next/server/app-paths-manifest.json << 'EOF'
{}
EOF

# pages-manifest.json
cat > .next/server/pages-manifest.json << 'EOF'
{}
EOF

# Create build manifest
cat > .next/build-manifest.json << 'EOF'
{
  "devFiles": [],
  "ampDevFiles": [],
  "polyfillFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {},
  "ampFirstPages": []
}
EOF

# Create prerender manifest
cat > .next/prerender-manifest.json << 'EOF'
{
  "version": 4,
  "routes": {},
  "dynamicRoutes": {},
  "notFoundRoutes": [],
  "preview": {
    "previewModeId": "development-preview-mode",
    "previewModeSigningKey": "development-preview-signing-key",
    "previewModeEncryptionKey": "development-preview-encryption-key"
  }
}
EOF

# Create routes manifest
cat > .next/routes-manifest.json << 'EOF'
{
  "version": 3,
  "pages404": true,
  "basePath": "",
  "redirects": [],
  "rewrites": [],
  "headers": [],
  "staticRoutes": [],
  "dynamicRoutes": [],
  "dataRoutes": [],
  "i18n": null
}
EOF

# Set proper permissions
chmod -R 755 .next 2>/dev/null || true

echo -e "${GREEN}✅ Next.js initialization complete!${NC}"
echo -e "${BLUE}💡 Ready to start development server${NC}" 