type Entry<T> = { at: number; value: T };

export function createLru<T>(max = 400, ttlMs = 6 * 60 * 60 * 1000) {
  const map = new Map<string, Entry<T>>();
  return {
    get(key: string): T | undefined {
      const hit = map.get(key);
      if (!hit) return undefined;
      if (Date.now() - hit.at > ttlMs) {
        map.delete(key);
        return undefined;
      }
      map.delete(key);
      map.set(key, hit);
      return hit.value;
    },
    set(key: string, value: T) {
      if (map.has(key)) map.delete(key);
      map.set(key, { at: Date.now(), value });
      while (map.size > max) {
        const first = map.keys().next().value;
        if (first == null) break;
        map.delete(first);
      }
    },
  };
}
