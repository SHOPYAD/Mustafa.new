import { defaultHotels } from "@/data/hotels";
import { defaultFlights } from "@/data/flights";
import { defaultPackages } from "@/data/packages";
import { defaultTransfers, getFeaturedVipDailyTours } from "@/data/transfers";
import { listBlogPosts } from "@/lib/server/blog-store";
import { getSiteContact } from "@/lib/server/site-contact-file";

export interface HotelSearchResult {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  city: string;
  stars: number;
  rating: number;
  fromPriceUSD: number;
  currency: string;
  image: string;
  highlights: string[];
  bookingUrl: string;
}

export interface FlightSearchResult {
  id: string;
  airline: string;
  flightNumber: string;
  fromCity: string;
  fromAirport: string;
  toCity: string;
  toAirport: string;
  departureTime?: string;
  priceUSD: number;
  duration?: string;
  stops: number;
  bookingUrl: string;
}

export interface CarTransferSearchResult {
  id: string;
  slug: string;
  titleAr: string;
  vehicle: string;
  seats: number;
  priceUSD: number;
  route: string;
  image: string;
  bookingUrl: string;
}

export interface PackageTourSearchResult {
  id: string;
  slug: string;
  title: string;
  destination: string;
  days: number;
  priceUSD: number;
  image: string;
  amenities: string[];
  bookingUrl: string;
}

export interface BlogArticleSearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  url: string;
}

/**
 * 1. Search Hotels Registry (Live Suppliers + Local Fallback)
 */
export async function searchHotelsTool(params: {
  city?: string;
  stars?: number;
  maxBudgetUSD?: number;
  query?: string;
}): Promise<HotelSearchResult[]> {
  const q = (params.query || params.city || "Istanbul").toLowerCase().trim();
  const maxBudget = params.maxBudgetUSD ? Number(params.maxBudgetUSD) : Infinity;
  const starsMin = params.stars ? Number(params.stars) : 0;

  // 1. Try Live Multi-Provider Hotels Engine
  try {
    const { runPublicHotelSearch } = await import("@/lib/server/hotels-search-runtime");
    const checkIn = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
    const checkOut = new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10);
    const res = await runPublicHotelSearch({
      query: q,
      checkIn,
      checkOut,
      adults: 2,
      rooms: 1,
      page: 1,
    });
    if (res.ok && res.hotels?.length) {
      const liveResults = res.hotels
        .filter((h: any) => (starsMin > 0 ? (h.stars || 4) >= starsMin : true))
        .map((h: any) => {
          const price = Number(h.priceFrom || h.nightly || 100);
          return {
            id: h.id,
            slug: h.id,
            nameAr: h.name,
            nameEn: h.name,
            city: h.city || q,
            stars: h.stars || 4,
            rating: h.rating || 8.5,
            fromPriceUSD: price,
            currency: h.currency || "USD",
            image: h.image || "/images/hotel-placeholder.jpg",
            highlights: h.amenities?.slice(0, 3) || ["واي فاي مجاني", "مكيف", "خدمة غرف"],
            bookingUrl: `/hotels/${h.id}?checkIn=${checkIn}&checkOut=${checkOut}&q=${encodeURIComponent(q)}`,
          };
        })
        .filter((h: any) => h.fromPriceUSD <= maxBudget)
        .slice(0, 6);

      if (liveResults.length > 0) return liveResults;
    }
  } catch {
    /* fallback to local catalogue */
  }

  // 2. Fallback to Local Hotels
  const results = defaultHotels
    .filter((h) => {
      if (h.isActive === false) return false;
      if (starsMin > 0 && h.stars < starsMin) return false;
      if (q) {
        const matchCity = (h.city || "").toLowerCase().includes(q);
        const matchNameAr = (h.nameAr || "").toLowerCase().includes(q);
        const matchNameEn = (h.nameEn || "").toLowerCase().includes(q);
        if (!matchCity && !matchNameAr && !matchNameEn) return false;
      }
      return true;
    })
    .map((h) => {
      const prices = (h.rooms || []).map((r) => r.price).filter((p) => p > 0);
      const fromPrice = prices.length ? Math.min(...prices) : 80;
      return {
        id: h.id,
        slug: h.slug,
        nameAr: h.nameAr,
        nameEn: h.nameEn,
        city: h.city,
        stars: h.stars,
        rating: h.rating || 4.8,
        fromPriceUSD: fromPrice,
        currency: "USD",
        image: h.images?.[0] || "",
        highlights: (h.highlightsAr || []).slice(0, 3),
        bookingUrl: `/hotels/${h.slug}`,
      };
    })
    .filter((h) => h.fromPriceUSD <= maxBudget)
    .slice(0, 6);

  return results;
}

/**
 * 2. Search Flights Registry (Live Multi-Provider + Local Fallback)
 */
export async function searchFlightsTool(params: {
  from?: string;
  to?: string;
  maxPriceUSD?: number;
}): Promise<FlightSearchResult[]> {
  const fromQ = (params.from || "IST").toLowerCase().trim();
  const toQ = (params.to || "AYT").toLowerCase().trim();
  const maxPrice = params.maxPriceUSD ? Number(params.maxPriceUSD) : Infinity;

  // 1. Try Live Multi-Provider Flight Search (PKFARE, Seeru, Travelport, BiletBank)
  try {
    const { runFlightSearch } = await import("@/lib/server/flights-engine");
    const depDate = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
    const orig = fromQ.toUpperCase().slice(0, 3);
    const dest = toQ.toUpperCase().slice(0, 3);
    const res = await runFlightSearch({
      originSkyId: orig,
      destinationSkyId: dest,
      originEntityId: orig,
      destinationEntityId: dest,
      date: depDate,
      adults: 1,
    });
    if (res.ok && res.session?.itineraries?.length) {
      const liveResults = res.session.itineraries
        .map((it) => {
          const seg = it.legs?.[0]?.segments?.[0];
          const price = Number(it.price?.client || 120);
          return {
            id: it.id,
            airline: seg?.airline || "Turkish Airlines",
            flightNumber: seg?.flightNumber || "TK2410",
            fromCity: seg?.origin?.city || orig,
            fromAirport: seg?.origin?.displayCode || orig,
            toCity: seg?.destination?.city || dest,
            toAirport: seg?.destination?.displayCode || dest,
            departureTime: seg?.departure ? seg.departure.slice(11, 16) : "08:30",
            priceUSD: price,
            duration: `${Math.round((it.durationMinutes || 75) / 60)}h ${Math.round((it.durationMinutes || 75) % 60)}m`,
            stops: it.stops || 0,
            bookingUrl: `/flights/search?from=${encodeURIComponent(orig)}&to=${encodeURIComponent(dest)}&date=${depDate}`,
          };
        })
        .filter((f) => f.priceUSD <= maxPrice)
        .slice(0, 6);

      if (liveResults.length > 0) return liveResults;
    }
  } catch {
    /* fallback to local catalogue */
  }

  // 2. Fallback to Local Flights
  let matches = defaultFlights.filter((f) => {
    if (f.isActive === false) return false;
    if (fromQ && !f.departure.city.toLowerCase().includes(fromQ) && !f.departure.airport.toLowerCase().includes(fromQ)) {
      return false;
    }
    if (toQ && !f.arrival.city.toLowerCase().includes(toQ) && !f.arrival.airport.toLowerCase().includes(toQ)) {
      return false;
    }
    return true;
  });

  if (matches.length === 0) {
    matches = defaultFlights.filter((f) => f.isActive !== false);
  }

  const results = matches
    .map((f) => ({
      id: f.id,
      airline: f.airline,
      flightNumber: f.flightNumber,
      fromCity: f.departure.city,
      fromAirport: f.departure.airport,
      toCity: f.arrival.city,
      toAirport: f.arrival.airport,
      departureTime: f.departure.time,
      priceUSD: f.price,
      duration: f.duration,
      stops: f.stops,
      bookingUrl: `/flights/search?from=${encodeURIComponent(f.departure.airport)}&to=${encodeURIComponent(f.arrival.airport)}`,
    }))
    .filter((f) => f.priceUSD <= maxPrice)
    .slice(0, 6);

  return results;
}

/**
 * 2b. Price Intelligence & Competitive Analysis Tool (for War Room / Pricing Strategy)
 */
export async function compareProviderPricesTool(params: {
  route?: string;
  city?: string;
  type?: "flights" | "hotels" | "transfers";
  baseCost?: number;
  competitorPrice?: number;
}): Promise<{
  cheapestProvider: string;
  lowestPrice: number;
  averageMarketPrice: number;
  spreadPercentage: number;
  pricingStrategyRecommendation: string;
  profitFloorGuaranteed: boolean;
}> {
  const { smartPricingEngineMcp } = await import("@/lib/server/mcp/servers/platform-admin");
  const vertical = params.type || "hotels";
  const cost = params.baseCost || (vertical === "hotels" ? 110 : vertical === "transfers" ? 45 : 85);
  const comp = params.competitorPrice || Math.round(cost * 1.22);

  const engineRes = await smartPricingEngineMcp({
    vertical,
    routeOrDestination: params.route || params.city || "General",
    baseCost: cost,
    competitorPrice: comp,
  });

  return {
    cheapestProvider: vertical === "hotels" ? "Seeru / RateHawk" : vertical === "transfers" ? "Seeru Ride" : "BiletBank / PKFARE",
    lowestPrice: engineRes.recommendedPriceUSD,
    averageMarketPrice: comp,
    spreadPercentage: engineRes.customerSavingsPct,
    pricingStrategyRecommendation: engineRes.executiveStrategyAr,
    profitFloorGuaranteed: engineRes.profitFloorEnforced || engineRes.netProfitUSD > 0,
  };
}

/**
 * 2c. Smart Pricing Engine with Guaranteed Profit Floor
 */
export async function smartPricingEngineTool(params: {
  vertical: "flights" | "hotels" | "transfers";
  routeOrDestination: string;
  baseCost: number;
  competitorPrice?: number;
  targetDiscountVsCompetitorPct?: number;
  minProfitFloorPct?: number;
}) {
  const { smartPricingEngineMcp } = await import("@/lib/server/mcp/servers/platform-admin");
  return smartPricingEngineMcp(params);
}

/**
 * 3. Search Cars & VIP Transfers Registry (Live Seeru Ride + Local Fallback)
 */
export async function searchCarsTool(params: {
  city?: string;
  vehicle?: string;
  query?: string;
  maxPriceUSD?: number;
}): Promise<CarTransferSearchResult[]> {
  const q = (params.query || params.city || params.vehicle || "").toLowerCase().trim();
  const maxPrice = params.maxPriceUSD ? Number(params.maxPriceUSD) : Infinity;

  // 1. Try Live Seeru Ride Search
  try {
    const { SeeruRideAdapter } = await import("@/lib/providers/adapters/seeru/seeruRideAdapter");
    const { applyMarkup } = await import("@/lib/server/sales-catalog");
    const adapter = new SeeruRideAdapter();

    const fromQuery = q || "Istanbul";
    const locs = await adapter.searchLocations(fromQuery);
    if (locs.length > 0) {
      const today = new Date();
      const depDate = new Date(today.getTime() + 86400000 * 2).toISOString().slice(0, 10);
      const searchRes = await adapter.searchRides({
        fromPlaceId: locs[0].place_id,
        date: depDate,
        time: "12:00",
        mode: "transfer",
        pax: 2,
      });

      if (searchRes.offers?.length) {
        const markup = Number(process.env.TRANSFERS_MARKUP_PERCENT || 15);
        const liveResults = searchRes.offers
          .map((o) => {
            const clientPrice = applyMarkup(o.price, markup);
            return {
              id: `sr_${o.offer_id}`,
              slug: `ride-${o.offer_id}`,
              titleAr: `ترانسفير خاص - ${o.car_class.title}`,
              vehicle: o.car_class.title,
              seats: o.car_class.capacity,
              priceUSD: clientPrice,
              route: `${locs[0].label} ➔ وسط المدينة / الفندق`,
              image: o.car_class.image || "/images/cars/sedan.png",
              bookingUrl: `/transfers?from=${encodeURIComponent(locs[0].label)}`,
            };
          })
          .filter((t) => t.priceUSD <= maxPrice)
          .slice(0, 6);

        if (liveResults.length > 0) return liveResults;
      }
    }
  } catch {
    /* fallback to local catalogue */
  }

  // 2. Fallback to Local catalogue
  const results = defaultTransfers
    .filter((t) => {
      if (t.isActive === false) return false;
      if (q) {
        const matchTitle = (t.titleAr || "").toLowerCase().includes(q) || (t.titleEn || "").toLowerCase().includes(q);
        const matchVehicle = (t.vehicleName || "").toLowerCase().includes(q);
        const matchRoute = (t.routeFromAr || "").toLowerCase().includes(q) || (t.routeToAr || "").toLowerCase().includes(q);
        if (!matchTitle && !matchVehicle && !matchRoute) return false;
      }
      return true;
    })
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      titleAr: t.titleAr,
      vehicle: t.vehicleName,
      seats: t.seats,
      priceUSD: t.price,
      route: `${t.routeFromAr || t.routeFrom || ""} ➔ ${t.routeToAr || t.routeTo || ""}`,
      image: t.images?.[0] || "",
      bookingUrl: `/transfers/${t.slug}`,
    }))
    .filter((t) => t.priceUSD <= maxPrice)
    .slice(0, 6);

  return results;
}

/**
 * 3b. Dedicated Live Transfers Search Tool
 */
export async function searchTransfersTool(params: {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  pax?: number;
  maxPriceUSD?: number;
}): Promise<CarTransferSearchResult[]> {
  return searchCarsTool({
    query: `${params.from || ""} ${params.to || ""}`.trim(),
    maxPriceUSD: params.maxPriceUSD,
  });
}

/**
 * 4. Search Tour Packages & Daily Tours Registry
 */
export async function searchPackagesAndToursTool(params: {
  destination?: string;
  query?: string;
  maxDays?: number;
}): Promise<PackageTourSearchResult[]> {
  const q = (params.query || params.destination || "").toLowerCase().trim();

  const packagesList = defaultPackages
    .filter((p) => {
      if (q) {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDest = (p.destination || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDest) return false;
      }
      return true;
    })
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      destination: p.destination,
      days: p.durationDays,
      priceUSD: p.price,
      image: p.images?.[0]?.url || "",
      amenities: (p.amenities || []).slice(0, 4),
      bookingUrl: `/package/${p.slug}`,
    }));

  const vipDaily = getFeaturedVipDailyTours()
    .filter((v) => {
      if (q) {
        const matchTitle = (v.titleAr || "").toLowerCase().includes(q) || (v.titleEn || "").toLowerCase().includes(q);
        if (!matchTitle) return false;
      }
      return true;
    })
    .map((v) => ({
      id: v.id,
      slug: v.slug,
      title: v.titleAr || v.titleEn,
      destination: "تركيا / إسطنبول وطرابزون",
      days: 1,
      priceUSD: v.price,
      image: v.images?.[0] || "",
      amenities: ["سائق VIP خاص", "سيارة مرسيدس فيتو حديثة", "شامل الوقود والمواقف"],
      bookingUrl: `/vip-tours/${v.slug}`,
    }));

  return [...packagesList, ...vipDaily].slice(0, 8);
}

/**
 * 5. Search Blog Articles
 */
export async function searchBlogArticlesTool(query: string): Promise<BlogArticleSearchResult[]> {
  try {
    const posts = await listBlogPosts();
    const q = query.toLowerCase().trim();
    return posts
      .filter((p) => {
        if (!q) return true;
        return (
          p.titleAr.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.contentAr.toLowerCase().includes(q)
        );
      })
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.titleAr,
        excerpt: p.contentAr.slice(0, 140) + "...",
        publishedAt: p.createdAt,
        url: `/blog/${p.slug}`,
      }));
  } catch {
    return [];
  }
}

/**
 * 6. Get Social Media Context and Official Links
 */
export async function getCompanySocialContextTool(): Promise<{
  contact: Record<string, string>;
  latestOffersSummary: string;
}> {
  const contact = await getSiteContact();
  const getSocialUrl = (id: string) =>
    (contact.social || []).find((s) => s.id === id && s.enabled)?.url || "";

  const contactData: Record<string, string> = {
    whatsapp: contact.whatsappNumber ? `+${contact.whatsappNumber}` : "+90 531 359 13 94",
    email: contact.email || "info@lonaliza.com",
    address: contact.address || "İstanbul, Türkiye",
    instagram: getSocialUrl("instagram") || "https://instagram.com/lonaliza",
    facebook: getSocialUrl("facebook") || "https://facebook.com/lonaliza",
    tiktok: getSocialUrl("tiktok") || "https://tiktok.com/@lonaliza",
    x: getSocialUrl("twitter") || "https://x.com/lonaliza",
    youtube: getSocialUrl("youtube") || "https://youtube.com/@lonaliza",
  };

  const latestOffersSummary = `
- عرض رحلات طرابزون وأوزنجول 5 أيام 4 ليالي بفندق 5 نجوم شامل الجولات وسائق VIP ابتداءً من $650 للشخصين.
- عرض بكج إسطنبول وبورصة وسبانجا VIP بسيارة خاصة حديثة ابتداءً من $850.
- عروض حجز فنادق تقسيم والسلطان أحمد بأسعار مخفضة وخصم 15% للحجز المبكر.
`.trim();

  return {
    contact: contactData,
    latestOffersSummary,
  };
}

/**
 * 7. Synchronize and Inspect Featured Hotels Catalog (12 Destinations, Live Providers)
 */
export async function syncFeaturedHotelsTool(params?: {
  destination?: string;
  markupPercent?: number;
}): Promise<{ ok: boolean; message: string; destinationsCount: number; hotelsCount: number }> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const catalogPath = path.join(process.cwd(), ".data", "featured-hotels-catalog.json");
    const raw = await fs.readFile(catalogPath, "utf8");
    const catalog = JSON.parse(raw);

    const markup = params?.markupPercent ? 1 + params.markupPercent / 100 : 1.15;
    let totalHotels = 0;
    let totalDests = 0;

    for (const [k, dest] of Object.entries(catalog as Record<string, any>)) {
      if (params?.destination && params.destination.toLowerCase() !== k) continue;
      if (Array.isArray(dest.hotels)) {
        for (const h of dest.hotels) {
          if (h.cheapestRoom?.originalPrice) {
            const base = Math.round(h.cheapestRoom.originalPrice / 1.15);
            h.cheapestRoom.price = Math.round(base * markup);
            totalHotels++;
          }
        }
        totalDests++;
      }
    }

    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
    const cachePath = path.join(process.cwd(), ".data", "featured-hotels-cache.json");
    const now = Date.now();
    const cache: Record<string, any> = {};
    for (const [destId, destObj] of Object.entries(catalog as Record<string, any>)) {
      cache[destId] = { at: now, hotels: destObj.hotels || [] };
    }
    await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");

    return {
      ok: true,
      message: `تم تحديث ${totalHotels} فندقاً حقيقياً في ${totalDests} وجهة وتطبيق مارك أب لوناليزا بنجاح`,
      destinationsCount: totalDests,
      hotelsCount: totalHotels,
    };
  } catch (err: any) {
    return { ok: false, message: err.message, destinationsCount: 0, hotelsCount: 0 };
  }
}

export async function getFeaturedHotelsTool(params?: { destination?: string }): Promise<any> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const catalogPath = path.join(process.cwd(), ".data", "featured-hotels-catalog.json");
    const raw = await fs.readFile(catalogPath, "utf8");
    const catalog = JSON.parse(raw);
    if (params?.destination) {
      const target = catalog[params.destination.toLowerCase().trim()];
      return target || catalog.istanbul;
    }
    return catalog;
  } catch (err: any) {
    return { error: err.message };
  }
}

