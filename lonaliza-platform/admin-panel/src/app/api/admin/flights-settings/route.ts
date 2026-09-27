import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
} from "@/lib/server/env-store";
import {
  buildFlightsConfigFromMap,
  compressedFlightProvider,
  FLIGHTS_ADMIN_ENV_KEYS,
  FLIGHTS_CONFIG_ENV_KEYS,
  isTravelpayoutsReady,
  parseFlightProvider,
  runtimePrimaryProvider,
  sanitizeFlightsRuntime,
  SKY_SCRAPPER_ENDPOINTS,
  SKY_SCRAPPER_HOST,
  usesTravelpayoutsProvider,
} from "@/lib/flights-config";
import { getFlightsRuntime, saveFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { getRapidApiQuotaStats } from "@/lib/server/rapidapi-quota-stats";
import {
  extractScriptUrl,
  validateTravelpayoutsFields,
} from "@/lib/travelpayouts-utils";

export const runtime = "nodejs";

const STRING_KEYS = [
  "NEXT_PUBLIC_FLIGHTS_PROVIDER",
  "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER",
  "NEXT_PUBLIC_TRAVELPAYOUTS_TRS",
  "NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN",
  "NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN",
  "NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT",
  "NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT",
  "NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE",
  "NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY",
  "NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR",
  "SKY_SCRAPPER_RAPIDAPI_KEY",
  "SKY_SCRAPPER_HOST",
] as const;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap(FLIGHTS_ADMIN_ENV_KEYS);
  const config = buildFlightsConfigFromMap(map);
  const flightsRuntime = await getFlightsRuntime();
  const quotaStats = await getRapidApiQuotaStats();
  const skyKey = map.SKY_SCRAPPER_RAPIDAPI_KEY || "";

  return NextResponse.json({
    ok: true,
    config,
    runtime: flightsRuntime,
    quotaStats: {
      sky_scrapper: quotaStats.sky_scrapper,
    },
    catalogs: {
      skyScrapper: SKY_SCRAPPER_ENDPOINTS,
    },
    values: {
      NEXT_PUBLIC_FLIGHTS_PROVIDER: runtimePrimaryProvider(flightsRuntime),
      NEXT_PUBLIC_TRAVELPAYOUTS_MARKER: map.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "",
      NEXT_PUBLIC_TRAVELPAYOUTS_TRS: map.NEXT_PUBLIC_TRAVELPAYOUTS_TRS || "",
      NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN || "lonaliza.com",
      NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN || "wl.aviasales.com",
      NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT || "",
      NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT || "",
      NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE: map.NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE || "ar",
      NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY || "usd",
      NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR:
        map.NEXT_PUBLIC_TRAVELPAYOUTS_LINK_COLOR || "#f59e0b",
      SKY_SCRAPPER_RAPIDAPI_KEY: skyKey ? maskSecret(skyKey) : "",
      SKY_SCRAPPER_HOST: map.SKY_SCRAPPER_HOST || SKY_SCRAPPER_HOST,
    },
    masked: {
      NEXT_PUBLIC_TRAVELPAYOUTS_MARKER: maskSecret(
        map.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || ""
      ),
      NEXT_PUBLIC_TRAVELPAYOUTS_TRS: maskSecret(
        map.NEXT_PUBLIC_TRAVELPAYOUTS_TRS || ""
      ),
      SKY_SCRAPPER_RAPIDAPI_KEY: skyKey ? maskSecret(skyKey) : "",
    },
    travelpayoutsReady: isTravelpayoutsReady(config.travelpayouts),
    skyScrapperReady: Boolean(skyKey),
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      values?: Record<string, string>;
      runtime?: unknown;
    };
    const incoming = body.values || {};
    const patch: Record<string, string> = {};

    for (const key of STRING_KEYS) {
      if (!(key in incoming)) continue;
      const raw = String(incoming[key] ?? "");
      if (
        key === "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER" ||
        key === "NEXT_PUBLIC_TRAVELPAYOUTS_TRS" ||
        key === "SKY_SCRAPPER_RAPIDAPI_KEY"
      ) {
        if (isMaskedPlaceholder(raw)) continue;
      }
      if (key === "SKY_SCRAPPER_HOST") {
        patch[key] = raw.trim() || SKY_SCRAPPER_HOST;
        continue;
      }
      if (key === "NEXT_PUBLIC_FLIGHTS_PROVIDER") {
        patch[key] = parseFlightProvider(raw);
        continue;
      }
      patch[key] = raw.trim();
    }

    let flightsRuntime = await getFlightsRuntime();
    if (body.runtime) {
      flightsRuntime = sanitizeFlightsRuntime(
        body.runtime,
        parseFlightProvider(
          patch.NEXT_PUBLIC_FLIGHTS_PROVIDER || incoming.NEXT_PUBLIC_FLIGHTS_PROVIDER
        )
      );
      patch.NEXT_PUBLIC_FLIGHTS_PROVIDER = compressedFlightProvider(
        flightsRuntime.mode,
        flightsRuntime.providers
      );
    }

    const provider = parseFlightProvider(
      patch.NEXT_PUBLIC_FLIGHTS_PROVIDER ||
        (await getServerEnvMap(["NEXT_PUBLIC_FLIGHTS_PROVIDER"])).NEXT_PUBLIC_FLIGHTS_PROVIDER
    );

    if (usesTravelpayoutsProvider(provider)) {
      const current = await getServerEnvMap(FLIGHTS_CONFIG_ENV_KEYS);
      const merged = { ...current, ...patch };
      const validation = validateTravelpayoutsFields({
        marker: merged.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "",
        trs: merged.NEXT_PUBLIC_TRAVELPAYOUTS_TRS || "",
        domain: merged.NEXT_PUBLIC_TRAVELPAYOUTS_DOMAIN || "",
        widgetDomain: merged.NEXT_PUBLIC_TRAVELPAYOUTS_WIDGET_DOMAIN || "",
        embedScript: merged.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT || "",
        cookiePolicyScript: merged.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT || "",
        locale: merged.NEXT_PUBLIC_TRAVELPAYOUTS_LOCALE || "",
        currency: merged.NEXT_PUBLIC_TRAVELPAYOUTS_CURRENCY || "",
      });

      if (!validation.valid) {
        return NextResponse.json(
          {
            ok: false,
            error: "إعدادات Travelpayouts غير مكتملة — راجع الحقول المطلوبة",
            validation,
          },
          { status: 400 }
        );
      }

      if (patch.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT) {
        patch.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT = extractScriptUrl(
          patch.NEXT_PUBLIC_TRAVELPAYOUTS_EMBED_SCRIPT
        );
      }
      if (patch.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT) {
        patch.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT = extractScriptUrl(
          patch.NEXT_PUBLIC_TRAVELPAYOUTS_COOKIE_SCRIPT
        );
      }
    }

    if (flightsRuntime.providers.includes("live")) {
      const current = await getServerEnvMap(["SKY_SCRAPPER_RAPIDAPI_KEY"]);
      const key = patch.SKY_SCRAPPER_RAPIDAPI_KEY || current.SKY_SCRAPPER_RAPIDAPI_KEY;
      if (!key) {
        return NextResponse.json(
          {
            ok: false,
            error: "أدخل مفتاح RapidAPI لنظام الطيران الحي (Sky Scrapper) قبل تفعيله",
          },
          { status: 400 }
        );
      }
    }

    if (body.runtime) {
      await saveFlightsRuntime(flightsRuntime, provider);
    }

    await saveServerEnv(patch);

    const map = await getServerEnvMap(FLIGHTS_ADMIN_ENV_KEYS);
    const config = buildFlightsConfigFromMap(map);
    const savedRuntime = await getFlightsRuntime();
    const skyKey = map.SKY_SCRAPPER_RAPIDAPI_KEY || "";

    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات الطيران على السيرفر",
      config,
      runtime: savedRuntime,
      travelpayoutsReady: isTravelpayoutsReady(config.travelpayouts),
      skyScrapperReady: Boolean(skyKey),
      restartHint:
        "تُحمَّل إعدادات الطيران عبر /api/flights-config فوراً. أعد تشغيل السيرفر إن لزم لـ NEXT_PUBLIC_* في حزم العميل.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
