import { NextRequest, NextResponse } from "next/server";
import { createHotelQuote, toPublicQuote } from "@/lib/server/hotels/quote-service";
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

  const result = await createHotelQuote({
    rateId: body.rateId ? String(body.rateId) : undefined,
    hotelId: body.hotelId ? String(body.hotelId) : undefined,
    supplierToken: body.supplierToken ? String(body.supplierToken) : undefined,
    checkIn: body.checkIn ? String(body.checkIn) : undefined,
    checkOut: body.checkOut ? String(body.checkOut) : undefined,
    adults: body.adults != null ? Number(body.adults) : undefined,
    rooms: body.rooms != null ? Number(body.rooms) : undefined,
    currency: body.currency ? String(body.currency) : undefined,
    sessionId: body.sessionId ? String(body.sessionId) : undefined,
    userId: auth.customer.id,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.code }, { status: 409 });
  }
  return NextResponse.json({ ok: true, quote: toPublicQuote(result.quote) });
}
