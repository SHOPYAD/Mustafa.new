import { NextRequest, NextResponse } from "next/server";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";
import { runPublicHotelSearch } from "@/lib/server/hotels-search-runtime";

export const runtime = "nodejs";
export const maxDuration = 120;

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("hotel")) {
    return NextResponse.json({ ok: true, hotels: [], totalCount: 0, empty: true });
  }

  const q = req.nextUrl.searchParams;
  const checkIn = q.get("checkIn") || q.get("check_in") || isoDate(1);
  const checkOut = q.get("checkOut") || q.get("check_out") || isoDate(3);
  const result = await runPublicHotelSearch({
    query: q.get("query") || q.get("q") || "Istanbul",
    destId: q.get("destId") || undefined,
    checkIn,
    checkOut,
    adults: Number(q.get("adults") || 2),
    rooms: Number(q.get("rooms") || 1),
    childrenAges: q.get("childrenAges") || undefined,
    lang: q.get("lang") || "ar",
    currency: (q.get("currency") || "USD").toUpperCase(),
    page: Number(q.get("page") || 0),
    sid: q.get("sid") || undefined,
  });

  return NextResponse.json({
    ok: true,
    hotels: result.hotels,
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize,
    hasMore: result.hasMore,
    sid: result.sid,
    checkIn,
    checkOut,
    progress: result.progress,
  });
}
