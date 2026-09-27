import { NextResponse } from "next/server";
import { getPublicClientConfig } from "@/lib/server/env-store";
import { cacheControlPublic, ttlGet, ttlSet } from "@/lib/server/ttl-cache";
import { getMobileAppStudioSettings } from "@/lib/server/mobile-app-studio-store";

export const runtime = "nodejs";

/**
 * Public client config — site URL + whether Google login is enabled + store links.
 * Never includes secrets or PocketBase admin credentials.
 */
export async function GET() {
  const cached = ttlGet<Record<string, unknown>>("public-config");
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": cacheControlPublic(60, 180) },
    });
  }

  const [baseConfig, mobileSettings] = await Promise.all([
    getPublicClientConfig(),
    getMobileAppStudioSettings().catch(() => null),
  ]);

  const config = ttlSet(
    "public-config",
    {
      ok: true,
      ...baseConfig,
      googlePlayUrl: mobileSettings?.googlePlayUrl || "",
      appStoreUrl: mobileSettings?.appStoreUrl || "",
    },
    60_000
  );

  return NextResponse.json(config, {
    headers: { "Cache-Control": cacheControlPublic(60, 180) },
  });
}
