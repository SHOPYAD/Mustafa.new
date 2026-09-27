import { promises as fs } from "fs";
import path from "path";
import type { HotelProvider } from "@/lib/hotels-config";
import { parseHotelProvider } from "@/lib/hotels-config";
import {
  bookingEndpointEnabled,
  sanitizeHotelsRuntime,
  travelAdvisorEndpointEnabled,
  type HotelsRuntimeSettings,
} from "@/lib/hotels-runtime";
import { getServerEnvMap } from "@/lib/server/env-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "hotels-runtime.json");

async function providerFromEnv(): Promise<HotelProvider> {
  const map = await getServerEnvMap(["NEXT_PUBLIC_HOTELS_PROVIDER"]);
  return parseHotelProvider(map.NEXT_PUBLIC_HOTELS_PROVIDER);
}

let cached: { at: number; value: HotelsRuntimeSettings } | null = null;

export async function getHotelsRuntime(): Promise<HotelsRuntimeSettings> {
  if (cached && Date.now() - cached.at < 1500) return cached.value;
  const fallback = await providerFromEnv();
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    cached = { at: Date.now(), value: sanitizeHotelsRuntime(JSON.parse(raw), fallback) };
    return cached.value;
  } catch {
    cached = { at: Date.now(), value: sanitizeHotelsRuntime(null, fallback) };
    return cached.value;
  }
}

export async function saveHotelsRuntime(
  raw: unknown,
  fallbackProvider?: HotelProvider
): Promise<HotelsRuntimeSettings> {
  const fallback = fallbackProvider || (await providerFromEnv());
  const next = sanitizeHotelsRuntime(raw, fallback);
  cached = { at: Date.now(), value: next };
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      STORE_FILE,
      JSON.stringify({ ...next, updatedAt: new Date().toISOString() }, null, 2),
      { mode: 0o600 }
    );
  } catch {
    /* search still reads the in-request object we return */
  }
  return next;
}

export async function isBookingRuntimePathEnabled(pathOrId: string): Promise<boolean> {
  const runtime = await getHotelsRuntime();
  if (!runtime.providers.includes("booking")) return false;
  return bookingEndpointEnabled(runtime, pathOrId);
}

export async function isTravelAdvisorRuntimePathEnabled(
  pathOrId: string
): Promise<boolean> {
  const runtime = await getHotelsRuntime();
  if (!runtime.providers.includes("travel_advisor")) return false;
  return travelAdvisorEndpointEnabled(runtime, pathOrId);
}
