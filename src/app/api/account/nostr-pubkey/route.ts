import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getBuddy, registerBuddyPubkey } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || user.id;
  const profile = await getBuddy(userId);
  return NextResponse.json({ ok: true, nostrPubkey: profile?.nostrPubkey || "" });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const pubkey = String(body.nostrPubkey || body.pubkey || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(pubkey)) {
    return NextResponse.json({ ok: false, error: "invalid_pubkey" }, { status: 400 });
  }
  const profile = await registerBuddyPubkey(
    user.id,
    pubkey,
    String(body.name || user.name || ""),
    body.avatarUrl ? String(body.avatarUrl) : undefined,
  );
  return NextResponse.json({ ok: true, nostrPubkey: profile.nostrPubkey });
}
