import { promises as fs } from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".data", "flights-cache");

/** Spec TTLs — Flight_Engine_Integration_and_UIUX_Specification §1.1 */
export const FLIGHTS_CONFIG_TTL_MS = 24 * 60 * 60 * 1000;
export const FLIGHTS_LOCALE_TTL_MS = 24 * 60 * 60 * 1000;
export const FLIGHTS_AIRPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const FLIGHTS_CALENDAR_TTL_MS = 6 * 60 * 60 * 1000;
export const FLIGHTS_SESSION_TTL_MS = 15 * 60 * 1000;

type CacheEnvelope<T> = { at: number; value: T };

function safeKey(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

function fileFor(key: string): string {
  return path.join(CACHE_DIR, `${safeKey(key)}.json`);
}

export async function readFlightsCache<T>(
  key: string,
  ttlMs: number
): Promise<T | null> {
  try {
    const raw = await fs.readFile(fileFor(key), "utf8");
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed !== "object" || parsed.value == null) return null;
    if (Date.now() - Number(parsed.at || 0) > ttlMs) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export async function writeFlightsCache<T>(key: string, value: T): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const envelope: CacheEnvelope<T> = { at: Date.now(), value };
    await fs.writeFile(fileFor(key), JSON.stringify(envelope), { mode: 0o600 });
  } catch {
    /* ignore disk errors */
  }
}

export async function deleteFlightsCache(key: string): Promise<void> {
  try {
    await fs.unlink(fileFor(key));
  } catch {
    /* missing is fine */
  }
}

export function flightsCacheKey(parts: Array<string | number | undefined | null>): string {
  return parts
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(":");
}
