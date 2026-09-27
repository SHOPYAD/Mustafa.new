import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { executeSwarmTool } from "@/lib/swarm/agent-tools";
import { STUDIO_DOMAINS } from "@/lib/neural-studio/catalog";
import { isReadCapability } from "@/lib/neural-studio/read-capabilities";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;
  const domain = STUDIO_DOMAINS.find(d => d.id === new URL(request.url).searchParams.get("domain"));
  if (!domain) return NextResponse.json({ ok: false, code: "UNKNOWN_DOMAIN" }, { status: 400 });
  const observations = await Promise.all(domain.tools.map(async tool => {
    if (!isReadCapability(tool)) return { tool, status: "unavailable", facts: [] };
    const start = performance.now();
    try {
      const result = await executeSwarmTool(tool, {});
      return {
        tool, status: result.ok ? "ready" : "unavailable",
        // Tool duration is not mislabeled as provider latency or system RPS.
        readDurationMs: Math.round(performance.now() - start),
        observedAt: new Date().toISOString(),
        facts: result.ok ? result.facts : [],
      };
    } catch { return { tool, status: "unavailable", facts: [] }; }
  }));
  const ready = observations.filter(o => o.status === "ready").length;
  return NextResponse.json({
    ok: true, domainId: domain.id, observations, observedAt: new Date().toISOString(),
    status: !observations.length ? "not_connected" : ready === observations.length ? "ready" : ready ? "partial" : "unavailable",
    connectionMeaning: "Read adapters only; no authority to mutate is implied.",
  }, { headers: { "Cache-Control": "no-store" } });
}
