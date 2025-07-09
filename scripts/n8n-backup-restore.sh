#!/bin/bash

# Colors of Life - n8n Backup & Restore Script
# This script prevents data loss by creating automated backups and enabling easy restoration

set -e

# Configuration
BACKUP_DIR="./backups/n8n"
N8N_DATA_DIR="./n8n-data"
WORKFLOWS_DIR="./n8n-workflows"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="n8n_backup_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log_info "Backup directory created: $BACKUP_DIR"
}

# Backup n8n data
backup_n8n() {
    log_info "Starting n8n backup..."
    
    # Create timestamped backup directory
    FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$FULL_BACKUP_PATH"
    
    # Stop n8n container to ensure consistent backup
    log_info "Stopping n8n container for consistent backup..."
    docker-compose stop n8n || log_warning "Could not stop n8n container"
    
    # Backup database and config
    if [ -f "$N8N_DATA_DIR/database.sqlite" ]; then
        cp "$N8N_DATA_DIR/database.sqlite" "$FULL_BACKUP_PATH/"
        log_success "Database backed up"
    else
        log_warning "No database file found"
    fi
    
    if [ -f "$N8N_DATA_DIR/config" ]; then
        cp "$N8N_DATA_DIR/config" "$FULL_BACKUP_PATH/"
        log_success "Config backed up"
    fi
    
    # Backup entire n8n data directory
    cp -r "$N8N_DATA_DIR" "$FULL_BACKUP_PATH/n8n-data-full"
    
    # Backup workflow JSON files
    if [ -d "$WORKFLOWS_DIR" ]; then
        cp -r "$WORKFLOWS_DIR" "$FULL_BACKUP_PATH/"
        log_success "Workflow JSON files backed up"
    fi
    
    # Create backup metadata
    cat > "$FULL_BACKUP_PATH/backup_info.txt" << EOF
Backup Created: $(date)
n8n Version: $(docker run --rm n8nio/n8n:latest n8n --version 2>/dev/null || echo "Unknown")
Docker Compose Project: colorsoflife
Backup Type: Full
EOF
    
    # Restart n8n container
    log_info "Restarting n8n container..."
    docker-compose up -d n8n
    
    log_success "Backup completed: $FULL_BACKUP_PATH"
    
    # Cleanup old backups (keep last 10)
    cleanup_old_backups
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last 10)..."
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs -r rm -rf
    cd - > /dev/null
    log_success "Old backups cleaned up"
}

# Restore from backup
restore_n8n() {
    if [ -z "$1" ]; then
        log_error "Please specify backup directory to restore from"
        echo "Usage: $0 restore <backup_directory_name>"
        echo "Available backups:"
        ls -la "$BACKUP_DIR" 2>/dev/null || echo "No backups found"
        exit 1
    fi
    
    RESTORE_PATH="$BACKUP_DIR/$1"
    
    if [ ! -d "$RESTORE_PATH" ]; then
        log_error "Backup directory not found: $RESTORE_PATH"
        exit 1
    fi
    
    log_warning "This will overwrite your current n8n data. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    log_info "Starting restore from: $RESTORE_PATH"
    
    # Stop n8n
    docker-compose stop n8n
    
    # Backup current state before restore
    if [ -d "$N8N_DATA_DIR" ]; then
        mv "$N8N_DATA_DIR" "${N8N_DATA_DIR}_pre_restore_$(date +%s)"
        log_info "Current data backed up before restore"
    fi
    
    # Restore data
    if [ -d "$RESTORE_PATH/n8n-data-full" ]; then
        cp -r "$RESTORE_PATH/n8n-data-full" "$N8N_DATA_DIR"
        log_success "n8n data restored"
    fi
    
    # Restore workflows
    if [ -d "$RESTORE_PATH/n8n-workflows" ]; then
        rm -rf "$WORKFLOWS_DIR"
        cp -r "$RESTORE_PATH/n8n-workflows" "$WORKFLOWS_DIR"
        log_success "Workflow files restored"
    fi
    
    # Restart n8n
    docker-compose up -d n8n
    
    log_success "Restore completed successfully!"
    log_info "n8n should be available at http://localhost:5678"
}

# Import workflows from JSON files
import_workflows() {
    log_info "Importing workflows from JSON files..."
    
    # Check if n8n is running
    if ! docker ps | grep -q colorsoflife-n8n; then
        log_error "n8n container is not running. Please start it first."
        exit 1
    fi
    
    # Wait for n8n to be ready
    log_info "Waiting for n8n to be ready..."
    sleep 10
    
    # Import each workflow
    for workflow_file in "$WORKFLOWS_DIR"/*.json; do
        if [ -f "$workflow_file" ]; then
            filename=$(basename "$workflow_file")
            log_info "Importing workflow: $filename"
            
            # Use n8n CLI to import workflow
            docker exec colorsoflife-n8n n8n import:workflow --input="/home/node/.n8n/workflows/$filename" || log_warning "Failed to import $filename"
        fi
    done
    
    log_success "Workflow import completed"
}

# Setup automated backups
setup_automated_backups() {
    log_info "Setting up automated backups..."
    
    # Create cron job for daily backups
    CRON_JOB="0 2 * * * cd $(pwd) && ./scripts/n8n-backup-restore.sh backup >> ./logs/n8n-backup.log 2>&1"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "n8n-backup-restore.sh"; then
        log_warning "Automated backup already configured"
    else
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        log_success "Automated daily backup configured (2 AM)"
    fi
    
    # Create logs directory
    mkdir -p ./logs
    
    log_success "Automated backup setup completed"
}

# Export workflows to JSON
export_workflows() {
    log_info "Exporting workflows to JSON files..."
    
    # Ensure workflows directory exists
    mkdir -p "$WORKFLOWS_DIR"
    
    # Export workflows using n8n CLI
    docker exec colorsoflife-n8n n8n export:workflow --all --output="/home/node/.n8n/workflows/" || log_warning "Export may have failed"
    
    log_success "Workflows exported to $WORKFLOWS_DIR"
}

# Show usage
show_usage() {
    echo "Colors of Life - n8n Backup & Restore Tool"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  backup                    Create a full backup of n8n data"
    echo "  restore <backup_name>     Restore from a specific backup"
    echo "  import                    Import workflows from JSON files"
    echo "  export                    Export workflows to JSON files"
    echo "  setup-auto               Setup automated daily backups"
    echo "  list                     List available backups"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore n8n_backup_20240115_140000"
    echo "  $0 import"
    echo "  $0 setup-auto"
}

# List available backups
list_backups() {
    log_info "Available backups:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"
    else
        log_warning "No backup directory found"
    fi
}

# Main script logic
case "$1" in
    "backup")
        create_backup_dir
        backup_n8n
        ;;
    "restore")
        restore_n8n "$2"
        ;;
    "import")
        import_workflows
        ;;
    "export")
        export_workflows
        ;;
    "setup-auto")
        setup_automated_backups
        ;;
    "list")
        list_backups
        ;;
    *)
        show_usage
        ;;
esac 