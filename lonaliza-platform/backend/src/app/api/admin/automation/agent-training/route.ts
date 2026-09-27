import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { isOrigin } from "@/lib/server/deployment-role";
import {
  loadAgentTrainingState,
  saveB2BTrainingConfig,
  saveB2CTrainingConfig,
  type B2BTrainingConfig,
  type B2CTrainingConfig,
} from "@/lib/automation/agent-training-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  try {
    const state = loadAgentTrainingState();
    return NextResponse.json({
      ok: true,
      state,
      isMaster: isOrigin(),
    });
  } catch (err) {
    console.error("[api/admin/automation/agent-training] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load agent training state" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      b2b?: Partial<B2BTrainingConfig>;
      b2c?: Partial<B2CTrainingConfig>;
    };

    if (body.b2b) {
      if (!isOrigin()) {
        return NextResponse.json(
          { ok: false, error: "B2B platform training settings are available on the Super Admin master only." },
          { status: 403 }
        );
      }
      saveB2BTrainingConfig(body.b2b);
    }

    if (body.b2c) {
      saveB2CTrainingConfig(body.b2c);
    }

    const updated = loadAgentTrainingState();
    return NextResponse.json({
      ok: true,
      state: updated,
      isMaster: isOrigin(),
    });
  } catch (err) {
    console.error("[api/admin/automation/agent-training] PUT error:", err);
    return NextResponse.json({ ok: false, error: "Failed to save agent training state" }, { status: 500 });
  }
}
