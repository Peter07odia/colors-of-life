#!/bin/bash

# Colors of Life - Workflow Import Script
# Imports all workflow JSON files into n8n

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
WORKFLOWS_DIR="./n8n-workflows"
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASSWORD="password123"

# Check if n8n is running
check_n8n_status() {
    log_info "Checking n8n status..."
    
    if ! docker ps | grep -q colorsoflife-n8n; then
        log_error "n8n container is not running!"
        log_info "Starting n8n container..."
        docker-compose up -d n8n
        sleep 15
    fi
    
    # Wait for n8n to be ready
    log_info "Waiting for n8n to be ready..."
    for i in {1..30}; do
        if curl -s "$N8N_URL/healthz" > /dev/null 2>&1; then
            log_success "n8n is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    log_error "n8n is not responding after 60 seconds"
    exit 1
}

# Import workflows using n8n API
import_workflow_via_api() {
    local workflow_file="$1"
    local workflow_name=$(basename "$workflow_file" .json)
    
    log_info "Importing workflow: $workflow_name"
    
    # Read workflow JSON
    local workflow_data=$(cat "$workflow_file")
    
    # Import via API
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -u "$N8N_USER:$N8N_PASSWORD" \
        -d "$workflow_data" \
        "$N8N_URL/api/v1/workflows" 2>/dev/null)
    
    if echo "$response" | grep -q '"id"'; then
        log_success "Successfully imported: $workflow_name"
        return 0
    else
        log_warning "Failed to import: $workflow_name"
        echo "Response: $response"
        return 1
    fi
}

# Import workflows using n8n CLI (alternative method)
import_workflow_via_cli() {
    local workflow_file="$1"
    local workflow_name=$(basename "$workflow_file")
    
    log_info "Importing workflow via CLI: $workflow_name"
    
    # Copy file to container and import
    docker cp "$workflow_file" colorsoflife-n8n:/tmp/
    
    local result=$(docker exec colorsoflife-n8n n8n import:workflow --input="/tmp/$workflow_name" 2>&1)
    
    if echo "$result" | grep -q "Successfully imported"; then
        log_success "Successfully imported: $workflow_name"
        return 0
    else
        log_warning "Failed to import: $workflow_name"
        echo "Result: $result"
        return 1
    fi
}

# Main import function
import_all_workflows() {
    log_info "Starting workflow import process..."
    
    if [ ! -d "$WORKFLOWS_DIR" ]; then
        log_error "Workflows directory not found: $WORKFLOWS_DIR"
        exit 1
    fi
    
    local success_count=0
    local total_count=0
    
    # Import each JSON file
    for workflow_file in "$WORKFLOWS_DIR"/*.json; do
        if [ -f "$workflow_file" ]; then
            total_count=$((total_count + 1))
            
            # Try API method first, then CLI method
            if import_workflow_via_api "$workflow_file"; then
                success_count=$((success_count + 1))
            elif import_workflow_via_cli "$workflow_file"; then
                success_count=$((success_count + 1))
            fi
        fi
    done
    
    log_info "Import completed: $success_count/$total_count workflows imported successfully"
    
    if [ $success_count -eq $total_count ]; then
        log_success "All workflows imported successfully!"
    else
        log_warning "Some workflows failed to import. Check the logs above."
    fi
}

# Show available workflows
show_workflows() {
    log_info "Available workflow files:"
    if [ -d "$WORKFLOWS_DIR" ]; then
        ls -la "$WORKFLOWS_DIR"/*.json 2>/dev/null || log_warning "No JSON files found"
    else
        log_error "Workflows directory not found"
    fi
}

# Main script
case "$1" in
    "import")
        check_n8n_status
        import_all_workflows
        ;;
    "list")
        show_workflows
        ;;
    "status")
        check_n8n_status
        ;;
    *)
        echo "Usage: $0 {import|list|status}"
        echo ""
        echo "Commands:"
        echo "  import  - Import all workflow JSON files into n8n"
        echo "  list    - Show available workflow files"
        echo "  status  - Check n8n status"
        ;;
esac 