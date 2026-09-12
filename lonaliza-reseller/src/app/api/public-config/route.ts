import { NextResponse } from "next/server";
import { getPublicClientConfig } from "@/lib/server/env-store";
import { cacheControlPublic, ttlGet, ttlSet } from "@/lib/server/ttl-cache";

export const runtime = "nodejs";

/**
 * Public client config — site URL + whether Google login is enabled.
 * Never includes secrets or PocketBase admin credentials.
 */
export async function GET() {
  const cached = ttlGet<Record<string, unknown>>("public-config");
  const config = cached || ttlSet("public-config", { ok: true, ...(await getPublicClientConfig()) }, 60_000);
  return NextResponse.json(config, {
    headers: { "Cache-Control": cacheControlPublic(60, 180) },
  });
}
