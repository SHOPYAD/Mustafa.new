import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getAffiliateSettings, getWalletSummary } from "@/lib/affiliate/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const amount = Math.round((Number(body.amount) || 0) * 100) / 100;
  const binanceId = String(body.binance_id || body.binanceId || "").trim().slice(0, 120);
  if (!binanceId) {
    return NextResponse.json({ ok: false, error: "binance_required" }, { status: 400 });
  }

  const settings = await getAffiliateSettings();
  if (!settings.enabled) {
    return NextResponse.json({ ok: false, error: "affiliate_disabled" }, { status: 400 });
  }
  if (amount < settings.min_withdraw) {
    return NextResponse.json(
      { ok: false, error: "min_withdraw", min: settings.min_withdraw },
      { status: 400 }
    );
  }

  const wallet = await getWalletSummary(user.id);
  if (amount > wallet.balance) {
    return NextResponse.json(
      { ok: false, error: "insufficient_balance", balance: wallet.balance },
      { status: 400 }
    );
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
  }

  const created = await pb.collection("affiliate_withdrawals").create({
    user: user.id,
    amount,
    binance_id: binanceId,
    status: "pending",
    note: String(body.note || "").slice(0, 500),
  });

  return NextResponse.json({ ok: true, withdrawal: created }, { status: 201 });
}
