import { promises as fs } from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".data", "booking-cache");

export const BOOKING_LIST_TTL_MS = 8 * 60 * 60 * 1000;
export const BOOKING_DEST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const BOOKING_DETAIL_TTL_MS = 24 * 60 * 60 * 1000;
export const BOOKING_ROOMS_TTL_MS = 8 * 60 * 60 * 1000;

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

export async function readBookingCache<T>(key: string, ttlMs: number): Promise<T | null> {
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

export async function writeBookingCache<T>(key: string, value: T): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const envelope: CacheEnvelope<T> = { at: Date.now(), value };
    await fs.writeFile(fileFor(key), JSON.stringify(envelope), { mode: 0o600 });
  } catch {
    /* ignore disk errors */
  }
}

export async function peekBookingCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(fileFor(key), "utf8");
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed.value ?? null;
  } catch {
    return null;
  }
}

export async function deleteBookingCache(key: string): Promise<void> {
  try {
    await fs.unlink(fileFor(key));
  } catch {
    /* missing is fine */
  }
}

const ERROR_CACHE_RE =
  /quota|rate limit|too many requests|exceeded the .{0,40}quota|not subscribed|you are not subscribed|invalid api key/i;

export function bookingCacheLooksLikeError(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return ERROR_CACHE_RE.test(value);
  if (typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  const code = String(rec.errorCode || rec.error || "");
  if (code === "quota" || code === "invalid_key" || code === "not_subscribed") return true;
  if (Array.isArray(rec.hotels) && rec.hotels.length > 0) return false;
  try {
    return ERROR_CACHE_RE.test(JSON.stringify(value));
  } catch {
    return false;
  }
}

export async function purgeBookingErrorCaches(): Promise<number> {
  let removed = 0;
  try {
    const names = await fs.readdir(CACHE_DIR);
    await Promise.all(
      names.map(async (name) => {
        try {
          const raw = await fs.readFile(path.join(CACHE_DIR, name), "utf8");
          const parsed = JSON.parse(raw) as CacheEnvelope<unknown>;
          if (!bookingCacheLooksLikeError(parsed?.value)) return;
          await fs.unlink(path.join(CACHE_DIR, name));
          removed += 1;
        } catch {
          /* ignore */
        }
      })
    );
  } catch {
    /* ignore */
  }
  return removed;
}

export async function findCachedBookingSearch(destId: string): Promise<unknown | null> {
  const needle = String(destId || "").replace(/^-/, "").trim();
  if (!needle) return null;
  try {
    const names = await fs.readdir(CACHE_DIR);
    const matches = names
      .filter((name) => name.startsWith(`search-${needle}-`) && name.endsWith(".json"))
      .sort();
    for (const name of matches) {
      try {
        const raw = await fs.readFile(path.join(CACHE_DIR, name), "utf8");
        const parsed = JSON.parse(raw) as CacheEnvelope<{ hotels?: unknown[] }>;
        if (bookingCacheLooksLikeError(parsed?.value)) continue;
        if (Array.isArray(parsed?.value?.hotels) && parsed.value.hotels.length) {
          return parsed.value;
        }
      } catch {
        /* next */
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function purgeBookingListCaches(): Promise<number> {
  const lists = await deleteBookingCacheMatching(/^(search-|raw-search-)/);
  // Old global dest.json mixed Izmir into every city — never keep it.
  const globalDest = await deleteBookingCacheMatching(/^dest\.json$/);
  return lists + globalDest;
}

export async function listBookingCacheFiles(prefix: string): Promise<string[]> {
  try {
    const names = await fs.readdir(CACHE_DIR);
    return names.filter((name) => name.startsWith(prefix) && name.endsWith(".json"));
  } catch {
    return [];
  }
}

export async function deleteBookingCacheMatching(pattern: RegExp): Promise<number> {
  let removed = 0;
  try {
    const names = await fs.readdir(CACHE_DIR);
    await Promise.all(
      names
        .filter((name) => pattern.test(name))
        .map(async (name) => {
          try {
            await fs.unlink(path.join(CACHE_DIR, name));
            removed += 1;
          } catch {
            /* ignore */
          }
        })
    );
  } catch {
    /* ignore */
  }
  return removed;
}
