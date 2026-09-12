import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
} from "@/lib/server/env-store";
import {
  HOTELS_CONFIG_ENV_KEYS,
  ROOMS_PROVIDER_HOST,
  TRAVEL_ADVISOR_HOST,
  buildHotelsConfigFromMap,
  parseHotelProvider,
} from "@/lib/hotels-config";
import { getHotelRoomsProviderStatus } from "@/lib/server/hotel-rooms-provider";
import { purgeBookingErrorCaches, purgeBookingListCaches } from "@/lib/server/booking-disk-cache";
import { ownedEngineHealth } from "@/lib/scraping/hotels/owned-client";
import {
  BOOKING_RUNTIME_ENDPOINTS,
  TRAVEL_ADVISOR_RUNTIME_ENDPOINTS,
  runtimePrimaryProvider,
  sanitizeHotelsRuntime,
} from "@/lib/hotels-runtime";
import { getHotelsRuntime, saveHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import { proxyEnvPresent } from "@/lib/server/direct-network";
import { getRapidApiQuotaStats } from "@/lib/server/rapidapi-quota-stats";

export const runtime = "nodejs";

function roomsEnabledFromMap(map: Record<string, string>): boolean {
  const flag = (map.NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER || "").trim().toLowerCase();
  return flag === "" || flag === "booking_com15" || flag === "booking-com15" || flag === "1" || flag === "true";
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
  const config = buildHotelsConfigFromMap(map);
  const key = map.RAPIDAPI_KEY || "";
  const roomsKey = map.BOOKING_COM_RAPIDAPI_KEY || map.RAPIDAPI_ROOMS_KEY || "";
  const ownedHealth = await ownedEngineHealth();
  const hotelsRuntime = await getHotelsRuntime();
  const quotaStats = await getRapidApiQuotaStats();

  return NextResponse.json({
    ok: true,
    config,
    runtime: hotelsRuntime,
    quotaStats,
    catalogs: {
      booking: BOOKING_RUNTIME_ENDPOINTS,
      travelAdvisor: TRAVEL_ADVISOR_RUNTIME_ENDPOINTS,
    },
    proxyEnvPresent: proxyEnvPresent(),
    values: {
      NEXT_PUBLIC_HOTELS_PROVIDER: map.NEXT_PUBLIC_HOTELS_PROVIDER || "internal",
      RAPIDAPI_KEY: key ? maskSecret(key) : "",
      RAPIDAPI_TRAVEL_ADVISOR_HOST:
        map.RAPIDAPI_TRAVEL_ADVISOR_HOST || TRAVEL_ADVISOR_HOST,
      BOOKING_COM_HOST:
        map.BOOKING_COM_HOST || map.RAPIDAPI_ROOMS_HOST || ROOMS_PROVIDER_HOST,
      BOOKING_COM_RAPIDAPI_KEY: roomsKey ? maskSecret(roomsKey) : "",
      NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER: roomsEnabledFromMap(map)
        ? "booking_com15"
        : "off",
    },
    apiReady: Boolean(key),
    roomsKeyConfigured: Boolean(roomsKey || key),
    roomsEnabled: roomsEnabledFromMap(map),
    roomsProvider: getHotelRoomsProviderStatus(),
    ownedEngine: ownedHealth,
    ownedEngineConfigured: Boolean(map.HOTEL_ENGINE_TOKEN),
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      values?: Record<string, string>;
      purgeListCache?: boolean;
      runtime?: unknown;
    };
    if (body.purgeListCache) {
      const removed = await purgeBookingListCaches();
      return NextResponse.json({ ok: true, purged: removed });
    }
    const incoming = body.values || {};
    const patch: Record<string, string> = {};

    if ("NEXT_PUBLIC_HOTELS_PROVIDER" in incoming) {
      patch.NEXT_PUBLIC_HOTELS_PROVIDER = parseHotelProvider(
        incoming.NEXT_PUBLIC_HOTELS_PROVIDER
      );
    }

    if ("RAPIDAPI_KEY" in incoming) {
      const raw = String(incoming.RAPIDAPI_KEY || "").trim();
      if (!isMaskedPlaceholder(raw)) patch.RAPIDAPI_KEY = raw;
    }

    if ("RAPIDAPI_TRAVEL_ADVISOR_HOST" in incoming) {
      patch.RAPIDAPI_TRAVEL_ADVISOR_HOST =
        String(incoming.RAPIDAPI_TRAVEL_ADVISOR_HOST || "").trim() ||
        TRAVEL_ADVISOR_HOST;
    }

    if ("BOOKING_COM_HOST" in incoming || "RAPIDAPI_ROOMS_HOST" in incoming) {
      const host =
        String(incoming.BOOKING_COM_HOST || incoming.RAPIDAPI_ROOMS_HOST || "").trim() ||
        ROOMS_PROVIDER_HOST;
      patch.BOOKING_COM_HOST = host;
      patch.RAPIDAPI_ROOMS_HOST = host;
    }

    const incomingRoomsKey = incoming.BOOKING_COM_RAPIDAPI_KEY ?? incoming.RAPIDAPI_ROOMS_KEY;
    if (incomingRoomsKey !== undefined) {
      const raw = String(incomingRoomsKey || "").trim();
      if (!isMaskedPlaceholder(raw)) {
        patch.BOOKING_COM_RAPIDAPI_KEY = raw;
        patch.RAPIDAPI_ROOMS_KEY = raw;
      }
    }

    if ("NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER" in incoming) {
      const raw = String(incoming.NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER || "").trim().toLowerCase();
      patch.NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER =
        raw === "off" || raw === "0" || raw === "false" ? "off" : "booking_com15";
    }

    if (patch.NEXT_PUBLIC_HOTELS_PROVIDER === "owned") {
      const current = await getServerEnvMap(["HOTEL_ENGINE_TOKEN"]);
      if (!(patch.HOTEL_ENGINE_TOKEN || current.HOTEL_ENGINE_TOKEN)) {
        return NextResponse.json(
          {
            ok: false,
            error: "محرك الفنادق الخاص غير مضبوط بعد. شغّل hotel-engine ثم أعد المحاولة.",
          },
          { status: 400 }
        );
      }
    }

    if (patch.NEXT_PUBLIC_HOTELS_PROVIDER === "travel_advisor") {
      const current = await getServerEnvMap(["RAPIDAPI_KEY"]);
      const key = patch.RAPIDAPI_KEY || current.RAPIDAPI_KEY;
      if (!key) {
        return NextResponse.json(
          { ok: false, error: "أدخل مفتاح RapidAPI قبل تفعيل Travel Advisor" },
          { status: 400 }
        );
      }
    }

    if (patch.NEXT_PUBLIC_HOTELS_PROVIDER === "booking") {
      const current = await getServerEnvMap(["BOOKING_COM_RAPIDAPI_KEY", "RAPIDAPI_ROOMS_KEY"]);
      const key =
        patch.BOOKING_COM_RAPIDAPI_KEY ||
        current.BOOKING_COM_RAPIDAPI_KEY ||
        current.RAPIDAPI_ROOMS_KEY;
      if (!key) {
        return NextResponse.json(
          { ok: false, error: "أدخل مفتاح RapidAPI لـ Booking.com15 قبل تفعيله" },
          { status: 400 }
        );
      }
      patch.NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER = "booking_com15";
    }

    if (body.runtime) {
      const incomingRuntime = sanitizeHotelsRuntime(
        body.runtime,
        parseHotelProvider(patch.NEXT_PUBLIC_HOTELS_PROVIDER || incoming.NEXT_PUBLIC_HOTELS_PROVIDER)
      );
      if (incomingRuntime.providers.includes("booking")) {
        const current = await getServerEnvMap(["BOOKING_COM_RAPIDAPI_KEY", "RAPIDAPI_ROOMS_KEY"]);
        const key =
          patch.BOOKING_COM_RAPIDAPI_KEY ||
          current.BOOKING_COM_RAPIDAPI_KEY ||
          current.RAPIDAPI_ROOMS_KEY;
        if (!key) {
          return NextResponse.json(
            { ok: false, error: "أدخل مفتاح RapidAPI لـ Booking.com15 قبل تفعيله" },
            { status: 400 }
          );
        }
        patch.NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER = "booking_com15";
      }
      if (incomingRuntime.providers.includes("travel_advisor")) {
        const current = await getServerEnvMap(["RAPIDAPI_KEY"]);
        const key = patch.RAPIDAPI_KEY || current.RAPIDAPI_KEY;
        if (!key) {
          return NextResponse.json(
            { ok: false, error: "أدخل مفتاح RapidAPI قبل تفعيل Travel Advisor" },
            { status: 400 }
          );
        }
      }
      patch.NEXT_PUBLIC_HOTELS_PROVIDER = runtimePrimaryProvider(incomingRuntime);
      await saveHotelsRuntime(incomingRuntime, incomingRuntime.providers[0]);
    }

    const keyChanged = Boolean(patch.BOOKING_COM_RAPIDAPI_KEY);
    await saveServerEnv(patch);
    if (keyChanged) {
      await purgeBookingErrorCaches();
    }
    const map = await getServerEnvMap(HOTELS_CONFIG_ENV_KEYS);
    const roomsKey = map.BOOKING_COM_RAPIDAPI_KEY || map.RAPIDAPI_ROOMS_KEY || "";
    return NextResponse.json({
      ok: true,
      config: buildHotelsConfigFromMap(map),
      runtime: await getHotelsRuntime(),
      apiReady: Boolean(map.RAPIDAPI_KEY),
      roomsKeyConfigured: Boolean(roomsKey || map.RAPIDAPI_KEY),
      roomsEnabled: roomsEnabledFromMap(map),
      roomsProvider: getHotelRoomsProviderStatus(),
      ownedEngine: await ownedEngineHealth(),
      ownedEngineConfigured: Boolean(map.HOTEL_ENGINE_TOKEN),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
