#!/bin/bash

# Stock Screener Pro - Local Development Setup Script

set -e  # Exit on error

echo "🚀 Starting Stock Screener Pro Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js..."
node_version=$(node -v)
echo "${GREEN}✓ Node.js ${node_version}${NC}"

# Check npm version
echo "📦 Checking npm..."
npm_version=$(npm -v)
echo "${GREEN}✓ npm ${npm_version}${NC}"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo "🐳 Docker is installed"
    docker_version=$(docker -v)
    echo "${GREEN}✓ ${docker_version}${NC}"
fi

# Ask user for setup method
echo ""
echo "${YELLOW}Choose setup method:${NC}"
echo "1) Docker Compose (recommended)"
echo "2) Manual setup"
read -p "Enter choice (1 or 2): " setup_choice

if [ "$setup_choice" == "1" ]; then
    echo ""
    echo "${YELLOW}Starting Docker Compose setup...${NC}"
    
    # Check if Docker is running
    if ! docker ps &> /dev/null; then
        echo "${RED}✗ Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    
    # Start services
    echo "🐳 Starting services..."
    docker-compose up -d
    
    echo "${GREEN}✓ Services started!${NC}"
    echo ""
    echo "URLs:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:5000"
    echo "  MongoDB:   mongodb://admin:password123@localhost:27017"
    echo ""
    echo "Test credentials:"
    echo "  Email:    test@example.com"
    echo "  Password: password123"
    echo ""
    echo "View logs: docker-compose logs -f"
    
elif [ "$setup_choice" == "2" ]; then
    echo ""
    echo "${YELLOW}Starting manual setup...${NC}"
    
    # Backend setup
    echo ""
    echo "📦 Setting up backend..."
    cd backend
    npm install
    
    # Create .env if not exists
    if [ ! -f .env ]; then
        echo "📝 Creating .env from template..."
        cp .env.example .env
        echo "${YELLOW}Please update backend/.env with your MongoDB URI${NC}"
    fi
    
    cd ..
    
    # Frontend setup
    echo ""
    echo "📦 Setting up frontend..."
    npm install
    
    # Create .env.local if not exists
    if [ ! -f .env.local ]; then
        echo "📝 Creating .env.local from template..."
        cp .env.example .env.local
    fi
    
    echo ""
    echo "${GREEN}✓ Setup complete!${NC}"
    echo ""
    echo "To start development:"
    echo ""
    echo "Terminal 1 - Backend:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    echo "Terminal 2 - Frontend:"
    echo "  npm run dev"
    echo ""
    echo "Then open http://localhost:3000"
    
else
    echo "${RED}Invalid choice${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✅ Setup complete! Happy coding! 🎉${NC}"
