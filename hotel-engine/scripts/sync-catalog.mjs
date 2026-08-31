/**
 * Rebuild src/catalog/data/hotels.catalog.json from the Next.js catalog.
 * Run from hotel-engine: node scripts/sync-catalog.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hotelsTs = path.join(root, "..", "src/data/hotels.ts");
const out = path.join(root, "src/catalog/data/hotels.catalog.json");
const t = fs.readFileSync(hotelsTs, "utf8");
const bookingMap = {
  "ciragan-palace-kempinski-istanbul": "ciragan-palace-kempinski-istanbul",
  "raffles-istanbul": "raffles-istanbul",
  "four-seasons-bosphorus": "four-seasons-istanbul-at-the-bosphorus",
  "shangri-la-bosphorus": "shangri-la-bosphorus-istanbul",
  "peninsula-istanbul": "the-peninsula-istanbul",
  "swissotel-the-bosphorus": "swissotel-the-bosphorus",
  "cvk-park-bosphorus": "cvk-park-bosphorus-hotel-istanbul",
  "pera-palace-hotel": "pera-palace-hotel",
  "ritz-carlton-istanbul": "the-ritz-carlton-istanbul",
  "ajia-hotel-istanbul": "a-jia-hotel",
  "rixos-premium-belek": "rixos-premium-belek",
  "maxx-royal-kemer": "maxx-royal-kemer-resort",
  "akra-antalya": "akra-hotel",
  "calista-luxury-resort": "calista-luxury-resort",
  "regnum-carya": "regnum-carya-golf-spa-resort",
  "museum-hotel-cappadocia": "museum-hotel",
  "argos-in-cappadocia": "argos-in-cappadocia",
  "kayakapi-premium-caves": "kayakapi-premium-caves",
  "cappadocia-cave-resort": "cappadocia-cave-resort-and-spa",
  "zorlu-grand-trabzon": "zorlu-grand-hotel",
  "novotel-trabzon": "novotel-trabzon",
  "radisson-blu-trabzon": "radisson-blu-hotel-trabzon",
  "swissotel-uludag-bursa": "swissotel-resort-uludag-bursa",
  "kervansaray-bursa": "kervansaray-bursa",
  "holiday-inn-bursa": "holiday-inn-bursa-city-centre",
  "richmond-nua-wellness-spa": "richmond-nua-wellness-spa",
  "ng-sapanca-wellness": "ng-sapanca-wellness-convention",
  "ng-sapanca-enjoy": "ng-sapanca-enjoy",
  "ayder-paradise-otel": "ayder-paradise-otel",
  "yesilvadi": "yesilvadi",
};

function extractArrayFrom(src, fromIdx) {
  let i = src.indexOf("= [", fromIdx);
  i = src.indexOf("[", i);
  let depth = 0;
  let inStr = false;
  let quote = "";
  let esc = false;
  const start = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (c === "\\") {
        esc = true;
        continue;
      }
      if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = true;
      quote = c;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("unterminated hotels array");
}

const arrText = extractArrayFrom(t, t.indexOf("export const defaultHotels")).replace(
  /\bDEFAULT_WA\b/g,
  '"0"'
);
const hotels = Function(`"use strict"; return (${arrText});`)();
const catalog = hotels
  .filter((h) => h && h.slug)
  .map((h) => {
    const bookingId = bookingMap[h.slug] || h.slug;
    return {
      id: h.slug,
      slug: h.slug,
      nameAr: h.nameAr,
      nameEn: h.nameEn,
      city: h.city,
      country: h.country || "Turkey",
      neighborhoodAr: h.neighborhoodAr || "",
      neighborhoodEn: h.neighborhoodEn || "",
      stars: Number(h.stars) || 0,
      rating: Number(h.rating) || 0,
      reviewCount: Number(h.reviewCount) || 0,
      addressAr: h.addressAr || "",
      addressEn: h.addressEn || "",
      descriptionAr: h.descriptionAr || "",
      descriptionEn: h.descriptionEn || "",
      highlightsAr: h.highlightsAr || [],
      highlightsEn: h.highlightsEn || [],
      images: (h.images || []).slice(0, 8),
      amenities: h.amenities || [],
      lat: Number(h.lat) || 0,
      lng: Number(h.lng) || 0,
      checkInTime: h.checkIn || "14:00",
      checkOutTime: h.checkOut || "12:00",
      policiesAr: h.policiesAr || [],
      policiesEn: h.policiesEn || [],
      rooms: (h.rooms || []).map((r) => ({
        id: r.id,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        descriptionAr: r.descriptionAr || "",
        descriptionEn: r.descriptionEn || "",
        beds: r.beds || "",
        capacity: Number(r.capacity) || 2,
        sizeSqm: Number(r.sizeSqm) || 0,
        price: Number(r.price) || null,
        currency: r.currency || "USD",
        amenities: r.amenities || [],
        images: (r.images || []).slice(0, 4),
        breakfastIncluded: Boolean(r.breakfastIncluded),
        freeCancellation: Boolean(r.freeCancellation),
      })),
      bookingId,
      sourceUrl: `https://www.booking.com/hotel/tr/${bookingId}.html`,
      isActive: h.isActive !== false,
      isFeatured: Boolean(h.isFeatured),
    };
  });
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(catalog, null, 2));
console.log(`Wrote ${catalog.length} hotels to ${out}`);
