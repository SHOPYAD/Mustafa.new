import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { EnquiryBookingRecord, HotelBookingRecord } from "@/lib/pocketbase/records";
import { detectInvoiceService, isInvoiceService } from "@/lib/booking-service";
import { toGuestHotelBooking } from "@/lib/server/hotel-cancellations";
import { listFlightBookingsForUser } from "@/lib/server/flights-bookings";

function enquiryMeta(row: EnquiryBookingRecord): Record<string, unknown> {
  return row.metadata && typeof row.metadata === "object" ? row.metadata : {};
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(value: unknown): Date | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function loadAccountBookings(userId: string, filter?: string | null) {
  const pb = await tryCreateAdminPocketBase();
  const [hotels, enquiries, flights] = await Promise.all([
    pb
      ? pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
          filter: `user = "${userId}"`,
          sort: "-id",
        })
      : Promise.resolve([] as HotelBookingRecord[]),
    pb
      ? pb.collection("enquiry_bookings").getFullList<EnquiryBookingRecord>({
          filter: `user = "${userId}"`,
          sort: "-id",
        })
      : Promise.resolve([] as EnquiryBookingRecord[]),
    listFlightBookingsForUser(userId),
  ]);

  const hotelIds = new Set(hotels.map((row) => row.id));
  const itineraryIds = new Set(
    hotels
      .map((row) => {
        const snap = row.offer_snapshot && typeof row.offer_snapshot === "object" ? row.offer_snapshot : {};
        return String((snap as { itineraryId?: string }).itineraryId || "").trim();
      })
      .filter(Boolean)
  );

  const standalone = enquiries.filter((row) => {
    const meta = enquiryMeta(row);
    const linkedHotel = String(meta.hotel_booking_id || "").trim();
    if (linkedHotel && hotelIds.has(linkedHotel)) return false;
    const itinerary = String(meta.itineraryId || "").trim();
    if (itinerary && itineraryIds.has(itinerary)) return false;
    return true;
  });

  let hotelRows = hotels.map(toGuestHotelBooking);
  let enquiryRows = standalone.map((row) => ({
    id: row.id,
    type: row.type,
    service: isInvoiceService(String(row.type || "").toLowerCase())
      ? detectInvoiceService({ type: row.type })
      : "enquiry",
    service_name: row.service_name || "",
    destination: row.destination || "",
    status: row.status,
    created: row.created,
    startDate: String(enquiryMeta(row).startDate || enquiryMeta(row).date || row.created || ""),
  }));
  let flightRows = flights.map((row) => {
    const firstLeg = row.itinerary?.legs?.[0];
    const lastLeg = row.itinerary?.legs?.[row.itinerary.legs.length - 1];
    return {
      id: row.id,
      type: "flight",
      status: row.fulfilment?.status || "awaiting_payment",
      pnr: row.pnr || "",
      destination: lastLeg?.destination?.name || lastLeg?.destination?.displayCode || lastLeg?.destination?.city || "",
      origin: firstLeg?.origin?.name || firstLeg?.origin?.displayCode || firstLeg?.origin?.city || "",
      startDate: firstLeg?.departure || row.createdAt,
      price: row.quote?.clientTotal ?? row.quotedClient,
      currency: row.quote?.clientCurrency || row.price?.currency || "USD",
      createdAt: row.createdAt,
    };
  });

  if (filter === "upcoming") {
    const today = startOfToday();
    hotelRows = hotelRows.filter((row) => {
      const start = parseDate((row as { check_in?: string; checkIn?: string }).check_in || (row as { checkIn?: string }).checkIn);
      return start ? start >= today : true;
    });
    enquiryRows = enquiryRows.filter((row) => {
      const start = parseDate(row.startDate);
      return start ? start >= today : true;
    });
    flightRows = flightRows.filter((row) => {
      const start = parseDate(row.startDate);
      return start ? start >= today : true;
    });
  }

  return { hotels: hotelRows, enquiries: enquiryRows, flights: flightRows };
}
