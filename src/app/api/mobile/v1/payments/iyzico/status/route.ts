import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const bookingId = req.nextUrl.searchParams.get("bookingId") || "";
  if (!bookingId) {
    return NextResponse.json({ ok: false, error: "booking_required" }, { status: 400 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });

  try {
    const hotel = await pb.collection("hotel_bookings").getOne(bookingId);
    if (hotel.user && hotel.user !== auth.customer.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({
      ok: true,
      bookingId,
      status: hotel.status,
      paymentStatus: hotel.payment_status || hotel.status,
      paid: hotel.status === "paid" || hotel.payment_status === "paid",
    });
  } catch {
    try {
      const enquiry = await pb.collection("enquiry_bookings").getOne(bookingId);
      if (enquiry.user && enquiry.user !== auth.customer.id) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }
      return NextResponse.json({
        ok: true,
        bookingId,
        status: enquiry.status,
        paymentStatus: enquiry.status,
        paid: enquiry.status === "paid",
      });
    } catch {
      const { getFlightBooking } = await import("@/lib/server/flights-bookings");
      const flight = await getFlightBooking(bookingId);
      if (!flight) return NextResponse.json({ ok: false, error: "booking_not_found" }, { status: 404 });
      if (flight.userId && flight.userId !== auth.customer.id) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
      }
      const status = String((flight as any).status || (flight as any).paymentStatus || "pending");
      return NextResponse.json({
        ok: true,
        bookingId,
        status,
        paymentStatus: status,
        paid: status === "paid",
      });
    }
  }
}
