import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: true, payments: [] });
  const hotels = await pb.collection("hotel_bookings").getFullList({
    filter: `user = "${auth.customer.id}"`,
    sort: "-id",
  });
  const payments = hotels.map((row) => ({
    id: row.id,
    title: row.hotel_name,
    amount: row.price,
    currency: row.currency,
    status: row.payment_status || row.status,
    date: row.created,
  }));
  return NextResponse.json({ ok: true, payments });
}
