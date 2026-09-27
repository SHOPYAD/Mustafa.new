/** Shared FX math — rates are units of currency per 1 USD. */

const CURRENCY_MARKS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  TRY: "₺",
  SAR: "﷼",
  AED: "د.إ",
  QAR: "ر.ق",
  KWD: "د.ك",
  BHD: "د.ب",
  OMR: "ر.ع",
  EGP: "E£",
  JOD: "د.ا",
  IQD: "د.ع",
  MAD: "د.م",
  TND: "د.ت",
  DZD: "د.ج",
  INR: "₹",
  PKR: "₨",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  RUB: "₽",
  CHF: "Fr",
  CAD: "C$",
  AUD: "A$",
  NZD: "NZ$",
  SGD: "S$",
  HKD: "HK$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  THB: "฿",
  MYR: "RM",
  IDR: "Rp",
  PHP: "₱",
  VND: "₫",
  BRL: "R$",
  MXN: "Mex$",
  ZAR: "R",
};

const ISO_LETTER_RUN = /[A-Za-z]{2,3}/g;

export function normalizeCurrencyCode(code: unknown): string {
  return String(code || "")
    .trim()
    .toUpperCase();
}

export function isIsoCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function convertAmount(
  amount: number,
  fromRateVsUsd: number,
  toRateVsUsd: number
): number {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  if (!(fromRateVsUsd > 0) || !(toRateVsUsd > 0)) return n;
  return (n / fromRateVsUsd) * toRateVsUsd;
}

function stripIsoLetters(value: string): string {
  return value.replace(ISO_LETTER_RUN, "").replace(/\s+/g, " ").trim();
}

/** Symbol or short mark only — never "US", "USD", or other ISO letters beside the number. */
export function currencySymbolOf(code: string, fallbackSymbol = ""): string {
  const normalized = normalizeCurrencyCode(code);
  if (CURRENCY_MARKS[normalized]) return CURRENCY_MARKS[normalized];
  const cleanedFallback = stripIsoLetters(fallbackSymbol);
  if (cleanedFallback) return cleanedFallback;
  return "";
}

function narrowSymbolFromIntl(code: string, locale?: string): string {
  try {
    const parts = new Intl.NumberFormat(locale || "en-US", {
      style: "currency",
      currency: code || "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      numberingSystem: "latn",
    }).formatToParts(0);
    const raw = parts.find((part) => part.type === "currency")?.value || "";
    return stripIsoLetters(raw);
  } catch {
    return "";
  }
}

function displayMark(code: string, symbol: string, locale?: string): string {
  const provided = stripIsoLetters(String(symbol || ""));
  if (provided && !isIsoCurrencyCode(provided)) return provided;
  return (
    currencySymbolOf(code, symbol) ||
    narrowSymbolFromIntl(code, locale) ||
    currencySymbolOf(code) ||
    "$"
  );
}

function latnAmount(amount: number, locale?: string): string {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(locale || "en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(Math.round(safe));
}

export function formatCurrencyAmount(
  amount: number,
  code: string,
  symbol: string,
  locale?: string
): string {
  const mark = displayMark(code, symbol, locale);
  return `${mark}${latnAmount(amount, locale)}`;
}

export function formatMoney(amount: number, currency: string, locale?: string, symbol?: string): string {
  return formatCurrencyAmount(amount, currency, symbol || "", locale);
}

export function formatPrice(amount: number, currency: string, symbol?: string, locale?: string): string {
  return formatCurrencyAmount(amount, currency, symbol || "", locale);
}

export function currencyDisplayName(
  row: { nameAr: string; nameEn: string; nameTr: string },
  locale: string
): string {
  if (locale === "ar") return row.nameAr || row.nameEn;
  if (locale === "tr") return row.nameTr || row.nameEn;
  return row.nameEn || row.nameAr;
}
