import { promises as fs } from "fs";
import path from "path";
import {
  compressedFlightProvider,
  flightEndpointEnabled,
  parseFlightProvider,
  sanitizeFlightsRuntime,
  type FlightProvider,
  type FlightsRuntimeSettings,
} from "@/lib/flights-config";
import { getServerEnvMap } from "@/lib/server/env-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "flights-runtime.json");

async function providerFromEnv(): Promise<FlightProvider> {
  const map = await getServerEnvMap(["NEXT_PUBLIC_FLIGHTS_PROVIDER"]);
  return parseFlightProvider(map.NEXT_PUBLIC_FLIGHTS_PROVIDER);
}

let cached: { at: number; value: FlightsRuntimeSettings } | null = null;

export async function getFlightsRuntime(): Promise<FlightsRuntimeSettings> {
  if (cached && Date.now() - cached.at < 1500) return cached.value;
  const fallback = await providerFromEnv();
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    cached = { at: Date.now(), value: sanitizeFlightsRuntime(JSON.parse(raw), fallback) };
    return cached.value;
  } catch {
    cached = { at: Date.now(), value: sanitizeFlightsRuntime(null, fallback) };
    return cached.value;
  }
}

export async function saveFlightsRuntime(
  raw: unknown,
  fallbackProvider?: FlightProvider
): Promise<FlightsRuntimeSettings> {
  const fallback = fallbackProvider || (await providerFromEnv());
  const next = sanitizeFlightsRuntime(raw, fallback);
  cached = { at: Date.now(), value: next };
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      STORE_FILE,
      JSON.stringify(
        {
          ...next,
          provider: compressedFlightProvider(next.mode, next.providers),
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      { mode: 0o600 }
    );
  } catch {
    /* in-request object is still returned */
  }
  return next;
}

export async function isSkyScrapperPathEnabled(pathOrId: string): Promise<boolean> {
  const runtime = await getFlightsRuntime();
  if (!runtime.providers.includes("live")) return false;
  return flightEndpointEnabled(runtime, pathOrId);
}
