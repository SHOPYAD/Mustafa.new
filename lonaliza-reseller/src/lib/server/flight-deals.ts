import {
  ARAB_CAPITALS,
  TURKEY_FLIGHT_DESTS,
  type ArabCapital,
  type TurkeyFlightDest,
} from "@/data/arab-capital-routes";
import type {
  HomepageFlightDeal,
  HomepageFlightDealGroup,
  HomepageFlightDealsPayload,
} from "@/lib/flight-deals-types";
import {
  resolveFlightDealsSource,
  type FlightDealsSource,
} from "@/lib/flights-config";
import { getServerEnv } from "@/lib/server/env-store";
import { runEverywhereSearch, runPriceCalendar } from "@/lib/server/flights-engine";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import {
  readFlightDealsCache,
  writeFlightDealsCache,
} from "@/lib/server/flight-deals-cache";
import { isoDatePlusDays, buildFlightsPageHref } from "@/lib/travelpayouts-utils";

const CACHE_KEY = "homepage:v1";
const FETCH_TIMEOUT_MS = 25000;
const LIVE_ORIGINS = [
  {
    iata: "IST",
    skyId: "ISTA",
    entityId: "27542903",
    countryCode: "TR",
    ar: "إسطنبول",
    en: "Istanbul",
    tr: "İstanbul",
  },
  {
    iata: "RUH",
    skyId: "RUH",
    entityId: "",
    countryCode: "SA",
    ar: "الرياض",
    en: "Riyadh",
    tr: "Riyad",
  },
] as const;
const TP_FEATURED_ORIGINS = ARAB_CAPITALS.slice(0, 8);

const LIVE_CALENDAR_ROUTES = [
  { originIata: "RUH", destIata: "IST" },
  { originIata: "JED", destIata: "IST" },
  { originIata: "DXB", destIata: "IST" },
  { originIata: "DOH", destIata: "IST" },
  { originIata: "CAI", destIata: "IST" },
  { originIata: "RUH", destIata: "TZX" },
] as const;

const CITY_PHOTOS: Record<string, string> = {
  IST: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
  SAW: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
  TZX: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
  AYT: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200",
  ADB: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=1200",
  ESB: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=1200",
  DXB: "https://images.unsplash.com/photo-1512453979798-5ea7fdf1bed4?w=1200",
  AUH: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200",
  DOH: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1200",
  RUH: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200",
  JED: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200",
  CAI: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200",
  LON: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
  PAR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
  FRA: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200",
  ROM: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200",
  BCN: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200",
  MAD: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200",
  NYC: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
  AMM: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200",
  BEY: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
};

let refreshInFlight: Promise<HomepageFlightDealsPayload> | null = null;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function cityPhoto(iata: string, fallback = ""): string {
  const code = iata.toUpperCase().slice(0, 3);
  return CITY_PHOTOS[code] || fallback;
}

function airlineLogoUrl(iata: string): string {
  const code = iata.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,3}$/.test(code)) return "";
  return `https://images.kiwi.com/airlines/64/${code}.png`;
}

function capitalNames(origin: ArabCapital) {
  return {
    originNameAr: origin.nameAr,
    originNameEn: origin.nameEn,
    originNameTr: origin.nameTr,
  };
}

function destNames(dest: TurkeyFlightDest) {
  return {
    destNameAr: dest.nameAr,
    destNameEn: dest.nameEn,
    destNameTr: dest.nameTr,
  };
}

function capitalByIata(iata: string): ArabCapital | undefined {
  return ARAB_CAPITALS.find((item) => item.iata === iata);
}

function turkeyDestByIata(iata: string): TurkeyFlightDest | undefined {
  return TURKEY_FLIGHT_DESTS.find((item) => item.iata === iata);
}

async function liveCalendarDeals(): Promise<HomepageFlightDeal[]> {
  const fromDate = isoDatePlusDays(7);
  const settled = await Promise.all(
    LIVE_CALENDAR_ROUTES.map(async (route) => {
      const origin = capitalByIata(route.originIata);
      const dest = turkeyDestByIata(route.destIata);
      if (!origin || !dest) return null;
      const calendar = await runPriceCalendar({
        originSkyId: origin.iata,
        destinationSkyId: dest.iata,
        originEntityId: "",
        destinationEntityId: dest.iata === "IST" ? "95673323" : "",
        fromDate,
        currency: "USD",
      });
      if (!calendar.ok) return null;
      const cheapest = calendar.days
        .filter((day) => day.price.client > 0)
        .sort((a, b) => a.price.client - b.price.client)[0];
      if (!cheapest) return null;
      return {
        id: `live-cal-${origin.iata}-${dest.iata}`,
        originIata: origin.iata,
        ...capitalNames(origin),
        destIata: dest.iata,
        ...destNames(dest),
        destImage: dest.image,
        price: Math.round(cheapest.price.client),
        currency: cheapest.price.currency || "USD",
        href: liveHref({
          originIata: origin.iata,
          destIata: dest.iata,
          originSkyId: origin.iata,
          destSkyId: dest.iata,
        }),
      } satisfies HomepageFlightDeal;
    })
  );
  return settled.flatMap((row) => (row ? [row] : []));
}

function emptyPayload(source: FlightDealsSource): HomepageFlightDealsPayload {
  return {
    ok: true,
    source,
    cachedAt: null,
    stale: false,
    groups: [],
    deals: [],
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("flight-deals-timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function tpHref(originIata: string, destIata: string): string {
  return buildFlightsPageHref({
    fromIata: originIata,
    toIata: destIata,
    flightType: "one-way",
  });
}

function liveHref(deal: {
  originIata: string;
  destIata: string;
  originSkyId?: string;
  originEntityId?: string;
  destSkyId?: string;
  destEntityId?: string;
}): string {
  const params = new URLSearchParams();
  params.set("from", deal.originIata);
  params.set("to", deal.destIata);
  params.set("date", isoDatePlusDays(7));
  params.set("flightType", "one-way");
  params.set("tripType", "one-way");
  params.set("guests", "1");
  params.set("adults", "1");
  params.set("class", "economy");
  params.set("cabinClass", "economy");
  params.set("currency", "USD");
  if (deal.originSkyId) params.set("originSkyId", deal.originSkyId);
  if (deal.originEntityId) params.set("originEntityId", deal.originEntityId);
  if (deal.destSkyId) params.set("destinationSkyId", deal.destSkyId);
  if (deal.destEntityId) params.set("destinationEntityId", deal.destEntityId);
  params.set("originIata", deal.originIata);
  params.set("destinationIata", deal.destIata);
  return `/flights/search?${params.toString()}`;
}

async function travelpayoutsToken(): Promise<string> {
  return (
    (await getServerEnv("TRAVELPAYOUTS_TOKEN")).trim() ||
    (await getServerEnv("TRAVELPAYOUTS_API_TOKEN")).trim() ||
    process.env.TRAVELPAYOUTS_TOKEN?.trim() ||
    process.env.TRAVELPAYOUTS_API_TOKEN?.trim() ||
    ""
  );
}

async function fetchTpPrice(origin: string, dest: string, token: string): Promise<number | null> {
  try {
    const url = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", dest);
    url.searchParams.set("currency", "usd");
    url.searchParams.set("limit", "1");
    url.searchParams.set("sorting", "price");
    url.searchParams.set("one_way", "true");
    url.searchParams.set("token", token);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Array<{ price?: number }> };
    const price = Number(json.data?.[0]?.price);
    return Number.isFinite(price) && price > 0 ? Math.round(price) : null;
  } catch {
    return null;
  }
}

function staticTpDeal(origin: ArabCapital, dest: TurkeyFlightDest, price: number | null): HomepageFlightDeal {
  return {
    id: `tp-${origin.iata}-${dest.iata}`,
    originIata: origin.iata,
    ...capitalNames(origin),
    destIata: dest.iata,
    ...destNames(dest),
    destImage: dest.image,
    price,
    currency: "USD",
    href: tpHref(origin.iata, dest.iata),
  };
}

async function buildTravelpayoutsDeals(): Promise<HomepageFlightDealsPayload> {
  const token = await travelpayoutsToken();
  const groups: HomepageFlightDealGroup[] = [];

  for (const dest of TURKEY_FLIGHT_DESTS) {
    const priced = await Promise.all(
      TP_FEATURED_ORIGINS.map(async (origin) => {
        const price = token ? await fetchTpPrice(origin.iata, dest.iata, token) : null;
        return staticTpDeal(origin, dest, price);
      })
    );
    groups.push({
      destIata: dest.iata,
      destNameAr: dest.nameAr,
      destNameEn: dest.nameEn,
      destNameTr: dest.nameTr,
      destImage: dest.image,
      offers: priced,
    });
  }

  return {
    ok: true,
    source: "travelpayouts",
    cachedAt: new Date().toISOString(),
    stale: false,
    groups,
    deals: groups.flatMap((group) => group.offers),
  };
}

function pickAirline(rec: Record<string, unknown>): { iata: string; name: string } {
  const content = asRecord(rec.content);
  const quotes = asRecord(content.flightQuotes || rec.flightQuotes);
  const cheapest = asRecord(quotes.cheapest || rec.cheapest);
  const carriers = asArray(cheapest.carriers || rec.carriers || content.carriers);
  const firstCarrier = asRecord(carriers[0]);
  const iata = asString(
    rec.airline ||
      cheapest.airline ||
      firstCarrier.iata ||
      firstCarrier.code ||
      firstCarrier.altId ||
      rec.marketingCarrier
  )
    .toUpperCase()
    .slice(0, 3);
  const name = asString(
    rec.airlineName || cheapest.airlineName || firstCarrier.name || firstCarrier.marketingName
  );
  return { iata, name };
}

async function buildLiveDeals(): Promise<HomepageFlightDealsPayload> {
  const collected: HomepageFlightDeal[] = [];

  for (const origin of LIVE_ORIGINS) {
    const originIata = origin.iata;
    const result = await runEverywhereSearch({
      originSkyId: origin.skyId,
      originEntityId: origin.entityId,
      travelDate: isoDatePlusDays(21),
      currency: "USD",
      countryCode: origin.countryCode,
    });
    if (!result.ok) continue;

    const originLabel = { ar: origin.ar, en: origin.en, tr: origin.tr };

    for (const row of result.destinations) {
      const rec = asRecord(row);
      const content = asRecord(rec.content);
      const location = asRecord(content.location || rec.location);
      const image = asRecord(content.image || rec.image);
      const quotes = asRecord(content.flightQuotes || rec.flightQuotes);
      const cheapest = asRecord(quotes.cheapest || rec.cheapest);
      const priceWrap = asRecord(rec.price);
      const skyId = asString(location.skyCode || location.id || rec.skyId || rec.destinationSkyId);
      const name = asString(location.name || rec.name || skyId);
      const iata = asString(location.skyCode || rec.iata || skyId).toUpperCase().slice(0, 3);
      const price = asNumber(
        priceWrap.client ||
          cheapest.rawPrice ||
          cheapest.price ||
          priceWrap.base ||
          rec.price
      );
      if (!iata || !name || price <= 0) continue;
      if (iata === originIata) continue;

      const airline = pickAirline(rec);

      collected.push({
        id: `live-${originIata}-${iata}-${skyId || iata}`,
        originIata,
        originNameAr: originLabel.ar,
        originNameEn: originLabel.en,
        originNameTr: originLabel.tr,
        destIata: iata,
        destNameAr: name,
        destNameEn: name,
        destNameTr: name,
        destImage: asString(image.url || rec.imageUrl) || cityPhoto(iata),
        price: Math.round(price),
        currency: asString(priceWrap.currency, "USD") || "USD",
        href: liveHref({
          originIata,
          destIata: iata,
          originSkyId: originIata,
          destSkyId: skyId || iata,
          destEntityId: asString(location.entityId || rec.entityId),
        }),
        airlineIata: airline.iata || undefined,
        airlineName: airline.name || undefined,
        airlineLogo: airline.iata ? airlineLogoUrl(airline.iata) : undefined,
        direct: Boolean(rec.direct),
        originSkyId: originIata,
        destSkyId: skyId || iata,
        destEntityId: asString(location.entityId || rec.entityId),
      });
    }
  }

  if (collected.length < 6) {
    const extras = await liveCalendarDeals();
    collected.push(...extras);
  }

  const unique = new Map<string, HomepageFlightDeal>();
  for (const deal of collected.sort((a, b) => (a.price || 999999) - (b.price || 999999))) {
    const key = `${deal.originIata}-${deal.destIata}`;
    if (!unique.has(key)) unique.set(key, deal);
  }

  const deals = [...unique.values()].slice(0, 12);
  return {
    ok: true,
    source: "live",
    cachedAt: new Date().toISOString(),
    stale: false,
    groups: [],
    deals,
  };
}

async function buildDeals(source: FlightDealsSource): Promise<HomepageFlightDealsPayload> {
  switch (source) {
    case "travelpayouts":
      return buildTravelpayoutsDeals();
    case "live":
      return buildLiveDeals();
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

function hasDealRows(payload: HomepageFlightDealsPayload): boolean {
  return payload.deals.length > 0 || payload.groups.some((group) => group.offers.length > 0);
}

async function refreshAndStore(source: FlightDealsSource): Promise<HomepageFlightDealsPayload> {
  const fresh = await withTimeout(buildDeals(source), FETCH_TIMEOUT_MS);
  if (hasDealRows(fresh) || source === "travelpayouts") {
    await writeFlightDealsCache(CACHE_KEY, fresh);
  }
  return fresh;
}

export async function resolveActiveFlightDealsSource(): Promise<FlightDealsSource> {
  const runtime = await getFlightsRuntime();
  return resolveFlightDealsSource(runtime.providers, runtime.dealsSource);
}

export async function getHomepageFlightDeals(opts?: {
  force?: boolean;
}): Promise<HomepageFlightDealsPayload> {
  const source = await resolveActiveFlightDealsSource();
  const cached = await readFlightDealsCache<HomepageFlightDealsPayload>(CACHE_KEY, {
    allowExpired: true,
  });

  const usable =
    cached && cached.value.source === source
      ? cached
      : null;

  if (!opts?.force && usable?.fresh) {
    return { ...usable.value, stale: false, cachedAt: usable.value.cachedAt };
  }

  if (!opts?.force && usable) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAndStore(source)
        .catch(() => usable.value)
        .finally(() => {
          refreshInFlight = null;
        });
    }
    return { ...usable.value, stale: true };
  }

  try {
    if (!refreshInFlight) {
      refreshInFlight = refreshAndStore(source).finally(() => {
        refreshInFlight = null;
      });
    }
    return await refreshInFlight;
  } catch {
    if (usable) return { ...usable.value, stale: true };
    if (source === "travelpayouts") {
      const fallback: HomepageFlightDealsPayload = {
        ok: true,
        source: "travelpayouts",
        cachedAt: null,
        stale: true,
        groups: TURKEY_FLIGHT_DESTS.map((dest) => ({
          destIata: dest.iata,
          destNameAr: dest.nameAr,
          destNameEn: dest.nameEn,
          destNameTr: dest.nameTr,
          destImage: dest.image,
          offers: TP_FEATURED_ORIGINS.map((origin) => staticTpDeal(origin, dest, null)),
        })),
        deals: [],
      };
      fallback.deals = fallback.groups.flatMap((group) => group.offers);
      return fallback;
    }
    return emptyPayload(source);
  }
}
