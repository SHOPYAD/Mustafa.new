import { describe, expect, it } from "vitest";
import { BUILTIN_MCP_IDS, MCP_CATALOG, getMcpCatalogEntry, isBuiltinMcpId } from "./catalog";

describe("MCP catalog", () => {
  it("includes Canva, Higgsfield, official WhatsApp Cloud, and GitHub importer", () => {
    expect(getMcpCatalogEntry("liotrip-canva")?.nameAr).toContain("Canva");
    expect(getMcpCatalogEntry("liotrip-higgsfield")?.nameAr).toContain("Higgsfield");
    expect(getMcpCatalogEntry("liotrip-whatsapp")?.legalNoteAr).toMatch(/Cloud API/);
    expect(getMcpCatalogEntry("mcp-github-import")?.source).toBe("github");
    expect(getMcpCatalogEntry("mcp-github")).toBeNull();
  });

  it("keeps useful built-ins and official sandbox tools", () => {
    const ids = MCP_CATALOG.map((item) => item.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "liotrip-blog",
        "liotrip-social",
        "liotrip-studio",
        "liotrip-ads",
        "lonaliza-publish",
        "mcp-fetch",
        "mcp-memory",
        "mcp-filesystem",
      ])
    );
  });

  it("treats new first-class cards as builtin ids", () => {
    expect(isBuiltinMcpId("liotrip-canva")).toBe(true);
    expect(isBuiltinMcpId("liotrip-higgsfield")).toBe(true);
    expect(isBuiltinMcpId("liotrip-whatsapp")).toBe(true);
    expect(isBuiltinMcpId("liotrip-computer-use")).toBe(true);
    expect(isBuiltinMcpId("liotrip-browser-use")).toBe(true);
    expect(isBuiltinMcpId("lonaliza-publish")).toBe(true);
    expect(getMcpCatalogEntry("lonaliza-publish")?.tools.map((tool) => tool.name)).toEqual([
      "publish.channels",
      "publish.posts",
      "publish.schedule",
      "publish.media_from_url",
      "publish.generate_image",
      "publish.generate_video",
    ]);
    expect(isBuiltinMcpId("mcp-github-import")).toBe(false);
    expect(BUILTIN_MCP_IDS).toHaveLength(18);
  });
});
