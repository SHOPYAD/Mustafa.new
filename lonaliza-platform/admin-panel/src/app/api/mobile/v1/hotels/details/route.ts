import { NextRequest, NextResponse } from "next/server";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";
import { buildHotelDetails } from "@/lib/server/hotels/details-service";

export const runtime = "nodejs";
export const maxDuration = 60;

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("hotel")) {
    return NextResponse.json({ ok: true, hotel: null, rooms: [], empty: true });
  }

  const q = req.nextUrl.searchParams;
  const id = q.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "hotel_required" }, { status: 400 });

  const payload = await buildHotelDetails({
    id,
    sessionId: q.get("sid") || q.get("sessionId") || undefined,
    checkIn: q.get("checkIn") || isoDate(1),
    checkOut: q.get("checkOut") || isoDate(3),
    adults: Number(q.get("adults") || 2),
    rooms: Number(q.get("rooms") || 1),
    childrenAges: (q.get("childrenAges") || "")
      .split(",")
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n)),
    currency: q.get("currency") || "USD",
    lang: q.get("lang") || "ar",
  });

  if (!payload) {
    return NextResponse.json({ ok: false, error: "not_found", rooms: [] }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    hotel: payload.hotel,
    rooms: payload.rooms,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    nights: payload.nights,
  });
}
