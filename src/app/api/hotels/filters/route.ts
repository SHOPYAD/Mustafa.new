import { NextRequest, NextResponse } from "next/server";
import { stayFromSearchParams } from "@/lib/hotel-search";
import { resolvePlaceGeoId } from "@/lib/server/geo-places";
import { runtimeHasProvider } from "@/lib/hotels-runtime";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import {
  listOwnedHotelFilters,
  mapOwnedEnginePublicError,
} from "@/lib/scraping/hotels/owned-client";
import {
  listHotelFilters,
  mapTravelAdvisorPublicError,
} from "@/lib/server/travel-advisor";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hotelsRuntime = await getHotelsRuntime();
  try {
    const { searchParams } = new URL(req.url);
    const stay = stayFromSearchParams(searchParams);
    const query = stay.query || "Istanbul";
    const lang = searchParams.get("lang")?.trim() || "";

    if (runtimeHasProvider(hotelsRuntime, "booking")) {
      return NextResponse.json({
        ok: true,
        groups: [],
        source: "booking",
        geoId: stay.geoId,
        destId: stay.destId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
      });
    }

    if (runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single") {
      const groups = await listOwnedHotelFilters({
        query,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        lang,
      });
      return NextResponse.json({
        ok: true,
        groups,
        geoId: stay.geoId,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
      });
    }

    const geoId = await resolvePlaceGeoId({ geoId: stay.geoId, query });
    const groups = await listHotelFilters({
      query,
      geoId,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      adults: stay.adults,
      rooms: stay.rooms,
      lang,
    });
    return NextResponse.json({
      ok: true,
      groups,
      geoId,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
    });
  } catch (e) {
    const mapped =
      runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single"
        ? mapOwnedEnginePublicError(e)
        : mapTravelAdvisorPublicError(e);
    return NextResponse.json(
      {
        ok: false,
        groups: [],
        error: mapped.error,
        errorCode: mapped.errorCode,
      },
      { status: mapped.status }
    );
  }
}
