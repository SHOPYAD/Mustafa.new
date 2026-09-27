import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  getAffiliateSettings,
  getOrCreateAffiliateProfile,
  getWalletSummary,
  shareLinksForCode,
} from "@/lib/affiliate/server";
import type { AffiliateConversion, AffiliateVisit, AffiliateWithdrawal } from "@/lib/affiliate/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  const settings = await getAffiliateSettings();
  if (!settings.enabled) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      settings: { min_withdraw: settings.min_withdraw, cookie_days: settings.cookie_days },
    });
  }

  const profile = await getOrCreateAffiliateProfile(user.id, user.name);
  const wallet = await getWalletSummary(user.id);
  const pb = await tryCreateAdminPocketBase();
  let visits: AffiliateVisit[] = [];
  let conversions: AffiliateConversion[] = [];
  let withdrawals: AffiliateWithdrawal[] = [];
  const visitsByService: Record<string, number> = {};

  if (pb) {
    visits = await pb.collection("affiliate_visits").getFullList<AffiliateVisit>({
      filter: `code = "${profile.code}"`,
      sort: "-id",
    });
    conversions = await pb
      .collection("affiliate_conversions")
      .getFullList<AffiliateConversion>({
        filter: `user = "${user.id}"`,
        sort: "-id",
      });
    withdrawals = await pb
      .collection("affiliate_withdrawals")
      .getFullList<AffiliateWithdrawal>({
        filter: `user = "${user.id}"`,
        sort: "-id",
      });
    for (const v of visits) {
      visitsByService[v.service] = (visitsByService[v.service] || 0) + 1;
    }
  }

  return NextResponse.json({
    ok: true,
    enabled: true,
    profile: {
      code: profile.code,
      status: profile.status,
    },
    links: shareLinksForCode(profile.code),
    wallet,
    stats: {
      visits: visits.length,
      visitsByService,
      conversions: conversions.length,
    },
    conversions: conversions.slice(0, 50),
    withdrawals: withdrawals.slice(0, 50),
    settings: {
      min_withdraw: settings.min_withdraw,
      cookie_days: settings.cookie_days,
    },
  });
}
