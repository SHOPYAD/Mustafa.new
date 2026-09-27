import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getServerEnvMap,
  isMaskedPlaceholder,
  maskSecret,
  saveServerEnv,
} from "@/lib/server/env-store";

export const runtime = "nodejs";

const MEDIA_KEYS = ["PEXELS_API_KEY", "UNSPLASH_ACCESS_KEY"] as const;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const map = await getServerEnvMap(MEDIA_KEYS);
  return NextResponse.json({
    ok: true,
    keys: {
      PEXELS_API_KEY: {
        configured: Boolean(map.PEXELS_API_KEY),
        masked: map.PEXELS_API_KEY ? maskSecret(map.PEXELS_API_KEY) : "",
      },
      UNSPLASH_ACCESS_KEY: {
        configured: Boolean(map.UNSPLASH_ACCESS_KEY),
        masked: map.UNSPLASH_ACCESS_KEY ? maskSecret(map.UNSPLASH_ACCESS_KEY) : "",
      },
    },
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { values?: Record<string, string> };
    const incoming = body.values || {};
    const patch: Record<string, string> = {};
    for (const key of MEDIA_KEYS) {
      if (!(key in incoming)) continue;
      const value = String(incoming[key] ?? "");
      if (isMaskedPlaceholder(value)) continue;
      patch[key] = value.trim();
    }
    await saveServerEnv(patch);
    const map = await getServerEnvMap(MEDIA_KEYS);
    return NextResponse.json({
      ok: true,
      keys: {
        PEXELS_API_KEY: {
          configured: Boolean(map.PEXELS_API_KEY),
          masked: map.PEXELS_API_KEY ? maskSecret(map.PEXELS_API_KEY) : "",
        },
        UNSPLASH_ACCESS_KEY: {
          configured: Boolean(map.UNSPLASH_ACCESS_KEY),
          masked: map.UNSPLASH_ACCESS_KEY ? maskSecret(map.UNSPLASH_ACCESS_KEY) : "",
        },
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
