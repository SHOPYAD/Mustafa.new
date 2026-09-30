import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "@/lib/server/gemini";
import { getProvidersRegistry } from "@/lib/server/providers-registry-store";
import { runFlightSearch, type PublicFlightItinerary } from "@/lib/server/flights-engine";
import { runPublicHotelSearch, type PublicHotelSearchResult } from "@/lib/server/hotels-search-runtime";
import { stayFromSearchParams } from "@/lib/hotel-search";
import { defaultHotelDates } from "@/lib/hotels-config";
import { runtimeHasProvider } from "@/lib/hotels-runtime";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { resolvePlaceGeoId } from "@/lib/server/geo-places";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";
import { searchPexels, searchUnsplash } from "@/lib/server/media-search";
import { SeeruRideAdapter } from "@/lib/providers/adapters/seeru/seeruRideAdapter";
import { upsertBlogPost } from "@/lib/server/blog-store";
import { broadcastArticleStage } from "@/lib/swarm/swarm-events";
import { franceHotelSupplierKey } from "@/lib/server/hotels/destinations";
import { loadThreadCheckpoint, reserveArticleIdentity, saveThreadCheckpoint } from "@/lib/swarm/article-thread-checkpoint";
import {
  ARTICLE_PIPELINE_STAGE_DEFS,
  assertOfficialArticle,
  sanitizePublicArticle,
  findTurkeyLeak,
  peekDestination,
  planFranceDestinations,
  renderOfficialArticle,
  TRENDS_BROWSER_TOOL,
  type ArticlePipelineClient,
  type ArticlePipelineStageReport,
  type DestinationSource,
  type FlightCardModel,
  type FranceCity,
  type GroundOfferModel,
  type HotelCardModel,
  type OfficialArticleModel,
  type OfficialFlightItineraryEntry,
  type TourismProgramDay,
  type TrendHit,
  countArabicWords,
} from "@/lib/swarm/article-pipeline-types";
import { crawlFranceTrends, readFranceTrendsCache, writeFranceTrendsCache } from "@/lib/swarm/trends-browser-crawl";

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.6-flash"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function isoIn(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function emptyStages(): ArticlePipelineStageReport[] {
  return ARTICLE_PIPELINE_STAGE_DEFS.map((stage) => ({
    id: stage.id,
    label: stage.label,
    tool: stage.tool,
    status: "pending",
    outcome: "waiting",
  }));
}

function emit(sessionId: string, report: ArticlePipelineClient, stage: ArticlePipelineStageReport): void {
  const index = report.stages.findIndex((row) => row.id === stage.id);
  if (index >= 0) report.stages[index] = stage;
  broadcastArticleStage(sessionId, stage, {
    articleId: report.articleId,
    slug: report.slug,
    published: report.published,
    destinationLabel: report.destinationLabel,
  });
}

function setStage(
  sessionId: string,
  report: ArticlePipelineClient,
  id: string,
  patch: Partial<ArticlePipelineStageReport>
): void {
  const current = report.stages.find((row) => row.id === id);
  if (!current) return;
  emit(sessionId, report, { ...current, ...patch });
}

async function loadFranceTrendRows(): Promise<{ hits: TrendHit[]; note: string; error: string | null }> {
  const cached = await readFranceTrendsCache();
  if (cached) {
    return { hits: cached.hits, note: `redis 127.0.0.1:6380 24h ${cached.note}`, error: null };
  }
  const crawled = await crawlFranceTrends();
  if (crawled.hits.length) {
    try {
      await writeFranceTrendsCache(crawled.hits, crawled.note);
    } catch (error) {
      crawled.note = `${crawled.note} | redis cache write failed: ${messageOf(error)}`;
    }
  }
  return crawled;
}

function flightCard(itinerary: PublicFlightItinerary, origin: string, city: FranceCity): FlightCardModel | null {
  const leg = itinerary.legs[0];
  const segment = leg?.segments?.[0];
  const price = itinerary.price?.client;
  if (!price || price <= 0) return null;
  const destinationCode = leg?.destination?.displayCode || leg?.destination?.skyId || "";
  const blob = `${destinationCode} ${leg?.destination?.city || ""} ${leg?.destination?.name || ""}`.toLowerCase();
  if (findTurkeyLeak(blob)) return null;
  if (!blob.includes(city.iata.toLowerCase()) && !blob.includes(city.name.toLowerCase())) return null;
  return {
    origin: `${leg?.origin?.city || origin} (${leg?.origin?.displayCode || origin})`,
    destination: `${leg?.destination?.city || city.name} (${destinationCode || city.iata})`,
    airline: segment?.airline || leg?.carrierName || itinerary.airlines?.[0] || "",
    flightNumber: segment?.flightNumber || "",
    aircraft: segment?.aircraft || "",
    departure: segment?.departure || leg?.departure || "",
    arrival: segment?.arrival || leg?.arrival || "",
    duration: `${leg?.durationMinutes || itinerary.durationMinutes} min`,
    stops: String(leg?.stopCount ?? itinerary.stops),
    price: String(price),
    currency: itinerary.price?.currency || "USD",
    baggage: typeof itinerary.baggageAllowance === "string" ? itinerary.baggageAllowance : "",
  };
}

function flightItineraryEntry(
  itinerary: PublicFlightItinerary,
  origin: string,
  city: FranceCity
): OfficialFlightItineraryEntry | null {
  if (!flightCard(itinerary, origin, city)) return null;
  return { cityIata: city.iata, cityName: city.name, originCode: origin, itinerary };
}

async function collectFlights(cities: FranceCity[]): Promise<{
  cards: FlightCardModel[];
  itineraries: OfficialFlightItineraryEntry[];
}> {
  const registry = await getProvidersRegistry();
  const providers = registry.providers;
  const live = Boolean(providers.travelport_flights?.enabled || providers.seeru?.enabled || providers.pkfare?.enabled || providers.biletbank?.enabled);
  if (!live) {
    throw new Error("provider_travelpayouts: no live flight supplier enabled (travelport_flights, seeru, pkfare, biletbank)");
  }
  const date = isoIn(45);
  const errors: string[] = [];
  const cards: FlightCardModel[] = [];
  const itineraries: OfficialFlightItineraryEntry[] = [];
  for (const city of cities) {
    const batch = await Promise.all(
      ["RUH", "DXB", "JFK"].map(async (origin) => {
        try {
          const result = await withTimeout(
            runFlightSearch({
              originSkyId: origin,
              destinationSkyId: city.iata,
              originEntityId: origin,
              destinationEntityId: city.iata,
              date,
              adults: 1,
              currency: "USD",
              market: origin === "JFK" ? "US" : "SA",
            }),
            45000,
            `runFlightSearch ${origin}-${city.iata}`
          );
          if (!result.ok) return [`${origin}-${city.iata}: ${result.errorCode}`];
          const matchedEntries = result.session.itineraries
            .map((item) => flightItineraryEntry(item, origin, city))
            .filter((item): item is OfficialFlightItineraryEntry => Boolean(item))
            .slice(0, 3);
          const matched = matchedEntries.map((entry) => flightCard(entry.itinerary, origin, city)!);
          if (!matched.length) return [`${origin}-${city.iata}: no ${city.name} itinerary`];
          cards.push(...matched);
          itineraries.push(...matchedEntries);
          return [];
        } catch (error) {
          return [messageOf(error)];
        }
      })
    );
    errors.push(...batch.flat());
  }
  if (!cards.length) throw new Error(errors.join(" | ") || "runFlightSearch returned no itineraries");
  return { cards, itineraries };
}

function hotelSupplierCode(city: FranceCity): string {
  return franceHotelSupplierKey(city.name)?.iata || city.iata;
}

function hotelCard(hotel: TravelAdvisorHotelCard, city: FranceCity): HotelCardModel | null {
  const blob = `${hotel.name} ${hotel.city} ${hotel.country} ${hotel.address}`.toLowerCase();
  if (findTurkeyLeak(blob)) return null;
  const code = hotelSupplierCode(city).toLowerCase();
  if (!blob.includes(city.name.toLowerCase()) && !blob.includes(code) && !blob.includes(city.iata.toLowerCase())) return null;
  if (!hotel.image || !hotel.name || !hotel.priceFrom || hotel.priceFrom <= 0) return null;
  return {
    city: city.name,
    name: hotel.name,
    image: hotel.image,
    rating: hotel.rating ? String(hotel.rating) : "",
    roomType: hotel.roomType || "",
    bedType: hotel.bedType || "",
    price: String(hotel.priceFrom),
    currency: hotel.currency || "USD",
  };
}

/** Same request the public /hotels page sends to GET /api/hotels/search. */
function storefrontHotelSearchParams(cityName: string, sid?: string): URLSearchParams {
  const dates = defaultHotelDates();
  const params = new URLSearchParams({
    q: cityName,
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    adults: "2",
    children: "0",
    rooms: "1",
    lang: "en",
    page: "0",
    pageSize: "8",
  });
  if (sid) params.set("sid", sid);
  return params;
}

async function searchHotelsLikeStorefront(cityName: string, sid?: string): Promise<PublicHotelSearchResult> {
  const params = storefrontHotelSearchParams(cityName, sid);
  const stay = stayFromSearchParams(params);
  const query = stay.query || cityName;
  const hotelsRuntime = await getHotelsRuntime();
  const geoId = runtimeHasProvider(hotelsRuntime, "travel_advisor")
    ? await resolvePlaceGeoId({ geoId: stay.geoId, query })
    : "";
  const roomQty = Number(params.get("rooms") || stay.rooms?.length || 1);
  const pageSizeParam = Number(params.get("pageSize") || 0);
  return runPublicHotelSearch({
    query,
    destId: stay.destId,
    geoId,
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: stay.adults,
    rooms: Number.isFinite(roomQty) && roomQty > 0 ? Math.floor(roomQty) : 1,
    childrenAges: params.get("childrenAges") || "",
    lang: params.get("lang") || "en",
    page: 0,
    pageSize: Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.floor(pageSizeParam) : undefined,
    sid: sid || undefined,
    stayRooms: stay.rooms,
    hotelName: stay.hotelName,
    hotelKey: stay.hotelKey,
    onlySuppliers: ["hotelbeds"],
  });
}

function hotelSearchMiss(cityName: string, result: PublicHotelSearchResult): string {
  const supplierError = result.progress?.stats
    ?.map((row) => `${row.supplier}:${row.error || row.count}`)
    .join(", ");
  const detail = [result.error, supplierError].filter(Boolean).join("; ");
  return `${cityName}: /api/hotels/search returned no cards${detail ? ` (${detail})` : ""}`;
}

async function collectHotels(cities: FranceCity[]): Promise<{ cards: HotelCardModel[]; error?: string }> {
  const registry = await getProvidersRegistry();
  const providers = registry.providers;
  if (!providers.hotelbeds?.enabled) {
    return { cards: [], error: "hotelbeds is not enabled; Ratehawk, Travelport, and disabled providers were not called" };
  }
  const cards: HotelCardModel[] = [];
  const errors: string[] = [];
  for (const city of cities) {
    try {
      let result = await withTimeout(
        searchHotelsLikeStorefront(city.name),
        50000,
        `GET /api/hotels/search q=${city.name}`
      );
      const deadline = Date.now() + 40000;
      while (result.sid && result.progress && !result.progress.complete && Date.now() < deadline) {
        const ready = result.hotels.some((hotel) => hotelCard(hotel, city));
        if (ready) break;
        await sleep(2000);
        result = await searchHotelsLikeStorefront(city.name, result.sid);
      }
      const matched = result.hotels
        .map((hotel) => hotelCard(hotel, city))
        .filter((hotel): hotel is HotelCardModel => Boolean(hotel))
        .slice(0, 6);
      if (!matched.length) throw new Error(hotelSearchMiss(city.name, result));
      cards.push(...matched);
    } catch (error) {
      errors.push(messageOf(error));
    }
  }
  if (cities.some((city) => !cards.some((card) => card.city === city.name))) {
    return { cards, error: errors.join(" | ") || "GET /api/hotels/search missed a destination" };
  }
  return { cards };
}

function landmarkMatches(city: FranceCity, caption: string | undefined): boolean {
  const text = (caption || "").toLowerCase();
  if (!text) return true;
  if (findTurkeyLeak(text) || /\bitaly\b|\bspain\b|\blondon\b/.test(text)) return false;
  const cityHit = text.includes(city.name.toLowerCase()) || city.aliases.some((alias) => alias.length > 3 && text.includes(alias.toLowerCase()));
  return cityHit || text.includes("france");
}

async function collectImages(cities: FranceCity[]): Promise<Record<string, Array<{ url: string; alt: string }>>> {
  const images: Record<string, Array<{ url: string; alt: string }>> = {};
  const errors: string[] = [];
  for (const city of cities) {
    const query = `${city.name} France landmark`;
    const alt = `${city.name}, France`;
    try {
      const unsplash = await searchUnsplash({ query, page: 1, perPage: 8 });
      const photos = unsplash.items
        .filter((item) => (item.fullUrl || item.previewUrl) && landmarkMatches(city, item.caption))
        .slice(0, 4)
        .map((item) => ({ url: item.fullUrl || item.previewUrl, alt }));
      if (photos.length) {
        images[city.iata] = photos;
        continue;
      }
      throw new Error(`searchUnsplash returned no ${city.name} landmark`);
    } catch (unsplashError) {
      try {
        const pexels = await searchPexels({ query, page: 1, perPage: 8 });
        const photos = pexels.items
          .filter((item) => (item.fullUrl || item.previewUrl) && landmarkMatches(city, item.caption))
          .slice(0, 4)
          .map((item) => ({ url: item.fullUrl || item.previewUrl, alt }));
        if (!photos.length) throw new Error(`${messageOf(unsplashError)}; searchPexels returned no ${city.name} landmark`);
        images[city.iata] = photos;
      } catch (error) {
        errors.push(messageOf(error));
      }
    }
  }
  if (cities.some((city) => !images[city.iata]?.length)) throw new Error(errors.join(" | ") || "image search failed");
  return images;
}

async function collectGround(cities: FranceCity[]): Promise<{ offers: GroundOfferModel[]; error?: string }> {
  const registry = await getProvidersRegistry();
  if (!registry.providers.seeru?.enabled) {
    return { offers: [], error: "Seeru ride supplier is not enabled" };
  }
  const adapter = new SeeruRideAdapter();
  const offers: GroundOfferModel[] = [];
  const errors: string[] = [];
  const date = isoIn(21);
  for (const city of cities) {
    const locations = await adapter.searchLocations(city.name, "FR", "en");
    if (!locations.length) {
      errors.push(`name search returned no place for ${city.name}`);
      continue;
    }
    let transfer: Awaited<ReturnType<SeeruRideAdapter["searchRides"]>>;
    let hourly: Awaited<ReturnType<SeeruRideAdapter["searchRides"]>>;
    try {
      transfer = await adapter.searchRides({
        fromPlaceId: locations[0].place_id,
        toPlaceId: locations[1]?.place_id,
        date,
        time: "10:00",
        mode: "transfer",
        pax: 2,
        currency: "USD",
      });
      hourly = await adapter.searchRides({
        fromPlaceId: locations[0].place_id,
        date,
        time: "10:00",
        mode: "hourly",
        hours: 4,
        pax: 2,
        currency: "USD",
      });
    } catch (error) {
      errors.push(`SeeruRideAdapter.searchRides ${city.name}: ${messageOf(error)}`);
      continue;
    }
    const transferOffers = transfer.offers.filter((offer) => offer.price > 0 && offer.offer_id);
    const carOffers = hourly.offers.filter((offer) => offer.price > 0 && offer.offer_id);
    if (!transferOffers.length) errors.push(`SeeruRideAdapter.searchRides mode=transfer returned no priced offer for ${city.name}`);
    if (!carOffers.length) errors.push(`SeeruRideAdapter.searchRides mode=hourly returned no priced offer for ${city.name}`);
    for (const offer of transferOffers.slice(0, 2)) {
      offers.push({
        city: city.name,
        mode: "transfer",
        title: offer.car_class?.title || "",
        price: String(offer.price),
        currency: transfer.currency || "USD",
        supplier: offer.supplier || "Seeru",
      });
    }
    for (const offer of carOffers.slice(0, 2)) {
      offers.push({
        city: city.name,
        mode: "car",
        title: offer.car_class?.title || "",
        price: String(offer.price),
        currency: hourly.currency || "USD",
        supplier: offer.supplier || "Seeru",
      });
    }
  }
  if (
    cities.some((city) => !offers.some((offer) => offer.city === city.name && offer.mode === "transfer")) ||
    cities.some((city) => !offers.some((offer) => offer.city === city.name && offer.mode === "car"))
  ) {
    return { offers, error: errors.join(" | ") || "Seeru transfer or car rental search failed" };
  }
  return { offers };
}

type CityProseSection = {
  name: string;
  distinctionAr: string;
  activities: string[];
  programDays: TourismProgramDay[];
};

function cityProseWords(city: CityProseSection): number {
  return countArabicWords(
    [city.distinctionAr, ...city.activities, ...city.programDays.map((d) => `${d.titleAr} ${d.bodyAr}`)].join(" ")
  );
}

async function expandCityProse(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  city: CityProseSection,
  modelId: string
): Promise<CityProseSection> {
  const expandPrompt = `Expand this French destination section to at least 420 Arabic words total (distinctionAr + activities + programDays). Keep city name "${city.name}". JSON only, same keys.
${JSON.stringify({ distinctionAr: city.distinctionAr, activities: city.activities, programDays: city.programDays }).slice(0, 9000)}
Schema: {"distinctionAr":"","activities":[""],"programDays":[{"day":1,"titleAr":"","bodyAr":""}]}`;
  const result = await withTimeout(model.generateContent(expandPrompt), 90000, `gemini expand ${modelId} ${city.name}`);
  const text = result.response.text();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`${modelId} expand did not return JSON`);
  const parsed = JSON.parse(match[0]) as {
    distinctionAr?: string;
    activities?: string[];
    programDays?: Array<{ day?: number; titleAr?: string; bodyAr?: string }>;
  };
  return {
    name: city.name,
    distinctionAr: String(parsed.distinctionAr || city.distinctionAr),
    activities: (parsed.activities || city.activities).map(String).filter(Boolean),
    programDays: (parsed.programDays || city.programDays)
      .map((day, index) => ({
        day: Number(day.day) > 0 ? Number(day.day) : index + 1,
        titleAr: String(day.titleAr || ""),
        bodyAr: String(day.bodyAr || ""),
      }))
      .filter((day) => day.titleAr && day.bodyAr),
  };
}

async function writeProse(directive: string, facts: unknown): Promise<{
  titleAr: string;
  titleEn: string;
  introAr: string;
  cities: Array<{
    name: string;
    distinctionAr: string;
    activities: string[];
    programDays: TourismProgramDay[];
  }>;
  faq: Array<{ q: string; a: string }>;
}> {
  const primary = await resolveGeminiApiKey();
  const free = await resolveGeminiFreeApiKey();
  const apiKey = primary.apiKey || free.apiKey;
  if (!apiKey) throw new Error("Gemini API key is not configured");
  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `Write JSON only: Arabic SEO travel article for Gulf and US travelers about cities in facts.
Per city: rich distinctionAr (~250 Arabic words), 6-10 activities, programDays with 4-5 days (titleAr + bodyAr ~80-120 words each). Mention flight/hotel/transfer prices ONLY if present in facts — no filler on cars/transfers when absent.
introAr ~120 words, faq 5-7 items. No data-source or supplier names. No invented hotels/prices. No Turkey/Istanbul/Trabzon/guide-turkey. No cities outside facts.
Directive: ${directive}
Facts: ${JSON.stringify(facts).slice(0, 14000)}
Schema: {"titleAr":"","titleEn":"","introAr":"","cities":[{"name":"","distinctionAr":"","activities":[""],"programDays":[{"day":1,"titleAr":"","bodyAr":""}]}],"faq":[{"q":"","a":""}]}`;
  const failures: string[] = [];
  for (const modelId of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await withTimeout(model.generateContent(prompt), 90000, `gemini ${modelId}`);
      const text = result.response.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`${modelId} did not return JSON`);
      const parsed = JSON.parse(match[0]) as {
        titleAr?: string;
        titleEn?: string;
        introAr?: string;
        cities?: Array<{
          name?: string;
          distinctionAr?: string;
          activities?: string[];
          programDays?: Array<{ day?: number; titleAr?: string; bodyAr?: string }>;
        }>;
        faq?: Array<{ q?: string; a?: string }>;
      };
      const leak = findTurkeyLeak(JSON.stringify(parsed));
      if (leak) throw new Error(`gemini text contained ${leak}`);
      if (!parsed.titleAr || !parsed.introAr || !parsed.cities?.length || !parsed.faq?.length) {
        throw new Error(`${modelId} JSON missed title, intro, cities, or faq`);
      }
      let cities: CityProseSection[] = parsed.cities.map((city) => ({
        name: String(city.name || ""),
        distinctionAr: String(city.distinctionAr || ""),
        activities: (city.activities || []).map(String).filter(Boolean),
        programDays: (city.programDays || [])
          .map((day, index) => ({
            day: Number(day.day) > 0 ? Number(day.day) : index + 1,
            titleAr: String(day.titleAr || ""),
            bodyAr: String(day.bodyAr || ""),
          }))
          .filter((day) => day.titleAr && day.bodyAr),
      }));
      for (let index = 0; index < cities.length; index++) {
        if (cityProseWords(cities[index]) < 360) {
          cities[index] = await expandCityProse(model, cities[index], modelId);
        }
      }
      for (const city of cities) {
        const words = cityProseWords(city);
        if (words < 360) throw new Error(`${modelId} ${city.name || "city"} prose ${words} words (need 360+)`);
        if (city.programDays.length < 3) throw new Error(`${modelId} ${city.name || "city"} programDays too short`);
        if (city.activities.length < 4) throw new Error(`${modelId} ${city.name || "city"} activities too few`);
      }
      return {
        titleAr: parsed.titleAr,
        titleEn: parsed.titleEn || parsed.titleAr,
        introAr: parsed.introAr,
        cities,
        faq: parsed.faq.filter((row) => row.q && row.a).map((row) => ({ q: String(row.q), a: String(row.a) })),
      };
    } catch (error) {
      failures.push(`${modelId}: ${messageOf(error)}`);
    }
  }
  throw new Error(failures.join(" | ") || "gemini.generateContent returned no text");
}

async function syncBlogCopies(): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const adminFile = path.join(process.cwd(), ".data/blog-posts.json");
  const raw = await fs.readFile(adminFile, "utf8");
  for (const relative of ["../storefront/.data/blog-posts.json", "../database/data/blog-posts.json"]) {
    const target = path.resolve(process.cwd(), relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, raw, "utf8");
  }
}

function blockRemaining(sessionId: string, report: ArticlePipelineClient, fromId: string, reason: string): void {
  let started = false;
  for (const stage of report.stages) {
    if (stage.id === fromId) started = true;
    if (!started || stage.status === "failed" || stage.status === "completed") continue;
    if (stage.id === fromId) continue;
    setStage(sessionId, report, stage.id, {
      status: "failed",
      outcome: `not called: ${reason}`,
      error: reason,
    });
  }
}

export async function runOfficialArticlePipeline(input: {
  directive: string;
  sessionId: string;
}): Promise<ArticlePipelineClient> {
  const checkpoint = await loadThreadCheckpoint(input.sessionId);
  const peek = peekDestination(input.directive);
  const destinationKey =
    peek?.key === "france"
      ? "france"
      : !peek && checkpoint?.destinationKey === "france"
        ? "france"
        : null;
  const report: ArticlePipelineClient = {
    ok: false,
    published: false,
    articleId: checkpoint?.articleId || "",
    slug: checkpoint?.slug || "",
    destinationKey: destinationKey || peek?.key || "unresolved",
    destinationLabel: destinationKey === "france" ? "France" : peek?.labelEn || "unresolved",
    stages: emptyStages(),
  };
  if (!destinationKey) {
    const reason =
      peek?.key === "turkey"
        ? "directive names Turkey; guide-turkey-2027 will not be opened or published"
        : peek
          ? `destination ${peek.labelEn} is not France; refused to substitute Turkey`
          : "destination unresolved; refused to default to Turkey";
    report.blockedReason = reason;
    for (const stage of report.stages) {
      setStage(input.sessionId, report, stage.id, { status: "failed", outcome: reason, error: reason });
    }
    return report;
  }

  const identity = await reserveArticleIdentity({
    threadId: input.sessionId,
    directive: input.directive,
    destinationKey,
  });
  report.articleId = identity.articleId;
  report.slug = identity.slug;

  let cities: FranceCity[] = [];
  let trends: TrendHit[] = [];
  let destinationSource: DestinationSource = "editorial-fallback";
  const started = Date.now();
  setStage(input.sessionId, report, "trends", {
    status: "active",
    tool: TRENDS_BROWSER_TOOL,
    outcome: `calling ${TRENDS_BROWSER_TOOL}`,
  });
  try {
    const research = await loadFranceTrendRows();
    const plan = planFranceDestinations({
      hits: research.hits,
      crawlError: research.hits.length ? null : research.error,
    });
    cities = plan.cities;
    trends = plan.source === "trends" ? plan.trends : [];
    destinationSource = plan.source;
    const outcome = [plan.outcome, research.note].filter(Boolean).join(" | ");
    setStage(input.sessionId, report, "trends", {
      status: plan.trendsStatus,
      tool: TRENDS_BROWSER_TOOL,
      outcome,
      error: plan.error,
      durationMs: Date.now() - started,
    });
    report.destinationLabel = "France";
  } catch (error) {
    const reason = messageOf(error);
    const plan = planFranceDestinations({ hits: [], crawlError: reason });
    cities = plan.cities;
    trends = [];
    destinationSource = "editorial-fallback";
    report.destinationLabel = "France";
    setStage(input.sessionId, report, "trends", {
      status: "failed",
      tool: TRENDS_BROWSER_TOOL,
      outcome: reason,
      error: reason,
      durationMs: Date.now() - started,
    });
  }

  let flights: FlightCardModel[] = [];
  let flightItineraries: OfficialFlightItineraryEntry[] = [];
  let hotels: HotelCardModel[] = [];
  let images: Record<string, Array<{ url: string; alt: string }>> = {};
  let ground: GroundOfferModel[] = [];
  let hotelNote = "";
  let groundNote = "";
  const hardErrors: string[] = [];

  for (const job of [
    {
      id: "flights",
      run: async () => {
        const inventory = await collectFlights(cities);
        flights = inventory.cards;
        flightItineraries = inventory.itineraries;
        return `${flights.length} itineraries via runFlightSearch`;
      },
    },
    {
      id: "hotels",
      run: async () => {
        const result = await collectHotels(cities);
        hotels = result.cards;
        if (result.error) throw new Error(result.error);
        return `${hotels.length} hotels via runPublicHotelSearch`;
      },
    },
    {
      id: "images",
      run: async () => {
        images = await collectImages(cities);
        return `${Object.keys(images).length} photos via searchUnsplash/searchPexels`;
      },
    },
    {
      id: "ground",
      run: async () => {
        const result = await collectGround(cities);
        ground = result.offers;
        if (result.error) throw new Error(result.error);
        return `${ground.length} priced ground offers`;
      },
    },
  ]) {
    const started = Date.now();
    setStage(input.sessionId, report, job.id, { status: "active", outcome: `calling ${report.stages.find((stage) => stage.id === job.id)?.tool}` });
    try {
      const outcome = await job.run();
      setStage(input.sessionId, report, job.id, { status: "completed", outcome, durationMs: Date.now() - started });
    } catch (error) {
      const reason = messageOf(error);
      if (job.id === "hotels") hotelNote = reason;
      else if (job.id === "ground") groundNote = reason;
      else hardErrors.push(reason);
      setStage(input.sessionId, report, job.id, { status: "failed", outcome: reason, error: reason, durationMs: Date.now() - started });
    }
  }

  if (hardErrors.length) {
    const reason = hardErrors.join(" | ");
    report.blockedReason = reason;
    blockRemaining(input.sessionId, report, "ground", reason);
    return report;
  }

  try {
    const started = Date.now();
    setStage(input.sessionId, report, "prose", { status: "active", outcome: "calling gemini.generateContent" });
    const prose = await writeProse(input.directive, {
      cities: cities.map((city) => city.name),
      flights: flights.slice(0, 12).map((flight) => ({
        origin: flight.origin,
        destination: flight.destination,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        price: flight.price,
        currency: flight.currency,
      })),
      hotels: hotels.slice(0, 12).map((hotel) => ({
        name: hotel.name,
        city: hotel.city,
        rating: hotel.rating,
        roomType: hotel.roomType,
        bedType: hotel.bedType,
        price: hotel.price,
        currency: hotel.currency,
      })),
      ground: ground.slice(0, 12).map((offer) => ({
        city: offer.city,
        mode: offer.mode,
        title: offer.title,
        price: offer.price,
        currency: offer.currency,
      })),
    });
    for (const city of cities) {
      const section = prose.cities.find((row) => row.name.toLowerCase().includes(city.name.toLowerCase()));
      if (!section?.distinctionAr || section.activities.length < 4 || section.programDays.length < 3) {
        throw new Error(`gemini did not cover ${city.name}`);
      }
    }
    const model: OfficialArticleModel = {
      titleAr: prose.titleAr,
      titleEn: prose.titleEn,
      introAr: prose.introAr,
      destinationSource,
      cities: cities.map((city) => {
        const section = prose.cities.find((row) => row.name.toLowerCase().includes(city.name.toLowerCase()))!;
        const gallery = images[city.iata];
        return {
          name: city.name,
          nameAr: city.nameAr,
          iata: city.iata,
          distinctionAr: section.distinctionAr,
          activities: section.activities,
          programDays: section.programDays,
          imageUrl: gallery[0].url,
          imageAlt: gallery[0].alt,
          gallery,
        };
      }),
      trends,
      flights,
      flightItineraries,
      hotels,
      ground,
      hotelNote,
      groundNote,
      faq: prose.faq,
    };
    setStage(input.sessionId, report, "prose", { status: "completed", outcome: prose.titleAr, durationMs: Date.now() - started });

    const html = sanitizePublicArticle(renderOfficialArticle(model));
    setStage(input.sessionId, report, "template", { status: "completed", outcome: "official template rendered", tool: "renderOfficialArticle" });
    const qualityError = assertOfficialArticle(html, model);
    if (qualityError) throw new Error(qualityError);
    setStage(input.sessionId, report, "quality", { status: "completed", outcome: "destination check passed", tool: "assertDestinationQuality" });

    const post = await upsertBlogPost({
      id: identity.articleId,
      slug: identity.slug,
      titleAr: model.titleAr,
      titleEn: model.titleEn,
      excerptAr: model.introAr.slice(0, 180),
      excerptEn: model.titleEn,
      contentAr: html,
      contentEn: "",
      coverImage: model.cities[0]?.imageUrl || "",
      coverAlt: model.cities[0]?.imageAlt || model.titleAr,
      category: "tourism",
      tags: cities.map((city) => city.name),
      author: "لوناليزا",
      status: "published",
      publishedAt: new Date().toISOString(),
      seo: {
        metaTitleAr: model.titleAr,
        metaTitleEn: model.titleEn,
        metaDescriptionAr: model.introAr.slice(0, 180),
        metaDescriptionEn: model.titleEn,
        focusKeyword: cities[0]?.nameAr || "فرنسا",
        ogImage: model.cities[0]?.imageUrl || "",
      },
    });
    await syncBlogCopies();
    report.slug = post.slug;
    report.directUrl = `/blog/${encodeURIComponent(post.slug)}`;
    report.titleAr = model.titleAr;
    report.published = true;
    report.ok = true;
    setStage(input.sessionId, report, "publish", {
      status: "completed",
      outcome: `upsertBlogPost ${post.id} ${post.slug}`,
      tool: "upsertBlogPost",
    });
    await saveThreadCheckpoint({
      ...identity,
      slug: post.slug,
      updatedAt: new Date().toISOString(),
      taskType: "article",
      plan: "research, enabled inventory, images, writing, template assembly, quality gate",
      recordId: post.id,
      toolResults: report.stages.map((stage) => ({
        tool: stage.tool,
        ok: stage.status === "completed",
        summary: stage.error || stage.outcome,
        at: new Date().toISOString(),
      })),
    });
    return report;
  } catch (error) {
    const reason = messageOf(error);
    report.blockedReason = reason;
    report.published = false;
    report.ok = false;
    for (const id of ["prose", "template", "quality", "publish"]) {
      const stage = report.stages.find((row) => row.id === id);
      if (stage && stage.status !== "completed") {
        setStage(input.sessionId, report, id, { status: "failed", outcome: reason, error: reason });
      }
    }
    return report;
  }
}
