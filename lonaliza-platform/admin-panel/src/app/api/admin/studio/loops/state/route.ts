import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getSessionLoopSnapshot, setSessionLoopSnapshot } from "@/lib/studio/automation/loops-store.server";
import type { BlueprintLoop } from "@/lib/studio/automation/blueprint-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseLoop(body: Record<string, unknown> | null): BlueprintLoop | null {
  if (!body || typeof body.loop !== "object" || body.loop === null) return null;
  const loop = body.loop as BlueprintLoop;
  if (typeof loop.id !== "string" || !Array.isArray(loop.nodes) || !Array.isArray(loop.connections)) return null;
  return loop;
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const sessionId = req.nextUrl.searchParams.get("sessionId")?.trim().slice(0, 80) || "studio";
  const loop = getSessionLoopSnapshot(sessionId);
  if (!loop) return NextResponse.json({ ok: false, error: "no_snapshot" }, { status: 404 });
  return NextResponse.json({ ok: true, sessionId, loop });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const loop = parseLoop(body);
  if (!loop) return NextResponse.json({ ok: false, error: "loop_required" }, { status: 400 });
  const sessionId = String(body?.sessionId ?? "studio").slice(0, 80);
  setSessionLoopSnapshot(sessionId, loop);
  return NextResponse.json({ ok: true, sessionId, loopId: loop.id });
}
