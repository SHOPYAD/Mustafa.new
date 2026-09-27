import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { applyCouponToSession } from "@/lib/loyalty/server";
import { isLoyaltyService, LOYALTY_COUPON_COOKIE } from "@/lib/loyalty/types";

export const runtime = "nodejs";

function couponCookie(code: string): string {
  const maxAge = 60 * 60 * 24 * 14;
  if (!code) {
    return `${LOYALTY_COUPON_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
  }
  return `${LOYALTY_COUPON_COOKIE}=${encodeURIComponent(code)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const clear = Boolean(body.clear);
  if (clear) {
    const res = NextResponse.json({ ok: true, applied: "" });
    res.headers.set("Set-Cookie", couponCookie(""));
    return res;
  }

  const service = isLoyaltyService(body.service) ? body.service : "all";
  const user = await getRequestCustomer(req);
  const result = await applyCouponToSession(String(body.code || ""), service, user?.id);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, coupon: result.coupon, applied: result.coupon.code });
  res.headers.set("Set-Cookie", couponCookie(result.coupon.code));
  return res;
}
