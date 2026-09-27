import { defaultHotels } from "@/data/hotels";
import { defaultTransfers, getFeaturedVipDailyTours } from "@/data/transfers";
import { defaultPackages } from "@/data/packages";
import { defaultFlights } from "@/data/flights";

/** Compact catalog snapshot for sales Gemini prompt (server-safe defaults). */
export function buildSalesCatalogSnapshot() {
  const hotels = defaultHotels
    .filter((h) => h.isActive !== false)
    .slice(0, 12)
    .map((h) => {
      const prices = (h.rooms || []).map((r) => r.price).filter((p) => p > 0);
      const fromPrice = prices.length ? Math.min(...prices) : 0;
      return {
        id: h.id,
        slug: h.slug,
        nameAr: h.nameAr,
        nameEn: h.nameEn,
        city: h.city,
        stars: h.stars,
        rating: h.rating,
        fromPrice,
        currency: h.rooms?.[0]?.currency || "USD",
        image: h.images?.[0] || "",
        highlightsAr: (h.highlightsAr || []).slice(0, 3),
        highlightsEn: (h.highlightsEn || []).slice(0, 3),
      };
    });

  const transfers = defaultTransfers
    .filter((t) => t.isActive !== false)
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      type: t.type,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      vehicle: t.vehicleName,
      seats: t.seats,
      price: t.price,
      currency: t.currency,
      image: t.images?.[0] || "",
      route: `${t.routeFromAr || t.routeFrom || ""} → ${t.routeToAr || t.routeTo || ""}`,
    }));

  const packages = defaultPackages.slice(0, 10).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    destination: p.destination,
    days: p.durationDays,
    price: p.price,
    currency: "USD",
    image: p.images?.[0]?.url || "",
    amenities: (p.amenities || []).slice(0, 4),
    href: `/package/${p.slug}`,
  }));

  const vipTours = getFeaturedVipDailyTours()
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      price: t.price,
      currency: t.currency || "USD",
      image: t.images?.[0] || "",
      href: `/vip-tours/${t.slug}`,
    }));

  const flights = defaultFlights
    .filter((f) => f.isActive !== false)
    .slice(0, 10)
    .map((f) => ({
      id: f.id,
      airline: f.airline,
      flightNumber: f.flightNumber,
      from: `${f.departure.city} (${f.departure.airport})`,
      to: `${f.arrival.city} (${f.arrival.airport})`,
      duration: f.duration,
      stops: f.stops,
      price: f.price,
      currency: "USD",
    }));

  return { hotels, transfers, packages, vipTours, flights };
}

export function applyMarkup(basePrice: number, markupPercent: number): number {
  const m = Math.max(0, Number(markupPercent) || 0);
  return Math.round(basePrice * (1 + m / 100));
}
