// src/data/packages.ts
import { HolidayPackage, Testimonial } from "@/types/package";
import { tourismPrograms } from "@/data/tourism-programs";

/**
 * Multi-day Turkey tourism programs (3–10+ days).
 * Prices are approximate 2026 market rates in USD per person — not live quotes.
 */
export const defaultPackages: HolidayPackage[] = tourismPrograms;

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Fatima Al-Ali",
    location: "Riyadh, Saudi Arabia",
    rating: 5,
    text: "Our Istanbul trip with Alrayyan Tourism was flawless — central hotel, Arabic guide, and a perfectly paced itinerary from Hagia Sophia to the Bosphorus.",
    tripDestination: "Istanbul",
  },
  {
    id: "2",
    name: "Mohammed Al-Rashid",
    location: "Kuwait City, Kuwait",
    rating: 5,
    text: "Trabzon and Uzungöl exceeded expectations. The private VIP car made the mountain roads comfortable and the program felt truly bespoke.",
    tripDestination: "Trabzon",
  },
  {
    id: "3",
    name: "Noura Al-Salem",
    location: "Doha, Qatar",
    rating: 5,
    text: "Sapanca day trip was ideal for our family — Maşukiye waterfalls, lakeside lunch, and seamless pickup from Istanbul. Highly recommend Alrayyan.",
    tripDestination: "Sapanca",
  },
];

// --- localStorage CRUD ---
const STORAGE_KEY = "alrayyan_packages_v6_rich_tourism";
const LEGACY_PACKAGE_KEYS = [
  "alrayyan_packages_v5_tourism_programs",
  "alrayyan_packages_v4_approx_prices",
  "alrayyan_packages_v3",
  "oktravel_packages_v2_migrated",
  "oktravel_packages_v2",
  "oktravel_packages",
];

/** Approximate package prices (USD) by destination when seed has 0. */
function approxPriceForDestination(destinationEn: string, durationDays?: number): number {
  const d = (destinationEn || "").toLowerCase();
  const days = durationDays && durationDays > 0 ? durationDays : 4;
  let base = 449;
  if (/cappadocia|kapadokya/.test(d)) base = 699;
  else if (/antalya|belek|kemer|side/.test(d)) base = 599;
  else if (/trabzon|uzungol|uzungöl|ayder|rize/.test(d)) base = 549;
  else if (/bursa|uludag|uludağ/.test(d)) base = 349;
  else if (/sapanca|masukiye|maşukiye/.test(d)) base = 199;
  else if (/istanbul/.test(d)) base = 499;
  const scaled = Math.round(base + Math.max(0, days - 3) * 55);
  return Math.round(scaled / 10) * 10;
}

function withApproxPrices(packages: HolidayPackage[]): HolidayPackage[] {
  return packages.map((p) => {
    if (p.price && p.price > 0) return p;
    const price = approxPriceForDestination(
      p.destinationEn || p.destination || "",
      p.durationDays
    );
    return { ...p, price };
  });
}

function clearLegacyPackageKeys() {
  for (const key of LEGACY_PACKAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function mergeWithDefaults(stored: HolidayPackage[]): HolidayPackage[] {
  const byId = new Map(defaultPackages.map((p) => [p.id, p]));
  return stored.map((p) => {
    const base = byId.get(p.id);
    if (!base) return p;
    return {
      ...base,
      ...p,
      price: p.price && p.price > 0 ? p.price : base.price,
      titleAr: p.titleAr || base.titleAr,
      titleEn: p.titleEn || base.titleEn || p.title,
      destinationAr: p.destinationAr || base.destinationAr,
      destinationEn: p.destinationEn || base.destinationEn || p.destination,
      countryAr: p.countryAr || base.countryAr,
      countryEn: p.countryEn || base.countryEn || p.country,
      amenitiesAr: p.amenitiesAr?.length ? p.amenitiesAr : base.amenitiesAr,
    };
  });
}

export function getPackages(): HolidayPackage[] {
  if (typeof window === "undefined") return withApproxPrices(defaultPackages);
  try {
    clearLegacyPackageKeys();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return withApproxPrices(mergeWithDefaults(JSON.parse(stored)));
    const seeded = withApproxPrices(defaultPackages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return withApproxPrices(defaultPackages);
  }
}

export function savePackages(packages: HolidayPackage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}

export function addPackage(pkg: Omit<HolidayPackage, "id">): HolidayPackage {
  const packages = getPackages();
  const newPkg: HolidayPackage = { ...pkg, id: Date.now().toString() };
  packages.push(newPkg);
  savePackages(packages);
  return newPkg;
}

export function updatePackage(
  id: string,
  updates: Partial<HolidayPackage>
): HolidayPackage | null {
  const packages = getPackages();
  const index = packages.findIndex((p) => p.id === id);
  if (index === -1) return null;
  packages[index] = { ...packages[index], ...updates };
  savePackages(packages);
  return packages[index];
}

export function deletePackage(id: string): boolean {
  const packages = getPackages();
  const filtered = packages.filter((p) => p.id !== id);
  if (filtered.length === packages.length) return false;
  savePackages(filtered);
  return true;
}

export function resetPackages(): HolidayPackage[] {
  const seeded = withApproxPrices(defaultPackages);
  savePackages(seeded);
  return seeded;
}

// Keep backward compat: re-export as featuredPackages for SSR pages
export const featuredPackages = withApproxPrices(defaultPackages);
