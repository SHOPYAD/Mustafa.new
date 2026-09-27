import type { Locale } from "@/lib/i18n/types";

export interface TurkeyCity {
  slug: string;
  nameEn: string;
  nameAr: string;
  /** Optional airport code hint for flight fields */
  airport?: string;
}

export const TURKEY_CITIES: TurkeyCity[] = [
  { slug: "istanbul", nameEn: "Istanbul", nameAr: "إسطنبول", airport: "IST" },
  { slug: "antalya", nameEn: "Antalya", nameAr: "أنطاليا", airport: "AYT" },
  { slug: "trabzon", nameEn: "Trabzon", nameAr: "طرابزون", airport: "TZX" },
  { slug: "bursa", nameEn: "Bursa", nameAr: "بورصة" },
  { slug: "cappadocia", nameEn: "Cappadocia", nameAr: "كابادوكيا", airport: "NAV" },
  { slug: "sapanca", nameEn: "Sapanca", nameAr: "سبانجا" },
  { slug: "rize", nameEn: "Rize", nameAr: "ريزة" },
  { slug: "ayder", nameEn: "Ayder", nameAr: "آيدر" },
  { slug: "ankara", nameEn: "Ankara", nameAr: "أنقرة", airport: "ESB" },
  { slug: "izmir", nameEn: "Izmir", nameAr: "إزمير", airport: "ADB" },
  { slug: "bodrum", nameEn: "Bodrum", nameAr: "بودروم", airport: "BJV" },
  { slug: "fethiye", nameEn: "Fethiye", nameAr: "فيتيه", airport: "DLM" },
  { slug: "marmaris", nameEn: "Marmaris", nameAr: "مرmaris" },
  { slug: "kusadasi", nameEn: "Kuşadası", nameAr: "كوشادasi" },
  { slug: "alanya", nameEn: "Alanya", nameAr: "ألanya" },
  { slug: "goreme", nameEn: "Göreme", nameAr: "غورeme" },
];

export function filterTurkeyCities(
  query: string,
  locale: Locale
): TurkeyCity[] {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];

  return TURKEY_CITIES.filter((city) => {
    const en = city.nameEn.toLowerCase();
    const ar = city.nameAr.toLowerCase();
    const slug = city.slug.toLowerCase();
    const airport = city.airport?.toLowerCase() || "";
    return (
      en.includes(q) ||
      ar.includes(q) ||
      slug.includes(q) ||
      airport.includes(q) ||
      (locale !== "ar" &&
        city.airport &&
        `${city.nameEn} (${city.airport})`.toLowerCase().includes(q))
    );
  }).slice(0, 8);
}

export function cityDisplayName(city: TurkeyCity, locale: Locale): string {
  const name = locale === "ar" || locale === "tr" ? city.nameAr : city.nameEn;
  return city.airport ? `${name} (${city.airport})` : name;
}
