import { NextRequest } from "next/server";
import { PUBLIC_FLIGHT_EMPTY, runSearchIncomplete } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = (req.nextUrl.searchParams.get("sessionId") || "").trim();
  if (!sessionId) {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const result = await runSearchIncomplete(
    sessionId,
    req.nextUrl.searchParams.get("currency") || undefined
  );
  if (!result.ok) return flightsFailJson(result.errorCode);

  const { session } = result;
  return flightsJson({
    ok: true,
    provider: "live",
    sessionId: session.sessionId || sessionId,
    status: session.status,
    itineraries: session.itineraries,
    currency: session.currency,
    empty: session.itineraries.length === 0,
    error: session.itineraries.length === 0 ? PUBLIC_FLIGHT_EMPTY : undefined,
    errorCode: session.itineraries.length === 0 ? "zero_results" : undefined,
  });
}
