import { existsSync, readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { runArticlesResearchAndPublish } from "@/lib/automation/handlers/articles";

describe("runArticlesResearchAndPublish dry-run", () => {
  it("writes ranked topics + draft article JSON without paid keys", async () => {
    const result = await runArticlesResearchAndPublish(
      {
        id: "dry-verify-articles",
        dryRun: true,
        settings: { count: 1, minWords: 1200, locales: ["ar"], dryRun: true },
      },
      { dryRun: true, now: new Date("2026-08-31T09:00:00+03:00") }
    );
    expect(result.ok).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.topics.length).toBeGreaterThan(0);
    expect(result.produced[0]?.status).toBe("dry-run");
    expect(result.artifacts?.topicsPath).toBeTruthy();
    expect(result.artifacts?.articlePath).toBeTruthy();
    expect(existsSync(result.artifacts!.topicsPath!)).toBe(true);
    expect(existsSync(result.artifacts!.articlePath!)).toBe(true);
    const articleJson = JSON.parse(
      readFileSync(result.artifacts!.articlePath!, "utf8")
    ) as { wordCountAr: number; article: { contentAr: string } };
    expect(articleJson.wordCountAr).toBeGreaterThanOrEqual(1200);
    expect(articleJson.article.contentAr.length).toBeGreaterThan(800);
    expect(result.sourcesUsed.length).toBeGreaterThan(0);
  }, 60_000);
});
