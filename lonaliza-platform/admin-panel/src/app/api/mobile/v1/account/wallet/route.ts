import { NextRequest, NextResponse } from "next/server";
import { getLoyaltySettings } from "@/lib/loyalty/store";
import { getWalletForUser, walletSummary } from "@/lib/loyalty/server";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;
  const [wallet, settings] = await Promise.all([
    getWalletForUser(auth.customer.id),
    getLoyaltySettings(),
  ]);
  return NextResponse.json({ ok: true, ...walletSummary(wallet, settings) });
}
