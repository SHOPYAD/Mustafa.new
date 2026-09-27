import { describe, expect, it } from "vitest";
import {
  GITHUB_MCP_ONLY_ERROR,
  looksLikeMcpServer,
  rejectNonMcpGithub,
} from "./github-import";

describe("looksLikeMcpServer", () => {
  it("accepts official MCP package names", () => {
    expect(
      looksLikeMcpServer({
        packageName: "@modelcontextprotocol/server-fetch",
        packageJsonText: JSON.stringify({ name: "@modelcontextprotocol/server-fetch" }),
      })
    ).toBe(true);
  });

  it("accepts mcp.json even without package.json", () => {
    expect(looksLikeMcpServer({ hasMcpJson: true })).toBe(true);
  });

  it("accepts a server whose readme mentions Model Context Protocol", () => {
    expect(
      looksLikeMcpServer({
        packageName: "tourism-tools",
        readme: "This MCP server exposes tools for agents.",
      })
    ).toBe(true);
  });

  it("rejects a random Next.js app", () => {
    expect(
      rejectNonMcpGithub({
        packageName: "lonaliza-site",
        packageJsonText: JSON.stringify({
          name: "lonaliza-site",
          deps: ["next", "react"],
        }),
        description: "Travel booking website",
      })
    ).toBe(GITHUB_MCP_ONLY_ERROR);
  });

  it("rejects a monorepo with no MCP signals", () => {
    expect(
      looksLikeMcpServer({
        packageName: "agency-crm",
        packageJsonText: '{"name":"agency-crm","scripts":{"start":"node dist/index.js"}}',
        description: "Private CRM monorepo",
      })
    ).toBe(false);
  });
});
