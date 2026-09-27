import { NextResponse } from "next/server";
import { getPublicTransfersEnv } from "@/lib/server/env-store";
import { buildTransfersConfigFromMap } from "@/lib/transfers-config";

export const runtime = "nodejs";

/**
 * Public transfers provider config — no secrets.
 * Used by /transfers and admin so Travelpayouts settings apply after admin save.
 */
export async function GET() {
  const map = await getPublicTransfersEnv();
  const config = buildTransfersConfigFromMap(map);
  return NextResponse.json(
    { ok: true, config },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
