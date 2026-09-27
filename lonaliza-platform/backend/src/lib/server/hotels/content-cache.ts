/**
 * L1 content cache — JSON files under `.data/hotels/content/{supplier}/{id}.json`.
 * The PocketBase master content DB (A1) is the source of truth; this cache
 * keeps hot supplier content available to the request path without a DB round-trip,
 * and lets adapters work even when PocketBase is unreachable.
 */

import { promises as fs } from "fs";
import path from "path";
import type { HotelSupplierId } from "@/lib/providers/adapters/common/types";
import type { HotelContent } from "./content-types";

const ROOT = path.join(process.cwd(), ".data", "hotels", "content");
const DEFAULT_TTL_MS = 30 * 24 * 3600 * 1000;
const memory = new Map<string, HotelContent>();

function safeId(id: string): string {
  return String(id || "").replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 120);
}

function fileFor(supplier: HotelSupplierId, id: string): string {
  return path.join(ROOT, supplier, `${safeId(id)}.json`);
}

export async function getCachedContent(
  supplier: HotelSupplierId,
  id: string,
  ttlMs = DEFAULT_TTL_MS
): Promise<HotelContent | null> {
  const key = `${supplier}:${id}`;
  const mem = memory.get(key);
  if (mem && Date.now() - Date.parse(mem.fetchedAt) < ttlMs) return mem;
  try {
    const raw = await fs.readFile(fileFor(supplier, id), "utf8");
    const parsed = JSON.parse(raw) as HotelContent;
    if (!parsed?.fetchedAt || Date.now() - Date.parse(parsed.fetchedAt) > ttlMs) return null;
    memory.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export async function getCachedContentMany(
  supplier: HotelSupplierId,
  ids: string[],
  ttlMs = DEFAULT_TTL_MS
): Promise<Map<string, HotelContent>> {
  const out = new Map<string, HotelContent>();
  await Promise.all(
    ids.map(async (id) => {
      const hit = await getCachedContent(supplier, id, ttlMs);
      if (hit) out.set(id, hit);
    })
  );
  return out;
}

export async function putCachedContent(content: HotelContent): Promise<void> {
  const key = `${content.supplier}:${content.supplierHotelId}`;
  memory.set(key, content);
  if (memory.size > 4000) {
    const first = memory.keys().next().value;
    if (first) memory.delete(first);
  }
  try {
    const file = fileFor(content.supplier, content.supplierHotelId);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(content), { mode: 0o600 });
  } catch {
    /* disk cache is best-effort */
  }
}

export async function listCachedContentIds(supplier: HotelSupplierId): Promise<string[]> {
  try {
    const files = await fs.readdir(path.join(ROOT, supplier));
    return files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  } catch {
    return [];
  }
}
