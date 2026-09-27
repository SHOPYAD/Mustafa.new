/**
 * Persists identity-resolver results (plan A1):
 *   - `hotel_masters`       one row per physical hotel (merged across suppliers)
 *   - `hotel_supplier_refs` gets `master`, `matchMethod`, `confidence`, `status`
 *   - `hotel_identity_reviews` grey-zone pairs for manual confirmation in the admin
 *
 * Manual decisions (confirmed / rejected pairs) are loaded as overrides so the automatic
 * clustering never undoes an admin decision.
 */

import type PocketBase from "pocketbase";
import type { HotelSupplierId } from "@/lib/providers/adapters/common/types";
import { contentPb, type SupplierRefRecord } from "./content-store";
import { clusterIdentities, identityPairKey, masterIdFor, type IdentityInput, type IdentityOverrides, type IdentityReviewCandidate } from "./identity-resolver";
import { supplyLogger } from "./telemetry";
import { getCachedContent } from "./content-cache";

export interface IdentityReviewRecord {
  id?: string;
  pairKey: string;
  a: { supplier: HotelSupplierId; id: string; name: string };
  b: { supplier: HotelSupplierId; id: string; name: string };
  distanceM: number;
  nameSimilarity: number;
  status: "pending" | "confirmed" | "rejected";
  decidedBy?: string;
  decidedAt?: string;
  created?: string;
}

export interface MasterRecord {
  id?: string;
  masterId: string;
  name: string;
  nameAr?: string;
  city?: string;
  countryCode?: string;
  address?: string;
  lat?: number;
  lng?: number;
  stars?: number;
  giataCode?: string;
  chain?: string;
  description?: Record<string, string>;
  checkInTime?: string;
  checkOutTime?: string;
  policies?: string[];
  reviewScore?: { source: string; score: number; scale: number; count?: number } | null;
  phone?: string;
  email?: string;
  website?: string;
  heroImage?: string;
  imageCount?: number;
  suppliers?: Array<{ supplier: HotelSupplierId; supplierHotelId: string }>;
  status?: "active" | "needs_review" | "hidden";
  lastMergedAt?: string;
}

/** Loads all manual decisions as overrides for the clustering core. */
export async function loadIdentityOverrides(pb?: PocketBase | null): Promise<IdentityOverrides> {
  const overrides: IdentityOverrides = { confirm: new Set(), reject: new Set() };
  const client = pb ?? (await contentPb());
  if (!client) return overrides;
  try {
    const rows = await client.collection("hotel_identity_reviews").getFullList<IdentityReviewRecord>({ filter: 'status != "pending"', fields: "pairKey,status" });
    for (const r of rows) (r.status === "confirmed" ? overrides.confirm : overrides.reject).add(r.pairKey);
  } catch (err) {
    supplyLogger.warn({ err: String(err) }, "loadIdentityOverrides failed");
  }
  return overrides;
}

function refToIdentity(ref: SupplierRefRecord): IdentityInput & { ref: SupplierRefRecord } {
  return {
    provider: ref.supplier,
    id: ref.supplierHotelId,
    supplierHotelId: ref.supplierHotelId,
    name: ref.supplierName || "",
    city: ref.city,
    lat: ref.lat,
    lng: ref.lng,
    stars: ref.stars,
    giataCode: ref.giataCode,
    ref,
  };
}

async function upsertReviews(pb: PocketBase, candidates: IdentityReviewCandidate[]): Promise<number> {
  let created = 0;
  for (const c of candidates) {
    const pairKey = identityPairKey({ provider: c.a.supplier, id: c.a.id }, { provider: c.b.supplier, id: c.b.id });
    try {
      await pb.collection("hotel_identity_reviews").getFirstListItem(pb.filter("pairKey = {:k}", { k: pairKey }));
    } catch {
      try {
        await pb.collection("hotel_identity_reviews").create({ pairKey, a: c.a, b: c.b, distanceM: c.distanceM, nameSimilarity: c.nameSimilarity, status: "pending" });
        created += 1;
      } catch (err) {
        supplyLogger.warn({ err: String(err), pairKey }, "identity review create failed");
      }
    }
  }
  return created;
}

/** Builds the master row from the members' refs + cached content (richest field wins). */
async function buildMaster(members: Array<IdentityInput & { ref: SupplierRefRecord }>, masterId: string): Promise<MasterRecord> {
  const contents = await Promise.all(members.map((m) => getCachedContent(m.provider, m.supplierHotelId!)));
  const withDesc = contents.filter((c) => c?.description).sort((a, b) => (b!.description!.length || 0) - (a!.description!.length || 0));
  const description: Record<string, string> = {};
  for (const c of withDesc) {
    const lang = (c!.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
    if (!description[lang]) description[lang] = c!.description!;
  }
  const geo = members.find((m) => m.lat != null && m.lng != null && (m.lat || m.lng));
  const stars = members.find((m) => m.stars)?.stars;
  const giata = members.find((m) => m.giataCode)?.giataCode;
  const anyContent = contents.find(Boolean);
  const hero = contents.flatMap((c) => c?.images || []).find((i) => i.category === "exterior")?.url || contents.flatMap((c) => c?.images || [])[0]?.url;
  const imageCount = contents.reduce((n, c) => n + (c?.images.length || 0), 0);
  // Prefer a supplier that provides GIATA (structured content) for the display name.
  const primary = members.find((m) => m.giataCode) || members.find((m) => m.provider === "hotelbeds") || members[0];
  return {
    masterId,
    name: primary.name,
    city: members.find((m) => m.city)?.city,
    countryCode: members.find((m) => m.ref.countryCode)?.ref.countryCode,
    address: contents.find((c) => c?.address)?.address,
    lat: geo?.lat,
    lng: geo?.lng,
    stars,
    giataCode: giata,
    chain: contents.find((c) => c?.chain)?.chain,
    description,
    checkInTime: contents.find((c) => c?.checkInTime)?.checkInTime,
    checkOutTime: contents.find((c) => c?.checkOutTime)?.checkOutTime,
    policies: contents.find((c) => c?.policies?.length)?.policies,
    reviewScore: contents.find((c) => c?.reviewScore)?.reviewScore ?? null,
    phone: anyContent?.phone,
    email: anyContent?.email,
    website: anyContent?.website,
    heroImage: hero,
    imageCount,
    suppliers: members.map((m) => ({ supplier: m.provider, supplierHotelId: m.supplierHotelId! })),
    status: "active",
    lastMergedAt: new Date().toISOString(),
  };
}

export interface RebuildResult {
  refs: number;
  masters: number;
  multiSupplier: number;
  pendingReviewsCreated: number;
}

/**
 * Re-clusters the supplier refs of a destination (or an explicit set of refs), writes the masters and
 * links refs → master. Safe to run repeatedly; masters are keyed by a stable `masterId`.
 */
export async function rebuildMastersForRefs(refs: SupplierRefRecord[], pb?: PocketBase | null): Promise<RebuildResult> {
  const client = pb ?? (await contentPb());
  const result: RebuildResult = { refs: refs.length, masters: 0, multiSupplier: 0, pendingReviewsCreated: 0 };
  if (!client || !refs.length) return result;
  const overrides = await loadIdentityOverrides(client);
  const items = refs.filter((r) => r.status !== "rejected" && r.supplierName).map(refToIdentity);
  const { groups, pendingReview } = clusterIdentities(items, overrides);
  result.pendingReviewsCreated = await upsertReviews(client, pendingReview);

  for (const members of groups) {
    const anchor = members.find((m) => m.giataCode) || members[0];
    const masterId = masterIdFor(anchor);
    const master = await buildMaster(members, masterId);
    try {
      const existing = await client.collection("hotel_masters").getFirstListItem<MasterRecord>(client.filter("masterId = {:m}", { m: masterId })).catch(() => null);
      if (existing) await client.collection("hotel_masters").update(existing.id!, master);
      else await client.collection("hotel_masters").create(master);
      result.masters += 1;
      if (members.length > 1) result.multiSupplier += 1;
    } catch (err) {
      supplyLogger.warn({ err: String(err), masterId }, "hotel_masters upsert failed");
      continue;
    }
    const method: SupplierRefRecord["matchMethod"] =
      members.length === 1 ? "single" : members.every((m) => m.giataCode) ? "giata" : members.some((m, i) => members.slice(i + 1).some((o) => overrides.confirm.has(identityPairKey(m, o)))) ? "manual" : "name_geo";
    const confidence = members.length === 1 ? 1 : method === "giata" || method === "manual" ? 1 : 0.85;
    const batch = client.createBatch();
    for (const m of members) {
      batch.collection("hotel_supplier_refs").update(m.ref.id, { master: masterId, matchMethod: method, confidence, status: m.ref.status === "confirmed" ? "confirmed" : "auto" });
    }
    try {
      await batch.send();
    } catch (err) {
      supplyLogger.warn({ err: String(err), masterId }, "ref → master link failed");
    }
    for (const m of members) {
      if (m.ref.master === masterId) continue;
      const filter = client.filter("supplier = {:s} && supplierHotelId = {:id}", { s: m.provider, id: m.supplierHotelId });
      for (const col of ["hotel_images", "hotel_rooms_content", "hotel_facilities", "hotel_pois"]) {
        try {
          const rows = await client.collection(col).getFullList<{ id: string }>({ filter, fields: "id" });
          for (let i = 0; i < rows.length; i += 400) {
            const b = client.createBatch();
            for (const row of rows.slice(i, i + 400)) b.collection(col).update(row.id, { master: masterId });
            await b.send();
          }
        } catch (err) {
          supplyLogger.warn({ err: String(err), col }, "child master propagation failed");
        }
      }
    }
  }
  return result;
}

export async function rebuildMastersForDestination(destinationKey: string, pb?: PocketBase | null): Promise<RebuildResult> {
  const client = pb ?? (await contentPb());
  if (!client) return { refs: 0, masters: 0, multiSupplier: 0, pendingReviewsCreated: 0 };
  const refs = await client.collection("hotel_supplier_refs").getFullList<SupplierRefRecord>({ filter: client.filter("destinationKey = {:d}", { d: destinationKey }) });
  return rebuildMastersForRefs(refs, client);
}

/** Refs with no master yet (e.g. persisted from a live search) — clustered against their neighbours by city/country. */
export async function rebuildOrphanRefs(limit = 500, pb?: PocketBase | null): Promise<RebuildResult> {
  const client = pb ?? (await contentPb());
  if (!client) return { refs: 0, masters: 0, multiSupplier: 0, pendingReviewsCreated: 0 };
  const orphans = await client.collection("hotel_supplier_refs").getList<SupplierRefRecord>(1, limit, { filter: 'master = "" || master = null' });
  if (!orphans.items.length) return { refs: 0, masters: 0, multiSupplier: 0, pendingReviewsCreated: 0 };
  // Pull the neighbourhood (same city+country) so orphans can merge with already-known hotels.
  const cities = new Set(orphans.items.map((r) => `${(r.countryCode || "").toUpperCase()}|${(r.city || "").toLowerCase()}`));
  const pool = new Map<string, SupplierRefRecord>();
  for (const r of orphans.items) pool.set(r.id, r);
  for (const key of cities) {
    const [cc, city] = key.split("|");
    if (!city) continue;
    try {
      const rows = await client.collection("hotel_supplier_refs").getList<SupplierRefRecord>(1, 2000, { filter: client.filter("countryCode = {:cc} && city ~ {:city}", { cc, city }) });
      for (const r of rows.items) pool.set(r.id, r);
    } catch {
      /* ignore */
    }
  }
  return rebuildMastersForRefs(Array.from(pool.values()), client);
}

/* ------------------------------------------------------------------------------------------------
 * Admin review API
 * ---------------------------------------------------------------------------------------------- */

export async function listIdentityReviews(status: IdentityReviewRecord["status"] = "pending", page = 1, perPage = 50) {
  const pb = await contentPb();
  if (!pb) return { items: [] as IdentityReviewRecord[], totalItems: 0, page, perPage };
  const res = await pb.collection("hotel_identity_reviews").getList<IdentityReviewRecord>(page, perPage, { filter: pb.filter("status = {:s}", { s: status }), sort: "-created" });
  return { items: res.items, totalItems: res.totalItems, page: res.page, perPage: res.perPage };
}

export async function decideIdentityReview(id: string, decision: "confirmed" | "rejected", decidedBy: string): Promise<IdentityReviewRecord | null> {
  const pb = await contentPb();
  if (!pb) return null;
  const rec = await pb.collection("hotel_identity_reviews").update<IdentityReviewRecord>(id, { status: decision, decidedBy, decidedAt: new Date().toISOString() });
  // Re-cluster the two refs (and their neighbourhood) so the decision takes effect immediately.
  const refs: SupplierRefRecord[] = [];
  for (const side of [rec.a, rec.b]) {
    try {
      refs.push(await pb.collection("hotel_supplier_refs").getFirstListItem<SupplierRefRecord>(pb.filter("supplier = {:s} && supplierHotelId = {:id}", { s: side.supplier, id: side.id })));
    } catch {
      /* ref may not be persisted yet */
    }
  }
  if (refs.length) {
    const pool = new Map<string, SupplierRefRecord>();
    for (const r of refs) {
      pool.set(r.id, r);
      const others = await pb
        .collection("hotel_supplier_refs")
        .getList<SupplierRefRecord>(1, 500, { filter: pb.filter("master = {:m} && master != \"\"", { m: r.master || "__none__" }) })
        .catch(() => ({ items: [] as SupplierRefRecord[] }));
      for (const o of others.items) pool.set(o.id, o);
    }
    await rebuildMastersForRefs(Array.from(pool.values()), pb);
  }
  return rec;
}
