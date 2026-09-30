#!/usr/bin/env node
/** يولّد allowlist أدوات MCP من catalog في mcp-swarm-gateway.ts (بدون bundle ثقيل). */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const gatewayPath = path.join(ROOT, "src/lib/swarm/mcp-swarm-gateway.ts");
const src = fs.readFileSync(gatewayPath, "utf8");
const tools = [];
const block = src.match(/export function listAvailableMcpSwarmTools[\s\S]*?return \[([\s\S]*?)\n  \];/);
if (block) {
  const itemRe = /\{\s*name:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]*)"[\s\S]*?domain:\s*"([^"]+)"/g;
  let m;
  while ((m = itemRe.exec(block[1]))) tools.push({ name: m[1], description: m[2], domain: m[3] });
}
if (!tools.length) {
  console.error("gen-mcp-capabilities: no tools parsed from gateway");
  process.exit(1);
}
const names = tools.map((t) => t.name).sort();

const dest = path.join(ROOT, "src/lib/studio/capabilities/mcp-capabilities.generated.ts");
const body = `/** AUTO-GENERATED — node scripts/gen-mcp-capabilities.cjs */
export const MCP_TOOL_ALLOWLIST: ReadonlySet<string> = new Set(${JSON.stringify(names)});

export const MCP_TOOL_CATALOG: { name: string; description: string; domain: string }[] = ${JSON.stringify(
  tools.map((t) => ({ name: t.name, description: t.description, domain: t.domain })),
  null,
  2
)};

export const MCP_CAPABILITIES_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};
`;
fs.writeFileSync(dest, body);
console.log(`mcp capabilities: ${names.length} tools → ${path.relative(ROOT, dest)}`);
