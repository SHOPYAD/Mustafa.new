import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listInbox, replyInbox } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const { id } = await ctx.params;
  const thread = (await listInbox(user.id)).find((t) => t.id === id);
  if (!thread) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, thread });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = String(body.text || "").trim();
  if (!text) return NextResponse.json({ ok: false, error: "text_required" }, { status: 400 });
  const thread = await replyInbox(id, user.id, text, "customer");
  if (!thread) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, thread });
}
