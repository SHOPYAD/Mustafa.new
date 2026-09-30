import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { getRegisteredAgent, upsertRegisteredAgent } from "@/lib/swarm/agent-registry";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const concierge = getRegisteredAgent("app_concierge");
    const notifications = getRegisteredAgent("app_notifications");

    return NextResponse.json({
      ok: true,
      agents: {
        app_concierge: concierge,
        app_notifications: notifications,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { agentId, systemPrompt, missionAr, enabled } = body;

    if (!agentId) {
      return NextResponse.json({ ok: false, error: "Missing agentId" }, { status: 400 });
    }

    const current = getRegisteredAgent(agentId);
    if (!current) {
      return NextResponse.json({ ok: false, error: "Agent not found" }, { status: 404 });
    }

    const updated = upsertRegisteredAgent({
      ...current,
      systemPrompt: systemPrompt !== undefined ? systemPrompt : current.systemPrompt,
      missionAr: missionAr !== undefined ? missionAr : current.missionAr,
      enabled: enabled !== undefined ? enabled : current.enabled,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, agent: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
