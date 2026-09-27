import { describe, expect, it } from "vitest";
import {
  listAvailableMcpSwarmTools,
  executeMcpSwarmCall,
} from "./mcp-swarm-gateway";

describe("Sovereign Platform-Wide MCP Swarm Gateway", () => {
  it("exposes tools covering Admin, Storefront, Reseller, and Visual Editor domains", () => {
    const tools = listAvailableMcpSwarmTools();
    expect(tools.length).toBeGreaterThanOrEqual(18);

    const domains = new Set(tools.map((t) => t.domain));
    expect(domains.has("admin")).toBe(true);
    expect(domains.has("storefront")).toBe(true);
    expect(domains.has("reseller")).toBe(true);
    expect(domains.has("visual_editor")).toBe(true);
  });

  it("executes Admin Core tools (financial ledger, currency rates)", async () => {
    const ledger = await executeMcpSwarmCall("mcp_admin_get_financial_ledger");
    expect(ledger.ok).toBe(true);
    expect(ledger.data.netProfitUsd).toBeDefined();

    const fx = await executeMcpSwarmCall("mcp_admin_update_currency_rates", {
      markupPercent: 2.0,
    });
    expect(fx.ok).toBe(true);
    expect(fx.data.rates).toBeDefined();
  });

  it("executes Storefront Core tools (page layout, SEO metadata)", async () => {
    const layout = await executeMcpSwarmCall("mcp_storefront_get_page_layout", {
      pageSlug: "home",
    });
    expect(layout.ok).toBe(true);
    expect(layout.data.sectionCount).toBeDefined();

    const seo = await executeMcpSwarmCall("mcp_storefront_update_seo_metadata", {
      pageSlug: "vip-tours",
      titleAr: "باقات رحلات VIP طرابزون وإسطنبول الفاخرة",
    });
    expect(seo.ok).toBe(true);
    expect(seo.data.meta).toBeDefined();
  });

  it("executes Reseller Network tools (agencies, pricing margins, API health)", async () => {
    const agencies = await executeMcpSwarmCall("mcp_reseller_list_agencies");
    expect(agencies.ok).toBe(true);
    expect(agencies.data.activeAgenciesCount).toBeGreaterThan(0);

    const health = await executeMcpSwarmCall("mcp_reseller_inspect_api_health");
    expect(health.ok).toBe(true);
    expect(health.data.endpoints).toBeDefined();
  });

  it("executes Visual Editor tools (schema, read sections, theme tokens)", async () => {
    const schema = await executeMcpSwarmCall("mcp_visual_get_schema");
    expect(schema.ok).toBe(true);
    expect(schema.data.layout).toBeDefined();

    const sections = await executeMcpSwarmCall("mcp_visual_read_sections");
    expect(sections.ok).toBe(true);
    expect(Array.isArray(sections.data.sections)).toBe(true);

    const theme = await executeMcpSwarmCall("mcp_visual_apply_theme_tokens", {
      navy: "#020817",
      emerald: "#00f0ff",
    });
    expect(theme.ok).toBe(true);
    expect(theme.data.globalTheme).toBeDefined();
  });
});
