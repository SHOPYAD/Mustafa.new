import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { createInboxThread, listInbox } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const threads = await listInbox(user.id);
  return NextResponse.json({ ok: true, threads });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = String(body.text || "").trim();
  if (!text) return NextResponse.json({ ok: false, error: "text_required" }, { status: 400 });
  const type = (["support", "booking", "buddy", "system"].includes(String(body.type))
    ? String(body.type)
    : "support") as "support" | "booking" | "buddy" | "system";
  const thread = await createInboxThread({
    userId: user.id,
    type,
    title: String(body.title || "رسالة دعم"),
    text,
    bookingId: body.bookingId ? String(body.bookingId) : undefined,
  });
  return NextResponse.json({ ok: true, thread });
}
