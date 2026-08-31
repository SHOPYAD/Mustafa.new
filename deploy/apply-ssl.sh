#!/bin/bash
set -euo pipefail

ROOT="/www/wwwroot/lonaliza.com/deploy"
NGINX_DIR="/www/server/panel/vhost/nginx"
STAMP="$(date +%Y%m%d%H%M%S)"

cp -a "$NGINX_DIR/lonaliza.com.conf" "$NGINX_DIR/lonaliza.com.conf.bak.$STAMP"
cp -a "$ROOT/lonaliza.com.nginx.conf" "$NGINX_DIR/lonaliza.com.conf"
cp -a "$ROOT/search.lonaliza.com.nginx.conf" "$NGINX_DIR/search.lonaliza.com.conf"

nginx -t
nginx -s reload
echo "nginx reloaded"
