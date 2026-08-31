import { NextRequest } from "next/server";
import {
  runtimePrimaryProvider,
  SKY_SCRAPPER_ENDPOINTS,
} from "@/lib/flights-config";
import { getFlightsRuntime } from "@/lib/server/flights-runtime-store";
import { runServerHealth, runSystemConfig } from "@/lib/server/flights-engine";
import { flightsJson } from "@/lib/server/flights-http";
import { getSkyScrapperAuth } from "@/lib/server/flights-sky-scrapper";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const runtime = await getFlightsRuntime();
  const provider = runtimePrimaryProvider(runtime);
  const live = runtime.providers.includes("live");
  const travelpayoutsOnly = !live && runtime.providers.includes("travelpayouts");
  const auth = live ? await getSkyScrapperAuth() : { key: "", host: "" };
  const includeHealth = req.nextUrl.searchParams.get("health") === "1";

  const system =
    live && !travelpayoutsOnly
      ? await runSystemConfig()
      : { config: null, locale: null, health: null };
  const health = includeHealth && live ? await runServerHealth() : null;

  const endpoints: Record<string, { enabled: boolean; uses: string; path: string }> = {};
  for (const item of SKY_SCRAPPER_ENDPOINTS) {
    const state = runtime.endpoints[item.id];
    endpoints[item.id] = {
      enabled: state?.enabled ?? item.defaultEnabled,
      uses: state?.uses ?? item.uses,
      path: item.path,
    };
  }

  return flightsJson({
    ok: true,
    provider: travelpayoutsOnly ? "travelpayouts" : provider,
    mode: runtime.mode,
    providers: runtime.providers,
    liveEnabled: live,
    travelpayoutsEnabled: runtime.providers.includes("travelpayouts"),
    liveReady: live && Boolean(auth.key),
    endpoints,
    system: {
      config: system.config,
      locale: system.locale,
      health,
    },
  });
}
