#!/usr/bin/env bash
# ==============================================================================
# LONALIZA Automated Server Setup Script (Ubuntu / Debian / aaPanel)
# ==============================================================================
set -e

echo "🚀 [1/5] Checking Node.js and PM2 prerequisites..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 process manager..."
    npm install -g pm2
fi

echo "📦 [2/5] Installing project dependencies..."
cd "$(dirname "$0")/.."
npm install --production=false

echo "🔨 [3/5] Building Next.js production bundle..."
npm run build

echo "🗄️ [4/5] Initializing PocketBase executable permissions..."
chmod +x pocketbase/pocketbase

echo "🚀 [5/5] Launching PM2 ecosystem services..."
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup || true

echo ""
echo "=============================================================================="
echo "✅ LONALIZA Server Setup Completed Successfully!"
echo "   - Next.js Web App: running on http://127.0.0.1:3000"
echo "   - PocketBase DB:   running on http://127.0.0.1:8090"
echo "   - PM2 Status:      Run 'pm2 status' or 'pm2 logs'"
echo "=============================================================================="
