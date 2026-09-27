import { DESTINATION_PACKS } from "@/lib/automation/content/catalog";
import type { DiscoveredTopic, TopicDestination } from "@/lib/automation/types";

const PRODUCT_DESTINATIONS = new Set<TopicDestination>([
  "istanbul",
  "antalya",
  "trabzon",
  "cappadocia",
  "bursa",
  "sapanca",
  "bodrum",
  "izmir",
  "visa",
]);

export function recencyFromDate(iso: string | undefined, now: Date): number {
  if (!iso) return 35;
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return 35;
  const days = Math.max(0, (now.getTime() - ts) / 86_400_000);
  if (days <= 1) return 100;
  if (days <= 3) return 88;
  if (days <= 7) return 74;
  if (days <= 21) return 58;
  if (days <= 45) return 40;
  return 22;
}

export function relevanceForDestination(destination: TopicDestination): number {
  if (PRODUCT_DESTINATIONS.has(destination)) return 92;
  if (destination === "season" || destination === "events") return 70;
  return 48;
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreTopic(input: {
  trendInterest: number;
  recencyScore: number;
  destination: TopicDestination;
}): { relevanceScore: number; score: number } {
  const relevanceScore = relevanceForDestination(input.destination);
  const score = clampScore(
    input.trendInterest * 0.45 +
      input.recencyScore * 0.25 +
      relevanceScore * 0.3
  );
  return { relevanceScore, score };
}

export function rankTopics(topics: DiscoveredTopic[]): DiscoveredTopic[] {
  const best = new Map<string, DiscoveredTopic>();
  for (const topic of topics) {
    const key = `${topic.destination}|${topic.queryEn.toLowerCase()}`;
    const prev = best.get(key);
    if (!prev || topic.score > prev.score) best.set(key, topic);
  }
  return Array.from(best.values()).sort(
    (a, b) => b.score - a.score || b.trendInterest - a.trendInterest
  );
}

export function productMatchBoost(text: string): number {
  const hay = text.toLowerCase();
  let boost = 0;
  for (const pack of Object.values(DESTINATION_PACKS)) {
    if (pack.keywords.some((k) => hay.includes(k.toLowerCase()))) boost += 8;
  }
  if (/visa|تأشير|hotel|فندق|flight|طيران|package|برنامج/.test(hay)) {
    boost += 10;
  }
  return Math.min(20, boost);
}
