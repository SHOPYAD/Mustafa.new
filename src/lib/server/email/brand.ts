import { promises as fs } from "fs";
import path from "path";
import { brandNameForLocale, DEFAULT_BRANDING } from "@/data/branding";
import { defaultDirForCode } from "@/lib/i18n/catalog";
import { getBranding } from "@/lib/server/branding-store";
import { SITE_PUBLIC_URL } from "@/lib/pocketbase/constants";
import type { EmailBrandLite } from "@/lib/email/visual-doc";

export type EmailBrand = EmailBrandLite;

const CONTACT_FILE = path.join(process.cwd(), ".data", "site-contact.json");

const DEMO_CONTACT_RE =
  /oktravel|oktravels|business\s*bay|dubai|دبي|الإمارات العربية المتحدة|united arab emirates/i;

function absoluteUrl(raw: string): string {
  const value = String(raw || "").trim();
  if (!value) return `${SITE_PUBLIC_URL}/logo.png`;
  if (value.startsWith("data:image/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SITE_PUBLIC_URL}${value}`;
  return `${SITE_PUBLIC_URL}/logo.png`;
}

function cleanContact(value: unknown): string {
  const trimmed = String(value ?? "").replace(/\n/g, " · ").trim();
  if (!trimmed) return "";
  if (DEMO_CONTACT_RE.test(trimmed)) return "";
  return trimmed;
}

type StoredContact = {
  email?: string;
  address?: string;
  callbackPhone?: string;
  customerServicePhones?: string[];
};

async function readLiveSiteContact(): Promise<{
  phone: string;
  email: string;
  address: string;
}> {
  try {
    const raw = await fs.readFile(CONTACT_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredContact;
    const phone = cleanContact(
      parsed.customerServicePhones?.[0] || parsed.callbackPhone || ""
    );
    return {
      phone,
      email: cleanContact(parsed.email),
      address: cleanContact(parsed.address),
    };
  } catch {
    return { phone: "", email: "", address: "" };
  }
}

export async function getEmailBrand(): Promise<EmailBrand> {
  const branding = await getBranding();
  const contact = await readLiveSiteContact();
  return {
    brandNameAr: branding.brandNameAr || "لوناليزا للسياحة والسفر",
    brandNameEn: branding.brandNameEn || "Lonaliza Travel",
    brandNameTr: branding.brandNameTr || branding.brandNameEn || "Lonaliza Turizm",
    logoUrl: absoluteUrl(branding.logoUrl || "/logo.png"),
    primary: branding.colors.primary || "#10b981",
    accent: branding.colors.accent || "#0a1628",
    button: branding.colors.button || branding.colors.primary || "#10b981",
    phone: contact.phone || branding.supportPhone,
    email: contact.email || branding.supportEmail,
    address: contact.address,
    siteUrl: SITE_PUBLIC_URL,
    siteHost: SITE_PUBLIC_URL.replace(/^https?:\/\//, ""),
  };
}

export function escHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function applyEmailVars(source: string, vars: Record<string, string>): string {
  const map: Record<string, string> = { ...vars };
  if (map.bookingId && !map.booking_id) map.booking_id = map.bookingId;
  if (map.booking_id && !map.bookingId) map.bookingId = map.booking_id;
  let out = source || "";
  for (const [key, value] of Object.entries(map)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

export function stringifyVars(vars: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    out[key] = value == null ? "" : String(value);
  }
  if (out.bookingId && !out.booking_id) out.booking_id = out.bookingId;
  if (out.booking_id && !out.bookingId) out.bookingId = out.booking_id;
  return out;
}

export const FALLBACK_RECIPIENT_NAME_AR = "العميل العزيز";
export const FALLBACK_RECIPIENT_NAME_EN = "Dear customer";
export const FALLBACK_RECIPIENT_NAME_TR = "Değerli müşterimiz";

export function displayRecipientName(name?: unknown, locale = "ar"): string {
  const trimmed = String(name ?? "").trim();
  if (trimmed) return trimmed;
  if (locale === "en") return FALLBACK_RECIPIENT_NAME_EN;
  if (locale === "tr") return FALLBACK_RECIPIENT_NAME_TR;
  return FALLBACK_RECIPIENT_NAME_AR;
}

export function brandDisplayName(brand: EmailBrand, locale = "ar"): string {
  return brandNameForLocale(
    {
      ...DEFAULT_BRANDING,
      brandNameAr: brand.brandNameAr,
      brandNameEn: brand.brandNameEn,
      brandNameTr: brand.brandNameTr || brand.brandNameEn,
    },
    locale
  );
}

/** CID token only — nodemailer wraps Content-ID as <token>. Do not add extra brackets. */
export function emailLogoCid(domain: string): string {
  const host = String(domain || "")
    .replace(/[<>\s]/g, "")
    .toLowerCase();
  return `brand-logo@${host && !host.includes("example.com") ? host : "lonaliza.com"}`;
}

export const EMAIL_LOGO_CID = emailLogoCid("lonaliza.com");
export const EMAIL_LOGO_START = "<!--EMAIL_LOGO_START-->";
export const EMAIL_LOGO_END = "<!--EMAIL_LOGO_END-->";
export const EMAIL_FOOTER_START = "<!--EMAIL_FOOTER_START-->";
export const EMAIL_FOOTER_END = "<!--EMAIL_FOOTER_END-->";

export function emailBrandFromDefaults(): EmailBrand {
  return {
    brandNameAr: DEFAULT_BRANDING.brandNameAr,
    brandNameEn: DEFAULT_BRANDING.brandNameEn,
    brandNameTr: DEFAULT_BRANDING.brandNameTr,
    logoUrl: absoluteUrl(DEFAULT_BRANDING.logoUrl),
    primary: DEFAULT_BRANDING.colors.primary,
    accent: DEFAULT_BRANDING.colors.accent,
    button: DEFAULT_BRANDING.colors.button,
    phone: "",
    email: "",
    address: "",
    siteUrl: SITE_PUBLIC_URL,
    siteHost: SITE_PUBLIC_URL.replace(/^https?:\/\//, ""),
  };
}

export function emailLogoWordmark(brand: EmailBrand, locale = "ar"): string {
  const name = escHtml(brandDisplayName(brand, locale));
  return `<div style="font-weight:700;font-size:20px;line-height:1.3;color:#ffffff;text-align:center;">${name}</div>`;
}

export function emailLogoInner(
  brand: EmailBrand,
  src?: string | null,
  locale = "ar"
): string {
  const name = escHtml(brandDisplayName(brand, locale));
  if (!src) return emailLogoWordmark(brand, locale);
  return `<img src="${escHtml(src)}" alt="${name}" width="220" style="display:block;margin:0 auto;max-width:220px;width:auto;height:auto;max-height:72px;object-fit:contain;background:transparent;border:0;outline:none;" />`;
}

export function emailFooterInner(brand: EmailBrand, locale = "ar"): string {
  const extras = [brand.address, [brand.phone, brand.email].filter(Boolean).join(" · ")]
    .filter(Boolean)
    .map((line) => `<div>${escHtml(line)}</div>`)
    .join("");
  return `<div style="font-weight:700;color:${escHtml(brand.accent)};margin-bottom:4px;">${escHtml(brandDisplayName(brand, locale))}</div>
${extras}
<div><a href="${escHtml(brand.siteUrl)}" style="color:${escHtml(brand.button)};text-decoration:none;">${escHtml(brand.siteHost)}</a></div>`;
}

function replaceMarked(html: string, start: string, end: string, inner: string): string {
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from < 0 || to < 0 || to <= from) return html;
  return `${html.slice(0, from + start.length)}${inner}${html.slice(to)}`;
}

export type StampChromeOptions = {
  logoSrc?: string | null;
  locale?: string;
};

export function stampEmailChrome(
  html: string,
  brand: EmailBrand,
  options: StampChromeOptions = {}
): string {
  const locale = options.locale || "ar";
  const logoSrc = options.logoSrc === undefined ? brand.logoUrl : options.logoSrc;
  let out = String(html || "");
  if (out.includes(EMAIL_LOGO_START) && out.includes(EMAIL_LOGO_END)) {
    out = replaceMarked(
      out,
      EMAIL_LOGO_START,
      EMAIL_LOGO_END,
      emailLogoInner(brand, logoSrc, locale)
    );
  } else if (options.logoSrc !== undefined) {
    if (options.logoSrc) {
      out = out.split(brand.logoUrl).join(options.logoSrc);
    } else {
      out = out.replace(
        /<img\b[^>]*src=["'][^"']+["'][^>]*>/i,
        emailLogoWordmark(brand, locale)
      );
    }
  }
  if (out.includes(EMAIL_FOOTER_START) && out.includes(EMAIL_FOOTER_END)) {
    out = replaceMarked(out, EMAIL_FOOTER_START, EMAIL_FOOTER_END, emailFooterInner(brand, locale));
  }
  const dir = defaultDirForCode(locale);
  out = out.replace(/<html\b[^>]*>/i, `<html lang="${escHtml(locale)}" dir="${dir}">`);
  return out;
}

export function applyEmailLogoSrc(
  html: string,
  src: string | null,
  brand: EmailBrand,
  locale = "ar"
): string {
  if (html.includes(EMAIL_LOGO_START) && html.includes(EMAIL_LOGO_END)) {
    return replaceMarked(html, EMAIL_LOGO_START, EMAIL_LOGO_END, emailLogoInner(brand, src, locale));
  }
  if (!src) {
    return html.replace(
      /<img\b[^>]*src=["'][^"']+["'][^>]*>/i,
      emailLogoWordmark(brand, locale)
    );
  }
  return html.split(brand.logoUrl).join(src);
}

export function htmlToPlainText(html: string): string {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
