// src/app/api/transfers/driver/telemetry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.driverId || body.lat === undefined || body.lng === undefined) {
      return NextResponse.json({ ok: false, error: "معرف السائق والإحداثيات مطلوبة" }, { status: 400 });
    }

    transferStore.updateTelemetry({
      driverId: body.driverId,
      vehicleId: body.vehicleId || "unknown",
      bookingId: body.bookingId,
      lat: Number(body.lat),
      lng: Number(body.lng),
      speed: body.speed !== undefined ? Number(body.speed) : undefined,
      heading: body.heading !== undefined ? Number(body.heading) : undefined,
      accuracy: body.accuracy !== undefined ? Number(body.accuracy) : undefined,
      batteryPct: body.batteryPct !== undefined ? Number(body.batteryPct) : undefined,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
