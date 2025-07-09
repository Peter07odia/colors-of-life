#!/bin/bash

# Colors of Life - Workflow Repair Script
# Repairs and validates workflow JSON files for proper n8n import

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

WORKFLOWS_DIR="./n8n-workflows"
REPAIRED_DIR="./n8n-workflows-repaired"

# Create repaired workflows directory
mkdir -p "$REPAIRED_DIR"

# Repair a single workflow file
repair_workflow() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local output_file="$REPAIRED_DIR/$filename"
    
    log_info "Repairing workflow: $filename"
    
    # Check if file is valid JSON
    if ! jq empty "$input_file" 2>/dev/null; then
        log_error "Invalid JSON in $filename"
        return 1
    fi
    
    # Read the workflow
    local workflow_data=$(cat "$input_file")
    
    # Extract workflow name from filename (remove .json extension)
    local workflow_name=$(basename "$filename" .json)
    
    # Create a properly formatted workflow
    cat > "$output_file" << EOF
{
  "name": "$workflow_name",
  "nodes": $(echo "$workflow_data" | jq '.nodes // []'),
  "connections": $(echo "$workflow_data" | jq '.connections // {}'),
  "active": false,
  "settings": $(echo "$workflow_data" | jq '.settings // {}'),
  "staticData": $(echo "$workflow_data" | jq '.staticData // {}'),
  "tags": $(echo "$workflow_data" | jq '.tags // []'),
  "triggerCount": $(echo "$workflow_data" | jq '.triggerCount // 0'),
  "meta": $(echo "$workflow_data" | jq '.meta // {}'),
  "pinData": $(echo "$workflow_data" | jq '.pinData // {}'),
  "versionId": $(echo "$workflow_data" | jq '.versionId // "1"')
}
EOF
    
    # Validate the repaired workflow
    if jq empty "$output_file" 2>/dev/null; then
        log_success "Repaired: $filename"
        return 0
    else
        log_error "Failed to repair: $filename"
        rm -f "$output_file"
        return 1
    fi
}

# Repair all workflows
repair_all_workflows() {
    log_info "Starting workflow repair process..."
    
    if [ ! -d "$WORKFLOWS_DIR" ]; then
        log_error "Workflows directory not found: $WORKFLOWS_DIR"
        exit 1
    fi
    
    local success_count=0
    local total_count=0
    
    for workflow_file in "$WORKFLOWS_DIR"/*.json; do
        if [ -f "$workflow_file" ]; then
            total_count=$((total_count + 1))
            if repair_workflow "$workflow_file"; then
                success_count=$((success_count + 1))
            fi
        fi
    done
    
    log_info "Repair completed: $success_count/$total_count workflows repaired successfully"
    
    if [ $success_count -gt 0 ]; then
        log_success "Repaired workflows are in: $REPAIRED_DIR"
        log_info "You can now import them manually through the n8n UI at http://localhost:5678"
    fi
}

# Manual import instructions
show_manual_import_instructions() {
    echo ""
    log_info "Manual Import Instructions:"
    echo "1. Open n8n in your browser: http://localhost:5678"
    echo "2. Login with username: admin, password: password123"
    echo "3. Click the '+' button to create a new workflow"
    echo "4. Click the '...' menu in the top right"
    echo "5. Select 'Import from file'"
    echo "6. Choose files from: $REPAIRED_DIR"
    echo "7. Import each workflow one by one"
    echo ""
    log_warning "Note: You may need to reconfigure credentials and connections after import"
}

# Main script
case "$1" in
    "repair")
        repair_all_workflows
        show_manual_import_instructions
        ;;
    "clean")
        log_info "Cleaning repaired workflows directory..."
        rm -rf "$REPAIRED_DIR"
        log_success "Cleaned: $REPAIRED_DIR"
        ;;
    *)
        echo "Usage: $0 {repair|clean}"
        echo ""
        echo "Commands:"
        echo "  repair  - Repair all workflow JSON files"
        echo "  clean   - Clean repaired workflows directory"
        ;;
esac 