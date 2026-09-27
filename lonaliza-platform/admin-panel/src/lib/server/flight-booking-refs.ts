import { detectInvoiceService } from "@/lib/booking-service";
import { snapshotWithFlightRefs } from "@/lib/pdf/flight-booking-refs";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";

function snapshotOf(booking: HotelBookingRecord): Record<string, unknown> {
  return booking.offer_snapshot && typeof booking.offer_snapshot === "object"
    ? { ...booking.offer_snapshot }
    : {};
}

export async function persistHotelFlightRefs(booking: HotelBookingRecord): Promise<Record<string, unknown>> {
  const snap = snapshotOf(booking);
  const service = detectInvoiceService({
    provider: booking.provider,
    hotel_id: booking.hotel_id,
    offer_snapshot: snap,
  });
  if (service !== "flight") return snap;
  const next = snapshotWithFlightRefs(booking.id, snap);
  const changed =
    String(next.dummy_pnr || "") !== String(snap.dummy_pnr || "") ||
    String(next.ticket_number || "") !== String(snap.ticket_number || "");
  if (!changed) return next;
  try {
    const pb = await tryCreateAdminPocketBase();
    if (!pb) return next;
    await pb.collection("hotel_bookings").update(booking.id, { offer_snapshot: next });
  } catch {
    /* invoice still uses in-memory refs */
  }
  return next;
}

export async function persistHotelFlightRefsById(bookingId: string): Promise<Record<string, unknown> | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    return persistHotelFlightRefs(booking);
  } catch {
    return null;
  }
}
