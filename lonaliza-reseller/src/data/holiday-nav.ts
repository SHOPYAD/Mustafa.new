import { getPackages } from "@/data/packages";
import type { HolidayPackage } from "@/types/package";
import type { Locale } from "@/lib/i18n/types";
import { tContent } from "@/lib/utils";

export type HolidayNavChild = { label: string; href: string };

const FALLBACK_DESTINATIONS: { q: string; ar: string; en: string; tr: string }[] =
  [
    { q: "Istanbul", ar: "إسطنبول", en: "Istanbul", tr: "İstanbul" },
    { q: "Antalya", ar: "أنطاليا", en: "Antalya", tr: "Antalya" },
    { q: "Cappadocia", ar: "كابادوكيا", en: "Cappadocia", tr: "Kapadokya" },
    { q: "Trabzon", ar: "طرابزون", en: "Trabzon", tr: "Trabzon" },
    { q: "Bursa", ar: "بورصة", en: "Bursa", tr: "Bursa" },
    { q: "Sapanca", ar: "سابانجا", en: "Sapanca", tr: "Sapanca" },
  ];

function destLabel(locale: Locale, ar: string, en: string, tr: string): string {
  if (locale === "ar") return ar || en;
  if (locale === "tr") return tr || en;
  return en || ar;
}

export function holidayNavChildren(
  packages: HolidayPackage[] | null | undefined,
  locale: Locale
): HolidayNavChild[] {
  const list = packages && packages.length ? packages : getPackages();
  const dests = new Map<string, HolidayNavChild>();

  for (const pkg of list) {
    const q = (pkg.destinationEn || pkg.destination || "").trim();
    if (!q) continue;
    const key = q.toLowerCase();
    if (dests.has(key)) continue;
    dests.set(key, {
      label: tContent(pkg, "destination", locale) || q,
      href: `/holidays?q=${encodeURIComponent(q)}`,
    });
  }

  const fromData = [...dests.values()].slice(0, 8);
  if (fromData.length) {
    const featured = list
      .filter((pkg) => pkg.isFeatured && pkg.slug)
      .slice(0, 4)
      .map((pkg) => ({
        label: tContent(pkg, "title", locale) || pkg.title,
        href: `/package/${pkg.slug}`,
      }));
    const seen = new Set(fromData.map((row) => row.href));
    for (const row of featured) {
      if (seen.has(row.href)) continue;
      fromData.push(row);
      seen.add(row.href);
    }
    return fromData;
  }

  return FALLBACK_DESTINATIONS.map((row) => ({
    label: destLabel(locale, row.ar, row.en, row.tr),
    href: `/holidays?q=${encodeURIComponent(row.q)}`,
  }));
}
