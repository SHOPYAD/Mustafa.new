import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { auditFromRequest } from "@/lib/server/admin-audit";
import {
  getServerEnvMap,
  saveServerEnv,
  maskSecret,
  isMaskedPlaceholder,
  SECRET_ENV_KEYS,
  MANAGED_ENV_KEYS,
  type ManagedEnvKey,
} from "@/lib/server/env-store";

export const runtime = "nodejs";

function buildMaskedStatus(map: Record<string, string>) {
  const keys: Record<
    string,
    { configured: boolean; masked: string; isSecret: boolean }
  > = {};
  for (const key of MANAGED_ENV_KEYS) {
    const val = map[key] || "";
    const isSecret = SECRET_ENV_KEYS.has(key);
    keys[key] = {
      configured: Boolean(val),
      masked: val ? maskSecret(val, isSecret ? 4 : 6) : "",
      isSecret,
    };
  }
  return keys;
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap();
  return NextResponse.json({
    ok: true,
    keys: buildMaskedStatus(map),
    restartHint:
      "أعد تشغيل السيرفر بعد الحفظ إذا لم تظهر قيم NEXT_PUBLIC_* في المتصفح فوراً",
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { values?: Record<string, string> };
    const incoming = body.values || {};
    const patch: Record<string, string> = {};

    for (const [key, raw] of Object.entries(incoming)) {
      if (!MANAGED_ENV_KEYS.includes(key as ManagedEnvKey)) continue;
      const value = String(raw ?? "");
      if (isMaskedPlaceholder(value)) continue; // keep existing
      patch[key] = value.trim();
    }

    await saveServerEnv(patch);
    await auditFromRequest(
      req,
      "admin.env.save",
      true,
      Object.keys(patch).join(",")
    );
    const map = await getServerEnvMap();

    return NextResponse.json({
      ok: true,
      message: "تم الحفظ على السيرفر",
      keys: buildMaskedStatus(map),
      restartRequired: Object.keys(patch).some((k) =>
        k.startsWith("NEXT_PUBLIC_")
      ),
      restartHint:
        "أعد تشغيل السيرفر بعد الحفظ لتطبيق NEXT_PUBLIC_* على حزم العميل (البيكسلات تعمل عبر /api/tracking-config بدون إعادة تشغيل).",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
