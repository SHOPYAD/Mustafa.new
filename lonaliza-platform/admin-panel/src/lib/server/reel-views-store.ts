import { promises as fs } from "fs";
import path from "path";
import { incrementPostViewCount } from "@/lib/server/community-feed-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "reel-views.json");
export const REEL_VIEW_DEBOUNCE_MS = 6 * 60 * 60 * 1000;

type ViewerMap = Record<string, number>;

export type ReelViewRecord = {
  viewsCount: number;
  viewers: ViewerMap;
};

type ViewsFile = Record<string, ReelViewRecord>;

let memoryViews: ViewsFile | null = null;
let writeQueue = Promise.resolve();

async function persist(next: ViewsFile): Promise<void> {
  memoryViews = next;
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STORE_FILE, JSON.stringify(next), "utf-8");
  });
  await writeQueue;
}

export async function loadReelViews(): Promise<ViewsFile> {
  if (memoryViews) return memoryViews;
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ViewsFile;
    memoryViews = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    memoryViews = {};
  }
  return memoryViews;
}

export function shouldCountView(
  lastViewAt: number | undefined,
  now = Date.now(),
  debounceMs = REEL_VIEW_DEBOUNCE_MS,
): boolean {
  if (!lastViewAt) return true;
  return now - lastViewAt >= debounceMs;
}

export async function getReelViewCount(reelId: string): Promise<number> {
  const store = await loadReelViews();
  return store[reelId]?.viewsCount || 0;
}

export async function attachReelViewCounts<T extends { id: string; viewsCount?: number }>(
  items: T[],
): Promise<T[]> {
  if (!items.length) return items;
  const store = await loadReelViews();
  return items.map((item) => {
    const stored = store[item.id]?.viewsCount || 0;
    const current = item.viewsCount || 0;
    return { ...item, viewsCount: Math.max(current, stored) };
  });
}

export async function incrementAuthenticatedReelView(
  reelId: string,
  userId: string,
): Promise<{ viewsCount: number; counted: boolean }> {
  const id = String(reelId || "").trim();
  const uid = String(userId || "").trim();
  if (!id || !uid) return { viewsCount: 0, counted: false };

  const store = await loadReelViews();
  const rec: ReelViewRecord = store[id] || { viewsCount: 0, viewers: {} };
  const now = Date.now();
  const last = rec.viewers[uid];
  if (!shouldCountView(last, now)) {
    return { viewsCount: rec.viewsCount || 0, counted: false };
  }

  rec.viewsCount = (rec.viewsCount || 0) + 1;
  rec.viewers[uid] = now;
  const cutoff = now - REEL_VIEW_DEBOUNCE_MS;
  for (const [viewer, ts] of Object.entries(rec.viewers)) {
    if (ts < cutoff) delete rec.viewers[viewer];
  }
  store[id] = rec;
  await persist(store);

  try {
    await incrementPostViewCount(id, rec.viewsCount);
  } catch {
    /* post may only exist as a relay reel */
  }

  return { viewsCount: rec.viewsCount, counted: true };
}
