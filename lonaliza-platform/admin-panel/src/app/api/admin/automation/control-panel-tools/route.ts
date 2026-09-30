import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import {
  executeControlPanelTool,
  inspectControlPanelTools,
} from "@/lib/swarm/control-panel-tool-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const tools = await inspectControlPanelTools();
  return NextResponse.json({
    ok: true,
    count: tools.length,
    tools,
    executable: tools.filter((tool) => tool.status === "executable").length,
    probeOnly: tools.filter((tool) => tool.status === "probe-only").length,
    notWired: tools.filter((tool) => tool.status === "not-wired").length,
    missing: tools.filter((tool) => !tool.connected).map((tool) => ({ id: tool.id, tool: tool.tool, error: tool.error, status: tool.status })),
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || body.systemId || "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id or systemId" }, { status: 400 });
  }
  const result = await executeControlPanelTool(id);
  return NextResponse.json({ ok: result.ok, result });
}
