import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { boardAgents, listTasks } from "@/lib/studio/agents/task-board.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, agents: boardAgents(), tasks: listTasks() });
}
