import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { pingAutomationRedis } from "@/lib/server/automation/redis";
import { getAutomationSettings, saveAutomationSettings } from "@/lib/server/automation/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [settings, redis] = await Promise.all([getAutomationSettings(), pingAutomationRedis()]);
  return NextResponse.json({ ok: true, settings, redis: { ok: redis.ok, host: redis.host, port: redis.port } });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const settings = await saveAutomationSettings({
      timezone: typeof body.timezone === "string" ? body.timezone : undefined,
      publishWindowStart: typeof body.publishWindowStart === "string" ? body.publishWindowStart : undefined,
      publishWindowEnd: typeof body.publishWindowEnd === "string" ? body.publishWindowEnd : undefined,
      defaultMaxPerRun: typeof body.defaultMaxPerRun === "number" ? body.defaultMaxPerRun : undefined,
      defaultMaxPerDay: typeof body.defaultMaxPerDay === "number" ? body.defaultMaxPerDay : undefined,
      defaultDryRun: typeof body.defaultDryRun === "boolean" ? body.defaultDryRun : undefined,
      workerEnabled: typeof body.workerEnabled === "boolean" ? body.workerEnabled : undefined,
    });
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "تعذّر الحفظ" },
      { status: 400 }
    );
  }
}
