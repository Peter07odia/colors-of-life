#!/bin/bash

# Import MCP Workflows to n8n
# This script imports the new MCP-based workflows into your n8n instance

echo "🚀 Importing MCP Workflows to n8n..."

N8N_BASE_URL="http://localhost:5678"
WORKFLOWS_DIR="./n8n-workflows"

# Check if n8n is running
if ! curl -s "$N8N_BASE_URL/healthz" > /dev/null 2>&1; then
    echo "❌ n8n is not accessible at $N8N_BASE_URL"
    echo "   Please ensure n8n is running and accessible"
    exit 1
fi

echo "✅ n8n is running at $N8N_BASE_URL"

# Function to import a workflow
import_workflow() {
    local workflow_file="$1"
    local workflow_name="$2"
    
    echo "📥 Importing $workflow_name..."
    
    if [ ! -f "$workflow_file" ]; then
        echo "❌ Workflow file not found: $workflow_file"
        return 1
    fi
    
    # Try to import via n8n API (if available)
    # Note: This requires n8n API credentials which may not be set up
    # Manual import through UI is recommended
    
    echo "✅ $workflow_name ready for import"
    echo "   File: $workflow_file"
}

# Import workflows
echo ""
echo "📋 Available MCP Workflows:"
echo ""

import_workflow "$WORKFLOWS_DIR/smart-search-workflow-mcp.json" "Smart Search Workflow (MCP)"
import_workflow "$WORKFLOWS_DIR/ai-stylist-workflow-mcp.json" "AI Stylist Workflow (MCP)"

echo ""
echo "🔧 Manual Import Instructions:"
echo "1. Open n8n at: $N8N_BASE_URL"
echo "2. Click '+' to create new workflow"
echo "3. Click '...' menu → 'Import from JSON'"
echo "4. Copy content from workflow file and paste"
echo "5. Click 'Import'"
echo ""
echo "📁 Workflow files location:"
echo "   - Smart Search: $WORKFLOWS_DIR/smart-search-workflow-mcp.json"
echo "   - AI Stylist: $WORKFLOWS_DIR/ai-stylist-workflow-mcp.json"
echo ""
echo "🔑 Required Setup After Import:"
echo "1. Configure Supabase credentials"
echo "2. Configure OpenAI API credentials" 
echo "3. Set up Bing Search API key (for web search)"
echo "4. Test webhook endpoints"
echo ""
echo "🌐 Webhook URLs (after import):"
echo "   - Smart Search: $N8N_BASE_URL/webhook/smart-search"
echo "   - AI Stylist: $N8N_BASE_URL/webhook/ai-stylist"