import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { validateGraph, requiredCredentialsForLoop } from "@/lib/studio/automation/blueprint-runner.server";
import { runCredentialsPreflight } from "@/lib/studio/automation/credentials-preflight.server";
import type { BlueprintLoop } from "@/lib/studio/automation/blueprint-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseLoop(body: Record<string, unknown> | null): BlueprintLoop | null {
  if (!body || typeof body.loop !== "object" || body.loop === null) return null;
  const loop = body.loop as BlueprintLoop;
  if (typeof loop.id !== "string" || !Array.isArray(loop.nodes)) return null;
  return loop;
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    hint: "POST JSON { loop } for full blueprint preflight.",
    endpoints: {
      connections: "/api/admin/automation/connections",
      mediaKeys: "/api/admin/media/keys",
    },
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const loop = parseLoop(body);
  if (!loop) {
    return NextResponse.json({ ok: false, error: "loop_required" }, { status: 400 });
  }

  const graph = validateGraph(loop);
  const required = requiredCredentialsForLoop(loop);
  const credentials = await runCredentialsPreflight(loop);

  return NextResponse.json({
    ok: graph.ok && credentials.ready,
    status: credentials.blocked ? "blocked_credentials" : credentials.ready ? "ready" : "blocked_credentials",
    graph,
    requiredCredentials: required,
    credentials,
    saySupervisorAr: credentials.saySupervisorAr,
  });
}
