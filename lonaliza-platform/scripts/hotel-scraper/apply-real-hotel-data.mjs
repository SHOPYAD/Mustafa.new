/**
 * Merge src/data/scraping/hotels/real-from-booking.json into src/data/hotels.ts
 * - Updates content fields from real Booking data
 * - Renames replaced slugs (sapanca-lake-houses → richmond-nua-wellness-spa, etc.)
 * - Bumps STORAGE_KEY to alrayyan_hotels_v8
 * - Ensures migrateIfNeeded keeps guestReviews
 *
 * Run: node scripts/apply-real-hotel-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");
const DEFAULT_WA = "905321796763";
const HOTELS_TS = path.join(ROOT, "src/data/hotels.ts");
const REAL_JSON = path.join(ROOT, "src/data/scraping/hotels/real-from-booking.json");
const TMP_EXPORT = path.join(ROOT, "scripts/.tmp-hotels-export.json");

const SLUG_MAP = {
  "sapanca-lake-houses": "richmond-nua-wellness-spa",
  "sapanca-glamping-suites": "ng-sapanca-enjoy",
  "ayder-plateau-resort": "ayder-paradise-otel",
  "rize-tea-garden-hotel": "yesilvadi",
};

function exportDefaultHotels() {
  const r = spawnSync(
    "npx",
    ["--yes", "tsx", "scripts/hotel-scraper/export-hotels-tmp.mts"],
    {
      cwd: ROOT,
      encoding: "utf8",
      shell: true,
    }
  );
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    throw new Error("Failed to export defaultHotels");
  }
  console.log(r.stdout.trim());
}

function serializeHotels(hotels) {
  const body = hotels
    .map((h) => "  " + JSON.stringify(h, null, 2).replace(/\n/g, "\n  "))
    .join(",\n");
  return `[\n${body}\n]`;
}

function buildFile(hotels) {
  return `import type { Hotel, HotelInput, HotelGuestReview } from "@/types/hotel";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";
import { normalizeWhatsAppNumber } from "@/lib/utils";

/**
 * Nightly room rates are approximate 2024–2026 Turkey 4–5★ market prices in USD
 * (Istanbul luxury, Antalya resorts, Cappadocia cave hotels, Black Sea / Sapanca).
 * Not live booking quotes — admin can override per hotel.
 * Property copy / ratings / guestReviews merged from Booking.com & Tripadvisor real sources
 * via src/data/scraping/hotels/real-from-booking.json (see scripts/hotel-scraper/apply-real-hotel-data.mjs).
 */
const STORAGE_KEY = "alrayyan_hotels_v9";
const OLD_STORAGE_KEYS = [
  "alrayyan_hotels_v8",
  "alrayyan_hotels_v7",
  "alrayyan_hotels_v6",
  "alrayyan_hotels_v5",
  "alrayyan_hotels_v4",
  "alrayyan_hotels_v3",
  "oktravel_hotels_v2",
  "oktravel_hotels",
  "alrayyan_hotels_v2",
];
const DEFAULT_WA = DEFAULT_SITE_WHATSAPP;
const LEGACY_DEMO_WA = new Set(["971585255484"]);

function resolveHotelWhatsApp(raw: unknown): string {
  const n = normalizeWhatsAppNumber(String(raw || ""));
  if (n && !LEGACY_DEMO_WA.has(n)) return n;
  return DEFAULT_WA;
}

export const defaultHotels: Hotel[] = ${serializeHotels(hotels)};

function save(hotels: Hotel[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
}

function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[\\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeRoom(room: Record<string, unknown>, index: number) {
  return {
    id: String(room.id || \`r\${Date.now()}-\${index}\`),
    nameAr: String(room.nameAr || ""),
    nameEn: String(room.nameEn || ""),
    descriptionAr: String(room.descriptionAr || ""),
    descriptionEn: String(room.descriptionEn || ""),
    beds: String(room.beds || "1 King"),
    capacity: Number(room.capacity) || 2,
    sizeSqm: Number(room.sizeSqm) || 0,
    price: Number(room.price) || 0,
    currency: String(room.currency || "USD"),
    amenities: parseListField(room.amenities),
    images: parseListField(room.images),
    breakfastIncluded: Boolean(room.breakfastIncluded),
    freeCancellation: Boolean(room.freeCancellation),
  };
}

function normalizeGuestReview(
  review: Record<string, unknown>,
  index: number
): HotelGuestReview {
  const sourceRaw = String(review.source || "Booking.com");
  const source =
    sourceRaw === "Tripadvisor" ||
    sourceRaw === "Booking.com" ||
    sourceRaw === "Google" ||
    sourceRaw === "Expedia"
      ? sourceRaw
      : "Booking.com";

  return {
    id: String(review.id || \`gr-\${Date.now()}-\${index}\`),
    author: String(review.author || "Guest"),
    countryAr: String(review.countryAr || ""),
    countryEn: String(review.countryEn || ""),
    rating: Number(review.rating) || 0,
    date: String(review.date || ""),
    titleAr: String(review.titleAr || ""),
    titleEn: String(review.titleEn || ""),
    textAr: String(review.textAr || ""),
    textEn: String(review.textEn || ""),
    source,
    stayTypeAr: String(review.stayTypeAr || ""),
    stayTypeEn: String(review.stayTypeEn || ""),
  };
}

function migrateIfNeeded(hotels: Hotel[]): Hotel[] {
  return hotels.map((raw) => {
    const h = raw as Hotel & Record<string, unknown>;
    const rooms = Array.isArray(h.rooms)
      ? h.rooms.map((r, i) =>
          normalizeRoom(r as unknown as Record<string, unknown>, i)
        )
      : [];

    const guestReviews = Array.isArray(h.guestReviews)
      ? h.guestReviews.map((r, i) =>
          normalizeGuestReview(r as unknown as Record<string, unknown>, i)
        )
      : undefined;

    return {
      id: String(h.id),
      slug: String(h.slug || ""),
      nameAr: String(h.nameAr || ""),
      nameEn: String(h.nameEn || ""),
      city: String(h.city || ""),
      country: String(h.country || "Turkey"),
      neighborhoodAr: String(h.neighborhoodAr || h.city || ""),
      neighborhoodEn: String(h.neighborhoodEn || h.city || ""),
      stars: Number(h.stars) || 5,
      rating: Number(h.rating) || 0,
      reviewCount: Number(h.reviewCount) || 0,
      addressAr: String(h.addressAr || ""),
      addressEn: String(h.addressEn || ""),
      descriptionAr: String(h.descriptionAr || ""),
      descriptionEn: String(h.descriptionEn || ""),
      highlightsAr: parseListField(h.highlightsAr),
      highlightsEn: parseListField(h.highlightsEn),
      images: parseListField(h.images),
      amenities: parseListField(h.amenities),
      nearbyAr: parseListField(h.nearbyAr),
      nearbyEn: parseListField(h.nearbyEn),
      nearbyPlaces: Array.isArray(h.nearbyPlaces)
        ? h.nearbyPlaces.map((p) => {
            const raw = p as { nameEn?: string; nameAr?: string; lat?: number; lng?: number; category?: string };
            const cat = String(raw.category || "");
            const category =
              cat === "transport" || cat === "dining" || cat === "nature" || cat === "attraction"
                ? cat
                : undefined;
            return {
              nameEn: String(raw.nameEn || ""),
              nameAr: String(raw.nameAr || ""),
              lat: Number(raw.lat) || 0,
              lng: Number(raw.lng) || 0,
              category,
            };
          })
        : undefined,
      guestReviews,
      rooms,
      lat: Number(h.lat) || 41.0082,
      lng: Number(h.lng) || 28.9784,
      checkIn: String(h.checkIn || "15:00"),
      checkOut: String(h.checkOut || "12:00"),
      policiesAr: parseListField(h.policiesAr),
      policiesEn: parseListField(h.policiesEn),
      whatsappNumber: resolveHotelWhatsApp(h.whatsappNumber),
      whatsappMessageAr:
        String(h.whatsappMessageAr || "") ||
        \`مرحباً، أرغب بالحجز في \${h.nameAr || "هذا الفندق"}\`,
      whatsappMessageEn:
        String(h.whatsappMessageEn || "") ||
        \`Hello, I would like to book at \${h.nameEn || "this hotel"}\`,
      phone: h.phone ? String(h.phone) : undefined,
      website: h.website ? String(h.website) : undefined,
      isFeatured: Boolean(h.isFeatured),
      isActive: h.isActive !== false,
    } satisfies Hotel;
  });
}

function clearLegacyKeys() {
  for (const key of OLD_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function getHotels(): Hotel[] {
  if (typeof window === "undefined") return defaultHotels;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return migrateIfNeeded(JSON.parse(stored) as Hotel[]);
    } catch {
      return defaultHotels;
    }
  }

  clearLegacyKeys();
  save(defaultHotels);
  return defaultHotels;
}

export function getActiveHotels(): Hotel[] {
  return getHotels().filter((h) => h.isActive);
}

export function getFeaturedHotels(): Hotel[] {
  return getActiveHotels().filter((h) => h.isFeatured);
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return getHotels().find((h) => h.slug === slug);
}

export function getHotelById(id: string): Hotel | undefined {
  return getHotels().find((h) => h.id === id);
}

export function addHotel(input: HotelInput): Hotel {
  const hotels = getHotels();
  const hotel: Hotel = { ...input, id: Date.now().toString() };
  hotels.unshift(hotel);
  save(hotels);
  return hotel;
}

export function updateHotel(id: string, data: Partial<Hotel>): Hotel | null {
  const hotels = getHotels();
  const idx = hotels.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  hotels[idx] = { ...hotels[idx], ...data, id };
  save(hotels);
  return hotels[idx];
}

export function deleteHotel(id: string): boolean {
  save(getHotels().filter((h) => h.id !== id));
  return true;
}

export function resetHotels() {
  clearLegacyKeys();
  save(defaultHotels);
}
`;
}

function mergeRoom(existing, real, hotelId, index) {
  const prev = existing?.[index] || existing?.[0] || {};
  const descEn =
    (real.descriptionEn?.length || 0) > (prev.descriptionEn?.length || 0)
      ? real.descriptionEn
      : real.descriptionEn || prev.descriptionEn || "";
  const descAr =
    (real.descriptionAr?.length || 0) > (prev.descriptionAr?.length || 0)
      ? real.descriptionAr
      : real.descriptionAr || prev.descriptionAr || "";
  const price =
    Number(real.price) > 0
      ? Number(real.price)
      : prev.price ?? 0;
  return {
    id: prev.id || `${hotelId}-r${index + 1}`,
    nameAr: real.nameAr || prev.nameAr || "",
    nameEn: real.nameEn || prev.nameEn || "",
    descriptionAr: descAr,
    descriptionEn: descEn,
    beds: real.beds || prev.beds || "1 King",
    capacity: real.capacity ?? prev.capacity ?? 2,
    sizeSqm: real.sizeSqm || prev.sizeSqm || 0,
    price,
    currency: prev.currency || "USD",
    amenities: Array.isArray(prev.amenities) && prev.amenities.length
      ? prev.amenities
      : ["WiFi"],
    images:
      Array.isArray(prev.images) && prev.images.length
        ? prev.images
        : [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
          ],
    breakfastIncluded:
      prev.breakfastIncluded !== undefined ? prev.breakfastIncluded : true,
    freeCancellation:
      prev.freeCancellation !== undefined ? prev.freeCancellation : true,
  };
}

function main() {
  if (!fs.existsSync(REAL_JSON)) {
    throw new Error("Missing " + REAL_JSON);
  }
  const realList = JSON.parse(fs.readFileSync(REAL_JSON, "utf8"));
  const bySlug = Object.fromEntries(realList.map((h) => [h.slug, h]));

  exportDefaultHotels();
  const existing = JSON.parse(fs.readFileSync(TMP_EXPORT, "utf8"));

  const merged = existing.map((hotel) => {
    const newSlug = SLUG_MAP[hotel.slug] || hotel.slug;
    const real = bySlug[newSlug];
    if (!real) {
      console.warn("No real data for", hotel.slug, "→", newSlug);
      return { ...hotel, slug: newSlug };
    }

    const guestReviews = (real.guestReviews || []).map((r, i) => ({
      id: `${hotel.id}-gr${i + 1}`,
      author: r.author,
      countryAr: r.countryAr || "",
      countryEn: r.countryEn || "",
      rating: Number(r.rating) || 0,
      date: r.date || "",
      titleAr: r.titleAr || "",
      titleEn: r.titleEn || "",
      textAr: r.textAr || "",
      textEn: r.textEn || "",
      source: r.source || "Booking.com",
      stayTypeAr: r.stayTypeAr || "",
      stayTypeEn: r.stayTypeEn || "",
    }));

    const rooms = (real.rooms || []).map((r, i) =>
      mergeRoom(hotel.rooms, r, hotel.id, i)
    );
    // Keep at least previous rooms if real has fewer than 2
    const finalRooms =
      rooms.length >= 2
        ? rooms
        : hotel.rooms.map((r, i) => {
            const rr = real.rooms?.[i];
            return rr ? mergeRoom(hotel.rooms, rr, hotel.id, i) : r;
          });

    // Normalize Booking-style 1–10 rating for display (already 1–10)
    const rating = Number(real.rating) || hotel.rating;

    return {
      ...hotel,
      slug: newSlug,
      nameAr: real.nameAr || hotel.nameAr,
      nameEn: real.nameEn || hotel.nameEn,
      rating,
      reviewCount: Number(real.reviewCount) || hotel.reviewCount,
      addressAr: real.addressAr || hotel.addressAr,
      addressEn: real.addressEn || hotel.addressEn,
      descriptionAr: real.descriptionAr || hotel.descriptionAr,
      descriptionEn: real.descriptionEn || hotel.descriptionEn,
      highlightsAr:
        real.highlightsAr?.length > 0 ? real.highlightsAr : hotel.highlightsAr,
      highlightsEn:
        real.highlightsEn?.length > 0 ? real.highlightsEn : hotel.highlightsEn,
      amenities: real.amenities?.length > 0 ? real.amenities : hotel.amenities,
      nearbyAr: real.nearbyAr?.length > 0 ? real.nearbyAr : hotel.nearbyAr,
      nearbyEn: real.nearbyEn?.length > 0 ? real.nearbyEn : hotel.nearbyEn,
      nearbyPlaces:
        real.nearbyPlaces?.length > 0 ? real.nearbyPlaces : hotel.nearbyPlaces,
      images:
        real.images?.length > 0 ? real.images : hotel.images,
      guestReviews: guestReviews.length ? guestReviews : hotel.guestReviews,
      rooms: finalRooms,
      policiesAr:
        real.policiesAr?.length > 0 ? real.policiesAr : hotel.policiesAr,
      policiesEn:
        real.policiesEn?.length > 0 ? real.policiesEn : hotel.policiesEn,
      checkIn: hotel.checkIn || "15:00",
      checkOut: hotel.checkOut || "12:00",
      whatsappNumber: DEFAULT_WA,
      whatsappMessageAr: `مرحباً، أرغب بالحجز في ${real.nameAr || hotel.nameAr}`,
      whatsappMessageEn: `Hello, I would like to book at ${real.nameEn || hotel.nameEn}`,
    };
  });

  // Ensure all real slugs present
  for (const real of realList) {
    if (!merged.find((h) => h.slug === real.slug)) {
      console.warn("Real slug missing from hotels.ts seed:", real.slug);
    }
  }

  fs.writeFileSync(HOTELS_TS, buildFile(merged));
  try {
    fs.unlinkSync(TMP_EXPORT);
  } catch {
    /* */
  }
  console.log("Updated", HOTELS_TS, "with", merged.length, "hotels");
  console.log(
    "Slugs:",
    merged.map((h) => h.slug).join(", ")
  );
}

main();
