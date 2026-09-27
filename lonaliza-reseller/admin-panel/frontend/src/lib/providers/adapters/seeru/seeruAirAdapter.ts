import { getAdapterCredentials } from "../common/credentials";
import {
  BAGGAGE_UNKNOWN,
  boolToAttribute,
  deriveFareLabel,
  parseBaggageText,
  type AirOffer,
  type AirOfferLeg,
  type AirOfferSegment,
  type BaggageAllowanceState,
  type FareBaggage,
  type FareOption,
} from "../common/types";
import { resolveAirportsForCode } from "@/lib/server/airports-db";

export interface SeeruSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  directOnly?: boolean;
  currency?: string;
  preferredCurrency?: string;
}

/** Server-only progressive poll state (Redis session). Never sent to the browser. */
export type SeeruSearchJob = {
  searchId: string;
  lastAfter?: number;
  complete: number;
  origin: string;
  dest: string;
  params: SeeruSearchParams;
  /** trip_id → raw variant rows accumulated so far. */
  trips: Record<string, unknown[]>;
};

export interface SeeruPassenger {
  type: "ADT" | "CHD" | "INF";
  title: "MR" | "MRS" | "MS" | "MASTER" | string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface SeeruBookingInput {
  offerId: string;
  providerFareKey?: string;
  passengers: SeeruPassenger[];
  contactEmail: string;
  contactPhone?: string;
  rawOfferData?: any;
}

/** Walks a Seeru order payload and returns the e-ticket numbers it actually contains (13-digit IATA numbers). */
export function extractSeeruTicketNumbers(payload: unknown): string[] {
  const out = new Set<string>();
  const visit = (node: unknown, depth: number) => {
    if (!node || depth > 6) return;
    if (Array.isArray(node)) {
      node.forEach((n) => visit(n, depth + 1));
      return;
    }
    if (typeof node !== "object") return;
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (/^(ticket_number|ticket_no|ticketNumber|eticket|e_ticket|number)$/i.test(key) && typeof value === "string") {
        const digits = value.replace(/[^\d]/g, "");
        if (/^\d{13,14}$/.test(digits)) out.add(digits);
      } else if (/^(tickets?|passengers|pax|travellers|travelers|segments|legs|items|data|order)$/i.test(key)) {
        visit(value, depth + 1);
      }
    }
  };
  visit(payload, 0);
  return [...out];
}

function tripsMapFromJob(job: SeeruSearchJob): Map<string, any[]> {
  const map = new Map<string, any[]>();
  for (const [tripId, rows] of Object.entries(job.trips || {})) {
    if (Array.isArray(rows) && rows.length) map.set(tripId, rows);
  }
  return map;
}

export interface SeeruCancelInput {
  reservationId: string;
  locator?: string;
  reason?: string;
}

function sanitizeBaggageDesc(raw?: string): string {
  const s = String(raw || "").trim();
  if (
    !s ||
    /^(nil|none|0|null|0kg|0\s*kg|0\s*pc|0\s*piece|0\s*bag|false|without)$/i.test(s) ||
    /no\s*(checked|baggage|bag)/i.test(s)
  ) {
    return "";
  }
  return s;
}

/**
 * Seeru `bags` → tri-state baggage. Shape: `{ ADT: { checked: { desc | allowance | weight }, cabin: {...} } }`
 * (sometimes an array, sometimes per-leg). Only what Seeru states is returned — no 23 kg / 7 kg guesses.
 */
export function extractSeeruBags(bagsObj: any): FareBaggage {
  const normalized = Array.isArray(bagsObj) ? bagsObj[0] : bagsObj;
  const adt = normalized?.ADT || normalized?.adult || normalized?.adt || normalized || {};
  const pick = (node: any): string => {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    return String(node.desc || node.allowance || node.weight || node.text || "").trim();
  };
  const checkedRaw = pick(adt?.checked);
  const cabinRaw = pick(adt?.cabin) || pick(adt?.carry_on);
  const checked: BaggageAllowanceState = checkedRaw ? parseBaggageText(checkedRaw) : BAGGAGE_UNKNOWN;
  const cabin: BaggageAllowanceState = cabinRaw ? parseBaggageText(cabinRaw) : BAGGAGE_UNKNOWN;
  return { checked, cabin };
}

/** Legacy numeric view of the checked allowance (for AirOfferLeg.baggageAllowance). */
function legacyBags(b: FareBaggage): { checkedBags?: number; weightKg?: number; cabinBags?: number; cabinDesc?: string } {
  const c = b.checked;
  const cab = b.cabin;
  return {
    checkedBags: c.status === "included" ? c.pieces ?? (c.kg ? 1 : undefined) : c.status === "none" ? 0 : undefined,
    weightKg: c.status === "included" && c.kg ? c.kg : undefined,
    cabinBags: cab.status === "included" ? cab.pieces ?? 1 : cab.status === "none" ? 0 : undefined,
    cabinDesc: cab.status === "included" ? cab.text || (cab.kg ? `${cab.kg} kg` : undefined) : undefined,
  };
}

function normalizeSeeruDateTime(raw?: string): string {
  const value = String(raw || "").trim();
  if (!value) return "";
  const m = value.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`;
  const d = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (d) return `${d[1]}-${d[2]}-${d[3]}T00:00:00`;
  return value;
}

function formatSegmentDate(rawDate?: string, rawTime?: string): string {
  if (!rawDate) return "";
  const time = rawTime || "00:00";
  return `${rawDate}T${time}`;
}

function toSeeruTripDate(rawDate?: string): string {
  const value = String(rawDate || "").trim();
  if (/^\d{8}$/.test(value)) return value;
  return value.replace(/-/g, "");
}

function toSeeruCabin(cabinClass?: string): "e" | "p" | "b" | "f" {
  const value = String(cabinClass || "").toUpperCase();
  if (value === "BUSINESS") return "b";
  if (value === "FIRST") return "f";
  if (value === "PREMIUM_ECONOMY") return "p";
  return "e";
}

function resolveSeeruQuoteCurrency(rowCurrency: unknown, input: SeeruSearchParams): string {
  const raw = String(rowCurrency || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (raw.length === 3) return raw;
  const requested = String(input.preferredCurrency || input.currency || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (requested.length === 3) return requested;
  return "USD";
}

export class SeeruAirAdapter {
  private async getContext() {
    const { fields, mode } = await getAdapterCredentials("seeru");
    const token = (fields.apiKey || fields.jwtToken || "").trim().replace(/^bearer\s+/i, "");
    if (!token) {
      throw new Error("مفتاح Seeru API Key مفقود — يرجى إدخاله في لوحة التحكم");
    }
    const defaultBase =
      mode === "production"
        ? "https://live-api.seeru.travel/v1/flights"
        : "https://sandbox-api.seeru.travel/v1/flights";
    const apiBaseUrl = (fields.endpoint && !fields.endpoint.includes("seeru.travel") ? fields.endpoint.trim() : defaultBase).replace(/\/+$/, "");
    return { token, apiBaseUrl, mode };
  }

  private async request<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
    const ctx = await this.getContext();
    const url = `${ctx.apiBaseUrl}/${path.replace(/^\/+/, "")}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${ctx.token}`,
      Accept: "application/json",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = json?.message || json?.error || raw.slice(0, 250);
      throw new Error(`Seeru ${path} HTTP ${res.status}: ${msg}`);
    }

    return json as T;
  }

  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const depDate = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const trip = `IST-DXB-${depDate}`;
    try {
      await this.request<{ search_id?: string }>(`search/${trip}/1/0/0?cabin=e&direct=0`);
    } catch (err: any) {
      const latencyMs = Date.now() - started;
      const errMsg = String(err?.message || "");
      if (errMsg.includes("Production Use not certified")) {
        return {
          ok: true,
          message: `المفاتيح معتمدة وصالحة والاتصال بخوادم Seeru ناجح (${latencyMs}ms) — تنبيه: حساب Seeru بانتظار تفعيل اعتماد الإنتاج (Production Use not certified) من إدارة سيرو`,
          latencyMs,
        };
      }
      if (errMsg.includes("401") || errMsg.includes("not allowed")) {
        throw new Error("رمز Seeru غير صالح أو منتهي الصلاحية أو غير مصرح له");
      }
      throw err;
    }
    const latencyMs = Date.now() - started;
    return {
      ok: true,
      message: `تم مصادقة Seeru API بنجاح (${latencyMs}ms)`,
      latencyMs,
    };
  }

  private buildTripsForPair(originIata: string, destIata: string, input: SeeruSearchParams): string {
    const outbound = `${originIata.toUpperCase()}-${destIata.toUpperCase()}-${toSeeruTripDate(input.departureDate)}`;
    if (!input.returnDate) return outbound;
    const inbound = `${destIata.toUpperCase()}-${originIata.toUpperCase()}-${toSeeruTripDate(input.returnDate)}`;
    return `${outbound}:${inbound}`;
  }

  /**
   * Polls `result/{searchId}` and accumulates rows on `job.trips`.
   * No product cap of 10: `maxRounds` is only a safety brake (default 80 ≈ 50s).
   */
  async pollSearchJob(job: SeeruSearchJob, opts: { maxRounds?: number } = {}): Promise<SeeruSearchJob> {
    const maxRounds = Math.max(1, opts.maxRounds ?? 80);
    let rounds = 0;
    while (job.complete < 100 && rounds < maxRounds) {
      const q = job.lastAfter ? `?after=${job.lastAfter}` : "";
      const result = await this.request<{
        complete?: number;
        last_result?: number;
        result?: any[];
      }>(`result/${encodeURIComponent(job.searchId)}${q}`);
      job.complete = Number(result?.complete || 0);
      job.lastAfter = Number(result?.last_result || job.lastAfter || 0) || undefined;
      for (const row of result?.result || []) {
        const tripId = String(row?.trip_id || row?.id || "");
        if (!tripId) continue;
        const bucket = Array.isArray(job.trips[tripId]) ? job.trips[tripId] : [];
        bucket.push(row);
        job.trips[tripId] = bucket;
      }
      rounds += 1;
      if (job.complete < 100) await new Promise((resolve) => setTimeout(resolve, 600));
    }
    return job;
  }

  async startAirportSearch(originIata: string, destIata: string, params: SeeruSearchParams): Promise<SeeruSearchJob | null> {
    const adults = Math.max(1, Number(params.adults || 1));
    const children = Math.max(0, Number(params.children || 0));
    const infants = Math.max(0, Number(params.infants || 0));
    const trips = this.buildTripsForPair(originIata, destIata, params);
    const qParams = new URLSearchParams();
    qParams.set("cabin", toSeeruCabin(params.cabinClass));
    qParams.set("direct", params.directOnly ? "1" : "0");
    const searchInit = await this.request<{ search_id?: string }>(
      `search/${encodeURIComponent(trips)}/${adults}/${children}/${infants}?${qParams.toString()}`
    );
    const searchId = String(searchInit?.search_id || "");
    if (!searchId) return null;
    return { searchId, complete: 0, origin: originIata, dest: destIata, params, trips: {} };
  }

  /** First page of results (fast paint). Remaining pages continue via `continueSearchJobs`. */
  async searchFlightsWave(params: SeeruSearchParams, firstWaveRounds = 4): Promise<{ offers: AirOffer[]; jobs: SeeruSearchJob[] }> {
    const { origins, dests } = await this.resolveSearchAirports(params);
    const started = await Promise.all(
      origins.flatMap((o) => dests.map((d) => this.startAirportSearch(o, d, params).catch(() => null)))
    );
    const jobs = started.filter((j): j is SeeruSearchJob => Boolean(j));
    await Promise.all(jobs.map((job) => this.pollSearchJob(job, { maxRounds: firstWaveRounds })));
    return { offers: jobs.flatMap((job) => this.offersFromJob(job)), jobs };
  }

  async continueSearchJobs(jobs: SeeruSearchJob[], maxRounds = 20): Promise<{ offers: AirOffer[]; jobs: SeeruSearchJob[] }> {
    const pending = jobs.filter((j) => j.complete < 100 && j.searchId);
    await Promise.all(pending.map((job) => this.pollSearchJob(job, { maxRounds })));
    return { offers: jobs.flatMap((job) => this.offersFromJob(job)), jobs };
  }

  private offersFromJob(job: SeeruSearchJob): AirOffer[] {
    return this.buildOffersFromTrips(tripsMapFromJob(job), job.searchId, job.params, job.origin, job.dest);
  }

  private async resolveSearchAirports(params: SeeruSearchParams): Promise<{ origins: string[]; dests: string[] }> {
    const rawOrigin = String(params.origin || "").trim().toUpperCase();
    const rawDest = String(params.destination || "").trim().toUpperCase();
    const originIatas = await resolveAirportsForCode(rawOrigin);
    const destIatas = await resolveAirportsForCode(rawDest);
    return {
      origins: originIatas.length > 0 ? originIatas.slice(0, 2) : [rawOrigin.slice(0, 3) || "IST"],
      dests: destIatas.length > 0 ? destIatas.slice(0, 2) : [rawDest.slice(0, 3) || "DXB"],
    };
  }

  private async searchAirportPair(
    originIata: string,
    destIata: string,
    params: SeeruSearchParams
  ): Promise<AirOffer[]> {
    const job = await this.startAirportSearch(originIata, destIata, params);
    if (!job) return [];
    await this.pollSearchJob(job, { maxRounds: 80 });
    return this.offersFromJob(job);
  }

  private buildOffersFromTrips(
    tripsMap: Map<string, any[]>,
    searchId: string,
    params: SeeruSearchParams,
    originIata: string,
    destIata: string
  ): AirOffer[] {
    const seeruNet = (r: any) => Number(r?.price || 0) + Number(r?.tax || 0);

    const offers: AirOffer[] = Array.from(tripsMap.entries())
      .map(([tripId, rows]: [string, any[]], index: number) => {
        const sorted = [...rows].sort((a, b) => seeruNet(a) - seeruNet(b));
        const row = sorted[0];
        const legs = Array.isArray(row?.legs) ? row.legs : [];

        const itineraries: AirOfferLeg[] = legs.map((leg: any, idx: number) => {
          const segmentsRaw = Array.isArray(leg?.segments) ? leg.segments : [];
          const legBags = legacyBags(extractSeeruBags(leg?.bags || legs[0]?.bags || row?.bags));
          const segments: AirOfferSegment[] = segmentsRaw.map((segment: any, segIndex: number) => ({
            segmentId: String(segment?.id || segment?.segment_id || `${index}-${idx}-${segIndex}`),
            airlineCode: String(segment?.iata || segment?.airline || segment?.marketing_airline || ""),
            airlineName: String(segment?.airline_name || segment?.airline || ""),
            operatingCarrierCode: String(segment?.operating_carrier || segment?.operating_airline || ""),
            operatingCarrierName: String(segment?.operating_carrier_name || ""),
            flightNumber: String(segment?.flightnumber || segment?.flight_no || segment?.flight_number || ""),
            aircraftCode: String(segment?.equipment || segment?.aircraft || ""),
            aircraftName: String(segment?.equipment_name || segment?.equipment || segment?.aircraft || ""),
            departureAirport: String(segment?.from?.airport || segment?.from?.code || leg?.from?.code || originIata).toUpperCase(),
            departureAirportName: String(segment?.from?.airport_name || ""),
            departureCity: String(segment?.from?.city || ""),
            departureTerminal: String(segment?.from?.terminal || ""),
            departureTime:
              normalizeSeeruDateTime(segment?.from?.date) ||
              formatSegmentDate(segment?.from?.date, segment?.from?.time),
            arrivalAirport: String(segment?.to?.airport || segment?.to?.code || leg?.to?.code || destIata).toUpperCase(),
            arrivalAirportName: String(segment?.to?.airport_name || ""),
            arrivalCity: String(segment?.to?.city || ""),
            arrivalTerminal: String(segment?.to?.terminal || ""),
            arrivalTime:
              normalizeSeeruDateTime(segment?.to?.date) ||
              formatSegmentDate(segment?.to?.date, segment?.to?.time),
            durationMinutes: Number(segment?.duration || 0),
            cabinClass: String(leg?.cabin_name || leg?.cabin || params.cabinClass || "ECONOMY"),
            bookingClass: String(segment?.booking_class || ""),
            baggageAllowance: {
              checkedBags: legBags.checkedBags,
              weightKg: legBags.weightKg,
              dimensions: legBags.cabinDesc ? `Cabin: ${legBags.cabinDesc}` : undefined,
            },
          }));

          const origin = String(leg?.from?.code || segments[0]?.departureAirport || originIata).toUpperCase();
          const destination = String(
            leg?.to?.code || segments[segments.length - 1]?.arrivalAirport || destIata
          ).toUpperCase();
          const depTime = segments[0]?.departureTime || params.departureDate;
          const arrTime = segments[segments.length - 1]?.arrivalTime || params.departureDate;

          return {
            origin,
            destination,
            departureDate: depTime,
            arrivalDate: arrTime,
            carrierCode: segments[0]?.airlineCode || String(row?.airline || "SEERU"),
            carrierName: segments[0]?.airlineName || "",
            flightNumber: segments[0]?.flightNumber || "",
            durationMinutes: Number(leg?.duration || 0),
            stops: Array.isArray(leg?.stops) ? leg.stops.length : Math.max(0, segments.length - 1),
            segments,
            baggageAllowance: legBags,
          };
        });

        const base = Number(row?.price || 0);
        const taxes = Number(row?.tax || 0);
        const total = base + taxes;
        const currency = resolveSeeruQuoteCurrency(row?.currency, params);
        const offerId = String(tripId || row?.id || `seeru-${index}`);

        return {
          id: `seeru_${offerId}`,
          provider: "seeru" as const,
          price: { base, taxes, total, currency },
          legs: itineraries,
          validatingCarrier: String((legs?.[0]?.segments?.[0] || {})?.airline || itineraries[0]?.carrierCode || ""),
          refundable: !!row?.can_refund || String(row?.refundable_info || "").length > 0,
          refundableInfo: String(row?.refundable_info || ""),
          modifiable: !!row?.can_exchange,
          ticketingDeadline: row?.etd || undefined,
          fareOptions: sorted.map((r: any, bi: number): FareOption => {
            const rLegs = Array.isArray(r?.legs) ? r.legs : [];
            const baggage = extractSeeruBags(rLegs[0]?.bags || r?.bags);
            const refundable = boolToAttribute(r?.can_refund != null ? Boolean(r.can_refund) : undefined);
            const changeable = boolToAttribute(r?.can_exchange != null ? Boolean(r.can_exchange) : undefined);
            const realBrand = String(r?.fare_brand || r?.brand_name || r?.fare_name || r?.brand || r?.tier_name || "").trim();
            const cabin = String(rLegs[0]?.cabin_name || rLegs[0]?.cabin || params.cabinClass || "ECONOMY");
            const partial: Pick<FareOption, "refundable" | "changeable" | "baggage"> = { refundable, changeable, baggage };
            return {
              id: `${offerId}::${String(r?.fare_key || bi)}`,
              supplier: "seeru",
              brandName: realBrand || deriveFareLabel(partial, "ar"),
              brandCode: realBrand ? String(r?.fare_brand_code || r?.brand_code || "") || undefined : undefined,
              nameSource: realBrand ? "supplier" : "derived",
              cabin,
              baggage,
              refundable,
              changeable,
              penalties: [],
              seatSelection: "unknown",
              meal: "unknown",
              priority: "unknown",
              price: {
                base: Number(r?.price || 0),
                taxes: Number(r?.tax || 0),
                total: Number(r?.price || 0) + Number(r?.tax || 0),
                currency: resolveSeeruQuoteCurrency(r?.currency, params),
              },
              supplierToken: String(r?.fare_key || r?.id || ""),
              supplierContext: { trip_id: tripId, search_id: searchId, src: String(r?.src || "") },
              rulesText: String(r?.refundable_info || "") || undefined,
              isBestPrice: bi === 0,
            };
          }),
          rawOfferData: {
            provider: "seeru-air",
            trip_id: tripId,
            search_id: searchId,
            variants: sorted,
          },
        };
      })
      .filter((offer) => Number(offer.price.total) > 0);

    return offers;
  }

  async searchFlights(params: SeeruSearchParams): Promise<AirOffer[]> {
    const rawOrigin = String(params.origin || "").trim().toUpperCase();
    const rawDest = String(params.destination || "").trim().toUpperCase();

    const originIatas = await resolveAirportsForCode(rawOrigin);
    const destIatas = await resolveAirportsForCode(rawDest);

    const origins = originIatas.length > 0 ? originIatas.slice(0, 2) : [rawOrigin.slice(0, 3) || "IST"];
    const dests = destIatas.length > 0 ? destIatas.slice(0, 2) : [rawDest.slice(0, 3) || "DXB"];

    const pairPromises: Promise<AirOffer[]>[] = [];
    for (const o of origins) {
      for (const d of dests) {
        pairPromises.push(
          this.searchAirportPair(o, d, params).catch((err) => {
            console.warn(`[SeeruAirAdapter] Error searching ${o}-${d}:`, err?.message || err);
            return [];
          })
        );
      }
    }

    const pairResults = await Promise.all(pairPromises);
    const allOffers = pairResults.flat();

    const seen = new Set<string>();
    const unique: AirOffer[] = [];
    for (const offer of allOffers) {
      if (!offer || !offer.id || seen.has(offer.id)) continue;
      seen.add(offer.id);
      unique.push(offer);
    }
    return unique;
  }

  private buildSeeruBookingRow(
    offer: any,
    input: SeeruBookingInput,
    currency = "USD"
  ): Record<string, unknown> {
    return {
      price: Number(offer?.price || 0),
      tax: Number(offer?.tax || 0),
      refundable_info: String(offer?.refundable_info || ""),
      fare_key: String(offer?.fare_key || ""),
      fare_brand: String(offer?.fare_brand || ""),
      price_breakdowns: offer?.price_breakdowns || {},
      legs: offer?.legs || [],
      trip_id: String(offer?.trip_id || input.offerId.replace(/^seeru_/, "") || ""),
      search_id: String(offer?.search_id || ""),
      src: String(offer?.src || ""),
      id: String(offer?.id || ""),
      total_pax_no_inf: Number(
        offer?.total_pax_no_inf || input.passengers.filter((p) => p.type !== "INF").length
      ),
      search_query: offer?.search_query || {},
      currency: String(offer?.currency || currency),
      can_hold: !!offer?.can_hold,
      can_void: !!offer?.can_void,
      can_refund: !!offer?.can_refund,
      can_exchange: !!offer?.can_exchange,
      etd: String(offer?.etd || ""),
    };
  }

  private resolveSeeruOfferForBooking(input: SeeruBookingInput): any {
    let offer: any = input.rawOfferData || {};
    const variants = Array.isArray(offer?.variants) ? offer.variants : null;
    const fareKey = String(input.providerFareKey || "").trim();
    if (variants?.length && fareKey) {
      const hit = variants.find((v: any) => String(v?.fare_key || "") === fareKey);
      if (hit) {
        offer = {
          ...hit,
          trip_id: String(offer.trip_id || hit.trip_id || ""),
          search_id: String(offer.search_id || hit.search_id || ""),
          variants,
        };
      }
    }
    return offer;
  }

  /**
   * Re-prices a specific fare option (fare_key) using the stored raw search row.
   * Returns the verified booking row from Seeru (price/tax/bags/refundable_info) or null.
   */
  async priceFareOption(input: {
    fareKey: string;
    offerId: string;
    rawOfferData: unknown;
    adults?: number;
    children?: number;
    infants?: number;
  }): Promise<{ status?: string; booking?: Record<string, unknown>; message?: string } | null> {
    const paxCount = Math.max(1, Number(input.adults || 1) + Number(input.children || 0));
    const fakePax = Array.from({ length: paxCount }, () => ({ type: "ADT" })) as SeeruBookingInput["passengers"];
    const offer = this.resolveSeeruOfferForBooking({
      offerId: input.offerId,
      providerFareKey: input.fareKey,
      rawOfferData: input.rawOfferData,
      passengers: fakePax,
    } as SeeruBookingInput);
    if (!offer?.trip_id && !input.offerId) return null;
    const booking = this.buildSeeruBookingRow(offer, { offerId: input.offerId, passengers: fakePax } as SeeruBookingInput);
    const res = await this.checkBookingFare(booking);
    return res || null;
  }

  async checkBookingFare(booking: Record<string, unknown> | string): Promise<{ status?: string; booking?: Record<string, unknown>; message?: string }> {
    const payload = typeof booking === "string" ? { booking: { trip_id: booking.replace(/^seeru_/, "") } } : (booking?.booking ? booking : { booking });
    return this.request("booking/fare", "POST", payload);
  }

  async createBooking(input: SeeruBookingInput & { verifiedBooking?: Record<string, unknown> }): Promise<{
    ok: boolean;
    reservationId?: string;
    pnr?: string;
    status: string;
    error?: string;
    /** Verified fare row (booking/fare) actually sent to booking/save. */
    verifiedBooking?: Record<string, unknown>;
  }> {
    const offer = this.resolveSeeruOfferForBooking(input);
    let booking: Record<string, unknown> =
      input.verifiedBooking && typeof input.verifiedBooking === "object" && input.verifiedBooking.trip_id
        ? { ...input.verifiedBooking }
        : this.buildSeeruBookingRow(offer, input);

    // 1. booking/fare is mandatory: it verifies availability and freezes the price the customer paid.
    const fareCheck = await this.checkBookingFare(booking);
    const fareStatus = String(fareCheck?.status || "").toLowerCase();
    if (fareStatus === "not_found" || fareStatus === "error" || fareStatus === "failed") {
      return {
        ok: false,
        status: "FAILED",
        error: fareCheck?.message || "صلاحية سعر Seeru منتهية أو لم يتم العثور على العرض المحدد",
      };
    }
    if (fareCheck?.booking && typeof fareCheck.booking === "object") {
      booking = fareCheck.booking as Record<string, unknown>;
    }
    for (const p of input.passengers) {
      if (!p.firstName?.trim() || !p.lastName?.trim() || !p.dateOfBirth || !p.nationality) {
        return { ok: false, status: "FAILED", error: "traveler_data_incomplete" };
      }
    }

    const passengers = input.passengers.map((p) => ({
      type: p.type,
      title: p.title,
      first_name: p.firstName,
      last_name: p.lastName,
      dob: p.dateOfBirth,
      nationality: p.nationality || "",
      passport_no: p.passportNumber || "",
      passport_expiry: p.passportExpiry || "",
      passport_country: p.passportCountry || p.nationality || "",
    }));

    const contact = {
      email: input.contactEmail,
      phone: input.contactPhone || "",
    };

    const saveResponse = await this.request<{
      status?: string;
      order_id?: string;
      message?: string;
    }>("booking/save", "POST", { booking, passengers, contact });

    const orderId = String(saveResponse?.order_id || "");
    if (!orderId) {
      return {
        ok: false,
        status: "FAILED",
        error: saveResponse?.message || "لم تُرجع منصة Seeru معرّف الحجز (order_id)",
      };
    }

    return {
      ok: true,
      reservationId: orderId,
      pnr: orderId,
      status: "CONFIRMED",
      verifiedBooking: booking,
    };
  }

  async ticketBooking(orderId: string): Promise<{ ok: boolean; tickets?: string[]; error?: string }> {
    const res = await this.request<{ status?: string; message?: string }>("order/issue", "POST", {
      order_id: String(orderId),
    });
    const st = String(res?.status || "").toUpperCase();
    const ok = st === "OK" || st === "SUCCESS";
    if (!ok) return { ok, tickets: [], error: res?.message || "فشل إصدار تذاكر Seeru" };
    // Ticket numbers are only what Seeru reports on the order — never synthesised.
    const details = await this.fetchOrderDetails(orderId).catch(() => null);
    return { ok: true, tickets: details ? extractSeeruTicketNumbers(details) : [] };
  }

  async cancelBooking(orderId: string): Promise<{ ok: boolean; error?: string }> {
    const res = await this.request<{ status?: string; message?: string }>("order/cancel", "POST", {
      order_id: String(orderId),
    });
    const st = String(res?.status || "").toUpperCase();
    const ok = st === "OK" || st === "SUCCESS";
    return { ok, error: ok ? undefined : res?.message || "فشل إلغاء حجز Seeru" };
  }

  /** Airline PNR / ticket numbers / status as reported by order/details (empty when Seeru has not issued yet). */
  async orderState(orderId: string): Promise<{ status: string; airlinePnr: string; tickets: string[]; raw: Record<string, unknown> | null }> {
    const raw = await this.fetchOrderDetails(orderId).catch(() => null);
    const order = (raw && typeof raw === "object" ? ((raw as any).order || (raw as any).data || raw) : {}) as Record<string, any>;
    return {
      status: String(order?.status || order?.order_status || (raw as any)?.status || "").toLowerCase(),
      airlinePnr: String(order?.airline_pnr || order?.pnr || order?.reservation_no || "").trim(),
      tickets: raw ? extractSeeruTicketNumbers(raw) : [],
      raw: raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null,
    };
  }

  async fetchOrderDetails(orderId: string): Promise<Record<string, unknown>> {
    return this.request("order/details", "POST", { order_id: String(orderId) });
  }

  async fetchTicketDetails(ticketId: string): Promise<Record<string, unknown>> {
    return this.request("ticket/details", "POST", { ticket_id: String(ticketId) });
  }

  async retrieveTicketByPnr(airlinePnr: string, lastName: string): Promise<Record<string, unknown>> {
    return this.request("ticket/retrieve", "POST", {
      airline_pnr: String(airlinePnr).trim(),
      last_name: String(lastName).trim(),
    });
  }

  async quoteTicketRefund(input: {
    ticketId: string;
    legs?: string[];
    passengers?: string[];
  }): Promise<{ status?: string; message?: string; refundAmount?: number }> {
    return this.request("ticket/refund", "POST", {
      ticket_id: String(input.ticketId),
      legs: input.legs || [],
      passengers: input.passengers || [],
    });
  }

  async commitTicketRefund(input: {
    ticketId: string;
    totalFees: number;
    legs?: string[];
    passengers?: string[];
  }): Promise<{ status?: string; message?: string }> {
    return this.request("ticket/refund", "POST", {
      ticket_id: String(input.ticketId),
      total_fees: Number(input.totalFees),
      legs: input.legs || [],
      passengers: input.passengers || [],
    });
  }

  async quoteTicketExchange(input: {
    ticketId: string;
    exchangeLegs: Array<{ leg_id: string; exchange_for: Record<string, unknown> }>;
    passengers?: string[];
  }): Promise<{ status?: string; message?: string }> {
    return this.request("ticket/exchange", "POST", {
      ticket_id: String(input.ticketId),
      exchange_legs: input.exchangeLegs,
      passengers: input.passengers || [],
    });
  }

  async commitTicketExchange(input: {
    ticketId: string;
    totalFees: number;
    exchangeLegs: Array<{ leg_id: string; exchange_for: Record<string, unknown> }>;
    passengers?: string[];
  }): Promise<{ status?: string; message?: string }> {
    return this.request("ticket/exchange", "POST", {
      ticket_id: String(input.ticketId),
      total_fees: Number(input.totalFees),
      exchange_legs: input.exchangeLegs,
      passengers: input.passengers || [],
    });
  }

  async voidTicket(input: { ticketId: string; passengers?: string[] }): Promise<{ status?: string; message?: string }> {
    return this.request("ticket/void", "POST", {
      ticket_id: String(input.ticketId),
      passengers: input.passengers || [],
    });
  }
}
