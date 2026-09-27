/**
 * Durable Sky Scrapper numeric entity IDs.
 * Autocomplete stays on the local airport DB; this map only stores skyId → entityId
 * so live search never sends synthetic loc-a-* / loc-c-* values.
 */

import { promises as fs } from "fs";
import path from "path";

export type SkyPlaceKind = "city" | "airport";

export type SkyPlaceRecord = {
  skyId: string;
  entityId: string;
  kind: SkyPlaceKind;
};

const STORE_FILE = path.join(process.cwd(), ".data", "airports", "sky-entity-ids.json");

/** Confirmed from live searchAirport / prior successful ISTA→CMN searches. */
const SEED: SkyPlaceRecord[] = [
  { skyId: "ISTA", entityId: "27542903", kind: "city" },
  { skyId: "CMN", entityId: "95673387", kind: "airport" },
  { skyId: "IST", entityId: "95673323", kind: "airport" },
  { skyId: "SAW", entityId: "95673324", kind: "airport" },
  { skyId: "LOND", entityId: "27544008", kind: "city" },
  { skyId: "PARI", entityId: "27539733", kind: "city" },
  { skyId: "PAR", entityId: "27539733", kind: "city" },
  { skyId: "CDG", entityId: "95565050", kind: "airport" },
];

type StoreFile = { places: SkyPlaceRecord[] };

let memory: Map<string, SkyPlaceRecord> | null = null;
let loadPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function normSky(value: string): string {
  return String(value || "")
    .trim()
    .replace(/^loc-[ac]-/i, "")
    .toUpperCase();
}

function isNumericEntity(value: string): boolean {
  return /^\d{4,}$/.test(String(value || "").trim());
}

function mapKey(skyId: string, kind: SkyPlaceKind): string {
  return `${kind}:${normSky(skyId)}`;
}

function put(map: Map<string, SkyPlaceRecord>, place: SkyPlaceRecord): void {
  if (!place.skyId || !isNumericEntity(place.entityId)) return;
  const record: SkyPlaceRecord = {
    skyId: normSky(place.skyId),
    entityId: String(place.entityId).trim(),
    kind: place.kind,
  };
  map.set(mapKey(record.skyId, record.kind), record);
}

function seedMap(): Map<string, SkyPlaceRecord> {
  const map = new Map<string, SkyPlaceRecord>();
  for (const item of SEED) put(map, item);
  return map;
}

async function readStore(): Promise<void> {
  const map = seedMap();
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreFile>;
    for (const item of parsed.places || []) put(map, item);
  } catch {
    /* first boot — seed only */
  }
  memory = map;
}

export async function ensureSkyEntityMap(): Promise<void> {
  if (memory) return;
  if (!loadPromise) {
    loadPromise = readStore().finally(() => {
      loadPromise = null;
    });
  }
  await loadPromise;
}

function persistSoon(): void {
  if (!memory) return;
  const places = [...memory.values()].sort((a, b) => a.skyId.localeCompare(b.skyId));
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
      await fs.writeFile(STORE_FILE, JSON.stringify({ places }, null, 2), { mode: 0o600 });
    } catch {
      /* ignore disk errors */
    }
  });
}

export function lookupSkyEntity(skyId: string, kind?: SkyPlaceKind): SkyPlaceRecord | null {
  const code = normSky(skyId);
  if (!code || !memory) return null;
  if (kind) {
    const exact = memory.get(mapKey(code, kind));
    if (exact) return exact;
  }
  const city = memory.get(mapKey(code, "city"));
  const airport = memory.get(mapKey(code, "airport"));
  if (kind === "city") return city || airport || null;
  if (kind === "airport") return airport || city || null;
  return city || airport || null;
}

export async function rememberSkyPlace(place: SkyPlaceRecord): Promise<void> {
  await ensureSkyEntityMap();
  if (!memory || !place.skyId || !isNumericEntity(place.entityId)) return;
  const key = mapKey(place.skyId, place.kind);
  const prev = memory.get(key);
  if (prev && prev.entityId === String(place.entityId).trim()) return;
  put(memory, place);
  persistSoon();
}

export function applyMappedEntity<T extends { skyId: string; entityId: string; kind?: SkyPlaceKind; iata?: string }>(
  hit: T
): T {
  const kind = hit.kind === "city" ? "city" : hit.kind === "airport" ? "airport" : undefined;
  const mapped =
    lookupSkyEntity(hit.skyId, kind) ||
    (hit.iata ? lookupSkyEntity(hit.iata, kind) : null) ||
    lookupSkyEntity(hit.entityId, kind);
  if (!mapped) return hit;
  return { ...hit, skyId: mapped.skyId, entityId: mapped.entityId };
}
