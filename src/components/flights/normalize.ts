import type {
  AirportPick,
  CabinClass,
  CalendarDayPrice,
  EverywhereDeal,
  FareFamily,
  FarePolicy,
  FlightAmenity,
  FlightCarrier,
  FlightDetails,
  FlightLeg,
  FlightPlace,
  FlightSegment,
  Itinerary,
  SearchResponse,
} from "@/components/flights/types";
import { kiwiAirlineLogoUrl, resolveAirlineCode } from "@/lib/airline-logos";
import { formatMoney as formatMoneyAmount } from "@/lib/currency";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Extract a numeric fare/price from scalars or Sky/engine price objects. */
export function extractMoney(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const wrap = asRecord(value);
  if (Object.keys(wrap).length) {
    return asNumber(
      wrap.client ?? wrap.raw ?? wrap.amount ?? wrap.total ?? wrap.value ?? wrap.units,
      fallback
    );
  }
  return asNumber(value, fallback);
}

export function parseCabinClass(value: string | null | undefined): CabinClass {
  const raw = String(value || "").toLowerCase().replace(/\s+/g, "_");
  if (raw === "premium" || raw === "premium_economy" || raw === "premium-economy") {
    return "premium_economy";
  }
  if (raw === "business") return "business";
  if (raw === "first" || raw === "first_class") return "first";
  return "economy";
}

function pickLocale(locale: string): string {
  if (locale.startsWith("ar")) return "ar-SA";
  if (locale.startsWith("tr")) return "tr-TR";
  return "en-US";
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  return formatMoneyAmount(amount, currency || "USD", pickLocale(locale));
}

export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const m = iso.match(/T(\d{2}:\d{2})/);
    return m?.[1] || iso;
  }
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function unwrapData(json: unknown): Record<string, unknown> {
  const root = asRecord(json);
  const data = asRecord(root.data);
  return Object.keys(data).length ? data : root;
}

function carrierFrom(value: unknown): FlightCarrier {
  const row = asRecord(value);
  const code = resolveAirlineCode(asString(row.alternateId || row.displayCode || row.code || row.iata));
  const logoUrl = asString(row.logoUrl || row.logo) || kiwiAirlineLogoUrl(code);
  return {
    id: asString(row.id || row.alternateId || row.code || code),
    name: asString(row.name),
    code,
    logoUrl,
  };
}

function cityNameOf(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.replace(/\s*\([^)]+\)\s*$/, "").trim() || fallback;
  }
  const row = asRecord(value);
  return asString(row.name || row.localizedName || row.title || row.city, fallback);
}

function placeFrom(value: unknown): FlightPlace {
  const row = asRecord(value);
  const parent = asRecord(row.parent);
  const presentation = asRecord(row.presentation);
  const parentPresentation = asRecord(parent.presentation);
  const city = cityNameOf(
    row.city ||
      parent.city ||
      parentPresentation.title ||
      parent.name ||
      parent.localizedName ||
      row.localizedName
  );
  const airportName = asString(
    row.airportName ||
      row.airport ||
      presentation.title ||
      row.name ||
      row.localizedName ||
      parent.name ||
      city
  );
  const displayCode = asString(row.displayCode || row.skyId || row.iata || row.id);
  const name =
    airportName && airportName !== displayCode
      ? airportName
      : asString(row.name || row.localizedName || city || displayCode);
  return {
    displayCode,
    name,
    city: city || name,
    country: asString(row.country || parent.country || presentation.subtitle),
    terminal: asString(row.terminal || row.terminalName) || undefined,
    gate: asString(row.gate || row.gateName) || undefined,
  };
}

function amenitiesFrom(row: Record<string, unknown>): FlightAmenity[] {
  const raw = [
    ...asArray(row.amenities),
    ...asArray(row.amenitiesList),
    ...asArray(asRecord(row.legAmenities).amenities),
  ];
  const out: FlightAmenity[] = [];
  const add = (item: FlightAmenity) => {
    if (!out.includes(item)) out.push(item);
  };
  for (const item of raw) {
    const rec = asRecord(item);
    const s = String(
      typeof item === "string" ? item : rec.type || rec.name || rec.id || rec.code || ""
    ).toLowerCase();
    if (/wifi|wlan/.test(s)) add("wifi");
    else if (/power|outlet|usb|plug/.test(s)) add("power");
    else if (/meal|food|catering|snack/.test(s)) add("meal");
    else if (/entertain|ife|screen|video|movie/.test(s)) add("entertainment");
  }
  return out;
}

function aircraftFrom(row: Record<string, unknown>): string | undefined {
  const aircraft = asRecord(row.aircraft);
  const equipment = asRecord(row.equipment);
  const designator = asRecord(row.flightDesignator);
  const name = asString(
    row.aircraftType ||
      aircraft.name ||
      aircraft.code ||
      aircraft.model ||
      row.equipment ||
      equipment.name ||
      equipment.code ||
      designator.aircraft ||
      (typeof row.aircraft === "string" ? row.aircraft : "")
  );
  return name || undefined;
}

function withPlaceExtras(place: FlightPlace, row: Record<string, unknown>, end: "origin" | "destination"): FlightPlace {
  const terminal = asString(
    place.terminal ||
      (end === "origin"
        ? row.originTerminal || row.departureTerminal || asRecord(row.origin).terminal
        : row.destinationTerminal || row.arrivalTerminal || asRecord(row.destination).terminal)
  );
  const gate = asString(
    place.gate ||
      (end === "origin"
        ? row.originGate || row.departureGate || asRecord(row.origin).gate
        : row.destinationGate || row.arrivalGate || asRecord(row.destination).gate)
  );
  return {
    ...place,
    terminal: terminal || undefined,
    gate: gate || undefined,
  };
}

function segmentFrom(value: unknown): FlightSegment {
  const row = asRecord(value);
  const amenities = amenitiesFrom(row);
  const flightNumber =
    [
      asString(
        asRecord(row.marketingCarrier).alternateId ||
          asRecord(row.marketingCarrier).displayCode ||
          row.airlineCode
      ),
      asString(row.flightNumber || row.flightNo),
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || asString(row.flightNumber || row.flightNo);
  return {
    id: asString(row.id),
    origin: withPlaceExtras(placeFrom(row.origin), row, "origin"),
    destination: withPlaceExtras(placeFrom(row.destination), row, "destination"),
    departure: asString(row.departure),
    arrival: asString(row.arrival),
    durationInMinutes: asNumber(row.durationInMinutes ?? row.durationMinutes),
    flightNumber,
    flightNo: flightNumber,
    aircraft: aircraftFrom(row),
    amenities: amenities.length ? amenities : undefined,
    marketingCarrier: row.airline || row.airlineLogo || row.airlineCode
      ? (() => {
          const code = resolveAirlineCode(asString(row.airlineCode));
          return {
            id: code || asString(row.airlineCode),
            name: asString(row.airline),
            code,
            logoUrl: asString(row.airlineLogo) || kiwiAirlineLogoUrl(code),
          };
        })()
      : carrierFrom(row.marketingCarrier || row.carrier),
    operatingCarrier: row.operatingCarrier ? carrierFrom(row.operatingCarrier) : undefined,
  };
}

function layoversOf(segments: FlightSegment[], row: Record<string, unknown>) {
  const given = asArray(row.layovers || row.layover).map((item) => {
    const layover = asRecord(item);
    return {
      airport: asString(layover.airport || asRecord(layover.origin).displayCode),
      city: asString(layover.city || asRecord(layover.origin).city),
      durationInMinutes: asNumber(layover.durationInMinutes || layover.duration),
      selfTransfer: Boolean(layover.selfTransfer || layover.isSelfTransfer),
    };
  });
  if (given.length) return given;
  const out: FlightLeg["layovers"] = [];
  for (let i = 0; i < segments.length - 1; i += 1) {
    const a = new Date(segments[i].arrival).getTime();
    const b = new Date(segments[i + 1].departure).getTime();
    const mins = Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, Math.round((b - a) / 60000)) : 0;
    out.push({
      airport: segments[i].destination.displayCode,
      city: segments[i].destination.city,
      durationInMinutes: mins,
    });
  }
  return out;
}

function legFrom(value: unknown): FlightLeg {
  const row = asRecord(value);
  const carriersWrap = asRecord(row.carriers);
  const marketing = asArray(carriersWrap.marketing).map(carrierFrom).filter((c) => c.name || c.code);
  const segments = asArray(row.segments).map(segmentFrom);
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  if (!marketing.length && firstSeg) marketing.push(firstSeg.marketingCarrier);
  return {
    id: asString(row.id),
    origin: placeFrom(row.origin) || firstSeg?.origin || placeFrom({}),
    destination: placeFrom(row.destination) || lastSeg?.destination || placeFrom({}),
    departure: asString(row.departure || firstSeg?.departure),
    arrival: asString(row.arrival || lastSeg?.arrival),
    durationInMinutes: asNumber(
      row.durationInMinutes ?? row.durationMinutes,
      segments.reduce((sum, s) => sum + s.durationInMinutes, 0)
    ),
    stopCount: asNumber(row.stopCount, Math.max(0, segments.length - 1)),
    timeDeltaInDays: asNumber(row.timeDeltaInDays),
    carriers: marketing,
    segments,
    layovers: layoversOf(segments, row),
  };
}

function farePolicyFrom(value: unknown): FarePolicy | undefined {
  const row = asRecord(value);
  if (!Object.keys(row).length) return undefined;
  return {
    isChangeAllowed: Boolean(row.isChangeAllowed),
    isPartiallyChangeable: Boolean(row.isPartiallyChangeable),
    isCancellationAllowed: Boolean(row.isCancellationAllowed),
    isPartiallyRefundable: Boolean(row.isPartiallyRefundable),
  };
}

function defaultFares(price: number, currency: string, cabin: CabinClass, policy?: FarePolicy): FareFamily[] {
  return [
    {
      id: "basic",
      name: "Basic",
      price,
      currency,
      cabinClass: cabin,
      baggage: "cabin",
      changeable: Boolean(policy?.isChangeAllowed || policy?.isPartiallyChangeable),
      refundable: false,
    },
    {
      id: "standard",
      name: "Standard",
      price: Math.round(price * 1.12),
      currency,
      cabinClass: cabin,
      baggage: "20kg",
      changeable: true,
      refundable: Boolean(policy?.isPartiallyRefundable),
    },
    {
      id: "flexible",
      name: "Flexible",
      price: Math.round(price * 1.28),
      currency,
      cabinClass: cabin,
      baggage: "23kg",
      changeable: true,
      refundable: Boolean(policy?.isCancellationAllowed || policy?.isPartiallyRefundable),
    },
  ];
}

function baggageLabelFrom(value: unknown): string {
  const row = asRecord(value);
  if (!Object.keys(row).length) return asString(value, "cabin");
  const checked = asString(row.checked || row.checkedBaggage || row.hold);
  const cabin = asString(row.cabin || row.cabinBaggage || row.carryOn);
  if (checked && cabin) return `${cabin} · ${checked}`;
  return checked || cabin || "cabin";
}

function faresFromPricingOptions(
  value: unknown,
  price: number,
  currency: string,
  cabin: CabinClass,
  policy?: FarePolicy
): FareFamily[] {
  const rows = asArray(value);
  if (!rows.length) return [];
  return rows
    .map((item, i) => {
      const row = asRecord(item);
      const agent = asRecord(row.agent);
      const farePrice = extractMoney(row.price ?? agent.price, 0);
      if (farePrice <= 0) return null;
      const items = asArray(row.items);
      const firstItem = asRecord(items[0]);
      const fare = asRecord(firstItem.fare);
      const baggage = asRecord(fare.baggage || row.baggage);
      return {
        id: asString(row.id || agent.id, `fare-${i}`),
        name: asString(fare.brandName || row.name || agent.name, `Fare ${i + 1}`),
        price: farePrice,
        currency: asString(asRecord(row.price).currency || agent.currency, currency),
        cabinClass: parseCabinClass(asString(fare.cabinClass || row.cabinClass, cabin)),
        baggage: baggageLabelFrom(baggage.checked || baggage.cabin ? baggage : row.baggage),
        changeable: Boolean(fare.isChangeAllowed ?? row.changeable ?? policy?.isChangeAllowed),
        refundable: Boolean(fare.isCancellationAllowed ?? row.refundable ?? policy?.isCancellationAllowed),
      } satisfies FareFamily;
    })
    .filter((item): item is FareFamily => Boolean(item));
}

function faresFrom(value: unknown, price: number, currency: string, cabin: CabinClass, policy?: FarePolicy): FareFamily[] {
  const pricingOptions = faresFromPricingOptions(value, price, currency, cabin, policy);
  if (pricingOptions.length) return pricingOptions;

  const rows = asArray(value);
  if (!rows.length) return price > 0 ? defaultFares(price, currency, cabin, policy) : [];
  const mapped = rows
    .map((item, i) => {
      const row = asRecord(item);
      const farePrice = extractMoney(row.price ?? row.totalPrice ?? row.amount, 0);
      if (farePrice <= 0) return null;
      const priceCurrency = asString(asRecord(row.price).currency || row.currency, currency);
      return {
        id: asString(row.id, `fare-${i}`),
        name: asString(row.name || row.brandName, `Fare ${i + 1}`),
        price: farePrice,
        currency: priceCurrency,
        cabinClass: parseCabinClass(asString(row.cabinClass || row.cabin, cabin)),
        baggage: baggageLabelFrom(row.baggage),
        changeable: Boolean(row.changeable ?? row.isChangeAllowed),
        refundable: Boolean(row.refundable ?? row.isCancellationAllowed),
      } satisfies FareFamily;
    })
    .filter((item): item is FareFamily => Boolean(item));
  if (mapped.length) return mapped;
  return price > 0 ? defaultFares(price, currency, cabin, policy) : [];
}

export function hasValidFarePrices(fares: FareFamily[]): boolean {
  return fares.some((fare) => fare.price > 0);
}

function tagFrom(value: unknown): Itinerary["tags"][number] | null {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("cheap")) return "cheapest";
  if (raw.includes("fast") || raw.includes("short")) return "fastest";
  if (raw.includes("best")) return "best";
  return null;
}

export function itineraryFrom(value: unknown, currency: string, cabin: CabinClass): Itinerary | null {
  const row = asRecord(value);
  const id = asString(row.id || row.itineraryId);
  const legs = asArray(row.legs).map(legFrom).filter((leg) => leg.departure || leg.segments.length);
  if (!id || !legs.length) return null;
  const priceWrap = asRecord(row.price);
  const price = extractMoney(row.price ?? priceWrap.client ?? priceWrap.raw ?? priceWrap.total ?? priceWrap.amount);
  const curr = asString(currency || priceWrap.currency || row.currency, currency || "USD");
  const policy = farePolicyFrom(row.farePolicy);
  const tags = [...asArray(row.tags), ...asArray(row.badges)]
    .map(tagFrom)
    .filter((tag): tag is Itinerary["tags"][number] => Boolean(tag));
  if (!legs[0]?.carriers.length && asArray(row.airlines).length) {
    legs[0].carriers = asArray(row.airlines).map((name) => ({
      id: asString(name),
      name: asString(name),
      code: "",
      logoUrl: legs[0]?.segments[0]?.marketingCarrier.logoUrl || "",
    }));
  }
  const serverFares = asArray(row.fareFamilies)
    .map((item, index) => {
      const fare = asRecord(item);
      const farePrice = extractMoney(fare.price, 0);
      if (farePrice <= 0) return null;
      return {
        id: asString(fare.id, `fare-${index}`),
        name: asString(fare.name, `Fare ${index + 1}`),
        price: farePrice,
        currency: asString(asRecord(fare.price).currency || curr, curr),
        cabinClass: parseCabinClass(cabin),
        baggage: baggageLabelFrom(fare.baggage),
        changeable: Boolean(fare.changeable),
        refundable: Boolean(fare.refundable),
      } satisfies FareFamily;
    })
    .filter((item): item is FareFamily => Boolean(item));
  const taxes = asNumber(priceWrap.taxes || priceWrap.fees || row.taxes) || undefined;
  const baseFare =
    asNumber(priceWrap.base || priceWrap.baseFare || row.baseFare) ||
    (taxes && price > taxes ? price - taxes : undefined);
  const fareFamilies =
    serverFares.length > 0
      ? serverFares
      : faresFrom(
          row.fareFamilies || row.fares || row.fareTiers || row.pricingOptions,
          price,
          curr,
          cabin,
          policy
        );
  const baggageWrap = asRecord(row.baggage || row.baggagePolicy);
  const cabinBaggage =
    asString(baggageWrap.cabin || baggageWrap.cabinBaggage || baggageWrap.carryOn) ||
    undefined;
  const checkedBaggage =
    asString(baggageWrap.checked || baggageWrap.checkedBaggage || baggageWrap.hold) ||
    fareFamilies.find((fare) => parseBaggageKg(fare.baggage) > 0)?.baggage ||
    undefined;
  const isRefundable = Boolean(
    policy?.isCancellationAllowed ||
      policy?.isPartiallyRefundable ||
      fareFamilies.some((fare) => fare.refundable)
  );
  return {
    id,
    price,
    currency: curr,
    formattedPrice: formatMoney(price, curr, "en"),
    baseFare: baseFare || undefined,
    taxes,
    legs,
    fareFamilies,
    farePolicy: policy,
    tags,
    isSelfTransfer: Boolean(row.isSelfTransfer),
    sessionLegsPayload:
      typeof row.sessionLegsPayload === "string"
        ? row.sessionLegsPayload
        : typeof row.legs === "string"
          ? row.legs
          : undefined,
    isRefundable,
    cabinBaggage,
    checkedBaggage,
    fareBrand: asString(row.fareBrand || fareFamilies[0]?.name) || undefined,
  };
}

export function normalizeSearch(json: unknown, currency: string, cabin: CabinClass): SearchResponse {
  const root = asRecord(json);
  const data = unwrapData(json);
  const context = asRecord(data.context || root.context);
  const itinerariesWrap = asRecord(data.itineraries || root.itineraries || asRecord(data.flights).itineraries);
  const list = asArray(
    data.itineraries ||
      root.itineraries ||
      asRecord(data.flights).itineraries ||
      itinerariesWrap.results ||
      itinerariesWrap.itineraries
  );
  return {
    itineraries: list
      .map((item) => itineraryFrom(item, asString(root.currency || data.currency, currency), cabin))
      .filter((item): item is Itinerary => Boolean(item)),
    sessionId: asString(context.sessionId || root.sessionId || data.sessionId),
    status: asString(context.status || root.status || data.status, "complete").toLowerCase(),
    currency: asString(root.currency || data.currency, currency),
  };
}

export function mergeItineraries(current: Itinerary[], incoming: Itinerary[]): Itinerary[] {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) map.set(item.id, item);
  return Array.from(map.values());
}

export function normalizeAirports(json: unknown): AirportPick[] {
  const root = asRecord(json);
  const data = asArray(root.data || root.airports || asRecord(root.data).airports || asRecord(root.data).current);
  const nearby = asArray(asRecord(root.data).nearby || asRecord(asRecord(root.data).current).nearby);
  const list = data.length ? data : nearby;
  const out: AirportPick[] = [];
  for (const item of list) {
    const row = asRecord(item);
    const presentation = asRecord(row.presentation);
    const navigation = asRecord(row.navigation);
    const params = asRecord(navigation.relevantFlightParams);
    const skyId = asString(row.skyId || params.skyId || row.iata);
    const entityId = asString(row.entityId || params.entityId || navigation.entityId || skyId);
    if (!skyId) continue;
    const title = asString(presentation.title || row.name || params.localizedName || skyId);
    const entityType = asString(
      navigation.entityType || params.flightPlaceType || row.entityType || row.type
    ).toUpperCase();
    const subtitle = asString(row.country || presentation.subtitle);
    const suggestion = asString(presentation.suggestionTitle || row.city);
    out.push({
      skyId,
      entityId,
      iata: asString(row.iata || params.skyId || skyId).slice(0, 4),
      name: title,
      city: suggestion.replace(/\s*\([^)]+\)\s*$/, "").trim() || title,
      country: subtitle,
      kind: entityType.includes("CITY") ? "city" : "airport",
    });
  }
  return out;
}

export function normalizeNearby(json: unknown): AirportPick | null {
  const root = asRecord(json);
  const data = asRecord(root.nearby || root.data);
  const current = asRecord(data.current);
  const first =
    normalizeAirports({ data: asArray(current.airports || current.nearby).length ? current.airports || current.nearby : data.current })[0] ||
    normalizeAirports(json)[0] ||
    null;
  if (first) return first;
  const skyId = asString(current.skyId || data.skyId);
  const entityId = asString(current.entityId || data.entityId);
  if (!skyId || !entityId) return null;
  return {
    skyId,
    entityId,
    iata: skyId.slice(0, 4),
    name: asString(current.name || data.name || skyId),
    city: asString(current.city || data.city || skyId),
    country: asString(current.country || data.country),
    kind: "airport",
  };
}

function calendarDateOf(value: unknown): string {
  if (typeof value === "string") {
    const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return iso?.[1] || "";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return "";
}

export function normalizeCalendar(json: unknown, currency: string): CalendarDayPrice[] {
  const root = asRecord(json);
  const data = unwrapData(json);
  const flights = asRecord(data.flights);
  const days = asArray(root.days || flights.days || data.days || data.prices || data);
  return days
    .map((item) => {
      const row = asRecord(item);
      const date = calendarDateOf(row.day || row.date || row.fromDate || row.departureDate);
      const price = extractMoney(row.price ?? row.minPrice ?? row.rawPrice);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || price <= 0) return null;
      const priceWrap = asRecord(row.price);
      return { date, price, currency: asString(priceWrap.currency || row.currency, currency) };
    })
    .filter((item): item is CalendarDayPrice => Boolean(item));
}

export function normalizeEverywhere(json: unknown, currency: string): EverywhereDeal[] {
  const data = unwrapData(json);
  const wrap = asRecord(data.everywhereDestination || data);
  const results = asArray(wrap.results || data.results || data.destinations || asRecord(json).destinations);
  return results
    .map((item) => {
      const row = asRecord(item);
      const content = asRecord(row.content);
      const location = asRecord(content.location || row.location);
      const quotes = asRecord(content.flightQuotes || row.flightQuotes);
      const cheapest = asRecord(quotes.cheapest || row.cheapest);
      const image = asRecord(content.image || row.image);
      const skyId = asString(location.skyCode || location.id || row.skyId);
      const name = asString(location.name || row.name);
      if (!skyId || !name) return null;
      const priceWrap = asRecord(row.price);
      const price = asNumber(priceWrap.client ?? cheapest.rawPrice ?? cheapest.price ?? row.price);
      return {
        id: asString(row.id, skyId),
        name,
        skyId,
        entityId: asString(location.entityId || row.entityId || location.id),
        iata: skyId.slice(0, 3),
        imageUrl: asString(image.url || row.imageUrl),
        price,
        currency: asString(cheapest.currency || row.currency, currency),
        formattedPrice: formatMoney(price, currency, "en"),
        direct: Boolean(cheapest.direct ?? asRecord(content.flightRoutes).directFlightsAvailable),
        windowLabel: asString(row.windowLabel || content.flightQuotes && "Anytime"),
      } satisfies EverywhereDeal;
    })
    .filter((item): item is EverywhereDeal => Boolean(item));
}

export function normalizeDetails(
  json: unknown,
  itineraryId: string,
  cabin: CabinClass,
  quotedPrice?: number
): FlightDetails {
  const root = asRecord(json);
  const data = unwrapData(json);
  const details = asRecord(data.details || root.details);
  const quoted = asRecord(data.price || root.price);
  const quotedClient = extractMoney(
    quoted.client ?? quotedPrice,
    quotedPrice && quotedPrice > 0 ? quotedPrice : 0
  );
  const currency = asString(quoted.currency || data.currency, "USD");
  const itinerary = itineraryFrom(
    data.itinerary || root.itinerary || details.itinerary || details,
    currency,
    cabin
  );
  if (itinerary && quotedClient > 0) {
    itinerary.price = quotedClient;
    itinerary.currency = currency;
    if (!itinerary.formattedPrice) {
      itinerary.formattedPrice = formatMoney(quotedClient, currency, "en");
    }
  }
  const baggage = asRecord(
    details.baggage ||
      details.baggagePolicy ||
      data.baggage ||
      data.baggagePolicy ||
      asRecord(details.itinerary).baggage
  );
  const cabinBag = asString(baggage.cabin || baggage.cabinBaggage || baggage.carryOn, "");
  const checked = asString(baggage.checked || baggage.checkedBaggage || baggage.hold, "");
  const policy = farePolicyFrom(
    data.farePolicy || asRecord(data.itinerary).farePolicy || details.farePolicy || asRecord(details.itinerary).farePolicy
  );
  let refundLabel = "non_refundable";
  if (policy?.isCancellationAllowed) refundLabel = "refundable_fee";
  else if (policy?.isPartiallyRefundable) refundLabel = "refundable_fee";
  let changeLabel = "";
  if (policy?.isChangeAllowed) changeLabel = "free_change";
  const fareRules = asString(
    details.fareRules ||
      details.rules ||
      details.fareRule ||
      data.fareRules ||
      asRecord(details.fare).rules ||
      asRecord(data.fare).rules
  );

  const basePrice = itinerary?.price || quotedClient;
  const fareSource =
    details.pricingOptions ||
    details.fareFamilies ||
    details.fares ||
    data.fareFamilies ||
    data.fares ||
    data.pricingOptions;
  let fareFamilies =
    itinerary?.fareFamilies && hasValidFarePrices(itinerary.fareFamilies)
      ? itinerary.fareFamilies
      : faresFrom(fareSource, basePrice, itinerary?.currency || currency, cabin, policy);
  if (!hasValidFarePrices(fareFamilies) && basePrice > 0) {
    fareFamilies = defaultFares(basePrice, itinerary?.currency || currency, cabin, policy);
  }

  return {
    itineraryId: asString(data.itineraryId || itinerary?.id || details.itineraryId, itineraryId),
    legs: itinerary?.legs?.length ? itinerary.legs : asArray(details.legs || data.legs).map(legFrom),
    cabinBaggage: cabinBag || "—",
    checkedBaggage: checked || "—",
    refundLabel,
    changeLabel,
    fareFamilies,
    price: itinerary?.price || quotedClient || undefined,
    currency: itinerary?.currency || currency,
    farePolicy: policy,
    fareRules: fareRules || undefined,
  };
}

export function legsPayload(itinerary: Itinerary): string {
  if (itinerary.sessionLegsPayload) return itinerary.sessionLegsPayload;
  const legIds = itinerary.legs
    .map((leg) => leg.id)
    .filter((id) => id && !id.startsWith("leg-"));
  if (legIds.length) return JSON.stringify(legIds);
  return JSON.stringify(
    itinerary.legs.map((leg) => ({
      origin: leg.origin.displayCode,
      destination: leg.destination.displayCode,
      date: leg.departure.slice(0, 10),
    }))
  );
}

export function applyRankTags(items: Itinerary[]): Itinerary[] {
  if (!items.length) return items;
  const byPrice = [...items].sort((a, b) => a.price - b.price);
  const byDuration = [...items].sort((a, b) => totalMinutes(a) - totalMinutes(b));
  const cheapestId = byPrice[0]?.id;
  const fastestId = byDuration[0]?.id;
  const scored = items.map((item) => ({
    id: item.id,
    score: item.price / Math.max(1, byPrice[0]?.price || 1) + totalMinutes(item) / Math.max(1, totalMinutes(byDuration[0]) || 1),
  }));
  scored.sort((a, b) => a.score - b.score);
  const bestId = scored[0]?.id;
  return items.map((item) => {
    const tags = new Set(item.tags);
    if (item.id === cheapestId) tags.add("cheapest");
    if (item.id === fastestId) tags.add("fastest");
    if (item.id === bestId) tags.add("best");
    return { ...item, tags: Array.from(tags) };
  });
}

export function totalMinutes(item: Itinerary): number {
  return item.legs.reduce((sum, leg) => sum + leg.durationInMinutes, 0);
}

export function hourOf(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return d.getHours() + d.getMinutes() / 60;
}

export function parseBaggageKg(value: string): number {
  const raw = String(value || "").toLowerCase();
  const match = raw.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (match) return Number(match[1]);
  if (/\b(\d{1,2})\s*(?:x|×)\s*(?:23|20|32)\b/.test(raw)) {
    const piece = raw.match(/\b(?:23|20|32)\b/);
    return piece ? Number(piece[0]) : 0;
  }
  return 0;
}

export function maxCheckedKg(item: Itinerary): number {
  let max = 0;
  for (const fare of item.fareFamilies) {
    max = Math.max(max, parseBaggageKg(fare.baggage));
  }
  return max;
}

export function hasIncludedBaggage(item: Itinerary): boolean {
  if (maxCheckedKg(item) > 0) return true;
  return item.fareFamilies.some((fare) => {
    const raw = String(fare.baggage || "").toLowerCase();
    if (!raw || raw === "cabin" || raw.includes("cabin only") || raw.includes("none")) return false;
    return raw.includes("included") || raw.includes("checked") || raw.includes("piece") || raw.includes("bag");
  });
}

export function isItineraryRefundable(item: Itinerary): boolean {
  if (item.isRefundable) return true;
  if (item.farePolicy?.isCancellationAllowed || item.farePolicy?.isPartiallyRefundable) return true;
  return item.fareFamilies.some((fare) => fare.refundable);
}

function snapshotPlace(place: FlightPlace): FlightPlace {
  return {
    displayCode: place.displayCode,
    name: place.name || place.city || place.displayCode,
    city: place.city || place.name || place.displayCode,
    country: place.country || "",
    terminal: place.terminal,
    gate: place.gate,
  };
}

function snapshotSegment(seg: FlightSegment): FlightSegment {
  const flightNumber = seg.flightNumber || seg.flightNo || "";
  return {
    ...seg,
    flightNumber,
    flightNo: seg.flightNo || flightNumber,
    aircraft: seg.aircraft,
    origin: snapshotPlace(seg.origin),
    destination: snapshotPlace(seg.destination),
    marketingCarrier: seg.marketingCarrier,
    operatingCarrier: seg.operatingCarrier,
  };
}

function snapshotLeg(leg: FlightLeg): FlightLeg {
  return {
    ...leg,
    origin: snapshotPlace(leg.origin),
    destination: snapshotPlace(leg.destination),
    segments: leg.segments.map(snapshotSegment),
    layovers: leg.layovers.map((layover) => ({
      airport: layover.airport,
      city: layover.city,
      durationInMinutes: layover.durationInMinutes,
      selfTransfer: layover.selfTransfer,
    })),
  };
}

/** Full itinerary snapshot for sessionStorage / book init so siblings can render invoices. */
export function bookingItinerarySnapshot(item: Itinerary, details?: FlightDetails | null): Itinerary {
  const legs = (details?.legs?.length ? details.legs : item.legs).map(snapshotLeg);
  const fareFamilies =
    details?.fareFamilies?.length && hasValidFarePrices(details.fareFamilies)
      ? details.fareFamilies
      : item.fareFamilies;
  const farePolicy = details?.farePolicy || item.farePolicy;
  const cabinBaggage =
    (details?.cabinBaggage && details.cabinBaggage !== "—" ? details.cabinBaggage : "") ||
    item.cabinBaggage;
  const checkedBaggage =
    (details?.checkedBaggage && details.checkedBaggage !== "—" ? details.checkedBaggage : "") ||
    item.checkedBaggage;
  const merged: Itinerary = {
    ...item,
    price: details?.price && details.price > 0 ? details.price : item.price,
    currency: details?.currency || item.currency,
    formattedPrice: formatMoney(
      details?.price && details.price > 0 ? details.price : item.price,
      details?.currency || item.currency,
      "en"
    ),
    legs,
    fareFamilies,
    farePolicy,
    isRefundable: isItineraryRefundable({
      ...item,
      fareFamilies,
      farePolicy,
      isRefundable: item.isRefundable,
    }),
    cabinBaggage,
    checkedBaggage,
    fareBrand: item.fareBrand || fareFamilies[0]?.name,
  };
  return merged;
}
