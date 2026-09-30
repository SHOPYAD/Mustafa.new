import type { BlueprintLoop } from "./blueprint-types";

const g = globalThis as unknown as {
  __studioLoopBySession?: Map<string, { loop: BlueprintLoop; at: number }>;
  __studioLoopById?: Map<string, BlueprintLoop>;
};

const bySession = (g.__studioLoopBySession ??= new Map());
const byId = (g.__studioLoopById ??= new Map());

const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function isBlueprintLoop(raw: unknown): raw is BlueprintLoop {
  if (!raw || typeof raw !== "object") return false;
  const loop = raw as BlueprintLoop;
  return typeof loop.id === "string" && typeof loop.name === "string" && Array.isArray(loop.nodes) && Array.isArray(loop.connections);
}

/** Persist active loop graph from screen 22 (or agent payload) for server-side execution. */
export function setSessionLoopSnapshot(sessionId: string, loop: BlueprintLoop) {
  if (!isBlueprintLoop(loop)) return;
  bySession.set(sessionId, { loop, at: Date.now() });
  byId.set(loop.id, loop);
}

export function getSessionLoopSnapshot(sessionId: string): BlueprintLoop | null {
  const hit = bySession.get(sessionId);
  if (!hit) return null;
  if (Date.now() - hit.at > MAX_AGE_MS) {
    bySession.delete(sessionId);
    return null;
  }
  return hit.loop;
}

export function getLoopById(loopId: string): BlueprintLoop | null {
  return byId.get(loopId) ?? null;
}

/** Resolve graph: inline `input.loop`, then id, then latest session snapshot. */
export function resolveBlueprintLoop(input: Record<string, unknown>, sessionId?: string): BlueprintLoop | null {
  if (isBlueprintLoop(input.loop)) return input.loop;
  const id = String(input.loopId || input.blueprintId || "").trim();
  if (id) {
    const byIdHit = getLoopById(id);
    if (byIdHit) return byIdHit;
  }
  if (sessionId) {
    const snap = getSessionLoopSnapshot(sessionId);
    if (snap && (!id || snap.id === id)) return snap;
  }
  return null;
}
