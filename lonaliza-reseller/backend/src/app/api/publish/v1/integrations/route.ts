import { NextRequest, NextResponse } from "next/server";
import { listPublicIntegrations } from "@/lib/publish/public-api";
import { assertPublishPublicApi } from "@/lib/publish/public-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  const { integrations, store } = await listPublicIntegrations();
  return NextResponse.json({ ok: true, integrations, store });
}
