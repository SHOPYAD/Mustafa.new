import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { testCommsConnection, type CommsTestChannel } from "@/lib/automation/comms-test";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isChannel(value: unknown): value is CommsTestChannel {
  return value === "whatsapp" || value === "telegram";
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isChannel(body.channel)) {
    return NextResponse.json({ ok: false, error: "channel = whatsapp | telegram" }, { status: 400 });
  }
  const result = await testCommsConnection(body.channel);
  return NextResponse.json({ ok: result.ok, result });
}
