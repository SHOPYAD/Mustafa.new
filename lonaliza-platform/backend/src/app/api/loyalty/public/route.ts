import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { readRequestCookie } from "@/lib/http/cookies";
import { getLoyaltySettings } from "@/lib/loyalty/store";
import { listPublicCoupons } from "@/lib/loyalty/server";
import {
  isLoyaltyService,
  LOYALTY_COUPON_COOKIE,
  type LoyaltyService,
} from "@/lib/loyalty/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const serviceRaw = url.searchParams.get("service") || "all";
  const locale = url.searchParams.get("locale") || "ar";
  const service: LoyaltyService = isLoyaltyService(serviceRaw) ? serviceRaw : "all";
  const [settings, coupons] = await Promise.all([
    getLoyaltySettings(),
    listPublicCoupons(service, locale),
  ]);
  const user = await getRequestCustomer(req);
  const applied = readRequestCookie(req, LOYALTY_COUPON_COOKIE) || "";
  return NextResponse.json({
    ok: true,
    settings: {
      enabled: settings.enabled,
      pointsPerUsd: settings.pointsPerUsd,
      pointsPerUsdByService: settings.pointsPerUsdByService,
      pointsPerUsdRedeem: settings.pointsPerUsdRedeem,
    },
    coupons,
    appliedCode: applied,
    loggedIn: Boolean(user),
  });
}
