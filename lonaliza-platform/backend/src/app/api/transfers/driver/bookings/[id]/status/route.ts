// src/app/api/transfers/driver/bookings/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";
import type { TransferTripStatus } from "@/lib/transfers/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const status = body.status as TransferTripStatus;
    const reason = body.reason;

    if (!status) {
      return NextResponse.json({ ok: false, error: "الحالة الجديدة مطلوبة" }, { status: 400 });
    }

    const updated = transferStore.updateBookingStatus(id, status, reason);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "الحجز غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: `تم تحديث حالة الرحلة إلى: ${status}`,
      booking: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
