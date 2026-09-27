import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { redeemGift } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const card = await redeemGift(String(body.code || ""), user.id);
  if (!card) return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
  return NextResponse.json({ ok: true, card });
}
