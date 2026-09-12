import { NextRequest, NextResponse } from "next/server";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";
import { loadAccountBookings } from "@/lib/server/account-bookings-view";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;
  const filter = req.nextUrl.searchParams.get("filter");
  const data = await loadAccountBookings(auth.customer.id, filter);
  return NextResponse.json({ ok: true, ...data });
}
