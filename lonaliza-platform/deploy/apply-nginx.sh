#!/bin/bash
set -euo pipefail

ROOT="/www/wwwroot/lonaliza.com/deploy"
NGINX_DIR="/www/server/panel/vhost/nginx"
STAMP="$(date +%Y%m%d%H%M%S)"

SRC="$ROOT/lonaliza.com.nginx.conf"
DST="$NGINX_DIR/lonaliza.com.conf"

if [[ ! -f "$SRC" ]]; then
  echo "missing $SRC" >&2
  exit 1
fi

if [[ -f "$DST" ]]; then
  cp -a "$DST" "$DST.bak.$STAMP"
  echo "backed up to $DST.bak.$STAMP"
fi

cp -a "$SRC" "$DST"
echo "wrote $DST"

PB_SRC="$ROOT/pocketbase.lonaliza.com.nginx.conf"
PB_DST="$NGINX_DIR/pocketbase.lonaliza.com.conf"
if [[ -f "$PB_SRC" ]]; then
  if [[ -f "$PB_DST" ]]; then
    cp -a "$PB_DST" "$PB_DST.bak.$STAMP"
  fi
  cp -a "$PB_SRC" "$PB_DST"
  echo "wrote $PB_DST"
fi

WK_SRC="$ROOT/pocketbase.lonaliza.com.well-known.conf"
WK_DST="$NGINX_DIR/well-known/pocketbase.lonaliza.com.conf"
if [[ -f "$WK_SRC" ]]; then
  mkdir -p "$NGINX_DIR/well-known"
  cp -a "$WK_SRC" "$WK_DST"
  echo "wrote $WK_DST"
fi

# Do not touch search.lonaliza.com (CNAME stays on Travelpayouts).

nginx -t
nginx -s reload
echo "nginx reloaded"
