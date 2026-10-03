import { describe, expect, it, vi } from "vitest";
import {
  checkPythonBrainHealth,
  deliberateWithPythonBrain,
  addBrainMemory,
  searchBrainMemory,
  callBrainMcpTool,
  optimizeBrain,
} from "../python-brain-client";

describe("Python Brain IPC Client Bridge", () => {
  it("generates resilient local fallback when python brain is starting or offline", async () => {
    // Deliberate with offline query
    const res = await deliberateWithPythonBrain("شوف لي فندق كشخة في تقسيم خمس نجوم");
    expect(res.ok).toBe(true);
    expect(res.deliberation).toBeDefined();
    expect(res.deliberation.intent.primary_cluster).toBe("hotels.search");
    expect(res.deliberation.intent.dialect).toBe("saudi_gulf");
    expect(res.deliberation.intent.entities.hotel_stars).toBe(5);
    expect(res.deliberation.intent.entities.is_vip).toBe(true);
    expect(res.deliberation.target_platform_nodes.length).toBeGreaterThan(0);
  });

  it("handles Levantine transfer dialect in fallback mode", async () => {
    const res = await deliberateWithPythonBrain("بدنا سيارة فيتو مع شوفير لبورصة");
    expect(res.ok).toBe(true);
    expect(res.deliberation.intent.primary_cluster).toBe("transfers.private");
    expect(res.deliberation.intent.dialect).toBe("levantine");
    expect(res.deliberation.intent.entities.vehicle_type).toBe("mercedes_vito");
    expect(res.deliberation.intent.entities.destinations).toContain("bursa");
  });

  it("handles Egyptian flight booking dialect in fallback mode", async () => {
    const res = await deliberateWithPythonBrain("عاوز احجز طيارة لاسطنبول");
    expect(res.ok).toBe(true);
    expect(res.deliberation.intent.primary_cluster).toBe("flights.search");
    expect(res.deliberation.intent.dialect).toBe("egyptian");
    expect(res.deliberation.intent.entities.destinations).toContain("istanbul");
  });

  it("safely handles memory and mcp operations with graceful fallback", async () => {
    const memRes = await addBrainMemory("user_test", "LikesTaksim", "semantic");
    expect(memRes).toBeDefined();

    const searchRes = await searchBrainMemory("Taksim", "user_test");
    expect(searchRes).toBeDefined();
    expect(Array.isArray(searchRes.results)).toBe(true);

    const mcpRes = await callBrainMcpTool("health_check");
    expect(mcpRes).toBeDefined();

    const optRes = await optimizeBrain("test", {}, "rule");
    expect(optRes).toBeDefined();
  });
});
