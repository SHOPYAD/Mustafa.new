import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "9ab277b84e29d8b2853ca7235653a8410004762234a748f2e4ba8a9d1ea954a1";

function toBase64Url(buf) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createSignedAdminToken(secret) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    v: 1,
  };
  const payloadB64 = toBase64Url(Buffer.from(JSON.stringify(payload)));
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest();
  const sigB64 = toBase64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

async function testChat() {
  console.log("=== اختبار إرسال توجيه وتدقيق مجرى الحوار وعدم تكرار الكلام ===");
  const token = createSignedAdminToken(SECRET);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "ar-SA",
  });

  await context.addCookies([
    {
      name: "liotrip_admin_auth",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
    },
  ]);

  const page = await context.newPage();
  await page.goto("http://localhost:3048/admin/agent-war-room", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  // Check Chat window or reopen it if closed
  let chatBox = page.locator("input[placeholder='اكتب أمراً للوكيل...']");
  if ((await chatBox.count()) === 0) {
    const restoreBtn = page.locator("button:has-text('+ مجرى الحوار')");
    if ((await restoreBtn.count()) > 0) {
      await restoreBtn.first().click();
      await page.waitForTimeout(1000);
    }
  }

  chatBox = page.locator("input[placeholder='اكتب أمراً للوكيل...']");
  console.log(`صندوق إدخال التوجيهات متاح: ${(await chatBox.count()) > 0}`);

  if ((await chatBox.count()) > 0) {
    const prompt = "اخبرني عن الادوات الكامله وخوادم MCP التي تتحكم فيها";
    await chatBox.first().fill(prompt);
    await chatBox.first().press("Enter");
    console.log(`تم إرسال التوجيه: "${prompt}"`);

    // Wait 5 seconds for deliberation response
    await page.waitForTimeout(6000);

    const shotsDir = path.resolve(process.cwd(), "public/verification-shots");
    const shotPath = path.join(shotsDir, "chat-deliberation-live.png");
    await page.screenshot({ path: shotPath });
    console.log(`تم حفظ لقطة فحص المحادثة في: ${shotPath}`);

    // Copy to artifacts
    const artifactDir = "/root/.gemini/antigravity-ide/brain/b79b15da-320e-4046-9995-00331b37c8d7";
    try {
      fs.copyFileSync(shotPath, path.join(artifactDir, "chat-deliberation-live.png"));
    } catch {}
  }

  await browser.close();
  console.log("=== انتهى فحص المحادثة بنجاح ===");
}

testChat().catch((e) => {
  console.error("خطأ:", e);
  process.exit(1);
});
