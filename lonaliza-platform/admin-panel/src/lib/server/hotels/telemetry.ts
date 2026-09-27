/**
 * Supplier telemetry — every live call (search, details, quote, book, cancel)
 * is recorded here so the admin health panel and logs reflect real behaviour.
 * Nothing is swallowed silently any more.
 *
 * Persistence: `.data/supplier-health.json` (debounced write, mode 0600).
 */

import { promises as fs } from "fs";
import path from "path";
import pino from "pino";

export type SupplierCallKind =
  | "search"
  | "details"
  | "rooms"
  | "quote"
  | "book"
  | "cancel"
  | "content"
  | "test";

export type SupplierCallRecord = {
  supplier: string;
  kind: SupplierCallKind;
  ok: boolean;
  latencyMs: number;
  count?: number;
  error?: string;
  at: string;
  meta?: Record<string, string | number | boolean | undefined>;
};

export type SupplierHealthSnapshot = {
  supplier: string;
  totalCalls: number;
  okCalls: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  lastCallAt: string | null;
  lastOkAt: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  lastResultCount: number | null;
  byKind: Record<string, { calls: number; ok: number; avgLatencyMs: number; lastCount: number | null }>;
};

const RING_SIZE = 400;
const DATA_FILE = path.join(process.cwd(), ".data", "supplier-health.json");

const rings = new Map<string, SupplierCallRecord[]>();
let persistTimer: NodeJS.Timeout | null = null;
let loaded = false;

export const supplyLogger = pino({
  name: "lonaliza-supply",
  level: process.env.SUPPLY_LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: undefined,
});

async function loadFromDisk(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, SupplierCallRecord[]>;
    for (const [supplier, list] of Object.entries(parsed || {})) {
      if (Array.isArray(list)) rings.set(supplier, list.slice(-RING_SIZE));
    }
  } catch {
    /* first run */
  }
}

function schedulePersist(): void {
  if (persistTimer) return;
  persistTimer = setTimeout(async () => {
    persistTimer = null;
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      const obj: Record<string, SupplierCallRecord[]> = {};
      for (const [k, v] of rings) obj[k] = v.slice(-RING_SIZE);
      await fs.writeFile(DATA_FILE, JSON.stringify(obj), { mode: 0o600 });
    } catch (err) {
      supplyLogger.warn({ err: String(err) }, "supplier-health persist failed");
    }
  }, 2500);
}

export function recordSupplierCall(rec: Omit<SupplierCallRecord, "at">): void {
  void loadFromDisk();
  const full: SupplierCallRecord = { ...rec, at: new Date().toISOString() };
  if (full.error) full.error = String(full.error).slice(0, 300);
  const list = rings.get(rec.supplier) || [];
  list.push(full);
  if (list.length > RING_SIZE) list.splice(0, list.length - RING_SIZE);
  rings.set(rec.supplier, list);
  const logPayload = {
    supplier: rec.supplier,
    kind: rec.kind,
    ok: rec.ok,
    latencyMs: rec.latencyMs,
    count: rec.count,
    ...(rec.meta || {}),
  };
  if (rec.ok) supplyLogger.info(logPayload, "supplier call");
  else supplyLogger.warn({ ...logPayload, error: full.error }, "supplier call failed");
  schedulePersist();
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export async function getSupplierHealth(): Promise<SupplierHealthSnapshot[]> {
  await loadFromDisk();
  const out: SupplierHealthSnapshot[] = [];
  for (const [supplier, list] of rings) {
    const okList = list.filter((r) => r.ok);
    const latencies = list.map((r) => r.latencyMs).filter((n) => Number.isFinite(n));
    const lastErr = [...list].reverse().find((r) => !r.ok);
    const lastOk = [...okList].reverse()[0];
    const lastSearch = [...list].reverse().find((r) => r.kind === "search" && typeof r.count === "number");
    const byKind: SupplierHealthSnapshot["byKind"] = {};
    for (const r of list) {
      const k = byKind[r.kind] || { calls: 0, ok: 0, avgLatencyMs: 0, lastCount: null };
      k.calls += 1;
      if (r.ok) k.ok += 1;
      k.avgLatencyMs = Math.round((k.avgLatencyMs * (k.calls - 1) + r.latencyMs) / k.calls);
      if (typeof r.count === "number") k.lastCount = r.count;
      byKind[r.kind] = k;
    }
    out.push({
      supplier,
      totalCalls: list.length,
      okCalls: okList.length,
      errorRate: list.length ? Math.round(((list.length - okList.length) / list.length) * 1000) / 10 : 0,
      avgLatencyMs: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
      p95LatencyMs: percentile(latencies, 95),
      lastCallAt: list[list.length - 1]?.at || null,
      lastOkAt: lastOk?.at || null,
      lastError: lastErr?.error || null,
      lastErrorAt: lastErr?.at || null,
      lastResultCount: lastSearch?.count ?? null,
      byKind,
    });
  }
  return out.sort((a, b) => a.supplier.localeCompare(b.supplier));
}

export async function getRecentSupplierCalls(limit = 50, supplier?: string): Promise<SupplierCallRecord[]> {
  await loadFromDisk();
  const all: SupplierCallRecord[] = [];
  for (const [s, list] of rings) {
    if (supplier && s !== supplier) continue;
    all.push(...list);
  }
  return all.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}

/**
 * Runs a supplier call with a hard time budget and records telemetry.
 * Rejections are converted into `{ ok:false }` so orchestrators never
 * lose the error while still being able to continue with other suppliers.
 */
export async function runSupplierCall<T>(
  supplier: string,
  kind: SupplierCallKind,
  budgetMs: number,
  fn: (signal: AbortSignal) => Promise<T>,
  countOf?: (value: T) => number,
  meta?: Record<string, string | number | boolean | undefined>
): Promise<{ ok: true; value: T; latencyMs: number } | { ok: false; error: string; latencyMs: number; timedOut: boolean }> {
  const started = Date.now();
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, Math.max(1000, budgetMs));
  try {
    const value = await Promise.race([
      fn(controller.signal),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () =>
          reject(new Error(`timeout after ${budgetMs}ms`))
        );
      }),
    ]);
    const latencyMs = Date.now() - started;
    recordSupplierCall({ supplier, kind, ok: true, latencyMs, count: countOf ? countOf(value) : undefined, meta });
    return { ok: true, value, latencyMs };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const error = err instanceof Error ? err.message : String(err);
    recordSupplierCall({ supplier, kind, ok: false, latencyMs, error, meta: { ...(meta || {}), timedOut } });
    return { ok: false, error, latencyMs, timedOut };
  } finally {
    clearTimeout(timer);
  }
}
