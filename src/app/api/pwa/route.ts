import { NextResponse } from "next/server";
import { toPublicPwaConfig } from "@/data/pwa";
import { getPwaSettings } from "@/lib/server/pwa-store";
import { cacheControlPublic } from "@/lib/server/ttl-cache";

export const runtime = "nodejs";

/**
 * Public PWA flags + chrome. No secrets.
 */
export async function GET() {
  const settings = await getPwaSettings();
  return NextResponse.json(
    { ok: true, ...toPublicPwaConfig(settings) },
    {
      headers: { "Cache-Control": cacheControlPublic(30, 120) },
    }
  );
}
