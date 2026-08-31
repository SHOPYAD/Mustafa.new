import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getLoyaltySettings } from "@/lib/loyalty/store";
import { getWalletForUser, walletSummary } from "@/lib/loyalty/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const [wallet, settings] = await Promise.all([getWalletForUser(user.id), getLoyaltySettings()]);
  return NextResponse.json({ ok: true, ...walletSummary(wallet, settings) });
}
