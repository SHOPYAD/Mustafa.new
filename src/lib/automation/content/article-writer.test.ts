import { describe, expect, it } from "vitest";
import { writeOriginalArticle } from "@/lib/automation/content/article-writer";
import { EVERGREEN_TOPICS } from "@/lib/automation/content/catalog";
import { scoreTopic } from "@/lib/automation/content/score";
import type { DiscoveredTopic } from "@/lib/automation/types";

describe("writeOriginalArticle", () => {
  it("writes 1200+ original Arabic words with headings, FAQ, and package links", async () => {
    const seed = EVERGREEN_TOPICS[0];
    const scored = scoreTopic({
      trendInterest: seed.baseInterest,
      recencyScore: 60,
      destination: seed.destination,
    });
    const topic: DiscoveredTopic = {
      ...seed,
      sourceIds: ["evergreen-alrayyan"],
      sourceTitles: ["عنوان تجريبي من RSS"],
      trendInterest: seed.baseInterest,
      recencyScore: 60,
      relevanceScore: scored.relevanceScore,
      score: scored.score,
    };
    const article = await writeOriginalArticle({
      topic,
      locales: ["ar", "en"],
      minWords: 1200,
      now: new Date("2026-08-31T09:00:00+03:00"),
      photos: [],
      ogImage: "",
    });
    expect(article.wordCountAr).toBeGreaterThanOrEqual(1200);
    expect(article.contentAr).toContain("<h2>");
    expect(article.contentAr).toContain("<h3>");
    expect(article.contentAr).toMatch(/\/package\/|\/holidays/);
    expect(article.contentAr).toContain("wa.me");
    expect(article.contentAr).not.toContain("Lorem ipsum");
  });
});
