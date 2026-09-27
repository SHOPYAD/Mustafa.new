import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listGifts, purchaseGift } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  return NextResponse.json({ ok: true, cards: await listGifts(user.id) });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const amount = Number(body.amount || 0);
  if (!amount || amount < 10) {
    return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
  }
  const card = await purchaseGift({
    purchaserId: user.id,
    amount,
    currency: body.currency ? String(body.currency) : "USD",
    recipientEmail: body.recipientEmail ? String(body.recipientEmail) : undefined,
  });
  return NextResponse.json({ ok: true, card });
}
