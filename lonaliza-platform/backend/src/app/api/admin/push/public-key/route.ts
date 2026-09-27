import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { ensureVapidKeys } from "@/lib/server/vapid";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const vapid = await ensureVapidKeys();
  return NextResponse.json({ ok: true, publicKey: vapid.publicKey });
}
