// src/app/api/transfers/driver/earnings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    const supplier = transferStore.getSupplierById(supplierId);
    const bookings = transferStore.getBookings({ supplierId });
    const completedBookings = bookings.filter((b) => b.status === "completed");

    let totalGrossRevenue = 0;
    let totalPlatformCommission = 0;
    let totalNetPayout = 0;

    for (const b of completedBookings) {
      const gross = b.pricing.total;
      const comm = b.pricing.commissionAmount || Math.round(gross * 0.15);
      const net = b.pricing.supplierNet || gross - comm;

      totalGrossRevenue += gross;
      totalPlatformCommission += comm;
      totalNetPayout += net;
    }

    return NextResponse.json({
      ok: true,
      supplier: supplier ? {
        id: supplier.id,
        tradeName: supplier.tradeName,
        commissionPct: supplier.commissionPct,
        settlementModel: supplier.settlementModel,
      } : null,
      stats: {
        totalTrips: bookings.length,
        completedTrips: completedBookings.length,
        totalGrossRevenue,
        totalPlatformCommission,
        totalNetPayout,
        currency: "USD",
      },
      payoutVouchers: supplier?.payoutVouchers || [],
      recentCompleted: completedBookings.slice(0, 10).map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        serviceType: b.serviceType,
        total: b.pricing.total,
        netPayout: b.pricing.supplierNet,
        completedAt: b.updatedAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
