import { describe, expect, it } from "vitest";
import {
  rankTopics,
  recencyFromDate,
  scoreTopic,
} from "@/lib/automation/content/score";
import type { DiscoveredTopic } from "@/lib/automation/types";

function topic(partial: Partial<DiscoveredTopic> & Pick<DiscoveredTopic, "id" | "score">): DiscoveredTopic {
  return {
    titleAr: "ت",
    titleEn: "t",
    titleTr: "t",
    queryAr: "ت",
    queryEn: partial.queryEn || partial.id,
    destination: "istanbul",
    angle: "test",
    sourceIds: [],
    sourceTitles: [],
    trendInterest: 50,
    recencyScore: 50,
    relevanceScore: 90,
    ...partial,
  };
}

describe("content scoring", () => {
  it("gives higher recency to yesterday than last month", () => {
    const now = new Date("2026-08-31T12:00:00Z");
    const fresh = recencyFromDate("2026-08-30T12:00:00Z", now);
    const old = recencyFromDate("2026-07-01T12:00:00Z", now);
    expect(fresh).toBeGreaterThan(old);
  });

  it("weights Istanbul product relevance above generic turkey", () => {
    const istanbul = scoreTopic({
      trendInterest: 50,
      recencyScore: 50,
      destination: "istanbul",
    });
    const generic = scoreTopic({
      trendInterest: 50,
      recencyScore: 50,
      destination: "turkey",
    });
    expect(istanbul.score).toBeGreaterThan(generic.score);
  });

  it("ranks and dedupes by destination + query", () => {
    const ranked = rankTopics([
      topic({ id: "a", queryEn: "istanbul spring", score: 40 }),
      topic({ id: "b", queryEn: "istanbul spring", score: 90 }),
      topic({ id: "c", queryEn: "antalya summer", destination: "antalya", score: 70 }),
    ]);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].id).toBe("b");
  });
});
