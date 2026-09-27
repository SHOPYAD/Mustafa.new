import { NextResponse } from "next/server";
import { getPublicCarsEnv } from "@/lib/server/env-store";
import { buildCarsConfigFromMap } from "@/lib/cars-config";

export const runtime = "nodejs";

/**
 * Public cars provider config — no secrets.
 * Used by /cars and admin so Travelpayouts settings apply after admin save.
 */
export async function GET() {
  const map = await getPublicCarsEnv();
  const config = buildCarsConfigFromMap(map);
  return NextResponse.json(
    { ok: true, config },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
