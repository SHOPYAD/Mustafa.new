import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { CAPABILITIES } from "@/lib/studio/capabilities/registry";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    capabilities: CAPABILITIES.map(({ id, domainId, nodeId, kind, risk, target, titleAr, evidence }) => ({ id, domainId, nodeId, kind, risk, target, titleAr, evidence })),
  });
}
