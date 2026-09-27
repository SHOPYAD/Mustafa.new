export type BookingDest = {
  destId: string;
  searchType: string;
};

/** Booking.com city dest_ids. Query city always wins over a leftover URL destId. */
export const SEEDED_DEST: Record<string, BookingDest> = {
  istanbul: { destId: "-755070", searchType: "CITY" },
  antalya: { destId: "-736078", searchType: "CITY" },
  trabzon: { destId: "-754478", searchType: "CITY" },
  izmir: { destId: "-755097", searchType: "CITY" },
};

/** City-wide inventory remembered from Booking meta — never page length. */
export const SEEDED_CITY_TOTALS: Record<string, number> = {
  istanbul: 2840,
};

const DEST_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SEEDED_DEST).map(([slug, dest]) => [dest.destId, slug])
);

export function normalizeBookingDestId(raw: string | undefined): string {
  const destId = String(raw || "").trim();
  if (!destId || destId === "0") return "";
  // Travel Advisor geoIds are positive integers (293974, 298006).
  if (/^\d{4,7}$/.test(destId)) return "";
  if (!/^-?\d+$/.test(destId)) return "";
  return destId.startsWith("-") ? destId : `-${destId}`;
}

export function citySlug(value: string): string {
  const original = String(value || "");
  if (/istanbul|إسطنبول|اسطنبول|İstanbul|i̇stanbul/i.test(original)) return "istanbul";
  if (/antalya|أنطاليا|انطاليا|antalia/i.test(original)) return "antalya";
  if (/trabzon|طرابزون/i.test(original)) return "trabzon";
  if (/izmir|izmır|إزمير|ازمير|İzmir/i.test(original)) return "izmir";
  const raw = original
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .trim();
  if (/istanbul|i̇stanbul|اسطنبول|İstanbul/i.test(raw)) return "istanbul";
  if (/antalya|انطاليا|antalia/i.test(raw)) return "antalya";
  if (/trabzon|طرابزون/i.test(raw)) return "trabzon";
  if (/izmir|izmır|ا?زمير|İzmir/i.test(raw)) return "izmir";
  return raw
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function slugForDestId(destId: string | undefined): string {
  return DEST_SLUG[normalizeBookingDestId(destId)] || "";
}

/**
 * Drop a destId that belongs to a different city than the typed query.
 * Istanbul leftover `-755070` must never ride along with q=إزمير.
 */
export function destIdForQuery(query: string, destId?: string): string {
  const slug = citySlug(query);
  const seeded = slug ? SEEDED_DEST[slug] : undefined;
  const given = normalizeBookingDestId(destId);
  if (seeded) return seeded.destId;
  if (!given) return "";
  const givenSlug = slugForDestId(given);
  if (givenSlug && slug && givenSlug !== slug) return "";
  return given;
}

export function destForQuery(query: string, destId?: string): BookingDest | null {
  const resolved = destIdForQuery(query, destId);
  if (!resolved) return null;
  const slug = citySlug(query);
  return SEEDED_DEST[slug] || { destId: resolved, searchType: "CITY" };
}

export function seededDestForQuery(query: string): BookingDest | null {
  const slug = citySlug(query);
  return slug ? SEEDED_DEST[slug] || null : null;
}

export function seededCityTotal(queryOrDestId: string): number {
  const slug = citySlug(queryOrDestId) || slugForDestId(queryOrDestId);
  return SEEDED_CITY_TOTALS[slug] || 0;
}
