import { existsSync } from "fs";
import path from "path";
import PDFDocument from "pdfkit";
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
  program: SavedAiProgram,
  locale?: string
): Promise<Buffer> {
  const [branding, config, assets] = await Promise.all([
    getBranding(),
    getGeminiPublicConfig(),
    loadPdfAssets(),
  ]);

  const loc = (locale === "en" || locale === "tr" || locale === "fr" ? locale : "ar") as "ar" | "en" | "tr" | "fr";
  const brandName = loc === "ar"
    ? (branding.brandNameAr || branding.brandNameEn || "لوناليزا للسياحة والسفر VIP")
    : (branding.brandNameEn || branding.brandNameAr || "Lonaliza Travel VIP");

  const model: ProgramPdfModel = {
    ...program,
    locale: loc,
    brandName,
    whatsappNumber: config.salesWhatsApp,
    fontDataUri: assets.fontDataUri,
    logoDataUri: assets.logoDataUri,
  };

  const html = renderProgramHtml(model);
  try {
    return await renderHtmlToPdf(html);
  } catch {
    return textProgramPdf(program);
  }
}

function textProgramPdf(program: SavedAiProgram): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoNaskhArabic-Regular.ttf");
  const doc = new PDFDocument({ size: "A4", margin: 42 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  try {
    if (existsSync(fontPath)) doc.font(fontPath);
  } catch {
    /* default font */
  }
  doc.fontSize(18).text(program.titleAr || program.titleEn || "Lonaliza", { align: "right" });
  doc.moveDown(0.4);
  doc.fontSize(11).text(`${program.destination} · ${program.arrivalDate || ""} → ${program.departureDate || ""}`, {
    align: "right",
  });
  doc.moveDown();
  for (const day of program.itinerary?.days || []) {
    doc.fontSize(13).text(`اليوم ${day.day} — ${day.titleAr || day.titleEn || ""}`, { align: "right" });
    doc.moveDown(0.2);
    doc.fontSize(11).text(day.detailAr || day.detailEn || "", { align: "right" });
    const places = (day.items || [])
      .map((it) => it.labelAr || it.labelEn)
      .filter(Boolean)
      .join(" · ");
    if (places) {
      doc.moveDown(0.2);
      doc.fontSize(10).text(places, { align: "right" });
    }
    doc.moveDown();
  }
  if (program.priceFromUsd) {
    doc.fontSize(12).text(`الإجمالي التقريبي ${Math.round(program.priceFromUsd)} USD`, { align: "right" });
  }
  doc.end();
  return done;
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 12000,
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
