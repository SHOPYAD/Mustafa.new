// src/app/api/transfers/ai-planner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateSmartTourProgram, generateItineraryHtml } from "@/lib/transfers/aiTourPlanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const city = body.city || "Istanbul";
    const hours = Number(body.hours) || 8;
    const vibe = body.vibe || "family";
    const language = body.language || "ar";

    const plan = generateSmartTourProgram({
      city,
      hours,
      vibe,
      language,
    });

    const htmlVoucher = generateItineraryHtml(plan, {
      bookingNumber: body.bookingNumber,
      guestName: body.guestName,
      date: body.date,
      vehiclePlate: body.vehiclePlate,
      driverName: body.driverName,
      driverPhone: body.driverPhone,
    });

    return NextResponse.json({
      ok: true,
      plan,
      htmlVoucher,
    });
  } catch (err: any) {
    console.error("[AITourPlanner Error]:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
