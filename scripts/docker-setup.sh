#!/bin/bash

# Colors of Life - Docker Quick Setup Script
# This script sets up the complete Docker development environment

set -e  # Exit on any error

echo "🎨 Colors of Life - Docker Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   https://docs.docker.com/desktop/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Desktop first:"
    echo "   https://docs.docker.com/desktop/"
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check for required files
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Make sure you're in the project root."
    exit 1
fi

if [ ! -f "database-schema.sql" ]; then
    echo "❌ database-schema.sql not found. Make sure you're in the project root."
    exit 1
fi

echo "✅ Required files found"

# Prompt for fal.ai API key
echo ""
echo "🔑 API Key Setup"
echo "----------------"
read -p "Enter your fal.ai API key (or press Enter to skip): " FAL_KEY

if [ ! -z "$FAL_KEY" ]; then
    # Update docker-compose.yml with the API key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-fal-ai-api-key-here/$FAL_KEY/g" docker-compose.yml
    else
        # Linux
        sed -i "s/your-fal-ai-api-key-here/$FAL_KEY/g" docker-compose.yml
    fi
    echo "✅ API key configured"
else
    echo "⚠️  Skipping API key setup - you can add it later in docker-compose.yml"
fi

# Check for port conflicts
echo ""
echo "🔍 Checking for port conflicts..."
PORTS=(3000 5678 8000 5432 9000)
CONFLICTS=()

for port in "${PORTS[@]}"; do
    if lsof -i :$port &> /dev/null; then
        CONFLICTS+=($port)
    fi
done

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    echo "⚠️  Port conflicts detected on: ${CONFLICTS[*]}"
    echo "   Please stop services using these ports or they will conflict with Docker."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please free up the conflicting ports and try again."
        exit 1
    fi
else
    echo "✅ No port conflicts detected"
fi

# Start Docker services
echo ""
echo "🚀 Starting Docker services..."
echo "This may take a few minutes on first run..."

docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

# Verify key services are responding
echo ""
echo "🔍 Verifying services..."

# Check Supabase API
if curl -s http://localhost:8000/rest/v1/ &> /dev/null; then
    echo "✅ Supabase API is responding"
else
    echo "⚠️  Supabase API not ready yet (may need more time)"
fi

# Check n8n
if curl -s http://localhost:5678 &> /dev/null; then
    echo "✅ n8n is responding"
else
    echo "⚠️  n8n not ready yet (may need more time)"
fi

# Check Supabase Studio
if curl -s http://localhost:3000 &> /dev/null; then
    echo "✅ Supabase Studio is responding"
else
    echo "⚠️  Supabase Studio not ready yet (may need more time)"
fi

echo ""
echo "🎉 Docker setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Supabase Studio: http://localhost:3000"
echo "2. Create storage buckets: user-uploads, avatars, try-on-results"
echo "3. Open n8n: http://localhost:5678 (admin/password123)"
echo "4. Import your n8n workflows"
echo "5. Update your React Native app to use Docker URLs"
echo ""
echo "📚 For detailed instructions, see DOCKER_SETUP_GUIDE.md"
echo ""
echo "🛠️  Useful commands:"
echo "   docker-compose logs -f     # View all logs"
echo "   docker-compose down        # Stop all services"
echo "   docker-compose restart n8n # Restart n8n"
echo ""
echo "🎨 Happy coding with Colors of Life!" 