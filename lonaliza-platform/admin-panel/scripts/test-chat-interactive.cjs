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
    viewport: { width: 1440, height: 900 },
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

  await page.waitForTimeout(3000);

  // 1. Click "محادثة الوكيل" button in the bottom dock
  console.log('[Playwright] Clicking Supervisor Chat Button in Dock...');
  const chatBtn = await page.waitForSelector('button:has-text("محادثة الوكيل")');
  await chatBtn.click();
  await page.waitForTimeout(1000);

  // Take screenshot of opened chat window
  const chatOpenedPath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/chat_opened_verified.png';
  await page.screenshot({ path: chatOpenedPath });
  console.log('[Playwright] Saved chat opened screenshot to:', chatOpenedPath);

  // 2. Type "افتح لي قسم تأجير السيارات" into the chat input
  console.log('[Playwright] Typing directive: افتح لي قسم تأجير السيارات');
  const inputSelector = 'input[placeholder="اكتب أمراً أو استفساراً للوكيل..."]';
  await page.fill(inputSelector, 'افتح لي قسم تأجير السيارات');
  await page.keyboard.press('Enter');

  // Wait for intent resolution, speech reply, and card/station activation
  await page.waitForTimeout(4500);

  const directivePath = '/root/.gemini/antigravity-ide/brain/db0641e8-cfc0-4150-ae01-f4650736a8e2/cars_directive_executed.png';
  await page.screenshot({ path: directivePath });
  console.log('[Playwright] Saved directive executed screenshot to:', directivePath);

  await browser.close();
})().catch(err => {
  console.error('[Playwright] Error:', err);
  process.exit(1);
});
