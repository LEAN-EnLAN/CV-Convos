#!/bin/bash

# --- CONFIGURATION ---
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting CV-ConVos Full Stack Kickstart...${NC}"

# 1. Start Convex (Optional if running separately)
# echo -e "${BLUE}📦 Starting Convex...${NC}"
# cd $FRONTEND_DIR
# npx convex dev &
# CONVEX_PID=$!
# cd ..

# 2. Start Frontend
echo -e "${GREEN}💻 Starting Frontend on http://localhost:3000...${NC}"
cd $FRONTEND_DIR
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${BLUE}✨ Frontend service launching!${NC}"
echo -e "${BLUE}ℹ️  Make sure to run 'npx convex dev' in another terminal if not running.${NC}"
echo -e "Frontend PID: $FRONTEND_PID"
echo -e "\n${BLUE}Para detener, presiona CTRL+C${NC}"

# Trap CTRL+C
trap "kill $FRONTEND_PID; exit" INT

# Wait for processes
wait
