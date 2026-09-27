/**
 * Approximate 2024–2026 Turkey tourism market prices (USD).
 * Day tours, packages, and hotel-from rates are indicative — not live quotes.
 */
const fs = require("fs");
const path = require("path");

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function jitter(id, base, spread = 0.08) {
  const f = ((hash(id) % 1000) / 1000 - 0.5) * 2 * spread;
  return Math.round((base * (1 + f)) / 5) * 5;
}

function detectDest(text) {
  const t = (text || "").toLowerCase();
  if (/cappadocia|كابادوك|goreme|nevsehir/.test(t)) return "cappadocia";
  if (/antalya|أنطاليا|انطاليا|belek|kemer|alanya/.test(t)) return "antalya";
  if (/trabzon|طرابزون|uzungol|اوزنجول|ayder|ايدر|rize|ريزا/.test(t))
    return "trabzon";
  if (/bursa|بورصة|uludag|أولوداغ/.test(t)) return "bursa";
  if (/sapanca|سابنجا|سبنجا|معشوق|mashukiye|maşukiye/.test(t)) return "sapanca";
  if (/bodrum|بودروم/.test(t)) return "bodrum";
  if (/marmaris|مرماريس/.test(t)) return "marmaris";
  if (/istanbul|اسطنبول|إسطنبول|bosphorus|sultanahmet/.test(t)) return "istanbul";
  return "turkey";
}

function isHotelShowcase(text) {
  return /rixos|ritz|fairmont|swissôtel|swissotel|radisson|wyndham|grand tarabya|kempinski|four seasons|peninsula|shangri|cvk|pera palace|ajia|maxx royal|dedeman|hilton|marriott|فندق|hotel/i.test(
    text || ""
  );
}

function isPrivate(amenities) {
  const a = (amenities || []).join(" ").toLowerCase();
  return /private|خاص|vip/.test(a);
}

/** Approximate per-person day-tour market rates (shared coach / private VIP). */
const DAY_TOUR = {
  istanbul: { shared: 65, private: 220 },
  sapanca: { shared: 85, private: 260 },
  bursa: { shared: 90, private: 280 },
  trabzon: { shared: 110, private: 320 },
  antalya: { shared: 75, private: 240 },
  cappadocia: { shared: 95, private: 350 },
  bodrum: { shared: 80, private: 250 },
  marmaris: { shared: 80, private: 250 },
  turkey: { shared: 80, private: 240 },
};

/** Approximate multi-day package per person per night (hotel + tours). */
const MULTI_PPN = {
  istanbul: 145,
  sapanca: 120,
  bursa: 115,
  trabzon: 135,
  antalya: 155,
  cappadocia: 165,
  bodrum: 140,
  marmaris: 135,
  turkey: 130,
};

/** Hotel listing “from” nightly rates when package is a hotel showcase. */
const HOTEL_FROM = {
  istanbul: 280,
  sapanca: 140,
  bursa: 130,
  trabzon: 150,
  antalya: 220,
  cappadocia: 260,
  bodrum: 180,
  marmaris: 160,
  turkey: 160,
};

function pricePackage(pkg) {
  if (pkg.price > 0) return pkg.price;
  const blob = [
    pkg.title,
    pkg.titleAr,
    pkg.titleEn,
    pkg.destination,
    pkg.destinationEn,
    pkg.description,
  ].join(" ");
  const fromBlob = detectDest(blob);
  const dest =
    fromBlob !== "turkey"
      ? fromBlob
      : detectDest(pkg.destinationEn || pkg.destination || "");
  const days = Math.max(1, Number(pkg.durationDays) || 1);
  const priv = isPrivate(pkg.amenities) || isPrivate(pkg.amenitiesAr);

  if (days === 1) {
    if (
      isHotelShowcase(blob) &&
      !/رحلة|tour|يوم|day trip|معشوق|سابنجا|بورصة|طرابزون/i.test(pkg.title || "")
    ) {
      return jitter(pkg.id, HOTEL_FROM[dest] || 180);
    }
    const d2 = /سابنجا|سبنجا|معشوق|sapanca|mashukiye/i.test(blob)
      ? "sapanca"
      : /بورصة|bursa/i.test(blob)
        ? "bursa"
        : dest;
    const band = DAY_TOUR[d2] || DAY_TOUR.turkey;
    return jitter(pkg.id, priv ? band.private : band.shared);
  }

  const ppn = MULTI_PPN[dest] || MULTI_PPN.turkey;
  let total = ppn * days;
  if (/honeymoon|شهر عسل/i.test(blob)) total *= 1.15;
  if (/5\s*نجوم|5\s*star|luxury|فاخر/i.test(blob)) total *= 1.12;
  return jitter(pkg.id, total, 0.06);
}

function priceTour(tour) {
  if (tour.price > 0) return tour.price;
  const blob = [tour.title, ...(tour.highlights || [])].join(" ");
  const dest = detectDest(blob);
  if (isHotelShowcase(blob) && tour.category === "Hotels") {
    return jitter(tour.id, HOTEL_FROM[dest] || 180);
  }
  const band = DAY_TOUR[dest] || DAY_TOUR.turkey;
  const base = /vip|private|خاص/i.test(blob) ? band.private : band.shared;
  return jitter(tour.id, base);
}

const pkgPath = path.join("src/data/migrated/packages.json");
const tourPath = path.join("src/data/migrated/tours.json");
const packages = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const tours = JSON.parse(fs.readFileSync(tourPath, "utf8"));

let pkgUpdated = 0;
for (const p of packages) {
  const next = pricePackage(p);
  if (p.price !== next) {
    p.price = next;
    pkgUpdated++;
  }
  p.currency = p.currency || "USD";
}

let tourUpdated = 0;
for (const t of tours) {
  const next = priceTour(t);
  if (t.price !== next) {
    t.price = next;
    tourUpdated++;
  }
  if (t.originalPrice != null && t.originalPrice === 0) {
    t.originalPrice = Math.round((t.price * 1.2) / 5) * 5;
  } else if (t.originalPrice == null || t.originalPrice < t.price) {
    t.originalPrice = Math.round((t.price * 1.18) / 5) * 5;
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(packages, null, 2) + "\n");
fs.writeFileSync(tourPath, JSON.stringify(tours, null, 2) + "\n");

const pp = packages.map((p) => p.price);
const tp = tours.map((t) => t.price);
console.log(
  JSON.stringify(
    {
      pkgUpdated,
      tourUpdated,
      pkgMin: Math.min(...pp),
      pkgMax: Math.max(...pp),
      pkgZero: pp.filter((x) => x === 0).length,
      tourMin: Math.min(...tp),
      tourMax: Math.max(...tp),
      tourZero: tp.filter((x) => x === 0).length,
      samplePkgs: packages.slice(0, 8).map((p) => ({
        title: (p.titleEn || p.title).slice(0, 40),
        days: p.durationDays,
        price: p.price,
      })),
      sampleTours: tours.slice(0, 8).map((t) => ({
        title: t.title.slice(0, 40),
        price: t.price,
        cat: t.category,
      })),
    },
    null,
    2
  )
);
