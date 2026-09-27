import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getB2BBookings } from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || undefined;
  const bookingType = (searchParams.get("type") as "flight" | "hotel" | "transfer") || undefined;
  const status = searchParams.get("status") || undefined;

  const bookings = await getB2BBookings({
    companyId,
    bookingType,
    status,
  });

  const totalVolume = bookings.reduce((sum, b) => sum + b.totalCharged, 0);
  const totalMarkup = bookings.reduce((sum, b) => sum + b.platformMarkup, 0);
  const totalSupplierCost = bookings.reduce((sum, b) => sum + b.supplierCost, 0);

  return NextResponse.json({
    ok: true,
    bookings,
    metrics: {
      totalBookings: bookings.length,
      totalVolume,
      totalMarkup,
      totalSupplierCost,
    },
  });
}
