#!/usr/bin/env bash
# ==============================================================================
# Galgotias Drone Soccer League (GDSL 2026) - VPS Automated Deployment Script
# Supports: Ubuntu 22.04/24.04 LTS, Debian 11/12
# ==============================================================================

set -euo pipefail

BOLD="$(tput bold 2>/dev/null || echo '')"
GREEN="$(tput setaf 2 2>/dev/null || echo '')"
YELLOW="$(tput setaf 3 2>/dev/null || echo '')"
RED="$(tput setaf 1 2>/dev/null || echo '')"
RESET="$(tput sgr0 2>/dev/null || echo '')"

echo "${BOLD}${GREEN}====================================================================${RESET}"
echo "${BOLD}${GREEN}  GDSL 2026 Tournament Portal - VPS Production Deployer             ${RESET}"
echo "${BOLD}${GREEN}====================================================================${RESET}"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo -e "\n${YELLOW}==> 1. Checking Environment & System Dependencies...${RESET}"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION="$(node -v)"
    echo "    Node.js found: ${NODE_VERSION}"
else
    echo "${RED}Error: Node.js is not installed. Please install Node.js 20+ or 22+ before proceeding.${RESET}"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION="$(npm -v)"
    echo "    npm found: ${NPM_VERSION}"
else
    echo "${RED}Error: npm is not installed.${RESET}"
    exit 1
fi

echo -e "\n${YELLOW}==> 2. Ensuring Persistent Data Directory...${RESET}"
mkdir -p "$APP_DIR/data"
mkdir -p "$APP_DIR/logs"
chmod -R 775 "$APP_DIR/data"
echo "    Data directory ready at: $APP_DIR/data"

echo -e "\n${YELLOW}==> 3. Setting Up Environment File...${RESET}"
if [ ! -f "$APP_DIR/.env" ]; then
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env"
        echo "    Created .env from .env.example"
    else
        cat <<EOF > "$APP_DIR/.env"
NODE_ENV=production
PORT=3000
EOF
        echo "    Generated basic production .env"
    fi
else
    echo "    Existing .env found. Keeping current settings."
fi

echo -e "\n${YELLOW}==> 4. Installing Production & Build Dependencies...${RESET}"
npm install

echo -e "\n${YELLOW}==> 5. Building High-Performance Vite Production Frontend...${RESET}"
npm run build

echo -e "\n${YELLOW}==> 6. Managing Process Execution...${RESET}"
# Check if PM2 is available
if command -v pm2 >/dev/null 2>&1; then
    echo "    PM2 detected. Starting or reloading application..."
    if pm2 describe gdsl-portal >/dev/null 2>&1; then
        pm2 reload ecosystem.config.cjs --env production
    else
        pm2 start ecosystem.config.cjs --env production
    fi
    pm2 save
    echo "${GREEN}    PM2 process 'gdsl-portal' is active!${RESET}"
elif command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    echo "    Docker Compose detected. Rebuilding container in background..."
    docker-compose up -d --build
    echo "${GREEN}    Docker container 'gdsl_portal_app' is active!${RESET}"
else
    echo "${YELLOW}    Notice: Neither PM2 nor Docker Compose was found globally.${RESET}"
    echo "    To run with PM2, install it via: npm install -g pm2"
    echo "    Or test directly using: npm start"
fi

echo -e "\n${YELLOW}==> 7. Verifying Application Health Status...${RESET}"
sleep 2
if command -v curl >/dev/null 2>&1; then
    HEALTH_RESP="$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "failed")"
    if [ "$HEALTH_RESP" = "200" ]; then
        echo "${GREEN}    Health check passed! HTTP 200 OK from http://localhost:3000/api/health${RESET}"
    else
        echo "${YELLOW}    Health check returned status: $HEALTH_RESP (application might still be booting)${RESET}"
    fi
fi

echo -e "\n${BOLD}${GREEN}====================================================================${RESET}"
echo "${BOLD}${GREEN}  Deployment Completed Successfully!                                ${RESET}"
echo "${BOLD}${GREEN}====================================================================${RESET}"
echo "  - Local URL:         http://localhost:3000"
echo "  - Health Check:      http://localhost:3000/api/health"
echo "  - Persistent Data:   $APP_DIR/data/"
echo "  - Excel Sheet Roster: $APP_DIR/data/GDSL_2026_Teams_Roster.xlsx"
echo "  - For Nginx Setup:   See $APP_DIR/nginx.conf and $APP_DIR/VPS_DEPLOYMENT.md"
echo ""
