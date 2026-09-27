#!/usr/bin/env bash
set -euo pipefail
DEST="${BACKUP_DIR:-/www/backup/lonaliza}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ROOT="/www/wwwroot/lonaliza.com"
mkdir -p "$DEST"
OUT="$DEST/lonaliza-$STAMP"
mkdir -p "$OUT"
cp -a "$ROOT/pocketbase/pb_data" "$OUT/pb_data" 2>/dev/null || true
cp -a "$ROOT/.data" "$OUT/dot-data" 2>/dev/null || true
find "$DEST" -mindepth 1 -maxdepth 1 -type d -mtime +"$KEEP_DAYS" -exec rm -rf {} +
echo "Backup written to $OUT"
