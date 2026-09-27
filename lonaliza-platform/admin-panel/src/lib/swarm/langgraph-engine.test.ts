import { describe, expect, it } from "vitest";
import { executeLangGraphDeliberation } from "./langgraph-engine";

describe("LangGraph Swarm Deliberation Engine", () => {
  it("executes a complete multi-agent deliberation cycle end-to-end", async () => {
    const result = await executeLangGraphDeliberation(
      "تجهيز باقة سفر عائلية إلى طرابزون لعطلة نهاية الأسبوع",
      "director_hud"
    );

    expect(result).toBeDefined();
    expect(result.supervisorPlan).toBeDefined();
    expect(result.supervisorPlan?.assignedAgents.length).toBeGreaterThan(0);
    expect(Object.keys(result.agentProposals).length).toBeGreaterThan(0);
    expect(result.critiques.length).toBeGreaterThan(0);
    expect(result.consensus).toBeDefined();
    expect(result.consensus?.consensusPercentage).toBeGreaterThanOrEqual(0);
    expect(result.finalSynthesis).toBeDefined();
    expect(result.terminalLogs.length).toBeGreaterThan(0);

    console.log("=== LIVE DELIBERATION TEST OUTPUT ===");
    console.log("Goal:", result.supervisorPlan?.goal);
    console.log("Tactical Intent:", result.supervisorPlan?.tacticalIntentAr);
    console.log("Assigned Agents:", result.supervisorPlan?.assignedAgents);
    console.log("Participating Proposals:", Object.keys(result.agentProposals));
    console.log("Consensus Percentage:", result.consensus?.consensusPercentage, "%");
    console.log("Adversarial Critic Risk:", result.critiques[0]?.riskLevel);
    console.log("Final Decision Title:", result.finalSynthesis?.titleAr);
    console.log("Final Executive Summary:", result.finalSynthesis?.executiveSummaryAr);
    console.log("Total Terminal Logs Emitted:", result.terminalLogs.length);
  }, 120000);
});
