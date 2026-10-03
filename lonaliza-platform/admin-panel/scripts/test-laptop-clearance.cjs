const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env.local');
const env = dotenv.parse(fs.readFileSync(envPath));
const secret = env.ADMIN_SESSION_SECRET || '';

function toBase64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const payload = { exp: Math.floor(Date.now() / 1000) + 86400 * 30, v: 1 };
const payloadB64 = toBase64Url(Buffer.from(JSON.stringify(payload)));
const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest();
const token = payloadB64 + '.' + toBase64Url(sig);

const { chromium } = require('/www/wwwroot/lonaliza.com/lonaliza-platform/node_modules/.pnpm/playwright@1.63.0/node_modules/playwright');

(async () => {
  console.log('[Playwright] Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/snap/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // User's laptop viewport: 1366x720
  const context = await browser.newContext({
    viewport: { width: 1366, height: 720 },
    deviceScaleFactor: 1
  });

  await context.addCookies([
    { name: 'liotrip_admin_auth', value: token, domain: '127.0.0.1', path: '/' }
  ]);

  const page = await context.newPage();
  console.log('[Playwright] Navigating to screen 21 at 1366x720...');
  await page.goto('http://127.0.0.1:3048/admin/agent-war-room?screen=21', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(3500);

  // 1. Capture primary full stage screenshot showing camera clearance and clean dock
  const stageScreenshotPath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/laptop_screen_clearance.png';
  await page.screenshot({ path: stageScreenshotPath });
  console.log('[Playwright] Saved stage screenshot to:', stageScreenshotPath);

  // 2. Click Maximize on Global Activity card to test tactical map expand
  console.log('[Playwright] Testing Global Activity Maximize button...');
  const maximizeBtn = await page.$('button[title="تكبير اللوحة التكتيكية"]');
  if (maximizeBtn) {
    await maximizeBtn.click();
    await page.waitForTimeout(1000);
    const mapExpandedPath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/map_tactical_expanded.png';
    await page.screenshot({ path: mapExpandedPath });
    console.log('[Playwright] Saved expanded map screenshot to:', mapExpandedPath);
  }

  await browser.close();
})().catch(err => {
  console.error('[Playwright] Error:', err);
  process.exit(1);
});
