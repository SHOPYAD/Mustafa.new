/**
 * Stealth Puppeteer Browser MCP Server
 * Controls automated headless browser with anti-detection flags for scraping and automation
 */

import path from "path";
import fs from "fs/promises";

export interface BrowserScrapeResult {
  ok: boolean;
  url: string;
  title: string;
  metaDescription?: string;
  extractedText: string;
  screenshotPath?: string;
  error?: string;
}

const CHROMIUM_PATHS = [
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
];

async function findChromiumPath(): Promise<string> {
  for (const bin of CHROMIUM_PATHS) {
    try {
      await fs.access(bin);
      return bin;
    } catch {
      // try next
    }
  }
  return "/usr/bin/chromium-browser";
}

export async function scrapeWithStealth(url: string, takeScreenshot = false): Promise<BrowserScrapeResult> {
  const profileDir = path.join(process.cwd(), ".data", "puppeteer", "profile");
  await fs.mkdir(profileDir, { recursive: true });

  let puppeteerCore: typeof import("puppeteer-core");
  try {
    puppeteerCore = await import("puppeteer-core");
  } catch (err) {
    return {
      ok: false,
      url,
      title: "",
      extractedText: "",
      error: `puppeteer-core is not available: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const executablePath = await findChromiumPath();

  try {
    const browser = await puppeteerCore.launch({
      executablePath,
      headless: true,
      userDataDir: profileDir,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1920,1080",
      ],
      defaultViewport: { width: 1920, height: 1080 },
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      );

      // Mask navigator.webdriver
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const title = await page.title();
      const metaDescription = await page
        .$eval('meta[name="description"]', (el) => el.getAttribute("content") || "")
        .catch(() => "");

      const extractedText = await page
        .evaluate(() => {
          const body = document.querySelector("main") || document.querySelector("article") || document.body;
          return (body?.innerText || "").slice(0, 3000).replace(/\s+/g, " ").trim();
        })
        .catch(() => "");

      let screenshotPath: string | undefined;
      if (takeScreenshot) {
        const screensDir = path.join(process.cwd(), ".data", "puppeteer", "screenshots");
        await fs.mkdir(screensDir, { recursive: true });
        const filePath = path.join(screensDir, `shot_${Date.now()}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        screenshotPath = filePath;
      }

      return {
        ok: true,
        url,
        title,
        metaDescription,
        extractedText,
        screenshotPath,
      };
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch (error) {
    return {
      ok: false,
      url,
      title: "",
      extractedText: "",
      error: error instanceof Error ? error.message : "Browser execution error",
    };
  }
}
