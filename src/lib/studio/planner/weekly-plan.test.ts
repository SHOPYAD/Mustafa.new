import { describe, expect, it } from "vitest";
import type { DiscoveredTopic } from "@/lib/automation/types";
import {
  buildWeeklyPlanFromTopics,
  parseStudioLocale,
} from "@/lib/studio/planner/weekly-plan";

function topic(id: string, score: number): DiscoveredTopic {
  return {
    id,
    titleAr: `موضوع ${id}`,
    titleEn: `Topic ${id}`,
    titleTr: `Konu ${id}`,
    queryAr: id,
    queryEn: id,
    destination: "istanbul",
    angle: "test",
    sourceIds: ["evergreen-alrayyan"],
    sourceTitles: [],
    trendInterest: 80,
    recencyScore: 70,
    relevanceScore: 90,
    score,
  };
}

describe("weekly tourism planner", () => {
  it("defaults locale to ar", () => {
    expect(parseStudioLocale("xx")).toBe("ar");
    expect(parseStudioLocale("en")).toBe("en");
  });

  it("builds a 7-day plan with platform, slot, and format", () => {
    const plan = buildWeeklyPlanFromTopics({
      topics: [topic("a", 90), topic("b", 80), topic("c", 70)],
      locale: "ar",
      weekStart: new Date("2026-08-31T00:00:00.000Z"),
      now: new Date("2026-08-31T12:00:00.000Z"),
      sourcesUsed: ["كتالوج الريان"],
      limitations: [],
    });
    expect(plan.items).toHaveLength(7);
    expect(plan.items.map((row) => row.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(plan.items.every((row) => row.captionDraft.length > 8)).toBe(true);
    expect(plan.items.some((row) => row.format === "slide")).toBe(true);
    expect(plan.items.some((row) => row.format === "reel")).toBe(true);
    expect(plan.items.some((row) => row.format === "story")).toBe(true);
    expect(plan.items[0]?.platform).toBe("instagram");
  });
});
