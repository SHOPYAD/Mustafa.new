import { NextRequest, NextResponse } from "next/server";
import {
  getAffiliateSettings,
  getOrCreateAffiliateProfile,
  getWalletSummary,
  shareLinksForCode,
} from "@/lib/affiliate/server";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const settings = await getAffiliateSettings();
  if (!settings.enabled) {
    return NextResponse.json({ ok: true, enabled: false });
  }

  const profile = await getOrCreateAffiliateProfile(auth.customer.id, auth.customer.name);
  const wallet = await getWalletSummary(auth.customer.id);
  return NextResponse.json({
    ok: true,
    enabled: true,
    profile: { code: profile.code, status: profile.status },
    links: shareLinksForCode(profile.code),
    wallet,
  });
}
