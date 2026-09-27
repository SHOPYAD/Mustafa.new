import { NextResponse } from "next/server";
import {
  getSwarmDiscussions,
  getPendingDecisions,
  getAdminDirectives,
} from "@/lib/automation/agent-collab-store";
import { assembleWarRoomAgents, collectPlatformGroundedSnapshot, listRegisteredAgents, warRoomToolCatalog } from "@/lib/swarm";

export const runtime = "nodejs";

export async function GET() {
  const [agents, platform] = await Promise.all([assembleWarRoomAgents(), collectPlatformGroundedSnapshot()]);
  return NextResponse.json({
    ok: true,
    agents,
    registry: listRegisteredAgents(true),
    platform,
    toolCatalog: warRoomToolCatalog(),
    discussions: getSwarmDiscussions(),
    decisions: getPendingDecisions(),
    directives: getAdminDirectives(),
    isPreview: true,
  });
}
