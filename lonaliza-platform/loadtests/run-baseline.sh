#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
BASE_URL="${BASE_URL:-https://lonaliza.com}"
export BASE_URL

if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 not installed; see README.md"
  exit 1
fi

echo "Baseline against $BASE_URL"
k6 run --env BASE_URL="$BASE_URL" "$ROOT/k6/smoke.js"
k6 run --env BASE_URL="$BASE_URL" --vus 20 --duration 2m "$ROOT/k6/browse-public.js"
