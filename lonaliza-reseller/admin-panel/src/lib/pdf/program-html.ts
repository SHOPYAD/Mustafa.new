import { promises as fs } from "fs";
import path from "path";
import { PHOTO } from "@/data/catalog-photos";
import {
  PRICE_ESTIMATE_AR,
  digitsWhatsApp,
  whatsappMeUrl,
} from "@/lib/sales-price-copy";
import type { SavedAiProgram } from "@/types/ai-program";
import type { SalesChatCard } from "@/types/sales-chat";

export type ProgramPdfModel = SavedAiProgram & {
  cards?: SalesChatCard[];
  whatsappNumber?: string;
  brandName?: string;
  logoDataUri?: string;
  fontDataUri?: string;
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(raw: unknown): string {
  const url = String(raw || "").trim();
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  if (/^https?:\/\//i.test(url) && !/^https?:\/\/javascript/i.test(url)) {
    return url;
  }
  return "";
}

function money(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString("en-US")} $USD`;
}

function coverFor(program: SavedAiProgram): string {
  const thumb = safeUrl(program.thumbnail);
  if (thumb) return thumb;
  const d = `${program.destination} ${program.titleEn} ${program.titleAr}`.toLowerCase();
  if (/antalya|أنطاليا|belek|kemer|lara/.test(d)) return PHOTO.antalyaCoast;
  if (/trabzon|طرابزون|ayder|uzungol|أوزنجول/.test(d)) return PHOTO.alpineLake;
  if (/cappadocia|kapadokya|كابادوكيا/.test(d)) return PHOTO.cappadociaBalloons;
  if (/istanbul|إسطنبول|اسطنبول/.test(d)) return PHOTO.istanbulSkyline;
  if (/sapanca|سبانجا/.test(d)) return PHOTO.forest;
  return PHOTO.luxuryHotel;
}

export async function loadPdfAssets(): Promise<{
  fontDataUri: string;
  logoDataUri: string;
}> {
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoNaskhArabic-Regular.ttf"
  );
  const fontBuf = await fs.readFile(fontPath);
  const fontDataUri = `data:font/ttf;base64,${fontBuf.toString("base64")}`;

  const logoCandidates = [
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "public", "brand-logo.png"),
  ];
  let logoDataUri = "";
  for (const candidate of logoCandidates) {
    try {
      const buf = await fs.readFile(candidate);
      logoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
      break;
    } catch {
      /* try next */
    }
  }
  return { fontDataUri, logoDataUri };
}

export function renderProgramHtml(model: ProgramPdfModel): string {
  const brand = esc(model.brandName || "لوناليزا للسياحة");
  const title = esc(model.titleAr || model.titleEn);
  const titleEn =
    model.titleEn && model.titleEn !== model.titleAr ? esc(model.titleEn) : "";
  const dest = esc(model.destination);
  const cover = coverFor(model);
  const includes = (model.includesAr.length ? model.includesAr : model.includesEn)
    .map((item) => esc(item))
    .filter(Boolean);
  const days = model.itinerary?.days || [];
  const cards = Array.isArray(model.cards) ? model.cards : [];
  const wa = digitsWhatsApp(model.whatsappNumber || "");
  const waUrl = whatsappMeUrl(wa);
  const price =
    model.priceFromUsd ||
    model.itinerary?.totalClientPrice ||
    0;
  const dates =
    model.arrivalDate || model.departureDate
      ? `${model.arrivalDate || "—"} → ${model.departureDate || "—"}`
      : "";

  const includeCards = includes
    .map(
      (item) =>
        `<div class="include">${item}</div>`
    )
    .join("");

  const dayCards = days
    .map((day, i) => {
      const dayTitle = esc(day.titleAr || day.titleEn || "");
      const detail = esc(day.detailAr || day.detailEn || "");
      return `<article class="day">
        <h3>اليوم ${esc(day.day || i + 1)}${dayTitle ? ` — ${dayTitle}` : ""}</h3>
        ${detail ? `<p>${detail}</p>` : ""}
      </article>`;
    })
    .join("");

  const offerCards = cards
    .filter((c) => c && (c.titleAr || c.titleEn))
    .map((c) => {
      const img = safeUrl(c.image);
      const ctitle = esc(c.titleAr || c.titleEn);
      const sub = esc(c.subtitleAr || c.subtitleEn || "");
      const type = esc(c.type || "");
      const pending = Boolean(c.pricePending) || Number(c.clientPrice) <= 0;
      const cprice = pending ? "يتحدد عند التأكيد" : `من ${money(c.clientPrice)}`;
      return `<article class="offer">
        ${img ? `<img src="${esc(img)}" alt="" />` : ""}
        <div>
          <span class="badge">${type}</span>
          <h4>${ctitle}</h4>
          ${sub ? `<p>${sub}</p>` : ""}
          <strong>${esc(cprice)}</strong>
        </div>
      </article>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    @font-face {
      font-family: "Noto Naskh Arabic";
      src: url("${model.fontDataUri || ""}") format("truetype");
      font-weight: 400 700;
      font-style: normal;
      font-display: block;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+0000-00FF;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #071018;
      color: #e8eef6;
      font-family: "Noto Naskh Arabic", "Noto Naskh Arabic UI", Tahoma, sans-serif;
      direction: rtl;
      text-align: right;
      -webkit-font-smoothing: antialiased;
    }
    body { font-size: 13.5px; line-height: 1.75; }
    .page { width: 100%; }
    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 22px 10px;
    }
    .brand img { height: 42px; width: auto; }
    .brand-name { color: #34d399; font-size: 16px; font-weight: 700; }
    .cover {
      position: relative;
      height: 220px;
      margin: 0 18px 16px;
      border-radius: 18px;
      overflow: hidden;
      background: #0c1a2e;
    }
    .cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cover::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #071018 0%, rgba(7,16,24,.15) 55%, transparent 100%);
    }
    h1 {
      margin: 0 22px 6px;
      font-size: 24px;
      line-height: 1.45;
      color: #fff;
    }
    .en { margin: 0 22px 14px; color: #94a3b8; font-size: 13px; }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0 22px 18px;
    }
    .pill {
      background: #10b981;
      color: #042f24;
      font-weight: 700;
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 14px;
    }
    .chip {
      background: #0d1c30;
      border: 1px solid rgba(255,255,255,.08);
      color: #dbeafe;
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 12px;
    }
    h2 {
      margin: 8px 22px 10px;
      color: #34d399;
      font-size: 15px;
    }
    .includes {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin: 0 22px 18px;
    }
    .include {
      background: #0d1c30;
      border: 1px solid rgba(16,185,129,.18);
      border-radius: 12px;
      padding: 10px 12px;
      color: #e2e8f0;
    }
    .day {
      background: #0d1c30;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      margin: 0 22px 10px;
      padding: 12px 14px;
      page-break-inside: avoid;
    }
    .day h3 { margin: 0 0 6px; color: #34d399; font-size: 14px; }
    .day p { margin: 0; color: #cbd5e1; }
    .offer {
      display: flex;
      gap: 12px;
      margin: 0 22px 10px;
      background: #0d1c30;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.08);
      page-break-inside: avoid;
    }
    .offer img { width: 110px; height: 86px; object-fit: cover; }
    .offer div { padding: 10px 12px 10px 0; }
    .offer h4 { margin: 4px 0; color: #fff; font-size: 14px; }
    .offer p { margin: 0; color: #94a3b8; font-size: 12px; }
    .badge {
      display: inline-block;
      color: #6ee7b7;
      font-size: 11px;
    }
    .note {
      margin: 18px 22px 8px;
      background: #052e26;
      border: 1px solid rgba(16,185,129,.35);
      color: #d1fae5;
      border-radius: 12px;
      padding: 12px 14px;
      page-break-inside: avoid;
    }
    .wa {
      margin: 0 22px 22px;
      text-align: center;
    }
    .wa a {
      display: inline-block;
      background: #25D366;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      border-radius: 12px;
      padding: 10px 18px;
    }
    .foot {
      margin: 8px 22px 18px;
      color: #64748b;
      font-size: 11px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">
      ${model.logoDataUri ? `<img src="${model.logoDataUri}" alt="${brand}" />` : ""}
      <div class="brand-name">${brand}</div>
    </div>
    <div class="cover">
      <img src="${esc(cover)}" alt="" />
    </div>
    <h1>${title}</h1>
    ${titleEn ? `<p class="en">${titleEn}</p>` : ""}
    <div class="meta">
      ${price > 0 ? `<span class="pill">من ${esc(money(price))}</span>` : ""}
      ${model.people ? `<span class="chip">${esc(model.people)} أشخاص</span>` : ""}
      ${model.nights ? `<span class="chip">${esc(model.nights)} ليالٍ</span>` : ""}
      ${dest ? `<span class="chip">${dest}</span>` : ""}
      ${dates ? `<span class="chip">${esc(dates)}</span>` : ""}
    </div>
    ${
      includeCards
        ? `<h2>يشمل</h2><div class="includes">${includeCards}</div>`
        : ""
    }
    ${
      dayCards
        ? `<h2>${esc(model.itinerary?.titleAr || model.itinerary?.titleEn || "البرنامج")}</h2>${dayCards}`
        : ""
    }
    ${offerCards ? `<h2>الفنادق والخدمات</h2>${offerCards}` : ""}
    <div class="note">${esc(PRICE_ESTIMATE_AR)}</div>
    ${
      waUrl
        ? `<p class="wa"><a href="${esc(waUrl)}">للتأكيد تواصل واتساب ${esc(wa)}</a></p>`
        : ""
    }
    <p class="foot">لوناليزا للسياحة — Lonaliza Tourism — lonaliza.com</p>
  </div>
</body>
</html>`;
}
