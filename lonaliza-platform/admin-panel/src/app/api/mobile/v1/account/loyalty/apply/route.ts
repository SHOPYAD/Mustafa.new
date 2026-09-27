import { NextRequest, NextResponse } from "next/server";
import { applyCouponToSession } from "@/lib/loyalty/server";
import { isLoyaltyService } from "@/lib/loyalty/types";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const rawService = String(body.service || "all");
  const service = isLoyaltyService(rawService) ? rawService : "all";
  const result = await applyCouponToSession(String(body.code || ""), service, auth.customer.id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, coupon: result.coupon, applied: result.coupon.code });
}
