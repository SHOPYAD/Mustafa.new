import { NextResponse } from "next/server";
import {
  PUBLIC_FLIGHT_EMPTY,
  publicFlightErrorCode,
  publicFlightMessage,
} from "@/lib/server/flights-engine";
import type { FlightProviderErrorCode } from "@/lib/server/flights-sky-scrapper";

export function flightsJson(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export function travelpayoutsOnlyJson(): NextResponse {
  return flightsJson({
    ok: true,
    provider: "travelpayouts",
    itineraries: [],
    airports: [],
    destinations: [],
    days: [],
    error: PUBLIC_FLIGHT_EMPTY,
    errorCode: "provider_travelpayouts",
  });
}

export function flightsFailJson(errorCode: FlightProviderErrorCode): NextResponse {
  if (errorCode === "provider_travelpayouts") return travelpayoutsOnlyJson();
  const publicCode = publicFlightErrorCode(errorCode);
  return flightsJson({
    ok: false,
    provider: "live",
    error: publicFlightMessage(errorCode),
    errorCode: publicCode,
  });
}
