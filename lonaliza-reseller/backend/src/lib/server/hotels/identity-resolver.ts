/**
 * Hotel identity resolver — groups offers from several suppliers that describe the same
 * physical property into one "master" hotel (Trip.com style).
 *
 * Matching order:
 *   1. GIATA code equality (strongest signal, Hotelbeds/RateHawk expose it).
 *   2. Normalized name equality (or high token overlap) + geo distance < 150 m + compatible stars.
 *   3. Exact normalized name + same city when one side has no coordinates.
 *
 * Grey-zone candidates (name similar but 150–400 m apart) are NOT merged automatically; they are
 * reported through `pendingReview` so an admin can confirm them (persisted in A1 via PocketBase).
 */

import crypto from "crypto";
import type { HotelSearchCard, HotelSupplierId, RatePlan } from "@/lib/providers/adapters/common/types";
import { distanceMeters, normalizeHotelName, uniq } from "./normalize";

export interface MergedHotel {
  masterId: string;
  name: string;
  city: string;
  countryCode?: string;
  address?: string;
  lat?: number;
  lng?: number;
  stars?: number;
  giataCode?: string;
  reviewScore?: { source: string; score: number; scale: number; count?: number };
  description?: string;
  amenities: string[];
  images: string[];
  /** One card per supplier (cheapest first). */
  offers: HotelSearchCard[];
  /** Cheapest rate plan across suppliers (already the card price). */
  cheapest: { supplier: HotelSupplierId; cardId: string; price: number; currency: string; ratePlan?: RatePlan };
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  payAtHotel: boolean;
  nights: number;
  checkIn: string;
  checkOut: string;
  /** Distance from the searched destination centre, when known. */
  distanceFromCenterM?: number;
}

export interface IdentityReviewCandidate {
  a: { supplier: HotelSupplierId; id: string; name: string };
  b: { supplier: HotelSupplierId; id: string; name: string };
  distanceM: number;
  nameSimilarity: number;
}

/** Minimal shape the clustering core needs — satisfied by HotelSearchCard and by persisted supplier refs. */
export interface IdentityInput {
  provider: HotelSupplierId;
  /** Public card id (hb_123) or the supplier id itself. */
  id: string;
  /** Supplier hotel id — preferred for pair keys so live cards and persisted refs agree. */
  supplierHotelId?: string;
  name: string;
  city?: string;
  lat?: number;
  lng?: number;
  stars?: number;
  giataCode?: string;
}

/** Manual decisions from the admin review table. Keys come from `identityPairKey`. */
export interface IdentityOverrides {
  confirm: Set<string>;
  reject: Set<string>;
}

export function identityKey(x: { provider: HotelSupplierId; id: string; supplierHotelId?: string }): string {
  return `${x.provider}:${x.supplierHotelId || x.id}`;
}

export function identityPairKey(a: { provider: HotelSupplierId; id: string; supplierHotelId?: string }, b: { provider: HotelSupplierId; id: string; supplierHotelId?: string }): string {
  const ka = identityKey(a);
  const kb = identityKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

const GENERIC_TOKENS = new Set(["hotel", "hotels", "otel", "resort", "spa", "the", "and", "by", "de", "la", "le", "el", "al", "suites", "suite", "apartments", "apart", "residence", "boutique", "palace", "inn", "istanbul", "antalya", "dubai", "paris", "london"]);

function tokens(name: string): string[] {
  return normalizeHotelName(name)
    .split(" ")
    .filter((t) => t && !GENERIC_TOKENS.has(t));
}

export function nameSimilarity(a: string, b: string): number {
  const na = normalizeHotelName(a);
  const nb = normalizeHotelName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return na.includes(nb) || nb.includes(na) ? 0.85 : 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const jaccard = inter / (ta.size + tb.size - inter);
  // Containment ("Doubletree City Centre" ⊂ "Doubletree by Hilton City Centre") only counts when the
  // shorter name has ≥2 distinctive tokens, and it is damped when the lengths differ a lot so that
  // "City" alone never matches "Antalya City Hotel" to "Doubletree Antalya City Centre".
  const minSize = Math.min(ta.size, tb.size);
  const containment = minSize >= 2 ? (inter / minSize) * 0.95 * Math.min(1, minSize / Math.max(ta.size, tb.size) + 0.5) : 0;
  return Math.max(jaccard, containment);
}

function starsCompatible(a?: number, b?: number): boolean {
  if (!a || !b) return true;
  return Math.abs(a - b) <= 0.5;
}

export function masterIdFor(card: IdentityInput): string {
  const basis = card.giataCode
    ? `giata:${card.giataCode}`
    : `${normalizeHotelName(card.name)}|${card.lat != null && card.lng != null ? `${card.lat.toFixed(3)},${card.lng.toFixed(3)}` : normalizeHotelName(card.city || "")}`;
  return `m_${crypto.createHash("sha1").update(basis).digest("hex").slice(0, 16)}`;
}

function cheapestPlan(card: HotelSearchCard): RatePlan | undefined {
  const plans = card.ratePlans?.length ? card.ratePlans : card.roomGroups?.flatMap((g) => g.ratePlans) || [];
  if (!plans.length) return undefined;
  return plans.reduce((a, b) => (a.price.total <= b.price.total ? a : b));
}

function sameHotel(a: IdentityInput, b: IdentityInput, review: IdentityReviewCandidate[], overrides?: IdentityOverrides): boolean {
  if (a.provider === b.provider) return false;
  if (overrides) {
    const key = identityPairKey(a, b);
    if (overrides.reject.has(key)) return false;
    if (overrides.confirm.has(key)) return true;
  }
  if (a.giataCode && b.giataCode) return a.giataCode === b.giataCode;
  const sim = nameSimilarity(a.name, b.name);
  if (sim < 0.6) return false;
  if (!starsCompatible(a.stars, b.stars)) return false;
  const hasGeo = a.lat != null && a.lng != null && b.lat != null && b.lng != null && (a.lat || a.lng) && (b.lat || b.lng);
  if (hasGeo) {
    const d = distanceMeters(a.lat!, a.lng!, b.lat!, b.lng!);
    if (d <= 150 && sim >= 0.8) return true;
    if (d <= 60 && sim >= 0.6) return true;
    if (d <= 400 && sim >= 0.8) {
      review.push({ a: { supplier: a.provider, id: a.id, name: a.name }, b: { supplier: b.provider, id: b.id, name: b.name }, distanceM: Math.round(d), nameSimilarity: Math.round(sim * 100) / 100 });
    }
    return false;
  }
  // No coordinates on at least one side → require exact normalized name + same city.
  return sim >= 0.98 && normalizeHotelName(a.city || "") === normalizeHotelName(b.city || "");
}

/**
 * Generic clustering core: groups items that describe the same physical hotel.
 * Coarse geo bucketing (≈1 km cells) keeps this ~O(n) for tens of thousands of items.
 */
export function clusterIdentities<T extends IdentityInput>(
  items: T[],
  overrides?: IdentityOverrides
): { groups: T[][]; pendingReview: IdentityReviewCandidate[] } {
  const review: IdentityReviewCandidate[] = [];
  const groups: T[][] = [];
  const byGiata = new Map<string, number>();
  const buckets = new Map<string, number[]>();
  const cellOf = (lat?: number, lng?: number) => (lat != null && lng != null && (lat || lng) ? `${Math.round(lat * 100)}:${Math.round(lng * 100)}` : "");
  // Confirmed manual pairs must be able to find each other even without coordinates.
  const manualPartners = new Map<string, Set<string>>();
  if (overrides) {
    for (const key of overrides.confirm) {
      const [ka, kb] = key.split("|");
      if (!ka || !kb) continue;
      manualPartners.set(ka, (manualPartners.get(ka) || new Set()).add(kb));
      manualPartners.set(kb, (manualPartners.get(kb) || new Set()).add(ka));
    }
  }
  const groupOfKey = new Map<string, number>();

  for (const item of items) {
    if (!item || !item.name) continue;
    const selfKey = identityKey(item);
    let target = -1;
    if (item.giataCode && byGiata.has(item.giataCode)) {
      const idx = byGiata.get(item.giataCode)!;
      if (!overrides || !groups[idx].some((g) => overrides.reject.has(identityPairKey(g, item)))) target = idx;
    }
    if (target < 0) {
      for (const partner of manualPartners.get(selfKey) || []) {
        const idx = groupOfKey.get(partner);
        if (idx != null) {
          target = idx;
          break;
        }
      }
    }
    if (target < 0) {
      const cell = cellOf(item.lat, item.lng);
      const candidateIdx = new Set<number>();
      if (cell) {
        const [cy, cx] = cell.split(":").map(Number);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) for (const i of buckets.get(`${cy + dy}:${cx + dx}`) || []) candidateIdx.add(i);
      } else {
        for (let i = 0; i < groups.length; i++) candidateIdx.add(i);
      }
      for (const i of candidateIdx) {
        if (groups[i].some((g) => sameHotel(g, item, review, overrides))) {
          target = i;
          break;
        }
      }
    }
    if (target < 0) {
      target = groups.length;
      groups.push([item]);
    } else {
      groups[target].push(item);
    }
    groupOfKey.set(selfKey, target);
    if (item.giataCode && !byGiata.has(item.giataCode)) byGiata.set(item.giataCode, target);
    const cell = cellOf(item.lat, item.lng);
    if (cell) {
      const arr = buckets.get(cell) || [];
      if (!arr.includes(target)) arr.push(target);
      buckets.set(cell, arr);
    }
  }
  return { groups, pendingReview: review };
}

export function groupHotelCards(
  cards: HotelSearchCard[],
  center?: { lat: number; lng: number },
  overrides?: IdentityOverrides
): { hotels: MergedHotel[]; pendingReview: IdentityReviewCandidate[] } {
  const priced = cards.filter((c) => c && c.name && c.price > 0);
  const { groups, pendingReview: review } = clusterIdentities(priced, overrides);

  const hotels: MergedHotel[] = groups.map((offers) => {
    // One offer per supplier: keep the cheapest card per supplier.
    const bySupplier = new Map<HotelSupplierId, HotelSearchCard>();
    for (const o of offers) {
      const prev = bySupplier.get(o.provider);
      if (!prev || o.price < prev.price) bySupplier.set(o.provider, o);
    }
    const uniqueOffers = Array.from(bySupplier.values()).sort((a, b) => a.price - b.price);
    const best = uniqueOffers[0];
    // Content priority: richest description/images wins per field.
    const withGeo = uniqueOffers.find((o) => o.lat != null && o.lng != null && (o.lat || o.lng));
    const withStars = uniqueOffers.find((o) => o.stars);
    const withDesc = uniqueOffers.slice().sort((a, b) => (b.description?.length || 0) - (a.description?.length || 0))[0];
    const review = uniqueOffers.find((o) => o.reviewScore);
    const allPlans = uniqueOffers.flatMap((o) => (o.ratePlans?.length ? o.ratePlans : o.roomGroups?.flatMap((g) => g.ratePlans) || []));
    const knownPlans = allPlans.filter((p) => p.supplierContext?.needsAvailability !== "1");
    const plan = cheapestPlan(best);
    const merged: MergedHotel = {
      masterId: masterIdFor(uniqueOffers.find((o) => o.giataCode) || best),
      name: best.name,
      city: best.city || uniqueOffers.find((o) => o.city)?.city || "",
      countryCode: uniqueOffers.find((o) => o.countryCode)?.countryCode,
      address: uniqueOffers.find((o) => o.address)?.address,
      lat: withGeo?.lat,
      lng: withGeo?.lng,
      stars: withStars?.stars,
      giataCode: uniqueOffers.find((o) => o.giataCode)?.giataCode,
      reviewScore: review?.reviewScore,
      description: withDesc?.description,
      amenities: uniq(uniqueOffers.flatMap((o) => o.amenities || [])).slice(0, 40),
      images: uniq(uniqueOffers.flatMap((o) => [o.heroImage, o.image, ...(o.images || [])].filter(Boolean) as string[])).slice(0, 40),
      offers: uniqueOffers,
      cheapest: { supplier: best.provider, cardId: best.id, price: best.price, currency: best.currency, ratePlan: plan },
      freeCancellation: knownPlans.some((p) => p.refundable) || uniqueOffers.some((o) => Boolean((o.raw as any)?.has_free_cancellation)),
      breakfastIncluded:
        knownPlans.some((p) => ["BB", "HB", "FB", "AI", "UAI"].includes(p.board)) ||
        uniqueOffers.some((o) => (Array.isArray((o.raw as any)?.boards) ? (o.raw as any).boards : []).some((b: string) => ["BB", "HB", "FB", "AI", "UAI"].includes(b))),
      payAtHotel: knownPlans.some((p) => p.paymentType === "pay_at_hotel") || uniqueOffers.some((o) => Boolean((o.raw as any)?.payAtHotel)),
      nights: best.nights,
      checkIn: best.checkIn,
      checkOut: best.checkOut,
    };
    if (center && merged.lat != null && merged.lng != null && (merged.lat || merged.lng)) {
      merged.distanceFromCenterM = Math.round(distanceMeters(center.lat, center.lng, merged.lat, merged.lng));
    }
    return merged;
  });

  return { hotels, pendingReview: review };
}
