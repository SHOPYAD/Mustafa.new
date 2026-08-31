import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import type { EnquiryBookingRecord, HotelBookingRecord } from "@/lib/pocketbase/records";
import { detectInvoiceService, isInvoiceService } from "@/lib/booking-service";
import { toGuestHotelBooking } from "@/lib/server/hotel-cancellations";

export const runtime = "nodejs";

function enquiryMeta(row: EnquiryBookingRecord): Record<string, unknown> {
  return row.metadata && typeof row.metadata === "object" ? row.metadata : {};
}

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: true, hotels: [], enquiries: [] });
  }
  const [hotels, enquiries] = await Promise.all([
    pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
      filter: `user = "${user.id}"`,
      sort: "-id",
    }),
    pb.collection("enquiry_bookings").getFullList<EnquiryBookingRecord>({
      filter: `user = "${user.id}"`,
      sort: "-id",
    }),
  ]);

  const hotelIds = new Set(hotels.map((row) => row.id));
  const itineraryIds = new Set(
    hotels.map((row) => {
      const snap = row.offer_snapshot && typeof row.offer_snapshot === "object" ? row.offer_snapshot : {};
      return String(snap.itineraryId || "").trim();
    }).filter(Boolean)
  );

  const standalone = enquiries.filter((row) => {
    const meta = enquiryMeta(row);
    const linkedHotel = String(meta.hotel_booking_id || "").trim();
    if (linkedHotel && hotelIds.has(linkedHotel)) return false;
    const itinerary = String(meta.itineraryId || "").trim();
    if (itinerary && itineraryIds.has(itinerary)) return false;
    return true;
  });

  return NextResponse.json({
    ok: true,
    hotels: hotels.map(toGuestHotelBooking),
    enquiries: standalone.map((row) => ({
      id: row.id,
      type: row.type,
      service: isInvoiceService(String(row.type || "").toLowerCase())
        ? detectInvoiceService({ type: row.type })
        : "enquiry",
      service_name: row.service_name || "",
      destination: row.destination || "",
      status: row.status,
      created: row.created,
    })),
  });
}
