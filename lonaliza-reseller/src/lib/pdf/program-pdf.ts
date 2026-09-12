import { existsSync } from "fs";
import path from "path";
import { chromium, type Browser } from "playwright";
import { getBranding } from "@/lib/server/branding-store";
import { getGeminiPublicConfig } from "@/lib/server/gemini";
import {
  loadPdfAssets,
  renderProgramHtml,
  type ProgramPdfModel,
} from "@/lib/pdf/program-html";
import type { SavedAiProgram } from "@/types/ai-program";

let browserPromise: Promise<Browser> | null = null;

function resolveChromePath(): string | undefined {
  const fromEnv = process.env.PLAYWRIGHT_CHROME || process.env.CHROME_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const home = process.env.HOME || "/root";
  const candidates = [
    path.join(home, ".cache/ms-playwright/chromium-1148/chrome-linux/chrome"),
    "/root/.cache/ms-playwright/chromium-1148/chrome-linux/chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/snap/bin/chromium",
  ];
  return candidates.find((file) => existsSync(file));
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const executablePath = resolveChromePath();
    browserPromise = chromium
      .launch({
        headless: true,
        executablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--font-render-hinting=none",
        ],
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

export async function buildProgramPdfBuffer(
  program: SavedAiProgram
): Promise<Buffer> {
  const [branding, config, assets] = await Promise.all([
    getBranding(),
    getGeminiPublicConfig(),
    loadPdfAssets(),
  ]);

  const model: ProgramPdfModel = {
    ...program,
    brandName:
      branding.brandNameAr || branding.brandNameEn || "الريان للسياحة",
    whatsappNumber: config.salesWhatsApp,
    fontDataUri: assets.fontDataUri,
    logoDataUri: assets.logoDataUri,
  };

  const html = renderProgramHtml(model);
  return renderHtmlToPdf(html);
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map(
          (img) =>
            img.complete ||
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "8mm", bottom: "10mm", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => undefined);
  }
}

export async function closeProgramPdfBrowser(): Promise<void> {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    /* already closed */
  } finally {
    browserPromise = null;
  }
}
