import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { executeBlueprint } from "@/lib/studio/automation/blueprint-runner.server";
import type { BlueprintExecuteOptions, BlueprintLoop } from "@/lib/studio/automation/blueprint-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseLoop(body: Record<string, unknown> | null): BlueprintLoop | null {
  if (!body || typeof body.loop !== "object" || body.loop === null) return null;
  const loop = body.loop as BlueprintLoop;
  if (typeof loop.id !== "string" || !Array.isArray(loop.nodes)) return null;
  return loop;
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const loop = parseLoop(body);
  if (!loop) {
    return NextResponse.json({ ok: false, error: "loop_required" }, { status: 400 });
  }

  const options: BlueprintExecuteOptions = {
    loop,
    dryRun: body?.dryRun !== false,
    nodeId: typeof body?.nodeId === "string" ? body.nodeId : undefined,
    source:
      body?.source === "voice" || body?.source === "agent" || body?.source === "manual"
        ? body.source
        : "manual",
  };

  const result = await executeBlueprint(options);
  const status = result.blockedCredentials ? 428 : result.ok ? 200 : 422;
  return NextResponse.json(result, { status });
}
