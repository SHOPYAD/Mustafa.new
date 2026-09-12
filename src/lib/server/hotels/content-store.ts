/**
 * PocketBase persistence for the static hotel content DB (plan A1).
 *
 * Collections (see `pocketbase/pb_migrations/1789050000_created_hotel_content.js`):
 *   hotel_destinations, hotel_masters, hotel_supplier_refs, hotel_images, hotel_rooms_content,
 *   hotel_facilities, hotel_pois, hotel_identity_reviews, hotel_content_jobs.
 *
 * Everything written here comes from a supplier payload (`HotelContent`) — never from templates.
 * Child rows (images/rooms/facilities/pois) are replaced atomically per (supplier, supplierHotelId)
 * using the PocketBase batch API; a content hash on the ref row avoids rewriting unchanged hotels.
 */

import crypto from "crypto";
import type PocketBase from "pocketbase";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelSupplierId } from "@/lib/providers/adapters/common/types";
import type { HotelContent } from "./content-types";
import { supplyLogger } from "./telemetry";

const BATCH_SIZE = 400;
const PB_REAUTH_MS = 45 * 60 * 1000;

let pbClient: PocketBase | null = null;
let pbAuthedAt = 0;
let pbInflight: Promise<PocketBase | null> | null = null;

/** Shared superuser client for the content DB (re-authenticated every 45 minutes). */
export async function contentPb(): Promise<PocketBase | null> {
  if (pbClient && Date.now() - pbAuthedAt < PB_REAUTH_MS) return pbClient;
  if (pbInflight) return pbInflight;
  pbInflight = (async () => {
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      pbClient = pb;
      pbAuthedAt = Date.now();
    }
    return pb;
  })().finally(() => {
    pbInflight = null;
  });
  return pbInflight;
}

export interface SupplierRefRecord {
  id: string;
  master?: string;
  supplier: HotelSupplierId;
  supplierHotelId: string;
  supplierName?: string;
  city?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  stars?: number;
  giataCode?: string;
  destinationKey?: string;
  matchMethod?: "single" | "giata" | "name_geo" | "manual";
  confidence?: number;
  status?: "auto" | "confirmed" | "rejected" | "pending_review";
  language?: string;
  contentHash?: string;
  contentFetchedAt?: string;
  hasDescription?: boolean;
  imageCount?: number;
  roomCount?: number;
}

export interface DestinationRecord {
  id?: string;
  key: string;
  nameEn?: string;
  nameAr?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  iata?: string;
  hotelbedsCode?: string;
  ratehawkRegionId?: string;
  geoPlaceId?: string;
  radiusKm?: number;
  priority?: number;
  hotelCount?: number;
  hotelbedsIngestedAt?: string;
  ratehawkIngestedAt?: string;
  travelportIngestedAt?: string;
}

/** Stable hash of the parts of a HotelContent that matter for display. */
export function contentHash(content: HotelContent): string {
  const basis = {
    n: content.name,
    d: content.description || "",
    a: content.address || "",
    s: content.stars || 0,
    g: content.giataCode || "",
    ci: content.checkInTime || "",
    co: content.checkOutTime || "",
    i: content.images.map((i) => `${i.url}|${i.category || ""}|${i.roomCode || ""}`),
    r: content.rooms.map((r) => `${r.code}|${r.name}|${r.sizeSqm || ""}|${r.beds || ""}|${r.images.length}|${r.facilities.length}`),
    f: content.facilities.map((f) => `${f.group}|${f.name}|${f.code || ""}`),
    p: content.pois.map((p) => `${p.name}|${p.distanceM || ""}`),
    po: content.policies || [],
    rs: content.reviewScore || null,
  };
  return crypto.createHash("sha1").update(JSON.stringify(basis)).digest("hex");
}

async function listIds(pb: PocketBase, collection: string, filter: string): Promise<string[]> {
  const ids: string[] = [];
  let page = 1;
  for (;;) {
    const res = await pb.collection(collection).getList<{ id: string }>(page, 500, { filter, fields: "id", skipTotal: true });
    ids.push(...res.items.map((i) => i.id));
    if (res.items.length < 500) break;
    page += 1;
    if (page > 200) break;
  }
  return ids;
}

async function sendInChunks(pb: PocketBase, ops: Array<(batch: ReturnType<PocketBase["createBatch"]>) => void>): Promise<void> {
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const batch = pb.createBatch();
    for (const op of ops.slice(i, i + BATCH_SIZE)) op(batch);
    await batch.send();
  }
}

export async function findSupplierRef(pb: PocketBase, supplier: HotelSupplierId, supplierHotelId: string): Promise<SupplierRefRecord | null> {
  try {
    return await pb
      .collection("hotel_supplier_refs")
      .getFirstListItem<SupplierRefRecord>(pb.filter("supplier = {:s} && supplierHotelId = {:id}", { s: supplier, id: supplierHotelId }));
  } catch {
    return null;
  }
}

export type PersistOutcome = "created" | "updated" | "unchanged" | "skipped" | "failed";

/**
 * Upserts the supplier ref and replaces its images / rooms / facilities / POIs.
 * Returns "unchanged" when the content hash matches the stored one (only the fetch timestamp is refreshed).
 */
export async function persistHotelContent(
  content: HotelContent,
  opts: { destinationKey?: string; master?: string; pb?: PocketBase | null } = {}
): Promise<PersistOutcome> {
  const pb = opts.pb ?? (await contentPb());
  if (!pb) return "skipped";
  const hash = contentHash(content);
  try {
    const existing = await findSupplierRef(pb, content.supplier, content.supplierHotelId);
    const refData: Omit<SupplierRefRecord, "id"> = {
      supplier: content.supplier,
      supplierHotelId: content.supplierHotelId,
      supplierName: content.name,
      city: content.city,
      countryCode: content.countryCode,
      lat: content.lat,
      lng: content.lng,
      stars: content.stars,
      giataCode: content.giataCode,
      destinationKey: opts.destinationKey ?? existing?.destinationKey,
      master: opts.master ?? existing?.master,
      matchMethod: existing?.matchMethod,
      confidence: existing?.confidence,
      status: existing?.status ?? "auto",
      language: content.language,
      contentHash: hash,
      contentFetchedAt: content.fetchedAt,
      hasDescription: Boolean(content.description),
      imageCount: content.images.length,
      roomCount: content.rooms.length,
    };

    if (existing && existing.contentHash === hash) {
      await pb.collection("hotel_supplier_refs").update(existing.id, { contentFetchedAt: content.fetchedAt, destinationKey: refData.destinationKey });
      return "unchanged";
    }

    const refId = existing
      ? (await pb.collection("hotel_supplier_refs").update<SupplierRefRecord>(existing.id, refData)).id
      : (await pb.collection("hotel_supplier_refs").create<SupplierRefRecord>(refData)).id;
    void refId;

    const filter = pb.filter("supplier = {:s} && supplierHotelId = {:id}", { s: content.supplier, id: content.supplierHotelId });
    const deletes: Array<(b: ReturnType<PocketBase["createBatch"]>) => void> = [];
    if (existing) {
      for (const col of ["hotel_images", "hotel_rooms_content", "hotel_facilities", "hotel_pois"]) {
        const ids = await listIds(pb, col, filter);
        for (const id of ids) deletes.push((b) => b.collection(col).delete(id));
      }
    }
    await sendInChunks(pb, deletes);

    const base = { master: refData.master || "", supplier: content.supplier, supplierHotelId: content.supplierHotelId };
    const creates: Array<(b: ReturnType<PocketBase["createBatch"]>) => void> = [];
    content.images.forEach((img, idx) =>
      creates.push((b) =>
        b.collection("hotel_images").create({ ...base, url: img.url.slice(0, 800), category: img.category || "other", roomCode: img.roomCode || "", order: img.order ?? idx, caption: (img.caption || "").slice(0, 300) })
      )
    );
    const seenRooms = new Set<string>();
    for (const room of content.rooms) {
      const code = String(room.code || room.name || "").slice(0, 120);
      if (!code || seenRooms.has(code)) continue;
      seenRooms.add(code);
      creates.push((b) =>
        b.collection("hotel_rooms_content").create({
          ...base,
          roomCode: code,
          name: (room.name || "").slice(0, 300),
          description: (room.description || "").slice(0, 5000),
          sizeSqm: room.sizeSqm,
          beds: (room.beds || "").slice(0, 300),
          maxAdults: room.maxAdults,
          maxChildren: room.maxChildren,
          maxPax: room.maxPax,
          facilities: room.facilities.slice(0, 200),
          images: room.images.slice(0, 60),
        })
      );
    }
    for (const f of content.facilities) {
      if (!f?.name) continue;
      creates.push((b) => b.collection("hotel_facilities").create({ ...base, group: (f.group || "").slice(0, 120), name: f.name.slice(0, 300), code: (f.code || "").slice(0, 40), fee: f.fee === true }));
    }
    for (const p of content.pois) {
      if (!p?.name) continue;
      creates.push((b) => b.collection("hotel_pois").create({ ...base, name: p.name.slice(0, 300), type: (p.type || "").slice(0, 60), distanceM: p.distanceM }));
    }
    await sendInChunks(pb, creates);
    return existing ? "updated" : "created";
  } catch (err) {
    supplyLogger.warn({ err: String(err), supplier: content.supplier, id: content.supplierHotelId }, "persistHotelContent failed");
    return "failed";
  }
}

export async function persistManyContents(
  contents: HotelContent[],
  opts: { destinationKey?: string; concurrency?: number } = {}
): Promise<Record<PersistOutcome, number>> {
  const out: Record<PersistOutcome, number> = { created: 0, updated: 0, unchanged: 0, skipped: 0, failed: 0 };
  const pb = await contentPb();
  if (!pb) {
    out.skipped = contents.length;
    return out;
  }
  const concurrency = Math.max(1, opts.concurrency ?? 4);
  let idx = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (idx < contents.length) {
        const c = contents[idx++];
        out[await persistHotelContent(c, { destinationKey: opts.destinationKey, pb })] += 1;
      }
    })
  );
  return out;
}

/* ------------------------------------------------------------------------------------------------
 * Destinations
 * ---------------------------------------------------------------------------------------------- */

export async function upsertDestinationRecord(dest: DestinationRecord, pb?: PocketBase | null): Promise<DestinationRecord | null> {
  const client = pb ?? (await contentPb());
  if (!client) return null;
  try {
    const existing = await client
      .collection("hotel_destinations")
      .getFirstListItem<DestinationRecord>(client.filter("key = {:k}", { k: dest.key }))
      .catch(() => null);
    if (existing) {
      const patch: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(dest)) if (v !== undefined && k !== "id") patch[k] = v;
      return await client.collection("hotel_destinations").update<DestinationRecord>(existing.id!, patch);
    }
    return await client.collection("hotel_destinations").create<DestinationRecord>(dest);
  } catch (err) {
    supplyLogger.warn({ err: String(err), key: dest.key }, "upsertDestinationRecord failed");
    return null;
  }
}

export async function countDestinations(pb?: PocketBase | null, filter = ""): Promise<number> {
  const client = pb ?? (await contentPb());
  if (!client) return 0;
  try {
    const res = await client.collection("hotel_destinations").getList(1, 1, { filter: filter || undefined });
    return res.totalItems;
  } catch {
    return 0;
  }
}

/** Next destination to ingest for a supplier: highest priority first, never/oldest ingested first. */
export async function nextDestinationFor(
  supplier: "hotelbeds" | "ratehawk" | "travelport",
  opts: { staleDays?: number; pb?: PocketBase | null } = {}
): Promise<DestinationRecord | null> {
  const client = opts.pb ?? (await contentPb());
  if (!client) return null;
  const field = supplier === "hotelbeds" ? "hotelbedsIngestedAt" : supplier === "ratehawk" ? "ratehawkIngestedAt" : "travelportIngestedAt";
  const codeField = supplier === "hotelbeds" ? "hotelbedsCode" : supplier === "ratehawk" ? "ratehawkRegionId" : "lat";
  const staleBefore = new Date(Date.now() - (opts.staleDays ?? 30) * 86400000).toISOString();
  try {
    const res = await client.collection("hotel_destinations").getList<DestinationRecord>(1, 1, {
      filter: client.filter(`${codeField} != "" && ${codeField} != null && (${field} = "" || ${field} = null || ${field} < {:stale})`, { stale: staleBefore }),
      sort: `priority,${field},key`,
    });
    return res.items[0] || null;
  } catch (err) {
    supplyLogger.warn({ err: String(err), supplier }, "nextDestinationFor failed");
    return null;
  }
}

/* ------------------------------------------------------------------------------------------------
 * Job log + stats
 * ---------------------------------------------------------------------------------------------- */

export interface ContentJobRecord {
  id?: string;
  kind: string;
  supplier?: string;
  destinationKey?: string;
  status: "running" | "done" | "failed" | "skipped";
  count?: number;
  requests?: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  meta?: Record<string, unknown>;
}

export async function logContentJob(job: ContentJobRecord, pb?: PocketBase | null): Promise<string | null> {
  const client = pb ?? (await contentPb());
  if (!client) return null;
  try {
    const rec = await client.collection("hotel_content_jobs").create<{ id: string }>({ ...job, startedAt: job.startedAt || new Date().toISOString() });
    return rec.id;
  } catch {
    return null;
  }
}

export async function finishContentJob(id: string | null, patch: Partial<ContentJobRecord>, pb?: PocketBase | null): Promise<void> {
  if (!id) return;
  const client = pb ?? (await contentPb());
  if (!client) return;
  try {
    await client.collection("hotel_content_jobs").update(id, { ...patch, finishedAt: patch.finishedAt || new Date().toISOString() });
  } catch {
    /* ignore */
  }
}

export interface ContentStoreStats {
  available: boolean;
  destinations: number;
  masters: number;
  refs: Record<string, number>;
  images: number;
  rooms: number;
  facilities: number;
  pois: number;
  pendingReviews: number;
  recentJobs: ContentJobRecord[];
}

export async function getContentStoreStats(): Promise<ContentStoreStats> {
  const pb = await contentPb();
  const empty: ContentStoreStats = { available: false, destinations: 0, masters: 0, refs: {}, images: 0, rooms: 0, facilities: 0, pois: 0, pendingReviews: 0, recentJobs: [] };
  if (!pb) return empty;
  const count = async (col: string, filter?: string) => {
    try {
      return (await pb.collection(col).getList(1, 1, { filter })).totalItems;
    } catch {
      return 0;
    }
  };
  const [destinations, masters, images, rooms, facilities, pois, pendingReviews, hb, rh, tp, se, jobs] = await Promise.all([
    count("hotel_destinations"),
    count("hotel_masters"),
    count("hotel_images"),
    count("hotel_rooms_content"),
    count("hotel_facilities"),
    count("hotel_pois"),
    count("hotel_identity_reviews", 'status = "pending"'),
    count("hotel_supplier_refs", 'supplier = "hotelbeds"'),
    count("hotel_supplier_refs", 'supplier = "ratehawk"'),
    count("hotel_supplier_refs", 'supplier = "travelport"'),
    count("hotel_supplier_refs", 'supplier = "seeru"'),
    pb
      .collection("hotel_content_jobs")
      .getList<ContentJobRecord>(1, 20, { sort: "-startedAt" })
      .then((r) => r.items)
      .catch(() => [] as ContentJobRecord[]),
  ]);
  return {
    available: true,
    destinations,
    masters,
    refs: { hotelbeds: hb, ratehawk: rh, travelport: tp, seeru: se },
    images,
    rooms,
    facilities,
    pois,
    pendingReviews,
    recentJobs: jobs,
  };
}
