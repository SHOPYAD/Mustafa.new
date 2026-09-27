type Entry<T> = { value: T; exp: number };

const store = new Map<string, Entry<unknown>>();

export function ttlGet<T>(key: string): T | undefined {
  const hit = store.get(key) as Entry<T> | undefined;
  if (!hit) return undefined;
  if (hit.exp <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return hit.value;
}

export function ttlDelete(key: string): void {
  store.delete(key);
}

export function ttlSet<T>(key: string, value: T, ttlMs: number): T {
  if (store.size > 2000) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
  store.set(key, { value, exp: Date.now() + ttlMs });
  return value;
}

export function cacheControlPublic(maxAgeSec: number, swrSec = maxAgeSec * 2): string {
  return `public, max-age=${maxAgeSec}, stale-while-revalidate=${swrSec}`;
}
