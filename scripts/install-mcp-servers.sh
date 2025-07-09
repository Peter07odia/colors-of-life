#!/bin/bash

echo "🚀 Installing MCP Servers for Colors of Life Fashion App..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing Essential MCP Servers..."

# Install Brave Search MCP Server (for fashion search)
echo "🔍 Installing Brave Search MCP Server..."
npm install -g @modelcontextprotocol/server-brave-search

# Install Filesystem MCP Server (for file operations)
echo "📁 Installing Filesystem MCP Server..."
npm install -g @modelcontextprotocol/server-filesystem

# Install Puppeteer MCP Server (for web automation & scraping)
echo "🤖 Installing Puppeteer MCP Server..."
npm install -g @modelcontextprotocol/server-puppeteer

# Install GitHub MCP Server (for code management)
echo "🐙 Installing GitHub MCP Server..."
npm install -g @modelcontextprotocol/server-github

# Install Google Maps MCP Server (for location services)
echo "🗺️ Installing Google Maps MCP Server..."
npm install -g @modelcontextprotocol/server-google-maps

# Install Memory MCP Server (for AI memory/context)
echo "🧠 Installing Memory MCP Server..."
npm install -g @modelcontextprotocol/server-memory

echo "✅ All MCP Servers installed successfully!"
echo ""
echo "📋 Installed MCP Servers:"
echo "  • Brave Search - Fashion item search across the web"
echo "  • Filesystem - File operations for images and data"
echo "  • Puppeteer - Web scraping and automation"
echo "  • GitHub - Code and workflow management"
echo "  • Google Maps - Location-based fashion recommendations"
echo "  • Memory - AI context and user preference memory"
echo ""
echo "🎯 Next: Configure MCP Client credentials in n8n"

# For Replicate integration, we'll use direct API calls instead of MCP server
echo ""
echo "📝 Note: Replicate integration will be done via direct API calls in workflows"
echo "    (No MCP server needed - we'll use HTTP Request nodes)" 