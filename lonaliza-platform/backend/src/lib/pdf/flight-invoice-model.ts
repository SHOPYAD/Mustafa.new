import { getAirportsIndex, localeOfAirport, type StoredAirport } from "@/lib/server/airports-db";
import { lookupAirline } from "@/lib/server/airlines-db";
import { kiwiAirlineLogoUrl } from "@/lib/airline-logos";
import { persistHotelFlightRefsById } from "@/lib/server/flight-booking-refs";
import { resolveFlightBookingRefs, snapshotWithFlightRefs } from "@/lib/pdf/flight-booking-refs";
import { formatInvoiceDate, formatInvoiceTime } from "@/lib/pdf/invoice-format";
import type { FlightBookingSession } from "@/lib/server/flights-bookings";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";
import type { InvoiceLanguage } from "@/types/invoice-template";
import {
  confirmViewToInvoiceModel,
  type ServiceInvoiceLeg,
  type ServiceInvoiceModel,
  type ServiceInvoicePassenger,
} from "@/lib/pdf/service-invoice-html";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function snapStr(row: Record<string, unknown>, key: string, fallback = ""): string {
  return row[key] != null && String(row[key]).trim() ? String(row[key]).trim() : fallback;
}

function snapNum(row: Record<string, unknown>, key: string): number {
  const n = Number(row[key]);
  return Number.isFinite(n) ? n : 0;
}

function airportNameOf(row: StoredAirport, language: InvoiceLanguage): { name: string; city: string } {
  switch (language) {
    case "ar":
      return { name: row.nameAr || row.nameEn, city: row.cityAr || row.cityEn };
    case "tr":
      return { name: row.nameTr || row.nameEn, city: row.cityTr || row.cityEn };
    case "en":
    case "fr":
    default:
      return { name: row.nameEn, city: row.cityEn };
  }
}

function parseRouteCodes(route: string): { origin: string; destination: string } | null {
  const match = String(route || "").match(/([A-Za-z]{3})\s*(?:→|->|—|-)\s*([A-Za-z]{3})/);
  if (!match) return null;
  return { origin: match[1].toUpperCase(), destination: match[2].toUpperCase() };
}

function parsePassenger(raw: string): ServiceInvoicePassenger {
  const parts = String(raw || "")
    .split(/\s*[·•|]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { name: parts[0], document: parts.slice(1).join(" · ") };
  }
  return { name: String(raw || "").trim(), document: "" };
}

function inferTripType(
  snap: Record<string, unknown>,
  legs: ServiceInvoiceLeg[]
): ServiceInvoiceModel["tripType"] {
  const raw = snapStr(snap, "tripType") || snapStr(snap, "trip_type");
  if (raw === "one-way" || raw === "round-trip" || raw === "multi-city") return raw;
  if (snapStr(snap, "returnDate")) return "round-trip";
  const directions = new Set(legs.map((leg) => leg.direction).filter(Boolean));
  if (directions.has("return")) return "round-trip";
  return legs.length > 2 ? "multi-city" : "one-way";
}

function splitFarePackage(fareClass: string): { airline: string; fare: string } {
  const parts = fareClass.split(/\s*[·•|]\s*/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return { airline: parts[0], fare: parts.slice(1).join(" · ") };
  return { airline: "", fare: fareClass };
}

function combineStamp(timeOrIso: string, fallbackDate: string): string {
  const time = String(timeOrIso || "").trim();
  const day = String(fallbackDate || "").match(/\d{4}-\d{2}-\d{2}/)?.[0] || "";
  if (/^\d{1,2}:\d{2}$/.test(time) && day) return `${day}T${time}:00`;
  return time || fallbackDate;
}

function durationBetween(departure: string, arrival: string): number {
  const start = Date.parse(departure);
  const end = Date.parse(arrival);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

function mapSnapLeg(item: unknown, fallbackDate: string): ServiceInvoiceLeg {
  const row = asRecord(item);
  const origin = snapStr(row, "origin");
  const destination = snapStr(row, "destination");
  const departure = combineStamp(snapStr(row, "departure"), fallbackDate);
  const arrival = combineStamp(snapStr(row, "arrival"), fallbackDate);
  const layoverRaw = asRecord(row.layover);
  const directionRaw = snapStr(row, "direction");
  const direction =
    directionRaw === "return" || directionRaw === "outbound" ? directionRaw : undefined;
  return {
    origin,
    destination,
    departure,
    arrival,
    flightNumber: snapStr(row, "flightNumber") || snapStr(row, "flight_number"),
    airline: snapStr(row, "airline"),
    airlineCode: snapStr(row, "airlineCode") || snapStr(row, "airline_code"),
    airlineLogo: snapStr(row, "airlineLogo") || snapStr(row, "airline_logo"),
    aircraft: snapStr(row, "aircraft"),
    originName: snapStr(row, "originName") || snapStr(row, "origin_name"),
    originCity: snapStr(row, "originCity") || snapStr(row, "origin_city"),
    originTerminal: snapStr(row, "originTerminal") || snapStr(row, "origin_terminal"),
    destinationName: snapStr(row, "destinationName") || snapStr(row, "destination_name"),
    destinationCity: snapStr(row, "destinationCity") || snapStr(row, "destination_city"),
    destinationTerminal: snapStr(row, "destinationTerminal") || snapStr(row, "destination_terminal"),
    durationMinutes: snapNum(row, "durationMinutes") || snapNum(row, "duration_minutes") || durationBetween(departure, arrival),
    direction,
    layover: snapStr(layoverRaw, "airport") || snapStr(layoverRaw, "city")
      ? {
          airport: snapStr(layoverRaw, "airport"),
          city: snapStr(layoverRaw, "city"),
          durationMinutes: snapNum(layoverRaw, "durationMinutes") || snapNum(layoverRaw, "duration_minutes"),
        }
      : undefined,
  };
}

function synthesizeLegs(snap: Record<string, unknown>, fallbackDate: string): ServiceInvoiceLeg[] {
  const raw = Array.isArray(snap.legs) ? snap.legs : [];
  const mapped = raw.map((item) => mapSnapLeg(item, fallbackDate)).filter((leg) => leg.origin || leg.destination);
  if (mapped.length) return mapped;
  const parsed = parseRouteCodes(snapStr(snap, "route"));
  if (!parsed) return [];
  const fare = splitFarePackage(snapStr(snap, "fareClass"));
  return [
    {
      origin: parsed.origin,
      destination: parsed.destination,
      departure: fallbackDate,
      arrival: "",
      flightNumber: snapStr(snap, "flightNumbers").split(/[·,]/)[0]?.trim() || "",
      airline: fare.airline,
    },
  ];
}

function formatLegTimes(leg: ServiceInvoiceLeg, language: InvoiceLanguage): ServiceInvoiceLeg {
  return {
    ...leg,
    departureDate: formatInvoiceDate(leg.departure, language),
    departureTime: formatInvoiceTime(leg.departure),
    arrivalDate: formatInvoiceDate(leg.arrival, language),
    arrivalTime: formatInvoiceTime(leg.arrival),
  };
}

export function applyFlightFieldsFromSnapshot(
  model: ServiceInvoiceModel,
  snap: Record<string, unknown>,
  language: InvoiceLanguage
): ServiceInvoiceModel {
  const refs = resolveFlightBookingRefs(model.id, snap);
  const legs = synthesizeLegs(snap, snapStr(snap, "departDate")).map((leg) => formatLegTimes(leg, language));
  const extrasRaw = Array.isArray(snap.extrasPackages)
    ? snap.extrasPackages
    : Array.isArray(snap.extras)
      ? snap.extras
      : [];
  const extras = extrasRaw
    .map((item) => {
      const row = asRecord(item);
      return {
        key: snapStr(row, "title") || snapStr(row, "key") || snapStr(row, "label") || snapStr(row, "id"),
        amount: snapNum(row, "amount"),
      };
    })
    .filter((row) => row.key && row.amount);
  const extrasTotal = snapNum(snap, "extrasTotal") || extras.reduce((sum, row) => sum + row.amount, 0);
  const fareSplit = splitFarePackage(model.fareClass || "");
  const passengers = (model.guestNames || []).map(parsePassenger);
  const route =
    legs.length > 0
      ? `${legs[0].origin} → ${legs[legs.length - 1].destination}`
      : model.route && !/00:00:00/.test(model.route)
        ? model.route
        : "";

  return {
    ...model,
    route,
    departDate: formatInvoiceDate(snapStr(snap, "departDate") || model.departDate || "", language),
    returnDate: formatInvoiceDate(snapStr(snap, "returnDate") || model.returnDate || "", language),
    fareClass: fareSplit.fare || model.fareClass,
    cabinBaggage: snapStr(snap, "cabinBaggage") || snapStr(snap, "cabin_baggage"),
    checkedBaggage: snapStr(snap, "checkedBaggage") || snapStr(snap, "checked_baggage") || model.baggage || "",
    baggage: snapStr(snap, "baggage") || model.baggage,
    extrasTotal: extrasTotal || undefined,
    extras: extras.length ? extras : undefined,
    tripType: inferTripType(snap, legs),
    pnr: refs.pnr,
    pnrIsDummy: refs.pnrIsDummy,
    ticketNumber: refs.ticketNumber,
    ticketIssued: refs.ticketIssued,
    issuanceNotice: !refs.ticketIssued,
    passengers,
    legs,
  };
}

export async function enrichFlightInvoiceModel(
  model: ServiceInvoiceModel,
  language: InvoiceLanguage
): Promise<ServiceInvoiceModel> {
  if (model.service !== "flight") return model;
  const idx = await getAirportsIndex();
  const loc = localeOfAirport(language);

  const fillPlace = (
    code: string,
    name: string,
    city: string
  ): { name: string; city: string } => {
    if (name && city) return { name, city };
    const airport = idx.byIata.get(code.toUpperCase()) || idx.byIata.get(code);
    if (!airport) return { name, city };
    const labeled = airportNameOf(airport, loc);
    return { name: name || labeled.name, city: city || labeled.city };
  };

  const legs = await Promise.all(
    (model.legs || []).map(async (leg) => {
      const origin = fillPlace(leg.origin, leg.originName || "", leg.originCity || "");
      const dest = fillPlace(leg.destination, leg.destinationName || "", leg.destinationCity || "");
      const airline = await lookupAirline(leg.airlineCode, leg.airline);
      const code = airline?.iata || leg.airlineCode || "";
      return formatLegTimes(
        {
          ...leg,
          originName: origin.name,
          originCity: origin.city,
          destinationName: dest.name,
          destinationCity: dest.city,
          airline: airline?.name || leg.airline,
          airlineCode: code,
          airlineLogo: leg.airlineLogo || airline?.logoUrl || kiwiAirlineLogoUrl(code),
        },
        language
      );
    })
  );

  return {
    ...model,
    legs,
    departDate: formatInvoiceDate(model.departDate || legs[0]?.departure || "", language) || model.departDate,
    returnDate: formatInvoiceDate(model.returnDate || "", language) || model.returnDate,
  };
}

export async function buildInvoiceModelFromConfirmView(
  booking: HotelBookingConfirmView,
  extras: Pick<
    ServiceInvoiceModel,
    "brandNameAr" | "brandNameEn" | "logoDataUri" | "fontDataUri" | "phone" | "email" | "address" | "siteUrl"
  >,
  language: InvoiceLanguage
): Promise<ServiceInvoiceModel> {
  let snap = booking.snapshot;
  if (booking.service === "flight") {
    snap = (await persistHotelFlightRefsById(booking.id)) || snapshotWithFlightRefs(booking.id, snap);
    if (!String(snap.departDate || "").trim() && booking.check_in) {
      snap = { ...snap, departDate: booking.check_in };
    }
  }
  const view = { ...booking, snapshot: snap };
  const base = confirmViewToInvoiceModel(view, extras);
  if (base.service !== "flight") return base;
  const withFlight = applyFlightFieldsFromSnapshot(base, snap, language);
  return enrichFlightInvoiceModel(withFlight, language);
}

export function flightSessionToInvoiceModel(
  booking: FlightBookingSession,
  extras: Pick<
    ServiceInvoiceModel,
    "brandNameAr" | "brandNameEn" | "logoDataUri" | "fontDataUri" | "phone" | "email" | "address" | "siteUrl"
  >
): ServiceInvoiceModel {
  const first = booking.itinerary?.legs[0];
  const last = booking.itinerary?.legs[(booking.itinerary?.legs.length || 1) - 1];
  const refs = resolveFlightBookingRefs(booking.id, {
    pnr: booking.pnr,
    dummy_pnr: booking.dummyPnr,
    ticket_number: booking.ticketNumber,
    ticket_issued: booking.ticketIssued,
  });
  const legs: ServiceInvoiceLeg[] = (booking.itinerary?.legs || []).flatMap((leg, legIndex) => {
    const segs = leg.segments.length ? leg.segments : [null];
    return segs.map((seg) => ({
      origin: String(seg?.origin?.displayCode || leg.origin.displayCode || ""),
      destination: String(seg?.destination?.displayCode || leg.destination.displayCode || ""),
      originName: String(seg?.origin?.name || leg.origin.name || ""),
      originCity: String(seg?.origin?.city || leg.origin.city || ""),
      destinationName: String(seg?.destination?.name || leg.destination.name || ""),
      destinationCity: String(seg?.destination?.city || leg.destination.city || ""),
      departure: String(seg?.departure || leg.departure || ""),
      arrival: String(seg?.arrival || leg.arrival || ""),
      flightNumber: String(seg?.flightNumber || ""),
      airline: String(seg?.airline || ""),
      airlineCode: String(seg?.airlineCode || ""),
      airlineLogo: String(seg?.airlineLogo || ""),
      aircraft: String(seg?.aircraft || ""),
      durationMinutes: Number(seg?.durationMinutes || (segs.length === 1 ? leg.durationMinutes : 0)) || undefined,
      direction: booking.itinerary && booking.itinerary.legs.length > 1 && legIndex > 0 ? "return" : "outbound",
    }));
  });
  const guests = booking.travelers.map((row) => {
    const rec = asRecord(row);
    return {
      name: [snapStr(rec, "firstName"), snapStr(rec, "lastName")].filter(Boolean).join(" "),
      document: snapStr(rec, "passportNumber"),
    };
  });
  return {
    ...extras,
    service: "flight",
    id: booking.id,
    issuedAt: booking.createdAt.slice(0, 10),
    customerName: booking.contact.name,
    customerEmail: booking.contact.email,
    customerPhone: booking.contact.phone,
    guestNames: guests.map((row) => [row.name, row.document].filter(Boolean).join(" · ")),
    passengers: guests,
    currency: booking.price.currency || "USD",
    total: booking.price.client,
    baseFare: booking.price.base,
    taxes: booking.price.taxes,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "whatsapp",
    route: [first?.origin.displayCode, last?.destination.displayCode].filter(Boolean).join(" → "),
    departDate: first?.departure || "",
    flightNumbers: legs.map((leg) => leg.flightNumber).filter(Boolean).join(" · "),
    tripType: (booking.itinerary?.legs.length || 0) > 1 ? "round-trip" : "one-way",
    pnr: refs.pnr,
    pnrIsDummy: refs.pnrIsDummy,
    ticketNumber: refs.ticketNumber,
    ticketIssued: refs.ticketIssued,
    issuanceNotice: !refs.ticketIssued,
    legs,
  };
}

