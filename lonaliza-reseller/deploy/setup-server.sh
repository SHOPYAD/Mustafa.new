#!/usr/bin/env bash
# ==============================================================================
# LONALIZA Automated Client Server Setup Script (Ubuntu / Debian / aaPanel)
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

echo "📦 [2/5] Installing dependencies..."
cd "$(dirname "$0")/.."
npm install --production=false

echo "🔨 [3/5] Building Storefront and Admin Panel..."
npm run build:storefront
npm run build:admin

echo "🗄️ [4/5] Initializing PocketBase executable..."
chmod +x database/pocketbase/pocketbase

echo "🚀 [5/5] Launching PM2 ecosystem services..."
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup || true

echo ""
echo "=============================================================================="
echo "✅ LONALIZA Client Platform Setup Completed Successfully!"
echo "   - Storefront Website: http://127.0.0.1:3000"
echo "   - Admin Dashboard:    http://127.0.0.1:3001/admin"
echo "   - PocketBase DB:       http://127.0.0.1:8090"
echo "   - PM2 Status:          Run 'pm2 status' or 'pm2 logs'"
echo "=============================================================================="
