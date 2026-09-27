// src/app/api/transfers/driver/bookings/[id]/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { driverId, vehicleId, supplierId } = body;

    if (!driverId && !vehicleId) {
      return NextResponse.json({ ok: false, error: "يرجى تحديد السائق أو المركبة" }, { status: 400 });
    }

    const updated = transferStore.assignDriver(id, driverId, vehicleId);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "الحجز غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      booking: updated,
      message: "تم تعيين السائق والمركبة للرحلة بنجاح",
    });
  } catch (err: any) {
    console.error("Assign booking error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
