import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { readRequestCookie } from "@/lib/http/cookies";
import { quoteLoyalty } from "@/lib/loyalty/server";
import { isLoyaltyService, LOYALTY_COUPON_COOKIE } from "@/lib/loyalty/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const user = await getRequestCustomer(req);
  const service = isLoyaltyService(body.service) ? body.service : "all";
  const couponCode =
    String(body.couponCode || "").trim() || readRequestCookie(req, LOYALTY_COUPON_COOKIE) || "";
  const voucherIds = Array.isArray(body.voucherIds)
    ? body.voucherIds.map((id) => String(id)).filter(Boolean)
    : [];
  const quote = await quoteLoyalty({
    amount: Number(body.amount) || 0,
    currency: String(body.currency || "USD"),
    service,
    userId: user?.id,
    couponCode,
    voucherIds,
  });
  return NextResponse.json({ ok: true, quote, loggedIn: Boolean(user) });
}
