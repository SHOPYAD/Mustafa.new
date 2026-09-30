import { KEYWORD_OVERRIDES } from "./overrides";
import { LEXICON_BY_TERM } from "./intent-lexicon.generated";
import { PLATFORM_INDEX_BY_ID, PLATFORM_INDEX_NODES } from "./platform-index.generated";
import type { PlatformIndexNode } from "./types";
import { normalizeArabic } from "@/lib/neural-studio/domain-systems";

export * from "./types";
export { PLATFORM_INDEX_NODES, PLATFORM_INDEX_BY_ID, PLATFORM_INDEX_GENERATED_AT } from "./platform-index.generated";
export { INTENT_LEXICON, LEXICON_BY_TERM } from "./intent-lexicon.generated";

export function getPlatformNode(id: string): PlatformIndexNode | undefined {
  return PLATFORM_INDEX_BY_ID[id];
}

export type NodeMatch = { node: PlatformIndexNode; score: number; onScreen: boolean };

/** مطابقة حتمية على الفهرس + overrides. */
export function matchPlatformNodes(text: string, screenId?: string): NodeMatch[] {
  const normalized = normalizeArabic(text);
  if (!normalized) return [];

  const scores = new Map<string, number>();

  for (const node of PLATFORM_INDEX_NODES) {
    let score = 0;
    for (const kw of node.keywords) {
      if (kw.length < 2) continue;
      if (normalized.includes(kw)) score = Math.max(score, kw.length);
    }
    if (score > 0) scores.set(node.id, score);
  }

  for (const [term, nodeIds] of Object.entries(LEXICON_BY_TERM)) {
    if (term.length >= 2 && normalized.includes(term)) {
      for (const id of nodeIds) scores.set(id, Math.max(scores.get(id) || 0, term.length));
    }
  }

  for (const [term, nodeIds] of Object.entries(KEYWORD_OVERRIDES)) {
    const t = normalizeArabic(term);
    if (t.length >= 2 && normalized.includes(t)) {
      for (const id of nodeIds) {
        if (PLATFORM_INDEX_BY_ID[id]) scores.set(id, Math.max(scores.get(id) || 0, t.length + 2));
      }
    }
  }

  const matches: NodeMatch[] = [];
  for (const [id, score] of scores) {
    const node = PLATFORM_INDEX_BY_ID[id];
    if (!node) continue;
    matches.push({
      node,
      score,
      onScreen: Boolean(screenId && node.screenId === screenId),
    });
  }

  const local = matches.filter((m) => m.onScreen);
  const pool = local.length ? local : matches;
  return pool.sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id));
}

export function bestPlatformNode(text: string, screenId?: string): NodeMatch | null {
  const ranked = matchPlatformNodes(text, screenId);
  return ranked[0] ?? null;
}
