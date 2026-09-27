import { NextRequest, NextResponse } from "next/server";
import { getOrFetchGuestReviews } from "@/lib/server/hotels/guest-reviews-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingHotelId = (searchParams.get("bookingHotelId") || "").trim();
  const hotelId = (searchParams.get("hotelId") || "").trim();
  const masterId = (searchParams.get("masterId") || "").trim();
  const name = (searchParams.get("name") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  const lat = Number(searchParams.get("lat") || "");
  const lng = Number(searchParams.get("lng") || "");
  const lang = searchParams.get("lang")?.trim() || "";
  const refresh = searchParams.get("refresh") === "true" || searchParams.get("force") === "true";

  if (!hotelId && !masterId && !name && !bookingHotelId) {
    return NextResponse.json({ ok: false, reviews: [], error: "Missing hotel id" }, { status: 400 });
  }

  const result = await getOrFetchGuestReviews({
    hotelId,
    bookingHotelId,
    masterId,
    name,
    city,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    lang,
    forceRefresh: refresh,
  });
  return NextResponse.json({
    ok: true,
    reviews: result.reviews,
    bookingHotelId: result.bookingHotelId,
    taHotelId: result.taHotelId,
    reviewScore: result.reviewScore || null,
    reviewScores: result.reviewScores,
    cached: result.cached,
  });
}
