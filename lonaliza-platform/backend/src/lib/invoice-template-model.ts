import {
  INVOICE_SERVICES,
  type InvoiceService,
} from "@/lib/booking-service";
import {
  INVOICE_FIELD_KEYS,
  isInvoiceCurrencyFormat,
  isInvoiceFieldKey,
  isInvoiceLanguage,
  type InvoiceTemplate,
  type InvoiceTemplatePatch,
  type InvoiceTemplatesFile,
  type InvoiceVisibleFields,
} from "@/types/invoice-template";

const DEFAULT_PRIMARY = "#051741";
const DEFAULT_ACCENT = "#10b981";

export function defaultFieldsFor(service: InvoiceService): InvoiceVisibleFields {
  const allOn = Object.fromEntries(INVOICE_FIELD_KEYS.map((key) => [key, true])) as InvoiceVisibleFields;
  switch (service) {
    case "flight":
      return {
        ...allOn,
        hotel: false,
        room: false,
        nights: false,
      };
    case "hotel":
      return {
        ...allOn,
        route: false,
        baggage: false,
        fareClass: false,
        legs: false,
      };
    case "transfer":
    case "car":
    case "package":
    case "tour":
    case "visa":
      return {
        ...allOn,
        baggage: false,
        fareClass: false,
        legs: false,
        hotel: service === "package",
        room: false,
        nights: service === "package",
      };
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}

export function defaultInvoiceTemplate(service: InvoiceService): InvoiceTemplate {
  return {
    service,
    companyNameAr: "",
    companyNameEn: "",
    logoUrl: "",
    logoHeight: 46,
    primaryColor: DEFAULT_PRIMARY,
    accentColor: DEFAULT_ACCENT,
    headerText: "",
    footerText: "",
    language: "ar",
    currencyFormat: "western",
    fields: defaultFieldsFor(service),
    customCss: "",
    extraHtml: "",
  };
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function sanitizeColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return isHexColor(trimmed) ? trimmed : fallback;
}

function sanitizeCss(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  return raw
    .replace(/<\/style/gi, "")
    .replace(/<script/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, "")
    .slice(0, 12000);
}

function sanitizeExtraHtml(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .slice(0, 20000);
}

function sanitizeLogoUrl(value: unknown): string {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  if (url.startsWith("/api/branding/file")) return url;
  if (url.startsWith("/uploads/")) return url;
  if (/^https?:\/\//i.test(url) && !/^https?:\/\/javascript/i.test(url)) return url;
  return "";
}

export function sanitizeInvoiceTemplate(service: InvoiceService, raw: unknown): InvoiceTemplate {
  const base = defaultInvoiceTemplate(service);
  if (!raw || typeof raw !== "object") return base;
  const rec = raw as Record<string, unknown>;
  const logoHeight = Number(rec.logoHeight);
  const fields = { ...base.fields };
  if (rec.fields && typeof rec.fields === "object") {
    const incoming = rec.fields as Record<string, unknown>;
    for (const key of INVOICE_FIELD_KEYS) {
      if (typeof incoming[key] === "boolean") fields[key] = incoming[key];
    }
  }
  return {
    service,
    companyNameAr: typeof rec.companyNameAr === "string" ? rec.companyNameAr.slice(0, 120) : base.companyNameAr,
    companyNameEn: typeof rec.companyNameEn === "string" ? rec.companyNameEn.slice(0, 120) : base.companyNameEn,
    logoUrl: sanitizeLogoUrl(rec.logoUrl),
    logoHeight: Number.isFinite(logoHeight) ? Math.min(120, Math.max(24, logoHeight)) : base.logoHeight,
    primaryColor: sanitizeColor(rec.primaryColor, base.primaryColor),
    accentColor: sanitizeColor(rec.accentColor, base.accentColor),
    headerText: typeof rec.headerText === "string" ? rec.headerText.slice(0, 240) : base.headerText,
    footerText: typeof rec.footerText === "string" ? rec.footerText.slice(0, 600) : base.footerText,
    language: isInvoiceLanguage(rec.language) ? rec.language : base.language,
    currencyFormat: isInvoiceCurrencyFormat(rec.currencyFormat) ? rec.currencyFormat : base.currencyFormat,
    fields,
    customCss: sanitizeCss(rec.customCss),
    extraHtml: sanitizeExtraHtml(rec.extraHtml),
  };
}

export function mergeInvoiceTemplate(
  current: InvoiceTemplate,
  patch: InvoiceTemplatePatch
): InvoiceTemplate {
  const fields = { ...current.fields };
  if (patch.fields) {
    for (const [key, value] of Object.entries(patch.fields)) {
      if (isInvoiceFieldKey(key) && typeof value === "boolean") fields[key] = value;
    }
  }
  return sanitizeInvoiceTemplate(current.service, { ...current, ...patch, fields });
}

export function emptyInvoiceTemplates(): InvoiceTemplatesFile {
  const templates = {} as Record<InvoiceService, InvoiceTemplate>;
  for (const service of INVOICE_SERVICES) {
    templates[service] = defaultInvoiceTemplate(service);
  }
  return { templates };
}
