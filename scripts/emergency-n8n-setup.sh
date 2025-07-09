#!/bin/bash

# Emergency n8n Setup Script
# This script will manually set up n8n with your workflows and create bulletproof backups

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
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASSWORD="password123"
WORKFLOWS_DIR="./n8n-workflows-repaired"
BACKUP_DIR="./backups/n8n-manual"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to wait for n8n to be ready
wait_for_n8n() {
    log_info "Waiting for n8n to be ready..."
    for i in {1..60}; do
        if curl -s "$N8N_URL/healthz" > /dev/null 2>&1; then
            log_success "n8n is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    log_error "n8n is not responding after 120 seconds"
    return 1
}

# Function to create a user account
create_n8n_user() {
    log_info "Setting up n8n user account..."
    
    # Try to create user via API
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@colorsoflife.com",
            "firstName": "Admin",
            "lastName": "User",
            "password": "'$N8N_PASSWORD'"
        }' \
        "$N8N_URL/api/v1/owner/setup" 2>/dev/null || echo "")
    
    if echo "$response" | grep -q '"id"'; then
        log_success "User account created successfully"
    else
        log_info "User account may already exist or setup not needed"
    fi
}

# Function to get authentication token
get_auth_token() {
    log_info "Getting authentication token..."
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@colorsoflife.com",
            "password": "'$N8N_PASSWORD'"
        }' \
        "$N8N_URL/api/v1/login" 2>/dev/null || echo "")
    
    if echo "$response" | grep -q '"token"'; then
        echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
    else
        log_warning "Could not get auth token, trying basic auth"
        echo ""
    fi
}

# Function to import a single workflow
import_workflow() {
    local workflow_file="$1"
    local auth_token="$2"
    local workflow_name=$(basename "$workflow_file" .json)
    
    log_info "Importing workflow: $workflow_name"
    
    if [ ! -f "$workflow_file" ]; then
        log_error "Workflow file not found: $workflow_file"
        return 1
    fi
    
    # Read and prepare workflow data
    local workflow_data=$(cat "$workflow_file")
    
    # Try with token auth first, then basic auth
    local response=""
    if [ -n "$auth_token" ]; then
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $auth_token" \
            -d "$workflow_data" \
            "$N8N_URL/api/v1/workflows" 2>/dev/null || echo "")
    fi
    
    if [ -z "$response" ] || ! echo "$response" | grep -q '"id"'; then
        # Try basic auth
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -u "$N8N_USER:$N8N_PASSWORD" \
            -d "$workflow_data" \
            "$N8N_URL/api/v1/workflows" 2>/dev/null || echo "")
    fi
    
    if echo "$response" | grep -q '"id"'; then
        log_success "Successfully imported: $workflow_name"
        return 0
    else
        log_warning "Failed to import: $workflow_name"
        echo "Response: $response"
        return 1
    fi
}

# Function to export all workflows
export_workflows() {
    log_info "Exporting all workflows for backup..."
    
    local auth_token=$(get_auth_token)
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local export_dir="$BACKUP_DIR/export_$timestamp"
    
    mkdir -p "$export_dir"
    
    # Get list of workflows
    local workflows_response=""
    if [ -n "$auth_token" ]; then
        workflows_response=$(curl -s -H "Authorization: Bearer $auth_token" "$N8N_URL/api/v1/workflows" 2>/dev/null || echo "")
    else
        workflows_response=$(curl -s -u "$N8N_USER:$N8N_PASSWORD" "$N8N_URL/api/v1/workflows" 2>/dev/null || echo "")
    fi
    
    if echo "$workflows_response" | grep -q '"data"'; then
        # Extract workflow IDs and export each one
        echo "$workflows_response" | jq -r '.data[].id' 2>/dev/null | while read -r workflow_id; do
            if [ -n "$workflow_id" ] && [ "$workflow_id" != "null" ]; then
                log_info "Exporting workflow ID: $workflow_id"
                
                local workflow_data=""
                if [ -n "$auth_token" ]; then
                    workflow_data=$(curl -s -H "Authorization: Bearer $auth_token" "$N8N_URL/api/v1/workflows/$workflow_id" 2>/dev/null || echo "")
                else
                    workflow_data=$(curl -s -u "$N8N_USER:$N8N_PASSWORD" "$N8N_URL/api/v1/workflows/$workflow_id" 2>/dev/null || echo "")
                fi
                
                if echo "$workflow_data" | grep -q '"name"'; then
                    local workflow_name=$(echo "$workflow_data" | jq -r '.name' 2>/dev/null || echo "workflow_$workflow_id")
                    echo "$workflow_data" > "$export_dir/${workflow_name}.json"
                    log_success "Exported: $workflow_name"
                fi
            fi
        done
        
        log_success "Workflows exported to: $export_dir"
    else
        log_warning "Could not retrieve workflows list"
    fi
}

# Function to create database backup
backup_database() {
    log_info "Creating database backup..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/database_backup_$timestamp.sqlite"
    
    if [ -f "./n8n-data/database.sqlite" ]; then
        cp "./n8n-data/database.sqlite" "$backup_file"
        log_success "Database backed up to: $backup_file"
    else
        log_warning "Database file not found"
    fi
}

# Main setup function
setup_n8n() {
    log_info "Starting emergency n8n setup..."
    
    # Ensure n8n is running
    if ! docker ps | grep -q colorsoflife-n8n; then
        log_info "Starting n8n container..."
        docker-compose up -d n8n
    fi
    
    # Wait for n8n to be ready
    if ! wait_for_n8n; then
        log_error "n8n is not responding. Please check the container."
        exit 1
    fi
    
    # Create user account if needed
    create_n8n_user
    
    # Get authentication token
    local auth_token=$(get_auth_token)
    
    # Import all workflows
    local success_count=0
    local total_count=0
    
    if [ -d "$WORKFLOWS_DIR" ]; then
        for workflow_file in "$WORKFLOWS_DIR"/*.json; do
            if [ -f "$workflow_file" ]; then
                total_count=$((total_count + 1))
                if import_workflow "$workflow_file" "$auth_token"; then
                    success_count=$((success_count + 1))
                fi
            fi
        done
    else
        log_warning "Repaired workflows directory not found: $WORKFLOWS_DIR"
        log_info "Run './scripts/repair-workflows.sh repair' first"
    fi
    
    log_info "Import completed: $success_count/$total_count workflows imported"
    
    # Create backups
    backup_database
    export_workflows
    
    log_success "Emergency setup completed!"
    log_info "n8n is available at: $N8N_URL"
    log_info "Login: $N8N_USER / $N8N_PASSWORD"
}

# Function to create persistent backup cron job
setup_persistent_backup() {
    log_info "Setting up persistent backup system..."
    
    # Create backup script that runs every hour
    cat > "$BACKUP_DIR/hourly-backup.sh" << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups/n8n-manual"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p "$BACKUP_DIR/hourly"

# Backup database
if [ -f "./n8n-data/database.sqlite" ]; then
    cp "./n8n-data/database.sqlite" "$BACKUP_DIR/hourly/database_$TIMESTAMP.sqlite"
fi

# Backup entire n8n-data directory
cp -r "./n8n-data" "$BACKUP_DIR/hourly/n8n-data_$TIMESTAMP"

# Keep only last 24 backups (24 hours)
cd "$BACKUP_DIR/hourly"
ls -t database_*.sqlite | tail -n +25 | xargs -r rm -f
ls -t -d n8n-data_* | tail -n +25 | xargs -r rm -rf

echo "$(date): Backup completed" >> "$BACKUP_DIR/backup.log"
EOF
    
    chmod +x "$BACKUP_DIR/hourly-backup.sh"
    
    # Add to crontab
    local cron_job="0 * * * * cd $(pwd) && $BACKUP_DIR/hourly-backup.sh >> $BACKUP_DIR/backup.log 2>&1"
    
    if ! crontab -l 2>/dev/null | grep -q "hourly-backup.sh"; then
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        log_success "Hourly backup cron job added"
    else
        log_info "Backup cron job already exists"
    fi
}

# Main script logic
case "$1" in
    "setup")
        setup_n8n
        ;;
    "backup")
        backup_database
        export_workflows
        ;;
    "persistent")
        setup_persistent_backup
        ;;
    "full")
        setup_n8n
        setup_persistent_backup
        ;;
    *)
        echo "Emergency n8n Setup Script"
        echo ""
        echo "Usage: $0 {setup|backup|persistent|full}"
        echo ""
        echo "Commands:"
        echo "  setup      - Set up n8n and import workflows"
        echo "  backup     - Create manual backup"
        echo "  persistent - Set up hourly automated backups"
        echo "  full       - Do everything (setup + persistent backups)"
        ;;
esac 