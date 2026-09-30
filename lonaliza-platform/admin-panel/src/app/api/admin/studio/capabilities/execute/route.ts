import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { executeCapability } from "@/lib/studio/capabilities/executor.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.capabilityId !== "string") return NextResponse.json({ ok: false, error: "capabilityId_required" }, { status: 400 });
  const result = await executeCapability({
    capabilityId: body.capabilityId,
    input: (body.input as Record<string, unknown>) ?? {},
    dryRun: body.dryRun !== false,
    idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined,
    approvalRef: typeof body.approvalRef === "string" ? body.approvalRef : undefined,
    autoExecute: body.autoExecute === true,
    sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : undefined,
    actor: "director",
  });
  return NextResponse.json(result, { status: result.status });
}
