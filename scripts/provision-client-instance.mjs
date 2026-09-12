#!/usr/bin/env node
/**
 * Provisioning & Cloning Script for LONALIZA Client Instances.
 *
 * Usage:
 *   node scripts/provision-client-instance.mjs --domain=YOUR_DOMAIN.com --license=LONALIZA-XXXX-XXXX-XXXX-XXXX --ip=SERVER_IP --target=/www/wwwroot/lonaliza.com/lonaliza-reseller
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
const targetDir = args.target || path.join(process.cwd(), "lonaliza-reseller");
const sourceDir = process.cwd();

console.log(`\n🚀 Starting LONALIZA Client Provisioning:`);
console.log(`   Domain:     ${domain}`);
console.log(`   License:    ${licenseKey}`);
console.log(`   Server IP:  ${serverIp}`);
console.log(`   Target Dir: ${targetDir}\n`);

async function run() {
  // 1. Clean & create target directory
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(targetDir, { recursive: true });

  // 2. Excluded paths list (strictly super admin only)
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
    "src/lib/scraping",
    "src/app/admin/resale",
    "src/app/api/admin/resale",
    "src/app/partners",
    "src/app/api/partners",
    "src/app/demo",
    "src/app/api/admin/owned-hotels-test",
    "src/lib/server/partner-session.ts",
    "pocketbase/pb_data",
  ];

  console.log(`📦 Copying clean codebase (excluding scraper & super admin resale)...`);
  const excludeFlags = EXCLUDES.map((e) => `--exclude='${e}'`).join(" ");
  try {
    execSync(`rsync -a ${excludeFlags} "${sourceDir}/" "${targetDir}/"`, { stdio: "inherit" });
  } catch (err) {
    // Exit code 24 in rsync is non-fatal "vanished files"
    if (err.status !== 24) {
      throw err;
    }
  }

  // 3. Remove reseller-specific PB migrations from client copy
  console.log(`🧹 Cleaning super-admin resale migrations from client copy...`);
  const migrationsDir = path.join(targetDir, "pocketbase", "pb_migrations");
  try {
    const files = await fs.readdir(migrationsDir);
    for (const f of files) {
      if (f.includes("reseller") || f.startsWith("17881001")) {
        await fs.unlink(path.join(migrationsDir, f));
      }
    }
  } catch (err) {
    console.warn("Could not clean migrations:", err.message);
  }

  // 4. Generate Client .env.local & .env.example
  console.log(`⚙️ Generating client .env.local with DEPLOYMENT_ROLE=client...`);
  const clientEnv = `# ==============================================================================
# LONALIZA Travel Platform — Client Production Environment
# Domain: ${domain}
# ==============================================================================

NEXT_PUBLIC_SITE_URL=https://${domain}
DEPLOYMENT_ROLE=client
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

  // 5. Generate Deployment Scripts and Nginx Configs
  console.log(`🌐 Generating deployment scripts, PM2 ecosystem, and Nginx templates...`);
  const deployDir = path.join(targetDir, "deploy");
  const nginxDir = path.join(deployDir, "nginx");
  await fs.mkdir(nginxDir, { recursive: true });

  // Main site Nginx reverse proxy
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

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

    # SSL Certificates (Auto-generated by aaPanel or Let's Encrypt)
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

  // PM2 Ecosystem Config
  const ecosystemConfig = `module.exports = {
  apps: [
    {
      name: "lonaliza-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname + "/..",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "lonaliza-pocketbase",
      script: "./pocketbase/pocketbase",
      args: "serve --http=127.0.0.1:8090",
      cwd: __dirname + "/..",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M"
    }
  ]
};
`;
  await fs.writeFile(path.join(deployDir, "ecosystem.config.cjs"), ecosystemConfig, "utf8");

  // setup-server.sh script
  const setupScript = `#!/usr/bin/env bash
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
`;
  await fs.writeFile(path.join(deployDir, "setup-server.sh"), setupScript, "utf8");
  await fs.chmod(path.join(deployDir, "setup-server.sh"), 0o755);

  // start.sh, stop.sh, restart.sh
  await fs.writeFile(path.join(deployDir, "start.sh"), `#!/usr/bin/env bash\npm2 start $(dirname "$0")/ecosystem.config.cjs\n`, "utf8");
  await fs.writeFile(path.join(deployDir, "stop.sh"), `#!/usr/bin/env bash\npm2 stop $(dirname "$0")/ecosystem.config.cjs\n`, "utf8");
  await fs.writeFile(path.join(deployDir, "restart.sh"), `#!/usr/bin/env bash\npm2 restart $(dirname "$0")/ecosystem.config.cjs\n`, "utf8");
  await fs.chmod(path.join(deployDir, "start.sh"), 0o755);
  await fs.chmod(path.join(deployDir, "stop.sh"), 0o755);
  await fs.chmod(path.join(deployDir, "restart.sh"), 0o755);

  // README.md in deploy directory
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
يقوم هذا السكربت تلقائياً بتثبيت التبعيات، بناء المشروع (\`npm run build\`)، وتشغيل الموقع وقاعدة البيانات عبر **PM2**.

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

  console.log(`\n✅ Client Provisioning Package Created Successfully at:`);
  console.log(`   ${targetDir}\n`);
}

run().catch((err) => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
