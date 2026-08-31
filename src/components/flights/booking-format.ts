import type { Locale } from "@/lib/i18n/types";

function localeTag(locale: Locale): string {
  switch (locale) {
    case "ar":
      return "ar-SA";
    case "en":
      return "en-US";
    case "tr":
      return "tr-TR";
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

function parseLooseDate(value: string): Date | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const isoDay = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    const year = Number(isoDay[1]);
    const month = Number(isoDay[2]);
    const day = Number(isoDay[3]);
    const local = new Date(year, month - 1, day);
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmy) {
    const local = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Human date with western numerals — never dump raw ISO timestamps. */
export function formatHumanDate(value: string, locale: Locale): string {
  const date = parseLooseDate(value);
  if (!date) return String(value || "").replace("T", " ").replace(/\.\d{3}Z$/, "");
  return new Intl.DateTimeFormat(localeTag(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
  }).format(date);
}

export function formatHumanDateRange(start: string, end: string | undefined, locale: Locale): string {
  const left = formatHumanDate(start, locale);
  if (!end || end === start) return left;
  return `${left} → ${formatHumanDate(end, locale)}`;
}

export function westernDigits(value: string | number): string {
  return String(value).replace(/[٠-٩]/g, (ch) => String("٠١٢٣٤٥٦٧٨٩".indexOf(ch)));
}
