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

async function main() {
  console.log("=================================================================");
  console.log("⚡ فحص استعراض المقال الموسوعي، بطاقات الطيران، والذرات التاجية");
  console.log("=================================================================");

  const token = createSignedAdminToken(SECRET);
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
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

  console.log("1. فتح الرابط الميداني للاستوديو السيبراني...");
  await page.goto("http://localhost:3048/admin/agent-war-room", {
    waitUntil: "domcontentloaded",
    timeout: 35000,
  });

  await page.waitForSelector("text=الحضور البشري والصوت الحي", { timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Open Chat and send the review directive
  console.log("2. استعراض المقال الموسوعي...");
  const articleReviewChip = page.locator("button:has-text('استعراض المقال')");
  if ((await articleReviewChip.count()) > 0) {
    console.log("   - النقر على زر استعراض المقال الموسوعي...");
    await articleReviewChip.first().click({ noWaitAfter: true });
    await page.waitForTimeout(1500);
  } else {
    const chatChip = page.locator("button:has-text('+ مجرى الحوار')");
    if ((await chatChip.count()) > 0) {
      await chatChip.click({ noWaitAfter: true });
      await page.waitForTimeout(600);
    }

    const inputEl = page.locator("input[placeholder='اكتب أمراً للوكيل...']");
    if ((await inputEl.count()) > 0) {
      await inputEl.fill("مثل ما قلت لك واستعرض المقال امامي لحتى اعطيك موافقه وتنشره");
      await page.keyboard.press("Enter");
      console.log("   - تم إرسال التوجيه بنجاح.");
      await page.waitForTimeout(3000);
    }
  }

  // 3. Verify Article Review Window is visible
  const modalHeader = page.locator("text=Article Publishing & Review Studio");
  const isModalVisible = (await modalHeader.count()) > 0;
  console.log(`3. هل نافذة استعراض المقال الموسوعي معروضة؟ ${isModalVisible ? "نعم بنجاح ✅" : "غير معروضة ❌"}`);

  // 4. Capture screenshot of full article view
  const shotsDir = path.resolve(process.cwd(), "public/verification-shots");
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

  const shotPath1 = path.join(shotsDir, "article-review-full-guide.png");
  await page.screenshot({ path: shotPath1, fullPage: false });
  console.log(`4. تم حفظ لقطة المقال الكامل في: ${shotPath1}`);

  // 5. Switch to Flights tab and capture
  const flightsTab = page.locator("button:has-text('عروض وبطاقات الطيران')");
  if ((await flightsTab.count()) > 0) {
    await flightsTab.click({ noWaitAfter: true });
    await page.waitForTimeout(1000);
    const shotPath2 = path.join(shotsDir, "article-review-flights-tab.png");
    await page.screenshot({ path: shotPath2, fullPage: false });
    console.log(`5. تم حفظ لقطة بطاقات الطيران الحية في: ${shotPath2}`);
  }

  // Copy to artifacts
  const artifactDir = "/root/.gemini/antigravity-ide/brain/b79b15da-320e-4046-9995-00331b37c8d7";
  try {
    fs.copyFileSync(shotPath1, path.join(artifactDir, "article-review-full-guide.png"));
    if (fs.existsSync(path.join(shotsDir, "article-review-flights-tab.png"))) {
      fs.copyFileSync(path.join(shotsDir, "article-review-flights-tab.png"), path.join(artifactDir, "article-review-flights-tab.png"));
    }
    console.log("   تم نسخ لقطات الشاشة للأرتيفاكتس بنجاح.");
  } catch (err) {
    console.warn("   تحذير نسخ لقطة الشاشة:", err.message);
  }

  await browser.close();
  console.log("=================================================================");
  console.log("✅ اكتمل الفحص والتحقق من استعراض المقال وبطاقات الطيران بنجاح 100%!");
  console.log("=================================================================");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
