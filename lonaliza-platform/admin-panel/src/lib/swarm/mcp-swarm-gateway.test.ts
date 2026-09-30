import { describe, expect, it } from "vitest";
import { listAvailableMcpSwarmTools, executeMcpSwarmCall } from "./mcp-swarm-gateway";

describe("Sovereign Platform-Wide MCP Swarm Gateway", () => {
  it("exposes tools covering Admin, Storefront, Reseller, and Visual Editor domains", () => {
    const tools = listAvailableMcpSwarmTools();
    expect(tools.length).toBeGreaterThanOrEqual(18);
    const domains = new Set(tools.map((t) => t.domain));
    for (const d of ["admin", "storefront", "reseller", "visual_editor"] as const) expect(domains.has(d)).toBe(true);
  });

  it("reports tools without a real backing system as unwired instead of fabricating success", async () => {
    for (const name of [
      "mcp_admin_update_currency_rates",
      "mcp_storefront_update_seo_metadata",
      "mcp_storefront_manage_translations",
      "mcp_storefront_publish_blog_article",
      "mcp_reseller_set_pricing_margin",
      "mcp_reseller_inspect_api_health",
      "mcp_reseller_provision_whitelabel",
    ]) {
      const res = await executeMcpSwarmCall(name, { domain: "x.example.com" });
      expect(res.ok, name).toBe(false);
      expect(res.error, name).toBe("unwired");
      expect(res.data, name).toEqual({});
    }
  });

  it("never returns hardcoded ledger or agency figures", async () => {
    const ledger = await executeMcpSwarmCall("mcp_admin_get_financial_ledger");
    expect(ledger.data.netProfitUsd).toBeUndefined();
    expect(ledger.data.paymentGateways).toBeUndefined();
    const agencies = await executeMcpSwarmCall("mcp_reseller_list_agencies");
    expect(agencies.data.activeAgenciesCount).toBeUndefined();
    expect(agencies.data.totalCreditUsd).toBeUndefined();
  });

  it("reads visual editor state without mutating it", async () => {
    const schema = await executeMcpSwarmCall("mcp_visual_get_schema");
    expect(schema.ok).toBe(true);
    expect(schema.data.layout).toBeDefined();
    const sections = await executeMcpSwarmCall("mcp_visual_read_sections");
    expect(sections.ok).toBe(true);
    expect(Array.isArray(sections.data.sections)).toBe(true);
  });
});
