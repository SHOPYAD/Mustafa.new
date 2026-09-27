import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { EnquiryBookingRecord } from "@/lib/pocketbase/records";
import { getPaymentsPublicConfig } from "@/lib/server/payments-settings";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import {
  encodeLegs,
  resolveFareToken,
  runFlightDetails,
  type PublicFlightItinerary,
  type PublicFlightPrice,
  type StoredFareToken,
} from "@/lib/server/flights-engine";
import {
  FLIGHT_QUOTE_TTL_MS,
  priceChanged,
  repriceStoredFare,
  type FlightBaggageQuote,
  type FlightRepriceResult,
} from "@/lib/server/flights/repricing";
import {
  TravelportAirBookingAdapter,
  SeeruAirAdapter,
  PkfareAirAdapter,
  BiletbankAirAdapter,
} from "@/lib/providers/adapters";

/**
 * Flight booking sessions (server-only, `.data/flights-bookings.json`).
 *
 * Lifecycle (B3):
 *   init      → mandatory supplier re-price of the selected fare → 15-minute quote (no supplier booking yet,
 *               no placeholder travellers)
 *   payment   → hotel_bookings row (provider "flight") priced from the quote → iyzico
 *   paid      → fulfilFlightBooking(): supplier booking with the real travellers → ticket issue → PNR /
 *               e-ticket numbers exactly as returned by the supplier (never synthesised)
 *   failure   → automatic refund + admin alert (see flights/fulfilment.ts)
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "flights-bookings.json");
/** Unpaid sessions are dropped after 6 hours; sessions tied to a payment / supplier order are kept 90 days. */
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const FULFILLED_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type FlightSupplier = StoredFareToken["supplier"];

export type FlightQuote = {
  supplier: FlightSupplier;
  supplierTotal: number;
  supplierCurrency: string;
  sellingTotal: number;
  clientTotal: number;
  clientCurrency: string;
  quotedAt: string;
  expiresAt: string;
  paymentTimeLimit?: string;
  fareChanged: boolean;
  previousClientTotal?: number;
  baggage?: FlightBaggageQuote;
};

export type FlightFulfilmentStatus =
  | "awaiting_payment"
  | "supplier_pending"
  | "supplier_confirmed"
  | "ticket_pending"
  | "ticketed"
  | "supplier_failed"
  | "ticket_failed"
  | "cancelled"
  | "refund_pending"
  | "refunded"
  | "refund_failed";

export type FlightTraveler = {
  type: "ADT" | "CHD" | "INF";
  title: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F" | "";
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportCountry: string;
};

export type FlightBookingSession = {
  id: string;
  locale?: string;
  createdAt: string;
  updatedAt?: string;
  itineraryId: string;
  legs: string;
  sessionId?: string;
  supplier: FlightSupplier | "unknown";
  price: PublicFlightPrice;
  quotedClient: number;
  itinerary: PublicFlightItinerary | null;
  passengers: { adults: number; children: number; infants: number };
  contact: { name: string; email: string; phone: string };
  travelers: Array<Record<string, unknown>>;
  userId?: string;
  /* fare + supplier context (server-only) */
  fareId?: string;
  fareToken?: StoredFareToken;
  rawOffer?: unknown;
  verifiedPayload?: Record<string, unknown>;
  quote?: FlightQuote;
  /* links */
  pocketbaseId?: string;
  hotelBookingId?: string;
  /* supplier state — only what the supplier returned */
  pnr?: string;
  airlinePnr?: string;
  supplierOrderId?: string;
  supplierReference?: string;
  ticketNumbers?: string[];
  /** First e-ticket number (compat with invoice model). Empty until issued. */
  ticketNumber?: string;
  ticketIssued?: boolean;
  /** @deprecated never populated anymore — kept so old sessions still parse. */
  dummyPnr?: string;
  fulfilment: {
    status: FlightFulfilmentStatus;
    error?: string;
    startedAt?: string;
    finishedAt?: string;
    trigger?: string;
    supplierEvents?: Array<{ at: string; status: string; reservationNo?: string; reason?: string }>;
  };
};

type StoreFile = { sessions: FlightBookingSession[] };

function isRetained(row: FlightBookingSession, now: number): boolean {
  const at = Date.parse(row.createdAt);
  if (!Number.isFinite(at)) return false;
  const tied = Boolean(row.hotelBookingId || row.pnr || row.supplierOrderId || row.pocketbaseId);
  return now - at < (tied ? FULFILLED_TTL_MS : SESSION_TTL_MS);
}

function normalizeSession(row: FlightBookingSession): FlightBookingSession {
  return {
    ...row,
    supplier: row.supplier || supplierOfItinerary(row.itineraryId),
    ticketNumbers: Array.isArray(row.ticketNumbers) ? row.ticketNumbers : [],
    fulfilment: row.fulfilment || { status: "awaiting_payment" },
  };
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const now = Date.now();
    return { sessions: (parsed.sessions || []).filter((row) => isRetained(row, now)).map(normalizeSession) };
  } catch {
    return { sessions: [] };
  }
}

let writeChain: Promise<void> = Promise.resolve();
async function writeStore(store: StoreFile): Promise<void> {
  const task = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${STORE_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(store, null, 2), { mode: 0o600 });
    await fs.rename(tmp, STORE_FILE);
  });
  writeChain = task.catch(() => undefined);
  return task;
}

function newBookingId(): string {
  return `flt_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

export function supplierOfItinerary(itineraryId: string): FlightSupplier | "unknown" {
  if (itineraryId.startsWith("tp_")) return "travelport";
  if (itineraryId.startsWith("seeru_")) return "seeru";
  if (itineraryId.startsWith("pk_") || itineraryId.startsWith("pkfare_")) return "pkfare";
  if (itineraryId.startsWith("bb_")) return "biletbank";
  return "unknown";
}

/* ------------------------------------------------------------------------------------------------ */
/* Travellers                                                                                        */

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function isoDate(v: unknown): string {
  const s = str(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const t = Date.parse(s);
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : "";
}

export function normalizeTraveler(raw: Record<string, unknown>): FlightTraveler {
  const kind = str(raw.kind || raw.type).toLowerCase();
  const type: FlightTraveler["type"] = /inf/.test(kind) ? "INF" : /chd|child/.test(kind) ? "CHD" : "ADT";
  const genderRaw = str(raw.gender).toLowerCase();
  const gender: FlightTraveler["gender"] = genderRaw.startsWith("f") ? "F" : genderRaw.startsWith("m") ? "M" : "";
  const titleRaw = str(raw.title).toUpperCase();
  const title = titleRaw || (type === "ADT" ? (gender === "F" ? "MS" : gender === "M" ? "MR" : "") : gender === "F" ? "MISS" : gender === "M" ? "MASTER" : "");
  const nationality = str(raw.nationality || raw.passportCountry || raw.passport_country).toUpperCase();
  return {
    type,
    title,
    firstName: str(raw.firstName || raw.first_name),
    lastName: str(raw.lastName || raw.last_name),
    gender,
    dateOfBirth: isoDate(raw.dateOfBirth || raw.dob || raw.birthDate),
    nationality,
    passportNumber: str(raw.passportNumber || raw.passport_no || raw.passport),
    passportExpiry: isoDate(raw.passportExpiry || raw.passport_expiry),
    passportCountry: str(raw.passportCountry || raw.passport_country).toUpperCase() || nationality,
  };
}

export function travelerIssues(travelers: FlightTraveler[], expected: { adults: number; children: number; infants: number }): string[] {
  const issues: string[] = [];
  const total = expected.adults + expected.children + expected.infants;
  if (travelers.length < total) issues.push(`travelers_missing:${travelers.length}/${total}`);
  travelers.forEach((t, i) => {
    if (!t.firstName || !t.lastName) issues.push(`traveler_${i + 1}_name`);
    if (!t.dateOfBirth) issues.push(`traveler_${i + 1}_dob`);
  });
  return issues;
}

/* ------------------------------------------------------------------------------------------------ */
/* Init: itinerary snapshot + mandatory re-price → quote                                             */

export type FlightBookingInitError =
  | "search_failed"
  | "provider_travelpayouts"
  | "endpoint_disabled"
  | "not_bookable"
  | "fare_unavailable"
  | "quote_failed";

async function buildQuote(
  session: Pick<FlightBookingSession, "fareToken" | "rawOffer" | "passengers" | "itinerary" | "price">,
  guestCurrency: string,
  previousClient?: number
): Promise<{ ok: true; quote: FlightQuote; verifiedPayload?: Record<string, unknown>; raw: unknown } | { ok: false; result: FlightRepriceResult & { ok: false } }> {
  if (!session.fareToken) return { ok: false, result: { ok: false, code: "token_missing", error: "fare_token_missing" } };
  const runtime = await getFlightsRuntime();
  const result = await repriceStoredFare({
    token: session.fareToken,
    rawOffer: session.rawOffer,
    passengers: session.passengers,
    legs: session.itinerary?.legs || [],
    markupRules: runtime.markupRules,
    guestCurrency,
  });
  if (!result.ok) return { ok: false, result };
  const now = Date.now();
  const expiresAt = new Date(now + FLIGHT_QUOTE_TTL_MS).toISOString();
  const prev = Number(previousClient) || 0;
  return {
    ok: true,
    quote: {
      supplier: result.supplier,
      supplierTotal: result.supplierTotal,
      supplierCurrency: result.supplierCurrency,
      sellingTotal: result.sellingTotal,
      clientTotal: result.clientTotal,
      clientCurrency: result.clientCurrency,
      quotedAt: new Date(now).toISOString(),
      expiresAt: result.paymentTimeLimit && Date.parse(result.paymentTimeLimit) < now + FLIGHT_QUOTE_TTL_MS && Date.parse(result.paymentTimeLimit) > now ? new Date(Date.parse(result.paymentTimeLimit)).toISOString() : expiresAt,
      paymentTimeLimit: result.paymentTimeLimit,
      fareChanged: prev > 0 && priceChanged(prev, result.clientTotal),
      previousClientTotal: prev > 0 ? prev : undefined,
      baggage: result.baggage,
    },
    verifiedPayload: result.verifiedPayload,
    raw: result.raw,
  };
}

export function quoteIsFresh(quote: FlightQuote | undefined, now = Date.now()): boolean {
  if (!quote) return false;
  const exp = Date.parse(quote.expiresAt);
  return Number.isFinite(exp) && exp > now;
}

export async function initFlightBooking(input: {
  itineraryId: string;
  legs: unknown;
  sessionId?: string;
  currency?: string;
  market?: string;
  countryCode?: string;
  quotedClient?: number;
  adults?: number;
  children?: number;
  infants?: number;
  contact?: { name?: string; email?: string; phone?: string };
  travelers?: Array<Record<string, unknown>>;
  userId?: string;
  locale?: string;
  /** Selected fare family id (FareOption.id). */
  fareId?: string;
}): Promise<
  | {
      ok: true;
      booking: FlightBookingSession;
      payment: { iyzicoEnabled: boolean; whatsappBankLinkEnabled: boolean };
    }
  | { ok: false; errorCode: FlightBookingInitError; error?: string }
> {
  const legs = encodeLegs(input.legs);
  const supplier = supplierOfItinerary(input.itineraryId);
  if (supplier === "unknown") return { ok: false, errorCode: "not_bookable" };

  const details = await runFlightDetails({
    itineraryId: input.itineraryId,
    legs,
    sessionId: input.sessionId,
    currency: input.currency,
    market: input.market,
    countryCode: input.countryCode,
    quotedClient: input.quotedClient,
  });
  if (!details.ok) {
    return {
      ok: false,
      errorCode:
        details.errorCode === "provider_travelpayouts" || details.errorCode === "endpoint_disabled" ? details.errorCode : "search_failed",
    };
  }

  const fareRef = await resolveFareToken({ sessionId: input.sessionId, fareId: input.fareId, itineraryId: input.itineraryId }).catch(() => null);
  if (!fareRef) return { ok: false, errorCode: "fare_unavailable", error: "fare_token_missing" };

  const guestCurrency = String(input.currency || details.price.currency || "USD").toUpperCase();
  const passengers = {
    adults: Math.max(1, Number(input.adults) || 1),
    children: Math.max(0, Number(input.children) || 0),
    infants: Math.max(0, Number(input.infants) || 0),
  };
  const quoted = Number(input.quotedClient) || details.price.client;

  const priced = await buildQuote(
    { fareToken: fareRef.token, rawOffer: fareRef.rawOffer, passengers, itinerary: details.itinerary, price: details.price },
    guestCurrency,
    quoted
  );
  if (!priced.ok) {
    return { ok: false, errorCode: priced.result.code === "supplier_error" ? "quote_failed" : "fare_unavailable", error: priced.result.error };
  }

  const price: PublicFlightPrice = {
    ...details.price,
    base: details.price.base,
    client: priced.quote.clientTotal,
    currency: priced.quote.clientCurrency,
    fareChanged: priced.quote.fareChanged,
  };

  const now = new Date().toISOString();
  const booking: FlightBookingSession = {
    id: newBookingId(),
    locale: input.locale || "ar",
    createdAt: now,
    updatedAt: now,
    itineraryId: input.itineraryId,
    legs,
    sessionId: input.sessionId,
    supplier,
    price,
    quotedClient: quoted,
    itinerary: details.itinerary
      ? { ...details.itinerary, price: { ...details.itinerary.price, client: priced.quote.clientTotal, currency: priced.quote.clientCurrency } }
      : null,
    passengers,
    contact: {
      name: str(input.contact?.name),
      email: str(input.contact?.email),
      phone: str(input.contact?.phone),
    },
    travelers: Array.isArray(input.travelers) ? input.travelers : [],
    userId: input.userId,
    fareId: fareRef.token.fareId,
    fareToken: fareRef.token,
    rawOffer: fareRef.rawOffer,
    verifiedPayload: priced.verifiedPayload,
    quote: priced.quote,
    ticketNumbers: [],
    ticketNumber: "",
    ticketIssued: false,
    fulfilment: { status: "awaiting_payment" },
  };

  const first = details.itinerary?.legs[0];
  const last = details.itinerary?.legs[details.itinerary.legs.length - 1];
  const route = [first?.origin.displayCode || first?.origin.skyId, last?.destination.displayCode || last?.destination.skyId].filter(Boolean).join(" → ");
  const firstSeg = first?.segments?.[0];
  const lastSeg = last?.segments?.[last.segments.length - 1];
  const selectedFare = details.itinerary?.fareFamilies?.find((f) => f.id === fareRef.token.fareId);

  try {
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      const created = await pb.collection("enquiry_bookings").create<EnquiryBookingRecord>({
        type: "flight",
        status: "new",
        service_name: route || "Flight",
        destination: route,
        customer_name: booking.contact.name,
        customer_email: booking.contact.email,
        customer_phone: booking.contact.phone,
        message: `itinerary ${input.itineraryId}`,
        ...(input.userId ? { user: input.userId } : {}),
        metadata: {
          engine: "supplier_live",
          provider: supplier,
          airline: firstSeg?.airline || details.itinerary?.airlines?.[0] || first?.carrierName || "",
          airline_code: firstSeg?.airlineCode || first?.carrierCode || "",
          flightNumber: firstSeg?.flightNumber || "",
          aircraft: firstSeg?.aircraft || "",
          originAirport: firstSeg?.origin?.name || firstSeg?.origin?.city || first?.origin.displayCode || "",
          destinationAirport: lastSeg?.destination?.name || lastSeg?.destination?.city || last?.destination.displayCode || "",
          originTerminal: firstSeg?.origin?.terminal || "",
          destinationTerminal: lastSeg?.destination?.terminal || "",
          departureTime: firstSeg?.departure || first?.departure || "",
          arrivalTime: lastSeg?.arrival || last?.arrival || "",
          // Only what the supplier stated; unknown stays undefined (never "0 bags" / "Standard").
          baggageAllowance: priced.quote.baggage || selectedFare?.baggage || undefined,
          fareBrand: selectedFare?.name || fareRef.token.brandName || undefined,
          fareId: fareRef.token.fareId,
          farePolicy: details.itinerary?.farePolicy,
          refundable: selectedFare?.refundable ?? details.itinerary?.farePolicy?.refundable,
          canExchange: selectedFare?.changeable ?? details.itinerary?.farePolicy?.modifiable,
          canVoid: details.itinerary?.farePolicy?.canVoid,
          canHold: details.itinerary?.farePolicy?.canHold,
          ticketingDeadline: priced.quote.paymentTimeLimit || details.itinerary?.farePolicy?.ticketingDeadline,
          locale: booking.locale || "ar",
          bookingId: booking.id,
          itineraryId: input.itineraryId,
          sessionId: input.sessionId || "",
          price,
          quote: priced.quote,
          passengers: booking.passengers,
          travelers: input.travelers,
          itinerary: booking.itinerary,
          fareChanged: priced.quote.fareChanged,
          fulfilment_status: "awaiting_payment",
        },
      });
      booking.pocketbaseId = created.id;
    }
  } catch {
    /* local session still valid */
  }

  const store = await readStore();
  store.sessions.push(booking);
  await writeStore(store);

  const payments = await getPaymentsPublicConfig();
  return {
    ok: true,
    booking,
    payment: { iyzicoEnabled: payments.iyzicoEnabled, whatsappBankLinkEnabled: payments.whatsappBankLinkEnabled },
  };
}

/* ------------------------------------------------------------------------------------------------ */
/* Store access                                                                                      */

export async function getFlightBooking(id: string): Promise<FlightBookingSession | null> {
  if (!id) return null;
  const store = await readStore();
  return store.sessions.find((row) => row.id === id) || null;
}

export async function listFlightBookingsForUser(userId: string): Promise<FlightBookingSession[]> {
  if (!userId) return [];
  const store = await readStore();
  return store.sessions
    .filter((row) => row.userId === userId)
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export async function findFlightBookingBy(pred: (row: FlightBookingSession) => boolean): Promise<FlightBookingSession | null> {
  const store = await readStore();
  return store.sessions.find(pred) || null;
}

export async function updateFlightBooking(id: string, patch: Partial<FlightBookingSession>): Promise<FlightBookingSession | null> {
  const store = await readStore();
  const idx = store.sessions.findIndex((row) => row.id === id);
  if (idx < 0) return null;
  const next: FlightBookingSession = { ...store.sessions[idx], ...patch, updatedAt: new Date().toISOString() };
  if (patch.ticketNumbers) {
    next.ticketNumber = patch.ticketNumbers[0] || next.ticketNumber || "";
  }
  store.sessions[idx] = next;
  await writeStore(store);
  void syncEnquiryMetadata(next).catch(() => undefined);
  return next;
}

async function syncEnquiryMetadata(session: FlightBookingSession): Promise<void> {
  if (!session.pocketbaseId) return;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return;
  const rec = await pb.collection("enquiry_bookings").getOne<EnquiryBookingRecord>(session.pocketbaseId).catch(() => null);
  if (!rec) return;
  const meta = (rec.metadata && typeof rec.metadata === "object" ? { ...(rec.metadata as Record<string, unknown>) } : {}) as Record<string, unknown>;
  await pb
    .collection("enquiry_bookings")
    .update(session.pocketbaseId, {
      status: session.fulfilment.status === "ticketed" || session.fulfilment.status === "supplier_confirmed" ? "confirmed" : session.fulfilment.status === "cancelled" || session.fulfilment.status === "refunded" ? "cancelled" : rec.status,
      metadata: {
        ...meta,
        pnr: session.pnr || undefined,
        airline_pnr: session.airlinePnr || undefined,
        orderId: session.supplierOrderId || undefined,
        ticket_numbers: session.ticketNumbers || [],
        ticket_number: session.ticketNumber || undefined,
        ticket_issued: Boolean(session.ticketIssued),
        fulfilment_status: session.fulfilment.status,
        fulfilment_error: session.fulfilment.error,
        hotel_booking_id: session.hotelBookingId,
        quote: session.quote,
      },
    })
    .catch(() => undefined);
}

/** @deprecated kept for the invoice route; the session already holds only real references. */
export async function persistFlightSessionRefs(booking: FlightBookingSession): Promise<FlightBookingSession> {
  return booking;
}

/* ------------------------------------------------------------------------------------------------ */
/* Quote refresh (before payment)                                                                   */

export async function ensureFreshFlightQuote(
  id: string,
  opts: { force?: boolean } = {}
): Promise<
  | { ok: true; session: FlightBookingSession; refreshed: boolean; fareChanged: boolean }
  | { ok: false; error: "not_found" | "fare_unavailable" | "quote_failed"; detail?: string }
> {
  const session = await getFlightBooking(id);
  if (!session) return { ok: false, error: "not_found" };
  if (!opts.force && quoteIsFresh(session.quote)) return { ok: true, session, refreshed: false, fareChanged: false };
  const priced = await buildQuote(session, session.quote?.clientCurrency || session.price.currency || "USD", session.quote?.clientTotal || session.price.client);
  if (!priced.ok) {
    return { ok: false, error: priced.result.code === "supplier_error" ? "quote_failed" : "fare_unavailable", detail: priced.result.error };
  }
  const next = await updateFlightBooking(id, {
    quote: priced.quote,
    verifiedPayload: priced.verifiedPayload || session.verifiedPayload,
    price: { ...session.price, client: priced.quote.clientTotal, currency: priced.quote.clientCurrency, fareChanged: priced.quote.fareChanged },
    itinerary: session.itinerary ? { ...session.itinerary, price: { ...session.itinerary.price, client: priced.quote.clientTotal, currency: priced.quote.clientCurrency } } : session.itinerary,
  });
  return { ok: true, session: next || session, refreshed: true, fareChanged: priced.quote.fareChanged };
}

/* ------------------------------------------------------------------------------------------------ */
/* Supplier booking (after payment)                                                                  */

export type SupplierBookResult =
  | {
      ok: true;
      pnr: string;
      airlinePnr?: string;
      supplierOrderId: string;
      supplierTotal?: number;
      supplierCurrency?: string;
      verifiedPayload?: Record<string, unknown>;
      raw?: unknown;
    }
  | { ok: false; error: string; raw?: unknown };

export async function bookFlightAtSupplier(session: FlightBookingSession): Promise<SupplierBookResult> {
  const travelers = session.travelers.map((t) => normalizeTraveler(t));
  const issues = travelerIssues(travelers, session.passengers);
  if (issues.length) return { ok: false, error: `traveler_data_incomplete: ${issues.join(", ")}` };
  const token = session.fareToken;
  if (!token) return { ok: false, error: "fare_token_missing" };
  const contact = { email: session.contact.email, phone: session.contact.phone };

  try {
    if (token.supplier === "travelport") {
      const tp = new TravelportAirBookingAdapter();
      const booked = await tp.createBooking({
        fareToken: token.supplierToken,
        passengers: travelers.map((t) => ({
          type: t.type,
          title: t.title,
          firstName: t.firstName,
          lastName: t.lastName,
          dateOfBirth: t.dateOfBirth,
          gender: t.gender || undefined,
          nationality: t.nationality || undefined,
          passportNumber: t.passportNumber || undefined,
          passportExpiry: t.passportExpiry || undefined,
          passportCountry: t.passportCountry || undefined,
        })),
        contactEmail: contact.email,
        contactPhone: contact.phone,
      });
      if (!booked.ok || !booked.pnr) return { ok: false, error: booked.error || "travelport_booking_failed", raw: booked.raw };
      const carrierPnr = Object.values(booked.carrierLocators || {})[0];
      return {
        ok: true,
        pnr: booked.pnr,
        airlinePnr: carrierPnr,
        supplierOrderId: booked.pnr,
        supplierTotal: booked.price?.total,
        supplierCurrency: booked.price?.currency,
        verifiedPayload: booked.offerIdentifier ? { offerIdentifier: booked.offerIdentifier, workbenchId: booked.reservationId || "" } : undefined,
        raw: booked.raw,
      };
    }

    if (token.supplier === "seeru") {
      const seeru = new SeeruAirAdapter();
      const booked = await seeru.createBooking({
        offerId: token.offerId,
        providerFareKey: token.supplierToken,
        rawOfferData: session.rawOffer,
        verifiedBooking: session.verifiedPayload,
        passengers: travelers.map((t) => ({
          type: t.type,
          title: t.title || "MR",
          firstName: t.firstName,
          lastName: t.lastName,
          dateOfBirth: t.dateOfBirth,
          nationality: t.nationality,
          passportNumber: t.passportNumber,
          passportExpiry: t.passportExpiry,
          passportCountry: t.passportCountry,
        })),
        contactEmail: contact.email,
        contactPhone: contact.phone,
      });
      if (!booked.ok || !booked.pnr) return { ok: false, error: booked.error || "seeru_booking_failed" };
      const row = (booked.verifiedBooking || {}) as Record<string, unknown>;
      return {
        ok: true,
        pnr: booked.pnr,
        supplierOrderId: booked.reservationId || booked.pnr,
        supplierTotal: Number(row.price) + Number(row.tax || 0) || undefined,
        supplierCurrency: row.currency ? String(row.currency) : undefined,
        verifiedPayload: booked.verifiedBooking,
      };
    }

    if (token.supplier === "pkfare") {
      const pk = new PkfareAirAdapter();
      const raw = (session.rawOffer as Record<string, unknown> | undefined) || {};
      const solution = (session.verifiedPayload?.solution as Record<string, unknown> | undefined) || (raw.solution as Record<string, unknown> | undefined);
      if (!solution) return { ok: false, error: "pkfare_solution_missing" };
      const booked = await pk.createBooking({
        offerId: token.offerId,
        rawOfferData: { ...raw, solution },
        buyerOrder: session.id,
        passengers: travelers.map((t) => ({
          type: t.type,
          title: t.title || "MR",
          firstName: t.firstName,
          lastName: t.lastName,
          dateOfBirth: t.dateOfBirth,
          nationality: t.nationality,
          passportNumber: t.passportNumber,
          passportExpiry: t.passportExpiry,
        })),
        contactEmail: contact.email,
        contactPhone: contact.phone,
      });
      if (!booked.ok || !booked.reservationId) return { ok: false, error: booked.error || "pkfare_booking_failed", raw: booked.raw };
      const data = (booked.raw || {}) as Record<string, any>;
      const sol = (data?.solution || {}) as Record<string, unknown>;
      const pax = session.passengers;
      const total =
        Number(sol.adtFare || 0) * pax.adults + Number(sol.adtTax || 0) * pax.adults + Number(sol.chdFare || 0) * pax.children + Number(sol.chdTax || 0) * pax.children +
        Number(sol.infFare || 0) * pax.infants + Number(sol.infTax || 0) * pax.infants + Number(sol.qCharge || 0) + Number(sol.tktFee || 0) + Number(sol.platformServiceFee || 0) + Number(sol.merchantFee || 0);
      return {
        ok: true,
        pnr: booked.pnr && booked.pnr !== booked.reservationId ? booked.pnr : booked.reservationId,
        airlinePnr: booked.pnr && booked.pnr !== booked.reservationId ? booked.pnr : undefined,
        supplierOrderId: booked.reservationId,
        supplierTotal: total > 0 ? total : undefined,
        supplierCurrency: sol.currency ? String(sol.currency) : undefined,
        raw: booked.raw,
      };
    }

    if (token.supplier === "biletbank") {
      const bb = new BiletbankAirAdapter();
      // priceToken is short-lived → always re-price right before /book.
      const priced = await bb.checkFarePrice({ flightId: token.supplierToken, selectedPackage: token.supplierContext?.selectedPackage || undefined });
      if (!priced.ok || !priced.priceToken) return { ok: false, error: priced.error || "biletbank_price_failed" };
      const booked = await bb.createReservation({
        priceToken: priced.priceToken,
        passengers: travelers.map((t) => ({
          firstName: t.firstName,
          lastName: t.lastName,
          gender: t.gender || (t.title === "MRS" || t.title === "MS" || t.title === "MISS" ? "F" : "M"),
          birthDate: t.dateOfBirth,
          citizenId: "",
          passportNumber: t.passportNumber,
        })),
        contact: { email: contact.email, phone: contact.phone },
      });
      if (!booked.ok || !booked.pnr) return { ok: false, error: booked.error || "biletbank_booking_failed" };
      return {
        ok: true,
        pnr: booked.pnr,
        supplierOrderId: booked.pnr,
        supplierTotal: Number(booked.totalAmount) || Number(priced.finalAmount) || undefined,
        supplierCurrency: booked.currency || priced.currency,
        verifiedPayload: { priceToken: priced.priceToken, timeLimit: booked.timeLimit || "" },
      };
    }
    return { ok: false, error: "supplier_not_supported" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* Ticketing — only real e-ticket numbers                                                            */

export async function ticketFlightBooking(
  bookingId: string
): Promise<{ ok: boolean; ticketNumbers: string[]; ticketNumber?: string; issued: boolean; error?: string }> {
  const booking = await getFlightBooking(bookingId);
  if (!booking) return { ok: false, ticketNumbers: [], issued: false, error: "not_found" };
  if (booking.ticketIssued && booking.ticketNumbers?.length) {
    return { ok: true, ticketNumbers: booking.ticketNumbers, ticketNumber: booking.ticketNumbers[0], issued: true };
  }
  if (!booking.pnr && !booking.supplierOrderId) return { ok: false, ticketNumbers: [], issued: false, error: "supplier_booking_missing" };

  let ticketNumbers: string[] = [];
  let issued = false;
  let airlinePnr = booking.airlinePnr;
  try {
    if (booking.supplier === "travelport") {
      const tp = new TravelportAirBookingAdapter();
      const res = await tp.issueTicket(booking.pnr || "");
      if (!res.ok) throw new Error(res.error || "travelport_ticketing_failed");
      ticketNumbers = res.ticketNumbers || [];
      if (!ticketNumbers.length) ticketNumbers = await tp.ticketsOnReservation(booking.pnr || "").catch(() => []);
      issued = Boolean(res.committed);
    } else if (booking.supplier === "seeru") {
      const seeru = new SeeruAirAdapter();
      const orderId = booking.supplierOrderId || booking.pnr || "";
      const res = await seeru.ticketBooking(orderId);
      if (!res.ok) throw new Error(res.error || "seeru_ticketing_failed");
      ticketNumbers = res.tickets || [];
      const state = await seeru.orderState(orderId).catch(() => null);
      if (state?.tickets.length) ticketNumbers = state.tickets;
      if (state?.airlinePnr) airlinePnr = state.airlinePnr;
      issued = true;
    } else if (booking.supplier === "pkfare") {
      const pk = new PkfareAirAdapter();
      const orderNum = booking.supplierOrderId || "";
      // Mandatory pre-ticketing price check.
      const pricing = await pk.checkOrderPricing(orderNum).catch(() => null);
      const pec = String(pricing?.errorCode ?? pricing?.code ?? "0");
      if (pec !== "0" && pec !== "0000") throw new Error(pricing?.errorMsg || `pkfare_order_pricing_${pec}`);
      const first = normalizeTraveler(booking.travelers[0] || {});
      const res = await pk.issueTicket({
        orderNum,
        pnr: booking.airlinePnr || booking.pnr || "",
        email: booking.contact.email,
        name: `${first.firstName} ${first.lastName}`.trim() || booking.contact.name,
        telNum: booking.contact.phone,
      });
      if (!res.ok) throw new Error(res.error || "pkfare_ticketing_failed");
      const state = await pk.orderState(orderNum).catch(() => null);
      ticketNumbers = state?.tickets || [];
      if (state?.airPnr) airlinePnr = state.airPnr;
      issued = state ? state.status === "ISSED" || state.status === "ISSUED" || state.status === "TICKETED" : false;
      if (!issued && !state) issued = true; // ticketing accepted; numbers arrive via orderDetail / notify
    } else if (booking.supplier === "biletbank") {
      const bb = new BiletbankAirAdapter();
      const res = await bb.ticketBooking({ pnr: booking.pnr || "" });
      if (!res.ok) throw new Error(res.error || "biletbank_ticketing_failed");
      ticketNumbers = res.ticketNumbers || [];
      issued = true;
    } else {
      throw new Error("supplier_not_supported");
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : "ticketing_failed";
    await updateFlightBooking(booking.id, { fulfilment: { ...booking.fulfilment, status: "ticket_failed", error, finishedAt: new Date().toISOString() } });
    return { ok: false, ticketNumbers: [], issued: false, error };
  }

  const status: FlightFulfilmentStatus = ticketNumbers.length ? "ticketed" : issued ? "ticket_pending" : "ticket_pending";
  await updateFlightBooking(booking.id, {
    ticketNumbers,
    ticketNumber: ticketNumbers[0] || "",
    ticketIssued: ticketNumbers.length > 0,
    airlinePnr,
    fulfilment: { ...booking.fulfilment, status, error: undefined, finishedAt: new Date().toISOString() },
  });
  return { ok: true, ticketNumbers, ticketNumber: ticketNumbers[0], issued: ticketNumbers.length > 0 };
}

/** Re-reads the supplier order and stores any newly issued ticket numbers (delayed issuance). */
export async function syncFlightTicketState(bookingId: string): Promise<{ ok: boolean; ticketNumbers: string[]; status: string; error?: string }> {
  const booking = await getFlightBooking(bookingId);
  if (!booking) return { ok: false, ticketNumbers: [], status: "not_found", error: "not_found" };
  try {
    let tickets: string[] = [];
    let airlinePnr = booking.airlinePnr;
    let supplierStatus = "";
    if (booking.supplier === "travelport") {
      tickets = await new TravelportAirBookingAdapter().ticketsOnReservation(booking.pnr || "");
    } else if (booking.supplier === "seeru") {
      const st = await new SeeruAirAdapter().orderState(booking.supplierOrderId || booking.pnr || "");
      tickets = st.tickets;
      airlinePnr = st.airlinePnr || airlinePnr;
      supplierStatus = st.status;
    } else if (booking.supplier === "pkfare") {
      const st = await new PkfareAirAdapter().orderState(booking.supplierOrderId || "");
      tickets = st.tickets;
      airlinePnr = st.airPnr || airlinePnr;
      supplierStatus = st.status;
    } else {
      return { ok: false, ticketNumbers: booking.ticketNumbers || [], status: booking.fulfilment.status, error: "supplier_not_supported" };
    }
    if (tickets.length) {
      await updateFlightBooking(booking.id, {
        ticketNumbers: tickets,
        ticketNumber: tickets[0],
        ticketIssued: true,
        airlinePnr,
        fulfilment: { ...booking.fulfilment, status: "ticketed", error: undefined, finishedAt: new Date().toISOString() },
      });
      return { ok: true, ticketNumbers: tickets, status: "ticketed" };
    }
    if (airlinePnr && airlinePnr !== booking.airlinePnr) await updateFlightBooking(booking.id, { airlinePnr });
    return { ok: true, ticketNumbers: [], status: supplierStatus || booking.fulfilment.status };
  } catch (err) {
    return { ok: false, ticketNumbers: booking.ticketNumbers || [], status: booking.fulfilment.status, error: err instanceof Error ? err.message : String(err) };
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* Cancel / details / refunds                                                                        */

export async function cancelFlightBooking(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  const booking = await getFlightBooking(bookingId);
  if (!booking) return { ok: false, error: "not_found" };
  if (!booking.pnr && !booking.supplierOrderId) {
    // Nothing was created at the supplier — only the local state changes.
    await updateFlightBooking(booking.id, { fulfilment: { ...booking.fulfilment, status: "cancelled", finishedAt: new Date().toISOString() } });
    return { ok: true };
  }
  try {
    let res: { ok: boolean; error?: string };
    if (booking.supplier === "travelport") res = await new TravelportAirBookingAdapter().cancelBooking(booking.pnr || "");
    else if (booking.supplier === "seeru") res = await new SeeruAirAdapter().cancelBooking(booking.supplierOrderId || booking.pnr || "");
    else if (booking.supplier === "pkfare") res = await new PkfareAirAdapter().cancelBooking(booking.supplierOrderId || "", booking.pnr || undefined);
    else if (booking.supplier === "biletbank") res = await new BiletbankAirAdapter().cancelBooking(booking.pnr || "");
    else res = { ok: false, error: "supplier_not_supported" };
    if (res.ok) {
      await updateFlightBooking(booking.id, { fulfilment: { ...booking.fulfilment, status: "cancelled", finishedAt: new Date().toISOString() } });
    }
    return res;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "cancellation_failed" };
  }
}

export async function getFlightBookingSupplierDetails(bookingId: string): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const booking = await getFlightBooking(bookingId);
  if (!booking) return { ok: false, error: "not_found" };
  try {
    if (booking.supplier === "travelport") {
      const tp = new TravelportAirBookingAdapter();
      const [res, tix] = await Promise.allSettled([tp.retrieveReservation(booking.pnr || ""), tp.getTicketsByLocator(booking.pnr || "")]);
      return { ok: true, data: { reservation: res.status === "fulfilled" ? res.value : null, tickets: tix.status === "fulfilled" ? tix.value : null } };
    }
    if (booking.supplier === "seeru") return { ok: true, data: await new SeeruAirAdapter().fetchOrderDetails(booking.supplierOrderId || booking.pnr || "") };
    if (booking.supplier === "pkfare") return { ok: true, data: await new PkfareAirAdapter().fetchOrderDetails(booking.supplierOrderId || "") };
    return { ok: false, error: "supplier_not_supported" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "query_failed" };
  }
}

export async function quoteFlightBookingRefund(bookingId: string, refundParams?: { legs?: unknown; passengers?: unknown; reason?: number | string }): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const booking = await getFlightBooking(bookingId);
  if (!booking) return { ok: false, error: "not_found" };
  try {
    if (booking.supplier === "seeru") {
      const ticketId = booking.ticketNumbers?.[0] || "";
      if (!ticketId) return { ok: false, error: "ticket_not_issued" };
      const quote = await new SeeruAirAdapter().quoteTicketRefund({ ticketId, legs: refundParams?.legs as never, passengers: refundParams?.passengers as never });
      return { ok: true, data: quote };
    }
    if (booking.supplier === "pkfare") {
      if (!booking.supplierOrderId) return { ok: false, error: "supplier_booking_missing" };
      const reason = refundParams?.reason != null && refundParams.reason !== "" ? Number(refundParams.reason) : undefined;
      return await new PkfareAirAdapter().quoteRefund({ orderNum: booking.supplierOrderId, refundReason: Number.isFinite(reason) ? reason : undefined });
    }
    return { ok: false, error: "provider_refund_quote_not_supported" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "refund_quote_failed" };
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* Supplier webhooks (Seeru order events, PKFARE ticket-issuance notify)                             */

export async function applySupplierWebhook(input: {
  supplier: "seeru" | "pkfare" | string;
  orderId: string;
  status: string;
  reservationNo?: string;
  reason?: string;
  ticketNumbers?: string[];
}): Promise<{ matched: boolean; bookingId?: string }> {
  const orderId = String(input.orderId || "").trim();
  if (!orderId) return { matched: false };
  const booking = await findFlightBookingBy(
    (row) => row.supplier === input.supplier && (row.supplierOrderId === orderId || row.pnr === orderId || row.airlinePnr === orderId)
  );
  if (!booking) return { matched: false };
  const status = String(input.status || "").toLowerCase();
  const now = new Date().toISOString();
  const events = [...(booking.fulfilment.supplierEvents || []).slice(-19), { at: now, status, reservationNo: input.reservationNo, reason: input.reason }];
  const patch: Partial<FlightBookingSession> = { fulfilment: { ...booking.fulfilment, supplierEvents: events } };
  const tickets = (input.ticketNumbers || []).flatMap((t) => String(t).split("/")).map((t) => t.trim()).filter((t) => /^[A-Za-z0-9]{6,14}$/.test(t));
  if (input.reservationNo && !booking.airlinePnr) patch.airlinePnr = input.reservationNo;

  if (status === "ticketed" || status === "issued" || status === "issed" || status === "confirmed") {
    if (tickets.length) {
      patch.ticketNumbers = tickets;
      patch.ticketNumber = tickets[0];
      patch.ticketIssued = true;
      patch.fulfilment = { ...patch.fulfilment!, status: "ticketed", error: undefined, finishedAt: now };
    } else if (status !== "confirmed") {
      // Supplier says ticketed but did not include the numbers → pull them from the order.
      await updateFlightBooking(booking.id, patch);
      await syncFlightTicketState(booking.id).catch(() => undefined);
      return { matched: true, bookingId: booking.id };
    } else if (booking.fulfilment.status === "supplier_pending") {
      patch.fulfilment = { ...patch.fulfilment!, status: "supplier_confirmed" };
    }
  } else if (status === "cancelled" || status === "canceled" || status === "voided") {
    patch.fulfilment = { ...patch.fulfilment!, status: "cancelled", finishedAt: now };
  } else if (status === "error" || status === "failed" || status === "rejected") {
    patch.fulfilment = { ...patch.fulfilment!, status: booking.ticketIssued ? booking.fulfilment.status : "ticket_failed", error: input.reason || `supplier_${status}` };
    const { createAdminNotification } = await import("@/lib/admin-notifications/server");
    await createAdminNotification({
      type: "booking",
      body_ar: `المورد ${input.supplier} أبلغ عن فشل في حجز الطيران ${booking.pnr || orderId} — ${input.reason || status}`,
      href: "/admin/bookings",
      meta: { bookingId: booking.hotelBookingId || booking.id, source: "flight", kind: "supplier_webhook_error", reason: input.reason || status },
    }).catch(() => undefined);
  }
  await updateFlightBooking(booking.id, patch);
  if (booking.hotelBookingId) {
    void import("@/lib/server/flights/fulfilment").then(({ mirrorFlightStateToHotelBooking }) => mirrorFlightStateToHotelBooking(booking.id)).catch(() => undefined);
  }
  return { matched: true, bookingId: booking.id };
}
