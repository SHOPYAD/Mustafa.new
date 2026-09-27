import { promises as fs } from "fs";
import path from "path";
import PocketBase from "pocketbase";
import { tryCreateAdminPocketBase, getPocketBaseUrl } from "@/lib/pocketbase/admin";

const DATA_DIR = path.join(process.cwd(), ".data");

/**
 * PocketBase-First Setting Retriever
 * Reads from PocketBase `site_settings` collection, with disk fallback.
 */
export async function getPocketBaseSetting<T>(key: string, fallbackFileName: string, defaultValue: T): Promise<T> {
  const pbUrl = await getPocketBaseUrl();
  try {
    const pb = new PocketBase(pbUrl);
    pb.autoCancellation(false);
    const record = await pb.collection("site_settings").getFirstListItem<{ value: T }>(`key = "${key}"`, {
      cache: "no-store",
    });
    if (record && record.value != null) {
      return record.value;
    }
  } catch {
    // Graceful fallback to disk if PocketBase is not reached
  }

  // Disk fallback
  try {
    const filePath = path.join(DATA_DIR, fallbackFileName);
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * PocketBase-First Setting Saver (Dual-Write)
 * Saves to PocketBase `site_settings` and mirrors to disk for sub-millisecond resilience.
 */
export async function savePocketBaseSetting<T>(
  key: string,
  value: T,
  fallbackFileName: string,
  category?: string
): Promise<void> {
  // 1. Dual-write to disk mirror first for immediate zero-latency local caching
  try {
    const filePath = path.join(DATA_DIR, fallbackFileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
  } catch (err) {
    console.warn(`[savePocketBaseSetting] Failed to write local disk mirror for ${key}:`, err);
  }

  // 2. Persist to PocketBase site_settings
  try {
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      let recordId: string | null = null;
      try {
        const existing = await pb.collection("site_settings").getFirstListItem(`key = "${key}"`);
        recordId = existing.id;
      } catch {
        recordId = null;
      }

      if (recordId) {
        await pb.collection("site_settings").update(recordId, {
          value,
          ...(category ? { category } : {}),
        });
      } else {
        await pb.collection("site_settings").create({
          key,
          value,
          category: category || "general",
        });
      }
    }
  } catch (err) {
    console.warn(`[savePocketBaseSetting] Failed to sync ${key} to PocketBase:`, err);
  }
}
