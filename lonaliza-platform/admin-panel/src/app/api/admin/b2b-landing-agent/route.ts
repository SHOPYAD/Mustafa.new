import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getB2BLandingAgentConfig,
  saveB2BLandingAgentConfig,
  getB2BChatSessions,
  type B2BLandingAgentConfig,
} from "@/lib/automation/b2b-landing-agent-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const config = getB2BLandingAgentConfig();
  const sessions = getB2BChatSessions();

  return NextResponse.json({
    ok: true,
    config,
    sessions,
  });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const body = (await req.json()) as Partial<B2BLandingAgentConfig>;
  const updated = saveB2BLandingAgentConfig(body);

  return NextResponse.json({
    ok: true,
    config: updated,
  });
}
