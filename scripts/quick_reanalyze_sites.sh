#!/bin/bash

# Quick Site Re-Analysis Script
# Re-analyzes all archaeological sites using the comprehensive storage system

echo "🏛️ ═══════════════════════════════════════════════════════════════ 🏛️"
echo "🔄              QUICK SITE RE-ANALYSIS                            🔄"
echo "🏛️ ═══════════════════════════════════════════════════════════════ 🏛️"
echo ""
echo "🚀 Re-analyzing all archaeological sites with storage integration..."
echo ""

# Check if storage backend is running
echo "🔍 Checking storage backend status..."
if curl -s --max-time 5 "http://localhost:8004/health" >/dev/null 2>&1; then
    echo "✅ Storage Backend: ONLINE"
else
    echo "❌ Storage Backend: OFFLINE"
    echo ""
    echo "🚀 Starting storage backend..."
    if [ -f "simple_storage_backend.py" ]; then
        python simple_storage_backend.py &
        STORAGE_PID=$!
        echo "Storage backend started with PID: $STORAGE_PID"
        sleep 3
        
        if curl -s --max-time 5 "http://localhost:8004/health" >/dev/null 2>&1; then
            echo "✅ Storage Backend: NOW ONLINE"
        else
            echo "❌ Failed to start storage backend"
            exit 1
        fi
    else
        echo "❌ simple_storage_backend.py not found"
        exit 1
    fi
fi

# Check if other backends are running
echo ""
echo "🔍 Checking other backend services..."

backends=(
    "Fallback Backend:http://localhost:8003/system/health"
    "Main Backend:http://localhost:8000/system/health"
)

all_online=true
for backend_info in "${backends[@]}"; do
    backend_name="${backend_info%%:*}"
    backend_url="${backend_info#*:}"
    
    if curl -s --max-time 5 "$backend_url" >/dev/null 2>&1; then
        echo "✅ $backend_name: ONLINE"
    else
        echo "⚠️  $backend_name: OFFLINE (analysis may be limited)"
        all_online=false
    fi
done

if [ "$all_online" = false ]; then
    echo ""
    echo "⚠️  Some backends are offline. For full functionality, run:"
    echo "   ./start.sh"
    echo ""
    read -p "Continue with limited functionality? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run the re-analysis
echo ""
echo "🏛️ Starting comprehensive site re-analysis..."
echo "🔄 This will analyze all sites and store high-confidence results..."
echo ""

if [ -f "scripts/reanalyze_all_sites.js" ]; then
    if command -v node &> /dev/null; then
        node scripts/reanalyze_all_sites.js
        echo ""
        echo "✅ Site re-analysis completed!"
        echo ""
        echo "📊 Check results at:"
        echo "   • Storage Stats: http://localhost:8004/storage/stats"
        echo "   • All Analyses: http://localhost:8004/storage/list"
        echo "   • High Confidence: http://localhost:8004/storage/high-confidence"
        echo "   • Archaeological Sites: http://localhost:8004/storage/sites"
        echo ""
        echo "🌐 View in frontend: http://localhost:3000"
    else
        echo "❌ Node.js not found. Please install Node.js to run site re-analysis."
        exit 1
    fi
else
    echo "❌ Site re-analysis script not found: scripts/reanalyze_all_sites.js"
    exit 1
fi

echo ""
echo "🏛️ ═══════════════════════════════════════════════════════════════ 🏛️"
echo "✅                 QUICK RE-ANALYSIS COMPLETE!                   ✅"
echo "🏛️ ═══════════════════════════════════════════════════════════════ 🏛️" 