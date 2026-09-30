#!/usr/bin/env bash
# نشر لوحة الإدارة دون إفساد الخادم الحي:
# الخادم يخدم من .next-live، والبناء يتم في .next-studio-staging ثم يُبدَّل ذريًا.
# أي `next build` عادي (يكتب في .next) لا يمس الموقع الحي.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[deploy] building into .next-studio-staging"
rm -rf .next-studio-staging
NEXT_DIST_DIR=.next-studio-staging NODE_OPTIONS=--max-old-space-size=8192 pnpm exec next build

test -f .next-studio-staging/BUILD_ID || { echo "[deploy] build incomplete"; exit 1; }

echo "[deploy] swapping .next-studio-staging -> .next-live"
rm -rf .next-live.old
[ -d .next-live ] && mv .next-live .next-live.old
mv .next-studio-staging .next-live

NEXT_DIST_DIR=.next-live pm2 restart lonaliza-admin-backend --update-env
rm -rf .next-live.old
echo "[deploy] live build $(cat .next-live/BUILD_ID)"
