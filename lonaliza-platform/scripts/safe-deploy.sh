#!/usr/bin/env bash
# Build only the affected Lonaliza app, restart its PM2 process, and test nginx.
# Does not reload nginx. Does not switch payment gateways.
set -euo pipefail

TARGET="${1:-}"
ROOT="/www/wwwroot/lonaliza.com/lonaliza-platform"

if [[ "$TARGET" != "storefront" && "$TARGET" != "admin" && "$TARGET" != "both" ]]; then
  echo "usage: safe-deploy.sh storefront|admin|both" >&2
  exit 2
fi

build_app() {
  local dir="$1"
  echo "build $dir"
  (cd "$dir" && pnpm exec next build)
}

if [[ "$TARGET" == "storefront" || "$TARGET" == "both" ]]; then
  build_app "$ROOT/storefront"
  pm2 restart lonaliza-storefront --update-env
fi

if [[ "$TARGET" == "admin" || "$TARGET" == "both" ]]; then
  build_app "$ROOT/admin-panel"
  pm2 restart lonaliza-admin-backend --update-env
fi

nginx -t
echo "nginx config ok; reload was not run"
