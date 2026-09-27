import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getBuddy } from "@/lib/server/lonaliza-social-commerce";
import {
  getInboxThread,
  markThreadRead,
  replyInbox,
  summarizeThread,
} from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

function publicThread(thread: NonNullable<Awaited<ReturnType<typeof getInboxThread>>>, viewerId: string) {
  const summary = summarizeThread(thread, viewerId);
  return {
    ...summary,
    participantIds: thread.participantIds || [thread.userId, thread.peerUserId].filter(Boolean),
    messages: thread.messages.map((m) => ({
      id: m.id,
      from: m.from,
      fromUserId: m.fromUserId || (m.from === "customer" ? thread.userId : thread.peerUserId),
      text: m.text,
      encrypted: Boolean(m.encrypted),
      cipherVersion: m.cipherVersion,
      preview: m.preview || "",
      media: m.media,
      nostrEventId: m.nostrEventId,
      createdAt: m.createdAt,
      mine: (m.fromUserId || (m.from === "customer" ? thread.userId : "")) === viewerId,
    })),
  };
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const { id } = await ctx.params;
  await markThreadRead(id, user.id);
  const thread = await getInboxThread(id, user.id);
  if (!thread) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const peerId = summarizeThread(thread, user.id).peerUserId;
  const peer = peerId ? await getBuddy(peerId) : null;
  return NextResponse.json({
    ok: true,
    thread: {
      ...publicThread(thread, user.id),
      peerNostrPubkey: peer?.nostrPubkey || "",
      peerName: thread.peerName || peer?.name || thread.title,
      peerAvatar: thread.peerAvatar || peer?.avatarUrl || "",
    },
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const text = String(body.cipher || body.text || "").trim();
  if (!text && !body.media) return NextResponse.json({ ok: false, error: "text_required" }, { status: 400 });
  const media = body.media && typeof body.media === "object" ? (body.media as Record<string, unknown>) : null;
  const thread = await replyInbox(id, user.id, text || "voice", body.from === "peer" ? "peer" : "customer", {
    encrypted: body.encrypted !== false,
    cipherVersion: "nip44-v2",
    preview: String(body.preview || (media ? "رسالة صوتية" : "رسالة مشفرة")),
    nostrEventId: body.nostrEventId ? String(body.nostrEventId) : undefined,
    giftWrapId: body.giftWrapId ? String(body.giftWrapId) : undefined,
    media: media
      ? {
          kind: "voice",
          url: String(media.url || ""),
          mime: String(media.mime || "application/octet-stream"),
          durationMs: Number(media.durationMs || 0),
          size: Number(media.size || 0),
          wrappedKey: String(media.wrappedKey || ""),
        }
      : undefined,
  });
  if (!thread) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, thread: publicThread(thread, user.id) });
}
