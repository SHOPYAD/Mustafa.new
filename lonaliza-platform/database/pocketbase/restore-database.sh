#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PB_DATA_DIR="$SCRIPT_DIR/pb_data"
BACKUPS_DIR="$SCRIPT_DIR/backups"

echo "=== Restoring PocketBase Database from backup parts ==="
mkdir -p "$PB_DATA_DIR"

if [ -f "$BACKUPS_DIR/data.db.gz.part_aa" ]; then
    echo "Combining and decompressing data.db.gz..."
    cat "$BACKUPS_DIR"/data.db.gz.part_* | gzip -d > "$PB_DATA_DIR/data.db"
    echo "PocketBase data.db restored successfully! ($(ls -lh "$PB_DATA_DIR/data.db" | awk '{print $5}'))"
else
    echo "Error: Backup parts not found in $BACKUPS_DIR"
    exit 1
fi
