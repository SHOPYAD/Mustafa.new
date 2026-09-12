import { NextRequest, NextResponse } from "next/server";
import { BOOKING_DETAIL_TTL_MS, readBookingCache, writeBookingCache } from "@/lib/server/booking-disk-cache";
import { getHotelPhotos, parseHotelPhotosPayload } from "@/lib/server/hotel-rooms-provider";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hotelId = (new URL(req.url).searchParams.get("id") || "").trim();
  if (!hotelId) {
    return NextResponse.json({ ok: false, photos: [], error: "Missing hotel id" }, { status: 400 });
  }
  const cacheKey = `photos-${hotelId}`;
  const cached = await readBookingCache<string[]>(cacheKey, BOOKING_DETAIL_TTL_MS);
  if (cached?.length) {
    return NextResponse.json({ ok: true, photos: cached, cached: true });
  }
  const fetched = await getHotelPhotos({ hotelId, timeoutMs: 6500 });
  if (!fetched.ok) {
    return NextResponse.json({ ok: true, photos: [], cached: false });
  }
  const photos = parseHotelPhotosPayload(fetched.payload);
  if (photos.length) await writeBookingCache(cacheKey, photos);
  return NextResponse.json({ ok: true, photos, cached: false });
}
