import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  createInboxThread,
  getBuddy,
  getOrCreatePeerThread,
  listInboxSummaries,
} from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const threads = await listInboxSummaries(user.id);
  return NextResponse.json({ ok: true, threads });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const peerUserId = String(body.peerUserId || "").trim();

  if (peerUserId && peerUserId !== user.id) {
    const peer = await getBuddy(peerUserId);
    const thread = await getOrCreatePeerThread({
      fromUserId: user.id,
      toUserId: peerUserId,
      title: String(body.title || peer?.name || "رفيق سفر"),
      peerName: String(body.peerName || peer?.name || ""),
      peerAvatar: String(body.peerAvatar || peer?.avatarUrl || ""),
      peerNostrPubkey: String(body.peerNostrPubkey || peer?.nostrPubkey || ""),
    });
    return NextResponse.json({ ok: true, thread: { id: thread.id } });
  }

  const text = String(body.text || body.cipher || "").trim();
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
    encrypted: Boolean(body.encrypted),
    cipherVersion: body.encrypted ? "nip44-v2" : undefined,
    preview: body.preview ? String(body.preview) : undefined,
  });
  return NextResponse.json({ ok: true, thread });
}
