/**
 * Visual email document — shared client/server.
 * Brand identity is injected at render time from site branding settings.
 */

import { normalizeUploadSrc, resolveEmailImageSrc } from "@/lib/email/image-src";
import { defaultDirForCode } from "@/lib/i18n/catalog";

export const EMAIL_DOC_MARKER = "<!--ALRAYYAN_EMAIL_DOC_V1-->";
export const EMAIL_LOGO_START = "<!--EMAIL_LOGO_START-->";
export const EMAIL_LOGO_END = "<!--EMAIL_LOGO_END-->";
export const EMAIL_FOOTER_START = "<!--EMAIL_FOOTER_START-->";
export const EMAIL_FOOTER_END = "<!--EMAIL_FOOTER_END-->";

export const EMAIL_VISUAL_VARIABLES = [
  "name",
  "company",
  "bookingId",
  "booking_id",
  "amount",
  "cta_url",
] as const;

export const EMAIL_LINK_KEYS = [
  "home",
  "hotels",
  "flights",
  "account",
  "booking",
  "custom",
] as const;

export type EmailLinkKey = (typeof EMAIL_LINK_KEYS)[number];

export const EMAIL_BLOCK_TYPES = [
  "header",
  "heading",
  "paragraph",
  "button",
  "image",
  "bookingTable",
  "divider",
  "footer",
] as const;

export type EmailBlockType = (typeof EMAIL_BLOCK_TYPES)[number];

export type EmailBlockAlign = "right" | "center" | "left";

export type EmailBrandLite = {
  brandNameAr: string;
  brandNameEn: string;
  brandNameTr?: string;
  logoUrl: string;
  primary: string;
  accent: string;
  button: string;
  phone: string;
  email: string;
  address: string;
  siteUrl: string;
  siteHost: string;
};

export type EmailBlock = {
  id: string;
  type: EmailBlockType;
  text?: string;
  color?: string;
  background?: string;
  align?: EmailBlockAlign;
  hrefKey?: EmailLinkKey;
  customUrl?: string;
  src?: string;
  alt?: string;
  rows?: Array<{ label: string; value: string }>;
  logoBackground?: "transparent" | "brand";
};

export type EmailVisualDocument = {
  version: 1;
  canvasBg: string;
  cardBg: string;
  blocks: EmailBlock[];
};

export type EmailSiteLink = {
  key: EmailLinkKey;
  labelAr: string;
  labelEn: string;
  path: string;
};

export const EMAIL_SITE_LINKS: EmailSiteLink[] = [
  { key: "home", labelAr: "الرئيسية", labelEn: "Home", path: "/" },
  { key: "hotels", labelAr: "الفنادق", labelEn: "Hotels", path: "/hotels" },
  { key: "flights", labelAr: "الطيران", labelEn: "Flights", path: "/flights" },
  { key: "account", labelAr: "حسابي", labelEn: "Account", path: "/account" },
  { key: "booking", labelAr: "رابط الحجز", labelEn: "Booking link", path: "{{cta_url}}" },
  { key: "custom", labelAr: "رابط مخصّص", labelEn: "Custom URL", path: "" },
];

export function newBlockId(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isEmailBlockType(value: string): value is EmailBlockType {
  return (EMAIL_BLOCK_TYPES as readonly string[]).includes(value);
}

export function isEmailLinkKey(value: string): value is EmailLinkKey {
  return (EMAIL_LINK_KEYS as readonly string[]).includes(value);
}

function assertNeverBlock(type: never): never {
  throw new Error(`Unhandled email block: ${String(type)}`);
}

export function escHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function applyEmailPlaceholders(
  source: string,
  vars: Record<string, string>
): string {
  const map: Record<string, string> = { ...vars };
  if (map.bookingId && !map.booking_id) map.booking_id = map.bookingId;
  if (map.booking_id && !map.bookingId) map.bookingId = map.booking_id;
  let out = source || "";
  for (const [key, value] of Object.entries(map)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

export function resolveEmailHref(
  block: EmailBlock,
  brand: EmailBrandLite
): string {
  const key = block.hrefKey || "home";
  switch (key) {
    case "home":
      return brand.siteUrl;
    case "hotels":
      return `${brand.siteUrl}/hotels`;
    case "flights":
      return `${brand.siteUrl}/flights`;
    case "account":
      return `${brand.siteUrl}/account`;
    case "booking":
      return "{{cta_url}}";
    case "custom": {
      const raw = String(block.customUrl || "").trim();
      if (!raw) return brand.siteUrl;
      if (raw.startsWith("{{") && raw.endsWith("}}")) return raw;
      if (/^https?:\/\//i.test(raw)) return raw;
      if (raw.startsWith("/")) return `${brand.siteUrl}${raw}`;
      return brand.siteUrl;
    }
    default:
      return assertNeverBlock(key);
  }
}

export function defaultVisualDocument(brand: EmailBrandLite): EmailVisualDocument {
  return {
    version: 1,
    canvasBg: "#f4efe6",
    cardBg: "#ffffff",
    blocks: [
      {
        id: newBlockId(),
        type: "header",
        logoBackground: "brand",
        background: brand.accent,
      },
      {
        id: newBlockId(),
        type: "heading",
        text: "مرحباً {{name}}",
        color: "#122033",
        align: "right",
      },
      {
        id: newBlockId(),
        type: "paragraph",
        text: `رسالة من ${brand.brandNameAr}. يمكنك تخصيص النص والألوان والأزرار من المحرر.`,
        color: "#5b4d3e",
        align: "right",
      },
      {
        id: newBlockId(),
        type: "button",
        text: "تصفّح العروض",
        hrefKey: "home",
        background: brand.button,
        color: "#ffffff",
        align: "center",
      },
      {
        id: newBlockId(),
        type: "divider",
        color: "#e4d8c4",
      },
      {
        id: newBlockId(),
        type: "footer",
        background: "#faf6ef",
        color: "#6b5b4b",
      },
    ],
  };
}

export function createBlock(
  type: EmailBlockType,
  brand: EmailBrandLite
): EmailBlock {
  const id = newBlockId();
  switch (type) {
    case "header":
      return { id, type, logoBackground: "brand", background: brand.accent };
    case "heading":
      return {
        id,
        type,
        text: "عنوان الرسالة",
        color: "#122033",
        align: "right",
      };
    case "paragraph":
      return {
        id,
        type,
        text: "اكتب الفقرة هنا. استخدم {{name}} و {{company}} و {{bookingId}} و {{amount}}.",
        color: "#5b4d3e",
        align: "right",
      };
    case "button":
      return {
        id,
        type,
        text: "زر الإجراء",
        hrefKey: "hotels",
        background: brand.button,
        color: "#ffffff",
        align: "center",
      };
    case "image":
      return {
        id,
        type,
        src: brand.logoUrl,
        alt: brand.brandNameAr,
        align: "center",
      };
    case "bookingTable":
      return {
        id,
        type,
        background: "#faf6ef",
        rows: [
          { label: "رقم الحجز", value: "{{bookingId}}" },
          { label: "الشركة", value: "{{company}}" },
          { label: "المبلغ", value: "{{amount}}" },
        ],
      };
    case "divider":
      return { id, type, color: "#e4d8c4" };
    case "footer":
      return { id, type, background: "#faf6ef", color: "#6b5b4b" };
    default:
      return assertNeverBlock(type);
  }
}

export function sanitizeVisualDocument(
  raw: unknown,
  brand: EmailBrandLite
): EmailVisualDocument {
  const fallback = defaultVisualDocument(brand);
  if (!raw || typeof raw !== "object") return fallback;
  const rec = raw as Record<string, unknown>;
  const blocksRaw = Array.isArray(rec.blocks) ? rec.blocks : [];
  const blocks = blocksRaw
    .map((item) => sanitizeBlock(item))
    .filter((item): item is EmailBlock => item != null);
  return {
    version: 1,
    canvasBg: asColor(rec.canvasBg, fallback.canvasBg),
    cardBg: asColor(rec.cardBg, fallback.cardBg),
    blocks: blocks.length > 0 ? blocks : fallback.blocks,
  };
}

function asColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
    return trimmed;
  }
  if (trimmed === "transparent") return trimmed;
  return fallback;
}

function sanitizeBlock(raw: unknown): EmailBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const type = String(rec.type || "");
  if (!isEmailBlockType(type)) return null;
  const alignRaw = String(rec.align || "right");
  const align: EmailBlockAlign =
    alignRaw === "center" || alignRaw === "left" || alignRaw === "right"
      ? alignRaw
      : "right";
  const hrefKey = isEmailLinkKey(String(rec.hrefKey || ""))
    ? (rec.hrefKey as EmailLinkKey)
    : undefined;
  const rows = Array.isArray(rec.rows)
    ? rec.rows
        .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
        .map((row) => ({
          label: String(row.label || ""),
          value: String(row.value || ""),
        }))
        .filter((row) => row.label || row.value)
    : undefined;
  return {
    id: String(rec.id || newBlockId()),
    type,
    text: typeof rec.text === "string" ? rec.text : undefined,
    color: typeof rec.color === "string" ? rec.color : undefined,
    background: typeof rec.background === "string" ? rec.background : undefined,
    align,
    hrefKey,
    customUrl: typeof rec.customUrl === "string" ? rec.customUrl : undefined,
    src: typeof rec.src === "string" ? normalizeUploadSrc(rec.src) : undefined,
    alt: typeof rec.alt === "string" ? rec.alt : undefined,
    rows,
    logoBackground: rec.logoBackground === "transparent" ? "transparent" : "brand",
  };
}

export function extractVisualDocument(
  html: string,
  brand: EmailBrandLite
): EmailVisualDocument | null {
  const marker = html.indexOf(EMAIL_DOC_MARKER);
  if (marker < 0) return null;
  const jsonStart = html.indexOf("{", marker + EMAIL_DOC_MARKER.length);
  if (jsonStart < 0) return null;
  let depth = 0;
  let end = -1;
  for (let i = jsonStart; i < html.length; i += 1) {
    const ch = html[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return null;
  try {
    const parsed = JSON.parse(html.slice(jsonStart, end + 1)) as unknown;
    return sanitizeVisualDocument(parsed, brand);
  } catch {
    return null;
  }
}

export function embedVisualDocument(
  compiledHtml: string,
  doc: EmailVisualDocument
): string {
  return `${EMAIL_DOC_MARKER}\n<!--${JSON.stringify(doc)}-->\n${compiledHtml}`;
}

function brandNameForLite(brand: EmailBrandLite, locale = "ar"): string {
  if (locale === "en") return brand.brandNameEn || brand.brandNameAr;
  if (locale === "tr") return brand.brandNameTr || brand.brandNameEn || brand.brandNameAr;
  return brand.brandNameAr || brand.brandNameEn;
}

export function documentToPlainText(
  doc: EmailVisualDocument,
  brand: EmailBrandLite,
  locale = "ar"
): string {
  const parts: string[] = [];
  for (const block of doc.blocks) {
    switch (block.type) {
      case "header":
        parts.push(brandNameForLite(brand, locale));
        break;
      case "heading":
      case "paragraph":
      case "button":
        if (block.text) parts.push(block.text);
        break;
      case "image":
        if (block.alt) parts.push(block.alt);
        break;
      case "bookingTable":
        for (const row of block.rows || []) {
          parts.push(`${row.label}: ${row.value}`);
        }
        break;
      case "divider":
        break;
      case "footer":
        parts.push(`${brandNameForLite(brand, locale)} · ${brand.siteHost}`);
        break;
      default:
        assertNeverBlock(block.type);
    }
  }
  return parts.filter(Boolean).join("\n");
}

function logoImg(brand: EmailBrandLite, alt: string): string {
  const src = escHtml(brand.logoUrl);
  const label = escHtml(alt || brand.brandNameAr);
  return `<img src="${src}" alt="${label}" width="220" style="display:block;margin:0 auto;max-width:220px;width:auto;height:auto;max-height:72px;object-fit:contain;background:transparent;border:0;outline:none;" />`;
}

function renderBlock(block: EmailBlock, brand: EmailBrandLite, locale = "ar"): string {
  switch (block.type) {
    case "header": {
      const bg =
        block.logoBackground === "transparent"
          ? "transparent"
          : escHtml(block.background || brand.accent);
      const name = escHtml(brandNameForLite(brand, locale));
      const wordmark = `<div style="margin-top:10px;font-size:16px;font-weight:700;color:${
        block.logoBackground === "transparent" ? escHtml(brand.accent) : "#ffffff"
      };">${name}</div>`;
      return `<tr><td style="background:${bg};padding:22px 28px 18px;text-align:center;">
        ${EMAIL_LOGO_START}${logoImg(brand, brandNameForLite(brand, locale))}${EMAIL_LOGO_END}
        ${wordmark}
      </td></tr>`;
    }
    case "heading": {
      const color = escHtml(block.color || "#122033");
      const align = block.align || (defaultDirForCode(locale) === "rtl" ? "right" : "left");
      const dir = defaultDirForCode(locale);
      return `<tr><td style="padding:22px 28px 8px;text-align:${align};direction:${dir};">
        <h1 style="margin:0;font-size:22px;line-height:1.45;color:${color};font-weight:700;">${escHtml(
          block.text || ""
        )}</h1>
      </td></tr>`;
    }
    case "paragraph": {
      const color = escHtml(block.color || "#5b4d3e");
      const align = block.align || (defaultDirForCode(locale) === "rtl" ? "right" : "left");
      const dir = defaultDirForCode(locale);
      return `<tr><td style="padding:6px 28px 10px;text-align:${align};direction:${dir};">
        <p style="margin:0;font-size:15px;line-height:1.85;color:${color};white-space:pre-wrap;">${escHtml(
          block.text || ""
        )}</p>
      </td></tr>`;
    }
    case "button": {
      const href = escHtml(resolveEmailHref(block, brand));
      const bg = escHtml(block.background || brand.button);
      const color = escHtml(block.color || "#ffffff");
      const align = block.align || "center";
      const label = escHtml(block.text || "افتح الصفحة");
      return `<tr><td style="padding:16px 28px;text-align:${align};">
        <a href="${href}" style="display:inline-block;background:${bg};color:${color};text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:700;font-size:14px;">${label}</a>
      </td></tr>`;
    }
    case "image": {
      const src = escHtml(
        resolveEmailImageSrc(block.src || brand.logoUrl, brand.siteUrl)
      );
      const alt = escHtml(block.alt || brand.brandNameAr);
      const align = block.align || "center";
      return `<tr><td style="padding:12px 28px;text-align:${align};">
        <img src="${src}" alt="${alt}" style="display:inline-block;max-width:100%;width:auto;height:auto;object-fit:contain;background:transparent;border:0;" />
      </td></tr>`;
    }
    case "bookingTable": {
      const bg = escHtml(block.background || "#faf6ef");
      const rows = (block.rows || [])
        .map(
          (row) =>
            `<tr>
              <td style="padding:8px 0;color:#6b5b4b;font-size:13px;text-align:right;">${escHtml(row.label)}</td>
              <td style="padding:8px 0;font-weight:700;font-size:13px;text-align:left;color:#122033;">${escHtml(row.value)}</td>
            </tr>`
        )
        .join("");
      return `<tr><td style="padding:10px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:12px;padding:8px 16px;">${rows}</table>
      </td></tr>`;
    }
    case "divider": {
      const color = escHtml(block.color || "#e4d8c4");
      return `<tr><td style="padding:8px 28px;"><div style="border-top:1px solid ${color};font-size:0;line-height:0;">&nbsp;</div></td></tr>`;
    }
    case "footer": {
      const bg = escHtml(block.background || "#faf6ef");
      const color = escHtml(block.color || "#6b5b4b");
      const extras = [brand.address, [brand.phone, brand.email].filter(Boolean).join(" · ")]
        .filter(Boolean)
        .map((line) => `<div>${escHtml(line)}</div>`)
        .join("");
      return `<tr><td style="background:${bg};padding:18px 28px;color:${color};font-size:12px;line-height:1.7;text-align:center;">
        ${EMAIL_FOOTER_START}<div style="font-weight:700;color:${escHtml(brand.accent)};margin-bottom:4px;">${escHtml(brandNameForLite(brand, locale))}</div>
        ${extras}
        <div><a href="${escHtml(brand.siteUrl)}" style="color:${escHtml(brand.button)};text-decoration:none;">${escHtml(brand.siteHost)}</a></div>${EMAIL_FOOTER_END}
      </td></tr>`;
    }
    default:
      return assertNeverBlock(block.type);
  }
}

export function compileVisualEmail(
  doc: EmailVisualDocument,
  brand: EmailBrandLite,
  locale = "ar"
): string {
  const canvas = escHtml(doc.canvasBg || "#f4efe6");
  const card = escHtml(doc.cardBg || "#ffffff");
  const dir = defaultDirForCode(locale);
  const inner = doc.blocks.map((block) => renderBlock(block, brand, locale)).join("\n");
  return `<!DOCTYPE html>
<html lang="${escHtml(locale)}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(brandNameForLite(brand, locale))}</title>
</head>
<body style="margin:0;padding:0;background:${canvas};font-family:Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${canvas};padding:24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${card};border-radius:18px;overflow:hidden;border:1px solid #eadfcd;">
          ${inner}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function blockLabelAr(type: EmailBlockType): string {
  switch (type) {
    case "header":
      return "ترويسة الشعار";
    case "heading":
      return "عنوان";
    case "paragraph":
      return "فقرة";
    case "button":
      return "زر CTA";
    case "image":
      return "صورة";
    case "bookingTable":
      return "جدول الحجز";
    case "divider":
      return "فاصل";
    case "footer":
      return "تذييل البراند";
    default:
      return assertNeverBlock(type);
  }
}
