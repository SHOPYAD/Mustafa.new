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

  const context = await browser.newContext({
    viewport: { width: 1366, height: 720 },
    deviceScaleFactor: 1
  });

  await context.addCookies([
    { name: 'liotrip_admin_auth', value: token, domain: '127.0.0.1', path: '/' }
  ]);

  const page = await context.newPage();
  console.log('[Playwright] Navigating to screen 21...');
  await page.goto('http://127.0.0.1:3048/admin/agent-war-room?screen=21', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Wait for Cobe Globe WebGL and cards to mount
  await page.waitForTimeout(4000);

  // 1. Capture primary screenshot showing Cobe Globe, framed voice visualizer, and 3D neon cards
  const stageScreenshotPath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/cobe_globe_and_cards_verified.png';
  await page.screenshot({ path: stageScreenshotPath });
  console.log('[Playwright] Saved stage screenshot to:', stageScreenshotPath);

  // 2. Test hovering over globe and wheel zooming
  console.log('[Playwright] Hovering over Cobe Globe and testing zoom...');
  const globeBox = await page.$('canvas');
  if (globeBox) {
    const box = await globeBox.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -120); // zoom in
      await page.waitForTimeout(800);
    }
  }

  // 3. Click one of the marker labels or trigger visitor popover
  console.log('[Playwright] Clicking marker or opening visitor detail popover...');
  const marker = await page.$('div:has-text("إسطنبول"), div:has-text("دبي"), div:has-text("الرياض")');
  if (marker) {
    await marker.click();
    await page.waitForTimeout(800);
  }

  const zoomedScreenshotPath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/globe_zoomed_and_visitor_popover.png';
  await page.screenshot({ path: zoomedScreenshotPath });
  console.log('[Playwright] Saved zoomed screenshot to:', zoomedScreenshotPath);

  await browser.close();
})().catch(err => {
  console.error('[Playwright] Error:', err);
  process.exit(1);
});
