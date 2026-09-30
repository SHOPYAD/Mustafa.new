import type PocketBase from "pocketbase";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";

export interface FieldMeta {
  name: string;
  type: string;
  required: boolean;
  values: string[] | null;
  maxSelect: number | null;
  collectionId: string | null;
}

export interface CollectionMeta {
  name: string;
  type: string;
  fields: FieldMeta[];
}

/** حقول لا تخرج من الخادم أبدًا. */
export const SECRET_FIELD = /(pass|token|secret|api_?key|private_?key|hash|salt|otp|pin_code)/i;
/** مجموعات يمنع تصفحها أو تعديلها من الاستوديو. */
export const BLOCKED_COLLECTION = /^_/;

let cache: { at: number; map: Map<string, CollectionMeta> } | null = null;

export async function listCollections(pb?: PocketBase): Promise<Map<string, CollectionMeta>> {
  if (cache && Date.now() - cache.at < 60_000) return cache.map;
  const client = pb ?? (await createAdminPocketBase());
  const all = await client.collections.getFullList({ batch: 200 });
  const map = new Map<string, CollectionMeta>();
  for (const c of all as unknown as { name: string; type: string; fields?: Record<string, unknown>[] }[]) {
    if (BLOCKED_COLLECTION.test(c.name)) continue;
    map.set(c.name, {
      name: c.name,
      type: c.type,
      fields: (c.fields ?? [])
        .filter((f) => !f.hidden && !SECRET_FIELD.test(String(f.name)))
        .map((f) => ({
          name: String(f.name),
          type: String(f.type),
          required: !!f.required,
          values: Array.isArray(f.values) ? (f.values as string[]) : null,
          maxSelect: typeof f.maxSelect === "number" ? (f.maxSelect as number) : null,
          collectionId: typeof f.collectionId === "string" ? (f.collectionId as string) : null,
        })),
    });
  }
  cache = { at: Date.now(), map };
  return map;
}

export async function getCollectionMeta(name: string): Promise<CollectionMeta | null> {
  return (await listCollections()).get(name) ?? null;
}

export function redactRecord(meta: CollectionMeta, record: Record<string, unknown>): Record<string, unknown> {
  const allowed = new Set(["id", "created", "updated", "collectionName", ...meta.fields.map((f) => f.name)]);
  return Object.fromEntries(Object.entries(record).filter(([k]) => allowed.has(k) && !SECRET_FIELD.test(k)));
}

/** فلتر بحث نصي آمن على الحقول النصية. */
export function searchFilter(meta: CollectionMeta, q: string): string {
  const term = q.replace(/["\\]/g, "").trim().slice(0, 80);
  if (!term) return "";
  const fields = meta.fields.filter((f) => ["text", "email", "editor", "url", "select"].includes(f.type)).slice(0, 8);
  if (!fields.length) return `id ~ "${term}"`;
  return fields.map((f) => `${f.name} ~ "${term}"`).join(" || ");
}
