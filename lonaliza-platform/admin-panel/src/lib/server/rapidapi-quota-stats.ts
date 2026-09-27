import { promises as fs } from "fs";
import path from "path";

export type RapidApiQuotaProvider = "booking" | "travel_advisor" | "sky_scrapper";

export type RapidApiQuotaSnapshot = {
  provider: RapidApiQuotaProvider;
  monthKey: string;
  liveCalls: number;
  success: number;
  failed: number;
  quota429: number;
  headerLimit: number | null;
  headerRemaining: number | null;
  headerReset: string | null;
  headerSeen: boolean;
  lastCallAt: string | null;
  lastCallPath: string;
  lastHttpStatus: number | null;
  last429At: string | null;
  last429Path: string;
};

export type RapidApiQuotaAdvice = {
  changeKey: boolean;
  reason: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "rapidapi-quota-stats.json");

type StoreFile = {
  booking: RapidApiQuotaSnapshot;
  travel_advisor: RapidApiQuotaSnapshot;
  sky_scrapper: RapidApiQuotaSnapshot;
};

function monthKey(at = new Date()): string {
  return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}`;
}

function emptySnapshot(provider: RapidApiQuotaProvider): RapidApiQuotaSnapshot {
  return {
    provider,
    monthKey: monthKey(),
    liveCalls: 0,
    success: 0,
    failed: 0,
    quota429: 0,
    headerLimit: null,
    headerRemaining: null,
    headerReset: null,
    headerSeen: false,
    lastCallAt: null,
    lastCallPath: "",
    lastHttpStatus: null,
    last429At: null,
    last429Path: "",
  };
}

function asNumber(value: string | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function headerGet(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name);
    if (value != null && value.trim()) return value.trim();
  }
  return null;
}

function resetLabel(raw: string | null): string | null {
  if (!raw) return null;
  if (/^\d{9,13}$/.test(raw)) {
    const ms = raw.length <= 10 ? Number(raw) * 1000 : Number(raw);
    const date = new Date(ms);
    return Number.isFinite(date.getTime()) ? date.toISOString() : raw;
  }
  return raw;
}

function rollMonth(snap: RapidApiQuotaSnapshot, provider: RapidApiQuotaProvider): RapidApiQuotaSnapshot {
  const now = monthKey();
  if (snap.monthKey === now) return snap;
  return {
    ...emptySnapshot(provider),
    headerLimit: snap.headerLimit,
    last429At: snap.last429At,
    last429Path: snap.last429Path,
  };
}

let memory: StoreFile | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function readStore(): Promise<StoreFile> {
  if (memory) {
    if (!memory.sky_scrapper) memory.sky_scrapper = emptySnapshot("sky_scrapper");
    memory.booking = rollMonth(memory.booking, "booking");
    memory.travel_advisor = rollMonth(memory.travel_advisor, "travel_advisor");
    memory.sky_scrapper = rollMonth(memory.sky_scrapper, "sky_scrapper");
    return memory;
  }
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    memory = {
      booking: rollMonth(
        { ...emptySnapshot("booking"), ...(parsed.booking || {}) },
        "booking"
      ),
      travel_advisor: rollMonth(
        { ...emptySnapshot("travel_advisor"), ...(parsed.travel_advisor || {}) },
        "travel_advisor"
      ),
      sky_scrapper: rollMonth(
        { ...emptySnapshot("sky_scrapper"), ...(parsed.sky_scrapper || {}) },
        "sky_scrapper"
      ),
    };
  } catch {
    memory = {
      booking: emptySnapshot("booking"),
      travel_advisor: emptySnapshot("travel_advisor"),
      sky_scrapper: emptySnapshot("sky_scrapper"),
    };
  }
  return memory;
}

function persistSoon(store: StoreFile) {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
    } catch {
      /* ignore */
    }
  });
}

export function recordRapidApiLiveCall(input: {
  provider: RapidApiQuotaProvider;
  path: string;
  status: number;
  headers?: Headers;
  ok: boolean;
}): void {
  void (async () => {
    const store = await readStore();
    const snap = rollMonth(store[input.provider], input.provider);
    const now = new Date().toISOString();
    const pathLabel = String(input.path || "").slice(0, 160);
    snap.liveCalls += 1;
    if (input.ok) snap.success += 1;
    else snap.failed += 1;
    snap.lastCallAt = now;
    snap.lastCallPath = pathLabel;
    snap.lastHttpStatus = input.status;
    if (input.status === 429) {
      snap.quota429 += 1;
      snap.last429At = now;
      snap.last429Path = pathLabel;
    }
    if (input.headers) {
      const limit = asNumber(
        headerGet(input.headers, [
          "x-ratelimit-requests-limit",
          "x-ratelimit-limit",
          "x-rate-limit-limit",
        ])
      );
      const remaining = asNumber(
        headerGet(input.headers, [
          "x-ratelimit-requests-remaining",
          "x-ratelimit-remaining",
          "x-rate-limit-remaining",
        ])
      );
      const reset = resetLabel(
        headerGet(input.headers, [
          "x-ratelimit-requests-reset",
          "x-ratelimit-reset",
          "x-rate-limit-reset",
        ])
      );
      if (limit != null) snap.headerLimit = limit;
      if (remaining != null) snap.headerRemaining = remaining;
      if (reset) snap.headerReset = reset;
      if (limit != null || remaining != null) snap.headerSeen = true;
    }
    store[input.provider] = snap;
    memory = store;
    persistSoon(store);
  })();
}

export function adviseQuota(snap: RapidApiQuotaSnapshot): RapidApiQuotaAdvice {
  const remaining = snap.headerRemaining;
  const limit = snap.headerLimit;
  const recent429 =
    Boolean(snap.last429At) &&
    Date.now() - Date.parse(snap.last429At || "") < 24 * 60 * 60 * 1000;
  if (remaining != null && remaining <= 0) {
    return { changeKey: true, reason: "المتبقي من ترويسة RapidAPI صفر. غيّر المفتاح أو انتظر إعادة التعيين." };
  }
  if (remaining != null && limit && remaining / limit <= 0.15) {
    return { changeKey: true, reason: "المتبقي منخفض نسبةً إلى الحد. غيّر المفتاح قبل نفاد الحصة." };
  }
  if (remaining != null && remaining <= 10) {
    return { changeKey: true, reason: "المتبقي 10 طلبات أو أقل. غيّر المفتاح." };
  }
  if (snap.quota429 >= 3 || recent429) {
    return {
      changeKey: true,
      reason: "ظهور 429 متكرر. غيّر المفتاح أو أوقف الجلب الحي حتى تُعاد الحصة.",
    };
  }
  return { changeKey: false, reason: "" };
}

export async function getRapidApiQuotaStats(): Promise<{
  booking: RapidApiQuotaSnapshot & { advice: RapidApiQuotaAdvice };
  travel_advisor: RapidApiQuotaSnapshot & { advice: RapidApiQuotaAdvice };
  sky_scrapper: RapidApiQuotaSnapshot & { advice: RapidApiQuotaAdvice };
}> {
  const store = await readStore();
  return {
    booking: { ...store.booking, advice: adviseQuota(store.booking) },
    travel_advisor: { ...store.travel_advisor, advice: adviseQuota(store.travel_advisor) },
    sky_scrapper: { ...store.sky_scrapper, advice: adviseQuota(store.sky_scrapper) },
  };
}
