import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  removeAdminPushSubscription,
  saveAdminPushSubscription,
} from "@/lib/server/admin-push";
import { ensureVapidKeys } from "@/lib/server/vapid";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  await ensureVapidKeys();
  const saved = await saveAdminPushSubscription(body);
  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "Invalid subscription" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let endpoint = "";
  try {
    const body = (await req.json()) as { endpoint?: string };
    endpoint = String(body.endpoint || "").trim();
  } catch {
    endpoint = "";
  }
  await removeAdminPushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
