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
