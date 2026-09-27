import { NextResponse } from "next/server";
import { getPublicFlightsEnv } from "@/lib/server/env-store";
import {
  buildFlightsConfigFromMap,
  resolveFlightDealsSource,
  runtimePrimaryProvider,
} from "@/lib/flights-config";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";

export const runtime = "nodejs";

/**
 * Public flights provider config — no secrets.
 * Travelpayouts-only keeps provider=travelpayouts so the widget stays intact.
 */
export async function GET() {
  const map = await getPublicFlightsEnv();
  const envConfig = buildFlightsConfigFromMap(map);
  const runtime = await getFlightsRuntime();
  const live = runtime.providers.includes("live");
  const travelpayoutsOnly = !live && runtime.providers.includes("travelpayouts");
  const provider = travelpayoutsOnly
    ? "travelpayouts"
    : runtimePrimaryProvider(runtime);
  const dealsSource = resolveFlightDealsSource(runtime.providers, runtime.dealsSource);

  return NextResponse.json(
    {
      ok: true,
      config: {
        ...envConfig,
        provider,
        mode: runtime.mode,
        providers: runtime.providers,
        liveEnabled: live,
        travelpayoutsEnabled: runtime.providers.includes("travelpayouts"),
        dealsSource,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
