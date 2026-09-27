import { createLru } from "./lru";

export const NOMINATIM_UA = "LonalizaPlanner/1.0 (https://lonaliza.com; trip planner)";

export type NominatimHit = {
  label: string;
  lat: number;
  lng: number;
  address?: string;
};

const cache = createLru<NominatimHit[]>(500);
let chain = Promise.resolve();
let lastAt = 0;

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = Math.max(0, 1100 - (Date.now() - lastAt));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastAt = Date.now();
    return fn();
  });
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function nominatimSearch(q: string, limit = 6): Promise<NominatimHit[]> {
  const key = `${q.trim().toLowerCase()}|${limit}`;
  const cached = cache.get(key);
  if (cached) return cached;
  if (!q.trim()) return [];

  const hits = await enqueue(async () => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&addressdetails=0&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_UA },
      next: { revalidate: 3600 },
    });
    const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    return (rows || []).map((r) => ({
      label: r.display_name,
      address: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
    }));
  }).catch(() => [] as NominatimHit[]);

  if (hits.length) cache.set(key, hits);
  return hits;
}
