import { NextResponse } from "next/server";
import {
  DEFAULT_AGENTS,
  getSwarmDiscussions,
  getPendingDecisions,
  getAdminDirectives,
} from "@/lib/automation/agent-collab-store";

export const runtime = "nodejs";

export async function GET() {
  const discussions = getSwarmDiscussions();
  const decisions = getPendingDecisions();
  const directives = getAdminDirectives();

  return NextResponse.json({
    ok: true,
    agents: DEFAULT_AGENTS,
    discussions,
    decisions,
    directives,
    isPreview: true,
  });
}
