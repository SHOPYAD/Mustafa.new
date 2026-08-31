import { promises as fs } from "fs";
import path from "path";
import { defaultTours, type Tour } from "@/data/tours";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "tours-extra.json");

type StoreFile = {
  tours: Tour[];
  updatedAt?: string;
};

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-tours-extra.json");
  }
  return STORE_FILE;
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!Array.isArray(parsed.tours)) return { tours: [] };
    return parsed;
  } catch {
    return { tours: [] };
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
  await fs.writeFile(
    getStoreFile(),
    JSON.stringify({ ...store, updatedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

export function sanitizeTour(
  raw: Partial<Tour> & Record<string, unknown>,
  existing?: Tour
): Tour {
  const timingRaw = String(raw.timing || existing?.timing || "morning");
  const timing: Tour["timing"] =
    timingRaw === "afternoon" || timingRaw === "evening"
      ? timingRaw
      : "morning";
  return {
    id:
      String(raw.id || existing?.id || "") ||
      `tour_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title: String(raw.title || existing?.title || "جولة"),
    image: String(raw.image || existing?.image || ""),
    duration: String(raw.duration || existing?.duration || "8 hours"),
    timing,
    rating: Number(raw.rating ?? existing?.rating ?? 4.8) || 4.8,
    reviewCount: Number(raw.reviewCount ?? existing?.reviewCount ?? 0) || 0,
    price: Number(raw.price ?? existing?.price ?? 0) || 0,
    originalPrice:
      raw.originalPrice != null
        ? Number(raw.originalPrice)
        : existing?.originalPrice,
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights.map(String)
      : existing?.highlights || [],
    category: String(raw.category || existing?.category || "Day Tour"),
    popular: Boolean(raw.popular ?? existing?.popular),
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : existing?.isActive !== false,
  };
}

export async function listExtraTours(): Promise<Tour[]> {
  return (await readStore()).tours;
}

export async function listMergedTours(): Promise<Tour[]> {
  const extras = await listExtraTours();
  const ids = new Set(extras.map((t) => t.id));
  return [...extras, ...defaultTours.filter((t) => !ids.has(t.id))];
}

export async function upsertTour(
  incoming: Partial<Tour> & Record<string, unknown>
): Promise<Tour> {
  const store = await readStore();
  const idx = store.tours.findIndex(
    (t) => t.id === incoming.id || t.title === incoming.title
  );
  const existing = idx >= 0 ? store.tours[idx] : undefined;
  const tour = sanitizeTour(incoming, existing);
  if (idx >= 0) store.tours[idx] = tour;
  else store.tours.unshift(tour);
  await writeStore(store);
  return tour;
}
