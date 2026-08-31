import { formatCurrencyAmount, normalizeCurrencyCode } from "@/lib/currency";
import { findCatalogCurrency } from "@/data/currency-catalog";
import type { InvoiceLanguage } from "@/types/invoice-template";

function localeOf(language: InvoiceLanguage): string {
  switch (language) {
    case "ar":
      return "ar";
    case "tr":
      return "tr-TR";
    case "en":
      return "en-GB";
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}

/** Strip leftover "US" letters from Intl/helper output (US$198 → $198). */
export function stripUsCurrencyLetters(value: string): string {
  return String(value || "")
    .replace(/US/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function invoiceCurrencySymbol(currency: string): string {
  const code = normalizeCurrencyCode(currency) || "USD";
  return findCatalogCurrency(code)?.symbol || "";
}

export function formatInvoiceMoney(
  amount: number,
  currency: string,
  language: InvoiceLanguage
): string {
  const code = normalizeCurrencyCode(currency) || "USD";
  const symbol = invoiceCurrencySymbol(code);
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const locale = localeOf(language);
  const shown = safe.toLocaleString(locale, {
    numberingSystem: "latn",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const helper = stripUsCurrencyLetters(formatCurrencyAmount(safe, code, symbol || code, locale));
  if (symbol) return `${symbol}${shown}`;
  const withoutIso = helper.replace(/\b[A-Z]{3}\b/g, "").trim();
  return withoutIso || `${code} ${shown}`;
}

function parseInvoiceDate(raw: string): Date | null {
  const text = String(raw || "").trim();
  if (!text) return null;
  if (/^\d{1,2}:\d{2}$/.test(text)) return null;
  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const d = new Date(normalized);
  if (!Number.isNaN(d.getTime())) return d;
  const dayOnly = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dayOnly) {
    const parsed = new Date(`${dayOnly[1]}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function isDateOnlyStamp(raw: string): boolean {
  const text = String(raw || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return true;
  return /T00:00:00(\.0+)?Z?$/i.test(text.replace(" ", "T")) || /00:00:00(\.0+)?Z?$/i.test(text);
}

export function formatInvoiceDate(raw: string, language: InvoiceLanguage): string {
  const text = String(raw || "").trim();
  if (!text) return "";
  if (/00:00:00\.000Z/i.test(text) || isDateOnlyStamp(text)) {
    const d = parseInvoiceDate(text);
    if (!d) return text.slice(0, 10);
    return d.toLocaleDateString(localeOf(language), {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      numberingSystem: "latn",
    });
  }
  const d = parseInvoiceDate(text);
  if (!d) return text;
  return d.toLocaleDateString(localeOf(language), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
  });
}

export function formatInvoiceTime(raw: string): string {
  const text = String(raw || "").trim();
  if (!text) return "";
  const clock = text.match(/^(\d{1,2}):(\d{2})$/);
  if (clock) return `${clock[1].padStart(2, "0")}:${clock[2]}`;
  if (isDateOnlyStamp(text)) return "";
  const isoClock = text.match(/T(\d{2}:\d{2})/);
  if (isoClock) return isoClock[1];
  const spaceClock = text.match(/\s(\d{2}:\d{2})/);
  if (spaceClock && !/00:00/.test(spaceClock[1])) return spaceClock[1];
  const d = parseInvoiceDate(text);
  if (!d) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatInvoiceDateTime(raw: string, language: InvoiceLanguage): string {
  const date = formatInvoiceDate(raw, language);
  const time = formatInvoiceTime(raw);
  if (date && time) return `${date} · ${time}`;
  return date || time || "";
}

export function formatInvoiceDuration(minutes: number, language: InvoiceLanguage): string {
  const safe = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  switch (language) {
    case "ar":
      if (h <= 0) return `${m} د`;
      return m ? `${h} س ${m} د` : `${h} س`;
    case "tr":
      if (h <= 0) return `${m}dk`;
      return m ? `${h}sa ${m}dk` : `${h}sa`;
    case "en":
      if (h <= 0) return `${m}m`;
      return m ? `${h}h ${m}m` : `${h}h`;
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}
