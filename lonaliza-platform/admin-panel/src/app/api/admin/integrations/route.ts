import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
} from "@/lib/server/env-store";
import {
  getIntegrationsFromValues,
  getIntegrationStatusRows,
} from "@/lib/integrations-env";

export const runtime = "nodejs";

const INTEGRATION_KEYS = [
  "NEXT_PUBLIC_GSC_VERIFICATION",
  "NEXT_PUBLIC_GA_ID",
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_LABEL",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
  "NEXT_PUBLIC_GSC_ENABLED",
  "NEXT_PUBLIC_GA_ENABLED",
  "NEXT_PUBLIC_GTM_ENABLED",
  "NEXT_PUBLIC_GOOGLE_ADS_ENABLED",
  "NEXT_PUBLIC_META_PIXEL_ENABLED",
  "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED",
  "NEXT_PUBLIC_SITE_URL",
] as const;

function boolToEnv(v: unknown): string {
  if (v === true || v === "true" || v === "1") return "true";
  if (v === false || v === "false" || v === "0") return "false";
  return "";
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap(INTEGRATION_KEYS);
  const integrations = getIntegrationsFromValues(map);
  const rows = getIntegrationStatusRows(integrations);

  return NextResponse.json({
    ok: true,
    values: {
      NEXT_PUBLIC_GSC_VERIFICATION: map.NEXT_PUBLIC_GSC_VERIFICATION || "",
      NEXT_PUBLIC_GA_ID: map.NEXT_PUBLIC_GA_ID || "",
      NEXT_PUBLIC_GTM_ID: map.NEXT_PUBLIC_GTM_ID || "",
      NEXT_PUBLIC_GOOGLE_ADS_ID: map.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
      NEXT_PUBLIC_GOOGLE_ADS_LABEL: map.NEXT_PUBLIC_GOOGLE_ADS_LABEL || "",
      NEXT_PUBLIC_META_PIXEL_ID: map.NEXT_PUBLIC_META_PIXEL_ID || "",
      NEXT_PUBLIC_TIKTOK_PIXEL_ID: map.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
      NEXT_PUBLIC_GSC_ENABLED: map.NEXT_PUBLIC_GSC_ENABLED || "",
      NEXT_PUBLIC_GA_ENABLED: map.NEXT_PUBLIC_GA_ENABLED || "",
      NEXT_PUBLIC_GTM_ENABLED: map.NEXT_PUBLIC_GTM_ENABLED || "",
      NEXT_PUBLIC_GOOGLE_ADS_ENABLED: map.NEXT_PUBLIC_GOOGLE_ADS_ENABLED || "",
      NEXT_PUBLIC_META_PIXEL_ENABLED: map.NEXT_PUBLIC_META_PIXEL_ENABLED || "",
      NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED: map.NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED || "",
    },
    masked: {
      NEXT_PUBLIC_GSC_VERIFICATION: maskSecret(
        map.NEXT_PUBLIC_GSC_VERIFICATION || "",
        6
      ),
      NEXT_PUBLIC_GA_ID: maskSecret(map.NEXT_PUBLIC_GA_ID || ""),
      NEXT_PUBLIC_GTM_ID: maskSecret(map.NEXT_PUBLIC_GTM_ID || ""),
      NEXT_PUBLIC_GOOGLE_ADS_ID: maskSecret(map.NEXT_PUBLIC_GOOGLE_ADS_ID || ""),
      NEXT_PUBLIC_GOOGLE_ADS_LABEL: maskSecret(
        map.NEXT_PUBLIC_GOOGLE_ADS_LABEL || ""
      ),
      NEXT_PUBLIC_META_PIXEL_ID: maskSecret(map.NEXT_PUBLIC_META_PIXEL_ID || ""),
      NEXT_PUBLIC_TIKTOK_PIXEL_ID: maskSecret(
        map.NEXT_PUBLIC_TIKTOK_PIXEL_ID || ""
      ),
    },
    rows,
    integrations,
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      values?: Record<string, string | boolean>;
    };
    const incoming = body.values || {};
    const patch: Record<string, string> = {};

    const stringKeys = [
      "NEXT_PUBLIC_GSC_VERIFICATION",
      "NEXT_PUBLIC_GA_ID",
      "NEXT_PUBLIC_GTM_ID",
      "NEXT_PUBLIC_GOOGLE_ADS_ID",
      "NEXT_PUBLIC_GOOGLE_ADS_LABEL",
      "NEXT_PUBLIC_META_PIXEL_ID",
      "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
    ] as const;

    for (const key of stringKeys) {
      if (!(key in incoming)) continue;
      const raw = String(incoming[key] ?? "");
      if (isMaskedPlaceholder(raw)) continue;
      patch[key] = raw.trim();
    }

    const flagKeys = [
      "NEXT_PUBLIC_GSC_ENABLED",
      "NEXT_PUBLIC_GA_ENABLED",
      "NEXT_PUBLIC_GTM_ENABLED",
      "NEXT_PUBLIC_GOOGLE_ADS_ENABLED",
      "NEXT_PUBLIC_META_PIXEL_ENABLED",
      "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED",
    ] as const;

    for (const key of flagKeys) {
      if (!(key in incoming)) continue;
      patch[key] = boolToEnv(incoming[key]);
    }

    await saveServerEnv(patch);

    // Re-read for response (use GET logic)
    const map = await getServerEnvMap(INTEGRATION_KEYS);
    const integrations = getIntegrationsFromValues(map);

    return NextResponse.json({
      ok: true,
      message: "تم حفظ إعدادات التتبع على السيرفر",
      integrations,
      rows: getIntegrationStatusRows(integrations),
      restartHint:
        "البيكسلات تُحمَّل عبر /api/tracking-config فوراً. أعد تشغيل السيرفر إن لزم لأدوات أخرى تعتمد على NEXT_PUBLIC_*.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
