const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
const env = dotenv.parse(fs.readFileSync(envPath));
const secret = env.ADMIN_SESSION_SECRET || '';

function toBase64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// Generate admin auth token
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

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  await context.addCookies([
    { name: 'liotrip_admin_auth', value: token, domain: '127.0.0.1', path: '/' }
  ]);

  const page = await context.newPage();
  console.log('[Playwright] Navigating to screen 23...');
  const resp = await page.goto('http://127.0.0.1:3048/admin/agent-war-room?screen=23', {
    waitUntil: 'networkidle',
    timeout: 35000
  });

  console.log('[Playwright] HTTP Status:', resp.status(), 'URL:', page.url());

  // Wait for 3D stage and canvas animations to settle
  await page.waitForTimeout(4000);

  const outputPath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/screen23_atlas_standard.png';
  await page.screenshot({ path: outputPath });
  console.log('[Playwright] Screenshot successfully saved to:', outputPath);

  // Copy to public neural-studio directory for persistent preview
  try {
    fs.copyFileSync(outputPath, path.resolve(__dirname, '../public/images/neural-studio/23-mind-graph-cockpit.png'));
    console.log('[Playwright] Copied to public/images/neural-studio/23-mind-graph-cockpit.png');
  } catch (e) {
    console.warn('[Playwright] Could not copy to public:', e.message);
  }

  await browser.close();
})().catch(err => {
  console.error('[Playwright] Error:', err);
  process.exit(1);
});
