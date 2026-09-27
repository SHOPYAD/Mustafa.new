/**
 * Travel-companion matching: same city and/or same destination.
 * City names are normalized (Arabic hamza/taa, aliases) so "اسطنبول" matches "Istanbul".
 */

export type CompanionPlaces = {
  city?: string;
  destination?: string;
};

const CITY_ALIASES: Record<string, string> = {
  istanbul: "istanbul",
  "istanbul turkey": "istanbul",
  "istanbul, turkey": "istanbul",
  اسطنبول: "istanbul",
  إسطنبول: "istanbul",
  "اسطنبول تركيا": "istanbul",
  trabzon: "trabzon",
  طرابزون: "trabzon",
  antalya: "antalya",
  انطاليا: "antalya",
  أنطاليا: "antalya",
  bursa: "bursa",
  بورصة: "bursa",
  ankara: "ankara",
  انقره: "ankara",
  أنقرة: "ankara",
  riyadh: "riyadh",
  الرياض: "riyadh",
  jeddah: "jeddah",
  جدة: "jeddah",
  jedda: "jeddah",
  mecca: "mecca",
  makkah: "mecca",
  مكة: "mecca",
  "مكة المكرمة": "mecca",
  medina: "medina",
  المدينة: "medina",
  "المدينة المنورة": "medina",
  dubai: "dubai",
  دبي: "dubai",
  "abu dhabi": "abudhabi",
  "أبوظبي": "abudhabi",
  ابوظبي: "abudhabi",
  doha: "doha",
  الدوحة: "doha",
  cairo: "cairo",
  القاهرة: "cairo",
  amman: "amman",
  عمان: "amman",
  "kuwait city": "kuwait",
  الكويت: "kuwait",
  saganca: "sapanca",
  sapanca: "sapanca",
  صبنجة: "sapanca",
  cappadocia: "cappadocia",
  kapadokya: "cappadocia",
  كابادوكيا: "cappadocia",
};

export function normalizePlace(input: string | undefined | null): string {
  const raw = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[،,]/g, " ")
    .replace(/\s+/g, " ");
  if (!raw) return "";
  if (CITY_ALIASES[raw]) return CITY_ALIASES[raw];
  const noTurkey = raw.replace(/\s+(تركيا|turkey|türkiye|turkiye)$/i, "").trim();
  if (CITY_ALIASES[noTurkey]) return CITY_ALIASES[noTurkey];
  return noTurkey || raw;
}

export function placesShareCity(a: CompanionPlaces, b: CompanionPlaces): boolean {
  const aCity = normalizePlace(a.city);
  const bCity = normalizePlace(b.city);
  return Boolean(aCity && bCity && aCity === bCity);
}

export function placesShareDestination(a: CompanionPlaces, b: CompanionPlaces): boolean {
  const aDest = normalizePlace(a.destination);
  const bDest = normalizePlace(b.destination);
  return Boolean(aDest && bDest && aDest === bDest);
}

/** Same city, same destination, or one's city equals the other's destination. */
export function companionsMatch(me: CompanionPlaces, other: CompanionPlaces): boolean {
  const myCity = normalizePlace(me.city);
  const myDest = normalizePlace(me.destination);
  const theirCity = normalizePlace(other.city);
  const theirDest = normalizePlace(other.destination);

  if (myCity && theirCity && myCity === theirCity) return true;
  if (myDest && theirDest && myDest === theirDest) return true;
  if (myCity && theirDest && myCity === theirDest) return true;
  if (myDest && theirCity && myDest === theirCity) return true;
  return false;
}

export function filterCompanionsByCity<T extends CompanionPlaces>(
  cityQuery: string,
  people: T[],
): T[] {
  const q = normalizePlace(cityQuery);
  if (!q) return people;
  return people.filter((p) => {
    const city = normalizePlace(p.city);
    const dest = normalizePlace(p.destination);
    return city === q || dest === q;
  });
}

export function companionDisplayName(row: { name?: string; userId?: string }): string {
  const name = String(row.name || "").trim();
  if (name) return name;
  const id = String(row.userId || "").trim();
  return id ? `مسافر ${id.slice(0, 6)}` : "مسافر";
}

export function companionCardCopy(row: {
  name?: string;
  city?: string;
  destination?: string;
  bio?: string;
}): { title: string; subtitle: string } {
  const title = companionDisplayName(row);
  const bits = [row.city, row.destination].map((x) => String(x || "").trim()).filter(Boolean);
  return {
    title,
    subtitle: bits.join(" → ") || String(row.bio || "").trim(),
  };
}
