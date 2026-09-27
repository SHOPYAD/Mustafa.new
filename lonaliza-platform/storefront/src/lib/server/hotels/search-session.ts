/**
 * Supply orchestrator + progressive search sessions.
 *
 * A search session (`lonaliza:hotels:search:{sid}`, 10 min) fans out to every enabled supplier with
 * an individual time budget (Promise.allSettled semantics — one failing supplier never hides the
 * others), merges identical hotels through the identity resolver, and stores the merged list in
 * Redis. The first response is returned as soon as the fastest supplier finishes; the client keeps
 * polling with `sid` until `progress.complete` is true, and pages through the merged list.
 */

import crypto from "crypto";
import { getProvidersRegistry, providerHasRequiredFields, saveProviderRuntime } from "@/lib/server/providers-registry-store";
import { HotelbedsHotelAdapter } from "@/lib/providers/adapters/hotelbeds/HotelbedsHotelAdapter";
import { RateHawkHotelAdapter } from "@/lib/providers/adapters/ratehawk/RateHawkHotelAdapter";
import { TravelportHotelAdapter } from "@/lib/providers/adapters/travelport/TravelportHotelAdapter";
import { SeeruHotelAdapter } from "@/lib/providers/adapters/seeru/seeruHotelAdapter";
import type { HotelSearchCard, HotelSupplierId, SupplierSearchStats } from "@/lib/providers/adapters/common/types";
import { cacheGet, cacheSet } from "./cache";
import { resolveDestination, type ResolvedDestination } from "./destinations";
import { groupHotelCards, type IdentityReviewCandidate, type MergedHotel } from "./identity-resolver";
import { nightsBetween } from "./normalize";
import { supplyLogger } from "./telemetry";

export interface SupplySearchInput {
  query: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  childrenAges: number[];
  currency?: string;
  lang?: string;
  residency?: string;
}

export type SupplierRunState = {
  status: "pending" | "running" | "done" | "failed" | "disabled";
  count: number;
  latencyMs: number;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

export interface SearchSession {
  sid: string;
  input: SupplySearchInput;
  destination: ResolvedDestination | null;
  status: "running" | "complete";
  suppliers: Record<HotelSupplierId, SupplierRunState>;
  hotels: MergedHotel[];
  pendingReview: IdentityReviewCandidate[];
  createdAt: number;
  updatedAt: number;
  /** Raw cards per supplier — kept so late suppliers can be re-merged with earlier ones. */
  cards: Partial<Record<HotelSupplierId, HotelSearchCard[]>>;
  /** Empty-complete retries after a process restart or a timed-out Travelport run. */
  retries?: number;
}

export const SEARCH_SESSION_TTL_SEC = 600;
const SUPPLIER_BUDGET_MS: Record<HotelSupplierId, number> = {
  hotelbeds: 25_000,
  travelport: 85_000,
  ratehawk: 50_000,
  seeru: 45_000,
};
/** How long the first request waits for suppliers before answering with partial results. */
const FIRST_RESPONSE_WAIT_MS = 20_000;

const ALL_SUPPLIERS: HotelSupplierId[] = ["hotelbeds", "travelport", "ratehawk", "seeru"];

// In-process bookkeeping so concurrent identical requests share one fan-out.
const running = new Map<string, Promise<void>>();
const supplierDone = new Map<string, Promise<unknown>>();
// Serialises session writes inside this process.
const writeChains = new Map<string, Promise<void>>();

function sessionKey(sid: string) {
  return `search:${sid}`;
}

export function computeSessionId(input: SupplySearchInput): string {
  const basis = [
    input.query.trim().toLowerCase(),
    input.checkIn,
    input.checkOut,
    input.adults,
    input.rooms,
    (input.childrenAges || []).join(","),
    (input.currency || "USD").toUpperCase(),
    (input.residency || "SA").toUpperCase(),
    "v3-rooms",
    // Date bucket: a new session every 10 minutes at most.
    Math.floor(Date.now() / (SEARCH_SESSION_TTL_SEC * 1000)),
  ].join("|");
  return crypto.createHash("sha1").update(basis).digest("hex").slice(0, 20);
}

export async function getSearchSession(sid: string): Promise<SearchSession | null> {
  return cacheGet<SearchSession>(sessionKey(sid));
}

async function mutateSession(sid: string, fn: (s: SearchSession) => void): Promise<SearchSession | null> {
  const prev = writeChains.get(sid) || Promise.resolve();
  let result: SearchSession | null = null;
  const next = prev.then(async () => {
    const s = await cacheGet<SearchSession>(sessionKey(sid));
    if (!s) return;
    fn(s);
    s.updatedAt = Date.now();
    await cacheSet(sessionKey(sid), s, SEARCH_SESSION_TTL_SEC);
    result = s;
  });
  writeChains.set(sid, next.catch(() => undefined));
  await next;
  return result;
}

async function enabledSuppliers(): Promise<Record<HotelSupplierId, boolean>> {
  const registry = await getProvidersRegistry();
  const p = registry.providers;
  // Auto-enable RateHawk when credentials exist (plan A0).
  const rh = p.ratehawk;
  if (rh && !rh.enabled && providerHasRequiredFields("ratehawk", rh.fields || {})) {
    try {
      await saveProviderRuntime("ratehawk", { enabled: true });
      supplyLogger.info({ supplier: "ratehawk" }, "RateHawk auto-enabled (credentials present)");
      rh.enabled = true;
    } catch (err) {
      supplyLogger.warn({ err: String(err) }, "failed to auto-enable RateHawk");
    }
  }
  return {
    hotelbeds: Boolean(p.hotelbeds?.enabled),
    travelport: Boolean(p.travelport_hotels?.enabled),
    ratehawk: Boolean(p.ratehawk?.enabled),
    seeru: Boolean(p.seeru_hotels?.enabled),
  };
}

function withBudget<T>(budgetMs: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budgetMs);
  return Promise.race([
    fn(controller.signal),
    new Promise<never>((_, reject) => controller.signal.addEventListener("abort", () => reject(new Error(`supplier budget exceeded (${budgetMs}ms)`)))),
  ]).finally(() => clearTimeout(timer));
}

async function runSupplier(supplier: HotelSupplierId, input: SupplySearchInput, dest: ResolvedDestination): Promise<HotelSearchCard[]> {
  const common = { checkIn: input.checkIn, checkOut: input.checkOut, adults: input.adults, rooms: input.rooms, currency: input.currency };
  const budget = SUPPLIER_BUDGET_MS[supplier];
  switch (supplier) {
    case "hotelbeds": {
      if (!dest.hotelbedsCode && !(dest.lat && dest.lng)) throw new Error("no Hotelbeds destination code / coordinates");
      return withBudget(budget, (signal) =>
        new HotelbedsHotelAdapter().searchHotels({
          ...common,
          destinationCode: dest.hotelbedsCode || undefined,
          geo: !dest.hotelbedsCode && dest.lat && dest.lng ? { latitude: dest.lat, longitude: dest.lng, radiusKm: dest.radiusKm || 30 } : undefined,
          childrenAges: input.childrenAges,
          language: input.lang === "ar" ? "ARA" : "ENG",
          maxHotels: 2000,
          maxRatesPerRoom: 20,
          signal,
          timeoutMs: budget - 1000,
        })
      );
    }
    case "travelport": {
      if (!(dest.lat && dest.lng) && !dest.nameEn) throw new Error("no Travelport search key");
      return withBudget(budget, (signal) =>
        new TravelportHotelAdapter().searchHotels({
          ...common,
          city: dest.iata || dest.nameEn,
          countryCode: dest.countryCode,
          geo: dest.lat && dest.lng ? { latitude: dest.lat, longitude: dest.lng, radiusKm: Math.min(40, dest.radiusKm || 30) } : undefined,
          childrenAges: input.childrenAges,
          maxPages: 5,
          signal,
        })
      );
    }
    case "ratehawk": {
      if (!dest.ratehawkRegionId) throw new Error("no RateHawk region id");
      return withBudget(budget, (signal) =>
        new RateHawkHotelAdapter().searchHotels({
          ...common,
          regionId: dest.ratehawkRegionId!,
          children: input.childrenAges,
          residency: (input.residency || "sa").toLowerCase(),
          language: input.lang === "ar" ? "ar" : "en",
          signal,
        })
      );
    }
    case "seeru": {
      if (!(dest.lat && dest.lng)) throw new Error("no coordinates for Seeru search");
      return withBudget(budget, (signal) =>
        new SeeruHotelAdapter().searchHotels({
          ...common,
          geo: { latitude: dest.lat!, longitude: dest.lng!, radiusKm: dest.radiusKm || 25 },
          residency: input.residency || "SA",
          budgetMs: budget - 2000,
          signal,
        })
      );
    }
  }
}

/**
 * Cards are stored compactly in the session (no raw payloads, cheapest rate plan only, ≤8 images).
 * The details page re-fetches full room/rate matrices from the supplier for the chosen hotel.
 * The room group that owns the cheapest plan is kept (without its rate plans, ≤3 photos) so the
 * result card can show the real room name / beds / size behind the price.
 */
function compactCard(card: HotelSearchCard): HotelSearchCard {
  const plans = card.ratePlans?.length ? card.ratePlans : card.roomGroups?.flatMap((g) => g.ratePlans) || [];
  const cheapest = plans.length ? plans.reduce((a, b) => (a.price.total <= b.price.total ? a : b)) : undefined;
  const boards = Array.from(new Set(plans.map((p) => p.board)));
  const refundable = plans.some((p) => p.refundable);
  const payAtHotel = plans.some((p) => p.paymentType === "pay_at_hotel");
  const cheapestGroup = cheapest ? card.roomGroups?.find((g) => g.id === cheapest.roomGroupId) : undefined;
  return {
    ...card,
    raw: { has_free_cancellation: refundable || Boolean((card.raw as any)?.has_free_cancellation), boards, payAtHotel, ratePlanCount: plans.length, roomGroupCount: card.roomGroups?.length || 0 },
    rooms: undefined,
    roomGroups: cheapestGroup
      ? [{
          ...cheapestGroup,
          description: cheapestGroup.description ? cheapestGroup.description.slice(0, 280) : undefined,
          images: cheapestGroup.images.slice(0, 5),
          amenities: (cheapestGroup.amenities || []).slice(0, 12),
          ratePlans: [],
        }]
      : [],
    ratePlans: cheapest ? [cheapest] : [],
    images: (card.images || []).slice(0, 12),
    description: card.description ? card.description.slice(0, 600) : undefined,
    amenities: (card.amenities || []).slice(0, 30),
  };
}

function remerge(session: SearchSession) {
  const all = ALL_SUPPLIERS.flatMap((s) => session.cards[s] || []);
  const center = session.destination?.lat && session.destination?.lng ? { lat: session.destination.lat, lng: session.destination.lng } : undefined;
  const { hotels, pendingReview } = groupHotelCards(all, center);
  session.hotels = hotels;
  session.pendingReview = pendingReview.slice(0, 200);
  session.status = ALL_SUPPLIERS.every((s) => ["done", "failed", "disabled"].includes(session.suppliers[s].status)) ? "complete" : "running";
}

async function fanOut(sid: string, input: SupplySearchInput, dest: ResolvedDestination, enabled: Record<HotelSupplierId, boolean>): Promise<void> {
  const snapshot = await getSearchSession(sid);
  const tasks = ALL_SUPPLIERS.filter((s) => {
    if (!enabled[s]) return false;
    const st = snapshot?.suppliers[s]?.status;
    return st !== "done" && st !== "failed" && st !== "disabled";
  }).map(async (supplier) => {
    const startedAt = Date.now();
    await mutateSession(sid, (s) => {
      s.suppliers[supplier] = { status: "running", count: 0, latencyMs: 0, startedAt };
    });
    const p = (async () => {
      try {
        const cards = await runSupplier(supplier, input, dest);
        const latencyMs = Date.now() - startedAt;
        supplyLogger.info({ sid, supplier, count: cards.length, latencyMs }, "supplier search done");
        await mutateSession(sid, (s) => {
          s.cards[supplier] = cards.map(compactCard);
          s.suppliers[supplier] = { status: "done", count: cards.length, latencyMs, startedAt, finishedAt: Date.now() };
          remerge(s);
        });
      } catch (err) {
        const latencyMs = Date.now() - startedAt;
        const error = err instanceof Error ? err.message : String(err);
        // A supplier whose service is not provisioned for our account is "disabled", not "failed".
        const notProvisioned = (err as any)?.name === "SeeruServiceDisabledError" || /not enabled for this office|بيانات اعتماد .* مفقودة|credentials missing/i.test(error);
        supplyLogger.warn({ sid, supplier, latencyMs, error, notProvisioned }, "supplier search failed");
        await mutateSession(sid, (s) => {
          s.suppliers[supplier] = { status: notProvisioned ? "disabled" : "failed", count: 0, latencyMs, error, startedAt, finishedAt: Date.now() };
          remerge(s);
        });
      }
    })();
    supplierDone.set(`${sid}:${supplier}`, p);
    return p;
  });
  await Promise.allSettled(tasks);
  await mutateSession(sid, (s) => {
    remerge(s);
    s.status = "complete";
  });
}

/**
 * After a PM2/process restart the Redis session is still "running" but this process has no
 * fan-out. Resume it. Also retry once when a session completed with zero hotels.
 */
export async function ensureFanOut(session: SearchSession): Promise<SearchSession> {
  if (!session.destination) return session;
  const enabled = await enabledSuppliers();
  const anyEnabled = ALL_SUPPLIERS.some((s) => enabled[s]);
  if (!anyEnabled) return session;

  const unfinished = ALL_SUPPLIERS.some((s) => enabled[s] && ["pending", "running"].includes(session.suppliers[s].status));
  const emptyDead =
    session.hotels.length === 0 &&
    (session.retries || 0) < 1 &&
    (session.status === "complete" || (session.status === "running" && !unfinished));

  if (running.has(session.sid)) return session;

  if (session.status === "running" && unfinished) {
    const run = fanOut(session.sid, session.input, session.destination, enabled).finally(() => running.delete(session.sid));
    running.set(session.sid, run);
    return session;
  }

  if (emptyDead) {
    session.status = "running";
    session.retries = (session.retries || 0) + 1;
    session.hotels = [];
    session.cards = {};
    for (const s of ALL_SUPPLIERS) {
      if (enabled[s]) session.suppliers[s] = { status: "pending", count: 0, latencyMs: 0 };
    }
    session.updatedAt = Date.now();
    await cacheSet(sessionKey(session.sid), session, SEARCH_SESSION_TTL_SEC);
    const run = fanOut(session.sid, session.input, session.destination, enabled).finally(() => running.delete(session.sid));
    running.set(session.sid, run);
  }
  return session;
}

/**
 * Starts (or joins) a session and waits until hotels arrive, every supplier finished, or the
 * first-response budget elapsed.
 */
export async function startOrJoinSearchSession(input: SupplySearchInput, opts: { waitMs?: number } = {}): Promise<SearchSession> {
  const sid = computeSessionId(input);
  let session = await getSearchSession(sid);
  if (!session) {
    const enabled = await enabledSuppliers();
    let destination: ResolvedDestination | null = null;
    try {
      destination = await resolveDestination(input.query, { needHotelbeds: enabled.hotelbeds, needRateHawk: enabled.ratehawk });
    } catch (err) {
      supplyLogger.error({ err: String(err), query: input.query }, "destination resolution failed");
    }
    const suppliers = Object.fromEntries(
      ALL_SUPPLIERS.map((s) => [s, { status: enabled[s] && destination ? "pending" : "disabled", count: 0, latencyMs: 0 } satisfies SupplierRunState])
    ) as Record<HotelSupplierId, SupplierRunState>;
    session = {
      sid,
      input,
      destination,
      status: destination && ALL_SUPPLIERS.some((s) => enabled[s]) ? "running" : "complete",
      suppliers,
      hotels: [],
      pendingReview: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: {},
    };
    await cacheSet(sessionKey(sid), session, SEARCH_SESSION_TTL_SEC);
    if (session.status === "running" && destination) {
      const run = fanOut(sid, input, destination, enabled).finally(() => running.delete(sid));
      running.set(sid, run);
    }
  } else {
    session = await ensureFanOut(session);
  }
  if (session.status === "complete") return session;

  // Wait for the first supplier (or all) within the budget.
  const waitMs = opts.waitMs ?? FIRST_RESPONSE_WAIT_MS;
  const deadline = Date.now() + waitMs;
  const run = running.get(sid);
  while (Date.now() < deadline) {
    const fresh = await getSearchSession(sid);
    if (!fresh) break;
    session = fresh;
    if (fresh.status === "complete") break;
    if (fresh.hotels.length > 0) break;
    if (!run && Date.now() - fresh.updatedAt > 60_000) break; // orphaned session (process restart)
    await new Promise((r) => setTimeout(r, 400));
  }
  return (await getSearchSession(sid)) || session;
}

export function sessionProgress(session: SearchSession) {
  const stats: SupplierSearchStats[] = ALL_SUPPLIERS.map((s) => ({
    supplier: s,
    ok: session.suppliers[s].status === "done",
    count: session.suppliers[s].count,
    latencyMs: session.suppliers[s].latencyMs,
    error: session.suppliers[s].error,
  }));
  return {
    complete: session.status === "complete",
    done: ALL_SUPPLIERS.filter((s) => ["done", "failed"].includes(session.suppliers[s].status)),
    pending: ALL_SUPPLIERS.filter((s) => ["pending", "running"].includes(session.suppliers[s].status)),
    disabled: ALL_SUPPLIERS.filter((s) => session.suppliers[s].status === "disabled"),
    stats,
  };
}

/** Finds a supplier card inside a session (used by the details page to reuse search context). */
export async function findSessionCard(sid: string, cardId: string): Promise<{ card: HotelSearchCard; hotel: MergedHotel } | null> {
  const session = await getSearchSession(sid);
  if (!session) return null;
  for (const hotel of session.hotels) {
    const card = hotel.offers.find((o) => o.id === cardId);
    if (card) return { card, hotel };
  }
  return null;
}

export function sessionNights(session: SearchSession): number {
  return nightsBetween(session.input.checkIn, session.input.checkOut);
}
