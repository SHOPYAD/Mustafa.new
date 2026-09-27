// src/app/api/transfers/driver/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json({ ok: false, message: "معرف الشريك مطلوب" }, { status: 400 });
    }

    const supplier = transferStore.getSupplierById(supplierId);
    if (!supplier) {
      return NextResponse.json({ ok: false, message: "لم يتم العثور على الشريك" }, { status: 404 });
    }

    const vehicles = transferStore.getSupplierVehicles(supplierId, undefined, true);
    const bookings = transferStore.getBookings({ supplierId });

    const ratingNumber =
      typeof supplier.rating === "object" && supplier.rating !== null
        ? Number((supplier.rating as any).avg ?? 5.0)
        : Number(supplier.rating || 5.0);

    return NextResponse.json({
      ok: true,
      profile: {
        id: supplier.id,
        legalName: supplier.legalName,
        tradeName: supplier.tradeName,
        email: supplier.contactEmail,
        phone: supplier.contactPhone,
        accountType: supplier.accountType,
        status: supplier.status || "active",
        commissionPct: supplier.commissionPct ?? 15,
        payoutDetails: supplier.payoutDetails,
        rating: isNaN(ratingNumber) ? 5.0 : ratingNumber,
        stats: {
          ...supplier.stats,
          totalVehicles: vehicles.length,
          totalBookings: bookings.length,
          activeTrips: bookings.filter((b) => ["assigned", "on_the_way", "arrived", "in_progress"].includes(b.status)).length,
        },
      },
      vehicles,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
