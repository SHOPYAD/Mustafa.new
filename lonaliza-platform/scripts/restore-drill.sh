#!/usr/bin/env bash
# Restore drill: copy the newest backup into a temp dir and sanity-check files.
# Does NOT overwrite production data.
set -euo pipefail
SRC="${BACKUP_DIR:-/www/backup/lonaliza}"
TMP="${RESTORE_DRILL_DIR:-/tmp/lonaliza-restore-drill}"
rm -rf "$TMP"
mkdir -p "$TMP"
LATEST="$(ls -1dt "$SRC"/lonaliza-* 2>/dev/null | head -n 1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "No backup found in $SRC — run scripts/backup-lonaliza.sh first"
  exit 1
fi
cp -a "$LATEST/." "$TMP/"
test -d "$TMP/pb_data" || { echo "missing pb_data"; exit 1; }
test -d "$TMP/dot-data" || { echo "missing .data"; exit 1; }
echo "Restore drill OK from $LATEST into $TMP"
