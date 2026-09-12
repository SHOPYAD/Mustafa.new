import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { EnquiryBookingRecord } from "@/lib/pocketbase/records";
import { getPaymentsPublicConfig } from "@/lib/server/payments-settings";
import { notifyFlightBookingPlaced } from "@/lib/server/email/notify";
import { snapshotWithFlightRefs } from "@/lib/pdf/flight-booking-refs";
import {
  encodeLegs,
  runFlightDetails,
  type PublicFlightItinerary,
  type PublicFlightPrice,
} from "@/lib/server/flights-engine";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "flights-bookings.json");
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;

export type FlightBookingSession = {
  id: string;
  locale?: string;
  createdAt: string;
  itineraryId: string;
  legs: string;
  sessionId?: string;
  price: PublicFlightPrice;
  quotedClient: number;
  itinerary: PublicFlightItinerary | null;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  travelers: Array<Record<string, unknown>>;
  pocketbaseId?: string;
  dummyPnr?: string;
  pnr?: string;
  ticketNumber?: string;
  ticketIssued?: boolean;
};

type StoreFile = { sessions: FlightBookingSession[] };

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    const now = Date.now();
    const sessions = (parsed.sessions || []).filter((row) => {
      const at = Date.parse(row.createdAt);
      return Number.isFinite(at) && now - at < SESSION_TTL_MS;
    });
    return { sessions };
  } catch {
    return { sessions: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
}

function newBookingId(): string {
  return `flt_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
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
}): Promise<
  | {
      ok: true;
      booking: FlightBookingSession;
      payment: { iyzicoEnabled: boolean; whatsappBankLinkEnabled: boolean };
    }
  | { ok: false; errorCode: "search_failed" | "provider_travelpayouts" | "endpoint_disabled" }
> {
  const legs = encodeLegs(input.legs);
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
        details.errorCode === "provider_travelpayouts" ||
        details.errorCode === "endpoint_disabled"
          ? details.errorCode
          : "search_failed",
    };
  }

  const booking: FlightBookingSession = {
    id: newBookingId(),
    locale: input.locale || "ar",
    createdAt: new Date().toISOString(),
    itineraryId: input.itineraryId,
    legs,
    sessionId: input.sessionId,
    price: details.price,
    quotedClient: Number(input.quotedClient) || details.price.client,
    itinerary: details.itinerary,
    passengers: {
      adults: Math.max(1, Number(input.adults) || 1),
      children: Math.max(0, Number(input.children) || 0),
      infants: Math.max(0, Number(input.infants) || 0),
    },
    contact: {
      name: String(input.contact?.name || "").trim(),
      email: String(input.contact?.email || "").trim(),
      phone: String(input.contact?.phone || "").trim(),
    },
    travelers: Array.isArray(input.travelers) ? input.travelers : [],
    dummyPnr: "",
    ticketNumber: "PENDING",
    ticketIssued: false,
  };
  const refs = snapshotWithFlightRefs(booking.id, {
    dummy_pnr: booking.dummyPnr,
    ticket_number: booking.ticketNumber,
    ticket_issued: booking.ticketIssued,
  });
  booking.dummyPnr = String(refs.dummy_pnr || "");
  booking.ticketNumber = String(refs.ticket_number || "PENDING");

  const first = details.itinerary?.legs[0];
  const last = details.itinerary?.legs[details.itinerary.legs.length - 1];
  const route = [
    first?.origin.displayCode || first?.origin.skyId,
    last?.destination.displayCode || last?.destination.skyId,
  ]
    .filter(Boolean)
    .join(" → ");

  try {
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      const created = await pb.collection("enquiry_bookings").create<EnquiryBookingRecord>({
        type: "flight",
        status: "new",
        service_name: route || "Flight",
        destination: route,
        customer_name: booking.contact.name || "Guest",
        customer_email: booking.contact.email,
        customer_phone: booking.contact.phone,
        message: `itinerary ${input.itineraryId}`,
        ...(input.userId ? { user: input.userId } : {}),
        metadata: {
          engine: "sky_scrapper",
          locale: booking.locale || "ar",
          bookingId: booking.id,
          itineraryId: input.itineraryId,
          sessionId: input.sessionId || "",
          price: details.price,
          passengers: booking.passengers,
          fareChanged: Boolean(details.price.fareChanged),
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
  void notifyFlightBookingPlaced(booking).catch(() => undefined);
  return {
    ok: true,
    booking,
    payment: {
      iyzicoEnabled: payments.iyzicoEnabled,
      whatsappBankLinkEnabled: payments.whatsappBankLinkEnabled,
    },
  };
}

export async function getFlightBooking(id: string): Promise<FlightBookingSession | null> {
  const store = await readStore();
  return store.sessions.find((row) => row.id === id) || null;
}

export async function persistFlightSessionRefs(
  booking: FlightBookingSession
): Promise<FlightBookingSession> {
  const refs = snapshotWithFlightRefs(booking.id, {
    pnr: booking.pnr,
    dummy_pnr: booking.dummyPnr,
    ticket_number: booking.ticketNumber,
    ticket_issued: booking.ticketIssued,
  });
  const dummyPnr = String(refs.dummy_pnr || booking.dummyPnr || "");
  const ticketNumber = String(refs.ticket_number || booking.ticketNumber || "PENDING");
  if (booking.dummyPnr === dummyPnr && booking.ticketNumber === ticketNumber) return booking;
  const next = { ...booking, dummyPnr, ticketNumber };
  const store = await readStore();
  store.sessions = store.sessions.map((row) => (row.id === booking.id ? next : row));
  await writeStore(store);
  return next;
}
