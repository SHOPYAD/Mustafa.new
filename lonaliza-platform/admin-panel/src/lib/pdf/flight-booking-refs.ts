import { createHash } from "crypto";

const PNR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const REAL_PNR_KEYS = [
  "pnr",
  "provider_pnr",
  "airline_pnr",
  "booking_pnr",
  "record_locator",
  "locator",
  "pnrCode",
  "pnr_code",
] as const;

const TICKET_KEYS = ["ticket_number", "ticketNumber", "e_ticket", "eticket", "ticket"] as const;

export type FlightBookingRefs = {
  pnr: string;
  pnrIsDummy: boolean;
  ticketNumber: string;
  ticketIssued: boolean;
};

function snapStr(snap: Record<string, unknown>, key: string): string {
  const value = snap[key];
  return value != null && String(value).trim() ? String(value).trim() : "";
}

export function dummyPnrFromId(bookingId: string): string {
  const hash = createHash("sha1").update(`alrayyan-booking-ref:${bookingId}`).digest();
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += PNR_ALPHABET[hash[i] % PNR_ALPHABET.length];
  }
  return out;
}

export function placeholderTicketFromId(bookingId: string): string {
  const hash = createHash("sha1").update(`alrayyan-ticket:${bookingId}`).digest("hex");
  return `TKT-${hash.slice(0, 4).toUpperCase()}`;
}

export function readRealPnr(snap: Record<string, unknown>): string {
  for (const key of REAL_PNR_KEYS) {
    const value = snapStr(snap, key);
    if (value) return value.toUpperCase();
  }
  return "";
}

export function isPlaceholderTicket(value: string): boolean {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return true;
  if (raw === "PENDING") return true;
  if (raw.startsWith("TKT-")) return true;
  return false;
}

export function readTicketNumber(snap: Record<string, unknown>): string {
  for (const key of TICKET_KEYS) {
    const value = snapStr(snap, key);
    if (value) return value;
  }
  return "";
}

export function resolveFlightBookingRefs(
  bookingId: string,
  snap: Record<string, unknown> = {}
): FlightBookingRefs {
  // Never invent a locator: without a supplier PNR the booking is shown with its own reference only.
  void bookingId;
  const realPnr = readRealPnr(snap);
  const ticket = readTicketNumber(snap);
  const issued = Boolean(snap.ticket_issued) || (Boolean(ticket) && !isPlaceholderTicket(ticket));
  return {
    pnr: realPnr,
    pnrIsDummy: !realPnr,
    ticketNumber: issued ? ticket : ticket && !isPlaceholderTicket(ticket) ? ticket : "PENDING",
    ticketIssued: issued,
  };
}

export function snapshotWithFlightRefs(
  bookingId: string,
  snap: Record<string, unknown>
): Record<string, unknown> {
  void resolveFlightBookingRefs(bookingId, snap);
  const next = { ...snap };
  if (!readTicketNumber(next)) {
    next.ticket_number = "PENDING";
  }
  return next;
}
