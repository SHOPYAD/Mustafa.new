/* Agent B: public homepage content */
import { NextResponse } from "next/server";
import { FALLBACK_AIRLINE_LOGOS, FALLBACK_HOTEL_LOGOS } from "@/data/partner-logo-catalog";
import { getHomepageAirlines } from "@/lib/server/airlines-db";
import { getHomepageHotels } from "@/lib/server/partner-hotels-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [airlines, hotels] = await Promise.all([getHomepageAirlines(), getHomepageHotels()]);
    const airlineRows = airlines.length ? airlines : FALLBACK_AIRLINE_LOGOS;
    const hotelRows = hotels.length ? hotels : FALLBACK_HOTEL_LOGOS;
    return NextResponse.json({
      airlines: airlineRows.map((row) => ({
        iata: row.iata,
        name: row.name,
        logoUrl: row.logoUrl,
      })),
      hotels: hotelRows.map((row) => ({
        id: row.id,
        name: row.name,
        nameAr: row.nameAr,
        city: row.city,
        cityAr: row.cityAr,
        stars: row.stars,
        logoUrl: row.logoUrl,
      })),
    });
  } catch {
    return NextResponse.json({
      airlines: FALLBACK_AIRLINE_LOGOS,
      hotels: FALLBACK_HOTEL_LOGOS,
    });
  }
}
