import { describe, it, expect } from "vitest";
import {
  GEMINI_2026_MODELS,
  getGeminiModelById,
  calculateGeminiCost,
  getThinkingBudgetForMode,
} from "@/lib/gemini-models";
import {
  appendAiConsumptionLog,
  getAiAnalyticsSummary,
} from "@/lib/server/ai-consumption-tracker";

describe("Gemini 2026 Models & Cost Calculator", () => {
  it("should have all 2026 official models loaded with metadata", () => {
    expect(GEMINI_2026_MODELS.length).toBeGreaterThanOrEqual(6);
    const flashLite = getGeminiModelById("gemini-3.5-flash-lite");
    expect(flashLite).toBeDefined();
    expect(flashLite?.isFree).toBe(true);
    expect(flashLite?.promptPricePerM).toBe(0.075);
    expect(flashLite?.completionPricePerM).toBe(0.30);
  });

  it("should calculate thinking budget according to reasoning mode", () => {
    const flash = getGeminiModelById("gemini-3.6-flash");
    expect(flash).toBeDefined();
    expect(getThinkingBudgetForMode("gemini-3.6-flash", "off")).toBe(0);
    expect(getThinkingBudgetForMode("gemini-3.6-flash", "low")).toBe(2048);
    expect(getThinkingBudgetForMode("gemini-3.6-flash", "medium")).toBe(8192);
  });

  it("should calculate exact dollar cost for Gemini models", () => {
    // 1M input ($0.15) + 1M output ($0.60) = $0.75
    const cost = calculateGeminiCost("gemini-3.6-flash", 1_000_000, 1_000_000, 0);
    expect(cost).toBe(0.75);

    // 10,000 input tokens + 2,000 output tokens for Flash-Lite
    // inCost = (10,000 / 1M) * 0.075 = 0.00075
    // outCost = (2,000 / 1M) * 0.30 = 0.0006
    // total = 0.00135
    const liteCost = calculateGeminiCost("gemini-3.5-flash-lite", 10_000, 2_000, 0);
    expect(liteCost).toBeCloseTo(0.00135, 4);
  });
});

describe("AI Consumption Tracker & Ledger", () => {
  it("should record Gemini free and paid consumption and generate summary", async () => {
    await appendAiConsumptionLog({
      provider: "gemini",
      lane: "free",
      agentRole: "sales",
      modelId: "gemini-3.5-flash-lite",
      reasoningMode: "off",
      promptTokens: 500,
      completionTokens: 250,
      thinkingTokens: 0,
      totalTokens: 750,
      costUsd: 0,
      durationMs: 320,
      status: "success",
    });

    await appendAiConsumptionLog({
      provider: "gemini",
      lane: "paid",
      agentRole: "supervisor",
      modelId: "gemini-3.1-pro-preview",
      reasoningMode: "high",
      promptTokens: 2000,
      completionTokens: 1000,
      thinkingTokens: 500,
      totalTokens: 3500,
      costUsd: 0.01,
      durationMs: 1450,
      status: "success",
    });

    const summary = await getAiAnalyticsSummary(10);
    expect(summary.gemini.freeRequestsToday).toBeGreaterThanOrEqual(1);
    expect(summary.gemini.maxFreeDaily).toBe(1500);
    expect(summary.recentLogs.length).toBeGreaterThanOrEqual(2);
    expect(summary.recentLogs[0].provider).toBe("gemini");
  });
});
