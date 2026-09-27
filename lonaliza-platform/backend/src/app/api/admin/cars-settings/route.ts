import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
} from "@/lib/server/env-store";
import {
  buildCarsConfigFromMap,
  CARS_CONFIG_ENV_KEYS,
  CARS_TP_DEFAULTS,
  isCarsTravelpayoutsReady,
  normalizeCarsScriptUrl,
  validateCarsTravelpayoutsFields,
} from "@/lib/cars-config";

export const runtime = "nodejs";

const STRING_KEYS = [
  "NEXT_PUBLIC_CARS_PROVIDER",
  "NEXT_PUBLIC_CARS_TP_MARKER",
  "NEXT_PUBLIC_CARS_TP_TRS",
  "NEXT_PUBLIC_CARS_TP_LOCALE",
  "NEXT_PUBLIC_CARS_TP_COUNTRY",
  "NEXT_PUBLIC_CARS_TP_CITY",
  "NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID",
  "NEXT_PUBLIC_CARS_TP_PROMO_ID",
  "NEXT_PUBLIC_CARS_TP_SCRIPT",
] as const;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap(CARS_CONFIG_ENV_KEYS);
  const config = buildCarsConfigFromMap(map);

  return NextResponse.json({
    ok: true,
    config,
    values: {
      NEXT_PUBLIC_CARS_PROVIDER:
        map.NEXT_PUBLIC_CARS_PROVIDER || "travelpayouts",
      NEXT_PUBLIC_CARS_TP_MARKER:
        map.NEXT_PUBLIC_CARS_TP_MARKER || CARS_TP_DEFAULTS.marker,
      NEXT_PUBLIC_CARS_TP_TRS:
        map.NEXT_PUBLIC_CARS_TP_TRS || CARS_TP_DEFAULTS.trs,
      NEXT_PUBLIC_CARS_TP_LOCALE:
        map.NEXT_PUBLIC_CARS_TP_LOCALE || CARS_TP_DEFAULTS.locale,
      NEXT_PUBLIC_CARS_TP_COUNTRY:
        map.NEXT_PUBLIC_CARS_TP_COUNTRY || CARS_TP_DEFAULTS.country,
      NEXT_PUBLIC_CARS_TP_CITY:
        map.NEXT_PUBLIC_CARS_TP_CITY || CARS_TP_DEFAULTS.city,
      NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID:
        map.NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID || CARS_TP_DEFAULTS.campaignId,
      NEXT_PUBLIC_CARS_TP_PROMO_ID:
        map.NEXT_PUBLIC_CARS_TP_PROMO_ID || CARS_TP_DEFAULTS.promoId,
      NEXT_PUBLIC_CARS_TP_SCRIPT: map.NEXT_PUBLIC_CARS_TP_SCRIPT || "",
    },
    masked: {
      NEXT_PUBLIC_CARS_TP_MARKER: maskSecret(
        map.NEXT_PUBLIC_CARS_TP_MARKER || ""
      ),
      NEXT_PUBLIC_CARS_TP_TRS: maskSecret(map.NEXT_PUBLIC_CARS_TP_TRS || ""),
    },
    travelpayoutsReady: isCarsTravelpayoutsReady(config.travelpayouts),
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      values?: Record<string, string>;
    };
    const incoming = body.values || {};
    const patch: Record<string, string> = {};

    for (const key of STRING_KEYS) {
      if (!(key in incoming)) continue;
      const raw = String(incoming[key] ?? "");
      if (
        key === "NEXT_PUBLIC_CARS_TP_MARKER" ||
        key === "NEXT_PUBLIC_CARS_TP_TRS"
      ) {
        if (isMaskedPlaceholder(raw)) continue;
      }
      patch[key] = raw.trim();
    }

    if (patch.NEXT_PUBLIC_CARS_PROVIDER) {
      const provider = patch.NEXT_PUBLIC_CARS_PROVIDER;
      if (provider !== "internal" && provider !== "travelpayouts") {
        patch.NEXT_PUBLIC_CARS_PROVIDER = "travelpayouts";
      }
    } else if (!("NEXT_PUBLIC_CARS_PROVIDER" in incoming)) {
      patch.NEXT_PUBLIC_CARS_PROVIDER = "travelpayouts";
    }

    const provider =
      patch.NEXT_PUBLIC_CARS_PROVIDER ||
      (await getServerEnvMap(["NEXT_PUBLIC_CARS_PROVIDER"]))
        .NEXT_PUBLIC_CARS_PROVIDER ||
      "travelpayouts";

    if (provider === "travelpayouts") {
      const current = await getServerEnvMap(CARS_CONFIG_ENV_KEYS);
      const merged = { ...current, ...patch };
      const validation = validateCarsTravelpayoutsFields({
        marker: merged.NEXT_PUBLIC_CARS_TP_MARKER || CARS_TP_DEFAULTS.marker,
        trs: merged.NEXT_PUBLIC_CARS_TP_TRS || CARS_TP_DEFAULTS.trs,
        embedScript: merged.NEXT_PUBLIC_CARS_TP_SCRIPT || "",
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

      if (patch.NEXT_PUBLIC_CARS_TP_SCRIPT) {
        patch.NEXT_PUBLIC_CARS_TP_SCRIPT = normalizeCarsScriptUrl(
          patch.NEXT_PUBLIC_CARS_TP_SCRIPT
        );
      }

      if (!patch.NEXT_PUBLIC_CARS_TP_MARKER) {
        patch.NEXT_PUBLIC_CARS_TP_MARKER =
          merged.NEXT_PUBLIC_CARS_TP_MARKER || CARS_TP_DEFAULTS.marker;
      }
      if (!patch.NEXT_PUBLIC_CARS_TP_TRS) {
        patch.NEXT_PUBLIC_CARS_TP_TRS =
          merged.NEXT_PUBLIC_CARS_TP_TRS || CARS_TP_DEFAULTS.trs;
      }
    }

    await saveServerEnv(patch);

    const map = await getServerEnvMap(CARS_CONFIG_ENV_KEYS);
    const config = buildCarsConfigFromMap(map);

    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات تأجير السيارات على السيرفر",
      config,
      travelpayoutsReady: isCarsTravelpayoutsReady(config.travelpayouts),
      restartHint:
        "تُحمَّل إعدادات السيارات عبر /api/cars-config فوراً. أعد تشغيل السيرفر إن لزم لـ NEXT_PUBLIC_* في حزم العميل.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
