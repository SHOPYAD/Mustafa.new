import {
  FALLBACK_AIRLINE_LOGOS,
  FALLBACK_HOTEL_LOGOS,
  FEATURED_TRAVEL_PARTNERS,
} from "@/data/partner-logo-catalog";
import { pickCopy, type HomepageSectionInstance } from "./schema";

export type LogoListKind = "partners" | "airlines" | "hotels";

export type EditorLogoItem = {
  id: string;
  name: string;
  nameAr?: string;
  logoUrl: string;
  city?: string;
  cityAr?: string;
  stars?: number;
  iata?: string;
};

export const LOGO_LIST_SETTING: Record<LogoListKind, string> = {
  partners: "partnersLogosJson",
  airlines: "airlinesLogosJson",
  hotels: "hotelsLogosJson",
};

export function logoField(kind: LogoListKind, id: string): string {
  return `logo.${kind}.${id}`;
}

export function parseLogoField(
  field: string | undefined
): { kind: LogoListKind; id: string } | null {
  if (!field) return null;
  const m = field.match(/^logo\.(partners|airlines|hotels)\.(.+)$/);
  if (!m?.[1] || !m[2]) return null;
  return { kind: m[1] as LogoListKind, id: m[2] };
}

export function defaultLogoItems(kind: LogoListKind): EditorLogoItem[] {
  switch (kind) {
    case "partners":
      return FEATURED_TRAVEL_PARTNERS.map((row) => ({
        id: row.id,
        name: row.name,
        logoUrl: row.logoUrl,
      }));
    case "airlines":
      return FALLBACK_AIRLINE_LOGOS.map((row) => ({
        id: row.iata.toLowerCase(),
        name: row.name,
        logoUrl: row.logoUrl,
        iata: row.iata,
      }));
    case "hotels":
      return FALLBACK_HOTEL_LOGOS.map((row) => ({
        id: row.id,
        name: row.name,
        nameAr: row.nameAr,
        logoUrl: row.logoUrl,
        city: row.city,
        cityAr: row.cityAr,
        stars: row.stars,
      }));
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function parseLogoList(raw: unknown): EditorLogoItem[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item, index) => ({
        id: String(item.id || `logo-${index + 1}`),
        name: String(item.name || item.nameAr || "Logo"),
        nameAr: item.nameAr ? String(item.nameAr) : undefined,
        logoUrl: String(item.logoUrl || item.src || ""),
        city: item.city ? String(item.city) : undefined,
        cityAr: item.cityAr ? String(item.cityAr) : undefined,
        stars: typeof item.stars === "number" ? item.stars : Number(item.stars) || undefined,
        iata: item.iata ? String(item.iata) : undefined,
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

export function serializeLogoList(items: EditorLogoItem[]): string {
  return JSON.stringify(items);
}

export function readLogoList(
  instance: HomepageSectionInstance | undefined,
  kind: LogoListKind
): EditorLogoItem[] {
  const key = LOGO_LIST_SETTING[kind];
  const fromSettings = parseLogoList(instance?.settings[key]);
  if (fromSettings.length) return fromSettings;
  const fromText = parseLogoList(
    instance ? pickCopy(instance.texts[key], "en") || pickCopy(instance.texts[key], "ar") : ""
  );
  return fromText.length ? fromText : defaultLogoItems(kind);
}

export function replaceLogoUrl(
  items: EditorLogoItem[],
  id: string,
  logoUrl: string
): EditorLogoItem[] {
  return items.map((item) => (item.id === id ? { ...item, logoUrl } : item));
}

export function addLogoItem(items: EditorLogoItem[], kind: LogoListKind): EditorLogoItem[] {
  const stamp = Date.now().toString(36);
  const next: EditorLogoItem = {
    id: `new-${stamp}`,
    name: kind === "hotels" ? "Hotel" : kind === "airlines" ? "Airline" : "Partner",
    nameAr: kind === "hotels" ? "فندق" : kind === "airlines" ? "طيران" : "شريك",
    logoUrl: "",
  };
  return [...items, next];
}

export function removeLogoItem(items: EditorLogoItem[], id: string): EditorLogoItem[] {
  return items.filter((item) => item.id !== id);
}

export function moveLogoItem(
  items: EditorLogoItem[],
  id: string,
  dir: -1 | 1
): EditorLogoItem[] {
  const index = items.findIndex((item) => item.id === id);
  const nextIndex = index + dir;
  if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [row] = next.splice(index, 1);
  if (!row) return items;
  next.splice(nextIndex, 0, row);
  return next;
}

export function logoListKindForSection(
  sectionType: string | null | undefined,
  field?: string
): LogoListKind | null {
  const parsed = parseLogoField(field);
  if (parsed) return parsed.kind;
  if (sectionType === "partners") return "partners";
  if (field === "airlines" || field === "airlineTrack") return "airlines";
  if (field === "hotels" || field === "hotelTrack") return "hotels";
  if (sectionType === "trust") return field === "marquee" ? "partners" : "airlines";
  return null;
}
