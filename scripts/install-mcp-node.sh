#!/bin/bash

echo "🚀 Installing n8n-nodes-mcp manually..."

# Stop n8n container
docker-compose down

# Install the MCP node in n8n's node_modules
docker run --rm -v ~/.n8n:/home/node/.n8n n8nio/n8n:latest \
  npm install n8n-nodes-mcp

# Restart n8n
docker-compose up -d

echo "✅ MCP node installed! Check n8n at http://localhost:5678"
echo "📝 You should see 'MCP Client' in your node palette now" 