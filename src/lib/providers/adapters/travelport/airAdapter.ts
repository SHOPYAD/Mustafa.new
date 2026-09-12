import {
  getTravelportContext,
  obtainTravelportToken,
  travelportRequest,
} from "./httpClient";
import {
  BAGGAGE_UNKNOWN,
  deriveFareLabel,
  parseBaggageText,
  type AirOffer,
  type AirOfferLeg,
  type AirOfferSegment,
  type BaggageAllowanceState,
  type FareAttributeState,
  type FareBaggage,
  type FareOption,
  type FarePenalty,
} from "../common/types";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  directOnly?: boolean;
}

export type TravelportFlightOffer = AirOffer;

/**
 * Token that identifies one bookable Travelport fare (one product per leg) inside a cached Search response.
 * Serialised as JSON into FareOption.supplierToken; consumed by AirPrice / Workbench build requests.
 */
export interface TravelportFareToken {
  catalogId: string;
  selections: Array<{ offeringId: string; productRef: string }>;
}

export function parseTravelportFareToken(token: string): TravelportFareToken | null {
  try {
    const parsed = JSON.parse(token) as TravelportFareToken;
    if (!parsed || !parsed.catalogId || !Array.isArray(parsed.selections) || !parsed.selections.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseIsoDurationMinutes(iso?: string): number {
  if (!iso) return 0;
  const m = String(iso).match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  const hours = Number(m[1] || 0);
  const mins = Number(m[2] || 0);
  return hours * 60 + mins;
}

function asArray<T = any>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [];
  return [value as T];
}

function inclusionToState(inclusion: unknown): FareAttributeState {
  const v = String(inclusion || "").replace(/\s+/g, "").toLowerCase();
  if (v === "included") return "included";
  if (v === "chargeable") return "chargeable";
  if (v === "notoffered") return "not_available";
  return "unknown";
}

/* ------------------------------------------------------------------ */
/* Terms & conditions → baggage / penalties                            */
/* ------------------------------------------------------------------ */

function measurementKg(item: any): number | undefined {
  for (const m of asArray<any>(item?.Measurement)) {
    const unit = String(m?.unit || "").toLowerCase();
    const value = Number(m?.value);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (unit.startsWith("kilo") || unit === "kg") return value;
    if (unit.startsWith("pound") || unit === "lb") return Math.round(value * 0.453592);
  }
  return undefined;
}

/** BaggageAllowance entries (FirstCheckedBag / CarryOn) of a T&C set that apply to `productRef`. */
function baggageFromTerms(terms: any, productRef: string): { checked?: BaggageAllowanceState; cabin?: BaggageAllowanceState } {
  const out: { checked?: BaggageAllowanceState; cabin?: BaggageAllowanceState } = {};
  for (const ba of asArray<any>(terms?.BaggageAllowance)) {
    const refs = asArray<string>(ba?.ProductRef);
    if (refs.length && productRef && !refs.includes(productRef)) continue;
    const type = String(ba?.baggageType || "");
    const target: "checked" | "cabin" | null = type === "FirstCheckedBag" ? "checked" : type === "CarryOn" ? "cabin" : null;
    if (!target) continue; // SecondCheckedBag / AdditionalBags / BaggageEmbargo are not "the included allowance"
    const items = asArray<any>(ba?.BaggageItem);
    let state: BaggageAllowanceState | undefined;
    for (const it of items) {
      const included = String(it?.includedInOfferPrice || "").toLowerCase();
      const qty = it?.quantity != null ? Number(it.quantity) : undefined;
      const kg = measurementKg(it);
      const text = String(it?.Text || "").trim();
      if (included === "no") {
        state = { status: "none", text: text || "Available for a fee" };
        break;
      }
      if (included === "yes" || (qty != null && qty > 0) || kg) {
        if (qty === 0) {
          state = { status: "none", text: text || undefined };
        } else {
          state = { status: "included", pieces: qty && qty > 0 ? qty : undefined, kg, text: text || undefined };
        }
        break;
      }
      if (text) {
        const parsed = parseBaggageText(text.replace(/^(\d)P$/i, "$1 pc"));
        if (parsed.status !== "unknown") {
          state = parsed;
          break;
        }
      }
    }
    if (state) out[target] = out[target] && out[target]!.status === "included" ? out[target] : state;
  }
  return out;
}

function penaltiesFromTerms(terms: any): { penalties: FarePenalty[]; refundable: FareAttributeState; changeable: FareAttributeState } {
  const penalties: FarePenalty[] = [];
  let refundable: FareAttributeState = "unknown";
  let changeable: FareAttributeState = "unknown";
  for (const group of asArray<any>(terms?.Penalties)) {
    const walk = (entries: any[], kind: "change" | "cancel") => {
      for (const entry of entries) {
        const t = String(entry?.["@type"] || "");
        const types = asArray<string>(entry?.penaltyTypes);
        const window = types.length ? types.join(", ") : undefined;
        const isNoShow = types.some((x) => /noshow/i.test(x));
        if (/NotPermitted/i.test(t)) {
          if (kind === "cancel" && !isNoShow) refundable = "not_available";
          if (kind === "change") changeable = "not_available";
          penalties.push({ type: isNoShow ? "no_show" : kind, window, text: "Not permitted" });
          continue;
        }
        const pens = asArray<any>(entry?.Penalty);
        let anyAmount = false;
        for (const p of pens) {
          const amount = p?.Amount?.value != null ? Number(p.Amount.value) : undefined;
          const currency = p?.Amount?.code || p?.Amount?.CurrencyCode?.value || undefined;
          const percent = p?.Percent != null ? Number(p.Percent) : undefined;
          anyAmount = true;
          penalties.push({ type: isNoShow ? "no_show" : kind, amount, currency, percent, window });
          if (kind === "cancel" && !isNoShow) {
            refundable = percent === 100 ? (refundable === "included" ? refundable : "not_available") : amount === 0 || percent === 0 ? "included" : "chargeable";
          }
          if (kind === "change") {
            changeable = amount === 0 || percent === 0 ? "included" : "chargeable";
          }
        }
        if (!anyAmount) {
          penalties.push({ type: isNoShow ? "no_show" : kind, window });
          if (kind === "cancel" && !isNoShow && refundable === "unknown") refundable = "chargeable";
          if (kind === "change" && changeable === "unknown") changeable = "chargeable";
        }
      }
    };
    walk(asArray<any>(group?.Change), "change");
    walk(asArray<any>(group?.Cancel), "cancel");
  }
  return { penalties, refundable, changeable };
}

/* ------------------------------------------------------------------ */
/* Response indexing                                                   */
/* ------------------------------------------------------------------ */

type Indexed = {
  catalogId: string;
  flights: Map<string, any>;
  brands: Map<string, any>;
  terms: Map<string, any>;
  products: Map<string, any>;
};

function indexResponse(resp: any): Indexed {
  const idx: Indexed = {
    catalogId: String(resp?.CatalogProductOfferings?.Identifier?.value || ""),
    flights: new Map(),
    brands: new Map(),
    terms: new Map(),
    products: new Map(),
  };
  for (const refItem of asArray<any>(resp?.ReferenceList)) {
    for (const f of asArray<any>(refItem?.Flight)) if (f?.id) idx.flights.set(String(f.id), f);
    for (const b of asArray<any>(refItem?.Brand)) if (b?.id) idx.brands.set(String(b.id), b);
    for (const t of asArray<any>(refItem?.TermsAndConditions)) if (t?.id) idx.terms.set(String(t.id), t);
    for (const p of asArray<any>(refItem?.Product)) if (p?.id) idx.products.set(String(p.id), p);
  }
  return idx;
}

type Pbo = {
  offeringId: string;
  sequence: number;
  flightRefs: string[];
  productRef: string;
  brandRef: string;
  termsRef: string;
  combinability: string[];
  price: { total: number; base: number; taxes: number; currency: string } | null;
  raw: any;
};

function priceOf(obj: any): { total: number; base: number; taxes: number; currency: string } | null {
  if (!obj) return null;
  const total = Number(obj.TotalPrice ?? obj.Amount?.Total ?? 0);
  if (!(total > 0)) return null;
  const base = Number(obj.Base ?? obj.Amount?.Base ?? total);
  const taxes = Number(obj.TotalTaxes ?? obj.Amount?.Taxes?.TotalTaxes ?? Math.max(0, total - base));
  const currency = String(obj.CurrencyCode?.value || obj.CurrencyCode || obj.Amount?.CurrencyCode?.value || "USD");
  return { total, base, taxes, currency };
}

function collectPbos(offerings: any[]): Pbo[] {
  const out: Pbo[] = [];
  for (const off of offerings) {
    const offeringId = String(off?.id || off?.Identifier?.value || "");
    const sequence = Number(off?.sequence || 1);
    for (const group of asArray<any>(off?.ProductBrandOptions)) {
      const flightRefs = asArray<string>(group?.flightRefs).map(String);
      for (const item of asArray<any>(group?.ProductBrandOffering)) {
        out.push({
          offeringId,
          sequence,
          flightRefs,
          productRef: String(asArray<any>(item?.Product)[0]?.productRef || ""),
          brandRef: String(item?.Brand?.BrandRef || item?.Brand?.id || ""),
          termsRef: String(item?.TermsAndConditions?.termsAndConditionsRef || item?.TermsAndConditions?.id || ""),
          combinability: asArray<string>(item?.CombinabilityCode).map(String),
          price: priceOf(item?.BestCombinablePrice) || priceOf(item?.Price) || priceOf(off?.Price),
          raw: item,
        });
      }
    }
  }
  return out;
}

function segmentsFor(flightRefs: string[], idx: Indexed, cabin: string, fallbackDate: string): AirOfferSegment[] {
  return flightRefs
    .map((ref) => {
      const f = idx.flights.get(ref);
      if (!f) return null;
      const depDate = f.Departure?.date || fallbackDate;
      const depTime = f.Departure?.time || "00:00:00";
      const arrDate = f.Arrival?.date || depDate;
      const arrTime = f.Arrival?.time || "00:00:00";
      return {
        segmentId: String(f.id || ref),
        airlineCode: String(f.carrier || ""),
        flightNumber: String(f.number || ""),
        operatingCarrierCode: String(f.operatingCarrier || f.carrier || ""),
        operatingCarrierName: String(f.operatingCarrierName || ""),
        departureAirport: String(f.Departure?.location || ""),
        departureTerminal: String(f.Departure?.terminal || ""),
        departureTime: `${depDate}T${depTime}`,
        arrivalAirport: String(f.Arrival?.location || ""),
        arrivalTerminal: String(f.Arrival?.terminal || ""),
        arrivalTime: `${arrDate}T${arrTime}`,
        durationMinutes: parseIsoDurationMinutes(f.duration),
        aircraftCode: String(f.equipment || ""),
        cabinClass: cabin,
      } as AirOfferSegment;
    })
    .filter(Boolean) as AirOfferSegment[];
}

function legFrom(segments: AirOfferSegment[], fallbackDate: string, baggage?: AirOfferLeg["baggageAllowance"]): AirOfferLeg | null {
  if (!segments.length) return null;
  const first = segments[0];
  const last = segments[segments.length - 1];
  return {
    origin: first.departureAirport || "",
    destination: last.arrivalAirport || "",
    departureDate: first.departureTime || fallbackDate,
    arrivalDate: last.arrivalTime || fallbackDate,
    carrierCode: first.airlineCode,
    flightNumber: first.flightNumber,
    durationMinutes: segments.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
    stops: Math.max(0, segments.length - 1),
    segments,
    baggageAllowance: baggage,
  };
}

function productCabin(idx: Indexed, productRef: string, fallback: string): string {
  const p = idx.products.get(productRef);
  const fp = asArray<any>(asArray<any>(p?.PassengerFlight)[0]?.FlightProduct)[0];
  return String(fp?.cabin || fallback || "Economy");
}

function legacyBaggage(b: FareBaggage): AirOfferLeg["baggageAllowance"] {
  const c = b.checked;
  const cab = b.cabin;
  return {
    checkedBags: c.status === "included" ? c.pieces ?? (c.kg ? 1 : undefined) : c.status === "none" ? 0 : undefined,
    weightKg: c.status === "included" ? c.kg : undefined,
    cabinBags: cab.status === "included" ? cab.pieces ?? 1 : cab.status === "none" ? 0 : undefined,
    cabinDesc: cab.status === "included" ? cab.text || (cab.kg ? `${cab.kg} kg` : undefined) : undefined,
  };
}

/** Builds one FareOption from one product per leg (1 for one-way, 2 for round trip). */
function buildFareOption(parts: Pbo[], idx: Indexed, cabinFallback: string, isBest: boolean): FareOption | null {
  const price = parts[0]?.price;
  if (!price) return null;
  const brandNames: string[] = [];
  let brandCode: string | undefined;
  const attrs: Record<string, FareAttributeState> = {};
  let checked: BaggageAllowanceState | undefined;
  let cabinBag: BaggageAllowanceState | undefined;
  const penalties: FarePenalty[] = [];
  let refundable: FareAttributeState = "unknown";
  let changeable: FareAttributeState = "unknown";
  let rules: string[] = [];

  for (const part of parts) {
    const brand = idx.brands.get(part.brandRef);
    const name = String(brand?.name || "").trim();
    if (name && !brandNames.includes(name)) brandNames.push(name);
    if (!brandCode && brand?.code) brandCode = String(brand.code);
    for (const attr of asArray<any>(brand?.BrandAttribute)) {
      const cls = String(attr?.classification || "");
      const st = inclusionToState(attr?.inclusion);
      // Keep the most restrictive state across legs.
      const prev = attrs[cls];
      attrs[cls] = !prev ? st : prev === "not_available" || st === "not_available" ? "not_available" : prev === "chargeable" || st === "chargeable" ? "chargeable" : prev === "unknown" ? st : prev;
    }
    const terms = idx.terms.get(part.termsRef);
    const bag = baggageFromTerms(terms, part.productRef);
    if (bag.checked && (!checked || bag.checked.status === "none")) checked = bag.checked;
    if (bag.cabin && (!cabinBag || bag.cabin.status === "none")) cabinBag = bag.cabin;
    const pen = penaltiesFromTerms(terms);
    penalties.push(...pen.penalties);
    const worst = (a: FareAttributeState, b: FareAttributeState): FareAttributeState =>
      a === "not_available" || b === "not_available" ? "not_available" : a === "chargeable" || b === "chargeable" ? "chargeable" : a === "unknown" ? b : b === "unknown" ? a : "included";
    refundable = worst(refundable, pen.refundable);
    changeable = worst(changeable, pen.changeable);
    for (const txt of asArray<any>(terms?.Text)) if (typeof txt === "string" && txt.trim()) rules.push(txt.trim());
  }

  // Brand attributes complement the T&C data (and decide when T&C are silent).
  const attrChecked = attrs.CheckedBag;
  if (!checked && attrChecked) checked = attrChecked === "included" ? { status: "included" } : attrChecked === "not_available" || attrChecked === "chargeable" ? { status: "none", text: attrChecked === "chargeable" ? "Available for a fee" : undefined } : undefined;
  const attrCarry = attrs.CarryOn;
  if (!cabinBag && attrCarry) cabinBag = attrCarry === "included" ? { status: "included" } : attrCarry === "not_available" || attrCarry === "chargeable" ? { status: "none", text: attrCarry === "chargeable" ? "Available for a fee" : undefined } : undefined;
  if (refundable === "unknown" && attrs.Refund) refundable = attrs.Refund;
  if (changeable === "unknown" && attrs.Rebooking) changeable = attrs.Rebooking;

  const baggage: FareBaggage = { checked: checked || BAGGAGE_UNKNOWN, cabin: cabinBag || BAGGAGE_UNKNOWN };
  const partial = { refundable, changeable, baggage };
  const cabin = productCabin(idx, parts[0].productRef, cabinFallback);
  const token: TravelportFareToken = {
    catalogId: idx.catalogId,
    selections: parts.map((p) => ({ offeringId: p.offeringId, productRef: p.productRef })),
  };
  rules = Array.from(new Set(rules));
  return {
    id: `tp_${parts.map((p) => `${p.offeringId}.${p.productRef}`).join("+")}`,
    supplier: "travelport",
    brandName: brandNames.length ? brandNames.join(" / ") : deriveFareLabel(partial, "ar"),
    brandCode,
    nameSource: brandNames.length ? "supplier" : "derived",
    cabin,
    baggage,
    refundable,
    changeable,
    penalties,
    seatSelection: attrs.SeatAssignment || attrs.PremiumSeat || "unknown",
    meal: attrs.Meals || "unknown",
    priority: attrs.PriorityBoarding || "unknown",
    price,
    supplierToken: JSON.stringify(token),
    supplierContext: { catalogId: idx.catalogId },
    rulesText: rules.length ? rules.join("\n") : undefined,
    isBestPrice: isBest,
  };
}

export class TravelportAirAdapter {
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const ctx = await getTravelportContext("travelport_flights");
    if (!ctx.username && !ctx.clientId) {
      throw new Error("بيانات اعتماد ترافلبورت غير مدخلة (Username / Client ID)");
    }
    const token = await obtainTravelportToken(ctx, true);
    if (!token) throw new Error("تعذّر استلام رمز الوصول OAuth من سيرفر ترافلبورت");
    const latencyMs = Date.now() - started;
    return {
      ok: true,
      message: `تم مصادقة ترافلبورت OAuth بنجاح مقابل ${ctx.oauthUrl} (${latencyMs}ms)`,
      latencyMs,
    };
  }

  async searchFlights(params: FlightSearchParams): Promise<AirOffer[]> {
    const adults = Math.max(1, Number(params.adults || 1));
    const children = Math.max(0, Number(params.children || 0));
    const infants = Math.max(0, Number(params.infants || 0));

    const passengerCriteria: any[] = [];
    for (let i = 0; i < adults; i++) passengerCriteria.push({ value: "ADT", number: i + 1 });
    for (let i = 0; i < children; i++) passengerCriteria.push({ value: "CHD", number: adults + i + 1 });
    for (let i = 0; i < infants; i++) passengerCriteria.push({ value: "INF", number: adults + children + i + 1 });

    const resolveAirportCode = (code: string): string => {
      const c = (code || "").toUpperCase().trim();
      if (c === "ISTA") return "IST";
      if (c === "LON") return "LHR";
      if (c === "PAR") return "CDG";
      if (c === "NYC") return "JFK";
      return c.slice(0, 3);
    };

    const originIata = resolveAirportCode(params.origin);
    const destIata = resolveAirportCode(params.destination);

    const searchCriteria: any[] = [
      {
        "@type": "SearchCriteriaFlight",
        departureDate: params.departureDate,
        From: { value: originIata },
        To: { value: destIata },
      },
    ];

    if (params.returnDate) {
      searchCriteria.push({
        "@type": "SearchCriteriaFlight",
        departureDate: params.returnDate,
        From: { value: destIata },
        To: { value: originIata },
      });
    }

    const ctx = await getTravelportContext("travelport_flights");
    const cabinPref = String(params.cabinClass || "").toUpperCase();
    const cabinValue =
      cabinPref === "BUSINESS" ? "Business" : cabinPref === "FIRST" ? "First" : cabinPref === "PREMIUM_ECONOMY" ? "PremiumEconomy" : "";

    const requestBody = {
      CatalogProductOfferingsQueryRequest: {
        "@type": "CatalogProductOfferingsQueryRequest",
        CatalogProductOfferingsRequest: {
          "@type": "CatalogProductOfferingsRequestAir",
          maxNumberOfUpsellsToReturn: 4,
          offersPerPage: 100,
          contentSourceList: ["GDS"],
          PassengerCriteria: passengerCriteria,
          SearchCriteriaFlight: searchCriteria,
          ...(cabinValue
            ? { SearchModifiersAir: { "@type": "SearchModifiersAir", CabinPreference: [{ "@type": "CabinPreference", preferenceType: "Permitted", cabins: [cabinValue] }] } }
            : {}),
          PointOfSale: [
            {
              "@type": "PointOfSale",
              PseudoCityCode: ctx.targetBranch || "7K7L",
            },
          ],
        },
      },
    };

    const res = await travelportRequest<any>(
      "11/air/catalog/search/catalogproductofferings",
      {
        method: "POST",
        body: requestBody,
        providerId: "travelport_flights",
      }
    );

    if (!res.ok || !res.data) {
      return [];
    }

    const resp = res.data?.CatalogProductOfferingsResponse;
    const offerings = asArray<any>(resp?.CatalogProductOfferings?.CatalogProductOffering);
    const idx = indexResponse(resp);
    const pbos = collectPbos(offerings);
    const cabinFallback = params.cabinClass || "Economy";

    // key = flight refs of all legs → { legs, fare options }
    const itineraries = new Map<string, { legsRefs: string[][]; options: FareOption[] }>();
    const push = (parts: Pbo[]) => {
      const key = parts.map((p) => p.flightRefs.join(",")).join("|");
      const opt = buildFareOption(parts, idx, cabinFallback, false);
      if (!opt) return;
      const entry = itineraries.get(key) || { legsRefs: parts.map((p) => p.flightRefs), options: [] };
      if (!entry.options.some((o) => o.id === opt.id)) entry.options.push(opt);
      itineraries.set(key, entry);
    };

    if (!params.returnDate) {
      for (const pbo of pbos.filter((p) => p.sequence === 1)) push([pbo]);
    } else {
      const outbound = pbos.filter((p) => p.sequence === 1);
      const inbound = pbos.filter((p) => p.sequence === 2);
      const inboundByCode = new Map<string, Pbo[]>();
      for (const p of inbound) for (const code of p.combinability) {
        if (code === "j0") continue;
        const list = inboundByCode.get(code) || [];
        list.push(p);
        inboundByCode.set(code, list);
      }
      for (const out of outbound) {
        for (const code of out.combinability) {
          if (code === "j0") continue;
          for (const inn of inboundByCode.get(code) || []) push([out, inn]);
        }
      }
      // Journey-based responses (single offering containing both legs) fall back to one-way handling.
      if (!itineraries.size && !inbound.length) for (const pbo of outbound) push([pbo]);
    }

    const offers: AirOffer[] = [];
    for (const [key, entry] of itineraries) {
      const options = entry.options.sort((a, b) => a.price.total - b.price.total);
      options.forEach((o, i) => (o.isBestPrice = i === 0));
      const best = options[0];
      const legs: AirOfferLeg[] = [];
      entry.legsRefs.forEach((refs, li) => {
        const segs = segmentsFor(refs, idx, best.cabin, li === 0 ? params.departureDate : params.returnDate || params.departureDate);
        const leg = legFrom(segs, li === 0 ? params.departureDate : params.returnDate || params.departureDate, legacyBaggage(best.baggage));
        if (leg) legs.push(leg);
      });
      if (!legs.length) continue;
      offers.push({
        id: `tp_${idx.catalogId.slice(0, 8)}_${hashKey(key)}`,
        provider: "travelport",
        price: { total: best.price.total, base: best.price.base, taxes: best.price.taxes, currency: best.price.currency },
        legs,
        validatingCarrier: legs[0]?.carrierCode,
        refundable: best.refundable === "included" || best.refundable === "chargeable",
        refundableInfo: best.rulesText,
        modifiable: best.changeable === "included" || best.changeable === "chargeable",
        fareOptions: options,
        rawOfferData: { catalogId: idx.catalogId, key },
      });
    }

    return offers;
  }

  /**
   * AirPrice for a specific fare (reference payload): re-prices the exact products of the cached Search
   * response and returns the priced offer (TermsAndConditions incl. final baggage + penalties).
   */
  async priceFareOption(token: TravelportFareToken): Promise<{ ok: boolean; data?: any; error?: string }> {
    const res = await travelportRequest<any>("11/air/price/offers/buildfromcatalogproductofferings", {
      method: "POST",
      body: {
        OfferQueryBuildFromCatalogProductOfferings: {
          BuildFromCatalogProductOfferingsRequest: {
            "@type": "BuildFromCatalogProductOfferingsRequestAir",
            CatalogProductOfferingsIdentifier: { Identifier: { value: token.catalogId } },
            CatalogProductOfferingSelection: token.selections.map((s) => ({
              CatalogProductOfferingIdentifier: { Identifier: { value: s.offeringId } },
              ProductIdentifier: [{ Identifier: { value: s.productRef } }],
            })),
          },
        },
      },
      providerId: "travelport_flights",
    });
    if (!res.ok) return { ok: false, error: res.error || "travelport_price_failed" };
    return { ok: true, data: res.data };
  }

  /** @deprecated Accepts a serialized TravelportFareToken; legacy ids can no longer be priced. */
  async priceOffer(tokenOrId: string): Promise<any> {
    const token = parseTravelportFareToken(tokenOrId);
    if (!token) return null;
    const res = await this.priceFareOption(token);
    return res.ok ? res.data : null;
  }
}

function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
