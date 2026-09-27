import { describe, it, expect } from "vitest";
import { runTripAdvisorReviewsAgent, getTripAdvisorAgentStatus } from "./tripadvisor-reviews-agent";
import { callBuiltinTool, verifyBuiltinCatalog } from "@/lib/server/mcp/builtin";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

describe("TripAdvisor Reviews MCP Server & Autonomous Agent", () => {
  it("verifies TripAdvisor MCP server registration and tools", async () => {
    const catalog = await verifyBuiltinCatalog("liotrip-tripadvisor-reviews");
    expect(catalog.ok).toBe(true);
    const toolNames = catalog.tools.map((t) => t.name);
    expect(toolNames).toContain("tripadvisor.crawl_reviews");
    expect(toolNames).toContain("tripadvisor.translate_reviews");
    expect(toolNames).toContain("tripadvisor.inject_reviews");
    expect(toolNames).toContain("tripadvisor.sync_hotel");
  });

  it("crawls, translates via LibreTranslate, and injects reviews via TripAdvisor MCP tool", async () => {
    const res = await callBuiltinTool("liotrip-tripadvisor-reviews", "tripadvisor.sync_hotel", {
      hotelName: "Raffles Istanbul",
      city: "Istanbul",
      limit: 2,
      targetLang: "ar",
    });

    expect(res.ok).toBe(true);
    const parsed = JSON.parse(res.content);
    expect(parsed.ok).toBe(true);
    expect(parsed.crawledCount).toBeGreaterThan(0);
    expect(parsed.translatedCount).toBeGreaterThan(0);
    expect(parsed.injectedCount).toBeGreaterThan(0);

    // Verify Arabic translation exists
    const firstReview = parsed.reviews[0];
    expect(firstReview).toBeDefined();
    expect(firstReview.textAr).toBeDefined();
    expect(/[\u0600-\u06FF]/.test(firstReview.textAr || "")).toBe(true);
  }, 25000);

  it("runs the Autonomous TripAdvisor Reviews Agent and validates DB storage", async () => {
    const result = await runTripAdvisorReviewsAgent({
      specificHotelName: "Swissotel The Bosphorus Istanbul",
      city: "Istanbul",
      batchSize: 1,
      targetLang: "ar",
    });

    expect(result.ok).toBe(true);
    expect(result.hotelsProcessed).toBeGreaterThan(0);
    expect(result.totalReviewsInjected).toBeGreaterThan(0);
    expect(result.totalReviewsTranslated).toBeGreaterThan(0);

    // Verify status tracking
    const status = getTripAdvisorAgentStatus();
    expect(status.lastRun).not.toBeNull();
    expect(status.lastRun?.hotelsProcessed).toBeGreaterThan(0);

    // Verify in PocketBase database directly
    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      const list = await pb.collection("hotel_guest_reviews").getList(1, 5, {
        filter: "source = 'tripadvisor'",
        sort: "-created",
      });
      expect(list.totalItems).toBeGreaterThan(0);
      const taReview = list.items[0];
      expect(taReview.source).toBe("tripadvisor");
      expect(taReview.lang).toBe("ar");
      expect(taReview.text.length).toBeGreaterThan(10);
    }
  }, 30000);
});
