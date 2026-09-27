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
import { getProvidersRegistry } from "@/lib/server/providers-registry-store";
import { getSearchSession, startOrJoinSearchSession } from "@/lib/server/hotels/search-session";
import { buildSessionFilterGroups } from "@/lib/server/hotels/session-filters";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hotelsRuntime = await getHotelsRuntime();
  try {
    const { searchParams } = new URL(req.url);
    const stay = stayFromSearchParams(searchParams);
    const query = stay.query || "Istanbul";
    const lang = searchParams.get("lang")?.trim() || "";

    // Live supplier mode: facets are computed from the merged results of the search session itself.
    const registry = await getProvidersRegistry();
    const p = registry.providers;
    if (p.ratehawk?.enabled || p.hotelbeds?.enabled || p.travelport_hotels?.enabled || p.seeru_hotels?.enabled) {
      const sid = (searchParams.get("sid") || "").trim().replace(/[^a-f0-9]/gi, "").slice(0, 40);
      const childrenAges = (searchParams.get("children") || searchParams.get("childrenAges") || "")
        .split(/[,\s]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= 0 && n < 18);
      const session =
        (sid ? await getSearchSession(sid) : null) ||
        (await startOrJoinSearchSession(
          {
            query,
            checkIn: stay.checkIn,
            checkOut: stay.checkOut,
            adults: Math.max(1, stay.adults || 2),
            rooms: Math.max(1, Number(searchParams.get("rooms") || 1) || 1),
            childrenAges,
            currency: (searchParams.get("currency") || "USD").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "USD",
            lang: lang || "ar",
          },
          { waitMs: 4_000 }
        ));
      return NextResponse.json({
        ok: true,
        groups: buildSessionFilterGroups(session, lang || session.input.lang),
        source: "supplier",
        sid: session.sid,
        complete: session.status === "complete",
        totalCount: session.hotels.length,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
      });
    }

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
