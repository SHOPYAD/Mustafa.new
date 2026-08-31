import { NextRequest, NextResponse } from "next/server";
import { fetchHotelReviewsPage } from "@/lib/server/hotel-rooms-provider";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelId = (searchParams.get("bookingHotelId") || searchParams.get("hotelId") || "").trim();
  const page = Number(searchParams.get("page") || 2);
  const lang = searchParams.get("lang")?.trim() || "";
  if (!hotelId) {
    return NextResponse.json({ ok: false, reviews: [], error: "Missing hotel id" }, { status: 400 });
  }
  const reviews = await fetchHotelReviewsPage({
    hotelId,
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : 2,
    lang,
  });
  return NextResponse.json({ ok: true, reviews, page: Math.max(2, Math.floor(page) || 2) });
}
