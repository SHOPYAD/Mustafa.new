import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
} from "@/lib/server/env-store";
import {
  buildTransfersConfigFromMap,
  TRANSFERS_CONFIG_ENV_KEYS,
  TRANSFERS_TP_DEFAULT_HEADER,
  TRANSFERS_TP_DEFAULT_SCRIPT,
  TRANSFERS_TP_DEFAULTS,
  isTransfersTravelpayoutsReady,
  normalizeTransfersScriptUrl,
  parseTransfersTpEmbed,
  parseTransfersTpFlags,
  serializeTransfersTpFlags,
  validateTransfersTravelpayoutsFields,
} from "@/lib/transfers-config";
import { normalizeTransfersCurrency } from "@/lib/tpemb-embed";

export const runtime = "nodejs";

const STRING_KEYS = [
  "NEXT_PUBLIC_TRANSFERS_PROVIDER",
  "NEXT_PUBLIC_TRANSFERS_TP_MARKER",
  "NEXT_PUBLIC_TRANSFERS_TP_TRS",
  "NEXT_PUBLIC_TRANSFERS_TP_LOCALE",
  "NEXT_PUBLIC_TRANSFERS_TP_CURRENCY",
  "NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID",
  "NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID",
  "NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME",
  "NEXT_PUBLIC_TRANSFERS_TP_HEADER",
  "NEXT_PUBLIC_TRANSFERS_TP_FLAGS",
  "NEXT_PUBLIC_TRANSFERS_TP_SCRIPT",
] as const;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap(TRANSFERS_CONFIG_ENV_KEYS);
  const config = buildTransfersConfigFromMap(map);

  return NextResponse.json({
    ok: true,
    config,
    values: {
      NEXT_PUBLIC_TRANSFERS_PROVIDER:
        map.NEXT_PUBLIC_TRANSFERS_PROVIDER || "internal",
      NEXT_PUBLIC_TRANSFERS_TP_MARKER:
        map.NEXT_PUBLIC_TRANSFERS_TP_MARKER || TRANSFERS_TP_DEFAULTS.marker,
      NEXT_PUBLIC_TRANSFERS_TP_TRS:
        map.NEXT_PUBLIC_TRANSFERS_TP_TRS || TRANSFERS_TP_DEFAULTS.trs,
      NEXT_PUBLIC_TRANSFERS_TP_LOCALE:
        map.NEXT_PUBLIC_TRANSFERS_TP_LOCALE || TRANSFERS_TP_DEFAULTS.locale,
      NEXT_PUBLIC_TRANSFERS_TP_CURRENCY:
        map.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY || TRANSFERS_TP_DEFAULTS.currency,
      NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID:
        map.NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID ||
        TRANSFERS_TP_DEFAULTS.campaignId,
      NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID:
        map.NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID || TRANSFERS_TP_DEFAULTS.promoId,
      NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME:
        map.NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME ||
        TRANSFERS_TP_DEFAULTS.colorScheme,
      NEXT_PUBLIC_TRANSFERS_TP_HEADER:
        map.NEXT_PUBLIC_TRANSFERS_TP_HEADER || TRANSFERS_TP_DEFAULT_HEADER,
      NEXT_PUBLIC_TRANSFERS_TP_FLAGS: serializeTransfersTpFlags(
        parseTransfersTpFlags(map.NEXT_PUBLIC_TRANSFERS_TP_FLAGS)
      ),
      NEXT_PUBLIC_TRANSFERS_TP_SCRIPT:
        map.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT || TRANSFERS_TP_DEFAULT_SCRIPT,
    },
    masked: {
      NEXT_PUBLIC_TRANSFERS_TP_MARKER: maskSecret(
        map.NEXT_PUBLIC_TRANSFERS_TP_MARKER || ""
      ),
      NEXT_PUBLIC_TRANSFERS_TP_TRS: maskSecret(
        map.NEXT_PUBLIC_TRANSFERS_TP_TRS || ""
      ),
    },
    travelpayoutsReady: isTransfersTravelpayoutsReady(config.travelpayouts),
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
        key === "NEXT_PUBLIC_TRANSFERS_TP_MARKER" ||
        key === "NEXT_PUBLIC_TRANSFERS_TP_TRS"
      ) {
        if (isMaskedPlaceholder(raw)) continue;
      }
      patch[key] = raw.trim();
    }

    if (patch.NEXT_PUBLIC_TRANSFERS_PROVIDER) {
      const provider = patch.NEXT_PUBLIC_TRANSFERS_PROVIDER;
      if (provider !== "internal" && provider !== "travelpayouts") {
        patch.NEXT_PUBLIC_TRANSFERS_PROVIDER = "internal";
      }
    }

    const provider =
      patch.NEXT_PUBLIC_TRANSFERS_PROVIDER ||
      (await getServerEnvMap(["NEXT_PUBLIC_TRANSFERS_PROVIDER"]))
        .NEXT_PUBLIC_TRANSFERS_PROVIDER;

    if (provider === "travelpayouts") {
      const current = await getServerEnvMap(TRANSFERS_CONFIG_ENV_KEYS);
      const merged = { ...current, ...patch };
      const validation = validateTransfersTravelpayoutsFields({
        marker: merged.NEXT_PUBLIC_TRANSFERS_TP_MARKER || "",
        trs: merged.NEXT_PUBLIC_TRANSFERS_TP_TRS || "",
        embedScript: merged.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT || "",
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

      if (patch.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT) {
        const parsed = parseTransfersTpEmbed(
          patch.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT
        );
        patch.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT = normalizeTransfersScriptUrl(
          parsed.embedScript || patch.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT
        );
        if (parsed.marker && !patch.NEXT_PUBLIC_TRANSFERS_TP_MARKER) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_MARKER = parsed.marker;
        }
        if (parsed.trs && !patch.NEXT_PUBLIC_TRANSFERS_TP_TRS) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_TRS = parsed.trs;
        }
        if (parsed.locale && !patch.NEXT_PUBLIC_TRANSFERS_TP_LOCALE) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_LOCALE = parsed.locale;
        }
        if (parsed.currency && !patch.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY = parsed.currency;
        }
        if (parsed.campaignId && !patch.NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID = parsed.campaignId;
        }
        if (parsed.promoId && !patch.NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID = parsed.promoId;
        }
        if (
          parsed.colorScheme &&
          !patch.NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME
        ) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME = parsed.colorScheme;
        }
        if (parsed.header && !patch.NEXT_PUBLIC_TRANSFERS_TP_HEADER) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_HEADER = parsed.header;
        }
        if (parsed.flags && !patch.NEXT_PUBLIC_TRANSFERS_TP_FLAGS) {
          patch.NEXT_PUBLIC_TRANSFERS_TP_FLAGS = serializeTransfersTpFlags(
            parsed.flags
          );
        }
      }
      if (patch.NEXT_PUBLIC_TRANSFERS_TP_FLAGS) {
        patch.NEXT_PUBLIC_TRANSFERS_TP_FLAGS = serializeTransfersTpFlags(
          parseTransfersTpFlags(patch.NEXT_PUBLIC_TRANSFERS_TP_FLAGS)
        );
      }
      patch.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY = normalizeTransfersCurrency(
        patch.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY ||
          current.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY ||
          TRANSFERS_TP_DEFAULTS.currency
      );
    }

    await saveServerEnv(patch);

    const map = await getServerEnvMap(TRANSFERS_CONFIG_ENV_KEYS);
    const config = buildTransfersConfigFromMap(map);

    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات الترانسفير على السيرفر",
      config,
      travelpayoutsReady: isTransfersTravelpayoutsReady(config.travelpayouts),
      restartHint:
        "تُحمَّل إعدادات الترانسفير عبر /api/transfers-config فوراً. أعد تشغيل السيرفر إن لزم لـ NEXT_PUBLIC_* في حزم العميل.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
