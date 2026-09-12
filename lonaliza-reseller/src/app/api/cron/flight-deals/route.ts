import { NextRequest, NextResponse } from "next/server";
import { assertAutomationCronSecret } from "@/lib/server/automation/cron-secret";
import { getHomepageFlightDeals } from "@/lib/server/flight-deals";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await assertAutomationCronSecret(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const payload = await getHomepageFlightDeals({ force: true });
  return NextResponse.json({
    ok: true,
    source: payload.source,
    cachedAt: payload.cachedAt,
    count: payload.deals.length,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
