/**
 * Enrich hotel-real-from-booking.json for v8:
 * - Extract ALL real Booking.com reviews from agent-tools dumps
 * - Merge/dedupe guestReviews per hotel
 * - Add nearbyPlaces with approximate coordinates
 * - Ensure room prices from curated defaults
 *
 * Run: node scripts/enrich-hotels-v8.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "../..");
const JSON_PATH = path.join(ROOT, "src/data/scraping/hotels/real-from-booking.json");
const TOOLS =
  process.env.AGENT_TOOLS ||
  "C:/Users/Alrayyan Sales 1/.cursor/projects/c-Users-Alrayyan-Sales-1-Desktop-alrayyan-yeni-web-setesi/agent-tools";

const HOTEL_MATCH = [
  { slug: "ciragan-palace-kempinski-istanbul", match: /[Cc][ıiI]ra[gğ]an|ciragan-palace/i },
  { slug: "raffles-istanbul", match: /Raffles Istanbul/i },
  { slug: "four-seasons-bosphorus", match: /Four Seasons Hotel Istanbul at the Bosphorus/i },
  { slug: "shangri-la-bosphorus", match: /Shangri-La Bosphorus/i },
  { slug: "peninsula-istanbul", match: /The Peninsula Istanbul/i },
  { slug: "swissotel-the-bosphorus", match: /Swissôtel The Bosphorus|Swissotel The Bosphorus/i },
  { slug: "cvk-park-bosphorus", match: /CVK Park Bosphorus/i },
  { slug: "pera-palace-hotel", match: /Pera Palace/i },
  { slug: "ritz-carlton-istanbul", match: /Ritz-Carlton Istanbul|Ritz Carlton Istanbul/i },
  { slug: "ajia-hotel-istanbul", match: /Ajia Hotel|A'jia|A'jia Hotel/i },
  { slug: "rixos-premium-belek", match: /Rixos Premium Belek/i },
  { slug: "maxx-royal-kemer", match: /Maxx Royal Kemer/i },
  { slug: "akra-antalya", match: /Akra (Hotel|Antalya)/i },
  { slug: "calista-luxury-resort", match: /Calista Luxury/i },
  { slug: "regnum-carya", match: /Regnum Carya/i },
  { slug: "museum-hotel-cappadocia", match: /MUSEUM HOTEL|Museum Hotel/i },
  { slug: "argos-in-cappadocia", match: /Argos in Cappadocia/i },
  { slug: "kayakapi-premium-caves", match: /Kayakap[ıi] Premium/i },
  { slug: "cappadocia-cave-resort", match: /Cappadocia Cave Resort/i },
  { slug: "zorlu-grand-trabzon", match: /Zorlu Grand/i },
  { slug: "novotel-trabzon", match: /Novotel Trabzon/i },
  { slug: "radisson-blu-trabzon", match: /Radisson Blu.*Trabzon/i },
  { slug: "swissotel-uludag-bursa", match: /Swissôtel Resort Uluda[gğ]|Swissotel Resort Uludag|Bof Hotels Uluda[gğ]/i },
  { slug: "kervansaray-bursa", match: /Kervansaray Bursa/i },
  { slug: "holiday-inn-bursa", match: /Holiday Inn Bursa/i },
  { slug: "richmond-nua-wellness-spa", match: /Richmond Nua/i },
  { slug: "ng-sapanca-wellness", match: /NG Sapanca Wellness/i },
  { slug: "ng-sapanca-enjoy", match: /NG Enjoy/i },
  { slug: "ayder-paradise-otel", match: /Ayder Paradise/i },
  { slug: "yesilvadi", match: /Ye[sş]ilvadi/i },
];

/** Approximate room prices USD by hotel tier */
const ROOM_PRICE_TIERS = {
  palace: [420, 520, 680, 920, 1200],
  luxury: [280, 350, 450, 620, 850],
  resort: [220, 280, 340, 420, 550],
  mid: [95, 120, 150, 185, 220],
  budget: [65, 85, 105, 130, 155],
};

const SLUG_TIER = {
  "ciragan-palace-kempinski-istanbul": "palace",
  "raffles-istanbul": "palace",
  "four-seasons-bosphorus": "palace",
  "peninsula-istanbul": "palace",
  "ritz-carlton-istanbul": "palace",
  "shangri-la-bosphorus": "luxury",
  "swissotel-the-bosphorus": "luxury",
  "cvk-park-bosphorus": "luxury",
  "pera-palace-hotel": "luxury",
  "ajia-hotel-istanbul": "luxury",
  "rixos-premium-belek": "resort",
  "maxx-royal-kemer": "resort",
  "akra-antalya": "luxury",
  "calista-luxury-resort": "resort",
  "regnum-carya": "resort",
  "museum-hotel-cappadocia": "luxury",
  "argos-in-cappadocia": "luxury",
  "kayakapi-premium-caves": "luxury",
  "cappadocia-cave-resort": "resort",
  "zorlu-grand-trabzon": "mid",
  "novotel-trabzon": "mid",
  "radisson-blu-trabzon": "mid",
  "swissotel-uludag-bursa": "resort",
  "kervansaray-bursa": "mid",
  "holiday-inn-bursa": "mid",
  "richmond-nua-wellness-spa": "luxury",
  "ng-sapanca-wellness": "resort",
  "ng-sapanca-enjoy": "resort",
  "ayder-paradise-otel": "mid",
  "yesilvadi": "budget",
};

const UNSPLASH_BY_CITY = {
  Istanbul: [
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
  ],
  Antalya: [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1571008887538-b36bb08f4571?w=1200&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
  ],
};

function slugFromText(text) {
  const titleM = text.match(/Reviews of\s+([^\n|]+)/i);
  const header = titleM ? titleM[1] : text.slice(0, 500);
  for (const h of HOTEL_MATCH) {
    if (h.match.test(header) || h.match.test(text.slice(0, 2500))) return h.slug;
  }
  return null;
}

function parseDistanceKm(label) {
  const mi = label.match(/([\d.]+)\s*mi/i);
  if (mi) return parseFloat(mi[1]) * 1.609;
  const km = label.match(/([\d.]+)\s*km/i);
  if (km) return parseFloat(km[1]);
  if (/walk|short|nearby|adjacent|on site/i.test(label)) return 0.4;
  if (/min drive|minutes/i.test(label)) return 1.2;
  return 0.8;
}

function offsetCoords(lat, lng, index, distanceKm) {
  const bearing = ((index * 67) % 360) * (Math.PI / 180);
  const dLat = (distanceKm / 6371) * (180 / Math.PI) * Math.cos(bearing);
  const dLng =
    (distanceKm / 6371) *
    (180 / Math.PI) *
    (Math.sin(bearing) / Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

function buildNearbyPlaces(hotel) {
  const lat = hotel.lat ?? 41.01;
  const lng = hotel.lng ?? 28.98;
  const en = hotel.nearbyEn || [];
  const ar = hotel.nearbyAr || [];
  return en.map((placeEn, i) => {
    const nameEn = placeEn.split("—")[0].split("-")[0].trim();
    const nameAr = (ar[i] || placeEn).split("—")[0].split("-")[0].trim();
    const dist = parseDistanceKm(placeEn);
    const coords = offsetCoords(lat, lng, i, dist);
    let category = "attraction";
    if (/airport|havaliman/i.test(placeEn)) category = "transport";
    else if (/restaurant|dining/i.test(placeEn)) category = "dining";
    else if (/beach|sea|bosphorus|water/i.test(placeEn)) category = "nature";
    return { nameEn, nameAr, lat: coords.lat, lng: coords.lng, category };
  });
}

function normalizeText(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, 200);
}

function extractReviewsFromDump(text) {
  const reviews = [];
  const chunks = text.split(/\*?\s*Reviewed:\s+/i).slice(1);
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 4) continue;
    const date = lines[0].replace(/^\*+\s*/, "");
    let i = 1;
    const author = lines[i++] || "Guest";
    let country = "";
    let rating = 9;
    let title = "";
    let body = "";
    let stayTypeEn = "";

    while (i < lines.length) {
      const l = lines[i];
      if (/^\d+(\.\d+)?$/.test(l) && parseFloat(l) <= 10) {
        rating = parseFloat(l);
        i++;
        continue;
      }
      if (/^\d+\s+reviews?$/i.test(l) || /helpful vote/i.test(l)) {
        i++;
        continue;
      }
      if (!country && i === 2 && l.length < 45 && !/^•/.test(l) && !/^Stayed/i.test(l)) {
        country = l;
        i++;
        continue;
      }
      if (/^["“']/.test(l) || /^&ldquo;/i.test(l) || (l.length < 120 && !/^•/.test(l) && !body && !/^Stayed/i.test(l) && !/^Nothing$/i.test(l))) {
        if (!title) {
          title = l.replace(/^["“'&ldquo;]+|["”'&rdquo;]+$/g, "").replace(/&ldquo;|&rdquo;/g, "").trim();
          i++;
          continue;
        }
      }
      if (/^•\s*(Couple|Solo|Family|Group|Business|Leisure)/i.test(l)) {
        stayTypeEn = l.replace(/^•\s*/, "");
        i++;
        continue;
      }
      if (/^•/.test(l) || /^Stayed in /i.test(l) || /^Submitted via/i.test(l)) {
        i++;
        continue;
      }
      if (/^Nothing$/i.test(l)) {
        i++;
        continue;
      }
      if (l.startsWith("*") || l.includes("bstatic.com")) {
        i++;
        continue;
      }
      if (l.length > 20) {
        body += (body ? " " : "") + l;
      }
      i++;
    }

    if (body.length > 25) {
      reviews.push({
        author,
        countryEn: country,
        countryAr: country,
        rating,
        date,
        titleEn: title,
        titleAr: title,
        textEn: body.slice(0, 900),
        textAr: body.slice(0, 900),
        source: "Booking.com",
        stayTypeEn,
        stayTypeAr: stayTypeEn,
      });
    }
  }
  return reviews;
}

function collectDumpReviews() {
  const bySlug = {};
  if (!fs.existsSync(TOOLS)) return bySlug;
  for (const f of fs.readdirSync(TOOLS)) {
    if (!f.endsWith(".txt")) continue;
    const text = fs.readFileSync(path.join(TOOLS, f), "utf8");
    if (!/Verified Hotel Reviews|Reviewed:/i.test(text)) continue;
    const slug = slugFromText(text);
    if (!slug) continue;
    const extracted = extractReviewsFromDump(text);
    if (!bySlug[slug]) bySlug[slug] = [];
    bySlug[slug].push(...extracted);
  }
  return bySlug;
}

function dedupeReviews(list) {
  const seen = new Set();
  return list.filter((r) => {
    const key = normalizeText(r.textEn || r.textAr);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureImages(hotel) {
  const city = hotel.city || "Istanbul";
  const pool = UNSPLASH_BY_CITY[city] || UNSPLASH_BY_CITY.default;
  const existing = Array.isArray(hotel.images) ? hotel.images.filter(Boolean) : [];
  if (existing.length >= 4) return existing;
  const merged = [...existing];
  for (const img of pool) {
    if (merged.length >= 6) break;
    if (!merged.includes(img)) merged.push(img);
  }
  return merged;
}

function ensureRoomPrices(hotel) {
  const tier = SLUG_TIER[hotel.slug] || "mid";
  const prices = ROOM_PRICE_TIERS[tier];
  return (hotel.rooms || []).map((room, i) => ({
    ...room,
    price: room.price > 0 ? room.price : prices[Math.min(i, prices.length - 1)],
    currency: room.currency || "USD",
    images:
      room.images?.length > 0
        ? room.images
        : ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80"],
  }));
}

function main() {
  const hotels = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const dumpReviews = collectDumpReviews();

  const summary = [];
  for (const hotel of hotels) {
    const fromDump = dumpReviews[hotel.slug] || [];
    const existing = (hotel.guestReviews || []).map((r) => ({
      author: r.author,
      countryEn: r.countryEn || "",
      countryAr: r.countryAr || "",
      rating: r.rating,
      date: r.date || "",
      titleEn: r.titleEn || "",
      titleAr: r.titleAr || "",
      textEn: r.textEn || "",
      textAr: r.textAr || "",
      source: r.source || "Booking.com",
      stayTypeEn: r.stayTypeEn || "",
      stayTypeAr: r.stayTypeAr || "",
    }));

    const merged = dedupeReviews([...existing, ...fromDump]);
    hotel.guestReviews = merged;
    hotel.rooms = ensureRoomPrices(hotel);
    hotel.images = ensureImages(hotel);
    hotel.nearbyPlaces = buildNearbyPlaces(hotel);
    hotel.whatsappNumber = "905321796763";

    summary.push({ slug: hotel.slug, reviews: merged.length, images: hotel.images.length });
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(hotels, null, 2));
  console.log("Enriched", hotels.length, "hotels →", JSON_PATH);
  for (const s of summary) {
    console.log(`  ${s.slug}: ${s.reviews} reviews, ${s.images} images`);
  }
  const min = Math.min(...summary.map((s) => s.reviews));
  const max = Math.max(...summary.map((s) => s.reviews));
  const avg = (summary.reduce((a, s) => a + s.reviews, 0) / summary.length).toFixed(1);
  console.log(`Review counts: min=${min} max=${max} avg=${avg}`);
}

main();
