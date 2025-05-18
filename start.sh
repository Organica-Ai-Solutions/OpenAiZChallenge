#!/bin/bash

# ANSI Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Archaeological Discovery Animation
function archaeological_animation() {
    clear
    echo -e "${GREEN}🌿 NIS Protocol: Neural-Inspired Archaeological Discovery System 🌿${RESET}"
    echo ""
    
    # Simulated archaeological dig animation
    for i in {1..3}; do
        echo -e "${YELLOW}🏺 Excavating layer $i...${RESET}"
        sleep 0.5
        echo -e "${BLUE}📡 Scanning terrain with LIDAR...${RESET}"
        sleep 0.5
        echo -e "${CYAN}🧭 Analyzing historical data...${RESET}"
        sleep 0.5
    done
    
    echo -e "\n${GREEN}🌍 Discovering Hidden Histories ${RESET}"
    sleep 1
}

# NIS Protocol Startup Banner
function nis_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║  禪  NEURAL-INSPIRED SYSTEM PROTOCOL  智                          ║
║                                                                   ║
║   🧠 Multi-Agent Intelligence | 🛰️ Geospatial Reasoning          ║
║   📜 Interpreting Ancient History with Modern AI                 ║
║   🐉 Inspired by the wisdom of the past — built for the future   ║
║                                                                   ║
║   📍 Amazon Rainforest | 🌏 Global Archaeology | 🤖 GPT-4.1       ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${RESET}"
}

# Main Startup Function
function startup_nis_protocol() {
    # Display Banner
    nis_banner
    
    # Startup Animation
    archaeological_animation
    
    # Setup Virtual Environment
    echo -e "${YELLOW}🔧 Setting up virtual environment...${RESET}"
    python3 -m venv venv
    source venv/bin/activate
    
    # Install Dependencies
    echo -e "${BLUE}📦 Installing Python dependencies...${RESET}"
    pip install -r requirements.txt
    
    # Start Backend
    echo -e "${CYAN}🌐 Launching Backend API...${RESET}"
    python run_api.py &
    BACKEND_PID=$!
    
    # Start Frontend
    echo -e "${GREEN}🖥️ Starting Frontend Development Server...${RESET}"
    cd frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait and Show Access Information
    sleep 5
    echo -e "\n${YELLOW}🚀 NIS Protocol is now LIVE!${RESET}"
    echo -e "Backend: ${BLUE}http://localhost:8000${RESET}"
    echo -e "Frontend: ${GREEN}http://localhost:3000${RESET}"
    
    # Trap to ensure clean shutdown
    trap 'kill $BACKEND_PID $FRONTEND_PID' SIGINT SIGTERM
    wait
}

# Run Startup
startup_nis_protocol 