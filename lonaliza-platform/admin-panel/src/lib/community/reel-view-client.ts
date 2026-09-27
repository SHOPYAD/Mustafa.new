const VIEW_WATCH_SECONDS = 3;
const recorded = new Set<string>();
const inFlight = new Set<string>();

export function shouldCountReelWatch(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds >= VIEW_WATCH_SECONDS;
}

export function hasRecordedReelView(reelId: string): boolean {
  return recorded.has(reelId);
}

export async function persistReelView(
  reelId: string,
  watchedMs = VIEW_WATCH_SECONDS * 1000,
): Promise<{ viewsCount: number; counted: boolean } | null> {
  const id = String(reelId || "").trim();
  if (!id || recorded.has(id) || inFlight.has(id)) return null;
  inFlight.add(id);
  try {
    const res = await fetch(`/api/community/reels/${encodeURIComponent(id)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ watchedMs }),
    });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      viewsCount?: number;
      counted?: boolean;
    } | null;
    recorded.add(id);
    if (data && typeof data.viewsCount === "number") {
      return { viewsCount: data.viewsCount, counted: Boolean(data.counted) };
    }
    return { viewsCount: 0, counted: false };
  } catch {
    recorded.add(id);
    return null;
  } finally {
    inFlight.delete(id);
  }
}

export function markReelViewLocal(reelId: string): void {
  if (reelId) recorded.add(reelId);
}
