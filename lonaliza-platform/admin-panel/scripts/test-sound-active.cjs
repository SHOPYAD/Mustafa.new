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
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/snap/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 720 },
    deviceScaleFactor: 1,
    permissions: ['microphone']
  });

  await context.addCookies([
    { name: 'liotrip_admin_auth', value: token, domain: '127.0.0.1', path: '/' }
  ]);

  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3048/admin/agent-war-room?screen=21', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(3000);

  // Click voice toggle button
  console.log('[Playwright] Clicking sound listening button...');
  const voiceBtn = await page.waitForSelector('button:has-text("صوت: متوقف")');
  await voiceBtn.click();
  await page.waitForTimeout(2000);

  const soundActivePath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/sound_live_active_verified.png';
  await page.screenshot({ path: soundActivePath });
  console.log('[Playwright] Saved sound active screenshot to:', soundActivePath);

  await browser.close();
})().catch(err => {
  console.error('[Playwright] Error:', err);
  process.exit(1);
});
