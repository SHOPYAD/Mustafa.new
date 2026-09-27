/**
 * Hotel content ingestion (plan A1) — executed by `POST /api/cron/hotel-content`, which the PM2
 * worker `scripts/hotel-content-worker.mjs` calls every few minutes.
 *
 * Each tick performs, within a time budget:
 *   1. seedDestinations     Turkey (all Hotelbeds destinations) → top global cities → (production) everything.
 *   2. syncDiskCache        content captured during live searches/details → PocketBase.
 *   3. hotelbedsDestination Hotelbeds Content API by destinationCode (paged, quota-aware, resumable).
 *   4. travelportBackfill   propertiesdetail for Travelport refs seen in searches without content.
 *   5. ratehawkDump         weekly full dump / daily incremental dump (zstd JSONL) — background job.
 *   6. identity             re-cluster the touched destination / orphan refs into hotel_masters.
 *
 * Seeru Hotels API v1 has no static content endpoint (rates only) → nothing to ingest there; room
 * names arrive with rates and are stored by the search path.
 */

import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import readline from "readline";
import { Readable } from "stream";
import { HotelbedsHotelAdapter, mapHotelbedsContent, ensureFacilityDictionary, ensureRoomDictionary } from "@/lib/providers/adapters/hotelbeds/HotelbedsHotelAdapter";
import { hotelbedsContentRequest } from "@/lib/providers/adapters/hotelbeds/hotelbedsClient";
import { TravelportHotelAdapter } from "@/lib/providers/adapters/travelport/TravelportHotelAdapter";
import { mapRateHawkContent } from "@/lib/providers/adapters/ratehawk/RateHawkHotelAdapter";
import { ratehawkPostJson } from "@/lib/providers/adapters/ratehawk/ratehawkClient";
import { getAdapterCredentials } from "@/lib/providers/adapters/common/credentials";
import { providerHasRequiredFields, getProviderRuntime } from "@/lib/server/providers-registry-store";
import type { HotelSupplierId } from "@/lib/providers/adapters/common/types";
import type { HotelContent } from "./content-types";
import { putCachedContent } from "./content-cache";
import { ensureHotelbedsDestinations, resolveDestination } from "./destinations";
import {
  contentPb,
  countDestinations,
  finishContentJob,
  logContentJob,
  nextDestinationFor,
  persistHotelContent,
  upsertDestinationRecord,
  type DestinationRecord,
  type SupplierRefRecord,
} from "./content-store";
import { rebuildMastersForDestination, rebuildOrphanRefs } from "./identity-store";
import { recordSupplierCall, supplyLogger } from "./telemetry";

const DATA_DIR =
  process.env.HOTELS_DATA_DIR ||
  path.resolve("/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/hotels");
const STATE_FILE = path.join(DATA_DIR, "ingest-state.json");
const SETTINGS_FILE = path.join(DATA_DIR, "ingest-settings.json");
const CONTENT_DIR = path.join(DATA_DIR, "content");
const RH_LOCK_FILE = path.join(DATA_DIR, "ratehawk-dump.lock");

export interface IngestSettings {
  enabled: boolean;
  /** Hotelbeds Content API requests allowed per day (test env quota is 50/day shared with availability). */
  hotelbedsDailyRequestBudget: number | null;
  /** Content languages to ingest from Hotelbeds (ARA first — site language). */
  languages: string[];
  travelportPerTick: number;
  ratehawkDump: boolean;
  /** Countries whose hotels are kept from the RateHawk dump (null = all). */
  ratehawkCountries: string[] | null;
  /** Extra destination names to seed (resolved via destinations resolver). */
  extraDestinations: string[];
}

export interface IngestState {
  day: string;
  hotelbedsRequestsToday: number;
  hotelbedsCursor: { destinationKey: string; from: number; total: number; language: string } | null;
  lastTickAt: string | null;
  lastSyncAt: string | null;
  lastRateHawkDumpAt: string | null;
  lastRateHawkIncrementalAt: string | null;
  seededGlobalAt: string | null;
  ticks: number;
  lastResult: IngestTickResult | null;
}

export interface IngestTickResult {
  at: string;
  durationMs: number;
  steps: Array<{ step: string; status: "done" | "skipped" | "failed"; count?: number; requests?: number; detail?: string }>;
}

/** Top destinations after Turkey (ordered roughly by demand for an Arabic-speaking audience). */
export const TOP_GLOBAL_DESTINATIONS: string[] = [
  "Istanbul", "Dubai", "Makkah", "Madinah", "Cairo", "Paris", "London", "Kuala Lumpur", "Bangkok", "Doha",
  "Riyadh", "Jeddah", "Amman", "Beirut", "Sharm El Sheikh", "Marrakech", "Casablanca", "Tbilisi", "Baku", "Sarajevo",
  "Vienna", "Munich", "Amsterdam", "Milan", "Rome", "Barcelona", "Madrid", "Athens", "Kuwait City", "Manama",
  "Muscat", "Salalah", "Male", "Denpasar", "Phuket", "Singapore", "Hong Kong", "Tokyo", "Seoul", "New York",
  "Los Angeles", "Miami", "Toronto", "Geneva", "Zurich", "Prague", "Budapest", "Lisbon", "Abu Dhabi", "Alexandria",
];

const defaultState = (): IngestState => ({
  day: new Date().toISOString().slice(0, 10),
  hotelbedsRequestsToday: 0,
  hotelbedsCursor: null,
  lastTickAt: null,
  lastSyncAt: null,
  lastRateHawkDumpAt: null,
  lastRateHawkIncrementalAt: null,
  seededGlobalAt: null,
  ticks: 0,
  lastResult: null,
});

export async function getIngestSettings(): Promise<IngestSettings> {
  const base: IngestSettings = {
    enabled: true,
    hotelbedsDailyRequestBudget: null,
    languages: ["ARA"],
    travelportPerTick: 5,
    ratehawkDump: true,
    ratehawkCountries: ["TR", "AE", "SA", "EG", "QA", "KW", "BH", "OM", "JO", "LB", "MA", "GE", "AZ", "BA", "MY", "TH", "ID", "MV", "GB", "FR", "IT", "ES", "DE", "AT", "NL", "CH", "GR", "CZ", "HU", "PT", "US", "CA", "SG", "HK", "JP", "KR"],
    extraDestinations: [],
  };
  try {
    const parsed = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8")) as Partial<IngestSettings>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

export async function saveIngestSettings(patch: Partial<IngestSettings>): Promise<IngestSettings> {
  const next = { ...(await getIngestSettings()), ...patch };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}

export async function getIngestState(): Promise<IngestState> {
  try {
    const parsed = { ...defaultState(), ...(JSON.parse(await fs.readFile(STATE_FILE, "utf8")) as Partial<IngestState>) };
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.day !== today) {
      parsed.day = today;
      parsed.hotelbedsRequestsToday = 0;
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

async function saveIngestState(state: IngestState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
}

async function hotelbedsDailyBudget(settings: IngestSettings): Promise<number> {
  if (settings.hotelbedsDailyRequestBudget != null) return settings.hotelbedsDailyRequestBudget;
  const { mode } = await getAdapterCredentials("hotelbeds");
  // Test env: 50 req/day total → leave most of it for live searches. Production: generous.
  return mode === "production" ? 4000 : 20;
}

/* ------------------------------------------------------------------------------------------------
 * Step 1 — destinations
 * ---------------------------------------------------------------------------------------------- */

async function seedDestinations(state: IngestState, settings: IngestSettings, deadline: number): Promise<IngestTickResult["steps"][number]> {
  const pb = await contentPb();
  if (!pb) return { step: "seedDestinations", status: "skipped", detail: "PocketBase unavailable" };
  let count = 0;
  const trCount = await countDestinations(pb, 'countryCode = "TR" && hotelbedsCode != ""');
  if (trCount < 10) {
    const list = await ensureHotelbedsDestinations("TR");
    for (const d of list) {
      if (Date.now() > deadline) break;
      const ok = await upsertDestinationRecord({ key: `hb:${d.code}`, nameEn: d.name, countryCode: "TR", hotelbedsCode: d.code, priority: 1 }, pb);
      if (ok) count += 1;
    }
  }
  // Global top list + admin extras: resolve a few per tick (each resolve may call supplier APIs).
  const wanted = [...TOP_GLOBAL_DESTINATIONS, ...settings.extraDestinations];
  const seededAll = state.seededGlobalAt && Date.now() - Date.parse(state.seededGlobalAt) < 30 * 86400000;
  if (!seededAll) {
    const needRateHawk = await rateHawkReady();
    let resolvedThisTick = 0;
    for (const name of wanted) {
      if (Date.now() > deadline || resolvedThisTick >= 5) break;
      const key = `city:${name.toLowerCase().replace(/\s+/g, "-")}`;
      const exists = await pb
        .collection("hotel_destinations")
        .getFirstListItem(pb.filter("key = {:k}", { k: key }))
        .catch(() => null);
      if (exists) continue;
      resolvedThisTick += 1;
      try {
        const dest = await resolveDestination(name, { needHotelbeds: true, needRateHawk });
        if (!dest) continue;
        const ok = await upsertDestinationRecord(
          {
            key,
            nameEn: dest.nameEn,
            nameAr: dest.nameAr,
            countryCode: dest.countryCode,
            lat: dest.lat ?? undefined,
            lng: dest.lng ?? undefined,
            iata: dest.iata ?? undefined,
            hotelbedsCode: dest.hotelbedsCode ?? undefined,
            ratehawkRegionId: dest.ratehawkRegionId != null ? String(dest.ratehawkRegionId) : undefined,
            geoPlaceId: dest.geoPlaceId ?? undefined,
            radiusKm: dest.radiusKm,
            priority: 2,
          },
          pb
        );
        if (ok) count += 1;
      } catch (err) {
        supplyLogger.warn({ err: String(err), name }, "seed destination failed");
      }
    }
    if (resolvedThisTick === 0) state.seededGlobalAt = new Date().toISOString();
  }
  return { step: "seedDestinations", status: "done", count };
}

/* ------------------------------------------------------------------------------------------------
 * Step 2 — disk cache → PocketBase
 * ---------------------------------------------------------------------------------------------- */

async function syncDiskCache(state: IngestState, deadline: number, maxFiles = 300): Promise<IngestTickResult["steps"][number]> {
  const pb = await contentPb();
  if (!pb) return { step: "syncDiskCache", status: "skipped", detail: "PocketBase unavailable" };
  const since = state.lastSyncAt ? Date.parse(state.lastSyncAt) : 0;
  const started = new Date().toISOString();
  let synced = 0;
  let pending = 0;
  let suppliers: string[] = [];
  try {
    suppliers = await fs.readdir(CONTENT_DIR);
  } catch {
    return { step: "syncDiskCache", status: "done", count: 0 };
  }
  outer: for (const supplier of suppliers) {
    const dir = path.join(CONTENT_DIR, supplier);
    let files: string[] = [];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch {
      continue;
    }
    for (const f of files) {
      if (Date.now() > deadline || synced >= maxFiles) {
        pending += 1;
        continue;
      }
      const full = path.join(dir, f);
      try {
        const st = await fs.stat(full);
        if (st.mtimeMs <= since) continue;
        const content = JSON.parse(await fs.readFile(full, "utf8")) as HotelContent;
        if (!content?.supplier || !content.supplierHotelId) continue;
        const out = await persistHotelContent(content, { pb });
        if (out !== "failed" && out !== "skipped") synced += 1;
      } catch (err) {
        supplyLogger.warn({ err: String(err), file: f }, "syncDiskCache file failed");
      }
      if (Date.now() > deadline) break outer;
    }
  }
  if (pending === 0) state.lastSyncAt = started;
  return { step: "syncDiskCache", status: "done", count: synced, detail: pending ? `${pending} pending` : undefined };
}

/* ------------------------------------------------------------------------------------------------
 * Step 3 — Hotelbeds Content API by destination (resumable, quota-aware)
 * ---------------------------------------------------------------------------------------------- */

const HB_PAGE = 250;

async function ingestHotelbedsDestinations(state: IngestState, settings: IngestSettings, deadline: number): Promise<IngestTickResult["steps"][number]> {
  // Small destinations finish in one request → keep going while budget/time remain (max 12 per tick).
  let count = 0;
  let requests = 0;
  const details: string[] = [];
  let status: "done" | "skipped" | "failed" = "skipped";
  for (let i = 0; i < 12 && Date.now() < deadline; i++) {
    const step = await ingestHotelbedsDestination(state, settings, deadline);
    if (step.status === "skipped") {
      if (!details.length) details.push(step.detail || "skipped");
      break;
    }
    status = step.status === "failed" ? "failed" : "done";
    count += step.count || 0;
    requests += step.requests || 0;
    if (step.detail) details.push(step.detail);
    if (step.status === "failed" || (step.detail || "").includes("paused")) break;
  }
  return { step: "hotelbeds", status, count, requests, detail: details.slice(0, 6).join("; ") };
}

async function ingestHotelbedsDestination(state: IngestState, settings: IngestSettings, deadline: number): Promise<IngestTickResult["steps"][number]> {
  const pb = await contentPb();
  if (!pb) return { step: "hotelbeds", status: "skipped", detail: "PocketBase unavailable" };
  const hb = await getProviderRuntime("hotelbeds");
  if (!hb.enabled || !providerHasRequiredFields("hotelbeds", hb.fields || {})) return { step: "hotelbeds", status: "skipped", detail: "Hotelbeds not enabled" };
  const budget = await hotelbedsDailyBudget(settings);
  if (state.hotelbedsRequestsToday >= budget) return { step: "hotelbeds", status: "skipped", detail: `daily budget ${budget} reached` };

  let cursor = state.hotelbedsCursor;
  let dest: DestinationRecord | null = null;
  if (cursor) {
    dest = await pb
      .collection("hotel_destinations")
      .getFirstListItem<DestinationRecord>(pb.filter("key = {:k}", { k: cursor.destinationKey }))
      .catch(() => null);
    if (!dest) cursor = null;
  }
  if (!cursor) {
    dest = await nextDestinationFor("hotelbeds", { pb });
    if (!dest?.hotelbedsCode) return { step: "hotelbeds", status: "skipped", detail: "no destination due" };
    cursor = { destinationKey: dest.key, from: 1, total: 0, language: settings.languages[0] || "ENG" };
  }
  const language = cursor.language;
  const jobId = await logContentJob({ kind: "hotelbeds-destination", supplier: "hotelbeds", destinationKey: dest!.key, status: "running", meta: { from: cursor.from, language } }, pb);
  const [dict, roomDict] = await Promise.all([ensureFacilityDictionary(language), ensureRoomDictionary(language)]);
  let hotels = 0;
  let requests = 0;
  let finished = false;
  let error: string | undefined;
  try {
    while (Date.now() < deadline && state.hotelbedsRequestsToday < budget) {
      const to = cursor.from + HB_PAGE - 1;
      const started = Date.now();
      const res = await hotelbedsContentRequest<any>(
        `/hotels?destinationCode=${encodeURIComponent(dest!.hotelbedsCode!)}&fields=all&language=${language}&useSecondaryLanguage=false&from=${cursor.from}&to=${to}`,
        { timeoutMs: 25_000 }
      );
      requests += 1;
      state.hotelbedsRequestsToday += 1;
      const list: any[] = Array.isArray(res.data?.hotels) ? res.data.hotels : [];
      recordSupplierCall({ supplier: "hotelbeds", kind: "content", ok: res.ok, latencyMs: Date.now() - started, count: list.length, error: res.error, meta: { op: "ingest-destination", dest: dest!.hotelbedsCode, from: cursor.from } });
      if (!res.ok) throw new Error(res.error || `Hotelbeds content ${res.status}`);
      cursor.total = Number(res.data?.total || cursor.total || 0);
      for (const item of list) {
        const content = mapHotelbedsContent(item, language, dict, roomDict);
        await putCachedContent(content);
        const out = await persistHotelContent(content, { destinationKey: dest!.key, pb });
        if (out !== "failed" && out !== "skipped") hotels += 1;
      }
      cursor.from = to + 1;
      if (list.length < HB_PAGE || (cursor.total && cursor.from > cursor.total)) {
        finished = true;
        break;
      }
      state.hotelbedsCursor = cursor;
      await saveIngestState(state);
    }
  } catch (err) {
    error = String(err instanceof Error ? err.message : err);
  }
  if (finished) {
    state.hotelbedsCursor = null;
    await upsertDestinationRecord({ key: dest!.key, hotelbedsIngestedAt: new Date().toISOString(), hotelCount: cursor.total || hotels }, pb);
    try {
      const identity = await rebuildMastersForDestination(dest!.key, pb);
      await finishContentJob(jobId, { status: "done", count: hotels, requests, meta: { total: cursor.total, identity } }, pb);
    } catch (err) {
      await finishContentJob(jobId, { status: "done", count: hotels, requests, error: `identity: ${String(err)}` }, pb);
    }
  } else {
    state.hotelbedsCursor = cursor;
    await finishContentJob(jobId, { status: error ? "failed" : "done", count: hotels, requests, error, meta: { resumeFrom: cursor.from, total: cursor.total } }, pb);
  }
  return { step: "hotelbeds", status: error ? "failed" : "done", count: hotels, requests, detail: `${dest!.key} ${finished ? "complete" : `paused at ${cursor.from}/${cursor.total || "?"}`}${error ? ` — ${error}` : ""}` };
}

/* ------------------------------------------------------------------------------------------------
 * Step 4 — Travelport propertiesdetail backfill
 * ---------------------------------------------------------------------------------------------- */

async function travelportBackfill(settings: IngestSettings, deadline: number): Promise<IngestTickResult["steps"][number]> {
  const pb = await contentPb();
  if (!pb) return { step: "travelport", status: "skipped", detail: "PocketBase unavailable" };
  const tp = await getProviderRuntime("travelport_hotels");
  if (!tp.enabled || !providerHasRequiredFields("travelport_hotels", tp.fields || {})) return { step: "travelport", status: "skipped", detail: "Travelport hotels not enabled" };
  const refs = await pb
    .collection("hotel_supplier_refs")
    .getList<SupplierRefRecord>(1, settings.travelportPerTick, { filter: 'supplier = "travelport" && hasDescription = false', sort: "contentFetchedAt" })
    .catch(() => ({ items: [] as SupplierRefRecord[] }));
  if (!refs.items.length) return { step: "travelport", status: "done", count: 0 };
  const adapter = new TravelportHotelAdapter();
  let count = 0;
  for (const ref of refs.items) {
    if (Date.now() > deadline) break;
    try {
      const content = await adapter.getContent(ref.supplierHotelId);
      if (content) {
        const out = await persistHotelContent(content, { pb });
        if (out !== "failed" && out !== "skipped") count += 1;
        if (!content.description) {
          // Supplier has no description for this property → don't retry every tick.
          await pb.collection("hotel_supplier_refs").update(ref.id, { hasDescription: true, contentFetchedAt: new Date().toISOString() }).catch(() => null);
        }
      }
    } catch (err) {
      supplyLogger.warn({ err: String(err), id: ref.supplierHotelId }, "travelport backfill failed");
    }
  }
  return { step: "travelport", status: "done", count, requests: refs.items.length };
}

/* ------------------------------------------------------------------------------------------------
 * Step 5 — RateHawk dump (weekly full / daily incremental), background job
 * ---------------------------------------------------------------------------------------------- */

async function rateHawkReady(): Promise<boolean> {
  const rh = await getProviderRuntime("ratehawk");
  return providerHasRequiredFields("ratehawk", rh.fields || {});
}

/** Streams a zstd-compressed JSONL dump through `zstd -d` and persists hotels of the allowed countries. */
export async function processRateHawkDump(url: string, opts: { countries: string[] | null; kind: "full" | "incremental" }): Promise<{ hotels: number; skipped: number }> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`dump download failed ${res.status}`);
  const zstd = spawn("zstd", ["-d", "-c", "-q"], { stdio: ["pipe", "pipe", "pipe"] });
  const input = Readable.fromWeb(res.body as any);
  input.pipe(zstd.stdin);
  const rl = readline.createInterface({ input: zstd.stdout, crlfDelay: Infinity });
  const allowed = opts.countries ? new Set(opts.countries.map((c) => c.toUpperCase())) : null;
  const pb = await contentPb();
  let hotels = 0;
  let skipped = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let h: any;
    try {
      h = JSON.parse(line);
    } catch {
      continue;
    }
    const cc = String(h?.region?.country_code || "").toUpperCase();
    if (allowed && !allowed.has(cc)) {
      skipped += 1;
      continue;
    }
    try {
      const content = mapRateHawkContent(h, "en");
      await putCachedContent(content);
      if (pb) await persistHotelContent(content, { pb, destinationKey: h?.region?.id ? `rh:${h.region.id}` : undefined });
      hotels += 1;
    } catch (err) {
      supplyLogger.warn({ err: String(err), id: h?.id }, "ratehawk dump hotel failed");
    }
  }
  return { hotels, skipped };
}

async function ratehawkDumpStep(state: IngestState, settings: IngestSettings): Promise<IngestTickResult["steps"][number]> {
  if (!settings.ratehawkDump) return { step: "ratehawk", status: "skipped", detail: "disabled in settings" };
  if (!(await rateHawkReady())) return { step: "ratehawk", status: "skipped", detail: "RateHawk credentials missing" };
  try {
    await fs.access(RH_LOCK_FILE);
    const st = await fs.stat(RH_LOCK_FILE);
    if (Date.now() - st.mtimeMs < 6 * 3600 * 1000) return { step: "ratehawk", status: "skipped", detail: "dump job already running" };
  } catch {
    /* no lock */
  }
  const fullDue = !state.lastRateHawkDumpAt || Date.now() - Date.parse(state.lastRateHawkDumpAt) > 7 * 86400000;
  const incDue = !fullDue && (!state.lastRateHawkIncrementalAt || Date.now() - Date.parse(state.lastRateHawkIncrementalAt) > 86400000);
  if (!fullDue && !incDue) return { step: "ratehawk", status: "skipped", detail: "up to date" };
  const kind: "full" | "incremental" = fullDue ? "full" : "incremental";
  const pb = await contentPb();
  const jobId = await logContentJob({ kind: `ratehawk-${kind}-dump`, supplier: "ratehawk", status: "running" }, pb);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RH_LOCK_FILE, new Date().toISOString());
  // Runs in the background of the Next process; the tick returns immediately.
  void (async () => {
    const started = Date.now();
    try {
      const body = kind === "full" ? { inventory: "all", language: "en" } : { language: "en" };
      const resp = await ratehawkPostJson<any>(`hotel/info/${kind === "full" ? "dump" : "incremental_dump"}`, body, { timeoutMs: 60_000 });
      const url = resp?.data?.url;
      if (!url) throw new Error(resp?.error || "dump url missing");
      const out = await processRateHawkDump(url, { countries: settings.ratehawkCountries, kind });
      const st = await getIngestState();
      if (kind === "full") st.lastRateHawkDumpAt = new Date().toISOString();
      st.lastRateHawkIncrementalAt = new Date().toISOString();
      await saveIngestState(st);
      recordSupplierCall({ supplier: "ratehawk", kind: "content", ok: true, latencyMs: Date.now() - started, count: out.hotels, meta: { op: `${kind}-dump` } });
      await finishContentJob(jobId, { status: "done", count: out.hotels, meta: { skipped: out.skipped, lastUpdate: resp?.data?.last_update } }, pb);
      await rebuildOrphanRefs(2000, pb);
    } catch (err) {
      recordSupplierCall({ supplier: "ratehawk", kind: "content", ok: false, latencyMs: Date.now() - started, error: String(err), meta: { op: `${kind}-dump` } });
      await finishContentJob(jobId, { status: "failed", error: String(err) }, pb);
    } finally {
      await fs.rm(RH_LOCK_FILE, { force: true });
    }
  })();
  return { step: "ratehawk", status: "done", detail: `${kind} dump started in background` };
}

/* ------------------------------------------------------------------------------------------------
 * Tick
 * ---------------------------------------------------------------------------------------------- */

let tickInflight: Promise<IngestTickResult> | null = null;

export async function runContentIngestTick(opts: { budgetMs?: number } = {}): Promise<IngestTickResult> {
  if (tickInflight) return tickInflight;
  tickInflight = (async () => {
    const startedAt = Date.now();
    const deadline = startedAt + Math.min(Math.max(opts.budgetMs ?? 45_000, 5_000), 110_000);
    const steps: IngestTickResult["steps"] = [];
    const settings = await getIngestSettings();
    const state = await getIngestState();
    state.ticks += 1;
    state.lastTickAt = new Date().toISOString();
    if (!settings.enabled) {
      steps.push({ step: "tick", status: "skipped", detail: "ingest disabled" });
    } else if (!(await contentPb())) {
      steps.push({ step: "tick", status: "skipped", detail: "PocketBase admin credentials missing" });
    } else {
      const run = async (fn: () => Promise<IngestTickResult["steps"][number]>, name: string) => {
        try {
          steps.push(await fn());
        } catch (err) {
          steps.push({ step: name, status: "failed", detail: String(err instanceof Error ? err.message : err) });
        }
      };
      await run(() => seedDestinations(state, settings, deadline), "seedDestinations");
      await run(() => syncDiskCache(state, deadline), "syncDiskCache");
      await run(() => ingestHotelbedsDestinations(state, settings, deadline), "hotelbeds");
      await run(() => travelportBackfill(settings, deadline), "travelport");
      await run(() => ratehawkDumpStep(state, settings), "ratehawk");
      await run(async () => {
        const r = await rebuildOrphanRefs(300);
        return { step: "identity", status: "done", count: r.masters, detail: r.refs ? `${r.refs} refs → ${r.masters} masters (${r.multiSupplier} multi, ${r.pendingReviewsCreated} to review)` : undefined };
      }, "identity");
      steps.push({ step: "seeru", status: "skipped", detail: "Seeru Hotels API v1 exposes no static content endpoint" });
    }
    const result: IngestTickResult = { at: new Date().toISOString(), durationMs: Date.now() - startedAt, steps };
    state.lastResult = result;
    await saveIngestState(state).catch(() => null);
    supplyLogger.info({ durationMs: result.durationMs, steps: steps.map((s) => `${s.step}:${s.status}${s.count != null ? `(${s.count})` : ""}`) }, "hotel content tick");
    return result;
  })().finally(() => {
    tickInflight = null;
  });
  return tickInflight;
}

/** Ingest a single hotel's content on demand (used by details when the store is missing it). */
export async function ingestSingleHotel(supplier: HotelSupplierId, supplierHotelId: string): Promise<boolean> {
  try {
    let content: HotelContent | null = null;
    if (supplier === "hotelbeds") content = await new HotelbedsHotelAdapter().getContent(supplierHotelId);
    else if (supplier === "travelport") content = await new TravelportHotelAdapter().getContent(supplierHotelId);
    if (!content) return false;
    const out = await persistHotelContent(content);
    return out !== "failed" && out !== "skipped";
  } catch {
    return false;
  }
}
