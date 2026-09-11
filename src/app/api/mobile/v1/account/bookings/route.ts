import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: true, hotels: [], enquiries: [] });

  const userId = auth.customer.id;
  const [hotels, enquiries] = await Promise.all([
    pb.collection("hotel_bookings").getFullList({
      filter: `user = "${userId}"`,
      sort: "-id",
    }),
    pb.collection("enquiry_bookings").getFullList({
      filter: `user = "${userId}"`,
      sort: "-id",
    }),
  ]);

  return NextResponse.json({ ok: true, hotels, enquiries });
}
