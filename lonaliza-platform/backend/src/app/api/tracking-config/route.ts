import { NextResponse } from "next/server";
import { getPublicTrackingEnv } from "@/lib/server/env-store";
import { getIntegrationsFromValues } from "@/lib/integrations-env";

export const runtime = "nodejs";

/**
 * Public tracking IDs only — no secrets.
 * Used by SiteTrackingScripts so pixels work after admin save without restart.
 */
export async function GET() {
  const map = await getPublicTrackingEnv();
  const integrations = getIntegrationsFromValues(map);
  return NextResponse.json(
    { ok: true, integrations },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
