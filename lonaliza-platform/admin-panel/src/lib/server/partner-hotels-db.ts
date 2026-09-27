/**
 * Agent B: public homepage content
 * Local luxury-hotel logo index — reads/writes `.data/partner-hotels`.
 */

import fs from "node:fs/promises";
import path from "node:path";
import {
  FALLBACK_HOTEL_LOGOS,
  HOMEPAGE_HOTELS,
  catalogHotelLogo,
  type PartnerHotelRecord,
} from "@/data/partner-logo-catalog";

export type StoredPartnerHotel = PartnerHotelRecord & {
  logoUrl: string;
};

export type PartnerHotelsMeta = {
  source: string;
  importedAt: string;
  hotelCount: number;
};

type Index = {
  hotels: StoredPartnerHotel[];
  meta: PartnerHotelsMeta;
};

const DATA_DIR = path.join(process.cwd(), ".data", "partner-hotels");

function seedHotels(): StoredPartnerHotel[] {
  return HOMEPAGE_HOTELS.map((row) => ({
    ...row,
    logoUrl: catalogHotelLogo(row.domain),
  }));
}

function seedIndex(): Index {
  const hotels = seedHotels();
  return {
    hotels,
    meta: {
      source: "seed",
      importedAt: "",
      hotelCount: hotels.length,
    },
  };
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function persist(index: Index) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, "hotels.json"), JSON.stringify(index.hotels, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "meta.json"), JSON.stringify(index.meta, null, 2));
}

let cached: Index | null = null;
let loadPromise: Promise<Index> | null = null;

async function loadIndex(): Promise<Index> {
  const hotels = await readJson<StoredPartnerHotel[]>("hotels.json");
  const meta = await readJson<PartnerHotelsMeta>("meta.json");
  if (hotels?.length) {
    return {
      hotels,
      meta: meta || { source: "local", importedAt: "", hotelCount: hotels.length },
    };
  }
  const seeded = seedIndex();
  seeded.meta = {
    source: "seed",
    importedAt: new Date().toISOString(),
    hotelCount: seeded.hotels.length,
  };
  try {
    await persist(seeded);
  } catch {
    /* keep serving seed if disk is read-only */
  }
  return seeded;
}

export async function getPartnerHotelsIndex(): Promise<Index> {
  if (cached) return cached;
  if (!loadPromise) {
    loadPromise = loadIndex()
      .then((idx) => {
        cached = idx;
        return idx;
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export async function getHomepageHotels(): Promise<StoredPartnerHotel[]> {
  const idx = await getPartnerHotelsIndex();
  const byId = new Map(FALLBACK_HOTEL_LOGOS.map((row) => [row.id, row.logoUrl]));
  return idx.hotels.map((row) => {
    const local = byId.get(row.id) || catalogHotelLogo(row.domain);
    const remote = String(row.logoUrl || "");
    if (!remote || /clearbit\.com|googleusercontent|logo\.dev/i.test(remote)) {
      return { ...row, logoUrl: local || remote };
    }
    return row;
  });
}

export async function getPartnerHotelsMeta(): Promise<PartnerHotelsMeta> {
  const idx = await getPartnerHotelsIndex();
  return idx.meta;
}

export function invalidatePartnerHotelsIndex() {
  cached = null;
}
