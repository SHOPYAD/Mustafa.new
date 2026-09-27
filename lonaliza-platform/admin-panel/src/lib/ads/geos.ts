import type { AdsGeo } from "./types";

/** GCC + Morocco / Algeria / Tunisia / Iraq — configurable via settings.geoCodes. */
export const DEFAULT_ADS_GEOS: AdsGeo[] = [
  { iso2: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", googleCriterionId: "2676" },
  { iso2: "AE", nameAr: "الإمارات", nameEn: "United Arab Emirates", googleCriterionId: "2784" },
  { iso2: "KW", nameAr: "الكويت", nameEn: "Kuwait", googleCriterionId: "2410" },
  { iso2: "QA", nameAr: "قطر", nameEn: "Qatar", googleCriterionId: "1794" },
  { iso2: "BH", nameAr: "البحرين", nameEn: "Bahrain", googleCriterionId: "2025" },
  { iso2: "OM", nameAr: "عُمان", nameEn: "Oman", googleCriterionId: "2738" },
  { iso2: "MA", nameAr: "المغرب", nameEn: "Morocco", googleCriterionId: "2480" },
  { iso2: "DZ", nameAr: "الجزائر", nameEn: "Algeria", googleCriterionId: "2013" },
  { iso2: "TN", nameAr: "تونس", nameEn: "Tunisia", googleCriterionId: "2725" },
  { iso2: "IQ", nameAr: "العراق", nameEn: "Iraq", googleCriterionId: "2398" },
];

export const DEFAULT_GEO_CODES = DEFAULT_ADS_GEOS.map((g) => g.iso2);

const BY_ISO = new Map(DEFAULT_ADS_GEOS.map((g) => [g.iso2.toUpperCase(), g]));

export function resolveGeos(codes?: string[]): AdsGeo[] {
  const wanted = (codes?.length ? codes : DEFAULT_GEO_CODES)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const unique = [...new Set(wanted)];
  return unique.map((iso2) => BY_ISO.get(iso2)).filter((g): g is AdsGeo => Boolean(g));
}

export function geoIsoList(codes?: string[]): string[] {
  return resolveGeos(codes).map((g) => g.iso2);
}
