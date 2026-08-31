#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ ! -f .env ]]; then
  ENGINE_TOKEN="$(openssl rand -hex 24)"
  REDIS_PASSWORD="$(openssl rand -hex 24)"
  sed \
    -e "s/^ENGINE_TOKEN=.*/ENGINE_TOKEN=${ENGINE_TOKEN}/" \
    -e "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=${REDIS_PASSWORD}/" \
    .env.example > .env
  echo "Wrote $ROOT/.env with fresh ENGINE_TOKEN and REDIS_PASSWORD"
else
  echo "$ROOT/.env already exists"
fi
chmod 600 .env
mkdir -p "$ROOT/redis-data" "$ROOT/storage"
PASS="$(grep '^REDIS_PASSWORD=' .env | cut -d= -f2- | tr -d '\r')"
sed "s/CHANGE_ME/${PASS}/" redis.conf.example > redis.conf
chmod 600 redis.conf
if grep -q '^CRAWLEE_STORAGE_DIR=/app/storage' .env; then
  sed -i 's|^CRAWLEE_STORAGE_DIR=/app/storage|CRAWLEE_STORAGE_DIR=/www/wwwroot/lonaliza.com/hotel-engine/storage|' .env
fi
echo "Wrote redis.conf for 127.0.0.1:6380"
