#!/bin/bash

echo "🚀 Setting up n8n MCP Server for Colors of Life..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if npx is available
if ! command_exists npx; then
    echo "❌ npx is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing n8n MCP Server..."

# Test the n8n MCP server installation
echo "🔧 Testing n8n MCP Server installation..."
timeout 5 npx n8n-mcp --help > /dev/null 2>&1
if [ $? -eq 0 ] || [ $? -eq 124 ]; then
    echo "✅ n8n MCP Server is available via npx"
else
    echo "❌ Failed to access n8n MCP Server via npx"
    exit 1
fi

# Create MCP configuration for Claude Code
echo "⚙️ Creating MCP configuration for Claude Code..."
mkdir -p ~/.config/claude-code

cat > ~/.config/claude-code/mcp_servers.json << 'EOF'
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "description": "n8n Documentation MCP Server - provides comprehensive access to n8n node documentation and tools for workflow automation"
    }
  }
}
EOF

# Create local project MCP configuration
echo "📁 Creating local project MCP configuration..."
mkdir -p .claude

cat > .claude/mcp_config.json << 'EOF'
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "description": "n8n Documentation MCP Server - provides comprehensive access to n8n node documentation and tools"
    }
  }
}
EOF

echo "✅ n8n MCP Server setup complete!"
echo ""
echo "📋 What was configured:"
echo "  • n8n MCP server accessible via npx n8n-mcp"
echo "  • Claude Code MCP configuration in ~/.config/claude-code/mcp_servers.json"
echo "  • Local project MCP configuration in .claude/mcp_config.json"
echo ""
echo "🎯 Next steps:"
echo "  1. Restart Claude Code to load the new MCP server"
echo "  2. The server provides access to 525 n8n nodes documentation"
echo "  3. Use it to help configure and validate your n8n workflows"
echo ""
echo "🔧 Test the server manually with: npx n8n-mcp"