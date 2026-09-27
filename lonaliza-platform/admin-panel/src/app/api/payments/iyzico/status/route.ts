import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });

  const bookingId = req.nextUrl.searchParams.get("bookingId") || "";
  if (!bookingId) return NextResponse.json({ ok: false, error: "booking_required" }, { status: 400 });

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });

  try {
    const hotel = await pb.collection("hotel_bookings").getOne(bookingId);
    if (hotel.user && hotel.user !== user.id) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    const status = String(hotel.status || "");
    const paymentStatus = String(hotel.payment_status || hotel.status || "pending_payment");
    const paid = status === "paid" && paymentStatus.toLowerCase() === "paid";
    return NextResponse.json({
      ok: true,
      bookingId,
      status,
      paymentStatus,
      paid,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      bookingId,
      status: "pending_payment",
      paymentStatus: "pending_payment",
      paid: false,
    });
  }
}
