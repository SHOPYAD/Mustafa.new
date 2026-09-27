import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getHotelQuote, quoteIsUsable, updateHotelQuote } from "@/lib/server/hotels/quote-service";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const quoteId = String(body.quoteId || body.quote_id || "").trim();
  if (!quoteId) {
    return NextResponse.json({ ok: false, error: "quote_required" }, { status: 400 });
  }

  const quote = await getHotelQuote(quoteId);
  if (!quote) return NextResponse.json({ ok: false, error: "quote_not_found" }, { status: 404 });
  if (quote.user && quote.user !== auth.customer.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const usable = quoteIsUsable(quote);
  if (!usable.ok) {
    return NextResponse.json({ ok: false, error: `quote_${usable.reason}` }, { status: 409 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });

  const row = await pb.collection("hotel_bookings").create({
    user: auth.customer.id,
    hotel_id: quote.hotelId,
    hotel_name: quote.hotelName,
    hotel_slug: quote.hotelId,
    room_id: quote.id,
    room_name: quote.roomName,
    check_in: quote.checkIn,
    check_out: quote.checkOut,
    adults: quote.adults,
    children: quote.childrenAges.length,
    customer_name: auth.customer.name,
    customer_email: auth.customer.email,
    price: quote.sellingTotal,
    currency: quote.currency,
    provider: quote.supplier,
    status: "pending_payment",
    offer_snapshot: {
      quote_id: quote.id,
      supplier: quote.supplier,
      fulfilment_status: "awaiting_payment",
      source: "mobile",
    },
  });

  try {
    await updateHotelQuote(quote.id, { bookingId: row.id });
  } catch {
    /* quote row is optional after persist */
  }

  return NextResponse.json({
    ok: true,
    bookingId: row.id,
    price: quote.sellingTotal,
    currency: quote.currency,
  });
}
