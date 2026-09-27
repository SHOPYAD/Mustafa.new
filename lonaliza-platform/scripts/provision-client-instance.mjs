#!/usr/bin/env node
/**
 * Provisioning & Packaging Script for LONALIZA Client Reseller Instance.
 *
 * Copies the latest decoupled web platform from lonaliza-platform/ into
 * lonaliza-reseller/, strictly excluding super-admin resale systems and data.
 *
 * Usage:
 *   node scripts/provision-client-instance.mjs --domain=client-travel.com --target=/www/wwwroot/lonaliza.com/lonaliza-reseller
 */

import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";

// Parse CLI arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace(/^--/, "").split("=");
  acc[k] = v || true;
  return acc;
}, {});

const domain = args.domain || "client-travel.com";
const licenseKey = args.license || "LONALIZA-DEMO-XXXX-XXXX-XXXX";
const serverIp = args.ip || "SERVER_IP";
const targetDir = args.target || path.resolve("/www/wwwroot/lonaliza.com/lonaliza-reseller");
const sourceDir = path.resolve("/www/wwwroot/lonaliza.com/lonaliza-platform");

console.log(`\n🚀 Starting LONALIZA Client Reseller Provisioning:`);
console.log(`   Source Dir: ${sourceDir}`);
console.log(`   Target Dir: ${targetDir}`);
console.log(`   Domain:     ${domain}`);
console.log(`   License:    ${licenseKey}\n`);

async function run() {
  // 1. Clean & recreate target directory
  console.log(`🧹 Preparing clean target directory...`);
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(targetDir, { recursive: true });

  // 2. Excluded paths (strictly super-admin and build artifacts)
  const EXCLUDES = [
    "node_modules",
    ".next",
    ".git",
    ".data",
    "lonaliza-reseller",
    "liotrip-reseller",
    "*-reseller",
    "hotel-engine",
    "scripts/hotel-scraper",
    "admin-panel/src/app/admin/resale",
    "admin-panel/src/app/api/admin/resale",
    "admin-panel/src/app/partners",
    "admin-panel/src/app/api/partners",
    "admin-panel/src/app/api/admin/b2b-wallet",
    "admin-panel/src/app/api/admin/owned-hotels-test",
    "admin-panel/src/lib/server/owned-hotels",
    "admin-panel/src/lib/server/reseller-whitelabel-store.ts",
    "database/pocketbase/pb_data",
  ];

  console.log(`📦 Copying clean decoupled platform (excluding super-admin resale & scraper)...`);
  const excludeFlags = EXCLUDES.map((e) => `--exclude='${e}'`).join(" ");
  try {
    execSync(`rsync -a ${excludeFlags} "${sourceDir}/" "${targetDir}/"`, { stdio: "inherit" });
  } catch (err) {
    if (err.status !== 24) {
      throw err;
    }
  }

  // 3. Remove super-admin resale migrations from client copy
  console.log(`🧹 Removing super-admin resale migrations from client database...`);
  const migrationsDir = path.join(targetDir, "database", "pocketbase", "pb_migrations");
  try {
    const files = await fs.readdir(migrationsDir);
    for (const f of files) {
      if (f.includes("reseller") || f.startsWith("17881001") || f.startsWith("1788500100")) {
        await fs.unlink(path.join(migrationsDir, f));
      }
    }
  } catch (err) {
    console.warn("Could not clean migrations:", err.message);
  }

  // 4. Clean super-admin and sensitive files from database/data
  console.log(`🛡️ Sanitizing database/data (removing super-admin secrets & audit logs)...`);
  const sensitiveFiles = [
    "server-env.json",
    "gemini-secrets.json",
    "reseller-settings.json",
    "whitelabel-settings.json",
    "seeru_private.pem",
    "seeru_public.pem",
    "admin-audit.jsonl",
    "admin-push-subs.json",
    "whatsapp-qr-auth",
    "iyzico-fx-cache.json",
  ];
  for (const f of sensitiveFiles) {
    try {
      await fs.rm(path.join(targetDir, "database", "data", f), { recursive: true, force: true });
    } catch {}
  }

  // 5. Provide client stubs for resale-store and partner-session
  console.log(`🧩 Providing safe client stubs for resale & partner services...`);
  const resaleStoreStub = `/**
 * Client Stub - Super-admin resale system disabled on client distribution instance.
 */
export async function upsertResellerCompanyFromGoogle() { return null; }
export async function getResellerCompanies() { return []; }
export async function getResellerCompany() { return null; }
export async function getCompanyLicense() { return null; }
export async function getResellerSettings() { return null; }
export async function saveResellerSettings() { return null; }
export async function getResellerLicenses() { return []; }
export async function getCompanyServer() { return null; }
export async function updateResellerCompany() { return null; }
export type ResellerCompany = any;
export type ResellerCompanyProgress = any;
export type ResellerStageTemplate = any;
export type ResellerSettings = any;
`;
  await fs.writeFile(path.join(targetDir, "admin-panel", "src", "lib", "server", "resale-store.ts"), resaleStoreStub, "utf8");

  const partnerSessionStub = `/**
 * Client Stub - Super-admin partner session disabled on client distribution instance.
 */
export const PARTNER_AUTH_COOKIE = "partner_auth";
export const PARTNER_SESSION_MAX_AGE = 0;
export async function createPartnerSessionToken() { return ""; }
export async function getPartnerSession() { return null; }
export async function verifyPartnerSession() { return null; }
`;
  await fs.writeFile(path.join(targetDir, "admin-panel", "src", "lib", "server", "partner-session.ts"), partnerSessionStub, "utf8");

  const whitelabelStub = `/**
 * Client Stub - White-label resale store disabled on client distribution instance.
 */
export type WhiteLabelSettings = any;
export type B2BWalletSummary = any;
export type B2BWalletTransaction = any;
export async function getWhiteLabelSettings() { return null; }
export async function saveWhiteLabelSettings() { return null; }
export async function verifyB2BPartnerKey() { return null; }
export async function recordB2BTransaction() { return null; }
export async function getB2BWalletSummary() { return null; }
export function applyMarkup(amount: number) { return amount; }
`;
  await fs.writeFile(path.join(targetDir, "admin-panel", "src", "lib", "server", "reseller-whitelabel-store.ts"), whitelabelStub, "utf8");

  // 6. Generate client .env.local and .env.example
  console.log(`⚙️ Generating client .env.local with DEPLOYMENT_ROLE=client...`);
  const clientEnv = `# ==============================================================================
# LONALIZA Travel Platform — Client Production Environment
# Domain: ${domain}
# ==============================================================================

NEXT_PUBLIC_SITE_URL=https://${domain}
DEPLOYMENT_ROLE=client
NEXT_PUBLIC_DEPLOYMENT_ROLE=client
LICENSE_KEY=${licenseKey}
LICENSE_ORIGIN=https://lonaliza.com
LICENSE_SIGNING_KEY=8f1b4a6c9d2e3f5a7b0c8d1e4f6a9b2c3d5e7f0a1b3c5d7e9f1a3b5c7d9e1f3a

# Admin Default Credentials (Change on first login)
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD="Admin#${Math.random().toString(36).slice(-6)}123"

# PocketBase Local Database
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@${domain}
POCKETBASE_ADMIN_PASSWORD="PbPass#${Math.random().toString(36).slice(-6)}123"

# Hotels Search Providers (RapidAPI Booking.com & TripAdvisor)
NEXT_PUBLIC_HOTELS_PROVIDER=booking
RAPIDAPI_KEY=b6e138f138msh141d757ea4dec19p1a82b9jsna0b3a4153502
RAPIDAPI_TRAVEL_ADVISOR_HOST=travel-advisor.p.rapidapi.com
RAPIDAPI_ROOMS_HOST=booking-com15.p.rapidapi.com
BOOKING_COM_HOST=booking-com15.p.rapidapi.com
NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER=booking_com15
BOOKING_COM_RAPIDAPI_KEY=fccf911528msh325113c0cf6c603p11fcb7jsn699acbe13f53
RAPIDAPI_ROOMS_KEY=fccf911528msh325113c0cf6c603p11fcb7jsn699acbe13f53

# Flights Engine (SkyScrapper Live API + Travelpayouts)
SKY_SCRAPPER_RAPIDAPI_KEY=fccf911528msh325113c0cf6c603p11fcb7jsn699acbe13f53
SKY_SCRAPPER_HOST=sky-scrapper.p.rapidapi.com
NEXT_PUBLIC_FLIGHTS_PROVIDER=live

# Payment Gateways (Add your merchant keys in Admin Settings)
PAYMENTS_IYZICO_ENABLED=true
PAYMENTS_WHATSAPP_BANK_LINK_ENABLED=true
IYZICO_MODE=sandbox

# Session & Push Notifications Secrets
ADMIN_SESSION_SECRET=${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}
`;

  await fs.writeFile(path.join(targetDir, ".env.local"), clientEnv, "utf8");
  await fs.writeFile(path.join(targetDir, ".env.example"), clientEnv, "utf8");

  // Copy .env.local to storefront and admin-panel
  await fs.writeFile(path.join(targetDir, "storefront", ".env.local"), clientEnv, "utf8");
  await fs.writeFile(path.join(targetDir, "admin-panel", ".env.local"), clientEnv, "utf8");

  // 7. Setup Relative Symlinks inside client copy for local testing / packaging
  console.log(`🔗 Setting up relative portable symlinks...`);
  try {
    execSync(`ln -sfn ../node_modules "${path.join(targetDir, "storefront", "node_modules")}"`);
    execSync(`ln -sfn ../database/data "${path.join(targetDir, "storefront", ".data")}"`);
    execSync(`ln -sfn ../node_modules "${path.join(targetDir, "admin-panel", "node_modules")}"`);
    execSync(`ln -sfn ../database/data "${path.join(targetDir, "admin-panel", ".data")}"`);
  } catch {}

  // 8. Generate Client Deployment Scripts and Nginx Configs
  console.log(`🌐 Generating client deployment scripts, PM2 ecosystem, and Nginx templates...`);
  const deployDir = path.join(targetDir, "deploy");
  const nginxDir = path.join(deployDir, "nginx");
  await fs.mkdir(nginxDir, { recursive: true });

  // Main site Nginx reverse proxy template
  const mainNginx = `server {
    listen 80;
    server_name ${domain} www.${domain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL Certificates (Auto-generated by aaPanel or Let's Encrypt)
    ssl_certificate /www/server/panel/vhost/cert/${domain}/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Decoupled Backend API & Admin Panel
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location ^~ /admin {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }

    location ^~ /preview {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }

    # Next.js Static Assets & Chunks with fallback
    location ^~ /_next/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_intercept_errors on;
        error_page 404 = @admin_next;
    }

    location @admin_next {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storefront (Public Website)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_read_timeout 120s;
    }
}
`;

  // PocketBase subdomain Nginx reverse proxy
  const pbNginx = `server {
    listen 80;
    server_name pocketbase.${domain};
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pocketbase.${domain};

    ssl_certificate /www/server/panel/vhost/cert/pocketbase.${domain}/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/pocketbase.${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

  await fs.writeFile(path.join(nginxDir, "site.conf"), mainNginx, "utf8");
  await fs.writeFile(path.join(nginxDir, "pocketbase.conf"), pbNginx, "utf8");

  // PM2 Ecosystem Config for client
  const clientEcosystem = `module.exports = {
  apps: [
    {
      name: "client-pocketbase",
      cwd: __dirname + "/../database/pocketbase",
      script: "./pocketbase",
      args: "serve --http=127.0.0.1:8090",
      interpreter: "none",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      error_file: "/www/wwwlogs/client-pocketbase-error.log",
      out_file: "/www/wwwlogs/client-pocketbase-out.log",
    },
    {
      name: "client-storefront",
      cwd: __dirname + "/../storefront",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/www/wwwlogs/client-storefront-error.log",
      out_file: "/www/wwwlogs/client-storefront-out.log",
    },
    {
      name: "client-admin",
      cwd: __dirname + "/../admin-panel",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/www/wwwlogs/client-admin-error.log",
      out_file: "/www/wwwlogs/client-admin-out.log",
    },
    {
      name: "client-automation",
      cwd: __dirname + "/..",
      script: "scripts/automation-worker.mjs",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        AUTOMATION_TICK_HOST: "127.0.0.1",
        AUTOMATION_TICK_PORT: "3001",
      },
      autorestart: true,
    }
  ],
};
`;
  await fs.writeFile(path.join(deployDir, "ecosystem.config.cjs"), clientEcosystem, "utf8");
  await fs.writeFile(path.join(targetDir, "ecosystem.config.cjs"), clientEcosystem, "utf8");

  // setup-server.sh script
  const setupScript = `#!/usr/bin/env bash
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
`;
  await fs.writeFile(path.join(deployDir, "setup-server.sh"), setupScript, "utf8");
  await fs.chmod(path.join(deployDir, "setup-server.sh"), 0o755);

  // Helper scripts
  await fs.writeFile(path.join(deployDir, "start.sh"), `#!/usr/bin/env bash\npm2 start $(dirname "$0")/ecosystem.config.cjs\n`, "utf8");
  await fs.writeFile(path.join(deployDir, "stop.sh"), `#!/usr/bin/env bash\npm2 stop $(dirname "$0")/ecosystem.config.cjs\n`, "utf8");
  await fs.writeFile(path.join(deployDir, "restart.sh"), `#!/usr/bin/env bash\npm2 restart $(dirname "$0")/ecosystem.config.cjs\n`, "utf8");
  await fs.chmod(path.join(deployDir, "start.sh"), 0o755);
  await fs.chmod(path.join(deployDir, "stop.sh"), 0o755);
  await fs.chmod(path.join(deployDir, "restart.sh"), 0o755);

  // README.md
  const readmeContent = `# دليل تشغيل ورفع نسخة عميل LONALIZA على سيرفر Contabo / aaPanel

مرحباً بك! هذه النسخة المستقلة الكاملة لمنظومة **LONALIZA Tourism Platform** جاهزة للرفع والتشغيل على سيرفر شركتك في دقائق معدودة.

---

## 🛠️ متطلبات السيرفر:
- نظام تشغيل: **Ubuntu 22.04 LTS** أو **Debian 12**
- لوحة تحكم: **aaPanel** (موصى بها لسهولة إدارة الـ SSL و Nginx) أو Nginx مباشر
- بيئة التشغيل: **Node.js 20+** و **PM2**

---

## 🚀 خطوات التثبيت السريعة (3 خطوات فقط):

### الخطوة 1: رفع المجلد إلى السيرفر
ارفع مجلد المشروع إلى المسار:
\`/www/wwwroot/yourdomain.com\`

### الخطوة 2: تشغيل سكربت الإعداد التلقائي
عبر الـ Terminal أو SSH، نفذ الأمر التالي:
\`\`\`bash
cd /www/wwwroot/yourdomain.com
bash deploy/setup-server.sh
\`\`\`
يقوم هذا السكربت تلقائياً بتثبيت التبعيات، بناء واجهة الموقع ولوحة التحكم (\`npm run build\`)، وتشغيل كافة الخدمات عبر **PM2**.

### الخطوة 3: تطبيق إعدادات Nginx وشهادة SSL
1. من لوحة **aaPanel**: أضف موقعين:
   - الموقع الرئيسي: \`yourdomain.com\` و \`www.yourdomain.com\`
   - موقع قاعدة البيانات: \`pocketbase.yourdomain.com\`
2. أصدر شهادة **Let's Encrypt SSL** مجاناً لكل موقع بضغطة زر.
3. انسخ إعدادات الـ Reverse Proxy من المجلد:
   - \`deploy/nginx/site.conf\` → إعدادات النطاق الرئيسي
   - \`deploy/nginx/pocketbase.conf\` → إعدادات ساب دومين PocketBase

---

## 🔑 بيانات الدخول الافتراضية للوحة التحكم:
- رابط لوحة الأدمن: \`https://yourdomain.com/admin\`
- المستخدم الافتراضي: \`admin\`
- كلمة المرور: مسجلة داخل ملف \`.env.local\`

---

## 📌 إدارة الخدمات عبر PM2:
- عرض حالة الخدمات: \`pm2 status\`
- متابعة السجلات الحية: \`pm2 logs\`
- إعادة التشغيل: \`bash deploy/restart.sh\`
`;

  await fs.writeFile(path.join(deployDir, "README.md"), readmeContent, "utf8");
  await fs.writeFile(path.join(targetDir, "README.md"), readmeContent, "utf8");

  console.log(`\n✅ Client Reseller Package Provisioned Successfully at:`);
  console.log(`   ${targetDir}\n`);
}

run().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
