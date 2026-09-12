import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { createBuddyRequest, decideBuddyRequest } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.id && (body.status === "accepted" || body.status === "declined")) {
    const row = await decideBuddyRequest(String(body.id), user.id, body.status);
    if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, request: row });
  }
  const toUserId = String(body.toUserId || "").trim();
  if (!toUserId || toUserId === user.id) {
    return NextResponse.json({ ok: false, error: "invalid_target" }, { status: 400 });
  }
  const request = await createBuddyRequest(user.id, toUserId);
  return NextResponse.json({ ok: true, request });
}
