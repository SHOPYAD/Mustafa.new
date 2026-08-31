import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  listAdminNotifications,
  markAdminNotificationsRead,
} from "@/lib/admin-notifications/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const limitRaw = Number(url.searchParams.get("limit") || 40);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(40, Math.max(1, Math.round(limitRaw)))
    : 40;
  const { items, unread } = await listAdminNotifications(limit);
  return NextResponse.json({ ok: true, items, unread });
}

export async function PATCH(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.map((id) => String(id))
    : [];
  const all = Boolean(body.all);
  const marked = await markAdminNotificationsRead({ ids, all });
  const { items, unread } = await listAdminNotifications(40);
  return NextResponse.json({ ok: true, marked, items, unread });
}
