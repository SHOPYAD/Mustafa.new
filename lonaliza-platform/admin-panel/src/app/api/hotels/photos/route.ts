import { NextRequest, NextResponse } from "next/server";
import { BOOKING_DETAIL_TTL_MS, readBookingCache, writeBookingCache } from "@/lib/server/booking-disk-cache";
import { getHotelPhotos, parseHotelPhotosPayload } from "@/lib/server/hotel-rooms-provider";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hotelId = (new URL(req.url).searchParams.get("id") || "").trim();
  if (!hotelId) {
    return NextResponse.json({ ok: false, photos: [], error: "Missing hotel id" }, { status: 400 });
  }
  if (!/^\d+$/.test(hotelId) && !hotelId.startsWith("hb_")) {
    return NextResponse.json({ ok: true, photos: [], cached: false });
  }
  const cacheKey = `photos-${hotelId}`;
  const cached = await readBookingCache<string[]>(cacheKey, BOOKING_DETAIL_TTL_MS);
  if (cached?.length) {
    return NextResponse.json({ ok: true, photos: cached, cached: true });
  }

  if (hotelId.startsWith("hb_")) {
    try {
      const { hotelbedsContentRequest } = await import("@/lib/providers/adapters/hotelbeds/hotelbedsClient");
      const cleanCode = hotelId.replace(/^hb_/, "");
      const hbRes = await hotelbedsContentRequest<any>(`/hotels/${cleanCode}/details?language=ENG&fields=images`, { timeoutMs: 5000 });
      const imgItems = hbRes.ok && Array.isArray(hbRes.data?.hotel?.images) ? hbRes.data.hotel.images : [];
      const photos = imgItems
        .map((img: any) => (img.path ? `https://photos.hotelbeds.com/giata/bigger/${img.path}` : null))
        .filter(Boolean) as string[];
      if (photos.length) {
        await writeBookingCache(cacheKey, photos);
        return NextResponse.json({ ok: true, photos, cached: false });
      }
    } catch {
      // fallback
    }
  }

  const fetched = await getHotelPhotos({ hotelId, timeoutMs: 6500 });
  if (!fetched.ok) {
    return NextResponse.json({ ok: true, photos: [], cached: false });
  }
  const photos = parseHotelPhotosPayload(fetched.payload);
  if (photos.length) await writeBookingCache(cacheKey, photos);
  return NextResponse.json({ ok: true, photos, cached: false });
}
