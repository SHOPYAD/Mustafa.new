import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listAllGifts, purchaseGift, voidGift } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, cards: await listAllGifts() });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.action === "void" && body.id) {
    const card = await voidGift(String(body.id));
    if (!card) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, card });
  }
  const card = await purchaseGift({
    purchaserId: String(body.purchaserId || "admin"),
    amount: Number(body.amount || 50),
    currency: "USD",
    recipientEmail: body.recipientEmail ? String(body.recipientEmail) : undefined,
  });
  return NextResponse.json({ ok: true, card });
}
